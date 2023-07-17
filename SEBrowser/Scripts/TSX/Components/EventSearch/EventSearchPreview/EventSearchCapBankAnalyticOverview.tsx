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
import Table from '@gpa-gemstone/react-table';

interface ICapBankAnalytic {
    ID: number,
    Phase: string,
    Status: string,
    Operation: string,
    Resonance: boolean,
    CapBankHealth: string,
    PreInsertionSwitch: string,
    Restrike: string
}

const EventSearchCapBankAnalyticOverview: React.FC<SEBrowser.IWidget<any>> = (props) => {
    const [data, setData] = React.useState<ICapBankAnalytic[]>([]);
    const service = new OpenSEEService();

    React.useEffect(() => {
        if (props.eventID >= 0)
            service.getCapBankAnalytic(props.eventID).then(setData);
    }, [props.eventID]);


    return (
        <div className="card" >
            <div className="card-header">EPRI Capacitor Bank Analytic:</div>
            <div className="card-body">
                <Table
                    cols={[
                        { key: 'Phase', field: 'Phase', label: 'Phase' },
                        { key: 'Status', field: 'Status', label: 'Analysis Status' },
                        { key: 'Operation', field: 'Operation', label: 'Capacitor Bank Operation' },
                        { key: 'Resonance', field: 'Resonance', label: 'Resonance' },
                        { key: 'Health', field: 'CapBankHealth', label: 'Capacitor Bank Health' },
                        { key: 'Restrike', field: 'Restrike', label: 'Restrike' },
                        { key: 'PIS', field: 'PreInsertionSwitch', label: 'PreInsertionSwitching Condition' }
                    ]}
                    data={data}
                    onClick={() => { }}
                    onSort={() => { }}
                    sortKey={''}
                    ascending={true}
                    tableClass="table"
                    theadStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%', height: 50 }}
                    tbodyStyle={{ display: 'block', overflowY: 'scroll', width: '100%', maxHeight: props.maxHeight ?? 500 }}
                    rowStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                />
            </div>
        </div>
    );
}

export default EventSearchCapBankAnalyticOverview;




