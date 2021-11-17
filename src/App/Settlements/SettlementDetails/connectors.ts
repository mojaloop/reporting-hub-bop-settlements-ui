import { getDfsps } from 'App/DFSPs/selectors';
import { connect, ConnectedProps } from 'react-redux';
import { ReduxContext } from 'store';
import { State, Dispatch } from 'store/types';
import * as actions from '../actions';
import * as selectors from '../selectors';
import { Settlement, SettlementDetail } from '../types';

const mapStateProps = (state: State) => ({
  dfsps: getDfsps(state),
  selectedSettlement: selectors.getSelectedSettlement(state) as Settlement,
  settlementDetails: selectors.getSettlementDetails(state),
  settlementDetailsError: selectors.getSettlementDetailsError(state),
  isSettlementDetailsPending: selectors.getIsSettlementDetailsPending(state),
  selectedSettlementDetail: selectors.getSelectedSettlementDetail(state),
});

const mapDispatchProps = (dispatch: Dispatch) => ({
  onSelectSettlementDetail: (item: SettlementDetail) =>
    dispatch(actions.selectSettlementDetail(item)),
  onModalCloseClick: () => dispatch(actions.closeSettlementDetailsModal()),
});

const settlementDetailsConnector = connect(mapStateProps, mapDispatchProps, null, {
  context: ReduxContext,
});

export type SettlementDetailsProps = ConnectedProps<typeof settlementDetailsConnector>;

export default settlementDetailsConnector;
