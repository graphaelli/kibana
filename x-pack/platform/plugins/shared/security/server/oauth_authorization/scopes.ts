/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { OAuthScope } from './types';

export const OAUTH_SCOPES: Record<string, OAuthScope> = {
  'read:dashboards': {
    id: 'read:dashboards',
    displayName: 'View dashboards',
    description: 'Read-only access to dashboards',
    kibanaPrivileges: [{ feature: 'dashboard', privilege: 'read', spaces: ['*'] }],
  },
  'read:discover': {
    id: 'read:discover',
    displayName: 'Run queries and view results',
    description: 'Read-only access to Discover',
    kibanaPrivileges: [{ feature: 'discover', privilege: 'read', spaces: ['*'] }],
  },
  'read:visualizations': {
    id: 'read:visualizations',
    displayName: 'View visualizations',
    description: 'Read-only access to Visualize Library',
    kibanaPrivileges: [{ feature: 'visualize', privilege: 'read', spaces: ['*'] }],
  },
  'read:canvas': {
    id: 'read:canvas',
    displayName: 'View Canvas workpads',
    description: 'Read-only access to Canvas',
    kibanaPrivileges: [{ feature: 'canvas', privilege: 'read', spaces: ['*'] }],
  },
  'read:maps': {
    id: 'read:maps',
    displayName: 'View maps',
    description: 'Read-only access to Maps',
    kibanaPrivileges: [{ feature: 'maps', privilege: 'read', spaces: ['*'] }],
  },
  'read:ml': {
    id: 'read:ml',
    displayName: 'View machine learning jobs',
    description: 'Read-only access to Machine Learning',
    kibanaPrivileges: [{ feature: 'ml', privilege: 'read', spaces: ['*'] }],
  },
  'read:apm': {
    id: 'read:apm',
    displayName: 'View APM data',
    description: 'Read-only access to APM',
    kibanaPrivileges: [{ feature: 'apm', privilege: 'read', spaces: ['*'] }],
  },
  'read:logs': {
    id: 'read:logs',
    displayName: 'View logs',
    description: 'Read-only access to Logs',
    kibanaPrivileges: [{ feature: 'logs', privilege: 'read', spaces: ['*'] }],
  },
  'read:metrics': {
    id: 'read:metrics',
    displayName: 'View metrics',
    description: 'Read-only access to Infrastructure metrics',
    kibanaPrivileges: [{ feature: 'infrastructure', privilege: 'read', spaces: ['*'] }],
  },
  'read:saved_objects': {
    id: 'read:saved_objects',
    displayName: 'View saved objects',
    description: 'Read-only access to saved objects (searches, visualizations, dashboards)',
    kibanaPrivileges: [
      { feature: 'dashboard', privilege: 'read', spaces: ['*'] },
      { feature: 'visualize', privilege: 'read', spaces: ['*'] },
      { feature: 'discover', privilege: 'read', spaces: ['*'] },
    ],
  },
  'read:data_views': {
    id: 'read:data_views',
    displayName: 'View data views',
    description: 'Read-only access to data views (index patterns)',
    kibanaPrivileges: [{ feature: 'indexPatterns', privilege: 'read', spaces: ['*'] }],
  },
  'read:alerts': {
    id: 'read:alerts',
    displayName: 'View alerts',
    description: 'Read-only access to alerts and rules',
    kibanaPrivileges: [
      { feature: 'alerting', privilege: 'read', spaces: ['*'] },
      { feature: 'actions', privilege: 'read', spaces: ['*'] },
    ],
  },
  'read:cases': {
    id: 'read:cases',
    displayName: 'View cases',
    description: 'Read-only access to cases',
    kibanaPrivileges: [{ feature: 'generalCases', privilege: 'read', spaces: ['*'] }],
  },
};

export function getScopeById(scopeId: string): OAuthScope | undefined {
  return OAUTH_SCOPES[scopeId];
}

export function getScopesByIds(scopeIds: string[]): OAuthScope[] {
  return scopeIds.map((id) => OAUTH_SCOPES[id]).filter((scope): scope is OAuthScope => !!scope);
}

export function validateScopes(scopeIds: string[]): { valid: boolean; invalidScopes: string[] } {
  const invalidScopes = scopeIds.filter((id) => !OAUTH_SCOPES[id]);
  return {
    valid: invalidScopes.length === 0,
    invalidScopes,
  };
}

export function getAllScopeIds(): string[] {
  return Object.keys(OAUTH_SCOPES);
}
