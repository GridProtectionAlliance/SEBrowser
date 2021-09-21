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
import moment from 'moment';

interface IProps {
    filter: SEBrowser.IReportTimeFilter;
    setFilter: (filter: SEBrowser.IReportTimeFilter) => void,
    showQuickSelect: boolean
}

interface IQuickSelect { label: string, createFilter: () =>  SEBrowser.IReportTimeFilter }

const momentDateFormat = "MM/DD/YYYY";
const momentTimeFormat = "HH:mm:ss.SSS";

const AvailableQuickSelects: IQuickSelect[] = [
    {
        label: 'This Hour', createFilter: () => {
            const t = moment.utc().startOf('hour');
            t.add(30, 'minutes');
            return {
                date: t.format(momentDateFormat),
                time: t.format(momentTimeFormat),
                timeWindowUnits: 2,
                windowSize: 30
            }
        }
    },
    {
        label: 'Last Hour', createFilter: () => {
            const t = moment.utc().startOf('hour').subtract(1, 'hour');
            t.add(30, 'minutes')
            return {
                date: t.format(momentDateFormat),
                time: t.format(momentTimeFormat),
                timeWindowUnits: 2,
                windowSize: 30
            }
        }
    },
    {
        label: 'Last 60 Minutes', createFilter: () => {
            const t = moment.utc().startOf('minute').subtract(1, 'hour');
            t.add(30, 'minutes');
            return {
                date: t.format(momentDateFormat),
                time: t.format(momentTimeFormat),
                timeWindowUnits: 2,
                windowSize: 30
            }
        }
    },
    {
        label: 'Today', createFilter: () => {
            const t = moment.utc().startOf('day');
            t.add(12, 'hours');
            return {
                date: t.format(momentDateFormat),
                time: t.format(momentTimeFormat),
                timeWindowUnits: 3,
                windowSize: 12
            }
        }
    },
    {
        label: 'Yesterday', createFilter: () => {
            const t = moment.utc().startOf('day').subtract(1,'days');
            t.add(12, 'hours');
            return {
                date: t.format(momentDateFormat),
                time: t.format(momentTimeFormat),
                timeWindowUnits: 3,
                windowSize: 12
            }
        } },
    {
        label: 'Last 24 Hours', createFilter: () => {
            const t = moment.utc().subtract(24, 'hours');
            t.add(12, 'hours');
            return {
                date: t.format(momentDateFormat),
                time: t.format(momentTimeFormat),
                timeWindowUnits: 3,
                windowSize: 12
            }
        }
    },
    {
        label: 'This Week', createFilter: () => {
            const t = moment.utc().startOf('week');
            t.add(3.5*24, 'hours');
            return {
                date: t.format(momentDateFormat),
                time: t.format(momentTimeFormat),
                timeWindowUnits: 3,
                windowSize: 3.5*24
            }
        }
    },
    {
        label: 'Last Week', createFilter: () => {
            const t = moment.utc().startOf('week');
            t.subtract(3.5*24, 'hours');
            return {
                date: t.format(momentDateFormat),
                time: t.format(momentTimeFormat),
                timeWindowUnits: 3,
                windowSize: 3.5*24
            }
        }
    },
    {
        label: 'Last 7 Days', createFilter: () => {
            const t = moment.utc().startOf('day');
            t.subtract(3.5*24, 'hours');
            return {
                date: t.format(momentDateFormat),
                time: t.format(momentTimeFormat),
                timeWindowUnits: 5,
                windowSize: 3.5*24
            }
        }
    },
    {
        label: 'This Month', createFilter: () => {
            const t = moment.utc().startOf('month');
            t.add(12 * t.daysInMonth(), 'hours');
            return {
                date: t.format(momentDateFormat),
                time: t.format(momentTimeFormat),
                timeWindowUnits: 4,
                windowSize: t.daysInMonth()/2.0
            }
        }
    },
    {
        label: 'Last Month', createFilter: () => {
            const t = moment.utc().startOf('month').subtract(1,'month');
            t.add(12 * t.daysInMonth(), 'hours');
            return {
                date: t.format(momentDateFormat),
                time: t.format(momentTimeFormat),
                timeWindowUnits: 4,
                windowSize: t.daysInMonth() / 2.0
            }
        }
    },
    {
        label: 'Last 30 Days', createFilter: () => {
            const t = moment.utc().startOf('day');
            t.subtract(15, 'days');
            return {
                date: t.format(momentDateFormat),
                time: t.format(momentTimeFormat),
                timeWindowUnits: 5,
                windowSize: 15
            }
        }
    },
    {
        label: 'This Quarter', createFilter: () => ({ date: '', time: '', timeWindowUnits: 1, windowSize: 0.5 })
    },
    {
        label: 'Last Quarter', createFilter: () => ({ date: '', time: '', timeWindowUnits: 1, windowSize: 0.5 })
    },
    {
        label: 'Last 90 Days', createFilter: () => {
            const t = moment.utc().startOf('day');
            t.subtract(45, 'days');
            return {
                date: t.format(momentDateFormat),
                time: t.format(momentTimeFormat),
                timeWindowUnits: 4,
                windowSize: 45
            }
        }       
},
    {
        label: 'This Year', createFilter: () => {
            const t = moment.utc().startOf('year');
            t.add(6, 'month');
            return {
                date: t.format(momentDateFormat),
                time: t.format(momentTimeFormat),
                timeWindowUnits: 6,
                windowSize: 6
            }
        }
    },
    {
        label: 'Last Year', createFilter: () => {
            const t = moment.utc().startOf('year').subtract(1,'year');
            t.add(6, 'month');
            return {
                date: t.format(momentDateFormat),
                time: t.format(momentTimeFormat),
                timeWindowUnits: 6,
                windowSize: 6
            }
        }
    },
    {
        label: 'Last 365 Days', createFilter: () => {
            const t = moment.utc().startOf('day');
            t.subtract(182.5, 'days');
            return {
                date: t.format(momentDateFormat),
                time: t.format(momentTimeFormat),
                timeWindowUnits: 4,
                windowSize: 182
            }
        }
    }
];

let nRows = AvailableQuickSelects.length / 3;
if (AvailableQuickSelects.length % 3 > 0)
    nRows++;
const ReportTimeFilter = (props: IProps) => {

    React.useEffect(() => {
        $('#datePicker').datetimepicker({ format: momentDateFormat });
        $('#datePicker').on('dp.change', (e) => {
            props.setFilter({ ...props.filter, date: (e.target as any).value });
        });

        $('#timePicker').datetimepicker({ format: momentTimeFormat });
        $('#timePicker').on('dp.change', (e) => {
            props.setFilter({ ...props.filter, time: (e.target as any).value });
        });

    });


    return (
        <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
            <legend className="w-auto" style={{ fontSize: 'large' }}>Time Window:</legend>
            <div className="row">
                <div className={"col-" + (props.showQuickSelect? "6" : "12")}>
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
                </div>
                {props.showQuickSelect ?
                    <div className={"col-6"}>
                        {Array.from({ length: nRows }, (_, i) => i).map(i => (
                            <ul className="list-inline list-inline-horizontal">
                                <li onClick={() => props.setFilter(AvailableQuickSelects[i * 3].createFilter())} 
                                    className="list-inline-item badge badge-secondary">{AvailableQuickSelects[i * 3].label}</li>
                                {i * 3 + 1 < AvailableQuickSelects.length ?
                                    <li className="list-inline-item badge badge-secondary" onClick={() => props.setFilter(AvailableQuickSelects[i * 3 + 1].createFilter())}>
                                            {AvailableQuickSelects[i * 3 + 1].label}
                                        </li> : null}
                                {i * 3 + 2 < AvailableQuickSelects.length ?
                                    <li className="list-inline-item badge badge-secondary" onClick={() => props.setFilter(AvailableQuickSelects[i * 3 + 2].createFilter())}>
                                        {AvailableQuickSelects[i * 3 + 2].label}
                                    </li> : null}
                            </ul>)
                            )}
                    </div> : null}
            </div>
        </fieldset>
    );
}
export default ReportTimeFilter;