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
import ReduxContext from 'store/context';
import * as selectors from './selectors';
import * as actions from './actions';
import { SettlementWindow, DateRanges, FilterValue } from './types';

// React-redux is a library to bind react together with redux.
// Every state change of your redux store should be communicated to the react components.
// This is done by using react-redux connect function.
const mapStateProps = (state: State) => ({
  selectedSettlementWindow: selectors.getSelectedSettlementWindow(state),
  settlementWindows: selectors.getSettlementWindows(state),
  settlementWindowsError: selectors.getSettlementWindowsError(state),
  isSettlementWindowsPending: selectors.getIsSettlementWindowsPending(state),

  filters: selectors.getSettlementWindowsFilters(state),
  checkedSettlementWindows: selectors.getCheckedSettlementWindows(state),
  isSettlementWindowModalVisible: selectors.getIsSettlementWindowModalVisible(state),
  isCloseSettlementWindowPending: selectors.getIsCloseSettlementWindowPending(state),
  isSettleSettlementWindowPending: selectors.getIsSettleSettlementWindowPending(state),
  settleSettlementWindowsError: selectors.getSettleSettlementWindowsError(state),
  settlingWindowsSettlementId: selectors.getSettlingWindowsSettlementId(state),
  settlementModels: selectors.getSettlementModels(state),
  isSettlementModelsPending: selectors.getIsSettlementModelsPending(state),
  selectedSettlementModel: selectors.getSelectedSettlementModel(state),
});

const mapDispatchProps = (dispatch: Dispatch) => ({
  onMount: () => {
    dispatch(actions.resetSettlementWindows());
    dispatch(actions.requestSettlementWindows());
    dispatch(actions.requestSettlementModels());
  },

  onDateRangerFilterSelect: (payload: DateRanges) =>
    dispatch(actions.selectSettlementWindowsFilterDateRange(payload)),
  onDateFilterClearClick: () => dispatch(actions.clearSettlementWindowsFilterDateRange()),
  onStateFilterClearClick: () => dispatch(actions.clearSettlementWindowsFilterState()),
  onStartDateRangeFilterSelect: (payload: number) =>
    dispatch(actions.selectSettlementWindowsFilterDateValue({ type: 'start', value: payload })),
  onEndDateRangeFilterSelect: (payload: number) =>
    dispatch(actions.selectSettlementWindowsFilterDateValue({ type: 'end', value: payload })),
  onFilterValueChange: (filter: string, value: FilterValue) =>
    dispatch(actions.setSettlementWindowsFilterValue({ filter, value })),
  onClearFiltersClick: () => dispatch(actions.clearSettlementWindowsFilters()),
  onSettlementsWindowsCheck: (items: SettlementWindow[]) =>
    dispatch(actions.checkSettlementWindows(items)),
  onSettleButtonClick: () => dispatch(actions.settleSettlementWindows()),
  onCloseButtonClick: (settlementWindow: SettlementWindow) =>
    dispatch(actions.requestCloseSettlementWindow(settlementWindow)),
  onCloseModalClick: () => dispatch(actions.closeSettlementWindowModal()),
  onSelectedSettlementModel: (value: string) => dispatch(actions.setSelectedSettlementModel(value)),
});

const settlementWindowsConnector = connect(mapStateProps, mapDispatchProps, null, {
  context: ReduxContext,
});

export type SettlementWindowsProps = ConnectedProps<typeof settlementWindowsConnector>;
export default settlementWindowsConnector;
