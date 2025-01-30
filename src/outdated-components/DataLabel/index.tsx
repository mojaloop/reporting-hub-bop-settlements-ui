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

import React, { FC, ReactNode } from 'react';
import classnames from 'classnames';
import './DataLabel.css';

type DataLabelProps = {
  children: ReactNode;
  size?: 's' | 'm' | 'l';
  underline?: boolean;
  bold?: boolean;
  highlight?: boolean;
  light?: boolean;
  className?: string;
  id?: string;
};

const DataLabel: FC<DataLabelProps> = ({
  children,
  size = 'm',
  underline = false,
  bold = false,
  highlight = false,
  light = false,
  className = '',
  id,
}) => {
  const dataLabelClassName = classnames([
    size === 'l' && 'data-label--large',
    size === 'm' && 'data-label--medium',
    size === 's' && 'data-label--small',
    highlight && 'data-label--highlight',
    bold && 'data-label--bold',
    light && 'data-label--light',
    underline && 'data-label--underline',
    className,
  ]);
  return (
    <span id={id} className={dataLabelClassName}>
      {children}
    </span>
  );
};

export default DataLabel;
