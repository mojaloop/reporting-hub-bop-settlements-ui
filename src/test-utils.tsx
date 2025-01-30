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

import React, { ReactElement, FC } from 'react';
import { render as rtlRender } from '@testing-library/react';
import { ConnectedRouter } from 'connected-react-router';
import { createMemoryHistory } from 'history';
import { Provider } from 'react-redux';
import configure, { ReduxContext } from 'store';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function render(ui: ReactElement<unknown>, { ...renderOptions } = {}) {
  const history = createMemoryHistory();
  const store = configure(history);

  // @ts-ignore
  const wrapper: FC<unknown> = ({ children }) => {
    return (
      <Provider store={store} context={ReduxContext}>
        <ConnectedRouter history={history} context={ReduxContext}>
          {children}
        </ConnectedRouter>
      </Provider>
    );
  };

  return rtlRender(ui, { wrapper, ...renderOptions });
}

// re-export everything
export * from '@testing-library/react';

// override render method
export { render };
