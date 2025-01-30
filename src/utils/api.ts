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

import { State } from 'store';
import buildApi, { buildEndpointBuilder, EndpointConfig } from '@modusbox/redux-utils/lib/api';

const [centralSettlementsURL, centralLedgerURL] =
  process.env.NODE_ENV === 'production'
    ? [
        window.settlementEnv.CENTRAL_SETTLEMENTS_ENDPOINT,
        window.settlementEnv.CENTRAL_LEDGER_ENDPOINT,
      ]
    : [process.env.CENTRAL_SETTLEMENTS_ENDPOINT || '', process.env.CENTRAL_LEDGER_ENDPOINT || ''];

export const services = {
  settlementService: {
    baseUrl: centralSettlementsURL,
  },
  ledgerService: {
    baseUrl: centralLedgerURL,
  },
};

const builder = buildEndpointBuilder<State>();

const settlementParticipantAccount: EndpointConfig = {
  service: services.settlementService,
  url: (
    _: State,
    {
      settlementId,
      participantId,
      accountId,
    }: { settlementId: string; participantId: string; accountId: string },
  ) => `/settlements/${settlementId}/participants/${participantId}/accounts/${accountId}`,
  withCredentials: true,
};

const settlements: EndpointConfig = {
  service: services.settlementService,
  url: () => `/settlements`,
  withCredentials: true,
};

const settlementWindows: EndpointConfig = {
  service: services.settlementService,
  url: () => `/settlementWindows`,
  withCredentials: true,
};

const settlementWindow: EndpointConfig = {
  service: services.settlementService,
  url: (_: State, { settlementWindowId }: { settlementWindowId: string }) =>
    `/settlementWindows/${settlementWindowId}`,
  withCredentials: true,
};

const settlement: EndpointConfig = {
  service: services.settlementService,
  url: (_: State, { settlementId }: { settlementId: string }) => `/settlements/${settlementId}`,
  withCredentials: true,
};

const settleSettlementWindows: EndpointConfig = {
  service: services.settlementService,
  url: () => `/settlements`,
  withCredentials: true,
};

const closeSettlementWindow: EndpointConfig = {
  service: services.settlementService,
  url: (_: State, { settlementWindowId }: any) => `/settlementWindows/${settlementWindowId}`,
  withCredentials: true,
};

const participants: EndpointConfig = {
  service: services.ledgerService,
  url: () => '/participants',
  withCredentials: true,
};

const participantsLimits: EndpointConfig = {
  service: services.ledgerService,
  url: () => `/participants/limits`,
};

const participantLimits: EndpointConfig = {
  service: services.ledgerService,
  url: (_, { participantName }) => `/participants/${participantName}/limits`,
};

const participantAccounts: EndpointConfig = {
  service: services.ledgerService,
  url: (_, { participantName }) => `/participants/${participantName}/accounts`,
};
const participantAccountTransfer: EndpointConfig = {
  service: services.ledgerService,
  url: (
    _: State,
    {
      participantName,
      accountId,
      transferId,
    }: { participantName: string; accountId: string; transferId: string },
  ) => `/participants/${participantName}/accounts/${accountId}/transfers/${transferId}`,
};

const participantAccount: EndpointConfig = {
  service: services.ledgerService,
  url: (_: State, { participantName, accountId }: { participantName: string; accountId: string }) =>
    `/participants/${participantName}/accounts/${accountId}`,
};

const settlementModels: EndpointConfig = {
  service: services.ledgerService,
  url: () => '/settlementModels',
};

export default buildApi({
  closeSettlementWindow: builder<{}>(closeSettlementWindow),
  settlementParticipantAccount: builder<{}>(settlementParticipantAccount),
  settlements: builder<{}>(settlements),
  settlementWindows: builder<{}>(settlementWindows),
  settlementWindow: builder<{}>(settlementWindow),
  settlementModels: builder<{}>(settlementModels),
  settlement: builder<{}>(settlement),
  settleSettlementWindows: builder<{}>(settleSettlementWindows),
  participants: builder<{}>(participants),
  participantsLimits: builder<{}>(participantsLimits),
  participantLimits: builder<{}>(participantLimits),
  participantAccounts: builder<{}>(participantAccounts),
  participantAccountTransfer: builder<{}>(participantAccountTransfer),
  participantAccount: builder<{}>(participantAccount),
});
