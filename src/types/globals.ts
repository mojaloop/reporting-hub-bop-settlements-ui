export {};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Window {
    settlementEnv: {
      CENTRAL_SETTLEMENTS_URL: string;
      CENTRAL_LEDGER_URL: string;
      REACT_APP_MOCK_API: string;
    };
  }
}
