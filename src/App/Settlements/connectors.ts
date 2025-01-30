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
import { State, Dispatch } from 'store/types';
import { ReduxContext } from 'store';
import * as selectors from './selectors';
import * as actions from './actions';
import { Settlement, DateRanges, FilterValue } from './types';

const mapStateProps = (state: State) => ({
  selectedSettlement: selectors.getSelectedSettlement(state),
  settlements: selectors.getSettlements(state),
  settlementsError: selectors.getSettlementsError(state),
  showFinalizeSettlementModal: selectors.getFinalizeSettlementModalVisible(state),
  finalizingSettlement: selectors.getFinalizingSettlement(state),
  isSettlementsPending: selectors.getIsSettlementsPending(state),
  filters: selectors.getSettlementsFilters(state),
});

const mapDispatchProps = (dispatch: Dispatch) => ({
  onMount: () => dispatch(actions.requestSettlements()),

  onFinalizeButtonClick: (settlement: Settlement) => {
    dispatch(actions.setFinalizingSettlement(settlement));
    dispatch(actions.showFinalizeSettlementModal());
  },
  onDateRangerFilterSelect: (payload: DateRanges) =>
    dispatch(actions.selectSettlementsFilterDateRange(payload)),
  onDateFilterClearClick: () => dispatch(actions.clearSettlementsFilterDateRange()),
  onStateFilterClearClick: () => dispatch(actions.clearSettlementsFilterState()),
  onStartDateRangeFilterSelect: (payload: number) =>
    dispatch(actions.selectSettlementsFilterDateValue({ type: 'start', value: payload })),
  onEndDateRangeFilterSelect: (payload: number) =>
    dispatch(actions.selectSettlementsFilterDateValue({ type: 'end', value: payload })),
  onFilterValueChange: (filter: string, value: FilterValue) =>
    dispatch(actions.setSettlementsFilterValue({ filter, value })),
  onClearFiltersClick: () => dispatch(actions.clearSettlementsFilters()),
  onSettlementSelect: (settlement: Settlement) => dispatch(actions.selectSettlement(settlement)),
});

const settlementsConnector = connect(mapStateProps, mapDispatchProps, null, {
  context: ReduxContext,
});

export type SettlementsProps = ConnectedProps<typeof settlementsConnector>;

export default settlementsConnector;
