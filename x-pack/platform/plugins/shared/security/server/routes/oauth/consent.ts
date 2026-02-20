/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { schema } from '@kbn/config-schema';

import type { OAuthRouteParams } from '.';
import { createLicensedRouteHandler } from '../licensed_route_handler';

export function defineConsentRoutes({
  router,
  httpResources,
  logger,
  getOAuthService,
  getAuthenticationService,
}: OAuthRouteParams) {
  httpResources.register(
    {
      path: '/oauth/consent',
      validate: {
        query: schema.object({
          request_id: schema.string(),
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
          reason: 'OAuth consent page handles authorization via user interaction',
        },
      },
    },
    async (context, request, response) => {
      const oauthService = getOAuthService();

      const consentState = oauthService.getConsentState(request.query.request_id);

      if (!consentState) {
        logger.warn(`Consent request not found: ${request.query.request_id}`);
        return response.badRequest({
          body: { message: 'Authorization request not found or expired' },
        });
      }

      return response.renderCoreApp();
    }
  );

  router.get(
    {
      path: '/internal/security/oauth/consent_state',
      validate: {
        query: schema.object({
          request_id: schema.string(),
        }),
      },
      security: {
        authz: {
          enabled: false,
          reason: 'Consent state is tied to the pending authorization request, not user privileges',
        },
      },
      options: {
        access: 'internal',
      },
    },
    createLicensedRouteHandler(async (context, request, response) => {
      const oauthService = getOAuthService();

      const consentState = oauthService.getConsentState(request.query.request_id);

      if (!consentState) {
        return response.notFound({
          body: { message: 'Authorization request not found or expired' },
        });
      }

      return response.ok({
        body: consentState,
      });
    })
  );

  router.post(
    {
      path: '/internal/security/oauth/approve',
      validate: {
        body: schema.object({
          request_id: schema.string(),
        }),
      },
      security: {
        authz: {
          enabled: false,
          reason: 'User consent is the authorization mechanism for this endpoint',
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

      const result = oauthService.approveAuthorization(
        request.body.request_id,
        currentUser.username,
        currentUser.username
      );

      if (!result.success) {
        return response.badRequest({
          body: { message: 'Authorization request not found or expired' },
        });
      }

      const redirectUrl = new URL(result.redirectUri);
      redirectUrl.searchParams.set('code', result.code);
      redirectUrl.searchParams.set('state', result.state);

      return response.ok({
        body: {
          redirect_uri: redirectUrl.toString(),
        },
      });
    })
  );

  router.post(
    {
      path: '/internal/security/oauth/deny',
      validate: {
        body: schema.object({
          request_id: schema.string(),
        }),
      },
      security: {
        authz: {
          enabled: false,
          reason: 'User denial is the authorization mechanism for this endpoint',
        },
      },
      options: {
        access: 'internal',
      },
    },
    createLicensedRouteHandler(async (context, request, response) => {
      const oauthService = getOAuthService();

      const result = oauthService.denyAuthorization(request.body.request_id);

      if (!result.success) {
        return response.badRequest({
          body: { message: 'Authorization request not found or expired' },
        });
      }

      const redirectUrl = new URL(result.redirectUri);
      redirectUrl.searchParams.set('error', 'access_denied');
      redirectUrl.searchParams.set('error_description', 'The user denied the authorization request');
      redirectUrl.searchParams.set('state', result.state);

      return response.ok({
        body: {
          redirect_uri: redirectUrl.toString(),
        },
      });
    })
  );
}
