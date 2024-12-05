import api from 'utils/api';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { LedgerParticipant } from 'App/Settlements/types';
import { DFSP, REQUEST_DFSPS } from './types';
import { setDfsps, setDfspsError } from './actions';

function* fetchDfsps() {
  try {
    // @ts-ignore
    const response = yield call(api.participants.read, {});
    const participants: LedgerParticipant[] = response.data;
    const dfsps: DFSP[] = participants.map((participant) => ({
      id: Number(participant.id),
      name: participant.name,
    }));
    yield put(setDfsps(dfsps));
  } catch (e) {
    yield put(setDfspsError(e.message));
  }
}

export function* FetchDfspsSaga(): Generator {
  yield takeLatest(REQUEST_DFSPS, fetchDfsps);
}

export default function* rootSaga(): Generator {
  yield all([FetchDfspsSaga()]);
}
