//******************************************************************************************************
//  SOE.tsx - Gbtc
//
//  Copyright © 2020, Grid Protection Alliance.  All Rights Reserved.
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
//  03/23/2020 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import Table from '@gpa-gemstone/react-table';
import moment from 'moment';
import React from 'react';
import { SEBrowser } from '../../../../global';

interface IInterruption {
    TimeOut: string,
    TimeIn?: string,
    Class?: string,
    Area: string,
    ReportNumber: number,
    Explanation?: string,
    CircuitInfo: string
}

const InterruptionReport: React.FC<SEBrowser.IWidget> = (props) => {
    const [data, setData] = React.useState<IInterruption[]>([]);
    const [state, setState] = React.useState<('loading' | 'idle' | 'error')>('idle');
    const [hours, setHours] = React.useState<number>(6);

    React.useEffect(() => {
        let handle = getData();
        return () => { if (handle != null && handle.abort != null) handle.abort();}
    }, [hours])

    function getData() {

        setState('loading');
        return $.ajax({
            type: "GET",
            url: `${homePath}api/InterruptionReport/GetEvents/${hours}/${props.eventID}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        }).done((d) => { setData(d); setState('idle'); }).fail(() => setState('error'));

    }

    function formatDif(Tout: string, Tin: string) {
        const T1 = moment(Tin);
        const T2 = moment(Tout);

        let r = '';
        if (T1.diff(T2, 'minute') >= 60)
            r = T1.diff(T2, 'hour').toFixed(0) + ' Hrs ';
        r = r + (T1.diff(T2, 'minute') % 60) + ' Min';
        return r;

    }
    return (
        <div className="card">
            <div className="card-header">Interruption Report:</div>
            <div className="card-body">
                <div className='row'>
                    <div className='col'>
                        <label>Time Window (hrs)</label>
                        <select value={hours} onChange={(evt) => setHours(parseInt(evt.target.value))}>
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={6}>6</option>
                            <option value={12}>12</option>
                            <option value={24}>24</option>
                            <option value={48}>48</option>
                        </select>
                    </div>
                </div>
                <div className='row'>
                    <div className='col'>
                <Table<IInterruption>
                    cols={[
                        { key: 'CircuitInfo', field: 'CircuitInfo', label: 'Substation Ckt' },
                        {
                            key: 'TimeOut', field: 'TimeOut', label: 'Time Out',
                            content: (record) => (record.TimeIn == null && record.TimeOut != null ? moment(record.TimeOut).format("HH:mm") : null)
                        },
                        {
                            key: 'TimeIn', field: 'TimeIn', label: 'Time In',
                            content: (record) => (record.TimeIn == null ? null : moment(record.TimeIn).format("HH:mm"))
                        },
                        {
                            key: 'TotalTime', field: 'TimeIn', label: 'Total Time',
                            content: (record) => (record.TimeOut == null || record.TimeIn == null ? null : formatDif(record.TimeOut, record.TimeIn) )
                        },
                        { key: 'Class', field: 'Class', label: 'Class Type' },
                        { key: 'Area', field: 'Area', label: 'Affected Area/District' },
                        { key: 'ReportNumber', field: 'ReportNumber', label: 'Report' },
                        { key: 'Explanation', field: 'Explanation', label: 'Explanation' }
                    ]}
                    data={data}
                    onClick={() => { }}
                    onSort={() => { }}
                    sortKey={'TimeOut'}
                    ascending={true}
                    tableClass="table"
                    theadStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%', height: 50 }}
                    tbodyStyle={{ display: 'block', overflowY: 'scroll', maxHeight: 600, height: 600, width: '100%' }}
                    rowStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                    />
                    </div>
                    </div>
            </div>
        </div>
    );
}

export default InterruptionReport;