//******************************************************************************************************
//  EventSearchRelayPerformance.tsx - Gbtc
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
//  08/22/2019 - Christoph Lackner
//       Generated original version of source code.
//
//******************************************************************************************************

import React from 'react';
import OpenSEEService from '../../../../TS/Services/OpenSEE';
import { SEBrowser } from '../../../global';
import Table from '@gpa-gemstone/react-table';

interface IEventSearchBreakerPerformance {
    TTwindow: number,
    PTwindow: number,
    TCCwindow: number,
    L1window: number,
    L2window: number,
}

    const EventSearchBreakerPerformance: React.FC<SEBrowser.IWidget<unknown>> = (props) => {
    const TTwindow = React.useRef(null);
    const PTwindow = React.useRef(null);
    const TCCwindow = React.useRef(null);
    const L1window = React.useRef(null);
    const L2window = React.useRef(null);
    const [showRelayHistory, setShowRelayHistory] = React.useState(false);
    const service = new OpenSEEService();
    const [data, setData] = React.useState<IEventSearchBreakerPerformance[]>([]);


    React.useEffect(() => {
        getData(props);
    }, [])


    function getData(props) {
        /*
        $(this.refs.TTwindow).children().remove();
        $(this.refs.PTwindow).children().remove();
        $(this.refs.TCCwindow).children().remove();
        $(this.refs.L1window).children().remove();
        $(this.refs.L2window).children().remove();
        */
        const pixels = (window.innerWidth - 300 - 40) / 2;

        service.getStatisticData(props.eventid, pixels, "History").then(data => {

            if (data == null) {
                setShowRelayHistory(false);
                return;
            }
            setShowRelayHistory(true);

            const tripTimeVessel = [];
            const pickupTimeVessel = [];
            const tripCoilConditionVessel = [];
            const l1Vessel = [];
            const l2Vessel = [];

            $.each(data.Data, (index, value) => {
                if (value.MeasurementType == "TripTime") { tripTimeVessel.push({ label: value.ChartLabel, data: value.DataPoints, color: this.getColor(value.ChartLabel) }) }
                else if (value.MeasurementType == "PickupTime") { pickupTimeVessel.push({ label: value.ChartLabel, data: value.DataPoints, color: this.getColor(value.ChartLabel) }) }
                else if (value.MeasurementType == "TripCoilCondition") { tripCoilConditionVessel.push({ label: value.ChartLabel, data: value.DataPoints, color: this.getColor(value.ChartLabel) }) }
                else if (value.MeasurementType == "Imax1") { l1Vessel.push({ label: value.ChartLabel, data: value.DataPoints, color: this.getColor(value.ChartLabel) }) }
                else if (value.MeasurementType == "Imax2") { l2Vessel.push({ label: value.ChartLabel, data: value.DataPoints, color: this.getColor(value.ChartLabel) }) }

                else if (value.MeasurementType == "TripTimeAlert") { tripTimeVessel.push({ label: value.ChartLabel, data: value.DataPoints, color: '#FF0000', lines: { show: false }, points: { show: false } }) }
                else if (value.MeasurementType == "PickupTimeAlert") { pickupTimeVessel.push({ label: value.ChartLabel, data: value.DataPoints, color: '#FF0000', lines: { show: false }, points: { show: false } }) }
                else if (value.MeasurementType == "TripCoilConditionAlert") { tripCoilConditionVessel.push({ label: value.ChartLabel, data: value.DataPoints, color: '#FF0000', lines: { show: false }, points: { show: false } }) }
            });

            //$.plot($(this.refs.TTwindow), tripTimeVessel, this.optionsTripTime);
            //$.plot($(this.refs.PTwindow), pickupTimeVessel, this.optionsPickupTime);
            //$.plot($(this.refs.TCCwindow), tripCoilConditionVessel, this.optionsTripCoilCondition);
            //$.plot($(this.refs.L1window), l1Vessel, this.optionsImax1);
            //$.plot($(this.refs.L2window), l2Vessel, this.optionsImax2);
        });


    }

    return (
        <div className="card" >
            <div className="card-header">Historic Breaker Performance</div>
            <div className="card-body">
                <div ref={TTwindow} style={{
                    height: 150, width: 'calc(100%)', /*, margin: '0x', padding: '0px'*/  display: showRelayHistory ? 'block' : 'none' }}></div>
                    <div ref={PTwindow} style={{ height: 150, width: 'calc(100%)', /*, margin: '0x', padding: '0px'*/  display: showRelayHistory ? 'block' : 'none' }}></div>
                    <div ref={TCCwindow} style={{ height: 150, width: 'calc(100%)', /*, margin: '0x', padding: '0px'*/  display: showRelayHistory ? 'block' : 'none' }}></div>
                    <div ref={L1window} style={{ height: 150, width: 'calc(100%)', /*, margin: '0x', padding: '0px'*/  display: showRelayHistory ? 'block' : 'none' }}></div>
                    <div ref={L2window} style={{ height: 150, width: 'calc(100%)', /*, margin: '0x', padding: '0px'*/  display: showRelayHistory ? 'block' : 'none' }}></div>
                </div>
            </div>
        );
}
export default EventSearchBreakerPerformance;

