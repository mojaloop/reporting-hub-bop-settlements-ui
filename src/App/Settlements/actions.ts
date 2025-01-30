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
  REQUEST_SETTLEMENTS,
  SET_SETTLEMENTS,
  SET_SETTLEMENTS_ERROR,
  SELECT_SETTLEMENTS_FILTER_DATE_RANGE,
  SELECT_SETTLEMENTS_FILTER_DATE_VALUE,
  CLEAR_SETTLEMENTS_FILTER_DATE_RANGE,
  CLEAR_SETTLEMENTS_FILTER_STATE,
  SET_SETTLEMENTS_FILTER_VALUE,
  CLEAR_SETTLEMENTS_FILTERS,
  SELECT_SETTLEMENT,
  SET_SETTLEMENT_REPORT,
  HIDE_FINALIZE_SETTLEMENT_MODAL,
  SHOW_FINALIZE_SETTLEMENT_MODAL,
  FINALIZE_SETTLEMENT,
  FINALIZE_SETTLEMENT_ERROR,
  SET_SETTLEMENT_REPORT_ERROR,
  SET_FINALIZE_SETTLEMENT_IN_PROGRESS,
  SET_SETTLEMENT_ADJUSTMENTS,
  SET_SETTLEMENT_REPORT_VALIDATION_ERRORS,
  SET_SETTLEMENT_REPORT_VALIDATION_WARNINGS,
  VALIDATE_SETTLEMENT_REPORT,
  SET_SETTLEMENT_FINALIZATION_REPORT_VALIDATION_IN_PROGRESS,
  FINALIZING_SETTLEMENT,
  FinalizeSettlementError,
  Settlement,
  SettlementAdjustments,
  SettlementReport,
  SettlementReportValidation,
  DateRanges,
  FilterNameValue,
} from './types';

export const requestSettlements = createAction(REQUEST_SETTLEMENTS);
export const setSettlements = createAction<Settlement[]>(SET_SETTLEMENTS);
export const setSettlementsError = createAction<string>(SET_SETTLEMENTS_ERROR);

export const selectSettlementsFilterDateRange = createAction<DateRanges>(
  SELECT_SETTLEMENTS_FILTER_DATE_RANGE,
);
export const selectSettlementsFilterDateValue = createAction<{
  type: 'start' | 'end';
  value: number;
}>(SELECT_SETTLEMENTS_FILTER_DATE_VALUE);
export const clearSettlementsFilterDateRange = createAction(CLEAR_SETTLEMENTS_FILTER_DATE_RANGE);
export const clearSettlementsFilterState = createAction(CLEAR_SETTLEMENTS_FILTER_STATE);
export const setSettlementsFilterValue = createAction<FilterNameValue>(
  SET_SETTLEMENTS_FILTER_VALUE,
);
export const clearSettlementsFilters = createAction(CLEAR_SETTLEMENTS_FILTERS);

export const selectSettlement = createAction<null | Settlement>(SELECT_SETTLEMENT);
export const finalizeSettlement = createAction<Settlement>(FINALIZE_SETTLEMENT);
export const setSettlementReport = createAction<null | SettlementReport>(SET_SETTLEMENT_REPORT);
export const setFinalizeSettlementError = createAction<null | FinalizeSettlementError>(
  FINALIZE_SETTLEMENT_ERROR,
);
export const setSettlementReportError = createAction<null | string>(SET_SETTLEMENT_REPORT_ERROR);
export const setFinalizingSettlement = createAction<null | Settlement>(FINALIZING_SETTLEMENT);
export const hideFinalizeSettlementModal = createAction(HIDE_FINALIZE_SETTLEMENT_MODAL);
export const showFinalizeSettlementModal = createAction(SHOW_FINALIZE_SETTLEMENT_MODAL);
export const setSettlementFinalizingInProgress = createAction<boolean>(
  SET_FINALIZE_SETTLEMENT_IN_PROGRESS,
);
export const setSettlementAdjustments = createAction<null | SettlementAdjustments>(
  SET_SETTLEMENT_ADJUSTMENTS,
);
export const setSettlementReportValidationWarnings = createAction<
  null | SettlementReportValidation[]
>(SET_SETTLEMENT_REPORT_VALIDATION_WARNINGS);
export const setSettlementReportValidationErrors = createAction<
  null | SettlementReportValidation[]
>(SET_SETTLEMENT_REPORT_VALIDATION_ERRORS);
export const validateSettlementReport = createAction(VALIDATE_SETTLEMENT_REPORT);
export const setSettlementReportValidationInProgress = createAction<boolean>(
  SET_SETTLEMENT_FINALIZATION_REPORT_VALIDATION_IN_PROGRESS,
);
