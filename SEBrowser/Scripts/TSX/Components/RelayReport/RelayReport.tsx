//******************************************************************************************************
//  EventSearch.tsx - Gbtc
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
import RelayReportNavBar, { RelayReportNavBarProps } from './RelayReportNavBar';
import RelayReportPane from './RelayReportPane';
import * as queryString from 'querystring';
import moment from 'moment';
import { useLocation, useNavigate } from 'react-router-dom';

const momentDateFormat = "MM/DD/YYYY";
const momentTimeFormat = "HH:mm:ss.SSS";

interface IState {
    searchBarProps: RelayReportNavBarProps,
}

const RelayReport = (props: {}) => {
    const navigate = useNavigate();
    const history = useLocation();

    const [BreakerID, setBreakerID] = React.useState<number>(0);
    const [ChannelID, setChannelID] = React.useState<number>(0);
    const [StationId, setStationId] = React.useState<number>(0);
    const [date, setDate] = React.useState<string>('');
    const [time, setTime] = React.useState<string>('');
    const [windowSize, setWindowSize] = React.useState<number>(0);
    const [timeWindowUnits, setTimeWindowUnits] = React.useState<number>(0);

    React.useEffect(() => {
        var query = queryString.parse(history.search.replace("?", ""), "&", "=");
        setBreakerID(query['breakerid'] != undefined ? parseInt(query['breakerid'] as string) : -1);
        setChannelID(query['channelid'] != undefined ? parseInt(query['channelid'] as string) : -1);
        setDate(query['date'] != undefined ? query['date'] as string : moment().format(momentDateFormat));
        setTime(query['time'] != undefined ? query['time'] as string : moment().format(momentTimeFormat));
        setWindowSize(query['windowSize'] != undefined ? parseInt(query['windowSize'].toString()) : 10);
        setTimeWindowUnits(query['timeWindowUnits'] != undefined ? parseInt(query['timeWindowUnits'].toString()) : 2);
        setStationId(query['StationId'] != undefined ? parseInt(query['StationId'] as string) : -1);

    }, []);

    React.useEffect(() => {
        const state = {
            BreakerID, ChannelID, StationId, date, time,
            windowSize, timeWindowUnits
        };

        let q = queryString.stringify(state, "&", "=");
        let handle = setTimeout(() => navigate(history.pathname + '?' + q), 500);
        return (() => { clearTimeout(handle); })

    }, [BreakerID, ChannelID, StationId, date, time,
        windowSize, timeWindowUnits])

    function setState(obj: IState) {
        setBreakerID(obj.searchBarProps.BreakerID);
        setChannelID(obj.searchBarProps.ChannelID);
        setDate(obj.searchBarProps.date);
        setTime(obj.searchBarProps.time);
        setWindowSize(obj.searchBarProps.windowSize);
        setTimeWindowUnits(obj.searchBarProps.timeWindowUnits);
        setStationId(obj.searchBarProps.StationId);
    }

    const searchBarProps: RelayReportNavBarProps = {
        BreakerID, ChannelID, StationId, date, time,
        windowSize, timeWindowUnits, stateSetter: setState
    };

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <RelayReportNavBar {...searchBarProps} />
            <div style={{ width: '100%', height: 'calc( 100% - 250px)' }}>
                <div style={{ width: '100%', height: '100%', maxHeight: '100%', position: 'relative', float: 'right', overflowY: 'scroll' }}>
                    <RelayReportPane {...searchBarProps} />
                </div>

            </div>
        </div>
    );
}

export default RelayReport;