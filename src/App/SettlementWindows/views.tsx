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

import React, { FC } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Column,
  DataLabel,
  Heading,
  Led,
  Button,
  MessageBox,
  Spinner,
  DataList,
  Select,
  DatePicker,
  Modal,
} from 'outdated-components';
import withMount from 'hocs';
import {
  DateRanges,
  SettlementWindow,
  SettlementWindowStatus,
  SettlementWindowFilters,
  FilterValue,
} from './types';
import { dateRanges, settlementWindowStatuses } from './constants';
import * as helpers from './helpers';
import './SettlementWindows.css';
import settlementWindowsConnector, { SettlementWindowsProps } from './connectors';

interface FiltersProps {
  filters: SettlementWindowFilters;
  onDateRangerFilterSelect: (payload: DateRanges) => void;
  onDateFilterClearClick: () => void;
  onStartDateRangeFilterSelect: (payload: number) => void;
  onEndDateRangeFilterSelect: (payload: number) => void;
  onStateFilterClearClick: () => void;
  onFilterValueChange: (filter: string, value: FilterValue) => void;
  onClearFiltersClick: () => void;
}

const Filters: FC<FiltersProps> = ({
  filters,
  onDateRangerFilterSelect,
  onDateFilterClearClick,
  onStartDateRangeFilterSelect,
  onEndDateRangeFilterSelect,
  onStateFilterClearClick,
  onFilterValueChange,
  onClearFiltersClick,
}) => (
  <div className="settlement-windows__filters">
    <div className="settlement-windows__filters__filter-row">
      <Select
        className="settlement-windows__filters__date-filter"
        size="s"
        id="filter_date"
        placeholder="Date"
        options={dateRanges}
        selected={filters?.range}
        onChange={onDateRangerFilterSelect}
        onClear={onDateFilterClearClick}
      />

      <DatePicker
        className="settlement-windows__filters__date-filter"
        size="s"
        id="filter_date_from"
        format="x"
        onSelect={onStartDateRangeFilterSelect}
        value={filters?.start}
        placeholder="From"
        dateFormat="MM/DD/YYYY HH:mm:SS"
        defaultHour={0}
        defaultMinute={0}
        defaultSecond={0}
        hideIcon
        withTime
      />

      <DatePicker
        className="settlement-windows__filters__date-filter"
        size="s"
        id="filter_date_to"
        format="x"
        initialMonth={filters?.start}
        onSelect={onEndDateRangeFilterSelect}
        value={filters?.end}
        placeholder="To"
        dateFormat="MM/DD/YYYY HH:mm:SS"
        defaultHour={23}
        defaultMinute={59}
        defaultSecond={59}
        hideIcon
        withTime
      />
    </div>
    <div className="settlement-windows__filters__filter-row">
      <Select
        className="settlement-windows__filters__date-filter"
        size="s"
        placeholder="State"
        selected={filters?.state}
        options={settlementWindowStatuses}
        onChange={(value: string) => onFilterValueChange('state', value)}
        onClear={onStateFilterClearClick}
      />
      <Button
        noFill
        className="settlement-windows__filters__date-filter"
        size="s"
        kind="danger"
        label="Clear Filters"
        onClick={onClearFiltersClick}
      />
    </div>
  </div>
);

interface SettlementWindowModalProps {
  onClose: () => void;
  isPending: boolean;
  error: string | null;
  id: number | null;
}

const SettlementWindowModal: FC<SettlementWindowModalProps> = ({
  id,
  isPending,
  error,
  onClose,
}) => {
  const history = useHistory();
  let content = null;
  let title;
  if (isPending) {
    title = 'Submitting Settlement(s)';
    content = <Spinner center />;
  } else if (error) {
    title = 'Failed Settlement Submit';
    content = (
      <MessageBox kind="danger">There was an error settling the windows - {error}</MessageBox>
    );
  } else {
    title = 'Settlement Submitted';
    content = (
      <>
        <div>
          <Column>
            <DataLabel size="s" light>
              Settlement IDs
            </DataLabel>
            <DataLabel size="m">{id || ''}</DataLabel>
          </Column>
        </div>
        <div className="settlements-windows__modal__row">
          <Button
            noFill
            kind="secondary"
            label="View Submitted Settlements"
            onClick={() => {
              history.push('./settle');
            }}
          />
        </div>
        <div className="settlements-windows__modal__row">
          <Button noFill kind="secondary" label="Continue Viewing Windows" onClick={onClose} />
        </div>
      </>
    );
  }
  return (
    <Modal title={title} onClose={onClose} noFooter>
      {content}
    </Modal>
  );
};

function renderStatus(state: SettlementWindowStatus) {
  const statusLabels = {
    [SettlementWindowStatus.Open]: { color: 'orange', label: 'Open' },
    [SettlementWindowStatus.Closed]: { color: 'purple', label: 'Closed' },
    [SettlementWindowStatus.Pending]: { color: 'blue', label: 'Pending' },
    [SettlementWindowStatus.Settled]: { color: 'green', label: 'Settled' },
    [SettlementWindowStatus.Aborted]: { color: 'red', label: 'Aborted' },
    [SettlementWindowStatus.Processing]: { color: 'white', label: 'Processing' },
  };
  const { color, label } = statusLabels[state];
  return (
    <>
      <Led colorName={color} />
      <span>{label}</span>
    </>
  );
}

const SettlementWindows: FC<SettlementWindowsProps> = ({
  settlementWindows,
  settlementWindowsError,
  settlementModels,
  isSettlementWindowsPending,
  filters,
  checkedSettlementWindows,
  isSettlementWindowModalVisible,
  isCloseSettlementWindowPending,
  isSettleSettlementWindowPending,
  settleSettlementWindowsError,
  settlingWindowsSettlementId,
  isSettlementModelsPending,
  onDateRangerFilterSelect,
  onDateFilterClearClick,
  onStartDateRangeFilterSelect,
  onEndDateRangeFilterSelect,
  onStateFilterClearClick,
  onFilterValueChange,
  onClearFiltersClick,
  onSettlementsWindowsCheck,
  onSettleButtonClick,
  onCloseButtonClick,
  onCloseModalClick,
  onSelectedSettlementModel,
}) => {
  const columns = [
    { key: 'settlementWindowId', label: 'Window ID' },
    { key: 'state', label: 'State', func: renderStatus, sortable: false, searchable: false },
    { key: 'createdDate', label: 'Open Date', func: helpers.formatDate },
    {
      key: 'changedDate',
      label: 'Closed Date',
      func: (changedDate: string, item: SettlementWindow) => {
        if (item.state === SettlementWindowStatus.Open) {
          return '-';
        }
        return helpers.formatDate(changedDate);
      },
    },
    {
      key: 'settlementWindowId',
      label: 'Action',
      sortable: false,
      searchable: false,
      func: (settlementWindowId: string, item: SettlementWindow) => {
        if (item.state === SettlementWindowStatus.Open) {
          return (
            /* eslint-disable-next-line */
            <Button
              kind="secondary"
              noFill
              size="s"
              label="Close Window"
              pending={isCloseSettlementWindowPending}
              onClick={() => onCloseButtonClick(item)}
            />
          );
        }
        return null;
      },
    },
  ];
  let content = null;
  if (settlementWindowsError) {
    content = <MessageBox kind="danger">{settlementWindowsError}</MessageBox>;
  } else if (isSettlementWindowsPending || isSettlementModelsPending) {
    content = <Spinner center />;
  } else {
    const models = settlementModels.map((model) => {
      return {
        label: model.name,
        value: model.name,
      };
    });

    content = (
      <>
        <div className="settlement-windows__controls">
          <Select
            className="settlements__filters__date-filter"
            size="s"
            id="selected_settlement_model"
            placeholder="Settlement Model"
            options={models}
            onChange={(value: string) => onSelectedSettlementModel(value)}
          />
          <Button
            disabled={!checkedSettlementWindows.length}
            label="Settle Selected Windows"
            onClick={onSettleButtonClick}
          />
        </div>

        <DataList
          columns={columns}
          list={settlementWindows}
          onCheck={onSettlementsWindowsCheck}
          checked={checkedSettlementWindows}
          sortColumn="Window ID"
          sortAsc={false}
          checkable={(item: SettlementWindow) => item.state === SettlementWindowStatus.Closed}
        />
      </>
    );
  }
  return (
    <div className="settlementWindows">
      <Heading size="3">Settlement Windows</Heading>
      <Filters
        filters={filters}
        onDateRangerFilterSelect={onDateRangerFilterSelect}
        onDateFilterClearClick={onDateFilterClearClick}
        onStartDateRangeFilterSelect={onStartDateRangeFilterSelect}
        onEndDateRangeFilterSelect={onEndDateRangeFilterSelect}
        onStateFilterClearClick={onStateFilterClearClick}
        onFilterValueChange={onFilterValueChange}
        onClearFiltersClick={onClearFiltersClick}
      />
      {content}
      {isSettlementWindowModalVisible && (
        <SettlementWindowModal
          id={settlingWindowsSettlementId}
          onClose={onCloseModalClick}
          isPending={isSettleSettlementWindowPending}
          error={settleSettlementWindowsError}
        />
      )}
    </div>
  );
};

export default settlementWindowsConnector(withMount(SettlementWindows, 'onMount'));
