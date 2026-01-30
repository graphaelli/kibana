/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { useMutation } from '@tanstack/react-query';
import { useAgentBuilderServices } from './use_agent_builder_service';
import type { CreateMcpApiKeyResponse } from '../../../common/http_api/mcp';

interface CreateMcpApiKeyOptions {
  name?: string;
}

export const useCreateMcpApiKey = () => {
  const { httpClient } = useAgentBuilderServices();

  return useMutation<CreateMcpApiKeyResponse, Error, CreateMcpApiKeyOptions>({
    mutationFn: async (options) => {
      const response = await httpClient.post<CreateMcpApiKeyResponse>(
        '/api/agent_builder/mcp/api_key',
        {
          version: '2023-10-31',
          body: JSON.stringify({
            name: options.name,
          }),
        }
      );
      return response;
    },
  });
};
