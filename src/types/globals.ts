export {};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Window {
    settlementEnv: {
      CENTRAL_SETTLEMENTS_ENDPOINT: string;
      CENTRAL_LEDGER_ENDPOINT: string;
      REPORTING_TEMPLATE_API_ENDPOINT: string;
    };
  }
}
