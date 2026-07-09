//******************************************************************************************************
//  BreakerReport.tsx - Gbtc
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
//  07/02/2019 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************
import * as React from 'react';
import BreakerReportNavbar from './BreakerReportNavbar';
import * as queryString from 'querystring';
const momentDateFormat = "MM/DD/YYYY";
import moment from 'moment';
import { useLocation, useNavigate } from 'react-router-dom';

declare let homePath: string;

interface State {
    fromDate: string,
    toDate: string,
    breaker: string
}

const BreakerReport = () => {
    const [fromDate, setFromDate] = React.useState<string>('');
    const [toDate, setToDate] = React.useState<string>('');
    const [breaker, setBreaker] = React.useState<string>('');
    const navigate = useNavigate();
    const history = useLocation();

    React.useEffect(() => {
        const query = queryString.parse(history.search.replace("?", ""), "&", "=");

        setFromDate(query['fromDate'] != undefined ? query['fromDate'].toString() : moment().subtract(30, 'days').format(momentDateFormat));
        setToDate(query['toDate'] != undefined ? query['toDate'].toString() : moment().format(momentDateFormat));
        setBreaker(query['breaker'] != undefined ? query['breaker'].toString() : '0');

    }, []);


    React.useEffect(() => {
        const state = { breaker, toDate, fromDate };

        const q = queryString.stringify(state, "&", "=");
        const handle = setTimeout(() => navigate(history.pathname + '?' + q), 500);
        return (() => { clearTimeout(handle); })
    }, [fromDate,toDate,breaker])

    function setState(a: State) {
        setFromDate(a.fromDate);
        setToDate(a.toDate);
        setBreaker(a.breaker);
    }

    const link = `${homePath}api/BreakerReport/${(breaker == '0' ? `AllBreakersReport?` : `IndividualBreakerReport?breakerId=${breaker}&`)}startDate=${fromDate}&endDate=${toDate}`;
    return (
        <div style={{ width: '100%', height: '100%' }}>
            <BreakerReportNavbar toDate={toDate} fromDate={fromDate} breaker={breaker} stateSetter={setState} />
            <div style={{ width: '100%', height: 'calc( 100% - 163px)' }}>
                <embed style={{ width: 'inherit', height: 'inherit', position: 'absolute' }} id="pdfContent" src={link} key={link} type="application/pdf" />
            </div>
        </div>
    );
}

export default BreakerReport;