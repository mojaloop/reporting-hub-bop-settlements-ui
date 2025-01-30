/** ***
 License
 --------------
 Copyright © 2020-2025 Mojaloop Foundation
 The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Mojaloop Foundation for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.

 * Mojaloop Foundation
 - Name Surname <name.surname@mojaloop.io>
**** */

import { strict as assert } from 'assert';
import React, { FC } from 'react';
import { Button, ErrorBox, Modal, Spinner } from 'outdated-components';
import { MD5 as hash } from 'object-hash';
import {
  generateSettlementReportValidationDetail,
  explainSettlementReportValidationKind,
} from '../helpers';
import {
  FinalizeSettlementError,
  FinalizeSettlementErrorKind,
  SettlementReportValidation,
  SettlementStatus,
} from '../types';

import './SettlementFinalizingModal.css';
import settlementFinalizingModalConnector, { SettlementFinalizingModalProps } from './connectors';

function displaySettlementReportValidation(v: SettlementReportValidation) {
  const detail = generateSettlementReportValidationDetail(v);
  return (
    <div>
      <b>{`Description: ${v.kind}`}</b>
      {detail && <p>{`Detail: ${generateSettlementReportValidationDetail(v)}`}</p>}
      <p>{`Explanation: ${explainSettlementReportValidationKind(v.kind)}`}</p>
    </div>
  );
}

const SettlementFinalizingModal: FC<SettlementFinalizingModalProps> = ({
  settlementFinalizingInProgress,
  finalizingSettlement,
  finalizingSettlementError,
  onModalCloseClick,
  onProcessButtonClick,
  settlementReportError,
  settlementReportValidationErrors,
  settlementReportValidationWarnings,
  onClearSettlementReportWarnings,
}) => {
  function computeErrorDetails(err: FinalizeSettlementError) {
    switch (err.type) {
      case FinalizeSettlementErrorKind.ABORTED_SETTLEMENT:
        return <div>Unable to finalize an aborted settlement.</div>;
      case FinalizeSettlementErrorKind.SET_SETTLEMENT_PS_TRANSFERS_RECORDED:
      case FinalizeSettlementErrorKind.SET_SETTLEMENT_PS_TRANSFERS_RESERVED: {
        return (
          <div>
            `${err.type}: ${err.value.errorDescription} [CODE: ${err.value.errorCode}]`
          </div>
        );
      }
      case FinalizeSettlementErrorKind.SET_SETTLEMENT_PS_TRANSFERS_COMMITTED:
      case FinalizeSettlementErrorKind.SETTLE_ACCOUNTS: {
        const rows = err.value.map((v) => (
          <tr key={hash(v)}>
            <td>{v.participant.name}</td>
            <td>{v.apiResponse.errorDescription}</td>
            <td>{v.apiResponse.errorCode}</td>
            <td>{v.account.netSettlementAmount.currency}</td>
            <td>{v.account.netSettlementAmount.amount}</td>
            <td>{v.account.state}</td>
            <td>{v.account.id}</td>
          </tr>
        ));
        return (
          <table className="finalize-error-list">
            <caption>Errors in settlement state change</caption>
            <thead>
              <tr>
                <th>Participant</th>
                <th>Error</th>
                <th>Code</th>
                <th>Currency</th>
                <th>Amount</th>
                <th>State</th>
                <th>Account ID</th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </table>
        );
      }
      case FinalizeSettlementErrorKind.PROCESS_ADJUSTMENTS: {
        const rows = err.value.map((v) => (
          <tr key={hash(v)}>
            <td>{v.type}</td>
            <td>{v.value.adjustment.participant.name}</td>
            <td>{v.value.adjustment.positionAccount.id}</td>
            <td>{v.value.adjustment.settlementAccount.id}</td>
          </tr>
        ));
        return (
          <table className="finalize-error-list">
            <caption>Errors during settlement finalization</caption>
            <thead>
              <tr>
                <th>Message</th>
                <th>Participant</th>
                <th>Position Account ID</th>
                <th>Settlement Account ID</th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </table>
        );
      }
      default: {
        // Did you get a compile error here? This code is written such that if every
        // case in the above switch state is not handled, compilation will fail.
        const exhaustiveCheck: never = err;
        throw new Error(`Unhandled error state: ${exhaustiveCheck}`);
      }
    }
  }

  assert(finalizingSettlement, 'Runtime assertion error: expected finalizing settlement.');

  const orderedStates = [
    SettlementStatus.PendingSettlement,
    SettlementStatus.PsTransfersRecorded,
    SettlementStatus.PsTransfersReserved,
    SettlementStatus.PsTransfersCommitted,
    SettlementStatus.Settling,
    SettlementStatus.Settled,
  ];

  function computeStateCharacter(
    displayState: SettlementStatus,
    currentState: SettlementStatus,
    animating: boolean,
  ) {
    const done = (
      <span role="img" aria-label="completed">
        ✅
      </span>
    );
    const inProgress = <Spinner size={17} />;
    const pending = <div />;

    if (currentState === SettlementStatus.Settled) {
      return done;
    }

    const currentStatePosition = orderedStates.indexOf(currentState);
    const displayStatePosition = orderedStates.indexOf(displayState);

    if (currentStatePosition >= displayStatePosition) {
      return done;
    }

    if (currentStatePosition + 1 === displayStatePosition && animating) {
      return inProgress;
    }

    return pending;
  }

  const content = finalizingSettlementError ? ( // eslint-disable-line no-nested-ternary
    <ErrorBox>{computeErrorDetails(finalizingSettlementError)}</ErrorBox>
  ) : settlementReportError ? ( // eslint-disable-line no-nested-ternary
    <ErrorBox>
      <div>Error validating report:</div>
      {settlementReportError}
      <div>Please review the report format and content and try again.</div>
    </ErrorBox>
  ) : settlementReportValidationErrors !== null && settlementReportValidationErrors.length > 0 ? (
    <ErrorBox>
      <div>
        <h3>The following errors were present in the settlement finalization report:</h3>
        {settlementReportValidationErrors.map((e: SettlementReportValidation) => (
          <div key={hash(e)}>{displaySettlementReportValidation(e)}</div>
        ))}
      </div>
    </ErrorBox>
  ) : (
    <div>
      <Button
        pending={settlementFinalizingInProgress}
        kind="secondary"
        noFill
        size="s"
        label="Process"
        disabled={settlementFinalizingInProgress || finalizingSettlement.state === 'SETTLED'}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation();
          onProcessButtonClick(finalizingSettlement);
        }}
      />
      <hr />
      <table>
        <tbody>
          {orderedStates.map((s) => (
            <tr className="settlement-state-item" key={s}>
              <td>
                {computeStateCharacter(
                  s,
                  finalizingSettlement.state,
                  settlementFinalizingInProgress,
                )}
              </td>
              <td>{s}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <Modal
      title={`Finalizing settlement ${finalizingSettlement.id}`}
      width="1200px"
      onClose={onModalCloseClick}
      isCloseEnabled={!settlementFinalizingInProgress}
      flex
    >
      {content}
      {settlementReportValidationWarnings?.length &&
      settlementReportValidationWarnings?.length > 0 &&
      settlementReportValidationErrors?.length === 0 ? (
        <Modal
          title="Settlement Report Validation Warnings"
          width="1200px"
          onClose={onClearSettlementReportWarnings}
        >
          <ErrorBox>
            <div>
              <h3>Warning: the following was found in the settlement finalization report:</h3>
              <hr />
              {settlementReportValidationWarnings?.map((e: SettlementReportValidation) => (
                <div key={hash(e)}>{displaySettlementReportValidation(e)}</div>
              ))}
              <hr />
              <h3>
                These are not fatal errors. After closing this dialog, it will be possible to
                process the report.
              </h3>
            </div>
          </ErrorBox>
        </Modal>
      ) : (
        <></>
      )}
    </Modal>
  );
};

SettlementFinalizingModal.displayName = 'SettlementFinalizingModal';
export default settlementFinalizingModalConnector(SettlementFinalizingModal);
