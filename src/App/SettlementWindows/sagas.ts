import { strict as assert } from 'assert';
import api from 'utils/api';
import { PayloadAction } from '@reduxjs/toolkit';
import { all, call, put, select, takeLatest, delay } from 'redux-saga/effects';
import {
  REQUEST_SETTLEMENT_WINDOWS,
  SETTLE_SETTLEMENT_WINDOWS,
  CLOSE_SETTLEMENT_WINDOW_MODAL,
  REQUEST_CLOSE_SETTLEMENT_WINDOW,
  SELECT_SETTLEMENT_WINDOWS_FILTER_DATE_RANGE,
  SELECT_SETTLEMENT_WINDOWS_FILTER_DATE_VALUE,
  CLEAR_SETTLEMENT_WINDOWS_FILTER_DATE_RANGE,
  SET_SETTLEMENT_WINDOWS_FILTER_VALUE,
  CLEAR_SETTLEMENT_WINDOWS_FILTER_STATE,
  CLEAR_SETTLEMENT_WINDOWS_FILTERS,
  SettlementWindow,
  SettlementWindowStatus,
  SettlementStatus,
} from './types';
import {
  requestSettlementWindows,
  setSettlementWindows,
  setSettlementWindowsError,
  setCloseSettlementWindowFinished,
  setSettleSettlementWindowsError,
  setSettleSettlementWindowsFinished,
} from './actions';

import { getCheckedSettlementWindows, getSettlementWindowsFilters } from './selectors';
import * as helpers from './helpers';

function* fetchSettlementWindows() {
  try {
    // @ts-ignore
    const filters = yield select(getSettlementWindowsFilters);
    const params = helpers.buildFiltersParams(filters);

    // prettier-ignore
    const now = (new Date()).toISOString();
    // @ts-ignore
    const windows = (yield all(
      params.toDateTime > now && params.state === 'OPEN'
        ? [
            call(api.settlementWindows.read, {
              params,
            }),
            call(api.settlementWindows.read, {
              params: {
                state: SettlementWindowStatus.Open,
              },
            }),
          ]
        : [
            call(api.settlementWindows.read, {
              params,
            }),
          ],
    ))
      .map((resp: { data: any; status: number }) => {
        // Because when we call
        //   GET /v2/settlementWindows?fromDateTime=2021-06-29T23:00:00.000Z&toDateTime=2021-06-30T22:59:59.999Z
        // and there are no windows, central settlement returns
        //   400 Bad Request
        //   {
        //     "errorInformation": {
        //       "errorCode": "3100",
        //       "errorDescription": "Generic validation error - settlementWindow by filters: {fromDateTime:2021-06-29T23:00:00.000Z,toDateTime:2021-06-30T22:59:59.999Z} not found"
        //     }
        //   }
        // We translate this response to an empty array.
        // Source here:
        //   https://github.com/mojaloop/central-settlement/blob/45ecfe32d1039870aa9572e23747c24cd6d53c86/src/domain/settlementWindow/index.js#L75
        if (
          resp.status === 400 &&
          /Generic validation error.*not found/.test(resp.data?.errorInformation?.errorDescription)
        ) {
          return [];
        }
        if (resp.status === 403) {
          if (resp.data?.error?.message) {
            throw new Error(
              `Failed to retrieve settlement window data - ${JSON.stringify(
                resp.data?.error?.message,
              )}`,
            );
          }
        }
        assert(
          resp.status >= 200 && resp.status < 300,
          `Failed to retrieve settlement window data`,
        );
        return resp.data;
      })
      .flat()
      .reduce(
        (map: Map<number, SettlementWindow>, win: SettlementWindow) =>
          map.set(win.settlementWindowId, win),
        new Map<number, SettlementWindow>(),
      );
    yield put(setSettlementWindows([...windows.values()]));
  } catch (e) {
    console.error(e);
    yield put(setSettlementWindowsError(e.message));
  }
}

export function* FetchSettlementWindowsSaga(): Generator {
  yield takeLatest(
    [REQUEST_SETTLEMENT_WINDOWS, CLOSE_SETTLEMENT_WINDOW_MODAL],
    fetchSettlementWindows,
  );
}

function* fetchSettlementWindowsAfterFiltersChange(action: PayloadAction) {
  // we try to set a delay for when the user is typing
  if (action.payload !== undefined) {
    yield delay(500);
  }
  yield put(requestSettlementWindows());
}

export function* FetchSettlementWindowsAfterFiltersChangeSaga(): Generator {
  yield takeLatest(
    [
      SELECT_SETTLEMENT_WINDOWS_FILTER_DATE_RANGE,
      SELECT_SETTLEMENT_WINDOWS_FILTER_DATE_VALUE,
      CLEAR_SETTLEMENT_WINDOWS_FILTER_DATE_RANGE,
      SET_SETTLEMENT_WINDOWS_FILTER_VALUE,
      CLEAR_SETTLEMENT_WINDOWS_FILTER_STATE,
      CLEAR_SETTLEMENT_WINDOWS_FILTERS,
    ],
    fetchSettlementWindowsAfterFiltersChange,
  );
}

function* settleWindows() {
  try {
    const windows: SettlementWindow[] = yield select(getCheckedSettlementWindows);
    // @ts-ignore
    const settlementResponse = yield call(api.settleSettlementWindows.create, {
      body: {
        // TODO: settlementModel must be parametrised
        settlementModel: 'DEFERREDNET',
        reason: 'Business Operations Portal request',
        settlementWindows: windows.map((w) => ({ id: w.settlementWindowId })),
      },
    });
    if (settlementResponse.status === 403) {
      if (settlementResponse.data?.error?.message) {
        throw new Error(
          `Failed to retrieve settlement window data - ${JSON.stringify(
            settlementResponse.data?.error?.message,
          )}`,
        );
      }
    }
    assert.equal(settlementResponse.status, 200, 'Unable to settle settlement window');
    const settlement = settlementResponse.data;
    // @ts-ignore
    const settlementRecordedResult = yield call(
      api.settlement.update,
      helpers.buildUpdateSettlementStateRequest(settlement, SettlementStatus.PsTransfersRecorded),
    );
    assert.strictEqual(
      settlementRecordedResult.status,
      200,
      `Mojaloop API error when advancing settlement state to PS_TRANSFERS_RECORDED: ${settlementRecordedResult.data}`,
    );

    // @ts-ignore
    const settlementReservedResult = yield call(
      api.settlement.update,
      helpers.buildUpdateSettlementStateRequest(settlement, SettlementStatus.PsTransfersReserved),
    );
    assert.strictEqual(
      settlementReservedResult.status,
      200,
      `Mojaloop API error when advancing settlement state to PS_TRANSFERS_RESERVED: ${settlementReservedResult.data}`,
    );

    yield put(setSettleSettlementWindowsFinished(settlementResponse.id));
  } catch (e) {
    console.error(e);
    yield put(setSettleSettlementWindowsError(e.message));
  }
}

export function* SettleSettlementWindowsSaga(): Generator {
  yield takeLatest(SETTLE_SETTLEMENT_WINDOWS, settleWindows);
}

function* closeSettlementWindow(action: PayloadAction<SettlementWindow>) {
  try {
    // This is obviously not a create. Obviously, it *should* be an update, but the central
    // settlement API is a bit funky in this regard.
    // https://github.com/mojaloop/central-settlement/blob/e3c8cf8fc61543d1ab70880765ced23a9e98cb25/src/interface/swagger.json#L96
    // @ts-ignore
    const response = yield call(api.closeSettlementWindow.create, {
      settlementWindowId: action.payload.settlementWindowId,
      body: {
        state: 'CLOSED',
        reason: 'Business operations portal request',
      },
    });

    if (response.status === 403) {
      if (response.data?.error?.message) {
        throw new Error(
          `Failed to retrieve settlement window data - ${JSON.stringify(
            response.data?.error?.message,
          )}`,
        );
      }
    }

    if (response.status !== 200) {
      const info = response.data.errorInformation;
      const msg = !info ? '' : ` due to error ${info.errorCode}: "${info.errorDescription}"`;
      throw new Error(`Unable to Close Window${msg}`);
    }

    yield put(setCloseSettlementWindowFinished());
    yield put(requestSettlementWindows());
  } catch (e) {
    console.error(e);
    yield put(setSettlementWindowsError(e.message));
  }
}

export function* CloseSettlementWindowsSaga(): Generator {
  yield takeLatest(REQUEST_CLOSE_SETTLEMENT_WINDOW, closeSettlementWindow);
}

export default function* rootSaga(): Generator {
  yield all([
    FetchSettlementWindowsSaga(),
    SettleSettlementWindowsSaga(),
    CloseSettlementWindowsSaga(),
    FetchSettlementWindowsAfterFiltersChangeSaga(),
  ]);
}
