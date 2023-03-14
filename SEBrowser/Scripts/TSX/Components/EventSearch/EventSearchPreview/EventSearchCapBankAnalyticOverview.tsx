//******************************************************************************************************
//  EventSearchCapBankAnalyticOverview.tsx - Gbtc
//
//  Copyright © 2019, Grid Protection Alliance.  All Rights Reserved.
//
//  Licensed to the Grid Protection Alliance (GPA) under one or more contributor license agreements. See
//  the NOTICE file distributed with this work for additional information regarding copyright ownership.
//  The GPA licenses this file to you under the MIT License (MIT), the "License"; you may not use this
//  file except in compliance with the License. You may obtain a copy of the License at:
//
//      http://opensource.org/licenses/MIT
//
//  Unless agreed to in writing, the subject software distributed under the License is distributed on an
//  "AS-IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. Refer to the
//  License for the specific language governing permissions and limitations.
//
//  Code Modification History:
//  ----------------------------------------------------------------------------------------------------
//  08/22/2019 - Christoph Lackner
//       Generated original version of source code.
//
//******************************************************************************************************

import React from 'react';
import OpenSEEService from '../../../../TS/Services/OpenSEE';
import { SEBrowser } from '../../../global';

const Row = (row) => {
    return (
        <tr key={row.ID}>
            <td key={'Phase' + row.ID}>{row.Phase}</td>
            <td key={'Status' + row.ID}>{row.Status}</td>
            <td key={'Operation' + row.ID}>{row.Operation}</td>
            <td key={'Resonance' + row.ID}>{(row.Resonance ? 'Yes' : 'No')}</td>
            <td key={'Health' + row.ID}>{row.CapBankHealth}</td>
            <td key={'PIS' + row.ID}>{row.PreInsertionSwitch}</td>
            <td key={'Restrike' + row.ID}>{row.Restrike}</td>
        </tr>
    );
}

const HeaderRow = () => {
    return (
        <tr key='Header'>
            <th key='Phase'>Phase</th>
            <th key='Status'>Analysis Status</th>
            <th key='Operation'>CapBank Operation</th>
            <th key='Resonance'>Resonance</th>
            <th key='Health'>CapBank Health</th>
            <th key='Restrike'>Restrike</th>
            <th key='PIS'>PreInsertionSwitching Condition</th>
        </tr>
    );
}

const EventSearchCapBankAnalyticOverview: React.FC<SEBrowser.IWidget<any>> = (props) => {
    const [tableRows, setTableRows] = React.useState<Array<JSX.Element>>([]);
    const service = new OpenSEEService();

    React.useEffect(() => {
        if (props.eventID >= 0)
            createTableRows(props.eventID);
    });

    function createTableRows(eventID: number) {
        
        service.getCapBankAnalytic(props.eventID).done(data => {
            var rows = [];

            for (var index = 0; index < data.length; ++index) {
                var row = data[index];

                rows.push(Row(row));
            }

            setTableRows(rows);
        });
    }

        return (
            <div className="card">
                <div className="card-header">EPRI CapBank Analytic:</div>
                <div className="card-body">
                    <table className="table">
                        <thead>
                            <HeaderRow />
                        </thead>
                        <tbody>
                            {tableRows}
                        </tbody>
                    </table>

                </div>
            </div>
        );
}

export default EventSearchCapBankAnalyticOverview;




