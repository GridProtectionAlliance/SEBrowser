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

type Status = 'ABNORMAL' | 'Close' | 'No' | 'NORMAL' | 'RECEIVED' | 'Start' | 'Trip' | 'Yes';

const SOE: React.FC<SEBrowser.IWidget> = (props) => {
    const [soeInfo, setSOEInfo] = React.useState<Array<{ Time: string, Alarm: string, Status: string }>>([]);
    const [statusFilter, setStatusFilter] = React.useState<{ 'ABNORMAL': boolean, 'Close': boolean, 'No': boolean, 'NORMAL': boolean, 'RECEIVED': boolean, 'Start': boolean, 'Trip': boolean, 'Yes': boolean}>({ 'ABNORMAL':false, 'Close':false, 'No':false, 'NORMAL': false, 'RECEIVED': false, 'Start': false, 'Trip':false, 'Yes': false})
    const [timeWindow, setTimeWindow] = React.useState<number>(2);
    const [table, setTable] = React.useState<any>(null);

    React.useEffect(() => {
        return GetData();
    }, [props.eventID, timeWindow, statusFilter]);

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
            BuildTable(data);
        });

        return function () {
            if (handle.abort != undefined) handle.abort();
        }
    }

    function HandleStatusFilterChange(key: string) {
        statusFilter[key] = !statusFilter[key]
        setStatusFilter(statusFilter);
        BuildTable(soeInfo)
    }

    function BuildTable(data) {
        let tbl = data.filter(si => !statusFilter[si.Status]).map((si, index) => <tr key={index}>
            <td>{si.Time}</td>
            <td>{si.Alarm}</td>
            <td>{si.Status}</td>
        </tr>)

        setTable(tbl);
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
                <div style={{maxHeight: 200, overflowY:'auto'}}>
                    <table className='table'>
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>Alarm</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            { table }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default SOE;