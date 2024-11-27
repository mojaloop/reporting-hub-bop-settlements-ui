import { State } from 'store/types';

// Getters for the SettlementWindows state
export const getSelectedSettlementWindow = (state: State) =>
  state.settlementWindows.selectedSettlementWindow;
export const getSettlementWindows = (state: State) => state.settlementWindows.settlementWindows;
export const getSettlementWindowsError = (state: State) =>
  state.settlementWindows.settlementWindowsError;
export const getIsSettlementWindowsPending = (state: State) =>
  state.settlementWindows.isSettlementWindowsPending;

export const getSettlementWindowsFilters = (state: State) => state.settlementWindows.filters;
export const getCheckedSettlementWindows = (state: State) =>
  state.settlementWindows.checkedSettlementWindows;
export const getIsSettlementWindowModalVisible = (state: State) =>
  state.settlementWindows.isSettlementWindowModalVisible;
export const getIsCloseSettlementWindowPending = (state: State) =>
  state.settlementWindows.isCloseSettlementWindowPending;
export const getIsSettleSettlementWindowPending = (state: State) =>
  state.settlementWindows.isSettleSettlementWindowPending;
export const getSettleSettlementWindowsError = (state: State) =>
  state.settlementWindows.settleSettlementWindowsError;
export const getSettlingWindowsSettlementId = (state: State) =>
  state.settlementWindows.settlingWindowsSettlementId;

export const getSelectedSettlementModel = (state: State) =>
  state.settlementWindows.selectedSettlementModel;
export const getSettlementModels = (state: State) => state.settlementWindows.settlementModels;
export const getIsSettlementModelsPending = (state: State) =>
  state.settlementWindows.isSettlementModelsPending;
