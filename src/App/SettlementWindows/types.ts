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

import { ErrorMessage } from '../types';

export { Settlement, SettlementStatus } from 'App/types';

export const RESET_SETTLEMENT_WINDOWS = 'Settlement Windows / Reset Settlement Windows';
export const REQUEST_SETTLEMENT_WINDOWS = 'Settlement Windows / Request Settlement Windows';
export const SET_SETTLEMENT_WINDOWS = 'Settlement Windows / Set Settlement Windows';
export const SET_SETTLEMENT_WINDOWS_ERROR = 'Settlement Windows / Set Settlement Windows Error';
export const SELECT_SETTLEMENT_WINDOWS_FILTER_DATE_RANGE =
  'Settlement Windows / Select Settlement Windows Filter Date Range';
export const SELECT_SETTLEMENT_WINDOWS_FILTER_DATE_VALUE =
  'Settlement Windows / Select Settlement Windows Filter Date Value';
export const CLEAR_SETTLEMENT_WINDOWS_FILTER_DATE_RANGE =
  'Settlement Windows / Clear Settlement Windows Filter Date Range';
export const CLEAR_SETTLEMENT_WINDOWS_FILTER_STATE =
  'Settlement Windows / Clear Settlement Windows Filter State';
export const SET_SETTLEMENT_WINDOWS_FILTER_VALUE =
  'Settlement Windows / Set Settlement Windows Filter Value';
export const CLEAR_SETTLEMENT_WINDOWS_FILTERS =
  'Settlement Windows / Clear Settlement Windows Filters';
export const CHECK_SETTLEMENT_WINDOWS = 'Settlement Windows / Check Settlement Windows';
export const SETTLE_SETTLEMENT_WINDOWS = 'Settlement Windows / Settle Settlement Windows';
export const SET_SETTLE_SETTLEMENT_WINDOWS_FINISHED =
  'Settlement Windows / Set Settle Settlement Windows Finished';
export const SET_SETTLE_SETTLEMENT_WINDOWS_ERROR =
  'Settlement Windows / Set Settle Settlement Windows Error';
export const CLOSE_SETTLEMENT_WINDOW_MODAL = 'Settlement Windows / Close Settlement Window Modal';
export const REQUEST_CLOSE_SETTLEMENT_WINDOW =
  'Settlement Windows / Request Close Settlement Window';
export const SET_CLOSE_SETTLEMENT_WINDOW_FINISHED =
  'Settlement Windows / Set Close Settlement Window Finished';
export const SET_SETTLEMENT_MODELS = 'Settlement Windows / Set Settlement Models';
export const REQUEST_SETTLEMENT_MODELS = 'Settlement Windows / Request Settlement Models';
export const SET_SELECTED_SETTLEMENT_MODEL = 'Settlement Windows / Set Selected Settlement Model';

export interface SettlementWindow {
  settlementWindowId: number;
  state: SettlementWindowStatus;
  createdDate: string;
  changedDate: string;
}
export interface SettlementModel {
  settlementModelId: number;
  name: string;
  IsActive: boolean;
  settlementGranularity: string;
  settlementInterchange: string;
  settlementDelay: string;
  currency: string;
  requireLiquidityCheck: boolean;
  ledgerAccountTypeId: string;
  autoPositionReset: boolean;
}
export enum SettlementWindowStatus {
  Open = 'OPEN',
  Closed = 'CLOSED',
  Pending = 'PENDING_SETTLEMENT',
  Settled = 'SETTLED',
  Aborted = 'ABORTED',
  Processing = 'PROCESSING',
}

export enum DateRanges {
  Today = 'Today',
  TwoDays = 'Past 48 Hours',
  OneWeek = '1 Week',
  OneMonth = '1 Month',
  Custom = 'Custom Range',
}

export interface SettlementWindowFilters {
  range?: DateRanges;
  state?: string;
  start?: number;
  end?: number;
}
export interface SettlementWindowsState {
  settlementWindows: SettlementWindow[];
  settlementWindowsError: ErrorMessage;
  isSettlementWindowsPending: boolean;
  selectedSettlementWindow?: SettlementWindow;
  filters: SettlementWindowFilters;
  selectedSettlementModel: string | undefined;
  checkedSettlementWindows: SettlementWindow[];
  isSettlementWindowModalVisible: boolean;
  isCloseSettlementWindowPending: boolean;
  isSettleSettlementWindowPending: boolean;
  settleSettlementWindowsError: ErrorMessage;
  settlingWindowsSettlementId: number | null;
  settlementModels: SettlementModel[];
  isSettlementModelsPending: boolean;
}

export type FilterValue = null | boolean | undefined | string | number;

export interface FilterNameValue {
  [name: string]: FilterValue;
}
