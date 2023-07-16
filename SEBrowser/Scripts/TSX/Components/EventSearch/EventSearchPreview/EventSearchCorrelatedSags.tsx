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

const EventSearchCorrelatedSags: React.FC<SEBrowser.IWidget<any>> = (props) => {

    const [data, setData] = React.useState<ITimeCorrelatedSags[]>([]);

    let correlatedSagsHandle;

    function getTimeCorrelatedSags() {
        if (correlatedSagsHandle !== undefined) {
            correlatedSagsHandle.abort();
        }

        correlatedSagsHandle = $.ajax({
            type: 'GET',
            url: `${homePath}api/OpenXDA/GetTimeCorrelatedSags?eventId=${props.eventID}`,
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            cache: true,
            async: true,
        });

        return correlatedSagsHandle;
    }

    React.useEffect(() => {
        const handle = getTimeCorrelatedSags();
        handle.done((data) => {
            setData(data);
        });
        return () => { if (handle != null && handle.abort != null) handle.abort(); }
    }, [props.eventID]);

    return (
        <div className="card">
            <div className="card-header">Correlated Sags:</div>

            <div className="card-body">
            <div className="card-body" >
                <Table
                        cols={[
                            { key: 'EventID', field: 'EventID', label: 'Event ID', content: (d: ITimeCorrelatedSags) => <a id="eventLink" href={openSEEInstance + '?eventid=' + d.EventID} target='_blank'><div style={{ width: '100%', height: '100%' }}>{d.EventID}</div></a> },
                            { key: 'EventType', field: 'EventType', label: 'Event Type'},
                            { key: 'SagMagnitude', field: 'SagMagnitudePercent', label: 'Magnitude'},
                            { key: 'SagDuration', field: 'SagDurationMilliseconds', label: 'Duration', content: (d: ITimeCorrelatedSags) => `${d.SagDurationMilliseconds} ms (${d.SagDurationCycles} cycles)` },
                            { key: 'StartTime', field: 'StartTime', label: 'Start Time', content: (d: ITimeCorrelatedSags) => moment(d.StartTime).format('HH:mm:ss.SSS') },
                            { key: 'MeterName', field: 'MeterName', label: 'Meter Name'},
                            { key: 'LineName', field: 'LineName', label: 'Line Name'}
                        ]}
                        data={data}
                    onClick={() => { }}
                    onSort={() => { }}
                    sortKey={''}
                    ascending={true}
                    tableClass="table"
                    theadStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%', height: 50 }}
                    tbodyStyle={{ display: 'table', overflowY: 'scroll', width: '100%', maxHeight: props.maxHeight ?? 500 }}
                        rowStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                        selected={(d: ITimeCorrelatedSags) => d.EventID === props.eventID}
                    />
            </div>
            </div>
        </div>
    );
};


export default EventSearchCorrelatedSags;
