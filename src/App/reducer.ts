import { combineReducers } from 'redux';
import { reducer as config } from './Config';
import settlementWindowsReducer from './SettlementWindows/reducer';
import settlementsReducer from './Settlements/reducer';
import dfspsReducer from './DFSPs/reducer';

export const reducers = {
  config,
  settlementWindows: settlementWindowsReducer,
  settlements: settlementsReducer,
  dfsps: dfspsReducer,
};

export default combineReducers(reducers);
