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
import { SelectDateTimeFormat } from '../SettingsSlice';
import { useSelector } from 'react-redux';
import { SEBrowser } from 'Scripts/TSX/global';

interface IState {
    searchBarProps: RelayReportNavBarProps,
}

const RelayReport = () => {
    const navigate = useNavigate();
    const history = useLocation();
    const dateTimeFormat = useSelector(SelectDateTimeFormat);

    const [BreakerID, setBreakerID] = React.useState<number>(0);
    const [ChannelID, setChannelID] = React.useState<number>(0);
    const [StationId, setStationId] = React.useState<number>(0);
    const [time, setTime] = React.useState<SEBrowser.IReportTimeFilter>({
        start: '01/01/2000 12:00:00.000',
        end: '01/02/2000 12:00:00.000',
    });

    React.useEffect(() => {
        const query = queryString.parse(history.search.replace("?", ""), "&", "=");
        setBreakerID(query['breakerid'] != undefined ? parseInt(query['breakerid'] as string) : -1);
        setChannelID(query['channelid'] != undefined ? parseInt(query['channelid'] as string) : -1);
        setStationId(query['StationId'] != undefined ? parseInt(query['StationId'] as string) : -1);

        const newTime = {
            start: query['start']?.toString() ?? moment().utc().subtract(8, 'hours').format(dateTimeFormat),
            end: query['end']?.toString() ?? moment().utc().format(dateTimeFormat)
        }
        setTime(newTime);
    }, []);

    React.useEffect(() => {
        const state = { BreakerID, ChannelID, StationId, start: time.start, end: time.end };
        const q = queryString.stringify(state, "&", "=");
        const handle = setTimeout(() => navigate(history.pathname + '?' + q), 500);
        return (() => { clearTimeout(handle); })
    }, [BreakerID, ChannelID, StationId, time])

    function setState(obj: IState) {
        setBreakerID(obj.searchBarProps.BreakerID);
        setChannelID(obj.searchBarProps.ChannelID);
        setTime(obj.searchBarProps.TimeFilter);
        setStationId(obj.searchBarProps.StationId);
    }

    const searchBarProps: RelayReportNavBarProps = { BreakerID, ChannelID, StationId, TimeFilter: time, stateSetter: setState };

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