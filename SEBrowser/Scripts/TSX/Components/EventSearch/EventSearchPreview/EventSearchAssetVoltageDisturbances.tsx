//******************************************************************************************************
//  EventSearchAssetVoltageDisturbances.tsx - Gbtc
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
//  04/25/2019 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************
import React from 'react';
import moment from 'moment';
import { SEBrowser } from '../../../global';
import Table from '@gpa-gemstone/react-table';
import SEBrowserService from './../../../../TS/Services/SEBrowser';

const seBrowserService = new SEBrowserService();

interface IDisturbanceData {
    EventType: string;
    Phase: string;
    PerUnitMagnitude: number;
    DurationSeconds: number;
    StartTime: string;
    SeverityCode: string;
    IsWorstDisturbance: boolean;
}

const EventSearchAssetVoltageDisturbances: React.FC<SEBrowser.IWidget<any>> = (props) => {
    const [data, setData] = React.useState<IDisturbanceData[]>([]);

    React.useEffect(() => {
        if (props.eventID >= 0) loadDisturbancesData(props.eventID);
    }, [props.eventID]);

    const loadDisturbancesData = (eventID: number) => {
        seBrowserService.getEventSearchAsssetVoltageDisturbancesData(eventID).done((response) => {
            setData(response);
        });
    };

    return (
        <div className="card">
            <div className="card-header">Voltage Disturbance in Waveform:</div>
            <div className="card-body">
                <Table
                    cols={[
                        { key: 'EventType', field: 'EventType', label: 'Disturbance Type' },
                        { key: 'Phase', field: 'Phase', label: 'Phase' },
                        { key: 'PerUnitMagnitude', field: 'PerUnitMagnitude', label: 'Magnitude (%)', content: (r) => (r.PerUnitMagnitude * 100).toFixed(1), },
                        { key: 'DurationSeconds', field: 'DurationSeconds', label: 'Duration (ms)', content: (r) => (r.DurationSeconds * 1000).toFixed(2), },
                        { key: 'StartTime', field: 'StartTime', label: 'Start Time', content: (r) => moment(r.StartTime).format('HH:mm:ss.SSS') },
                        { key: 'SeverityCode', field: 'SeverityCode', label: 'Severity' },
                    ]}
                    data={data}
                    onClick={() => { }}
                    onSort={() => { }}
                    sortKey={''}
                    ascending={true}
                    tableClass="table"
                    theadStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%', height: 50 }}
                    tbodyStyle={{ display: 'table', overflowY: 'scroll', width: '100%' }}
                    rowStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                />
            </div>
        </div>
    );
}

export default EventSearchAssetVoltageDisturbances;
