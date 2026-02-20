/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { schema } from '@kbn/config-schema';

import type { OAuthRouteParams } from '.';
import { createLicensedRouteHandler } from '../licensed_route_handler';

export function defineGrantsRoutes({
  router,
  logger,
  getOAuthService,
  getAuthenticationService,
}: OAuthRouteParams) {
  router.get(
    {
      path: '/internal/security/oauth/grants',
      validate: false,
      security: {
        authz: {
          enabled: false,
          reason: 'Returns only grants owned by the current authenticated user',
        },
      },
      options: {
        access: 'internal',
      },
    },
    createLicensedRouteHandler(async (context, request, response) => {
      const oauthService = getOAuthService();
      const authService = getAuthenticationService();

      const currentUser = authService.getCurrentUser(request);
      if (!currentUser) {
        return response.unauthorized();
      }

      const grants = oauthService.getGrantsForUser(currentUser.username);

      return response.ok({
        body: {
          grants: grants.map((grant) => ({
            id: grant.id,
            redirect_uri: grant.redirectUri,
            scope: grant.scope,
            created_at: new Date(grant.createdAt).toISOString(),
            expires_at: new Date(grant.expiresAt).toISOString(),
          })),
        },
      });
    })
  );

  router.delete(
    {
      path: '/internal/security/oauth/grants/{grantId}',
      validate: {
        params: schema.object({
          grantId: schema.string(),
        }),
      },
      security: {
        authz: {
          enabled: false,
          reason: 'Users can only revoke their own grants',
        },
      },
      options: {
        access: 'internal',
      },
    },
    createLicensedRouteHandler(async (context, request, response) => {
      const oauthService = getOAuthService();
      const authService = getAuthenticationService();

      const currentUser = authService.getCurrentUser(request);
      if (!currentUser) {
        return response.unauthorized();
      }

      const success = await oauthService.revokeGrant(
        request,
        request.params.grantId,
        currentUser.username
      );

      if (!success) {
        return response.notFound({
          body: { message: 'Grant not found or already revoked' },
        });
      }

      logger.info(`User ${currentUser.username} revoked OAuth grant ${request.params.grantId}`);

      return response.ok({
        body: { success: true },
      });
    })
  );
}
