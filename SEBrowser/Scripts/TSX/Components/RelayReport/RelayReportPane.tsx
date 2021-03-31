//******************************************************************************************************
//  EventSearchPreviewPane.tsx - Gbtc
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
import RelayPerformanceTrend from './RelayPerformanceTrend';
import moment from 'moment';
import { RelayReportNavBarProps } from './RelayReportNavBar';
import { Line, LineWithThreshold, Plot } from '@gpa-gemstone/react-graph';
import { RandomColor } from '@gpa-gemstone/helper-functions';
import { cloneDeep } from 'lodash';

interface IRelayPerformance {
    EventID: number,
    TripInitiate: string,
    TripTime: number,
    PickupTime: number,
    TripCoilCondition: number,
    Imax1: number,
    Imax2: number,
    TripTimeAlert: number,
    TripcoilConditionAlert: number,
    PickupTimeAlert: number,
}

const RelayReportPane = (props: RelayReportNavBarProps) => {
    const [realyPerformance, setRelayPerformance] = React.useState<IRelayPerformance[]>([]);
    const [Tstart, setTstart] = React.useState<number>(0);
    const [Tend, setTend] = React.useState<number>(0);

    React.useEffect(() => {
        let h = getRelayPerformance()

        return () => { if (h != null && h.abort != null) h.abort(); };
        
    }, [props]);

    React.useEffect(() => {
        getTimeLimits()
    }, [props.windowSize, props.timeWindowUnits, props.time, props.date])


    function getTimeLimits() {
        let dT = props.windowSize;
        let Tcenter = moment.utc(props.date + " " + props.time, "MM/DD/YYYY HH:mm:ss.SSSS");
        let dUnit: moment.unitOfTime.DurationConstructor;

        if (props.timeWindowUnits == 0)
            dUnit = "ms";
        else if (props.timeWindowUnits == 1)
            dUnit = "s"
        else if (props.timeWindowUnits == 2)
            dUnit = "m"
        else if (props.timeWindowUnits == 3)
            dUnit = "h"
        else if (props.timeWindowUnits == 4)
            dUnit = "d"
        else if (props.timeWindowUnits == 5)
            dUnit = "w"
        else if (props.timeWindowUnits == 6)
            dUnit = "M"
        else if (props.timeWindowUnits == 7)
            dUnit = "y"

        let Start = cloneDeep(Tcenter);
        Start.subtract(dT, dUnit);
        let End = cloneDeep(Tcenter);
        End.add(dT, dUnit);
        setTend(End.valueOf());
        setTstart(Start.valueOf())
        
    }

  

    function getRelayPerformance(): JQuery.jqXHR<IRelayPerformance[]> {
        let h = $.ajax({
            type: "GET",
            url: `${homePath}api/PQDashboard/RelayReport/getRelayPerformance?lineID=${props.BreakerID}&channelID=${props.ChannelID}}&date=${props.date}` +
                `&time=${props.time}&timeWindowunits=${props.timeWindowUnits}&windowSize=${props.windowSize}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: false,
            async: true
        });

        h.done((d: IRelayPerformance[]) => { if (d != null) setRelayPerformance(d); })
        return h;
    }

   

    return ( <>
        <div className="card">
            <div className="card-header">Breaker Performance:</div>
            <div className="card-body">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Event ID</th>
                            <th >Trip Initiation Time</th>
                            <th>Trip Time</th>
                            <th>Pickup Time</th>
                            <th>Extinction Time</th>
                            <th>Trip Coil Condition</th>
                            <th>L1</th>
                            <th>L2</th>
                        </tr>
                    </thead>
                    <tbody>
                        {realyPerformance.map((item, index) => <tr style={{ background: 'default' }} key={index}>
                            <td><a id="eventLink" target="_blank" href={homePath + 'Main/OpenSEE?eventid=' + item.EventID} ><div style={{ width: '100%', height: '100%' }}>{item.EventID}</div></a></td>
                            <td>{moment(item.TripInitiate).format('MM/DD/YY HH:mm:ss.SSSS')}</td>
                            <td>{item.TripTime * 0.1} micros</td>
                            <td>{item.PickupTime * 0.1} micros</td>
                            <td> micros</td>
                            <td>{item.TripCoilCondition.toFixed(2)} A/s</td>
                            <td>{item.Imax1.toFixed(3)} A</td>
                            <td>{item.Imax2.toFixed(3)} A</td>
                            </tr>)}
                    </tbody>

                </table>

            </div>
        </div>
        {realyPerformance.length > 0 ? < div className="card">
            <div className="card-header">Historic Breaker Performance</div>
            <div className="card-body">
                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[Tstart, Tend]} legend={'bottom'} Tlabel={'Time'}
                    Ylabel={'Trip (micros)'} showMouse={true} useMetricFactors={false}>
                    <LineWithThreshold highlightHover={true} showPoints={true} lineStyle={'-'} color={RandomColor()} data={realyPerformance.map(ev => [moment.utc(ev.TripInitiate).valueOf(), ev.TripTime * 0.1] as [number,number]).reverse()}
                        threshHolds={realyPerformance.length > 0 && realyPerformance[0].TripTimeAlert != 0 && realyPerformance[0].TripTimeAlert != undefined ? [{ Value: realyPerformance[0].TripTimeAlert, Color: '#ff0000' }] : []} legend={'Trip Time'}/>
                </Plot>
                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[Tstart, Tend]} legend={'bottom'} Tlabel={'Time'}
                    Ylabel={'Pickup (micros)'} showMouse={true} useMetricFactors={false}>
                    <LineWithThreshold highlightHover={true} showPoints={true} lineStyle={'-'} color={RandomColor()} data={realyPerformance.map(ev => [moment.utc(ev.TripInitiate).valueOf(), ev.PickupTime * 0.1] as [number, number]).reverse()}
                        threshHolds={realyPerformance.length > 0 && realyPerformance[0].PickupTimeAlert != 0 && realyPerformance[0].PickupTimeAlert != undefined ? [{ Value: realyPerformance[0].PickupTimeAlert, Color: '#ff0000' }] : []} legend={'Pickup Time'}/>
                </Plot>
                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[Tstart, Tend]} legend={'bottom'} Tlabel={'Time'}
                    Ylabel={'TCC (A/s)'} showMouse={true} useMetricFactors={false}>
                    <LineWithThreshold highlightHover={true} showPoints={true} lineStyle={'-'} color={RandomColor()} data={realyPerformance.map(ev => [moment.utc(ev.TripInitiate).valueOf(), ev.TripCoilCondition] as [number, number]).reverse()}
                        threshHolds={realyPerformance.length > 0 && realyPerformance[0].TripcoilConditionAlert != 0 && realyPerformance[0].TripcoilConditionAlert != undefined ? [{ Value: realyPerformance[0].TripcoilConditionAlert, Color: '#ff0000' }] : []} legend={'Trip Coil condition'} />
                </Plot>

                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[Tstart, Tend]} legend={'bottom'} Tlabel={'Time'}
                    Ylabel={'Imax 1 (A)'} showMouse={true} useMetricFactors={false}>
                    <Line highlightHover={true} showPoints={true} lineStyle={'-'} color={RandomColor()} data={realyPerformance.map(ev => [moment.utc(ev.TripInitiate).valueOf(), ev.Imax1] as [number, number]).reverse()} legend={'Imax 1'} />
                </Plot>
                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[Tstart, Tend]} legend={'bottom'} Tlabel={'Time'}
                    Ylabel={'Imax 2 (A)'} showMouse={true} useMetricFactors={false}>
                    <Line highlightHover={true} showPoints={true} lineStyle={'-'} color={RandomColor()} data={realyPerformance.map(ev => [moment.utc(ev.TripInitiate).valueOf(), ev.Imax2] as [number, number]).reverse()} legend={'Imax 2'}/>
                </Plot>
            </div>
        </div> : null}
        </>

    )

}

export default RelayReportPane;

