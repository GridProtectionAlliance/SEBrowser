//******************************************************************************************************
//  CapBankReport.tsx - Gbtc
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
//  08/06/2020 - Christoph Lackner
//       Generated original version of source code.
//******************************************************************************************************

import * as React from 'react';
import CapBankReportNavBar, { CapBankReportNavBarProps } from './CapBankReportNavBar';
import CapBankReportPane from './CapBankReportPane';
import * as queryString from 'querystring';
import moment from 'moment';
import { useLocation, useNavigate } from 'react-router-dom';

const momentDateFormat = "MM/DD/YYYY";
const momentTimeFormat = "HH:mm:ss.SSS";

interface IState {
    searchBarProps: CapBankReportNavBarProps,
}

const CapBankReport = (props: {}) => {
    const navigate = useNavigate();
    const history = useLocation();
    const [CapBankID, setCapBankID] = React.useState<number>(0);
    const [date, setDate] = React.useState<string>('');
    const [time, setTime] = React.useState<string>('');
    const [windowSize, setWindowSize] = React.useState<number>(0);
    const [timeWindowUnits, setTimeWindowUnits] = React.useState<number>(0);
    const [selectedBank, setSelectedBank] = React.useState<number>(0);
    const [StationId, setStationID] = React.useState<number>(0);
    const [numBanks, setNumBanks] = React.useState<number>(0);

    const [ResFilt, setResFilt] = React.useState<number[]>([]);
    const [StatFilt, setStatFilt] = React.useState<number[]>([]);
    const [OpFilt, setOpFilt] = React.useState<number[]>([]);
    const [RestFilt, setRestFilt] = React.useState<number[]>([]);
    const [PISFilt, setPISFilt] = React.useState<number[]>([]);
    const [HealthFilt, setHealthFilt] = React.useState<number[]>([]);
    const [PhaseFilter, setPhaseFilter] = React.useState<number[]>([]);

    React.useEffect(() => {
        const query = queryString.parse(history.search.replace("?", ""), "&", "=");

        setCapBankID(query['capBankId'] != undefined ? parseInt(query['capBankId'] as string) : -1);
        setDate(query['date'] != undefined ? query['date'] as string : moment().format(momentDateFormat));
        setTime(query['time'] != undefined ? query['time'] as string : moment().format(momentTimeFormat));
        setWindowSize(query['windowSize'] != undefined ? parseInt(query['windowSize'].toString()) : 10);
        setTimeWindowUnits(query['timeWindowUnits'] != undefined ? parseInt(query['timeWindowUnits'].toString()) : 2);
        setSelectedBank(query['selectedBank'] != undefined ? parseInt(query['selectedBank'].toString()) : -1);
        setStationID(query['StationId'] != undefined ? parseInt(query['StationId'] as string) : -1);
        setNumBanks(0);
        setResFilt([0, 1]);
        setStatFilt([999]);
        setOpFilt([999]);
        setRestFilt([999]);
        setPISFilt([999]);
        setHealthFilt([999]);
        setPhaseFilter([999]);
        
    }, []);

    React.useEffect(() => {
        const state = {
            CapBankID, date, time, windowSize, timeWindowUnits,
            selectedBank, StationId, numBanks, ResFilt, StatFilt,
            OpFilt, RestFilt, PISFilt, HealthFilt, PhaseFilter };

        const q = queryString.stringify(state, "&", "=");
        const handle = setTimeout(() => navigate(history.pathname + '?' + q), 500);
        return (() => { clearTimeout(handle); })

    }, [CapBankID, date, time, windowSize, timeWindowUnits,
        selectedBank, StationId, numBanks, ResFilt, StatFilt,
        OpFilt, RestFilt, PISFilt, HealthFilt, PhaseFilter])

    function setState(a: IState) {
        setCapBankID(a.searchBarProps.CapBankID);
        setDate(a.searchBarProps.date);
        setTime(a.searchBarProps.time);
        setWindowSize(a.searchBarProps.windowSize);
        setTimeWindowUnits(a.searchBarProps.timeWindowUnits);
        setSelectedBank(a.searchBarProps.selectedBank);
        setStationID(a.searchBarProps.StationId);
        setNumBanks(a.searchBarProps.numBanks);
        setResFilt(a.searchBarProps.ResFilt);
        setStatFilt(a.searchBarProps.StatFilt);
        setOpFilt(a.searchBarProps.OpFilt);
        setRestFilt(a.searchBarProps.RestFilt);
        setPISFilt(a.searchBarProps.PISFilt);
        setHealthFilt(a.searchBarProps.HealthFilt);
        setPhaseFilter(a.searchBarProps.PhaseFilter);
    }

    const searchBarProps: CapBankReportNavBarProps = {
        CapBankID, date, time, windowSize, timeWindowUnits,
        selectedBank, StationId, numBanks, ResFilt, StatFilt,
        OpFilt, RestFilt, PISFilt, HealthFilt, PhaseFilter,
        stateSetter: setState
    }

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <CapBankReportNavBar {...searchBarProps} />
            <div style={{ width: '100%', height: 'calc( 100% - 250px)' }}>
                <CapBankReportPane {...searchBarProps} />
            </div>
        </div>
    );
}

export default CapBankReport;


