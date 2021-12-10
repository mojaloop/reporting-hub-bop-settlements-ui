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

const dfsps: EndpointConfig = {
  service: services.ledgerService,
  url: () => '/participants',
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

export default buildApi({
  closeSettlementWindow: builder<{}>(closeSettlementWindow),
  dfsps: builder<{}>(dfsps),
  settlementParticipantAccount: builder<{}>(settlementParticipantAccount),
  settlements: builder<{}>(settlements),
  settlementWindows: builder<{}>(settlementWindows),
  settlementWindow: builder<{}>(settlementWindow),
  settlement: builder<{}>(settlement),
  settleSettlementWindows: builder<{}>(settleSettlementWindows),
  participants: builder<{}>(participants),
  participantsLimits: builder<{}>(participantsLimits),
  participantLimits: builder<{}>(participantLimits),
  participantAccounts: builder<{}>(participantAccounts),
  participantAccountTransfer: builder<{}>(participantAccountTransfer),
  participantAccount: builder<{}>(participantAccount),
});
