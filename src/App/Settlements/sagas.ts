/* eslint-disable no-continue */
import { strict as assert } from 'assert';
import { PayloadAction } from '@reduxjs/toolkit';
import api from 'utils/api';
import { all, call, put, select, takeLatest, delay } from 'redux-saga/effects';
import utilId from 'utils/id';
import {
  AccountId,
  AccountWithPosition,
  Adjustment,
  CLEAR_SETTLEMENTS_FILTER_DATE_RANGE,
  CLEAR_SETTLEMENTS_FILTERS,
  CLEAR_SETTLEMENTS_FILTER_STATE,
  FINALIZE_SETTLEMENT,
  FinalizeSettlementError,
  FinalizeSettlementErrorKind,
  FinalizeSettlementProcessAdjustmentsError,
  FinalizeSettlementProcessAdjustmentsErrorKind,
  FspName,
  LedgerAccount,
  LedgerParticipant,
  REQUEST_SETTLEMENTS,
  SELECT_SETTLEMENTS_FILTER_DATE_RANGE,
  SELECT_SETTLEMENTS_FILTER_DATE_VALUE,
  SET_SETTLEMENTS_FILTER_VALUE,
  Settlement,
  SettlementParticipant,
  SettlementParticipantAccount,
  SettlementStatus,
} from './types';
import {
  setFinalizeSettlementError,
  setSettlementFinalizingInProgress,
  setFinalizingSettlement,
  setSettlements,
  setSettlementsError,
  requestSettlements,
} from './actions';
import { getSettlementsFilters } from './selectors';
import {
  ApiResponse,
  buildFiltersParams,
  buildUpdateSettlementStateRequest,
  mapApiToModel,
  SettlementFinalizeData,
  finalizeDataUtils,
  // validateReport,
} from './helpers';

const generateUlid =
  utilId({ type: 'ulid' }) ||
  (() => {
    throw new Error('generateUlid is undefined');
  });

class FinalizeSettlementAssertionError extends Error {
  data: FinalizeSettlementError;

  constructor(data: FinalizeSettlementError) {
    super();
    this.data = data;
  }
}

// TODO: the processAdjustments function has grown incrementally and could do to be broken apart,
// or modeled completely differently.
function* processAdjustments({
  settlement,
  adjustments,
  newState,
}: {
  settlement: Settlement;
  adjustments: Adjustment[];
  newState: SettlementStatus;
}) {
  // TODO:
  // We ideally wouldn't serialize these requests. Unfortunately, when we simultaneously process
  // NDC updates for multiple FSPs, sometimes we receive the following error from the central
  // ledger service:
  // {
  //   "errorInformation": {
  //     "errorCode": "2001",
  //     "errorDescription": "Internal server error - update `participantLimit` set `isActive` = 0 where `participantLimitId` = 143 - ER_LOCK_DEADLOCK: Deadlock found when trying to get lock; try restarting transaction"
  //   }
  // }
  // This could be reproduced in isolation, e.g. by creating a script to attempt to process
  // multiple NDC updates in parallel.
  // One partial resolution to this problem might be to process the NDC updates serially and
  // perform all other processing concurrently. At the time of writing, modifying the following
  // (working) code to do so was not considered a priority.

  // @ts-ignore
  const results: FinalizeSettlementProcessAdjustmentsError[] = [];
  for (let i = 0; i < adjustments.length; i++) {
    const adjustment = adjustments[i];
    const stateOrder = [
      SettlementStatus.Aborted,
      SettlementStatus.PendingSettlement,
      SettlementStatus.PsTransfersRecorded,
      SettlementStatus.PsTransfersReserved,
      SettlementStatus.PsTransfersCommitted,
      SettlementStatus.Settling,
      SettlementStatus.Settled,
    ];
    const currentState = adjustment.settlementParticipantAccount.state;
    const statePosition = stateOrder.indexOf(currentState);
    const newStatePosition = stateOrder.indexOf(newState);
    assert(
      statePosition !== -1 && newStatePosition !== -1,
      `Runtime error determining relative order of settlement participant account states ${newState}, ${currentState}`,
    );
    // If the settlement account state is already past the target state, then we'll do nothing
    // and exit here.
    if (statePosition >= newStatePosition) {
      continue;
    }

    const description = `Business Operations Portal settlement ID ${settlement.id} finalization report processing`;
    // We can't make a transfer of zero amount, so we have nothing to do. In this case, we can
    // update the settlement participant account state and skip the remaining steps.
    if (adjustment.amount === 0) {
      // Set the settlement participant account to the new state
      const request = {
        settlementId: settlement.id,
        participantId: adjustment.settlementParticipant.id,
        accountId: adjustment.settlementParticipantAccount.id,
        body: {
          state: newState,
          reason: description,
        },
      };
      // @ts-ignore
      const spaResult = yield call(api.settlementParticipantAccount.update, request);
      if (spaResult.status !== 200) {
        results.push({
          type: FinalizeSettlementProcessAdjustmentsErrorKind.SETTLEMENT_PARTICIPANT_ACCOUNT_UPDATE_FAILED,
          value: {
            adjustment,
            error: spaResult.data,
            request,
          },
        });
        continue;
      }
      continue;
    }

    if (adjustment.amount > 0) {
      // Make the call to process funds in, then poll the balance until it's reduced
      const request = {
        participantName: adjustment.participant.name,
        accountId: adjustment.settlementAccount.id,
        body: {
          action: 'recordFundsIn',
          externalReference: `BOP settlement ID ${settlement.id}`,
          reason: description,
          amount: {
            amount: Math.abs(adjustment.amount),
            // TODO: I think the transfer fails if currency is missing, but it is advertised as
            // optional in the spec: https://github.com/mojaloop/central-ledger/blob/f0268fe56c76cc73f254d794ad09eb50569d5b58/src/api/interface/swagger.json#L1428
            currency: adjustment.settlementAccount.currency,
          },
          transferId: generateUlid(),
        },
      };
      const fundsInResult: ApiResponse = yield call(api.participantAccount.create, request);
      if (fundsInResult.status !== 202) {
        results.push({
          type: FinalizeSettlementProcessAdjustmentsErrorKind.FUNDS_PROCESSING_FAILED,
          value: {
            adjustment,
            error: fundsInResult.data,
            request,
          },
        });
        continue;
      }
    } else {
      // Make the call to process funds out, then poll the balance until it's reduced
      const transferId = generateUlid();
      const fundsOutPrepareReserveRequest = {
        participantName: adjustment.participant.name,
        accountId: adjustment.settlementAccount.id,
        body: {
          action: 'recordFundsOutPrepareReserve',
          externalReference: `BOP settlement ID ${settlement.id}`,
          reason: description,
          amount: {
            amount: Math.abs(adjustment.amount),
            currency: adjustment.settlementAccount.currency,
          },
          transferId,
        },
      };
      const fundsOutPrepareReserveResult: ApiResponse = yield call(
        api.participantAccount.create,
        fundsOutPrepareReserveRequest,
      );
      if (fundsOutPrepareReserveResult.status !== 202) {
        results.push({
          type: FinalizeSettlementProcessAdjustmentsErrorKind.FUNDS_PROCESSING_FAILED,
          value: {
            adjustment,
            error: fundsOutPrepareReserveResult.data,
            request: fundsOutPrepareReserveRequest,
          },
        });
        continue;
      }
      const fundsOutCommitRequest = {
        participantName: adjustment.participant.name,
        accountId: adjustment.settlementAccount.id,
        transferId,
        body: {
          action: 'recordFundsOutCommit',
          reason: description,
        },
      };
      const fundsOutCommitResult: ApiResponse = yield call(
        api.participantAccountTransfer.update,
        fundsOutCommitRequest,
      );
      if (fundsOutCommitResult.status !== 202) {
        results.push({
          type: FinalizeSettlementProcessAdjustmentsErrorKind.FUNDS_PROCESSING_FAILED,
          value: {
            adjustment,
            error: fundsOutCommitResult.data,
            request: fundsOutCommitRequest,
          },
        });
        continue;
      }
    }

    // Poll for a while to confirm the new balance
    const POLL_ATTEMPTS = 5;
    // const expectedAccountBalance = Math.max(0, adjustment.settlementBankBalance);
    for (let j = 0; j < POLL_ATTEMPTS; j++) {
      const SECONDS = 1000;
      yield delay(2 * SECONDS);
      const newBalanceResult: ApiResponse = yield call(api.participantAccounts.read, {
        participantName: adjustment.participant.name,
      });

      // If the call fails, we'll just try again- so don't handle a failure status code
      const newBalance = newBalanceResult?.data?.find(
        (acc: AccountWithPosition) => acc.id === adjustment.settlementAccount.id,
      )?.value;

      // Check if balance is changed since last GET
      if (newBalanceResult.status === 200 && newBalance !== adjustment.settlementAccount.value) {
        const switchBalance = -adjustment.settlementAccount.value;
        const expectedAccountBalance = switchBalance + adjustment.amount;
        // We use "negative" newBalance because the switch returns a negative value for credit
        // balances. The switch doesn't have a concept of debit balances for settlement
        // accounts.
        if (-newBalance !== expectedAccountBalance) {
          results.push({
            type: FinalizeSettlementProcessAdjustmentsErrorKind.BALANCE_INCORRECT,
            value: {
              adjustment,
            },
          });
          break;
        }
        const request = {
          settlementId: settlement.id,
          participantId: adjustment.settlementParticipant.id,
          accountId: adjustment.settlementParticipantAccount.id,
          body: {
            state: newState,
            reason: description,
          },
        };
        // Set the settlement participant account to the new state
        // @ts-ignore
        const spaResult = yield call(api.settlementParticipantAccount.update, request);
        if (spaResult.status !== 200) {
          results.push({
            type: FinalizeSettlementProcessAdjustmentsErrorKind.SETTLEMENT_PARTICIPANT_ACCOUNT_UPDATE_FAILED,
            value: {
              adjustment,
              error: spaResult.data,
              request,
            },
          });
          break;
        }
        break;
      }
      const wasLastAttempt = j + 1 === POLL_ATTEMPTS;
      if (wasLastAttempt) {
        results.push({
          type: FinalizeSettlementProcessAdjustmentsErrorKind.BALANCE_UNCHANGED,
          value: {
            adjustment,
          },
        });
      }
    }
  }
  return results;
}

function* collectSettlementFinalizeData(settlement: Settlement) {
  // TODO: parallelize requests in this function. Probably by throwing the function out entirely
  // and using an async version with Promise.all. That lets us reuse the code elsewhere, and means
  // we don't have to put up with the limitations of redux-saga.
  // Why get limits? We need to get limits before we can set limits, because `alarmPercentage` is a
  // required field when we set a limit, and we don't want to change that here.
  const {
    transformParticipantsLimits,
    ensureResponse,
    getParticipantsAccounts,
    getAccountsParticipants,
    getSettlementParticipantAccounts,
    getSettlementParticipants,
    getAccountsPositions,
  } = finalizeDataUtils;
  const participantsLimits = transformParticipantsLimits(
    ensureResponse(
      yield call(api.participantsLimits.read, {}),
      200,
      'Failed to retrieve participants limits',
    ),
  );

  const switchParticipants = ensureResponse(
    yield call(api.participants.read, {}),
    200,
    'Failed to retrieve participants',
  );
  const participantsAccounts = getParticipantsAccounts(switchParticipants);
  const accountsParticipants = getAccountsParticipants(switchParticipants);

  // Get the participants current positions such that we can determine which will decrease and
  // which will increase
  const accountsPositions: Map<AccountId, AccountWithPosition> = getAccountsPositions(
    // @ts-ignore
    (yield all(
      settlement.participants.flatMap((participant) =>
        participant.accounts.map(function* getParticipantAccount(account) {
          const participantName = accountsParticipants.get(account.id)?.participant.name;
          assert(participantName, `Couldn't find participant for account ${account.id}`);
          const result = yield call(api.participantAccounts.read, { participantName });
          return [participantName, result];
        }),
      ),
    )).flatMap(([participantName, result]: [FspName, ApiResponse]) =>
      ensureResponse(result, 200, `Failed to retrieve accounts for participant ${participantName}`),
    ),
  );

  const settlementParticipantAccounts = getSettlementParticipantAccounts(settlement.participants);

  const settlementParticipants = getSettlementParticipants(settlement.participants);

  return {
    settlement,
    participantsLimits,
    accountsParticipants,
    participantsAccounts,
    accountsPositions,
    settlementParticipantAccounts,
    settlementParticipants,
  };
}

function buildAdjustments({
  settlement,
  participantsLimits,
  accountsParticipants,
  participantsAccounts,
  accountsPositions,
  settlementParticipantAccounts,
  settlementParticipants,
}: SettlementFinalizeData): Adjustment[] {
  let adjustments: Adjustment[] = [];
  settlement.participants.forEach((part) => {
    const participantAdjustments: Adjustment[] = [];
    part.accounts.forEach((account) => {
      const accountId = account.id;
      const accountParticipant = accountsParticipants.get(accountId);
      assert(
        accountParticipant !== undefined,
        `Failed to retrieve participant for account ${accountId}`,
      );
      const { participant } = accountParticipant;
      const positionAccount = accountsPositions.get(accountId);
      assert(positionAccount !== undefined, `Failed to retrieve position for account ${accountId}`);
      const { currency } = positionAccount;
      const currentLimit = participantsLimits.get(participant.name)?.get(currency);
      assert(
        currentLimit !== undefined,
        `Failed to retrieve limit for participant ${participant.name} currency ${currency}`,
      );
      const settlementAccountId = participantsAccounts
        .get(participant.name)
        ?.get(currency)
        ?.get('SETTLEMENT')?.account?.id;
      assert(
        settlementAccountId,
        `Failed to retrieve ${currency} settlement account for ${participant.name}`,
      );
      const settlementAccount = accountsPositions.get(settlementAccountId);
      assert(
        settlementAccount,
        `Failed to retrieve ${currency} settlement account for ${participant.name}`,
      );
      assert(
        settlementAccount.currency === positionAccount.currency,
        `Unexpected data validation error: position account and settlement account currencies are not equal for ${participant.name}. This is most likely a bug.`,
      );
      // We use the negative settlement account balance because the switch presents a credit
      // balance as a negative.
      const switchBalance = -settlementAccount.value;
      assert(
        switchBalance !== undefined,
        `Failed to retrieve position for account ${settlementAccountId}`,
      );

      const settlementParticipantAccount = settlementParticipantAccounts.get(accountId);
      assert(
        settlementParticipantAccount !== undefined,
        `Failed to retrieve settlement participant account for account ${accountId}`,
      );

      const settlementParticipant = settlementParticipants.get(settlementParticipantAccount.id);
      assert(
        settlementParticipant !== undefined,
        `Failed to retrieve settlement participant for account ${accountId}`,
      );

      // Play around with amount and settlementBankBalance to observe what happens in the switch
      const amount = -account.netSettlementAmount.amount;
      participantAdjustments.push({
        participant,
        amount,
        positionAccount,
        settlementAccount,
        currentLimit,
        settlementParticipantAccount,
        settlementParticipant,
      });
    });
    const newAdjustments = adjustments.concat(participantAdjustments);
    adjustments = newAdjustments;
  });
  return adjustments;
}

function* finalizeSettlement(action: PayloadAction<Settlement>) {
  // TODO: timeout
  const settlement = action.payload;
  const finalizeData: SettlementFinalizeData = yield call(
    collectSettlementFinalizeData,
    settlement,
  );
  const adjustments = buildAdjustments(finalizeData);
  const [debits, credits] = adjustments.reduce(
    ([dr, cr], adj) =>
      adj.settlementParticipantAccount.netSettlementAmount.amount < 0
        ? [[...dr, adj], cr]
        : [dr, [...cr, adj]],
    [[], []],
  );
  try {
    // Process in this order:
    // 0. ensure all settlement participant accounts are in PS_TRANSFERS_RESERVED
    // 1. apply the new debit NDCs
    // 2. process the debit funds out, reducing the debtors liquidity account balances
    // 3. process the credit funds in, increasing the creditors liquidity account balances
    // 4. progress the settlement state to PS_TRANSFERS_COMMITTED, this will modify the creditors
    //    positions by the corresponding net settlement amounts
    // 5. apply the new credit NDCs
    // Because (2) and (4) do not have any effect on the ability of a participant to make transfers
    // but (1) and (5) reduce the switch's exposure to unfunded transfers and (3) and (6) increase the
    // switch's exposure to unfunded transfers, if a partial failure of this process occurs,
    // processing in this order means we're least likely to leave the switch in a risky state.
    // @ts-ignore
    const participantsResult = yield call(api.participants.read, {});
    const participants: LedgerParticipant[] = participantsResult.data;
    const accountParticipantMap: Map<LedgerAccount['id'], LedgerParticipant> = new Map(
      participants
        .filter((p: LedgerParticipant) => p.name !== 'Hub' && p.name !== 'hub')
        .flatMap((p: LedgerParticipant) => p.accounts.map(({ id }) => [id, p])),
    );

    // Ensure we have participant info for every account in our settlement. This ensures the
    // result of accountParticipantsMap.get will not be undefined for any of our accounts. It
    // lets us safely use accountParticipantsMap.get without checking the result.
    assert(
      settlement.participants
        .flatMap((p: SettlementParticipant) => p.accounts)
        .every((a: SettlementParticipantAccount) => accountParticipantMap.has(a.id)),
      'Expected every account id present in settlement to be returned by GET /participants',
    );

    switch (settlement.state) {
      case SettlementStatus.PendingSettlement: {
        yield put(
          setFinalizingSettlement({
            ...settlement,
            state: SettlementStatus.PendingSettlement,
          }),
        );
        // @ts-ignore
        const result = yield call(
          api.settlement.update,
          buildUpdateSettlementStateRequest(settlement, SettlementStatus.PsTransfersRecorded),
        );
        assert.strictEqual(
          result.status,
          200,
          new FinalizeSettlementAssertionError({
            type: FinalizeSettlementErrorKind.SET_SETTLEMENT_PS_TRANSFERS_RECORDED,
            value: result.data,
          }),
        );
      }
      // eslint-ignore-next-line: no-fallthrough
      case SettlementStatus.PsTransfersRecorded: {
        yield put(
          setFinalizingSettlement({
            ...settlement,
            state: SettlementStatus.PsTransfersRecorded,
          }),
        );
        // @ts-ignore
        const result = yield call(
          api.settlement.update,
          buildUpdateSettlementStateRequest(settlement, SettlementStatus.PsTransfersReserved),
        );
        assert.strictEqual(
          result.status,
          200,
          new FinalizeSettlementAssertionError({
            type: FinalizeSettlementErrorKind.SET_SETTLEMENT_PS_TRANSFERS_RESERVED,
            value: result.data,
          }),
        );
      }
      // eslint-ignore-next-line: no-fallthrough
      case SettlementStatus.PsTransfersReserved: {
        const debtorsErrors: FinalizeSettlementProcessAdjustmentsError[] = yield call(
          processAdjustments,
          {
            settlement,
            adjustments: [...debits.values()],
            newState: SettlementStatus.PsTransfersCommitted,
          },
        );

        assert(
          debtorsErrors.length === 0,
          new FinalizeSettlementAssertionError({
            type: FinalizeSettlementErrorKind.PROCESS_ADJUSTMENTS,
            value: debtorsErrors,
          }),
        );

        const creditorsErrors: FinalizeSettlementProcessAdjustmentsError[] = yield call(
          processAdjustments,
          {
            settlement,
            adjustments: [...credits.values()],
            newState: SettlementStatus.PsTransfersCommitted,
          },
        );

        assert(
          creditorsErrors.length === 0,
          new FinalizeSettlementAssertionError({
            type: FinalizeSettlementErrorKind.PROCESS_ADJUSTMENTS,
            value: creditorsErrors,
          }),
        );

        const newSettlement: { status: number; data: Omit<Settlement, 'totalValue'> } = yield call(
          api.settlement.read,
          {
            settlementId: settlement.id,
          },
        );
        assert.strictEqual(newSettlement.status, 200, `Failed to retrieve settlement state`);

        const unprocessedStates: SettlementStatus[] = [
          SettlementStatus.PendingSettlement,
          SettlementStatus.PsTransfersRecorded,
          SettlementStatus.PsTransfersReserved,
        ];
        const requests = newSettlement.data.participants.flatMap((p) =>
          p.accounts
            .filter((a) => unprocessedStates.includes(a.state))
            .filter((a) => a.netSettlementAmount.amount === 0)
            .map((a: SettlementParticipantAccount) => ({
              request: {
                settlementId: settlement.id,
                participantId: p.id,
                accountId: a.id,
                body: {
                  state: SettlementStatus.Settled,
                  reason: `Business operations portal settlement ${settlement.id} finalization report processing`,
                },
              },
              account: a,
            })),
        );
        const accountSettlementResults: { status: number; data: any }[] = yield all(
          requests.map((r) => call(api.settlementParticipantAccount.update, r.request)),
        );
        const requestResultZip = accountSettlementResults.map((res, i) => ({
          req: requests[i],
          res,
        }));
        const accountSettlementErrors = requestResultZip
          .filter(({ res }) => res.status !== 200)
          .map(({ req, res }) => {
            return {
              participant: <LedgerParticipant>accountParticipantMap.get(req.account.id),
              apiResponse: res.data.errorInformation,
              account: req.account,
            };
          });
        assert.strictEqual(
          accountSettlementErrors.length,
          0,
          new FinalizeSettlementAssertionError({
            type: FinalizeSettlementErrorKind.SET_SETTLEMENT_PS_TRANSFERS_COMMITTED,
            value: accountSettlementErrors,
          }),
        );

        // These are accounts that are in an "unprocessed" state, i.e. their state is before
        // PS_TRANSFERS_COMMITTED and they have a non-zero net settlement amount.
        const unprocessableAccounts = newSettlement.data.participants.flatMap((p) =>
          p.accounts
            .filter((a) => unprocessedStates.includes(a.state))
            .filter((a) => a.netSettlementAmount.amount !== 0),
        );

        if (unprocessableAccounts.length > 0) {
          // TODO: need to tell the user something
          yield put(setSettlementFinalizingInProgress(false));
          return;
        }
      }
      // eslint-ignore-next-line: no-fallthrough
      case SettlementStatus.PsTransfersCommitted:
      // We could transition to PS_TRANSFERS_COMMITTED, but then we'd immediately transition to
      // SETTLING anyway, so we do nothing here.
      // eslint-ignore-next-line: no-fallthrough
      case SettlementStatus.Settling: {
        yield put(
          setFinalizingSettlement({
            ...settlement,
            state: SettlementStatus.Settling,
          }),
        );

        const requests = settlement.participants.flatMap((p: SettlementParticipant) =>
          p.accounts
            .filter((a: SettlementParticipantAccount) => a.state !== SettlementStatus.Settled)
            .map((a: SettlementParticipantAccount) => ({
              request: {
                settlementId: settlement.id,
                participantId: p.id,
                accountId: a.id,
                body: {
                  state: SettlementStatus.Settled,
                  reason: `Business operations portal settlement ${settlement.id} finalization report processing`,
                },
              },
              account: a,
            })),
        );
        const accountSettlementResults: { status: number; data: any }[] = yield all(
          requests.map((r) => call(api.settlementParticipantAccount.update, r.request)),
        );
        const requestResultZip = accountSettlementResults.map((res, i) => ({
          req: requests[i],
          res,
        }));
        const accountSettlementErrors = requestResultZip
          .filter(({ res }) => res.status !== 200)
          .map(({ req, res }) => {
            return {
              participant: <LedgerParticipant>accountParticipantMap.get(req.account.id),
              apiResponse: res.data.errorInformation,
              account: req.account,
            };
          });
        assert.strictEqual(
          accountSettlementErrors.length,
          0,
          new FinalizeSettlementAssertionError({
            type: FinalizeSettlementErrorKind.SETTLE_ACCOUNTS,
            value: accountSettlementErrors,
          }),
        );

        let result: { data: Settlement; status: number } = yield call(api.settlement.read, {
          settlementId: settlement.id,
        });
        // TODO: this can fail, there should be a retry limit. In fact, should we be polling? Does
        // the settlement state not change immediately?
        while (result.data.state !== SettlementStatus.Settled) {
          yield delay(5000);
          result = yield call(api.settlement.read, { settlementId: settlement.id });
        }
      }
      // eslint-ignore-next-line: no-fallthrough
      case SettlementStatus.Settled:
        yield put(
          setFinalizingSettlement({
            ...settlement,
            state: SettlementStatus.Settled,
          }),
        );
        break;
      case SettlementStatus.Aborted:
        throw new FinalizeSettlementAssertionError({
          type: FinalizeSettlementErrorKind.ABORTED_SETTLEMENT,
        });
      default: {
        // Did you get a compile error here? This code is written such that if every
        // case in the above switch state is not handled, compilation will fail.
        const exhaustiveCheck: never = settlement.state;
        throw new Error(`Unhandled settlement status: ${exhaustiveCheck}`);
      }
    }
    yield put(setSettlementFinalizingInProgress(false));
  } catch (err) {
    console.error(err);
    yield put(setSettlementFinalizingInProgress(false));
    if (!(err instanceof FinalizeSettlementAssertionError)) {
      throw err;
    }
    yield put(setFinalizeSettlementError(err.data));
  }
}

export function* FinalizeSettlementSaga(): Generator {
  yield takeLatest(FINALIZE_SETTLEMENT, finalizeSettlement);
}

function* fetchSettlements() {
  try {
    // @ts-ignore
    const filters = yield select(getSettlementsFilters);
    const params = buildFiltersParams(filters);
    // @ts-ignore
    const response = yield call(api.settlements.read, {
      params,
    });
    // Because when we call
    //   GET /v2/settlements?state=PS_TRANSFERS_RECORDED
    // and there are no settlements, central settlement returns
    //   400 Bad Request
    //   {
    //     "errorInformation": {
    //       "errorCode": "3100",
    //       "errorDescription": "Generic validation error - Settlements not found"
    //     }
    //   }
    // We translate this response to an empty array.
    // Source here:
    //   https://github.com/mojaloop/central-settlement/blob/45ecfe32d1039870aa9572e23747c24cd6d53c86/src/domain/settlement/index.js#L218
    if (
      response.status === 400 &&
      /Generic validation error.*not found/.test(response.data?.errorInformation?.errorDescription)
    ) {
      yield put(setSettlements([]));
    } else {
      yield put(setSettlements(response.data.map(mapApiToModel)));
    }
  } catch (e) {
    yield put(setSettlementsError(e.message));
  }
}

export function* FetchSettlementsSaga(): Generator {
  yield takeLatest(REQUEST_SETTLEMENTS, fetchSettlements);
}

function* fetchSettlementAfterFiltersChange(action: PayloadAction) {
  if (action.payload !== undefined) {
    yield delay(500);
  }
  yield put(requestSettlements());
}
export function* FetchSettlementAfterFiltersChangeSaga(): Generator {
  yield takeLatest(
    [
      SELECT_SETTLEMENTS_FILTER_DATE_RANGE,
      SELECT_SETTLEMENTS_FILTER_DATE_VALUE,
      CLEAR_SETTLEMENTS_FILTER_DATE_RANGE,
      CLEAR_SETTLEMENTS_FILTER_STATE,
      SET_SETTLEMENTS_FILTER_VALUE,
      CLEAR_SETTLEMENTS_FILTERS,
    ],
    fetchSettlementAfterFiltersChange,
  );
}

export default function* rootSaga(): Generator {
  yield all([
    FetchSettlementsSaga(),
    FetchSettlementAfterFiltersChangeSaga(),
    FinalizeSettlementSaga(),
  ]);
}
