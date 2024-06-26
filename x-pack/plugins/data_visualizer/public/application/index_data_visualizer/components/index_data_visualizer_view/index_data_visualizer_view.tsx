/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { FC, Fragment, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { merge } from 'rxjs';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiPage,
  EuiPageBody,
  EuiPageContentBody,
  EuiPageContentHeader,
  EuiPageContentHeaderSection,
  EuiPanel,
  EuiSpacer,
  EuiTitle,
} from '@elastic/eui';
import { EuiTableActionsColumnType } from '@elastic/eui/src/components/basic_table/table_types';
import { FormattedMessage } from '@kbn/i18n/react';
import { Required } from 'utility-types';
import { i18n } from '@kbn/i18n';
import { Filter } from '@kbn/es-query';
import {
  KBN_FIELD_TYPES,
  UI_SETTINGS,
  Query,
  generateFilters,
} from '../../../../../../../../src/plugins/data/public';
import { FullTimeRangeSelector } from '../full_time_range_selector';
import { usePageUrlState, useUrlState } from '../../../common/util/url_state';
import {
  DataVisualizerTable,
  ItemIdToExpandedRowMap,
} from '../../../common/components/stats_table';
import { FieldVisConfig } from '../../../common/components/stats_table/types';
import type {
  MetricFieldsStats,
  TotalFieldsStats,
} from '../../../common/components/stats_table/components/field_count_stats';
import { OverallStats } from '../../types/overall_stats';
import { getActions } from '../../../common/components/field_data_row/action_menu';
import { IndexBasedDataVisualizerExpandedRow } from '../../../common/components/expanded_row/index_based_expanded_row';
import { DATA_VISUALIZER_INDEX_VIEWER } from '../../constants/index_data_visualizer_viewer';
import { DataVisualizerIndexBasedAppState } from '../../types/index_data_visualizer_state';
import { SEARCH_QUERY_LANGUAGE, SearchQueryLanguage } from '../../types/combined_query';
import {
  FieldRequestConfig,
  JobFieldType,
  SavedSearchSavedObject,
} from '../../../../../common/types';
import { useDataVisualizerKibana } from '../../../kibana_context';
import { FieldCountPanel } from '../../../common/components/field_count_panel';
import { DocumentCountContent } from '../../../common/components/document_count_content';
import { DataLoader } from '../../data_loader/data_loader';
import { JOB_FIELD_TYPES, OMIT_FIELDS } from '../../../../../common';
import { useTimefilter } from '../../hooks/use_time_filter';
import { kbnTypeToJobType } from '../../../common/util/field_types_utils';
import { SearchPanel } from '../search_panel';
import { ActionsPanel } from '../actions_panel';
import { DatePickerWrapper } from '../../../common/components/date_picker_wrapper';
import { dataVisualizerRefresh$ } from '../../services/timefilter_refresh_service';
import { HelpMenu } from '../../../common/components/help_menu';
import { TimeBuckets } from '../../services/time_buckets';
import { createMergedEsQuery, getEsQueryFromSavedSearch } from '../../utils/saved_search_utils';
import { DataVisualizerIndexPatternManagement } from '../index_pattern_management';
import { ResultLink } from '../../../common/components/results_links';
import { extractErrorProperties } from '../../utils/error_utils';
import { IndexPatternField, IndexPattern } from '../../../../../../../../src/plugins/data/common';
import './_index.scss';

interface DataVisualizerPageState {
  overallStats: OverallStats;
  metricConfigs: FieldVisConfig[];
  totalMetricFieldCount: number;
  populatedMetricFieldCount: number;
  metricsLoaded: boolean;
  nonMetricConfigs: FieldVisConfig[];
  nonMetricsLoaded: boolean;
  documentCountStats?: FieldVisConfig;
}

const defaultSearchQuery = {
  match_all: {},
};

export function getDefaultPageState(): DataVisualizerPageState {
  return {
    overallStats: {
      totalCount: 0,
      aggregatableExistsFields: [],
      aggregatableNotExistsFields: [],
      nonAggregatableExistsFields: [],
      nonAggregatableNotExistsFields: [],
    },
    metricConfigs: [],
    totalMetricFieldCount: 0,
    populatedMetricFieldCount: 0,
    metricsLoaded: false,
    nonMetricConfigs: [],
    nonMetricsLoaded: false,
    documentCountStats: undefined,
  };
}
export const getDefaultDataVisualizerListState = (
  overrides?: Partial<DataVisualizerIndexBasedAppState>
): Required<DataVisualizerIndexBasedAppState> => ({
  pageIndex: 0,
  pageSize: 25,
  sortField: 'fieldName',
  sortDirection: 'asc',
  visibleFieldTypes: [],
  visibleFieldNames: [],
  samplerShardSize: 5000,
  searchString: '',
  searchQuery: defaultSearchQuery,
  searchQueryLanguage: SEARCH_QUERY_LANGUAGE.KUERY,
  filters: [],
  showDistributions: true,
  showAllFields: false,
  showEmptyFields: false,
  ...overrides,
});

export interface IndexDataVisualizerViewProps {
  currentIndexPattern: IndexPattern;
  currentSavedSearch: SavedSearchSavedObject | null;
  additionalLinks?: ResultLink[];
}
const restorableDefaults = getDefaultDataVisualizerListState();

export const IndexDataVisualizerView: FC<IndexDataVisualizerViewProps> = (dataVisualizerProps) => {
  const { services } = useDataVisualizerKibana();
  const { docLinks, notifications, uiSettings, data } = services;
  const { toasts } = notifications;

  const [dataVisualizerListState, setDataVisualizerListState] = usePageUrlState(
    DATA_VISUALIZER_INDEX_VIEWER,
    restorableDefaults
  );
  const [globalState, setGlobalState] = useUrlState('_g');

  const [currentSavedSearch, setCurrentSavedSearch] = useState(
    dataVisualizerProps.currentSavedSearch
  );

  const { currentIndexPattern, additionalLinks } = dataVisualizerProps;

  useEffect(() => {
    if (dataVisualizerProps?.currentSavedSearch !== undefined) {
      setCurrentSavedSearch(dataVisualizerProps?.currentSavedSearch);
    }
  }, [dataVisualizerProps?.currentSavedSearch]);

  useEffect(() => {
    return () => {
      // When navigating away from the data view
      // Reset all previously set filters
      // to make sure new page doesn't have unrelated filters
      data.query.filterManager.removeAll();
    };
  }, [currentIndexPattern.id, data.query.filterManager]);

  const getTimeBuckets = useCallback(() => {
    return new TimeBuckets({
      [UI_SETTINGS.HISTOGRAM_MAX_BARS]: uiSettings.get(UI_SETTINGS.HISTOGRAM_MAX_BARS),
      [UI_SETTINGS.HISTOGRAM_BAR_TARGET]: uiSettings.get(UI_SETTINGS.HISTOGRAM_BAR_TARGET),
      dateFormat: uiSettings.get('dateFormat'),
      'dateFormat:scaled': uiSettings.get('dateFormat:scaled'),
    });
  }, [uiSettings]);

  const timefilter = useTimefilter({
    timeRangeSelector: currentIndexPattern?.timeFieldName !== undefined,
    autoRefreshSelector: true,
  });

  const dataLoader = useMemo(
    () => new DataLoader(currentIndexPattern, toasts),
    [currentIndexPattern, toasts]
  );

  useEffect(() => {
    if (globalState?.time !== undefined) {
      timefilter.setTime({
        from: globalState.time.from,
        to: globalState.time.to,
      });
      setLastRefresh(Date.now());
    }
  }, [globalState, timefilter]);

  useEffect(() => {
    if (globalState?.refreshInterval !== undefined) {
      timefilter.setRefreshInterval(globalState.refreshInterval);
      setLastRefresh(Date.now());
    }
  }, [globalState, timefilter]);

  const [lastRefresh, setLastRefresh] = useState(0);

  useEffect(() => {
    if (!currentIndexPattern.isTimeBased()) {
      toasts.addWarning({
        title: i18n.translate(
          'xpack.dataVisualizer.index.dataViewNotBasedOnTimeSeriesNotificationTitle',
          {
            defaultMessage: 'The data view {dataViewTitle} is not based on a time series',
            values: { dataViewTitle: currentIndexPattern.title },
          }
        ),
        text: i18n.translate(
          'xpack.dataVisualizer.index.indexPatternNotBasedOnTimeSeriesNotificationDescription',
          {
            defaultMessage: 'Anomaly detection only runs over time-based indices',
          }
        ),
      });
    }
  }, [currentIndexPattern, toasts]);

  const indexPatternFields: IndexPatternField[] = currentIndexPattern.fields;

  const fieldTypes = useMemo(() => {
    // Obtain the list of non metric field types which appear in the data view.
    const indexedFieldTypes: JobFieldType[] = [];
    indexPatternFields.forEach((field) => {
      if (!OMIT_FIELDS.includes(field.name) && field.scripted !== true) {
        const dataVisualizerType: JobFieldType | undefined = kbnTypeToJobType(field);
        if (dataVisualizerType !== undefined && !indexedFieldTypes.includes(dataVisualizerType)) {
          indexedFieldTypes.push(dataVisualizerType);
        }
      }
    });
    return indexedFieldTypes.sort();
  }, [indexPatternFields]);

  const defaults = getDefaultPageState();

  const { searchQueryLanguage, searchString, searchQuery } = useMemo(() => {
    const searchData = getEsQueryFromSavedSearch({
      indexPattern: currentIndexPattern,
      uiSettings,
      savedSearch: currentSavedSearch,
      filterManager: data.query.filterManager,
    });

    if (searchData === undefined || dataVisualizerListState.searchString !== '') {
      if (dataVisualizerListState.filters) {
        data.query.filterManager.setFilters(dataVisualizerListState.filters);
      }
      return {
        searchQuery: dataVisualizerListState.searchQuery,
        searchString: dataVisualizerListState.searchString,
        searchQueryLanguage: dataVisualizerListState.searchQueryLanguage,
      };
    } else {
      return {
        searchQuery: searchData.searchQuery,
        searchString: searchData.searchString,
        searchQueryLanguage: searchData.queryLanguage,
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSavedSearch, currentIndexPattern, dataVisualizerListState, data.query]);

  const setSearchParams = useCallback(
    (searchParams: {
      searchQuery: Query['query'];
      searchString: Query['query'];
      queryLanguage: SearchQueryLanguage;
      filters: Filter[];
    }) => {
      // When the user loads saved search and then clear or modify the query
      // we should remove the saved search and replace it with the data view id
      if (currentSavedSearch !== null) {
        setCurrentSavedSearch(null);
      }

      setDataVisualizerListState({
        ...dataVisualizerListState,
        searchQuery: searchParams.searchQuery,
        searchString: searchParams.searchString,
        searchQueryLanguage: searchParams.queryLanguage,
        filters: searchParams.filters,
      });
    },
    [currentSavedSearch, dataVisualizerListState, setDataVisualizerListState]
  );

  const samplerShardSize =
    dataVisualizerListState.samplerShardSize ?? restorableDefaults.samplerShardSize;
  const setSamplerShardSize = (value: number) => {
    setDataVisualizerListState({ ...dataVisualizerListState, samplerShardSize: value });
  };

  const visibleFieldTypes =
    dataVisualizerListState.visibleFieldTypes ?? restorableDefaults.visibleFieldTypes;
  const setVisibleFieldTypes = (values: string[]) => {
    setDataVisualizerListState({ ...dataVisualizerListState, visibleFieldTypes: values });
  };

  const visibleFieldNames =
    dataVisualizerListState.visibleFieldNames ?? restorableDefaults.visibleFieldNames;
  const setVisibleFieldNames = (values: string[]) => {
    setDataVisualizerListState({ ...dataVisualizerListState, visibleFieldNames: values });
  };

  const showEmptyFields =
    dataVisualizerListState.showEmptyFields ?? restorableDefaults.showEmptyFields;
  const toggleShowEmptyFields = () => {
    setDataVisualizerListState({
      ...dataVisualizerListState,
      showEmptyFields: !dataVisualizerListState.showEmptyFields,
    });
  };

  const [overallStats, setOverallStats] = useState(defaults.overallStats);

  const [documentCountStats, setDocumentCountStats] = useState(defaults.documentCountStats);
  const [metricConfigs, setMetricConfigs] = useState(defaults.metricConfigs);
  const [metricsLoaded, setMetricsLoaded] = useState(defaults.metricsLoaded);
  const [metricsStats, setMetricsStats] = useState<undefined | MetricFieldsStats>();

  const [nonMetricConfigs, setNonMetricConfigs] = useState(defaults.nonMetricConfigs);
  const [nonMetricsLoaded, setNonMetricsLoaded] = useState(defaults.nonMetricsLoaded);

  const onAddFilter = useCallback(
    (field: IndexPatternField | string, values: string, operation: '+' | '-') => {
      const newFilters = generateFilters(
        data.query.filterManager,
        field,
        values,
        operation,
        String(currentIndexPattern.id)
      );
      if (newFilters) {
        data.query.filterManager.addFilters(newFilters);
      }

      // Merge current query with new filters
      const mergedQuery = {
        query: searchString || '',
        language: searchQueryLanguage,
      };

      const combinedQuery = createMergedEsQuery(
        {
          query: searchString || '',
          language: searchQueryLanguage,
        },
        data.query.filterManager.getFilters() ?? [],
        currentIndexPattern,
        uiSettings
      );

      setSearchParams({
        searchQuery: combinedQuery,
        searchString: mergedQuery.query,
        queryLanguage: mergedQuery.language as SearchQueryLanguage,
        filters: data.query.filterManager.getFilters(),
      });
    },
    [
      currentIndexPattern,
      data.query.filterManager,
      searchQueryLanguage,
      searchString,
      setSearchParams,
      uiSettings,
    ]
  );

  useEffect(() => {
    const timeUpdateSubscription = merge(
      timefilter.getTimeUpdate$(),
      dataVisualizerRefresh$
    ).subscribe(() => {
      setGlobalState({
        time: timefilter.getTime(),
        refreshInterval: timefilter.getRefreshInterval(),
      });
      setLastRefresh(Date.now());
    });
    return () => {
      timeUpdateSubscription.unsubscribe();
    };
  });

  useEffect(() => {
    loadOverallStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, samplerShardSize, lastRefresh]);

  useEffect(() => {
    createMetricCards();
    createNonMetricCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overallStats, showEmptyFields]);

  useEffect(() => {
    loadMetricFieldStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metricConfigs]);

  useEffect(() => {
    loadNonMetricFieldStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonMetricConfigs]);

  useEffect(() => {
    createMetricCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metricsLoaded]);

  useEffect(() => {
    createNonMetricCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonMetricsLoaded]);

  async function loadOverallStats() {
    const tf = timefilter as any;
    let earliest;
    let latest;

    const activeBounds = tf.getActiveBounds();

    if (currentIndexPattern.timeFieldName !== undefined && activeBounds === undefined) {
      return;
    }

    if (currentIndexPattern.timeFieldName !== undefined) {
      earliest = activeBounds.min.valueOf();
      latest = activeBounds.max.valueOf();
    }

    try {
      const allStats = await dataLoader.loadOverallData(
        searchQuery,
        samplerShardSize,
        earliest,
        latest
      );
      // Because load overall stats perform queries in batches
      // there could be multiple errors
      if (Array.isArray(allStats.errors) && allStats.errors.length > 0) {
        allStats.errors.forEach((err: any) => {
          dataLoader.displayError(extractErrorProperties(err));
        });
      }
      setOverallStats(allStats);
    } catch (err) {
      dataLoader.displayError(err.body ?? err);
    }
  }

  async function loadMetricFieldStats() {
    // Only request data for fields that exist in documents.
    if (metricConfigs.length === 0) {
      return;
    }

    const configsToLoad = metricConfigs.filter(
      (config) => config.existsInDocs === true && config.loading === true
    );
    if (configsToLoad.length === 0) {
      return;
    }

    // Pass the field name, type and cardinality in the request.
    // Top values will be obtained on a sample if cardinality > 100000.
    const existMetricFields: FieldRequestConfig[] = configsToLoad.map((config) => {
      const props = { fieldName: config.fieldName, type: config.type, cardinality: 0 };
      if (config.stats !== undefined && config.stats.cardinality !== undefined) {
        props.cardinality = config.stats.cardinality;
      }
      return props;
    });

    // Obtain the interval to use for date histogram aggregations
    // (such as the document count chart). Aim for 75 bars.
    const buckets = getTimeBuckets();

    const tf = timefilter as any;
    let earliest: number | undefined;
    let latest: number | undefined;
    if (currentIndexPattern.timeFieldName !== undefined) {
      earliest = tf.getActiveBounds().min.valueOf();
      latest = tf.getActiveBounds().max.valueOf();
    }

    const bounds = tf.getActiveBounds();
    const BAR_TARGET = 75;
    buckets.setInterval('auto');
    buckets.setBounds(bounds);
    buckets.setBarTarget(BAR_TARGET);
    const aggInterval = buckets.getInterval();

    try {
      const metricFieldStats = await dataLoader.loadFieldStats(
        searchQuery,
        samplerShardSize,
        earliest,
        latest,
        existMetricFields,
        aggInterval.asMilliseconds()
      );

      // Add the metric stats to the existing stats in the corresponding config.
      const configs: FieldVisConfig[] = [];
      metricConfigs.forEach((config) => {
        const configWithStats = { ...config };
        if (config.fieldName !== undefined) {
          configWithStats.stats = {
            ...configWithStats.stats,
            ...metricFieldStats.find(
              (fieldStats: any) => fieldStats.fieldName === config.fieldName
            ),
          };
          configWithStats.loading = false;
          configs.push(configWithStats);
        } else {
          // Document count card.
          configWithStats.stats = metricFieldStats.find(
            (fieldStats: any) => fieldStats.fieldName === undefined
          );

          if (configWithStats.stats !== undefined) {
            // Add earliest / latest of timefilter for setting x axis domain.
            configWithStats.stats.timeRangeEarliest = earliest;
            configWithStats.stats.timeRangeLatest = latest;
          }
          setDocumentCountStats(configWithStats);
        }
      });

      setMetricConfigs(configs);
    } catch (err) {
      dataLoader.displayError(err);
    }
  }

  async function loadNonMetricFieldStats() {
    // Only request data for fields that exist in documents.
    if (nonMetricConfigs.length === 0) {
      return;
    }

    const configsToLoad = nonMetricConfigs.filter(
      (config) => config.existsInDocs === true && config.loading === true
    );
    if (configsToLoad.length === 0) {
      return;
    }

    // Pass the field name, type and cardinality in the request.
    // Top values will be obtained on a sample if cardinality > 100000.
    const existNonMetricFields: FieldRequestConfig[] = configsToLoad.map((config) => {
      const props = { fieldName: config.fieldName, type: config.type, cardinality: 0 };
      if (config.stats !== undefined && config.stats.cardinality !== undefined) {
        props.cardinality = config.stats.cardinality;
      }
      return props;
    });

    const tf = timefilter as any;
    let earliest;
    let latest;
    if (currentIndexPattern.timeFieldName !== undefined) {
      earliest = tf.getActiveBounds().min.valueOf();
      latest = tf.getActiveBounds().max.valueOf();
    }

    try {
      const nonMetricFieldStats = await dataLoader.loadFieldStats(
        searchQuery,
        samplerShardSize,
        earliest,
        latest,
        existNonMetricFields
      );

      // Add the field stats to the existing stats in the corresponding config.
      const configs: FieldVisConfig[] = [];
      nonMetricConfigs.forEach((config) => {
        const configWithStats = { ...config };
        if (config.fieldName !== undefined) {
          configWithStats.stats = {
            ...configWithStats.stats,
            ...nonMetricFieldStats.find(
              (fieldStats: any) => fieldStats.fieldName === config.fieldName
            ),
          };
        }
        configWithStats.loading = false;
        configs.push(configWithStats);
      });

      setNonMetricConfigs(configs);
    } catch (err) {
      dataLoader.displayError(err);
    }
  }

  const createMetricCards = useCallback(() => {
    const configs: FieldVisConfig[] = [];
    const aggregatableExistsFields: any[] = overallStats.aggregatableExistsFields || [];

    const allMetricFields = indexPatternFields.filter((f) => {
      return (
        f.type === KBN_FIELD_TYPES.NUMBER &&
        f.displayName !== undefined &&
        dataLoader.isDisplayField(f.displayName) === true
      );
    });
    const metricExistsFields = allMetricFields.filter((f) => {
      return aggregatableExistsFields.find((existsF) => {
        return existsF.fieldName === f.spec.name;
      });
    });

    // Add a config for 'document count', identified by no field name if indexpattern is time based.
    if (currentIndexPattern.timeFieldName !== undefined) {
      configs.push({
        type: JOB_FIELD_TYPES.NUMBER,
        existsInDocs: true,
        loading: true,
        aggregatable: true,
      });
    }

    if (metricsLoaded === false) {
      setMetricsLoaded(true);
      return;
    }

    let aggregatableFields: any[] = overallStats.aggregatableExistsFields;
    if (allMetricFields.length !== metricExistsFields.length && metricsLoaded === true) {
      aggregatableFields = aggregatableFields.concat(overallStats.aggregatableNotExistsFields);
    }

    const metricFieldsToShow =
      metricsLoaded === true && showEmptyFields === true ? allMetricFields : metricExistsFields;

    metricFieldsToShow.forEach((field) => {
      const fieldData = aggregatableFields.find((f) => {
        return f.fieldName === field.spec.name;
      });

      const metricConfig: FieldVisConfig = {
        ...(fieldData ? fieldData : {}),
        fieldFormat: currentIndexPattern.getFormatterForField(field),
        type: JOB_FIELD_TYPES.NUMBER,
        loading: true,
        aggregatable: true,
        deletable: field.runtimeField !== undefined,
      };
      if (field.displayName !== metricConfig.fieldName) {
        metricConfig.displayName = field.displayName;
      }

      configs.push(metricConfig);
    });

    setMetricsStats({
      totalMetricFieldsCount: allMetricFields.length,
      visibleMetricsCount: metricFieldsToShow.length,
    });
    setMetricConfigs(configs);
  }, [
    currentIndexPattern,
    dataLoader,
    indexPatternFields,
    metricsLoaded,
    overallStats,
    showEmptyFields,
  ]);

  const createNonMetricCards = useCallback(() => {
    const allNonMetricFields = indexPatternFields.filter((f) => {
      return (
        f.type !== KBN_FIELD_TYPES.NUMBER &&
        f.displayName !== undefined &&
        dataLoader.isDisplayField(f.displayName) === true
      );
    });
    // Obtain the list of all non-metric fields which appear in documents
    // (aggregatable or not aggregatable).
    const populatedNonMetricFields: any[] = []; // Kibana data view non metric fields.
    let nonMetricFieldData: any[] = []; // Basic non metric field data loaded from requesting overall stats.
    const aggregatableExistsFields: any[] = overallStats.aggregatableExistsFields || [];
    const nonAggregatableExistsFields: any[] = overallStats.nonAggregatableExistsFields || [];

    allNonMetricFields.forEach((f) => {
      const checkAggregatableField = aggregatableExistsFields.find(
        (existsField) => existsField.fieldName === f.spec.name
      );

      if (checkAggregatableField !== undefined) {
        populatedNonMetricFields.push(f);
        nonMetricFieldData.push(checkAggregatableField);
      } else {
        const checkNonAggregatableField = nonAggregatableExistsFields.find(
          (existsField) => existsField.fieldName === f.spec.name
        );

        if (checkNonAggregatableField !== undefined) {
          populatedNonMetricFields.push(f);
          nonMetricFieldData.push(checkNonAggregatableField);
        }
      }
    });

    if (nonMetricsLoaded === false) {
      setNonMetricsLoaded(true);
      return;
    }

    if (allNonMetricFields.length !== nonMetricFieldData.length && showEmptyFields === true) {
      // Combine the field data obtained from Elasticsearch into a single array.
      nonMetricFieldData = nonMetricFieldData.concat(
        overallStats.aggregatableNotExistsFields,
        overallStats.nonAggregatableNotExistsFields
      );
    }

    const nonMetricFieldsToShow = showEmptyFields ? allNonMetricFields : populatedNonMetricFields;

    const configs: FieldVisConfig[] = [];

    nonMetricFieldsToShow.forEach((field) => {
      const fieldData = nonMetricFieldData.find((f) => f.fieldName === field.spec.name);

      const nonMetricConfig = {
        ...(fieldData ? fieldData : {}),
        fieldFormat: currentIndexPattern.getFormatterForField(field),
        aggregatable: field.aggregatable,
        scripted: field.scripted,
        loading: fieldData?.existsInDocs,
        deletable: field.runtimeField !== undefined,
      };

      // Map the field type from the Kibana data view to the field type
      // used in the data visualizer.
      const dataVisualizerType = kbnTypeToJobType(field);
      if (dataVisualizerType !== undefined) {
        nonMetricConfig.type = dataVisualizerType;
      } else {
        // Add a flag to indicate that this is one of the 'other' Kibana
        // field types that do not yet have a specific card type.
        nonMetricConfig.type = field.type;
        nonMetricConfig.isUnsupportedType = true;
      }

      if (field.displayName !== nonMetricConfig.fieldName) {
        nonMetricConfig.displayName = field.displayName;
      }

      configs.push(nonMetricConfig);
    });

    setNonMetricConfigs(configs);
  }, [
    currentIndexPattern,
    dataLoader,
    indexPatternFields,
    nonMetricsLoaded,
    overallStats,
    showEmptyFields,
  ]);

  const wizardPanelWidth = '280px';

  const configs = useMemo(() => {
    let combinedConfigs = [...nonMetricConfigs, ...metricConfigs];
    if (visibleFieldTypes && visibleFieldTypes.length > 0) {
      combinedConfigs = combinedConfigs.filter(
        (config) => visibleFieldTypes.findIndex((field) => field === config.type) > -1
      );
    }
    if (visibleFieldNames && visibleFieldNames.length > 0) {
      combinedConfigs = combinedConfigs.filter(
        (config) => visibleFieldNames.findIndex((field) => field === config.fieldName) > -1
      );
    }

    return combinedConfigs;
  }, [nonMetricConfigs, metricConfigs, visibleFieldTypes, visibleFieldNames]);

  const fieldsCountStats: TotalFieldsStats | undefined = useMemo(() => {
    let _visibleFieldsCount = 0;
    let _totalFieldsCount = 0;
    Object.keys(overallStats).forEach((key) => {
      const fieldsGroup = overallStats[key as keyof OverallStats];
      if (Array.isArray(fieldsGroup) && fieldsGroup.length > 0) {
        _totalFieldsCount += fieldsGroup.length;
      }
    });

    if (showEmptyFields === true) {
      _visibleFieldsCount = _totalFieldsCount;
    } else {
      _visibleFieldsCount =
        overallStats.aggregatableExistsFields.length +
        overallStats.nonAggregatableExistsFields.length;
    }
    return { visibleFieldsCount: _visibleFieldsCount, totalFieldsCount: _totalFieldsCount };
  }, [overallStats, showEmptyFields]);

  const getItemIdToExpandedRowMap = useCallback(
    function (itemIds: string[], items: FieldVisConfig[]): ItemIdToExpandedRowMap {
      return itemIds.reduce((m: ItemIdToExpandedRowMap, fieldName: string) => {
        const item = items.find((fieldVisConfig) => fieldVisConfig.fieldName === fieldName);
        if (item !== undefined) {
          m[fieldName] = (
            <IndexBasedDataVisualizerExpandedRow
              item={item}
              indexPattern={currentIndexPattern}
              combinedQuery={{ searchQueryLanguage, searchString }}
              onAddFilter={onAddFilter}
            />
          );
        }
        return m;
      }, {} as ItemIdToExpandedRowMap);
    },
    [currentIndexPattern, searchQueryLanguage, searchString, onAddFilter]
  );

  // Some actions open up fly-out or popup
  // This variable is used to keep track of them and clean up when unmounting
  const actionFlyoutRef = useRef<() => void | undefined>();
  useEffect(() => {
    const ref = actionFlyoutRef;
    return () => {
      // Clean up any of the flyout/editor opened from the actions
      if (ref.current) {
        ref.current();
      }
    };
  }, []);

  // Inject custom action column for the index based visualizer
  // Hide the column completely if no access to any of the plugins
  const extendedColumns = useMemo(() => {
    const actions = getActions(
      currentIndexPattern,
      services,
      {
        searchQueryLanguage,
        searchString,
      },
      actionFlyoutRef
    );
    if (!Array.isArray(actions) || actions.length < 1) return;

    const actionColumn: EuiTableActionsColumnType<FieldVisConfig> = {
      name: (
        <FormattedMessage
          id="xpack.dataVisualizer.index.dataGrid.actionsColumnLabel"
          defaultMessage="Actions"
        />
      ),
      actions,
      width: '100px',
    };

    return [actionColumn];
  }, [currentIndexPattern, services, searchQueryLanguage, searchString]);

  const helpLink = docLinks.links.ml.guide;

  return (
    <Fragment>
      <EuiPage data-test-subj="dataVisualizerIndexPage">
        <EuiPageBody>
          <EuiFlexGroup gutterSize="m">
            <EuiFlexItem>
              <EuiPageContentHeader className="dataVisualizerPageHeader">
                <EuiPageContentHeaderSection>
                  <div className="dataViewTitleHeader">
                    <EuiTitle>
                      <h1>{currentIndexPattern.title}</h1>
                    </EuiTitle>
                    <DataVisualizerIndexPatternManagement
                      currentIndexPattern={currentIndexPattern}
                      useNewFieldsApi={true}
                    />
                  </div>
                </EuiPageContentHeaderSection>

                <EuiFlexGroup
                  alignItems="center"
                  justifyContent="flexEnd"
                  gutterSize="s"
                  data-test-subj="dataVisualizerTimeRangeSelectorSection"
                >
                  {currentIndexPattern.timeFieldName !== undefined && (
                    <EuiFlexItem grow={false}>
                      <FullTimeRangeSelector
                        indexPattern={currentIndexPattern}
                        query={undefined}
                        disabled={false}
                        timefilter={timefilter}
                      />
                    </EuiFlexItem>
                  )}
                  <EuiFlexItem grow={false}>
                    <DatePickerWrapper />
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiPageContentHeader>
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiSpacer size="m" />
          <EuiPageContentBody>
            <EuiFlexGroup gutterSize="m">
              <EuiFlexItem>
                <EuiPanel>
                  {overallStats?.totalCount !== undefined && (
                    <EuiFlexItem grow={true}>
                      <DocumentCountContent
                        config={documentCountStats}
                        totalCount={overallStats.totalCount}
                      />
                    </EuiFlexItem>
                  )}
                  <SearchPanel
                    indexPattern={currentIndexPattern}
                    searchString={searchString}
                    searchQuery={searchQuery}
                    searchQueryLanguage={searchQueryLanguage}
                    setSearchParams={setSearchParams}
                    samplerShardSize={samplerShardSize}
                    setSamplerShardSize={setSamplerShardSize}
                    overallStats={overallStats}
                    indexedFieldTypes={fieldTypes}
                    setVisibleFieldTypes={setVisibleFieldTypes}
                    visibleFieldTypes={visibleFieldTypes}
                    visibleFieldNames={visibleFieldNames}
                    setVisibleFieldNames={setVisibleFieldNames}
                    showEmptyFields={showEmptyFields}
                    onAddFilter={onAddFilter}
                  />
                  <EuiSpacer size={'m'} />
                  <FieldCountPanel
                    showEmptyFields={showEmptyFields}
                    toggleShowEmptyFields={toggleShowEmptyFields}
                    fieldsCountStats={fieldsCountStats}
                    metricsStats={metricsStats}
                  />
                  <EuiSpacer size={'m'} />
                  <DataVisualizerTable<FieldVisConfig>
                    items={configs}
                    pageState={dataVisualizerListState}
                    updatePageState={setDataVisualizerListState}
                    getItemIdToExpandedRowMap={getItemIdToExpandedRowMap}
                    extendedColumns={extendedColumns}
                  />
                </EuiPanel>
              </EuiFlexItem>
              <EuiFlexItem grow={false} style={{ width: wizardPanelWidth }}>
                <ActionsPanel
                  indexPattern={currentIndexPattern}
                  searchQueryLanguage={searchQueryLanguage}
                  searchString={searchString}
                  additionalLinks={additionalLinks ?? []}
                />
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiPageContentBody>
        </EuiPageBody>
      </EuiPage>

      <HelpMenu docLink={helpLink} />
    </Fragment>
  );
};
