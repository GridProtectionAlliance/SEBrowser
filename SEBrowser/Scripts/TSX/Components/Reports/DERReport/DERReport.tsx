//******************************************************************************************************
//  DERReport.tsx - Gbtc
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
//  09/11/2019 - Christoph Lackner
//       Generated original version of source code.
//******************************************************************************************************

import * as React from 'react';
import queryString from 'querystring';
import moment from 'moment';
import { useNavigate, useLocation } from 'react-router-dom';
import { Alert } from '@gpa-gemstone/react-interactive';
import DERReportNavBar, { ISelectableOption } from './DERReportNavBar';
import DERReportPane from './DERReportPane';
import { ErrorBoundary } from '@gpa-gemstone/common-pages';

const momentDateFormat = "MM/DD/YYYY";
const momentTimeFormat = "HH:mm:ss.SSS";

function DERReport() {
    const history = useLocation();
    const navigate = useNavigate();

    const [date, setDate] = React.useState<string>(moment().format(momentDateFormat));
    const [time, setTime] = React.useState<string>(moment().format(momentTimeFormat));
    const [windowSize, setWindowSize] = React.useState<number>(1);
    const [timeWindowUnits, setTimeWindowUnits] = React.useState<number>(4);
    const [regulations, setRegulations] = React.useState<ISelectableOption[]>([])
    const [ders, setDERs] = React.useState<ISelectableOption[]>([]);
    const [configured, setConfigured] = React.useState<boolean | null>(null);

    React.useEffect(() => {
        const handle = getTableExists();
        handle.done(d => setConfigured(d)).fail(() => setConfigured(false));

        return () => {
            if (handle.abort != undefined) handle.abort();
        };
    }, []);

    React.useEffect(() => {
        const query = queryString.parse(history.search.replace("?", ""), "&", "=");

        setTime(query['time'] != undefined ? query['time'] as string : moment().format(momentTimeFormat))
        setDate(query['date'] != undefined ? query['date'] as string : moment().format(momentDateFormat))
        setWindowSize(query['windowSize'] != undefined ? parseInt(query['windowSize'] as string) : 1);
        setTimeWindowUnits(query['timeWindowUnits'] != undefined ? parseInt(query['timeWindowUnits'] as string) : 4);
    }, []);

    React.useEffect(() => {
        const queryParam = {
            time,
            date,
            windowSize,
            timeWindowUnits
        };
        const q = queryString.stringify(queryParam, "&", "=");
        const handle = setTimeout(() => navigate(history.pathname + '?' + q), 500);
        return (() => { clearTimeout(handle); })
    }, [time, date, windowSize, timeWindowUnits])

    if (configured === false)
        return (
            <Alert Class="alert-danger" Style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                DER Report is not properly configured.
            </Alert>
        );

    return (
        <div className="d-flex flex-column" style={{ width: '100%', height: '100%' }}>
            <ErrorBoundary ErrorMessage={'Error loading page.'}>
                <DERReportNavBar
                    date={date}
                    time={time}
                    windowSize={windowSize}
                    timeWindowUnits={timeWindowUnits}
                    setDate={setDate}
                    setTime={setTime}
                    setWindowSize={setWindowSize}
                    setTimeWindowUnits={setTimeWindowUnits}
                    setRegulations={setRegulations}
                    setDERs={setDERs}
                />
            </ErrorBoundary>
            {configured === true ?
                <ErrorBoundary ErrorMessage={'Error loading page.'} ClassName={'h-100'}>
                    <DERReportPane
                        date={date}
                        time={time}
                        windowSize={windowSize}
                        timeWindowUnits={timeWindowUnits}
                        regulations={regulations}
                        ders={ders}
                    />
                </ErrorBoundary>
            : null}
        </div>
    );
}

function getTableExists(): JQuery.jqXHR<boolean> {
    return $.ajax({
        type: "GET",
        url: `${homePath}api/DERReport/TableExists`,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: false,
        async: true
    });
}

export default DERReport;
