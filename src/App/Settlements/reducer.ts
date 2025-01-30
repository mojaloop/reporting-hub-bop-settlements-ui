/** ***
 License
 --------------
 Copyright © 2020-2025 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Mojaloop Foundation for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.

 * Mojaloop Foundation
 - Name Surname <name.surname@mojaloop.io>
**** */

import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import {
  DateRanges,
  FilterNameValue,
  FinalizeSettlementError,
  Settlement,
  SettlementReport,
  SettlementAdjustments,
  SettlementReportValidation,
  SettlementsState,
} from './types';
import { getDateRangeTimestamp } from './helpers';
import {
  requestSettlements,
  setSettlementsError,
  setSettlements,
  selectSettlementsFilterDateRange,
  selectSettlementsFilterDateValue,
  clearSettlementsFilterDateRange,
  clearSettlementsFilterState,
  setSettlementsFilterValue,
  clearSettlementsFilters,
  selectSettlement,
  setFinalizeSettlementError,
  setFinalizingSettlement,
  setSettlementReport,
  setSettlementReportError,
  showFinalizeSettlementModal,
  hideFinalizeSettlementModal,
  setSettlementFinalizingInProgress,
  setSettlementAdjustments,
  setSettlementReportValidationErrors,
  setSettlementReportValidationWarnings,
  setSettlementReportValidationInProgress,
} from './actions';

const initialState: SettlementsState = {
  isSettlementsPending: false,
  settlements: [],
  settlementsError: null,

  filters: {
    range: DateRanges.Today,
    start: getDateRangeTimestamp(DateRanges.Today, 'start'),
    end: getDateRangeTimestamp(DateRanges.Today, 'end'),
    state: undefined,
  },

  selectedSettlement: null,

  showFinalizeSettlementModal: false,
  settlementReport: null,
  settlementReportError: null,
  finalizingSettlement: null,
  finalizingSettlementError: null,
  settlementFinalizingInProgress: false,
  settlementAdjustments: null,
  settlementReportValidationErrors: null,
  settlementReportValidationWarnings: null,
  settlementReportValidationInProgress: false,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(requestSettlements, (state: SettlementsState) => ({
      ...state,
      settlements: initialState.settlements,
      settlementsError: initialState.settlementsError,
      isSettlementsPending: true,
    }))
    .addCase(setSettlements, (state: SettlementsState, action: PayloadAction<Settlement[]>) => ({
      ...state,
      settlements: action.payload,
      isSettlementsPending: false,
    }))
    .addCase(setSettlementsError, (state: SettlementsState, action: PayloadAction<string>) => ({
      ...state,
      settlementsError: action.payload,
      isSettlementsPending: false,
    }))

    .addCase(
      selectSettlementsFilterDateRange,
      (state: SettlementsState, action: PayloadAction<DateRanges>) => ({
        ...state,
        filters: {
          ...state.filters,
          range: action.payload,
          start: getDateRangeTimestamp(action.payload, 'start'),
          end: getDateRangeTimestamp(action.payload, 'end'),
        },
      }),
    )
    .addCase(
      selectSettlementsFilterDateValue,
      (
        state: SettlementsState,
        action: PayloadAction<{ type: 'start' | 'end'; value: number }>,
      ) => {
        const { type, value } = action.payload;
        let { start, end } = state.filters;

        if (type === 'start') {
          start = value;
        } else {
          end = value;
        }

        if ((start || 0) > (end || Infinity)) {
          start = value;
          end = value;
        }

        return {
          ...state,
          filters: {
            ...state.filters,
            range: DateRanges.Custom,
            start,
            end,
          },
        };
      },
    )
    .addCase(clearSettlementsFilterDateRange, (state: SettlementsState) => ({
      ...state,
      filters: {
        ...state.filters,
        range: undefined,
        start: undefined,
        end: undefined,
      },
    }))
    .addCase(clearSettlementsFilterState, (state: SettlementsState) => ({
      ...state,
      filters: {
        ...state.filters,
        state: initialState.filters.state,
      },
    }))
    .addCase(
      setSettlementsFilterValue,
      (state: SettlementsState, action: PayloadAction<FilterNameValue>) => ({
        ...state,
        filters: {
          ...state.filters,
          [action.payload.filter as string]: action.payload.value,
        },
      }),
    )
    .addCase(clearSettlementsFilters, (state: SettlementsState) => ({
      ...state,
      filters: initialState.filters,
    }))
    .addCase(
      selectSettlement,
      (state: SettlementsState, action: PayloadAction<Settlement | null>) => ({
        ...state,
        selectedSettlement: action.payload,
      }),
    )
    .addCase(
      setFinalizeSettlementError,
      (state: SettlementsState, action: PayloadAction<FinalizeSettlementError>) => ({
        ...state,
        finalizingSettlementError: action.payload,
      }),
    )
    .addCase(
      setFinalizingSettlement,
      (state: SettlementsState, action: PayloadAction<Settlement>) => ({
        ...state,
        finalizingSettlement: action.payload,
      }),
    )
    .addCase(hideFinalizeSettlementModal, (state: SettlementsState) => ({
      ...state,
      showFinalizeSettlementModal: false,
    }))
    .addCase(showFinalizeSettlementModal, (state: SettlementsState) => ({
      ...state,
      showFinalizeSettlementModal: true,
    }))
    .addCase(
      setSettlementReport,
      (state: SettlementsState, action: PayloadAction<SettlementReport>) => ({
        ...state,
        settlementReport: action.payload,
      }),
    )
    .addCase(
      setSettlementReportError,
      (state: SettlementsState, action: PayloadAction<string>) => ({
        ...state,
        settlementReportError: action.payload,
      }),
    )
    .addCase(
      setSettlementFinalizingInProgress,
      (state: SettlementsState, action: PayloadAction<boolean>) => ({
        ...state,
        settlementFinalizingInProgress: action.payload,
      }),
    )
    .addCase(
      setSettlementAdjustments,
      (state: SettlementsState, action: PayloadAction<null | SettlementAdjustments>) => ({
        ...state,
        settlementAdjustments: action.payload,
      }),
    )
    .addCase(
      setSettlementReportValidationErrors,
      (state: SettlementsState, action: PayloadAction<null | SettlementReportValidation[]>) => ({
        ...state,
        settlementReportValidationErrors: action.payload,
      }),
    )
    .addCase(
      setSettlementReportValidationWarnings,
      (state: SettlementsState, action: PayloadAction<null | SettlementReportValidation[]>) => ({
        ...state,
        settlementReportValidationWarnings: action.payload,
      }),
    )
    .addCase(
      setSettlementReportValidationInProgress,
      (state: SettlementsState, action: PayloadAction<boolean>) => ({
        ...state,
        settlementReportValidationInProgress: action.payload,
      }),
    ),
);
