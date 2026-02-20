/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { IClusterClient, KibanaRequest, Logger } from '@kbn/core/server';

import { AuthorizationCodeStore } from './authorization_code_store';
import { verifyCodeChallenge } from './pkce';
import { getScopesByIds, validateScopes } from './scopes';
import type { AuthorizationRequest, ConsentState, OAuthGrant, TokenResponse } from './types';

const DEFAULT_TOKEN_EXPIRATION_SECONDS = 3600; // 1 hour

export interface OAuthAuthorizationServiceOptions {
  logger: Logger;
  clusterClient: IClusterClient;
  applicationName: string;
}

export class OAuthAuthorizationService {
  private readonly logger: Logger;
  private readonly clusterClient: IClusterClient;
  private readonly applicationName: string;
  private readonly codeStore: AuthorizationCodeStore;
  private readonly grants = new Map<string, OAuthGrant>();

  constructor(options: OAuthAuthorizationServiceOptions) {
    this.logger = options.logger;
    this.clusterClient = options.clusterClient;
    this.applicationName = options.applicationName;
    this.codeStore = new AuthorizationCodeStore(options.logger);
  }

  start() {
    this.codeStore.start();
    this.logger.info('OAuth Authorization Service started');
  }

  stop() {
    this.codeStore.stop();
    this.grants.clear();
    this.logger.info('OAuth Authorization Service stopped');
  }

  validateAuthorizationRequest(params: {
    responseType: string;
    redirectUri: string;
    scope: string;
    codeChallenge: string;
    codeChallengeMethod: string;
    state: string;
  }): { valid: true; request: AuthorizationRequest } | { valid: false; error: string } {
    if (params.responseType !== 'code') {
      return { valid: false, error: 'unsupported_response_type' };
    }

    if (!params.redirectUri) {
      return { valid: false, error: 'invalid_request: redirect_uri is required' };
    }

    try {
      const url = new URL(params.redirectUri);
      if (url.protocol !== 'https:' && url.hostname !== 'localhost') {
        return { valid: false, error: 'invalid_request: redirect_uri must use HTTPS' };
      }
    } catch {
      return { valid: false, error: 'invalid_request: redirect_uri is not a valid URL' };
    }

    if (!params.scope) {
      return { valid: false, error: 'invalid_request: scope is required' };
    }

    const scopeIds = params.scope.split(' ').filter(Boolean);
    const scopeValidation = validateScopes(scopeIds);
    if (!scopeValidation.valid) {
      return {
        valid: false,
        error: `invalid_scope: unknown scopes: ${scopeValidation.invalidScopes.join(', ')}`,
      };
    }

    if (!params.codeChallenge) {
      return { valid: false, error: 'invalid_request: code_challenge is required (PKCE)' };
    }

    if (params.codeChallengeMethod !== 'S256') {
      return { valid: false, error: 'invalid_request: code_challenge_method must be S256' };
    }

    if (!params.state) {
      return { valid: false, error: 'invalid_request: state is required' };
    }

    return {
      valid: true,
      request: {
        responseType: 'code',
        redirectUri: params.redirectUri,
        scope: scopeIds,
        codeChallenge: params.codeChallenge,
        codeChallengeMethod: 'S256',
        state: params.state,
        clientName: undefined,
        clientUri: undefined,
      },
    };
  }

  createPendingAuthorization(request: AuthorizationRequest, userId: string): string {
    return this.codeStore.storePendingRequest(request, userId);
  }

  getConsentState(requestId: string): ConsentState | undefined {
    const pending = this.codeStore.getPendingRequest(requestId);

    if (!pending) {
      return undefined;
    }

    const scopes = getScopesByIds(pending.scope);

    return {
      requestId,
      redirectUri: pending.redirectUri,
      scope: scopes,
      clientName: pending.clientName,
      clientUri: pending.clientUri,
      expiresIn: DEFAULT_TOKEN_EXPIRATION_SECONDS,
      state: pending.state,
    };
  }

  async approveAuthorization(
    requestId: string,
    userId: string,
    username: string,
    request: KibanaRequest
  ): Promise<
    | { success: true; code: string; redirectUri: string; state: string }
    | { success: false; error?: string }
  > {
    const pending = this.codeStore.consumePendingRequest(requestId);

    if (!pending) {
      this.logger.warn(`Failed to approve authorization: request ${requestId} not found`);
      return { success: false, error: 'Authorization request not found or expired' };
    }

    if (pending.userId !== userId) {
      this.logger.warn(`User mismatch for authorization request ${requestId}`);
      return { success: false, error: 'User mismatch' };
    }

    try {
      const apiKey = await this.createScopedApiKey(
        request,
        pending.scope,
        username,
        pending.redirectUri
      );

      const apiKeyEncoded = Buffer.from(`${apiKey.id}:${apiKey.api_key}`).toString('base64');

      const code = this.codeStore.generateCode(pending, userId, username, {
        id: apiKey.id,
        encoded: apiKeyEncoded,
      });

      const grant: OAuthGrant = {
        id: apiKey.id,
        userId,
        username,
        redirectUri: pending.redirectUri,
        scope: pending.scope,
        apiKeyId: apiKey.id,
        createdAt: Date.now(),
        expiresAt: Date.now() + DEFAULT_TOKEN_EXPIRATION_SECONDS * 1000,
      };

      this.grants.set(grant.id, grant);

      return {
        success: true,
        code,
        redirectUri: pending.redirectUri,
        state: pending.state,
      };
    } catch (error) {
      this.logger.error(`Failed to create API key during authorization: ${error.message}`);
      return { success: false, error: 'Failed to create access credentials' };
    }
  }

  denyAuthorization(
    requestId: string
  ): { success: true; redirectUri: string; state: string } | { success: false } {
    const pending = this.codeStore.consumePendingRequest(requestId);

    if (!pending) {
      return { success: false };
    }

    return {
      success: true,
      redirectUri: pending.redirectUri,
      state: pending.state,
    };
  }

  async exchangeCodeForToken(params: {
    grantType: string;
    code: string;
    redirectUri: string;
    codeVerifier: string;
  }): Promise<
    | { success: true; token: TokenResponse }
    | { success: false; error: string; errorDescription?: string }
  > {
    if (params.grantType !== 'authorization_code') {
      return { success: false, error: 'unsupported_grant_type' };
    }

    const authCode = this.codeStore.consumeCode(params.code);

    if (!authCode) {
      return {
        success: false,
        error: 'invalid_grant',
        errorDescription: 'Authorization code is invalid or expired',
      };
    }

    if (authCode.redirectUri !== params.redirectUri) {
      this.logger.warn('redirect_uri mismatch in token exchange');
      return {
        success: false,
        error: 'invalid_grant',
        errorDescription: 'redirect_uri does not match',
      };
    }

    if (
      !verifyCodeChallenge(params.codeVerifier, authCode.codeChallenge, authCode.codeChallengeMethod)
    ) {
      this.logger.warn('PKCE verification failed');
      return {
        success: false,
        error: 'invalid_grant',
        errorDescription: 'code_verifier verification failed',
      };
    }

    this.logger.info(
      `Token exchange successful for user ${authCode.username}, scopes: ${authCode.scope.join(', ')}`
    );

    return {
      success: true,
      token: {
        access_token: authCode.apiKeyEncoded,
        token_type: 'ApiKey',
        expires_in: DEFAULT_TOKEN_EXPIRATION_SECONDS,
        scope: authCode.scope.join(' '),
      },
    };
  }

  private async createScopedApiKey(
    request: KibanaRequest,
    scopes: string[],
    username: string,
    redirectUri: string
  ): Promise<{ id: string; api_key: string }> {
    const scopeDefinitions = getScopesByIds(scopes);
    const roleDescriptors: Record<string, { applications?: Array<{ application: string; privileges: string[]; resources: string[] }> }> = {};

    const kibanaPrivileges: Array<{
      spaces: string[];
      feature: Record<string, string[]>;
    }> = [];

    for (const scope of scopeDefinitions) {
      for (const priv of scope.kibanaPrivileges) {
        if (priv.feature) {
          kibanaPrivileges.push({
            spaces: priv.spaces || ['*'],
            feature: { [priv.feature]: [priv.privilege] },
          });
        }
      }
    }

    const applications = kibanaPrivileges.map((kp) => ({
      application: this.applicationName,
      privileges: Object.entries(kp.feature).flatMap(([feature, privileges]) =>
        privileges.map((p) => `feature_${feature}.${p}`)
      ),
      resources: kp.spaces.map((s) => (s === '*' ? '*' : `space:${s}`)),
    }));

    roleDescriptors['oauth_grant'] = {
      applications,
    };

    const scopedClient = this.clusterClient.asScoped(request);

    const result = await scopedClient.asCurrentUser.security.createApiKey({
      name: `OAuth Grant: ${redirectUri} (${scopes.join(', ')})`,
      expiration: `${DEFAULT_TOKEN_EXPIRATION_SECONDS}s`,
      role_descriptors: roleDescriptors,
      metadata: {
        oauth_grant: true,
        scopes,
        redirect_uri: redirectUri,
        username,
        created_at: new Date().toISOString(),
      },
    });

    return {
      id: result.id,
      api_key: result.api_key!,
    };
  }

}
