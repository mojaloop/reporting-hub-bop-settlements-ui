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
export const getFinalizeProcessFundsInOut = (state: State) =>
  state.settlements.finalizeProcessFundsInOut;
export const getFinalizeProcessNdcIncreases = (state: State) =>
  state.settlements.finalizeProcessNdcIncreases;
export const getFinalizeProcessNdcDecreases = (state: State) =>
  state.settlements.finalizeProcessNdcDecreases;
export const getSettlementFinalizingInProgress = (state: State) =>
  state.settlements.settlementFinalizingInProgress;
export const getSettlementAdjustments = (state: State) => state.settlements.settlementAdjustments;
export const getSettlementReportValidationWarnings = (state: State) =>
  state.settlements.settlementReportValidationWarnings;
export const getSettlementReportValidationErrors = (state: State) =>
  state.settlements.settlementReportValidationErrors;
export const getSettlementReportValidationInProgress = (state: State) =>
  state.settlements.settlementReportValidationInProgress;
