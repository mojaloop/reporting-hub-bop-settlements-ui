import { State } from 'store';
import buildApi, { buildEndpointBuilder, EndpointConfig } from '@modusbox/redux-utils/lib/api';

let baseUrl: string;
let mockApi: string;
let ledgerUrl: string;
if (process.env.NODE_ENV === 'production') {
  baseUrl = window.settlementEnv.CENTRAL_SETTLEMENTS_URL;
  mockApi = window.settlementEnv.REACT_APP_MOCK_API;
} else if (process.env.CENTRAL_SETTLEMENTS_URL && process.env.REACT_APP_MOCK_API) {
  baseUrl = process.env.CENTRAL_SETTLEMENTS_URL.replace(/\/$/, '');
  mockApi = process.env.REACT_APP_MOCK_API;
} else {
  baseUrl = '';
  mockApi = 'true';
}

if (process.env.NODE_ENV === 'production') {
  ledgerUrl = window.settlementEnv.CENTRAL_LEDGER_URL;
  mockApi = window.settlementEnv.REACT_APP_MOCK_API;
} else if (process.env.CENTRAL_LEDGER_URL && process.env.REACT_APP_MOCK_API) {
  ledgerUrl = process.env.CENTRAL_LEDGER_URL.replace(/\/$/, '');
  mockApi = process.env.REACT_APP_MOCK_API;
} else {
  ledgerUrl = '';
  mockApi = 'true';
}

const services = {
  settlementService: {
    baseUrl,
    mock: () => mockApi === 'true',
  },
  ledgerService: {
    baseUrl: ledgerUrl,
    mock: () => mockApi === 'true',
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

const dfsps: EndpointConfig = {
  service: services.ledgerService,
  url: () => '/participants',
};

export default buildApi({
  closeSettlementWindow: builder<{}>(closeSettlementWindow),
  dfsps: builder<{}>(dfsps),
  settlementParticipantAccount: builder<{}>(settlementParticipantAccount),
  settlements: builder<{}>(settlements),
  settlementWindows: builder<{}>(settlementWindows),
  settlementWindow: builder<{}>(settlementWindow),
  settlement: builder<{}>(settlement),
  settleSettlementWindows: builder<{}>(settleSettlementWindows),
});
