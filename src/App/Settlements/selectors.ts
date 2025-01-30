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

import { State } from 'store/types';

export const getSettlements = (state: State) => state.settlements.settlements;
export const getSettlementsError = (state: State) => state.settlements.settlementsError;
export const getIsSettlementsPending = (state: State) => state.settlements.isSettlementsPending;
export const getSettlementReport = (state: State) => state.settlements.settlementReport;

export const getSettlementsFilters = (state: State) => state.settlements.filters;

export const getSelectedSettlement = (state: State) => state.settlements.selectedSettlement;

export const getFinalizeSettlementModalVisible = (state: State) =>
  state.settlements.showFinalizeSettlementModal;
export const getFinalizingSettlement = (state: State) => state.settlements.finalizingSettlement;
export const getFinalizingSettlementError = (state: State) =>
  state.settlements.finalizingSettlementError;
export const getSettlementReportError = (state: State) => state.settlements.settlementReportError;
export const getSettlementFinalizingInProgress = (state: State) =>
  state.settlements.settlementFinalizingInProgress;
export const getSettlementAdjustments = (state: State) => state.settlements.settlementAdjustments;
export const getSettlementReportValidationWarnings = (state: State) =>
  state.settlements.settlementReportValidationWarnings;
export const getSettlementReportValidationErrors = (state: State) =>
  state.settlements.settlementReportValidationErrors;
export const getSettlementReportValidationInProgress = (state: State) =>
  state.settlements.settlementReportValidationInProgress;
