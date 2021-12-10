import { connect, ConnectedProps } from 'react-redux';
import { State, Dispatch } from 'store/types';
import { ReduxContext } from 'store';
import * as selectors from './selectors';
import * as actions from './actions';
import { Settlement, DateRanges, FilterValue } from './types';

const mapStateProps = (state: State) => ({
  selectedSettlement: selectors.getSelectedSettlement(state),
  settlements: selectors.getSettlements(state),
  settlementsError: selectors.getSettlementsError(state),
  showFinalizeSettlementModal: selectors.getFinalizeSettlementModalVisible(state),
  finalizingSettlement: selectors.getFinalizingSettlement(state),
  isSettlementsPending: selectors.getIsSettlementsPending(state),
  filters: selectors.getSettlementsFilters(state),
});

const mapDispatchProps = (dispatch: Dispatch) => ({
  onMount: () => dispatch(actions.requestSettlements()),

  onFinalizeButtonClick: (settlement: Settlement) => {
    dispatch(actions.setFinalizingSettlement(settlement));
    dispatch(actions.showFinalizeSettlementModal());
  },
  onDateRangerFilterSelect: (payload: DateRanges) =>
    dispatch(actions.selectSettlementsFilterDateRange(payload)),
  onDateFilterClearClick: () => dispatch(actions.clearSettlementsFilterDateRange()),
  onStateFilterClearClick: () => dispatch(actions.clearSettlementsFilterState()),
  onStartDateRangeFilterSelect: (payload: number) =>
    dispatch(actions.selectSettlementsFilterDateValue({ type: 'start', value: payload })),
  onEndDateRangeFilterSelect: (payload: number) =>
    dispatch(actions.selectSettlementsFilterDateValue({ type: 'end', value: payload })),
  onFilterValueChange: (filter: string, value: FilterValue) =>
    dispatch(actions.setSettlementsFilterValue({ filter, value })),
  onClearFiltersClick: () => dispatch(actions.clearSettlementsFilters()),
  onSettlementSelect: (settlement: Settlement) => dispatch(actions.selectSettlement(settlement)),
});

const settlementsConnector = connect(mapStateProps, mapDispatchProps, null, {
  context: ReduxContext,
});

export type SettlementsProps = ConnectedProps<typeof settlementsConnector>;

export default settlementsConnector;
