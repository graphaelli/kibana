/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

export { OAuthAuthorizationService } from './oauth_authorization_service';
export type { OAuthAuthorizationServiceOptions } from './oauth_authorization_service';
export { OAUTH_SCOPES, getScopeById, getScopesByIds, validateScopes, getAllScopeIds } from './scopes';
export type {
  OAuthScope,
  AuthorizationRequest,
  AuthorizationCode,
  TokenRequest,
  TokenResponse,
  OAuthGrant,
  ConsentState,
} from './types';
