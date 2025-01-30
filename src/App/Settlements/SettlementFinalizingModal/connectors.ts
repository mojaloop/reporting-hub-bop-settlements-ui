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

import { connect, ConnectedProps } from 'react-redux';
import { ReduxContext } from 'store';
import { State, Dispatch } from 'store/types';
import * as actions from '../actions';
import * as selectors from '../selectors';
import { Settlement } from '../types';

const mapStateProps = (state: State) => ({
  settlementReport: selectors.getSettlementReport(state),
  finalizingSettlement: selectors.getFinalizingSettlement(state),
  finalizingSettlementError: selectors.getFinalizingSettlementError(state),
  settlementReportError: selectors.getSettlementReportError(state),
  settlementFinalizingInProgress: selectors.getSettlementFinalizingInProgress(state),
  settlementReportValidationWarnings: selectors.getSettlementReportValidationWarnings(state),
  settlementReportValidationErrors: selectors.getSettlementReportValidationErrors(state),
  settlementReportValidationInProgress: selectors.getSettlementReportValidationInProgress(state),
});

const mapDispatchProps = (dispatch: Dispatch) => ({
  onModalCloseClick: () => {
    // TODO: this should all be folded into a single discriminated union that represents the state
    // of settlement finalizing. This might mean that the finalizeSettlement saga repeatedly
    // dispatches actions that call the finalizeSettlement saga as the settlement state
    // transitions.
    dispatch(actions.setSettlementReportValidationErrors(null));
    dispatch(actions.setSettlementReportValidationWarnings(null));
    dispatch(actions.setSettlementAdjustments(null));
    dispatch(actions.setFinalizingSettlement(null));
    dispatch(actions.setFinalizeSettlementError(null));
    // Clear the settlement report such that the operator does not open another settlement and have
    // the settlement report pre-loaded with the wrong file. We perform validation on the
    // settlement report that is uploaded, but this could cause confusion for the operator.
    dispatch(actions.setSettlementReport(null));
    dispatch(actions.setSettlementReportError(null));
    dispatch(actions.hideFinalizeSettlementModal());
    dispatch(actions.requestSettlements());
  },
  onProcessButtonClick: (settlement: Settlement) => {
    dispatch(actions.setSettlementFinalizingInProgress(true));
    dispatch(actions.finalizeSettlement(settlement));
  },
  onClearSettlementReportWarnings: () =>
    dispatch(actions.setSettlementReportValidationWarnings(null)),
});

const settlementFinalizingModalConnector = connect(mapStateProps, mapDispatchProps, null, {
  context: ReduxContext,
});

export type SettlementFinalizingModalProps = ConnectedProps<
  typeof settlementFinalizingModalConnector
>;

export default settlementFinalizingModalConnector;
