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
import { Led, Column, DataLabel, DataList, Modal, Row } from 'outdated-components';
import { DFSP } from 'App/DFSPs/types';
import * as helpers from '../helpers';
import { SettlementParticipant } from '../types';
import './SettlementDetails.css';
import settlementDetailsConnector, { SettlementDetailsProps } from './connectors';

const SettlementDetails: FC<SettlementDetailsProps> = ({
  dfsps,
  selectedSettlement,
  onModalCloseClick,
}) => {
  const detailsColumns = [
    { label: 'DFSP', key: 'dfsp' },
    { label: 'State', key: 'state' },
    { label: 'Currency', key: 'currency' },
    {
      label: 'Debit',
      key: 'debit',
      className: 'settlement-details__list__debit',
    },
    {
      label: 'Credit',
      key: 'credit',
      className: 'settlement-details__list__credit',
    },
  ];

  assert(selectedSettlement !== null);

  // To render total values for each currency
  const renderCurrencyTotals = () => (
    <div className="settlement-details__dates-block">
      {selectedSettlement?.totalCurrencyValues?.map((value) => (
        <div key={value.currency} className="settlement-details__dates-block">
          <DataLabel size="s" light>
            Total Value ({value.currency})
          </DataLabel>
          <DataLabel size="m">{helpers.formatNumber(value.amount)}</DataLabel>
        </div>
      ))}
    </div>
  );

  // Position accounts are negative and is not intuitive for the ui.
  const rows = selectedSettlement.participants.flatMap((p: SettlementParticipant) =>
    p.accounts.map((acc) => ({
      dfsp: dfsps.find((dfsp: DFSP) => dfsp.accountIds.includes(acc.id))?.name,
      credit: -acc.netSettlementAmount.amount > 0 ? -acc.netSettlementAmount.amount : '-',
      debit: -acc.netSettlementAmount.amount < 0 ? -acc.netSettlementAmount.amount : '-',
      currency: acc.netSettlementAmount.currency,
      accountId: acc.id,
      state: acc.state,
    })),
  );

  const { color, label } = helpers.getStatusProperties(selectedSettlement.state);

  return (
    <Modal title="Settlement Details" width="1200px" onClose={onModalCloseClick} flex>
      <Row align="flex-start flex-start">
        <Column>
          <Row align="flex-start flex-start">
            <Column grow="0" className="settlement-details__details-block">
              <DataLabel size="s" light>
                Settlement ID
              </DataLabel>
              <DataLabel size="m">{selectedSettlement.id}</DataLabel>
            </Column>
            <Column grow="0" className="settlement-details__details-block">
              <DataLabel size="s" light>
                Status
              </DataLabel>
              <DataLabel size="m">
                <Led colorName={color} />
                {label}
              </DataLabel>
            </Column>
            <Column grow="0" className="settlement-details__details-block">
              {renderCurrencyTotals()}
            </Column>
          </Row>
        </Column>
        <Column grow="0">
          <div className="settlement-details__dates-block">
            <DataLabel size="s" light>
              Created Date
            </DataLabel>
            <DataLabel size="m">{helpers.formatDate(selectedSettlement.createdDate)}</DataLabel>
          </div>
          <div className="settlement-details__dates-block">
            <DataLabel size="s" light>
              Last Action Date
            </DataLabel>
            <DataLabel size="m">{helpers.formatDate(selectedSettlement.changedDate)}</DataLabel>
          </div>
        </Column>
      </Row>
      <DataList flex columns={detailsColumns} list={rows} />
    </Modal>
  );
};

export default settlementDetailsConnector(SettlementDetails);
