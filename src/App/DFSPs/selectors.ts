import { State } from 'store/types';

export const getDfsps = (state: State) => state.dfsps.dfsps;
export const getDfspsError = (state: State) => state.dfsps.dfspsError;
export const getIsDfspsPending = (state: State) => state.dfsps.isDfspsPending;
