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
  SettlementWindowsState,
  SettlementWindow,
  DateRanges,
  FilterNameValue,
  SettlementModel,
} from './types';
import { getDateRangeTimestamp } from './helpers';
import {
  resetSettlementWindows,
  requestSettlementWindows,
  setSettlementWindowsError,
  setSettlementWindows,
  selectSettlementWindowsFilterDateRange,
  selectSettlementWindowsFilterDateValue,
  clearSettlementWindowsFilterDateRange,
  clearSettlementWindowsFilterState,
  setSettlementWindowsFilterValue,
  clearSettlementWindowsFilters,
  checkSettlementWindows,
  settleSettlementWindows,
  setSettleSettlementWindowsFinished,
  setSettleSettlementWindowsError,
  closeSettlementWindowModal,
  requestCloseSettlementWindow,
  setCloseSettlementWindowFinished,
  setSelectedSettlementModel,
  setSettlementModels,
} from './actions';

const initialState: SettlementWindowsState = {
  isSettlementWindowsPending: false,
  settlementWindows: [],
  settlementWindowsError: null,
  selectedSettlementWindow: undefined,
  selectedSettlementModel: undefined,
  isSettlementModelsPending: true,
  settlementModels: [],
  checkedSettlementWindows: [],
  isSettlementWindowModalVisible: false,
  settlingWindowsSettlementId: null,
  filters: {
    range: DateRanges.Today,
    start: getDateRangeTimestamp(DateRanges.Today, 'start'),
    end: getDateRangeTimestamp(DateRanges.Today, 'end'),
    state: undefined,
  },
  isCloseSettlementWindowPending: false,
  isSettleSettlementWindowPending: false,
  settleSettlementWindowsError: null,
};

// Reducers are pure functions that handle state logic, accepting the initial
// state and action type to update and return the state, facilitating changes
// in React view components.
export default createReducer(initialState, (builder) =>
  builder
    .addCase(resetSettlementWindows, () => ({
      ...initialState,
    }))
    .addCase(requestSettlementWindows, (state: SettlementWindowsState) => ({
      ...state,
      settlementWindows: initialState.settlementWindows,
      settlementWindowsError: initialState.settlementWindowsError,
      isSettlementWindowsPending: true,
    }))
    .addCase(
      setSettlementWindows,
      (state: SettlementWindowsState, action: PayloadAction<SettlementWindow[]>) => ({
        ...state,
        settlementWindows: action.payload,
        isSettlementWindowsPending: false,
      }),
    )
    .addCase(
      setSettlementWindowsError,
      (state: SettlementWindowsState, action: PayloadAction<string>) => ({
        ...state,
        settlementWindowsError: action.payload,
        isSettlementWindowsPending: false,
      }),
    )
    .addCase(
      selectSettlementWindowsFilterDateRange,
      (state: SettlementWindowsState, action: PayloadAction<DateRanges>) => ({
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
      selectSettlementWindowsFilterDateValue,
      (
        state: SettlementWindowsState,
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
    .addCase(clearSettlementWindowsFilterDateRange, (state: SettlementWindowsState) => ({
      ...state,
      filters: {
        ...state.filters,
        range: undefined,
        start: undefined,
        end: undefined,
      },
    }))
    .addCase(clearSettlementWindowsFilterState, (state: SettlementWindowsState) => ({
      ...state,
      filters: {
        ...state.filters,
        state: initialState.filters.state,
      },
    }))
    .addCase(
      setSettlementWindowsFilterValue,
      (state: SettlementWindowsState, action: PayloadAction<FilterNameValue>) => ({
        ...state,
        filters: {
          ...state.filters,
          [action.payload.filter as string]: action.payload.value,
        },
      }),
    )
    .addCase(clearSettlementWindowsFilters, (state: SettlementWindowsState) => ({
      ...state,
      filters: initialState.filters,
    }))
    .addCase(
      checkSettlementWindows,
      (state: SettlementWindowsState, action: PayloadAction<SettlementWindow[]>) => ({
        ...state,
        checkedSettlementWindows: action.payload,
      }),
    )
    .addCase(settleSettlementWindows, (state: SettlementWindowsState) => ({
      ...state,
      settlingWindowsSettlementId: initialState.settlingWindowsSettlementId,
      isSettlementWindowModalVisible: true,
      isSettleSettlementWindowPending: true,
      settleSettlementWindowsError: initialState.settlementWindowsError,
    }))
    .addCase(
      setSettleSettlementWindowsFinished,
      (state: SettlementWindowsState, action: PayloadAction<number>) => ({
        ...state,
        settlingWindowsSettlementId: action.payload,
        isSettleSettlementWindowPending: false,
      }),
    )
    .addCase(
      setSettleSettlementWindowsError,
      (state: SettlementWindowsState, action: PayloadAction<string>) => ({
        ...state,
        settlingWindowsSettlementId: initialState.settlingWindowsSettlementId,
        isSettleSettlementWindowPending: false,
        settleSettlementWindowsError: action.payload,
      }),
    )
    .addCase(closeSettlementWindowModal, (state: SettlementWindowsState) => ({
      ...state,
      isSettlementWindowModalVisible: false,
      checkedSettlementWindows: initialState.checkedSettlementWindows,
      isSettlementWindowsPending: true,
    }))
    .addCase(requestCloseSettlementWindow, (state: SettlementWindowsState) => ({
      ...state,
      isCloseSettlementWindowPending: true,
    }))
    .addCase(setCloseSettlementWindowFinished, (state: SettlementWindowsState) => ({
      ...state,
      isCloseSettlementWindowPending: false,
    }))
    .addCase(
      setSettlementModels,
      (state: SettlementWindowsState, action: PayloadAction<SettlementModel[]>) => ({
        ...state,
        settlementModels: action.payload,
        isSettlementModelsPending: false,
      }),
    )
    .addCase(
      setSelectedSettlementModel,
      (state: SettlementWindowsState, action: PayloadAction<string>) => ({
        ...state,
        selectedSettlementModel: action.payload,
      }),
    ),
);
