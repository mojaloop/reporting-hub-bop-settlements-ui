import { all } from 'redux-saga/effects';
import settlementWindowSagas from './SettlementWindows/sagas';
import settlementSagas from './Settlements/sagas';
import dfspSagas from './DFSPs/sagas';

function* rootSaga(): Generator {
  yield all([dfspSagas(), settlementSagas(), settlementWindowSagas()]);
}

export default rootSaga;
