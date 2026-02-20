/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { schema } from '@kbn/config-schema';

import type { OAuthRouteParams } from '.';

export function defineAuthorizeRoutes({
  router,
  httpResources,
  basePath,
  logger,
  getOAuthService,
  getAuthenticationService,
}: OAuthRouteParams) {
  httpResources.register(
    {
      path: '/oauth/authorize',
      validate: {
        query: schema.object({
          response_type: schema.string(),
          redirect_uri: schema.string(),
          scope: schema.string(),
          code_challenge: schema.string(),
          code_challenge_method: schema.string(),
          state: schema.string(),
          client_name: schema.maybe(schema.string()),
          client_uri: schema.maybe(schema.string()),
        }),
      },
      options: {
        excludeFromOAS: true,
        excludeFromRateLimiter: true,
      },
      security: {
        authc: {
          enabled: true,
        },
        authz: {
          enabled: false,
          reason: 'OAuth authorization flow handles its own authorization via user consent',
        },
      },
    },
    async (context, request, response) => {
      const oauthService = getOAuthService();
      const authService = getAuthenticationService();

      const currentUser = authService.getCurrentUser(request);
      if (!currentUser) {
        logger.debug('User not authenticated, redirecting to login');
        const loginUrl = `${basePath.serverBasePath}/login?next=${encodeURIComponent(request.url.href)}`;
        return response.redirected({
          headers: { location: loginUrl },
        });
      }

      const validation = oauthService.validateAuthorizationRequest({
        responseType: request.query.response_type,
        redirectUri: request.query.redirect_uri,
        scope: request.query.scope,
        codeChallenge: request.query.code_challenge,
        codeChallengeMethod: request.query.code_challenge_method,
        state: request.query.state,
      });

      if (!validation.valid) {
        logger.warn(`Invalid authorization request: ${validation.error}`);

        return response.badRequest({
          body: {
            message: validation.error,
          },
        });
      }

      const authRequest = {
        ...validation.request,
        clientName: request.query.client_name,
        clientUri: request.query.client_uri,
      };

      const requestId = oauthService.createPendingAuthorization(
        authRequest,
        currentUser.username
      );

      const consentUrl = `${basePath.serverBasePath}/oauth/consent?request_id=${requestId}`;
      return response.redirected({
        headers: { location: consentUrl },
      });
    }
  );
}
