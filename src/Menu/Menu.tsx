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

import React from 'react';
import { Provider } from 'react-redux';
import { store, ReduxContext } from 'store';
import { Menu } from 'components';
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom';

interface ExportMenuProps {
  path: string;
  pathname: string;
  onChange: (path: string) => void;
}

interface MenuItemsProps {
  path: string;
}

function MenuItems({ path }: MenuItemsProps) {
  return (
    <>
      <Menu.Item path={`${path}/windows`} label="Settlement Windows" />
      <Menu.Item path={`${path}/settle`} label="Settlements" />
    </>
  );
}

// ExportMenu is the exported component to be consumed
// The shell passes down these props
export default function ExportMenu({ path, pathname, onChange }: ExportMenuProps) {
  return (
    <Menu path={path} pathname={pathname} onChange={onChange}>
      <Provider store={store} context={ReduxContext}>
        <MenuItems path={path} />
      </Provider>
    </Menu>
  );
}

// AppMenu is the standalone component used when the microfrontend is not being
// consumed
export function AppMenu() {
  const match = useRouteMatch();
  const history = useHistory();
  const location = useLocation();
  const path = match.url === '/' ? '' : match.url;
  return <ExportMenu path={path} pathname={location.pathname} onChange={history.push} />;
}
