/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import crypto from 'crypto';

import type { Logger } from '@kbn/core/server';

import type { AuthorizationCode, AuthorizationRequest } from './types';

const CODE_EXPIRATION_MS = 10 * 60 * 1000; // 10 minutes
const CLEANUP_INTERVAL_MS = 60 * 1000; // 1 minute

export class AuthorizationCodeStore {
  private readonly codes = new Map<string, AuthorizationCode>();
  private readonly pendingRequests = new Map<string, PendingAuthorizationRequest>();
  private cleanupInterval: NodeJS.Timeout | undefined;

  constructor(private readonly logger: Logger) {}

  start() {
    this.cleanupInterval = setInterval(() => this.cleanup(), CLEANUP_INTERVAL_MS);
  }

  stop() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
    this.codes.clear();
    this.pendingRequests.clear();
  }

  storePendingRequest(request: AuthorizationRequest, userId: string): string {
    const requestId = this.generateSecureId();

    const pending: PendingAuthorizationRequest = {
      ...request,
      requestId,
      userId,
      createdAt: Date.now(),
      expiresAt: Date.now() + CODE_EXPIRATION_MS,
    };

    this.pendingRequests.set(requestId, pending);
    this.logger.debug(`Stored pending authorization request: ${requestId}`);

    return requestId;
  }

  getPendingRequest(requestId: string): PendingAuthorizationRequest | undefined {
    const pending = this.pendingRequests.get(requestId);

    if (!pending) {
      return undefined;
    }

    if (Date.now() > pending.expiresAt) {
      this.pendingRequests.delete(requestId);
      return undefined;
    }

    return pending;
  }

  consumePendingRequest(requestId: string): PendingAuthorizationRequest | undefined {
    const pending = this.getPendingRequest(requestId);

    if (pending) {
      this.pendingRequests.delete(requestId);
    }

    return pending;
  }

  generateCode(
    pendingRequest: PendingAuthorizationRequest,
    userId: string,
    username: string
  ): string {
    const code = this.generateSecureId();

    const authCode: AuthorizationCode = {
      code,
      userId,
      username,
      redirectUri: pendingRequest.redirectUri,
      scope: pendingRequest.scope,
      codeChallenge: pendingRequest.codeChallenge,
      codeChallengeMethod: pendingRequest.codeChallengeMethod,
      createdAt: Date.now(),
      expiresAt: Date.now() + CODE_EXPIRATION_MS,
    };

    this.codes.set(code, authCode);
    this.logger.debug(`Generated authorization code for user: ${username}`);

    return code;
  }

  consumeCode(code: string): AuthorizationCode | undefined {
    const authCode = this.codes.get(code);

    if (!authCode) {
      this.logger.debug('Authorization code not found');
      return undefined;
    }

    this.codes.delete(code);

    if (Date.now() > authCode.expiresAt) {
      this.logger.debug('Authorization code expired');
      return undefined;
    }

    this.logger.debug(`Consumed authorization code for user: ${authCode.username}`);
    return authCode;
  }

  private generateSecureId(): string {
    return crypto.randomBytes(32).toString('base64url');
  }

  private cleanup() {
    const now = Date.now();
    let cleanedCodes = 0;
    let cleanedRequests = 0;

    for (const [code, authCode] of this.codes.entries()) {
      if (now > authCode.expiresAt) {
        this.codes.delete(code);
        cleanedCodes++;
      }
    }

    for (const [requestId, pending] of this.pendingRequests.entries()) {
      if (now > pending.expiresAt) {
        this.pendingRequests.delete(requestId);
        cleanedRequests++;
      }
    }

    if (cleanedCodes > 0 || cleanedRequests > 0) {
      this.logger.debug(
        `Cleaned up ${cleanedCodes} expired codes and ${cleanedRequests} expired requests`
      );
    }
  }
}

interface PendingAuthorizationRequest extends AuthorizationRequest {
  requestId: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
}

export type { PendingAuthorizationRequest };
