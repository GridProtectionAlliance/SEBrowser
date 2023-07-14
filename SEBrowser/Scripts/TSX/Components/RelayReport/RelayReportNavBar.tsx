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
import _ from 'lodash';
import ReportTimeFilter from '../ReportTimeFilter';

const momentDateFormat = "MM/DD/YYYY";
const momentTimeFormat = "HH:mm:ss.SSS";


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
    const [breakers, setBreakers] = React.useState<Breaker[]>([]);
    const [substations, setSubstations] = React.useState<Substation[]>([]);
    const [channels, setChannels] = React.useState<Channel[]>([]);

    React.useEffect(() => {
        let handle = getSubstationData();
        return () => { if (handle != null && handle.abort != null) handle.abort(); }
    }, [])

    React.useEffect(() => {
        const handle = getBreakerData();
        return () => { if (handle != null && handle.abort != null) handle.abort(); }
    }, [props.StationId]);

    React.useEffect(() => {
        if (substations.length == 0)
            return;
        if (substations.findIndex(s => s.LocationID == props.StationId) == -1)
            setStation(substations[0].LocationID);
    }, [substations, props.StationId])
   
    React.useEffect(() => {
        if (breakers.length == 0)
            return;
        if (breakers.findIndex(s => s.AssetId == props.BreakerID) == -1)
            setBreaker(breakers[0].AssetId)
    }, [breakers, props.BreakerID])

    React.useEffect(() => {
        const handle = getCoilData();
        return () => { if (handle != null && handle.abort != null) handle.abort(); }
    }, [props.BreakerID]);

    React.useEffect(() => {
        if (channels.length == 0)
            return;
        if (channels.findIndex(s => s.ID == props.ChannelID) == -1)
            setChannel(channels[0].ID)
    }, [channels, props.ChannelID])

    function getBreakerData(): JQuery.jqXHR<Breaker[] >{
        const h = $.ajax({
            type: "GET",
            url: `${homePath}api/PQDashboard/RelayReport/GetBreakerData?locationID=${props.StationId}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        h.done((d: Breaker[]) => {
            if (d != null)
                setBreakers(d);
        })

        return h;
       
    }

    function getSubstationData(): JQuery.jqXHR<Substation[]> {
        const h =  $.ajax({
            type: "GET",
            url: `${homePath}api/PQDashboard/RelayReport/GetSubstationData`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        h.done((d: Substation[]) => {
            if (d != null)
                setSubstations(d);
        })
        return h;
       
    }

    
    function getCoilData(): JQuery.jqXHR<Channel[]> {
        const h = $.ajax({
            type: "GET",
            url: `${homePath}api/PQDashboard/RelayReport/GetCoilData?lineID=${props.BreakerID}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        h.done((d: Channel[]) => {
            if (d != null)
                setChannels(d);
        })
        return h;
    }

    function setStation(id: number) {
        const object = _.clone(props) as RelayReportNavBarProps;
        object.StationId = id;
        props.stateSetter({ searchBarProps: object });
    }


    function setBreaker(id: number) {
        const object = _.clone(props) as RelayReportNavBarProps;
        object.BreakerID = id;
        props.stateSetter({ searchBarProps: object });
    }


    function setChannel(id: number) {
        const object = _.clone(props) as RelayReportNavBarProps;
        object.ChannelID = id;
        props.stateSetter({ searchBarProps: object });
    }

    function setDate(date: string) {

        const object = _.clone(props) as RelayReportNavBarProps;
        object.date = date;
        props.stateSetter({ searchBarProps: object });
    }

    function setTime(time: string) {

        const object = _.clone(props) as RelayReportNavBarProps;
        object.time = time;
        props.stateSetter({ searchBarProps: object });
    }

    function setTimeWindowUnits(timeWindowUnits: number) {

        const object = _.clone(props) as RelayReportNavBarProps;
        object.timeWindowUnits = timeWindowUnits;
        props.stateSetter({ searchBarProps: object });
    }

    function setWindowSize(windowSize: number) {

        const object = _.clone(this.props) as RelayReportNavBarProps;
        object.windowSize = windowSize;
        props.stateSetter({ searchBarProps: object });
    }


        return (
            <nav className="navbar navbar-expand-lg navbar-light bg-light">

                <div className="collapse navbar-collapse" id="navbarSupportedContent" style={{ width: '100%' }}>
                    <ul className="navbar-nav mr-auto" style={{ width: '100%' }}>
                        <li className="nav-item" style={{ width: '50%', paddingRight: 10 }}>
                            <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                                <legend className="w-auto" style={{ fontSize: 'large' }}>Trip Coil:</legend>
                                <form>
                                    <label style={{ width: '100%', position: 'relative', float: "left" }}>Substation: </label>
                                    <div className="form-group" style={{ height: 30 }}>
                                        <select style={{ height: 35, width: 'calc(98%)', position: 'relative', float: "left", border: '1px solid #ced4da', borderRadius: '.25em' }} onChange={(e) => {
                                            setStation(parseInt(e.target.value.toString()));
                                        }} value={props.StationId}>
                                            {substations.map((item,index) => <option key={index} value={item.LocationID} > {item.AssetName} </option>)}
                                        </select>
                                    </div>
                                    <label style={{ width: '100%', position: 'relative', float: "left" }}>Breaker: </label>
                                    <div className="form-group" style={{ height: 30 }}>
                                        <select style={{ height: 35, width: 'calc(98%)', position: 'relative', float: "left", border: '1px solid #ced4da', borderRadius: '.25em' }} onChange={(e) => {
                                            setBreaker(parseInt(e.target.value.toString()));
                                        }} value={props.BreakerID}>
                                            {breakers.map((item,index) => <option key={index} value={item.AssetId} > {item.AssetName} </option>)}
                                        </select>
                                    </div>
                                    <label style={{ width: '100%', position: 'relative', float: "left" }}>Trip Coil: </label>
                                    <div className="form-group" style={{ height: 30 }}>
                                        <select  style={{ height: 35, width: 'calc(98%)', position: 'relative', float: "left", border: '1px solid #ced4da', borderRadius: '.25em' }} onChange={(e) => {
                                            setChannel(parseInt(e.target.value.toString()));
                                        }} value={props.ChannelID}>
                                            {channels.map((item,index) => <option key={index} value={item.ID} > {item.Name} </option>)}
                                        </select>
                                    </div>
                                </form>
                            </fieldset>
                        </li>
                        
                        <li className="nav-item" style={{ width: '50%', paddingRight: 10 }}>
                            <ReportTimeFilter filter={{ date: props.date, time: props.time, windowSize: props.windowSize, timeWindowUnits: props.timeWindowUnits }} setFilter={(f) => {
                                setDate(f.date);
                                setTime(f.time);
                                setTimeWindowUnits(f.timeWindowUnits);
                                setWindowSize(f.windowSize);
                            }} showQuickSelect={false} />
                        </li>


                    </ul>
                </div>
            </nav>
        );
    
}

export default RelayReportNavBar;