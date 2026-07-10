//******************************************************************************************************
//  DERAnalysisReport.tsx - Gbtc
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
import DERAnalysisReportNavBar, { ISelectableOption } from './DERAnalysisReportNavBar';
import DERAnalysisReportPane from './DERAnalysisReportPane';

const momentDateFormat = "MM/DD/YYYY";
const momentTimeFormat = "HH:mm:ss.SSS";

function DERAnalysisReport() {
    const history = useLocation();
    const navigate = useNavigate();

    const [date, setDate] = React.useState<string>(moment().format(momentDateFormat));
    const [time, setTime] = React.useState<string>(moment().format(momentTimeFormat));
    const [windowSize, setWindowSize] = React.useState<number>(1);
    const [timeWindowUnits, setTimeWindowUnits] = React.useState<number>(4);
    const [regulations, setRegulations] = React.useState<ISelectableOption[]>([])
    const [ders, setDERs] = React.useState<ISelectableOption[]>([]);

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

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <DERAnalysisReportNavBar
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
            <DERAnalysisReportPane
                date={date}
                time={time}
                windowSize={windowSize}
                timeWindowUnits={timeWindowUnits}
                regulations={regulations}
                ders={ders}
            />
        </div>
    );
}

export default DERAnalysisReport;
