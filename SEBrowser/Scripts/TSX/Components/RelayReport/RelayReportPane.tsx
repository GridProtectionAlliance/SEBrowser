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
import moment from 'moment';
import { RelayReportNavBarProps } from './RelayReportNavBar';
import { Line, LineWithThreshold, Plot } from '@gpa-gemstone/react-graph';
import { RandomColor } from '@gpa-gemstone/helper-functions';
import { TimeWindowUtils } from '@gpa-gemstone/common-pages';
import { getMoment, getStartEndTime } from '@gpa-gemstone/common-pages/lib/TimeFilter/TimeWindowUtils';

const serverFormat = "MM DD YYYY HH:mm:ss.SSS";
interface IRelayPerformance {
    EventID: number,
    Tmax1: number,
    TplungerLatch: number,
    IplungerLatch: number,
    Idrop: number,
    TiDrop: number,
    Tend: number,
    TripTimeCurrent: number,
    PickupTimeCurrent: number,
    TripInitiate: string,
    TripTime: number,
    PickupTime: number,
    TripCoilCondition: number,
    Imax1: number,
    Imax2: number,
    TripTimeAlert: number,
    TripcoilConditionAlert: number,
    PickupTimeAlert: number,
    EventType: string,
    TripCoilConditionTime: number,
    ExtinctionTimeA?: number,
    ExtinctionTimeB?: number,
    ExtinctionTimeC?: number,
    I2CA?: number,
    I2CB?: number,
    I2CC?: number,
}

const RelayReportPane = (props: RelayReportNavBarProps) => {
    const [realyPerformance, setRelayPerformance] = React.useState<IRelayPerformance[]>([]);
    const [Tstart, setTstart] = React.useState<number>(0);
    const [Tend, setTend] = React.useState<number>(0);

    React.useEffect(() => {
        const h = getRelayPerformance()

        return () => { if (h != null && h.abort != null) h.abort(); };
    }, [props]);

    React.useEffect(() => {
        getTimeLimits()
    }, [props.end, props.start])


    function getTimeLimits() {
        const [startMoment, endMoment] = [moment.utc(props.start), moment.utc(props.end)]
        setTend(endMoment.valueOf());
        setTstart(startMoment.valueOf())
    }

    function getRelayPerformance(): JQuery.jqXHR<IRelayPerformance[]> {
        const startMoment: moment.Moment = moment(props.start, serverFormat);
        const endMoment: moment.Moment = moment(props.end, serverFormat);

        const units = TimeWindowUtils.findAppropriateUnit(startMoment, endMoment)[1];

        const h = $.ajax({
            type: "GET",
            url: `${homePath}api/PQDashboard/RelayReport/getRelayPerformance?lineID=${props.BreakerID}&channelID=${props.ChannelID}}&start=${startMoment}&end=${endMoment}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: false,
            async: true
        });

        h.done((d: IRelayPerformance[]) => { if (d != null) setRelayPerformance(d); })
        return h;
    }

    return (<>
        <div className="card">
            <div className="card-header">Breaker Performance:</div>
            <div className="card-body">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Event ID</th>
                            <th>Event Type</th>
                            <th >Trip Initiation</th>
                            <th colSpan={2}>TC Condition</th>
                            <th colSpan={2}>Plunger begins to move</th>
                            <th colSpan={2}>Plunger hits latch</th>
                            <th colSpan={2}>Plunger hits buffer</th>
                            <th colSpan={2}>Maximum TCE Curr.</th>
                            <th colSpan={2}>A finger opens</th>
                            <th>TCE Curr. Extinction</th>
                            <th colSpan={3}>Arcing Time</th>
                            <th colSpan={3}>I2C</th>
                        </tr>
                        <tr>
                            <th></th>
                            <th></th>
                            <th >(MM/DD/YY HH:MM:SS)</th>
                            <th>(A/s)</th>
                            <th>Time (micros)</th>
                            <th>I (mA)</th>
                            <th>Time (micros)</th>
                            <th>I (mA)</th>
                            <th>Time (micros)</th>
                            <th>I (mA)</th>
                            <th>Time (micros)</th>
                            <th>I (mA)</th>
                            <th>Time (micros)</th>
                            <th>I (mA)</th>
                            <th>Time (micros)</th>
                            <th>(micros)</th>
                            <th>A (micros)</th>
                            <th>B (micros)</th>
                            <th>C (micros)</th>
                            <th>A (A2s)</th>
                            <th>B (A2s)</th>
                            <th>C (A2s)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {realyPerformance.map((item, index) => <tr style={{ background: 'default' }} key={index}>
                            <td><a id="eventLink" target="_blank" href={homePath + 'Main/OpenSEE?eventid=' + item.EventID} ><div style={{ width: '100%', height: '100%' }}>{item.EventID}</div></a></td>
                            <td>{item.EventType}</td>
                            <td>{moment(item.TripInitiate).format('MM/DD/YY HH:mm:ss.SSSS')}</td>
                            <td>{item.TripCoilCondition.toFixed(2)}</td>
                            <td>{(item.TripCoilConditionTime / 10).toFixed(0)}</td>
                            <td>{item.Imax1.toFixed(3)}</td>
                            <td>{(item.Tmax1 / 10).toFixed(0)}</td>
                            <td>{item.IplungerLatch.toFixed(3)}</td>
                            <td>{(item.TplungerLatch / 10).toFixed(0)}</td>
                            <td>{item.PickupTimeCurrent.toFixed(3)}</td>
                            <td>{(item.PickupTime / 10).toFixed(0)}</td>
                            <td>{item.Imax2.toFixed(3)}</td>
                            <td>{(item.TripTime / 10).toFixed(0)}</td>
                            <td>{item.Idrop.toFixed(3)}</td>
                            <td>{(item.TiDrop / 10).toFixed(0)}</td>
                            <td>{(item.Tend / 10).toFixed(0)}</td>
                            <td>{item.ExtinctionTimeA == undefined ? '-' : (item.ExtinctionTimeA / 10).toFixed(0)}</td>
                            <td>{item.ExtinctionTimeB == undefined ? '-' : (item.ExtinctionTimeB / 10).toFixed(0)}</td>
                            <td>{item.ExtinctionTimeC == undefined ? '-' : (item.ExtinctionTimeC / 10).toFixed(0)}</td>
                            <td>{item.I2CA == undefined ? '-' : item.I2CA.toFixed(3)}</td>
                            <td>{item.I2CB == undefined ? '-' : item.I2CB.toFixed(3)}</td>
                            <td>{item.I2CC == undefined ? '-' : item.I2CC.toFixed(3)}</td>
                        </tr>)}
                    </tbody>

                </table>

            </div>
        </div>
        {realyPerformance.length > 0 ? < div className="card">
            <div className="card-header">Historic Breaker Performance</div>
            <div className="card-body">
                <Plot height={400} width={innerWidth - 345} showBorder={false} defaultTdomain={[Tstart, Tend]} legend={'bottom'} Tlabel={'Time'}
                    Ylabel={'Trip (micros)'} showMouse={true} useMetricFactors={false}>
                    <LineWithThreshold highlightHover={true} showPoints={true} lineStyle={'-'} color={RandomColor()} data={realyPerformance.map(ev => [moment.utc(ev.TripInitiate).valueOf(), ev.TripTime * 0.1] as [number, number]).reverse()}
                        threshHolds={realyPerformance.length > 0 && realyPerformance[0].TripTimeAlert != 0 && realyPerformance[0].TripTimeAlert != undefined ? [{ Value: realyPerformance[0].TripTimeAlert, Color: '#ff0000' }] : []} legend={'Trip Time'} />
                </Plot>
                <Plot height={400} width={innerWidth - 345} showBorder={false} defaultTdomain={[Tstart, Tend]} legend={'bottom'} Tlabel={'Time'}
                    Ylabel={'Pickup (micros)'} showMouse={true} useMetricFactors={false}>
                    <LineWithThreshold highlightHover={true} showPoints={true} lineStyle={'-'} color={RandomColor()} data={realyPerformance.map(ev => [moment.utc(ev.TripInitiate).valueOf(), ev.PickupTime * 0.1] as [number, number]).reverse()}
                        threshHolds={realyPerformance.length > 0 && realyPerformance[0].PickupTimeAlert != 0 && realyPerformance[0].PickupTimeAlert != undefined ? [{ Value: realyPerformance[0].PickupTimeAlert, Color: '#ff0000' }] : []} legend={'Pickup Time'} />
                </Plot>
                <Plot height={400} width={innerWidth - 345} showBorder={false} defaultTdomain={[Tstart, Tend]} legend={'bottom'} Tlabel={'Time'}
                    Ylabel={'TCC (A/s)'} showMouse={true} useMetricFactors={false}>
                    <LineWithThreshold highlightHover={true} showPoints={true} lineStyle={'-'} color={RandomColor()} data={realyPerformance.map(ev => [moment.utc(ev.TripInitiate).valueOf(), ev.TripCoilCondition] as [number, number]).reverse()}
                        threshHolds={realyPerformance.length > 0 && realyPerformance[0].TripcoilConditionAlert != 0 && realyPerformance[0].TripcoilConditionAlert != undefined ? [{ Value: realyPerformance[0].TripcoilConditionAlert, Color: '#ff0000' }] : []} legend={'Trip Coil condition'} />
                </Plot>


                <Plot height={400} width={innerWidth - 345} showBorder={false} defaultTdomain={[Tstart, Tend]} legend={'bottom'} Tlabel={'Time'}
                    Ylabel={'TCE (A)'} showMouse={true} useMetricFactors={false}>
                    <Line highlightHover={true} showPoints={true} lineStyle={'-'} color={RandomColor()} data={realyPerformance.map(ev => [moment.utc(ev.TripInitiate).valueOf(), ev.Imax1] as [number, number]).reverse()} legend={'Plunger starts to Move'} />
                    <Line highlightHover={true} showPoints={true} lineStyle={'-'} color={RandomColor()} data={realyPerformance.map(ev => [moment.utc(ev.TripInitiate).valueOf(), ev.IplungerLatch] as [number, number]).reverse()} legend={'Plunger hits Latch'} />
                    <Line highlightHover={true} showPoints={true} lineStyle={'-'} color={RandomColor()} data={realyPerformance.map(ev => [moment.utc(ev.TripInitiate).valueOf(), ev.PickupTimeCurrent] as [number, number]).reverse()} legend={'Plunger hits Buffer'} />
                    <Line highlightHover={true} showPoints={true} lineStyle={'-'} color={RandomColor()} data={realyPerformance.map(ev => [moment.utc(ev.TripInitiate).valueOf(), ev.Imax2] as [number, number]).reverse()} legend={'maximum TCE'} />
                    <Line highlightHover={true} showPoints={true} lineStyle={'-'} color={RandomColor()} data={realyPerformance.map(ev => [moment.utc(ev.TripInitiate).valueOf(), ev.Idrop] as [number, number]).reverse()} legend={'A finger opens'} />
                </Plot>

                <Plot height={400} width={innerWidth - 345} showBorder={false} defaultTdomain={[Tstart, Tend]} legend={'bottom'} Tlabel={'Time'}
                    Ylabel={'Timing (micros)'} showMouse={true} useMetricFactors={false}>
                    <Line highlightHover={true} showPoints={true} lineStyle={'-'} color={RandomColor()} data={realyPerformance.map(ev => [moment.utc(ev.TripInitiate).valueOf(), ev.Tmax1 / 10.0] as [number, number]).reverse()} legend={'Plunger starts to Move'} />
                    <Line highlightHover={true} showPoints={true} lineStyle={'-'} color={RandomColor()} data={realyPerformance.map(ev => [moment.utc(ev.TripInitiate).valueOf(), ev.TplungerLatch / 10.0] as [number, number]).reverse()} legend={'Plunger hits Latch'} />
                    <Line highlightHover={true} showPoints={true} lineStyle={'-'} color={RandomColor()} data={realyPerformance.map(ev => [moment.utc(ev.TripInitiate).valueOf(), ev.TiDrop / 10.0] as [number, number]).reverse()} legend={'A finger opens'} />
                    <Line highlightHover={true} showPoints={true} lineStyle={'-'} color={RandomColor()} data={realyPerformance.map(ev => [moment.utc(ev.TripInitiate).valueOf(), ev.Tend / 10.0] as [number, number]).reverse()} legend={'TCE Extinction'} />
                </Plot>

                <Plot height={400} width={innerWidth - 345} showBorder={false} defaultTdomain={[Tstart, Tend]} legend={'bottom'} Tlabel={'Time'}
                    Ylabel={'ArcingTime (micros)'} showMouse={true} useMetricFactors={false}>
                    <Line highlightHover={true} showPoints={true} lineStyle={'-'} color={RandomColor()} data={realyPerformance.filter(ev => ev.ExtinctionTimeA != undefined).map(ev => [moment.utc(ev.TripInitiate).valueOf(), ev.ExtinctionTimeA / 10.0] as [number, number]).reverse()} legend={'A'} />
                    <Line highlightHover={true} showPoints={true} lineStyle={'-'} color={RandomColor()} data={realyPerformance.filter(ev => ev.ExtinctionTimeB != undefined).map(ev => [moment.utc(ev.TripInitiate).valueOf(), ev.ExtinctionTimeB / 10.0] as [number, number]).reverse()} legend={'B'} />
                    <Line highlightHover={true} showPoints={true} lineStyle={'-'} color={RandomColor()} data={realyPerformance.filter(ev => ev.ExtinctionTimeC != undefined).map(ev => [moment.utc(ev.TripInitiate).valueOf(), ev.ExtinctionTimeC / 10.0] as [number, number]).reverse()} legend={'C'} />
                </Plot>

                <Plot height={400} width={innerWidth - 345} showBorder={false} defaultTdomain={[Tstart, Tend]} legend={'bottom'} Tlabel={'Time'}
                    Ylabel={'I2C (A2s)'} showMouse={true} useMetricFactors={false}>
                    <Line highlightHover={true} showPoints={true} lineStyle={'-'} color={RandomColor()} data={realyPerformance.filter(ev => ev.I2CA != undefined).map(ev => [moment.utc(ev.TripInitiate).valueOf(), ev.I2CA] as [number, number]).reverse()} legend={'A'} />
                    <Line highlightHover={true} showPoints={true} lineStyle={'-'} color={RandomColor()} data={realyPerformance.filter(ev => ev.I2CB != undefined).map(ev => [moment.utc(ev.TripInitiate).valueOf(), ev.I2CB] as [number, number]).reverse()} legend={'B'} />
                    <Line highlightHover={true} showPoints={true} lineStyle={'-'} color={RandomColor()} data={realyPerformance.filter(ev => ev.I2CC != undefined).map(ev => [moment.utc(ev.TripInitiate).valueOf(), ev.I2CC] as [number, number]).reverse()} legend={'C'} />
                </Plot>
            </div>
        </div> : null}
    </>

    )

}

export default RelayReportPane;

