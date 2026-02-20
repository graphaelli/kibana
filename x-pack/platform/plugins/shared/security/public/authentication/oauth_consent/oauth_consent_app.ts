/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { ApplicationSetup, AppMountParameters, StartServicesAccessor } from '@kbn/core/public';
import { i18n } from '@kbn/i18n';

interface CreateDeps {
  application: ApplicationSetup;
  getStartServices: StartServicesAccessor;
}

export const oauthConsentApp = Object.freeze({
  id: 'security_oauth_consent',
  create({ application, getStartServices }: CreateDeps) {
    application.register({
      id: this.id,
      title: i18n.translate('xpack.security.oauthConsentAppTitle', {
        defaultMessage: 'OAuth Authorization',
      }),
      chromeless: true,
      appRoute: '/oauth/consent',
      async mount({ element }: AppMountParameters) {
        const [[coreStart], { renderOAuthConsentPage }] = await Promise.all([
          getStartServices(),
          import('./oauth_consent_page'),
        ]);
        return renderOAuthConsentPage(
          coreStart,
          { element },
          {
            http: coreStart.http,
            notifications: coreStart.notifications,
            fatalErrors: coreStart.fatalErrors,
          }
        );
      },
    });
  },
});
