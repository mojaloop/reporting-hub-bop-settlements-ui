import { getDfsps } from 'App/DFSPs/selectors';
import { connect, ConnectedProps } from 'react-redux';
import { ReduxContext } from 'store';
import { State, Dispatch } from 'store/types';
import * as actions from '../actions';
import * as selectors from '../selectors';
import { SettlementDetail } from '../types';

const mapStateProps = (state: State) => ({
  dfsps: getDfsps(state),
  selectedSettlementDetail: selectors.getSelectedSettlementDetail(state) as SettlementDetail,
  settlementDetailPositions: selectors.getSettlementDetailPositions(state),
  settlementDetailPositionsError: selectors.getSettlementDetailPositionsError(state),
  isSettlementDetailPositionsPending: selectors.getIsSettlementDetailPositionsPending(state),
});

const mapDispatchProps = (dispatch: Dispatch) => ({
  onSelectSettlementDetail: (item: SettlementDetail) =>
    dispatch(actions.selectSettlementDetail(item)),
  onModalCloseClick: () => dispatch(actions.closeSettlementDetailPositionsModal()),
});

const settlementDetailPositionsConnector = connect(mapStateProps, mapDispatchProps, null, {
  context: ReduxContext,
});

export type SettlementDetailPositionsProps = ConnectedProps<
  typeof settlementDetailPositionsConnector
>;

export default settlementDetailPositionsConnector;
