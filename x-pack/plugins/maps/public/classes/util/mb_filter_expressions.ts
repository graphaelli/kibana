/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  GEO_JSON_TYPE,
  FEATURE_VISIBLE_PROPERTY_NAME,
  KBN_IS_CENTROID_FEATURE,
} from '../../../common/constants';

import { Timeslice } from '../../../common/descriptor_types';

export interface TimesliceMaskConfig {
  timesliceMaskField: string;
  timeslice: Timeslice;
}

export const EXCLUDE_CENTROID_FEATURES = ['!=', ['get', KBN_IS_CENTROID_FEATURE], true];

function getFilterExpression(
  filters: unknown[],
  hasJoins: boolean,
  timesliceMaskConfig?: TimesliceMaskConfig
) {
  const allFilters: unknown[] = [...filters];

  if (hasJoins) {
    allFilters.push(['==', ['get', FEATURE_VISIBLE_PROPERTY_NAME], true]);
  }

  if (timesliceMaskConfig) {
    allFilters.push(['has', timesliceMaskConfig.timesliceMaskField]);
    allFilters.push([
      '>=',
      ['get', timesliceMaskConfig.timesliceMaskField],
      timesliceMaskConfig.timeslice.from,
    ]);
    allFilters.push([
      '<',
      ['get', timesliceMaskConfig.timesliceMaskField],
      timesliceMaskConfig.timeslice.to,
    ]);
  }

  return ['all', ...allFilters];
}

export function getFillFilterExpression(
  hasJoins: boolean,
  timesliceMaskConfig?: TimesliceMaskConfig
): unknown[] {
  return getFilterExpression(
    [
      EXCLUDE_CENTROID_FEATURES,
      [
        'any',
        ['==', ['geometry-type'], GEO_JSON_TYPE.POLYGON],
        ['==', ['geometry-type'], GEO_JSON_TYPE.MULTI_POLYGON],
      ],
    ],
    hasJoins,
    timesliceMaskConfig
  );
}

export function getLineFilterExpression(
  hasJoins: boolean,
  timesliceMaskConfig?: TimesliceMaskConfig
): unknown[] {
  return getFilterExpression(
    [
      EXCLUDE_CENTROID_FEATURES,
      [
        'any',
        ['==', ['geometry-type'], GEO_JSON_TYPE.POLYGON],
        ['==', ['geometry-type'], GEO_JSON_TYPE.MULTI_POLYGON],
        ['==', ['geometry-type'], GEO_JSON_TYPE.LINE_STRING],
        ['==', ['geometry-type'], GEO_JSON_TYPE.MULTI_LINE_STRING],
      ],
    ],
    hasJoins,
    timesliceMaskConfig
  );
}

export function getPointFilterExpression(
  hasJoins: boolean,
  timesliceMaskConfig?: TimesliceMaskConfig
): unknown[] {
  return getFilterExpression(
    [
      EXCLUDE_CENTROID_FEATURES,
      [
        'any',
        ['==', ['geometry-type'], GEO_JSON_TYPE.POINT],
        ['==', ['geometry-type'], GEO_JSON_TYPE.MULTI_POINT],
      ],
    ],
    hasJoins,
    timesliceMaskConfig
  );
}

export function getLabelFilterExpression(
  hasJoins: boolean,
  isSourceGeoJson: boolean,
  timesliceMaskConfig?: TimesliceMaskConfig
): unknown[] {
  const filters: unknown[] = [];

  // centroids added for geojson sources only
  if (isSourceGeoJson) {
    filters.push(['==', ['get', KBN_IS_CENTROID_FEATURE], true]);
  }

  return getFilterExpression(filters, hasJoins, timesliceMaskConfig);
}
