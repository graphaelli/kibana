/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import {
  REPORT_INTERVAL_MS,
  LOCALSTORAGE_KEY,
  PAYLOAD_CONTENT_ENCODING,
} from '../../common/constants';
import { TelemetryService } from './telemetry_service';
import { Storage } from '../../../kibana_utils/public';
import type { EncryptedTelemetryPayload } from '../../common/types';

export class TelemetrySender {
  private readonly telemetryService: TelemetryService;
  private isSending: boolean = false;
  private lastReported?: string;
  private readonly storage: Storage;
  private intervalId?: number;

  constructor(telemetryService: TelemetryService) {
    this.telemetryService = telemetryService;
    this.storage = new Storage(window.localStorage);

    const attributes = this.storage.get(LOCALSTORAGE_KEY);
    if (attributes) {
      this.lastReported = attributes.lastReport;
    }
  }

  private saveToBrowser = () => {
    // we are the only code that manipulates this key, so it's safe to blindly overwrite the whole object
    this.storage.set(LOCALSTORAGE_KEY, { lastReport: this.lastReported });
  };

  private shouldSendReport = (): boolean => {
    if (this.telemetryService.canSendTelemetry()) {
      if (!this.lastReported) {
        return true;
      }
      // returns NaN for any malformed or unset (null/undefined) value
      const lastReported = parseInt(this.lastReported, 10);
      // If it's been a day since we last sent telemetry
      if (isNaN(lastReported) || Date.now() - lastReported > REPORT_INTERVAL_MS) {
        return true;
      }
    }

    return false;
  };

  private sendIfDue = async (): Promise<void> => {
    if (this.isSending || !this.shouldSendReport()) {
      return;
    }

    // mark that we are working so future requests are ignored until we're done
    this.isSending = true;
    try {
      const telemetryUrl = this.telemetryService.getTelemetryUrl();
      const telemetryPayload: EncryptedTelemetryPayload =
        await this.telemetryService.fetchTelemetry();

      await Promise.all(
        telemetryPayload.map(
          async ({ clusterUuid, stats }) =>
            await fetch(telemetryUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Elastic-Stack-Version': this.telemetryService.currentKibanaVersion,
                'X-Elastic-Cluster-ID': clusterUuid,
                'X-Elastic-Content-Encoding': PAYLOAD_CONTENT_ENCODING,
              },
              body: stats,
            })
        )
      );
      this.lastReported = `${Date.now()}`;
      this.saveToBrowser();
    } catch (err) {
      // ignore err
    } finally {
      this.isSending = false;
    }
  };

  public startChecking = () => {
    if (typeof this.intervalId === 'undefined') {
      this.intervalId = window.setInterval(this.sendIfDue, 60000);
    }
  };
}
