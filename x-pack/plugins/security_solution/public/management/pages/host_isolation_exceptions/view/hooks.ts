/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { useHttp } from '../../../../common/lib/kibana/hooks';
import { useLicense } from '../../../../common/hooks/use_license';
import { State } from '../../../../common/store';
import {
  MANAGEMENT_STORE_GLOBAL_NAMESPACE,
  MANAGEMENT_STORE_HOST_ISOLATION_EXCEPTIONS_NAMESPACE,
} from '../../../common/constants';
import { getHostIsolationExceptionsListPath } from '../../../common/routing';
import { getHostIsolationExceptionSummary } from '../service';
import { getCurrentLocation } from '../store/selector';
import { HostIsolationExceptionsPageLocation, HostIsolationExceptionsPageState } from '../types';

export function useHostIsolationExceptionsSelector<R>(
  selector: (state: HostIsolationExceptionsPageState) => R
): R {
  return useSelector((state: State) =>
    selector(
      state[MANAGEMENT_STORE_GLOBAL_NAMESPACE][MANAGEMENT_STORE_HOST_ISOLATION_EXCEPTIONS_NAMESPACE]
    )
  );
}

export function useHostIsolationExceptionsNavigateCallback() {
  const location = useHostIsolationExceptionsSelector(getCurrentLocation);
  const history = useHistory();

  return useCallback(
    (args: Partial<HostIsolationExceptionsPageLocation>) =>
      history.push(getHostIsolationExceptionsListPath({ ...location, ...args })),
    [history, location]
  );
}

/**
 * Checks if the current user should be able to see the host isolation exceptions
 * menu item based on their current license level and existing excepted items.
 */
export function useCanSeeHostIsolationExceptionsMenu() {
  const license = useLicense();
  const http = useHttp();

  const [hasExceptions, setHasExceptions] = useState(license.isPlatinumPlus());

  useEffect(() => {
    async function checkIfHasExceptions() {
      try {
        const summary = await getHostIsolationExceptionSummary(http);
        if (summary?.total > 0) {
          setHasExceptions(true);
        }
      } catch (error) {
        // an error will ocurr if the exception list does not exist
        setHasExceptions(false);
      }
    }
    if (!license.isPlatinumPlus()) {
      checkIfHasExceptions();
    }
  }, [http, license]);

  return hasExceptions;
}
