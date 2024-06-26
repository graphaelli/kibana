/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { SecurityPageName } from '../../app/types';
import { SpyRoute } from '../../common/utils/route/spy_routes';
import { SecuritySolutionPageWrapper } from '../../common/components/page_wrapper';
import { useGetUrlSearch } from '../../common/components/navigation/use_get_url_search';
import { useGetUserCasesPermissions, useKibana } from '../../common/lib/kibana';
import { getCaseUrl } from '../../common/components/link_to';
import { navTabs } from '../../app/home/home_navigations';
import { CaseView } from '../components/case_view';
import { APP_UI_ID } from '../../../common/constants';
import { Case } from '../../../../cases/common';

export const CaseDetailsPage = React.memo(() => {
  const {
    application: { navigateToApp },
  } = useKibana().services;
  const userPermissions = useGetUserCasesPermissions();
  const { detailName: caseId, subCaseId } = useParams<{
    detailName?: string;
    subCaseId?: string;
  }>();
  const search = useGetUrlSearch(navTabs.case);

  useEffect(() => {
    if (userPermissions != null && !userPermissions.read) {
      navigateToApp(APP_UI_ID, {
        deepLinkId: SecurityPageName.case,
        path: getCaseUrl(search),
      });
    }
  }, [userPermissions, navigateToApp, search]);

  const [spyState, setSpyState] = useState<{ caseTitle: string | undefined }>({
    caseTitle: undefined,
  });

  const onCaseDataSuccess = useCallback(
    (data: Case) => {
      if (spyState.caseTitle === undefined || spyState.caseTitle !== data.title) {
        setSpyState({ caseTitle: data.title });
      }
    },
    [spyState.caseTitle]
  );

  return caseId != null ? (
    <>
      <SecuritySolutionPageWrapper noPadding>
        <CaseView
          caseId={caseId}
          subCaseId={subCaseId}
          userCanCrud={userPermissions?.crud ?? false}
          onCaseDataSuccess={onCaseDataSuccess}
        />
      </SecuritySolutionPageWrapper>
      <SpyRoute state={spyState} pageName={SecurityPageName.case} />
    </>
  ) : null;
});

CaseDetailsPage.displayName = 'CaseDetailsPage';
