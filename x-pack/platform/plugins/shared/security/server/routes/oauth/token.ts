/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { schema } from '@kbn/config-schema';

import type { OAuthRouteParams } from '.';

export function defineTokenRoutes({ router, logger, getOAuthService }: OAuthRouteParams) {
  router.post(
    {
      path: '/oauth/token',
      validate: {
        body: schema.object({
          grant_type: schema.string(),
          code: schema.string(),
          redirect_uri: schema.string(),
          code_verifier: schema.string(),
        }),
      },
      options: {
        access: 'public',
        authRequired: false,
        excludeFromOAS: true,
        xsrfRequired: false,
      },
      security: {
        authz: {
          enabled: false,
          reason:
            'OAuth token endpoint authenticates via authorization code, not session authentication',
        },
      },
    },
    async (context, request, response) => {
      const oauthService = getOAuthService();

      const result = await oauthService.exchangeCodeForToken({
        grantType: request.body.grant_type,
        code: request.body.code,
        redirectUri: request.body.redirect_uri,
        codeVerifier: request.body.code_verifier,
      });

      if (!result.success) {
        logger.warn(`Token exchange failed: ${result.error}`);

        return response.custom({
          statusCode: 400,
          body: {
            error: result.error,
            error_description: result.errorDescription,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      return response.ok({
        headers: {
          'Cache-Control': 'no-store',
          Pragma: 'no-cache',
        },
        body: result.token,
      });
    }
  );
}
