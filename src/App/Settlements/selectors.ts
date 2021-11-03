import { State } from 'store/types';

export const getSettlements = (state: State) => state.settlements.settlements;
export const getSettlementsError = (state: State) => state.settlements.settlementsError;
export const getIsSettlementsPending = (state: State) => state.settlements.isSettlementsPending;

export const getSettlementsFilters = (state: State) => state.settlements.filters;

export const getSelectedSettlement = (state: State) => state.settlements.selectedSettlement;
export const getSettlementDetails = (state: State) => state.settlements.settlementDetails;

export const getSettlementDetailsError = (state: State) => state.settlements.settlementDetailsError;
export const getIsSettlementDetailsPending = (state: State) =>
  state.settlements.isSettlementDetailsPending;
export const getFinalizeSettlementModalVisible = (state: State) =>
  state.settlements.showFinalizeSettlementModal;
export const getFinalizingSettlement = (state: State) => state.settlements.finalizingSettlement;
export const getFinalizingSettlementError = (state: State) =>
  state.settlements.finalizingSettlementError;
export const getSelectedSettlementDetail = (state: State) =>
  state.settlements.selectedSettlementDetail;
export const getSettlementDetailPositions = (state: State) =>
  state.settlements.settlementDetailPositions;
export const getSettlementDetailPositionsError = (state: State) =>
  state.settlements.settlementDetailPositionsError;
export const getIsSettlementDetailPositionsPending = (state: State) =>
  state.settlements.isSettlementDetailPositionsPending;
