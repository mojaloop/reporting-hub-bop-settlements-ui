import { getDfsps } from 'App/DFSPs/selectors';
import { connect, ConnectedProps } from 'react-redux';
import { ReduxContext } from 'store';
import { State, Dispatch } from 'store/types';
import * as actions from '../actions';
import * as selectors from '../selectors';

const mapStateProps = (state: State) => ({
  dfsps: getDfsps(state),
  selectedSettlement: selectors.getSelectedSettlement(state),
});

const mapDispatchProps = (dispatch: Dispatch) => ({
  onModalCloseClick: () => dispatch(actions.selectSettlement(null)),
});

const settlementDetailsConnector = connect(mapStateProps, mapDispatchProps, null, {
  context: ReduxContext,
});

export type SettlementDetailsProps = ConnectedProps<typeof settlementDetailsConnector>;

export default settlementDetailsConnector;
