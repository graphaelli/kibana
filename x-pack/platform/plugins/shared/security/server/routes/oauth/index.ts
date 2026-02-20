/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { RouteDefinitionParams } from '..';
import type { OAuthAuthorizationService } from '../../oauth_authorization';
import { defineAuthorizeRoutes } from './authorize';
import { defineConsentRoutes } from './consent';
import { defineGrantsRoutes } from './grants';
import { defineTokenRoutes } from './token';

export interface OAuthRouteParams extends RouteDefinitionParams {
  getOAuthService: () => OAuthAuthorizationService;
}

export function defineOAuthRoutes(params: OAuthRouteParams) {
  defineAuthorizeRoutes(params);
  defineTokenRoutes(params);
  defineConsentRoutes(params);
  defineGrantsRoutes(params);
}
