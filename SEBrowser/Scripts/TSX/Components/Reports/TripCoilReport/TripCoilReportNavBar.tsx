//******************************************************************************************************
//  EventSearchNavbar.tsx - Gbtc
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
//  09/21/2019 - Christoph Lackner
//       Generated original version of source code.
//
//******************************************************************************************************
import * as React from 'react';
import { Select } from '@gpa-gemstone/react-forms';
import { TimeFilter } from '@gpa-gemstone/common-pages';
import { Application } from '@gpa-gemstone/application-typings';
import { ReactIcons } from '@gpa-gemstone/gpa-symbols';
import { toGemstoneFilter, fromGemstoneFilter } from '../../EventSearch/TimeWindowUtils';
import { useAppSelector } from '../../../hooks';
import { SelectDateTimeSetting, SelectTimeZone } from '../../../Store/SettingsSlice';

interface Substation {
    LocationID: number, AssetKey: string, AssetName: string
}

interface Breaker {
    AssetId: number,
    AssetKey: string,
    AssetName: string
}

interface Channel {
    ID: number,
    Name: string
}

export interface RelayReportNavBarProps {
    stateSetter(state): void,
    BreakerID: number,
    ChannelID: number,
    StationId: number,
    date: string,
    time: string,
    windowSize: number,
    timeWindowUnits: number,

}

const RelayReportNavBar = (props: RelayReportNavBarProps) => {
    const dateTimeSetting = useAppSelector(SelectDateTimeSetting);
    const timeZone = useAppSelector(SelectTimeZone);
    const [breakers, setBreakers] = React.useState<Breaker[]>([]);
    const [substations, setSubstations] = React.useState<Substation[]>([]);
    const [channels, setChannels] = React.useState<Channel[]>([]);
    const [substationStatus, setSubstationStatus] = React.useState<Application.Types.Status>('uninitiated');
    const [breakerStatus, setBreakerStatus] = React.useState<Application.Types.Status>('uninitiated');
    const [channelStatus, setChannelStatus] = React.useState<Application.Types.Status>('uninitiated');

    React.useEffect(() => {
        setSubstationStatus('loading');
        const handle = getSubstationData();
        handle.done((d: Substation[]) => {
            if (d != null)
                setSubstations(d);
            setSubstationStatus('idle');
        }).fail(() => setSubstationStatus('error'));

        return () => { if (handle != null && handle.abort != null) handle.abort(); }
    }, [])

    React.useEffect(() => {
        setBreakerStatus('loading');
        const handle = getBreakerData(props.StationId);
        handle.done((d: Breaker[]) => {
            if (d != null)
                setBreakers(d);
            setBreakerStatus('idle');
        }).fail(() => setBreakerStatus('error'));

        return () => { if (handle != null && handle.abort != null) handle.abort(); }
    }, [props.StationId]);

    React.useEffect(() => {
        setChannelStatus('loading');
        const handle = getCoilData(props.BreakerID);
        handle.done((d: Channel[]) => {
            if (d != null)
                setChannels(d);
            setChannelStatus('idle');
        }).fail(() => setChannelStatus('error'));

        return () => { if (handle != null && handle.abort != null) handle.abort(); }
    }, [props.BreakerID]);

    function updateProps(record: RelayReportNavBarProps) {
        props.stateSetter({ searchBarProps: record });
    }

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="collapse navbar-collapse" id="navbarSupportedContent" style={{ width: '100%' }}>
                <ul className="navbar-nav mr-auto" style={{ width: '100%' }}>
                    <li className="nav-item" style={{ width: '50%', paddingRight: 10 }}>
                        <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                            <legend className="w-auto" style={{ fontSize: 'large' }}>Trip Coil:</legend>
                            <div className="row">
                                <div className="col-6">
                                    {substationStatus === 'loading' ?
                                        <div className='d-flex align-items-center justify-content-center'>
                                            <ReactIcons.SpiningIcon />
                                        </div>
                                        :
                                        <Select<RelayReportNavBarProps>
                                            Record={props}
                                            Field='StationId'
                                            Label='Substation:'
                                            Setter={updateProps}
                                            Options={substations.map(item => ({ Value: item.LocationID, Label: item.AssetName }))}
                                        />
                                    }
                                </div>
                                <div className="col-6">
                                    {breakerStatus === 'loading' ?
                                        <div className='d-flex align-items-center justify-content-center'>
                                            <ReactIcons.SpiningIcon />
                                        </div>
                                        :
                                        <Select<RelayReportNavBarProps>
                                            Record={props}
                                            Field='BreakerID'
                                            Label='Breaker:'
                                            Setter={updateProps}
                                            Options={breakers.map(item => ({ Value: item.AssetId, Label: item.AssetName }))}
                                        />
                                    }
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-12">
                                    {channelStatus === 'loading' ?
                                        <div className='d-flex align-items-center justify-content-center'>
                                            <ReactIcons.SpiningIcon />
                                        </div>
                                        :
                                        <Select<RelayReportNavBarProps>
                                            Record={props}
                                            Field='ChannelID'
                                            Label='Trip Coil:'
                                            Setter={updateProps}
                                            Options={channels.map(item => ({ Value: item.ID, Label: item.Name }))}
                                        />
                                    }
                                </div>
                            </div>
                        </fieldset>
                    </li>

                    <li className="nav-item" style={{ width: '50%', paddingRight: 10 }}>
                        <TimeFilter
                            filter={toGemstoneFilter({ date: props.date, time: props.time, windowSize: props.windowSize, timeWindowUnits: props.timeWindowUnits })}
                            setFilter={(start, end, unit, duration) => {
                                const f = fromGemstoneFilter(start, end, unit, duration);
                                updateProps({ ...props, date: f.date, time: f.time, timeWindowUnits: f.timeWindowUnits, windowSize: f.windowSize });
                            }}
                            showQuickSelect={true}
                            dateTimeSetting={dateTimeSetting}
                            timeZone={timeZone}
                        />
                    </li>


                </ul>
            </div>
        </nav>
    );

}

function getSubstationData(): JQuery.jqXHR<Substation[]> {
    return $.ajax({
        type: "GET",
        url: `${homePath}api/PQDashboard/RelayReport/GetSubstationData`,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        async: true
    });
}

function getBreakerData(locationID: number): JQuery.jqXHR<Breaker[]> {
    return $.ajax({
        type: "GET",
        url: `${homePath}api/PQDashboard/RelayReport/GetBreakerData?locationID=${locationID}`,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        async: true
    });
}

function getCoilData(lineID: number): JQuery.jqXHR<Channel[]> {
    return $.ajax({
        type: "GET",
        url: `${homePath}api/PQDashboard/RelayReport/GetCoilData?lineID=${lineID}`,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        async: true
    });
}

export default RelayReportNavBar;
