/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { i18n } from '@kbn/i18n';

export function addLinksToSampleDatasets(server: any) {
  const sampleDataLinkLabel = i18n.translate('xpack.apm.sampleDataLinkLabel', {
    defaultMessage: 'APM Data'
  });

  server.addAppLinksToSampleDataset('observability', {
    path: '/app/apm#',
    label: sampleDataLinkLabel,
    icon: 'apmApp'
  });
}
