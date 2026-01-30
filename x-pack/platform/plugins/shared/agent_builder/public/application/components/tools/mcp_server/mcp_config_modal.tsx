/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useState } from 'react';
import {
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiModalFooter,
  EuiButton,
  EuiButtonEmpty,
  EuiText,
  EuiCodeBlock,
  EuiSpacer,
  EuiCallOut,
  EuiCopy,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLoadingSpinner,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n-react';
import { useCreateMcpApiKey } from '../../../hooks/use_create_mcp_api_key';
import type { CreateMcpApiKeyResponse } from '../../../../../common/http_api/mcp';

interface McpConfigModalProps {
  onClose: () => void;
}

export const McpConfigModal: React.FC<McpConfigModalProps> = ({ onClose }) => {
  const [apiKeyData, setApiKeyData] = useState<CreateMcpApiKeyResponse | null>(null);
  const createMcpApiKey = useCreateMcpApiKey();

  const handleGenerateKey = async () => {
    try {
      const result = await createMcpApiKey.mutateAsync({});
      setApiKeyData(result);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const configJson = apiKeyData ? JSON.stringify(apiKeyData.mcpConfig, null, 2) : '';

  return (
    <EuiModal onClose={onClose} maxWidth={800}>
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          {i18n.translate('xpack.agentBuilder.tools.mcpConfigModal.title', {
            defaultMessage: 'MCP Server Configuration',
          })}
        </EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody>
        {!apiKeyData ? (
          <>
            <EuiText>
              <p>
                <FormattedMessage
                  id="xpack.agentBuilder.tools.mcpConfigModal.description"
                  defaultMessage="Generate an API key and get your complete MCP configuration to connect Agent Builder with MCP clients like Claude Desktop, Cursor, or VS Code."
                />
              </p>
            </EuiText>
            <EuiSpacer size="m" />
            <EuiCallOut
              title={i18n.translate('xpack.agentBuilder.tools.mcpConfigModal.warningTitle', {
                defaultMessage: 'Important',
              })}
              color="warning"
              iconType="warning"
            >
              <p>
                <FormattedMessage
                  id="xpack.agentBuilder.tools.mcpConfigModal.warningText"
                  defaultMessage="The API key will be displayed only once. Make sure to copy and save it securely before closing this window."
                />
              </p>
            </EuiCallOut>
            <EuiSpacer size="m" />
            <EuiButton
              fill
              onClick={handleGenerateKey}
              isLoading={createMcpApiKey.isPending}
              disabled={createMcpApiKey.isPending}
            >
              {createMcpApiKey.isPending ? (
                <EuiFlexGroup gutterSize="s" alignItems="center">
                  <EuiFlexItem grow={false}>
                    <EuiLoadingSpinner size="m" />
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    {i18n.translate('xpack.agentBuilder.tools.mcpConfigModal.generating', {
                      defaultMessage: 'Generating...',
                    })}
                  </EuiFlexItem>
                </EuiFlexGroup>
              ) : (
                i18n.translate('xpack.agentBuilder.tools.mcpConfigModal.generateButton', {
                  defaultMessage: 'Generate API Key',
                })
              )}
            </EuiButton>
          </>
        ) : (
          <>
            <EuiCallOut
              title={i18n.translate('xpack.agentBuilder.tools.mcpConfigModal.successTitle', {
                defaultMessage: 'API Key Generated',
              })}
              color="success"
              iconType="check"
            >
              <p>
                <FormattedMessage
                  id="xpack.agentBuilder.tools.mcpConfigModal.successText"
                  defaultMessage="Copy this configuration and add it to your MCP client's configuration file."
                />
              </p>
            </EuiCallOut>
            <EuiSpacer size="m" />
            <EuiText size="s">
              <h4>
                {i18n.translate('xpack.agentBuilder.tools.mcpConfigModal.configTitle', {
                  defaultMessage: 'MCP Configuration',
                })}
              </h4>
            </EuiText>
            <EuiSpacer size="s" />
            <EuiFlexGroup gutterSize="s" alignItems="center">
              <EuiFlexItem grow={false}>
                <EuiCopy textToCopy={configJson}>
                  {(copy) => (
                    <EuiButton onClick={copy} iconType="copy" size="s">
                      {i18n.translate('xpack.agentBuilder.tools.mcpConfigModal.copyButton', {
                        defaultMessage: 'Copy to Clipboard',
                      })}
                    </EuiButton>
                  )}
                </EuiCopy>
              </EuiFlexItem>
            </EuiFlexGroup>
            <EuiSpacer size="s" />
            <EuiCodeBlock language="json" isCopyable paddingSize="m">
              {configJson}
            </EuiCodeBlock>
            <EuiSpacer size="m" />
            <EuiText size="xs" color="subdued">
              <p>
                <FormattedMessage
                  id="xpack.agentBuilder.tools.mcpConfigModal.apiKeyName"
                  defaultMessage="API Key Name: {name}"
                  values={{ name: <strong>{apiKeyData.name}</strong> }}
                />
              </p>
              <p>
                <FormattedMessage
                  id="xpack.agentBuilder.tools.mcpConfigModal.usageInstructions"
                  defaultMessage="Add this configuration to your MCP client's settings. For Claude Desktop, this goes in your claude_desktop_config.json file. For Cursor, add it to your MCP settings."
                />
              </p>
            </EuiText>
          </>
        )}

        {createMcpApiKey.isError && (
          <>
            <EuiSpacer size="m" />
            <EuiCallOut
              title={i18n.translate('xpack.agentBuilder.tools.mcpConfigModal.errorTitle', {
                defaultMessage: 'Error Generating API Key',
              })}
              color="danger"
              iconType="error"
            >
              <p>{createMcpApiKey.error?.message}</p>
            </EuiCallOut>
          </>
        )}
      </EuiModalBody>

      <EuiModalFooter>
        <EuiButtonEmpty onClick={onClose}>
          {i18n.translate('xpack.agentBuilder.tools.mcpConfigModal.closeButton', {
            defaultMessage: 'Close',
          })}
        </EuiButtonEmpty>
      </EuiModalFooter>
    </EuiModal>
  );
};
