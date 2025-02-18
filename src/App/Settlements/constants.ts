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

// Removed because we reverted the version of this package due to a bug
// import { composeOptions } from '@pm4ml/mojaloop-payment-manager-ui-components-legacy/dist/utils/html';
import { DateRanges, SettlementStatus } from './types';

const composeOptions = (opts: any) => {
  return Object.keys(opts).map((k) => ({
    label: k,
    value: opts[k],
  }));
};

export const dateRanges = composeOptions({
  [DateRanges.Today]: DateRanges.Today,
  [DateRanges.TwoDays]: DateRanges.TwoDays,
  [DateRanges.OneWeek]: DateRanges.OneWeek,
  [DateRanges.OneMonth]: DateRanges.OneMonth,
  [DateRanges.Custom]: DateRanges.Custom,
});

export const settlementStatuses = composeOptions({
  'Pending Settlement': SettlementStatus.PendingSettlement,
  'PS Transfers Recorded': SettlementStatus.PsTransfersRecorded,
  'PS Transfers Reserved': SettlementStatus.PsTransfersReserved,
  'PS Transfers Committed': SettlementStatus.PsTransfersCommitted,
  Settling: SettlementStatus.Settling,
  Settled: SettlementStatus.Settled,
  Aborted: SettlementStatus.Aborted,
});
