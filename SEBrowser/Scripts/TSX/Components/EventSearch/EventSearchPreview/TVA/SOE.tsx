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

import React from 'react';
import { SEBrowser } from '../../../../global';
import { MultiSelect, Table, Column } from '@gpa-gemstone/react-table';


type Status = 'ABNORMAL' | 'Close' | 'No' | 'NORMAL' | 'RECEIVED' | 'Start' | 'Trip' | 'Yes';

type ISOEFilter = { 'abnormal': boolean, 'close': boolean, 'no': boolean, 'normal': boolean, 'received': boolean, 'start': boolean, 'trip': boolean, 'yes': boolean };
type SOEInfo = { Time: string, Alarm: string, Status: string };

const SOE: React.FC<SEBrowser.IWidget<any>> = (props) => {
    const [soeInfo, setSOEInfo] = React.useState<SOEInfo[]>([]);
    const [statusFilter, setStatusFilter] = React.useState<ISOEFilter>({ 'abnormal': false, 'close': false, 'no': false, 'normal': false, 'received': false, 'start': false, 'trip': false, 'yes': false });
    const [timeWindow, setTimeWindow] = React.useState<number>(2);
    
    React.useEffect(() => {
        return GetData();
    }, [props.eventID, timeWindow, statusFilter]);

    const cols: Column<SOEInfo>[] = [
        { key: "Time", label: "Time", field: "Time" },
        { key: "Alarm", label: "Alarm", field: "Alarm" },
        { key: "Status", label: "Status", field: "Status" }
    ];

    function GetData() {
        let handle = $.ajax({
            type: "GET",
            url: `${homePath}api/SOE/${props.eventID}/${timeWindow}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        handle.done(data => {
            setSOEInfo(data);
        });

        return function () {
            if (handle.abort != undefined) handle.abort();
        }
    }

    function HandleStatusFilterChange(key: keyof ISOEFilter) {
        statusFilter[key] = !statusFilter[key]
        setStatusFilter(statusFilter);
    }

    return (
        <div className="card">
            <div className="card-header">SOE:</div>
            <div className="card-body">
                <div className='row'>
                    <div className='col'>
                        <label>Time Window(s)</label>
                        <select value={timeWindow} onChange={(evt) => setTimeWindow(parseFloat(evt.target.value))}>
                            <option value={2}>2</option>
                            <option value={10}>10</option>
                            <option value={60}>60</option>

                        </select>
                    </div>
                    <div className='col-8'>
                        <fieldset className='border'>
                            <legend style={{ font: 'inherit' }}>Filter Out:</legend>
                            {Object.keys(statusFilter).map((key, index) => <div key={index} className='form-check form-check-inline'><input className="form-check-input" type="checkbox" value={statusFilter[key]} onChange={() => HandleStatusFilterChange(key)} /><label className="form-check-label">{key}</label></div>)}
                        </fieldset>
                    </div>

                </div>
                <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                    <Table
                        cols={cols}
                        data={soeInfo.filter(si => !statusFilter[si.Status])}
                        onClick={() => { }}
                        onSort={() => { }}
                        sortKey={'Time'}
                        ascending={true}
                        tableClass="table"
                        keySelector={data => data.Time}
                        theadStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%', height: 50 }}
                        tbodyStyle={{ display: 'block', overflowY: 'scroll', width: '100%' }}
                        rowStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                    />
                </div>
            </div>
        </div>
    );
}

export default SOE;