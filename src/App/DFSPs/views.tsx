import React, { FC } from 'react';
import { connect } from 'react-redux';
import { Spinner } from 'components';
import withMount from 'hocs';
import { State, Dispatch } from 'store/types';
import { ReduxContext } from 'store';
import * as actions from './actions';
import * as selectors from './selectors';

const mapStateProps = (state: State) => ({
  isDfspsPending: selectors.getIsDfspsPending(state),
  dfsps: selectors.getDfsps(state),
});

const mapDispatchProps = (dispatch: Dispatch) => ({
  onMount: () => dispatch(actions.requestDfsps()),
});

const dfspsConnector = connect(mapStateProps, mapDispatchProps, null, {
  context: ReduxContext,
});

interface DfspsProps {
  dfsps?: string;
  isDfspsPending: boolean;
}

const Dfsps: FC<DfspsProps> = ({ children, dfsps, isDfspsPending }) => {
  if (dfsps?.length === 0 || isDfspsPending) {
    return <Spinner center size={40} />;
  }
  return <>{children}</>;
};
export default dfspsConnector(withMount(Dfsps, 'onMount'));
