/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  EuiButton,
  EuiButtonEmpty,
  EuiCallOut,
  EuiFieldText,
  EuiFlexGroup,
  EuiFlexItem,
  EuiHorizontalRule,
  EuiIcon,
  EuiPanel,
  EuiSkeletonText,
  EuiSpacer,
  EuiText,
} from '@elastic/eui';
import { css } from '@emotion/react';
import type { MouseEvent } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

import type {
  AppMountParameters,
  FatalErrorsStart,
  HttpStart,
  NotificationsStart,
} from '@kbn/core/public';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n-react';

import type { StartServices } from '../..';
import { AuthenticationStatePage } from '../components';

interface OAuthScope {
  id: string;
  displayName: string;
  description: string;
}

interface ConsentState {
  requestId: string;
  redirectUri: string;
  scope: OAuthScope[];
  clientName?: string;
  expiresIn: number;
}

interface Props {
  http: HttpStart;
  notifications: NotificationsStart;
  fatalErrors: FatalErrorsStart;
}

export function OAuthConsentPage({ http, fatalErrors, notifications }: Props) {
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [isDenying, setIsDenying] = useState<boolean>(false);
  const [consentState, setConsentState] = useState<ConsentState | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const requestId = urlParams.get('request_id');

    if (!requestId) {
      fatalErrors.add(new Error('Missing request_id parameter'));
      return;
    }

    http
      .get<ConsentState>('/internal/security/oauth/consent_state', {
        query: { request_id: requestId },
      })
      .then((response) => setConsentState(response))
      .catch((err) => fatalErrors.add(err));
  }, [http, fatalErrors]);

  const onApprove = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();

      if (!consentState) return;

      try {
        setIsApproving(true);
        const response = await http.post<{ redirect_uri: string }>(
          '/internal/security/oauth/approve',
          {
            body: JSON.stringify({ request_id: consentState.requestId }),
          }
        );
        window.location.href = response.redirect_uri;
      } catch (err) {
        notifications.toasts.addError(err, {
          title: i18n.translate('xpack.security.oauthConsent.approveErrorMessage', {
            defaultMessage: 'Could not authorize the application.',
          }),
        });
        setIsApproving(false);
      }
    },
    [http, notifications, consentState]
  );

  const onDeny = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();

      if (!consentState) return;

      try {
        setIsDenying(true);
        const response = await http.post<{ redirect_uri: string }>(
          '/internal/security/oauth/deny',
          {
            body: JSON.stringify({ request_id: consentState.requestId }),
          }
        );
        window.location.href = response.redirect_uri;
      } catch (err) {
        notifications.toasts.addError(err, {
          title: i18n.translate('xpack.security.oauthConsent.denyErrorMessage', {
            defaultMessage: 'Could not deny the authorization request.',
          }),
        });
        setIsDenying(false);
      }
    },
    [http, notifications, consentState]
  );

  const formatExpiresIn = (seconds: number): string => {
    if (seconds < 3600) {
      return `${Math.floor(seconds / 60)} minutes`;
    }
    if (seconds < 86400) {
      return `${Math.floor(seconds / 3600)} hour${seconds >= 7200 ? 's' : ''}`;
    }
    return `${Math.floor(seconds / 86400)} day${seconds >= 172800 ? 's' : ''}`;
  };

  const content = consentState ? (
    <EuiPanel paddingSize="l">
      <EuiCallOut
        title={
          <FormattedMessage
            id="xpack.security.oauthConsent.unverifiedWarningTitle"
            defaultMessage="Unverified Application"
          />
        }
        color="warning"
        iconType="warning"
        size="s"
      >
        <EuiText size="s">
          <FormattedMessage
            id="xpack.security.oauthConsent.unverifiedWarningDescription"
            defaultMessage="This application has not been pre-registered with Kibana. Only authorize if you trust this application and recognize the URL below."
          />
        </EuiText>
      </EuiCallOut>

      <EuiSpacer size="l" />

      <EuiText>
        <p>
          <strong>{consentState.clientName || 'An application'}</strong>
          <FormattedMessage
            id="xpack.security.oauthConsent.requestingAccess"
            defaultMessage=" is requesting access to your Kibana account."
          />
        </p>
      </EuiText>

      <EuiSpacer size="m" />

      <EuiText size="s" color="subdued">
        <FormattedMessage
          id="xpack.security.oauthConsent.redirectUriLabel"
          defaultMessage="Will redirect to:"
        />
      </EuiText>
      <EuiFieldText
        readOnly
        fullWidth
        value={consentState.redirectUri}
        prepend={<EuiIcon type="link" />}
        css={css`
          font-family: monospace;
          background-color: #f5f7fa;
        `}
      />

      <EuiSpacer size="l" />

      <EuiText size="s">
        <strong>
          <FormattedMessage
            id="xpack.security.oauthConsent.permissionsHeader"
            defaultMessage="This application wants to:"
          />
        </strong>
      </EuiText>

      <EuiSpacer size="s" />

      <EuiPanel color="subdued" paddingSize="m">
        {consentState.scope.map((scope) => (
          <EuiFlexGroup
            key={scope.id}
            gutterSize="s"
            alignItems="center"
            css={css`
              margin-bottom: 8px;
              &:last-child {
                margin-bottom: 0;
              }
            `}
          >
            <EuiFlexItem grow={false}>
              <EuiIcon type="check" color="success" />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiText size="s">
                <strong>{scope.displayName}</strong>
                <span
                  css={css`
                    color: #69707d;
                    margin-left: 8px;
                  `}
                >
                  ({scope.description})
                </span>
              </EuiText>
            </EuiFlexItem>
          </EuiFlexGroup>
        ))}
      </EuiPanel>

      <EuiSpacer size="m" />

      <EuiText size="s" color="subdued">
        <EuiIcon type="clock" size="s" />
        <span
          css={css`
            margin-left: 8px;
          `}
        >
          <FormattedMessage
            id="xpack.security.oauthConsent.expiresIn"
            defaultMessage="Access expires in: {expiry}"
            values={{ expiry: formatExpiresIn(consentState.expiresIn) }}
          />
        </span>
      </EuiText>

      <EuiHorizontalRule />

      <EuiFlexGroup justifyContent="flexEnd" gutterSize="m">
        <EuiFlexItem grow={false}>
          <EuiButtonEmpty
            onClick={onDeny}
            isDisabled={isApproving || isDenying}
            isLoading={isDenying}
            data-test-subj="oauthConsentDeny"
          >
            <FormattedMessage
              id="xpack.security.oauthConsent.denyButton"
              defaultMessage="Cancel"
            />
          </EuiButtonEmpty>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton
            fill
            color="primary"
            onClick={onApprove}
            isDisabled={isApproving || isDenying}
            isLoading={isApproving}
            data-test-subj="oauthConsentApprove"
          >
            <FormattedMessage
              id="xpack.security.oauthConsent.approveButton"
              defaultMessage="Authorize"
            />
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  ) : (
    <EuiPanel paddingSize="l">
      <EuiSkeletonText lines={10} />
    </EuiPanel>
  );

  return (
    <AuthenticationStatePage
      cssStyles={css`
        max-width: 550px;
      `}
      title={
        <FormattedMessage
          id="xpack.security.oauthConsent.title"
          defaultMessage="Authorization Request"
        />
      }
    >
      <EuiSpacer size="xl" />
      {content}
      <EuiSpacer size="xxl" />
    </AuthenticationStatePage>
  );
}

export function renderOAuthConsentPage(
  services: StartServices,
  { element }: Pick<AppMountParameters, 'element'>,
  props: Props
) {
  ReactDOM.render(services.rendering.addContext(<OAuthConsentPage {...props} />), element);

  return () => ReactDOM.unmountComponentAtNode(element);
}
