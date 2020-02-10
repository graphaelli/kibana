/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import path from 'path';
import { i18n } from '@kbn/i18n';
import { apmFieldMappings, logsFieldMappings } from './field_mappings';
import { SampleDatasetSchema, AppLinkSchema } from '../../lib/sample_dataset_registry_types';

const observabilityName = i18n.translate('home.sampleData.observabilitySpecTitle', {
  defaultMessage: 'Sample observability',
});
const observabilityDescription = i18n.translate('home.sampleData.observabilitySpecDescription', {
  defaultMessage: 'Sample data for observability.',
});
const initialAppLinks = [] as AppLinkSchema[];

export const observabilitySpecProvider = function(): SampleDatasetSchema {
  return {
    id: 'observability',
    name: observabilityName,
    description: observabilityDescription,
    previewImagePath: '/plugins/kibana/home/sample_data_resources/observability/dashboard.png',
    darkPreviewImagePath:
      '/plugins/kibana/home/sample_data_resources/observability/dashboard_dark.png',
    overviewDashboard: 'edf84fe0-e1a0-11e7-b6d5-4dc382ef7f5b',
    appLinks: initialAppLinks,
    defaultIndex: '90943e30-9a47-11e8-b64d-95841ca0b247',
    savedObjects: [],
    dataIndices: [
      {
        id: 'apm',
        dataPath: path.join(__dirname, './apm.json.gz'),
        fields: apmFieldMappings,
        timeFields: ['timestamp', 'utc_time'],
        currentTimeMarker: '2018-08-01T00:00:00',
        preserveDayOfWeekTimeOfDay: true,
      },
      {
        id: 'logs',
        dataPath: path.join(__dirname, './logs.json.gz'),
        fields: logsFieldMappings,
        timeFields: ['timestamp', 'utc_time'],
        currentTimeMarker: '2018-08-01T00:00:00',
        preserveDayOfWeekTimeOfDay: true,
      },
    ],
    status: 'not_installed',
  };
};
