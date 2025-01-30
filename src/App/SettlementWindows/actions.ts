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

import { createAction } from '@reduxjs/toolkit';
import {
  RESET_SETTLEMENT_WINDOWS,
  REQUEST_SETTLEMENT_WINDOWS,
  SET_SETTLEMENT_WINDOWS,
  SET_SETTLEMENT_WINDOWS_ERROR,
  SELECT_SETTLEMENT_WINDOWS_FILTER_DATE_RANGE,
  SELECT_SETTLEMENT_WINDOWS_FILTER_DATE_VALUE,
  CLEAR_SETTLEMENT_WINDOWS_FILTER_DATE_RANGE,
  CLEAR_SETTLEMENT_WINDOWS_FILTER_STATE,
  SET_SETTLEMENT_WINDOWS_FILTER_VALUE,
  CLEAR_SETTLEMENT_WINDOWS_FILTERS,
  CHECK_SETTLEMENT_WINDOWS,
  SETTLE_SETTLEMENT_WINDOWS,
  SET_SETTLE_SETTLEMENT_WINDOWS_FINISHED,
  SET_SETTLE_SETTLEMENT_WINDOWS_ERROR,
  REQUEST_CLOSE_SETTLEMENT_WINDOW,
  SET_CLOSE_SETTLEMENT_WINDOW_FINISHED,
  CLOSE_SETTLEMENT_WINDOW_MODAL,
  SettlementWindow,
  DateRanges,
  FilterNameValue,
  SettlementModel,
  SET_SETTLEMENT_MODELS,
  REQUEST_SETTLEMENT_MODELS,
  SET_SELECTED_SETTLEMENT_MODEL,
} from './types';

// Functions that create actions to update the state.
// We use @reduxjs/toolkit to save use some boilerplate code.
// const increment = createAction<number | undefined>('counter/increment')

// let action = increment()
// { type: 'counter/increment' }

// action = increment(3)
// returns { type: 'counter/increment', payload: 3 }

// console.log(`The action type is: ${increment.type}`)
// 'The action type is: counter/increment'
export const resetSettlementWindows = createAction(RESET_SETTLEMENT_WINDOWS);
export const requestSettlementWindows = createAction(REQUEST_SETTLEMENT_WINDOWS);
export const setSettlementWindows = createAction<SettlementWindow[]>(SET_SETTLEMENT_WINDOWS);
export const setSettlementWindowsError = createAction<string>(SET_SETTLEMENT_WINDOWS_ERROR);

export const selectSettlementWindowsFilterDateRange = createAction<DateRanges>(
  SELECT_SETTLEMENT_WINDOWS_FILTER_DATE_RANGE,
);
export const selectSettlementWindowsFilterDateValue = createAction<{
  type: 'start' | 'end';
  value: number;
}>(SELECT_SETTLEMENT_WINDOWS_FILTER_DATE_VALUE);
export const clearSettlementWindowsFilterDateRange = createAction(
  CLEAR_SETTLEMENT_WINDOWS_FILTER_DATE_RANGE,
);
export const clearSettlementWindowsFilterState = createAction(
  CLEAR_SETTLEMENT_WINDOWS_FILTER_STATE,
);
export const setSettlementWindowsFilterValue = createAction<FilterNameValue>(
  SET_SETTLEMENT_WINDOWS_FILTER_VALUE,
);
export const clearSettlementWindowsFilters = createAction(CLEAR_SETTLEMENT_WINDOWS_FILTERS);
export const checkSettlementWindows = createAction<SettlementWindow[]>(CHECK_SETTLEMENT_WINDOWS);
export const settleSettlementWindows = createAction(SETTLE_SETTLEMENT_WINDOWS);
export const setSettleSettlementWindowsFinished = createAction<number>(
  SET_SETTLE_SETTLEMENT_WINDOWS_FINISHED,
);
export const setSettleSettlementWindowsError = createAction<string>(
  SET_SETTLE_SETTLEMENT_WINDOWS_ERROR,
);
export const requestCloseSettlementWindow = createAction<SettlementWindow>(
  REQUEST_CLOSE_SETTLEMENT_WINDOW,
);
export const setCloseSettlementWindowFinished = createAction(SET_CLOSE_SETTLEMENT_WINDOW_FINISHED);
export const closeSettlementWindowModal = createAction(CLOSE_SETTLEMENT_WINDOW_MODAL);

export const requestSettlementModels = createAction(REQUEST_SETTLEMENT_MODELS);
export const setSettlementModels = createAction<SettlementModel[]>(SET_SETTLEMENT_MODELS);

export const setSelectedSettlementModel = createAction<string>(SET_SELECTED_SETTLEMENT_MODEL);
