import React from 'react';
import './index.scss';
import { Switch, Route, Redirect } from 'react-router-dom';
import { useBasePath } from './hooks';
import SettlementWindows from './SettlementWindows';
import Settlements from './Settlements';
import DFSPs from './DFSPs/index';

function App() {
  const basePath = useBasePath();
  return (
    <div className="settlements-app">
      {/* @ts-ignore */}
      <DFSPs>
        <Switch>
          <Route path={`${basePath}/windows`} component={SettlementWindows} />
          <Route path={`${basePath}/settle`} component={Settlements} />
          <Route exact path={`${basePath}/`}>
            <Redirect to={`${basePath}/windows`} />
          </Route>
        </Switch>
      </DFSPs>
    </div>
  );
}

export { App };
export default App;
