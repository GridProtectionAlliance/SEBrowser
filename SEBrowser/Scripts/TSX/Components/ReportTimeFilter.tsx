//******************************************************************************************************
//  ReportTimeFilter.tsx - Gbtc
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
//  09/16/2021 - Christoph Lackner
//       Generated original version of source code.
//******************************************************************************************************

import * as React from 'react';
import { SEBrowser } from '../global';

interface IProps {
    filter: SEBrowser.IReportTimeFilter;
    setFilter: (filter: SEBrowser.IReportTimeFilter) => void
}
const ReportTimeFilter = (props: IProps) => {

    return (
        <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
            <legend className="w-auto" style={{ fontSize: 'large' }}>Time Window:</legend>
            <form>
                <label style={{ width: '100%', position: 'relative', float: "left" }} >Date: </label>
                <div className="form-group" style={{ height: 30 }}>
                    <div className='input-group' style={{ width: 'calc(49%)', position: 'relative', float: "right" }}>
                        <input id="timePicker" className='form-control' value={props.filter.time} onChange={(e) => {
                            props.setFilter({ ...props.filter, time: (e.target as any).value });
                        }} />
                    </div>

                    <div className='input-group date' style={{ width: 'calc(49%)', position: 'relative', float: "left" }}>
                        <input className='form-control' id='datePicker' value={props.filter.date} onChange={(e) => {
                            props.setFilter({ ...props.filter, date: (e.target as any).value });
                        }} />
                    </div>

                </div>
                <label style={{ width: '100%', position: 'relative', float: "left" }}>Time Window(+/-): </label>
                <div className="form-group" style={{ height: 30 }}>
                    <input style={{ height: 35, width: 'calc(49%)', position: 'relative', float: "left", border: '1px solid #ced4da', borderRadius: '.25em' }} value={props.filter.windowSize} onChange={(e) => {
                        props.setFilter({ ...props.filter, windowSize: (e.target as any).value });
                    }} type="number" />
                    <select style={{ height: 35, width: 'calc(49%)', position: 'relative', float: "right", border: '1px solid #ced4da', borderRadius: '.25em' }} value={props.filter.timeWindowUnits} onChange={(e) => {
                        props.setFilter({ ...props.filter, timeWindowUnits: (e.target as any).value });
                    }} >
                        <option value="7">Year</option>
                        <option value="6">Month</option>
                        <option value="5">Week</option>
                        <option value="4">Day</option>
                        <option value="3">Hour</option>
                        <option value="2">Minute</option>
                        <option value="1">Second</option>
                        <option value="0">Millisecond</option>
                    </select>

                </div>
            </form>
        </fieldset>
    );
}
export default ReportTimeFilter;