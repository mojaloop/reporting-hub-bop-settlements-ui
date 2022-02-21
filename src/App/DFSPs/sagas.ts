import api from 'utils/api';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { REQUEST_DFSPS } from './types';
import { setDfsps, setDfspsError } from './actions';

function* fetchDfsps() {
  try {
    // @ts-ignore
    const response = yield call(api.dfsps.create, {
      body: {
        operationName: null,
        query: '{\n  dfsps {\n    id\n    name\n  }\n}\n',
        variables: {},
      },
    });
    yield put(setDfsps(response.data.data.dfsps));
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
