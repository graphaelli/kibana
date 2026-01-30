/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

export interface CreateMcpApiKeyResponse {
  /** The generated API key ID */
  id: string;
  /** The API key name */
  name: string;
  /** The encoded API key (api_key field from Elasticsearch) */
  encoded: string;
  /** The MCP server URL */
  serverUrl: string;
  /** The complete MCP configuration ready to copy/paste */
  mcpConfig: McpClientConfiguration;
}

export interface McpClientConfiguration {
  mcpServers: {
    [serverName: string]: {
      url: string;
      headers: {
        Authorization: string;
      };
    };
  };
}
