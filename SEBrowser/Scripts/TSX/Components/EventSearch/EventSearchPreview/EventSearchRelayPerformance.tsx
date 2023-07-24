//******************************************************************************************************
//  EventSearchRelayPerformance.tsx - Gbtc
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
import moment from 'moment';
import { SEBrowser } from '../../../global';
import Table from '@gpa-gemstone/react-table';

interface IRelayPerformanceTrend {
    BreakerID: number,
    EventID: number,
    Imax1: number,
    Imax2: number,
    TripInitiate: number,
    TripTime: number,
    PickupTime: number,
    TripCoilCondition: number,
    TripCoilConditionAlert: number,
    TripTimeAlert: number,
    PickupTimeAlert: number,
    TripCoilChannelID: number,
    Tmax1: number,
    TplungerLatch: number,
    IplungerLatch: number,
    Idrop: number,
    TiDrop: number,
    Tend: number,
    TripTimeCurrent: number,
    PickupTimeCurrent: number,
    TripCoilConditionTime: number,
    ExtinctionTimeA: number,
    ExtinctionTimeB: number,
    ExtinctionTimeC: number,
    I2CA: number,
    I2CB: number,
    I2CC: number,
    EventType: number
}

const EventSearchRelayPerformance: React.FC<SEBrowser.IWidget<any>> = (props) => {
    const [data, setData] = React.useState<IRelayPerformanceTrend[]>([]);

    function getRelayPerformanceData() {
       return  $.ajax({
            type: "GET",
            url: `${homePath}api/OpenXDA/GetRelayPerformance/${props.eventID}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
       });
    }

    React.useEffect(() => {
        const handle = getRelayPerformanceData();
        handle.done((data) => {
            setData(data);
        });
        return () => { if (handle != null && handle.abort != null) handle.abort(); }
    }, [props.eventID]);


    return (
        <div className="card">
            <div className="card-header">Breaker Performance:</div>
            <div className="card-body">
                <Table
                    cols={[
                        {
                            key: 'EventID', field: 'EventID', label: 'Event ID', content: (d) => (<a id="eventLink" target="_blank" href={homePath + 'Main/OpenSEE?eventid=' + d.EventID}>
                                <div style={{ width: '100%', height: '100%' }}> {d.EventID} </div> </a>)
                        },
                        { key: 'TripInitiate', label: 'Trip Initiation Time', content: (d) => moment(d.TripInitiate).format('MM/DD/YY HH:mm:ss.SSSS') },
                        { key: 'TripTime', label: 'Trip Time', content: (d) => `${d.TripTime} micros` },
                        { key: 'PickupTime', label: 'Pickup Time', content: (d) => `${d.PickupTime} micros` },
                        { key: 'ExtinctionTime', field: 'ExtinctionTimeA', label: 'Extinction Time', content: () => `micros` },
                        { key: 'TripCoilCondition', field: 'TripCoilCondition', label: 'Trip Coil Condition', content: (d) => `${d.TripCoilCondition.toFixed(2)} A/s` },
                        { key: 'L1', field: 'Imax1', label: 'L1', content: (d) => `${d.Imax1.toFixed(3)} A` },
                        { key: 'L2', field: 'Imax2', label: 'L2', content: (d) => `${d.Imax2.toFixed(3)} A` },
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

const Row = (row, background) => {
    return (
        <tr style={{ background: background }} key={row.EventID}>
            <td key={'EventID' + row.EventID}><a id="eventLink" href={homePath + 'Main/OpenSEE?eventid=' + row.EventID}><div style={{ width: '100%', height: '100%' }}>{row.EventID}</div></a></td>
            <td key={'InitiateTime' + row.EventID}>{moment(row.TripInitiate).format('DD/MM/YY HH:MM:ss.SSSS')}</td>
            <td key={'TripTime' + row.EventID}>{row.TripTime} micros</td>
            <td key={'PickupTime' + row.EventID}>{row.PickupTime} micros</td>
            <td key={'TripCoilCondition' + row.EventID}>{row.TripCoilCondition.toFixed(2)} A/s</td>
            <td key={'L1' + row.EventID}>{row.Imax1.toFixed(3)} A</td>
            <td key={'L2' + row.EventID}>{row.Imax2.toFixed(3)} A</td>
        </tr>
    );
}

const HeaderRow = () => {
    return (
        <tr key='Header'>
            <th key='EventID'>Event ID</th>
            <th key='InitiateTime'>Trip Initiation Time</th>
            <th key='TripTime'>Trip Time</th>
            <th key='PickupTime'>Pickup Time</th>
            <th key='TripCoilCondition'>Trip Coil Condition</th>
            <th key='L1'>L1</th>
            <th key='L2'>L2</th>
        </tr>
    );
}

export default EventSearchRelayPerformance;