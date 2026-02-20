/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  EuiBasicTable,
  EuiBadge,
  EuiButtonIcon,
  EuiConfirmModal,
  EuiEmptyPrompt,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPageTemplate,
  EuiSpacer,
  EuiText,
  EuiTitle,
  EuiToolTip,
} from '@elastic/eui';
import type { EuiBasicTableColumn } from '@elastic/eui';
import React, { useCallback, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

import type { AppMountParameters, HttpStart, NotificationsStart } from '@kbn/core/public';
import { i18n } from '@kbn/i18n';
import { FormattedMessage, FormattedDate } from '@kbn/i18n-react';

import type { StartServices } from '../..';

interface OAuthGrant {
  id: string;
  redirect_uri: string;
  scope: string[];
  created_at: string;
  expires_at: string;
}

interface Props {
  http: HttpStart;
  notifications: NotificationsStart;
}

export function OAuthGrantsPage({ http, notifications }: Props) {
  const [grants, setGrants] = useState<OAuthGrant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [grantToRevoke, setGrantToRevoke] = useState<OAuthGrant | null>(null);

  const loadGrants = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await http.get<{ grants: OAuthGrant[] }>('/internal/security/oauth/grants');
      setGrants(response.grants);
    } catch (err) {
      notifications.toasts.addError(err, {
        title: i18n.translate('xpack.security.oauthGrants.loadErrorMessage', {
          defaultMessage: 'Could not load OAuth grants.',
        }),
      });
    } finally {
      setIsLoading(false);
    }
  }, [http, notifications]);

  useEffect(() => {
    loadGrants();
  }, [loadGrants]);

  const onRevokeConfirm = useCallback(async () => {
    if (!grantToRevoke) return;

    try {
      await http.delete(`/internal/security/oauth/grants/${grantToRevoke.id}`);
      notifications.toasts.addSuccess({
        title: i18n.translate('xpack.security.oauthGrants.revokeSuccessMessage', {
          defaultMessage: 'OAuth grant revoked successfully.',
        }),
      });
      setGrantToRevoke(null);
      loadGrants();
    } catch (err) {
      notifications.toasts.addError(err, {
        title: i18n.translate('xpack.security.oauthGrants.revokeErrorMessage', {
          defaultMessage: 'Could not revoke OAuth grant.',
        }),
      });
    }
  }, [http, notifications, grantToRevoke, loadGrants]);

  const columns: Array<EuiBasicTableColumn<OAuthGrant>> = [
    {
      field: 'redirect_uri',
      name: i18n.translate('xpack.security.oauthGrants.applicationColumn', {
        defaultMessage: 'Application',
      }),
      truncateText: true,
      render: (redirectUri: string) => (
        <EuiToolTip content={redirectUri}>
          <EuiText size="s">{new URL(redirectUri).hostname}</EuiText>
        </EuiToolTip>
      ),
    },
    {
      field: 'scope',
      name: i18n.translate('xpack.security.oauthGrants.scopesColumn', {
        defaultMessage: 'Permissions',
      }),
      render: (scopes: string[]) => (
        <EuiFlexGroup gutterSize="xs" wrap>
          {scopes.map((scope) => (
            <EuiFlexItem grow={false} key={scope}>
              <EuiBadge color="hollow">{scope}</EuiBadge>
            </EuiFlexItem>
          ))}
        </EuiFlexGroup>
      ),
    },
    {
      field: 'created_at',
      name: i18n.translate('xpack.security.oauthGrants.createdColumn', {
        defaultMessage: 'Authorized',
      }),
      render: (createdAt: string) => (
        <FormattedDate value={new Date(createdAt)} year="numeric" month="short" day="2-digit" />
      ),
    },
    {
      field: 'expires_at',
      name: i18n.translate('xpack.security.oauthGrants.expiresColumn', {
        defaultMessage: 'Expires',
      }),
      render: (expiresAt: string) => (
        <FormattedDate value={new Date(expiresAt)} year="numeric" month="short" day="2-digit" />
      ),
    },
    {
      name: i18n.translate('xpack.security.oauthGrants.actionsColumn', {
        defaultMessage: 'Actions',
      }),
      actions: [
        {
          render: (grant: OAuthGrant) => (
            <EuiButtonIcon
              iconType="trash"
              color="danger"
              aria-label={i18n.translate('xpack.security.oauthGrants.revokeAriaLabel', {
                defaultMessage: 'Revoke grant',
              })}
              onClick={() => setGrantToRevoke(grant)}
              data-test-subj={`revokeGrant-${grant.id}`}
            />
          ),
        },
      ],
    },
  ];

  const emptyPrompt = (
    <EuiEmptyPrompt
      iconType="lock"
      title={
        <h2>
          <FormattedMessage
            id="xpack.security.oauthGrants.emptyTitle"
            defaultMessage="No authorized applications"
          />
        </h2>
      }
      body={
        <EuiText>
          <p>
            <FormattedMessage
              id="xpack.security.oauthGrants.emptyDescription"
              defaultMessage="You haven't authorized any third-party applications to access your Kibana account."
            />
          </p>
        </EuiText>
      }
    />
  );

  return (
    <EuiPageTemplate panelled>
      <EuiPageTemplate.Header>
        <EuiTitle size="l">
          <h1>
            <FormattedMessage
              id="xpack.security.oauthGrants.pageTitle"
              defaultMessage="Authorized Applications"
            />
          </h1>
        </EuiTitle>
      </EuiPageTemplate.Header>

      <EuiPageTemplate.Section>
        <EuiText color="subdued">
          <p>
            <FormattedMessage
              id="xpack.security.oauthGrants.pageDescription"
              defaultMessage="These third-party applications have been granted access to your Kibana account. You can revoke access at any time."
            />
          </p>
        </EuiText>

        <EuiSpacer size="l" />

        {grants.length === 0 && !isLoading ? (
          emptyPrompt
        ) : (
          <EuiBasicTable
            items={grants}
            columns={columns}
            loading={isLoading}
            data-test-subj="oauthGrantsTable"
          />
        )}
      </EuiPageTemplate.Section>

      {grantToRevoke && (
        <EuiConfirmModal
          title={i18n.translate('xpack.security.oauthGrants.revokeModalTitle', {
            defaultMessage: 'Revoke access?',
          })}
          onCancel={() => setGrantToRevoke(null)}
          onConfirm={onRevokeConfirm}
          cancelButtonText={i18n.translate('xpack.security.oauthGrants.revokeModalCancel', {
            defaultMessage: 'Cancel',
          })}
          confirmButtonText={i18n.translate('xpack.security.oauthGrants.revokeModalConfirm', {
            defaultMessage: 'Revoke',
          })}
          buttonColor="danger"
        >
          <EuiText>
            <p>
              <FormattedMessage
                id="xpack.security.oauthGrants.revokeModalDescription"
                defaultMessage="This will immediately revoke the application's access to your Kibana account. The application at {hostname} will no longer be able to access data on your behalf."
                values={{ hostname: new URL(grantToRevoke.redirect_uri).hostname }}
              />
            </p>
          </EuiText>
        </EuiConfirmModal>
      )}
    </EuiPageTemplate>
  );
}

export function renderOAuthGrantsPage(
  services: StartServices,
  { element }: Pick<AppMountParameters, 'element'>,
  props: Props
) {
  ReactDOM.render(services.rendering.addContext(<OAuthGrantsPage {...props} />), element);

  return () => ReactDOM.unmountComponentAtNode(element);
}
