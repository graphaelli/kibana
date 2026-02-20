/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

export interface OAuthScope {
  id: string;
  displayName: string;
  description: string;
  kibanaPrivileges: KibanaPrivilege[];
}

export interface KibanaPrivilege {
  feature?: string;
  privilege: string;
  spaces?: string[];
}

export interface AuthorizationRequest {
  responseType: 'code';
  redirectUri: string;
  scope: string[];
  codeChallenge: string;
  codeChallengeMethod: 'S256';
  state: string;
  clientName?: string;
  clientUri?: string;
}

export interface AuthorizationCode {
  code: string;
  userId: string;
  username: string;
  redirectUri: string;
  scope: string[];
  codeChallenge: string;
  codeChallengeMethod: 'S256';
  expiresAt: number;
  createdAt: number;
  apiKeyId: string;
  apiKeyEncoded: string;
}

export interface TokenRequest {
  grantType: 'authorization_code';
  code: string;
  redirectUri: string;
  codeVerifier: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  scope: string;
}

export interface OAuthGrant {
  id: string;
  userId: string;
  username: string;
  clientName?: string;
  redirectUri: string;
  scope: string[];
  apiKeyId: string;
  createdAt: number;
  expiresAt: number;
}

export interface ConsentState {
  requestId: string;
  redirectUri: string;
  scope: OAuthScope[];
  clientName?: string;
  clientUri?: string;
  expiresIn: number;
  state: string;
}
