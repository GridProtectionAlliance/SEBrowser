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

interface ITimeCorrelatedSags {
    EventID: number;
    EventType: string;
    SagMagnitudePercent: number;
    SagDurationMilliseconds: number;
    SagDurationCycles: number;
    StartTime: string;
    MeterName: string;
    LineName: string;
}

const EventSearchCorrelatedSags: React.FC<SEBrowser.IWidget<unknown>> = (props) => {
    const [tableRows, setTableRows] = React.useState([]);

    const [data, setData] = React.useState<ITimeCorrelatedSags[]>([]);

    let correlatedSagsHandle;

    function getTimeCorrelatedSags(eventid: number) {
        if (correlatedSagsHandle !== undefined) {
            correlatedSagsHandle.abort();
        }

        correlatedSagsHandle = $.ajax({
            type: 'GET',
            url: `${homePath}api/OpenXDA/GetTimeCorrelatedSags?eventId=${eventid}`,
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            cache: true,
            async: true,
        });

        return correlatedSagsHandle;
    }

    function createTableRows() {
        getTimeCorrelatedSags(props.eventID).done((data) => {
            const rows = [];

            for (let index = 0; index < data.length; ++index) {
                const row = data[index];
                let background = 'default';

                if (row.EventID === props.eventID) {
                    background = 'lightyellow';
                }

                rows.push(Row(row, background));
            }

            setTableRows(rows);
        });
    }

    React.useEffect(() => {
        if (props.eventID >= 0) {
            createTableRows();
        }
    }, [props.eventID]);

    return (
        <div className="card">
            <div className="card-header">Correlated Sags:</div>

            <div className="card-body">
                <table className="table">
                    <thead>
                        <HeaderRow />
                    </thead>
                    <tbody>{tableRows}</tbody>
                </table>
            </div>
        </div>
    );
};

const Row = (row, background) => {

    return (
        <tr style={{ background: background }} key={row.EventID}>
            <td key={'EventID' + row.EventID}><a id="eventLink" href={openSEEInstance + '?eventid=' + row.EventID} target='_blank'><div style={{ width: '100%', height: '100%' }}>{row.EventID}</div></a></td>
            <td key={'EventType' + row.EventID}>{row.EventType}</td>
            <td key={'SagMagnitude' + row.EventID}>{row.SagMagnitudePercent}%</td>
            <td key={'SagDuration' + row.EventID}>{row.SagDurationMilliseconds} ms ({row.SagDurationCycles} cycles)</td>
            <td key={'StartTime' + row.EventID}>{moment(row.StartTime).format('HH:mm:ss.SSS')}</td>
            <td key={'MeterName' + row.EventID}>{row.MeterName}</td>
            <td key={'LineName' + row.EventID}>{row.LineName}</td>
        </tr>
    );
}

const HeaderRow = () => {
    return (
        <tr key='Header'>
            <th key='EventID'>Event ID</th>
            <th key='EventType'>Event Type</th>
            <th key='SagMagnitude'>Magnitude</th>
            <th key='SagDuration'>Duration</th>
            <th key='StartTime'>Start Time</th>
            <th key='MeterName'>Meter Name</th>
            <th key='LineName'>Line Name</th>
        </tr>
    );
}

export default EventSearchCorrelatedSags;
