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
import _ from 'lodash';
import { ConfigurableTable, Column, GetConfigurableColumnsFromTypeEntries } from '@gpa-gemstone/react-table';
import { Application, Gemstone } from '@gpa-gemstone/application-typings';
import { Alert } from '@gpa-gemstone/react-interactive';
import { ReactIcons } from '@gpa-gemstone/gpa-symbols';
import { RelayReportNavBarProps } from './RelayReportNavBar';
import { Line, LineWithThreshold, Plot } from '@gpa-gemstone/react-graph';
import { RandomColor } from '@gpa-gemstone/helper-functions';
import { findAppropriateUnit, getMoment, getStartEndTime } from '../../EventSearch/TimeWindowUtils';

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

const recordFields: Gemstone.TSX.Interfaces.IRecordFields<IRelayPerformance> = {
    EventType: { AllowSort: true, IsDefaultColumn: true, Label: 'Event Type' },
    TripInitiate: { AllowSort: true, IsDefaultColumn: true, Label: 'Trip Initiation (MM/DD/YY HH:MM:SS)', Content: (item) => <>{moment(item.TripInitiate).format('MM/DD/YY HH:mm:ss.SSSS')}</> },
    TripCoilCondition: { AllowSort: true, IsDefaultColumn: true, Label: 'TC Condition (A/s)', Content: (item) => <>{item.TripCoilCondition.toFixed(2)}</> },
    TripCoilConditionTime: { AllowSort: true, IsDefaultColumn: false, Label: 'TC Condition Time (micros)', Content: (item) => <>{(item.TripCoilConditionTime / 10).toFixed(0)}</> },
    Imax1: { AllowSort: true, IsDefaultColumn: false, Label: 'Plunger Begins to Move I (mA)', Content: (item) => <>{item.Imax1.toFixed(3)}</> },
    Tmax1: { AllowSort: true, IsDefaultColumn: false, Label: 'Plunger Begins to Move Time (micros)', Content: (item) => <>{(item.Tmax1 / 10).toFixed(0)}</> },
    IplungerLatch: { AllowSort: true, IsDefaultColumn: false, Label: 'Plunger Hits Latch I (mA)', Content: (item) => <>{item.IplungerLatch.toFixed(3)}</> },
    TplungerLatch: { AllowSort: true, IsDefaultColumn: false, Label: 'Plunger Hits Latch Time (micros)', Content: (item) => <>{(item.TplungerLatch / 10).toFixed(0)}</> },
    PickupTimeCurrent: { AllowSort: true, IsDefaultColumn: false, Label: 'Plunger Hits Buffer I (mA)', Content: (item) => <>{item.PickupTimeCurrent.toFixed(3)}</> },
    PickupTime: { AllowSort: true, IsDefaultColumn: true, Label: 'Plunger Hits Buffer Time (micros)', Content: (item) => <>{(item.PickupTime / 10).toFixed(0)}</> },
    Imax2: { AllowSort: true, IsDefaultColumn: false, Label: 'Maximum TCE Curr. I (mA)', Content: (item) => <>{item.Imax2.toFixed(3)}</> },
    TripTime: { AllowSort: true, IsDefaultColumn: true, Label: 'Maximum TCE Curr. Time (micros)', Content: (item) => <>{(item.TripTime / 10).toFixed(0)}</> },
    Idrop: { AllowSort: true, IsDefaultColumn: false, Label: 'A Finger Opens I (mA)', Content: (item) => <>{item.Idrop.toFixed(3)}</> },
    TiDrop: { AllowSort: true, IsDefaultColumn: false, Label: 'A Finger Opens Time (micros)', Content: (item) => <>{(item.TiDrop / 10).toFixed(0)}</> },
    Tend: { AllowSort: true, IsDefaultColumn: true, Label: 'TCE Curr. Extinction Time (micros)', Content: (item) => <>{(item.Tend / 10).toFixed(0)}</> },
    ExtinctionTimeA: { AllowSort: true, IsDefaultColumn: false, Label: 'Arcing Time A (micros)', Content: (item) => <>{item.ExtinctionTimeA == undefined ? '-' : (item.ExtinctionTimeA / 10).toFixed(0)}</> },
    ExtinctionTimeB: { AllowSort: true, IsDefaultColumn: false, Label: 'Arcing Time B (micros)', Content: (item) => <>{item.ExtinctionTimeB == undefined ? '-' : (item.ExtinctionTimeB / 10).toFixed(0)}</> },
    ExtinctionTimeC: { AllowSort: true, IsDefaultColumn: false, Label: 'Arcing Time C (micros)', Content: (item) => <>{item.ExtinctionTimeC == undefined ? '-' : (item.ExtinctionTimeC / 10).toFixed(0)}</> },
    I2CA: { AllowSort: true, IsDefaultColumn: false, Label: 'I2C A (A2s)', Content: (item) => <>{item.I2CA == undefined ? '-' : item.I2CA.toFixed(3)}</> },
    I2CB: { AllowSort: true, IsDefaultColumn: false, Label: 'I2C B (A2s)', Content: (item) => <>{item.I2CB == undefined ? '-' : item.I2CB.toFixed(3)}</> },
    I2CC: { AllowSort: true, IsDefaultColumn: false, Label: 'I2C C (A2s)', Content: (item) => <>{item.I2CC == undefined ? '-' : item.I2CC.toFixed(3)}</> },
};

const RelayReportPane = (props: RelayReportNavBarProps) => {
    const [realyPerformance, setRelayPerformance] = React.useState<IRelayPerformance[]>([]);
    const [Tstart, setTstart] = React.useState<number>(0);
    const [Tend, setTend] = React.useState<number>(0);
    const [sortKey, setSortKey] = React.useState<string>('');
    const [ascending, setAscending] = React.useState<boolean>(true);
    const [status, setStatus] = React.useState<Application.Types.Status>('uninitiated');

    const sortedData = React.useMemo(() => {
        if (sortKey === '')
            return realyPerformance;
        return _.orderBy(realyPerformance, [sortKey], [ascending ? 'asc' : 'desc']);
    }, [realyPerformance, sortKey, ascending]);

    const sortCallback = React.useCallback((d: { colKey: string, colField?: keyof IRelayPerformance, ascending: boolean }) => {
        if (d.colField == null)
            return;
        if (d.colField === sortKey)
            setAscending(!ascending);
        else {
            setSortKey(d.colField);
            setAscending(true);
        }
    }, [sortKey, ascending]);

    React.useEffect(() => {
        setStatus('loading');
        const h = getRelayPerformance(props);
        h.done((d: IRelayPerformance[]) => {
            if (d != null)
                setRelayPerformance(d);
            setStatus('idle');
        }).fail(() => setStatus('error'));

        return () => { if (h != null && h.abort != null) h.abort(); };
    }, [props]);

    React.useEffect(() => {
        const [Tstart, Tend] = getStartEndTime(getMoment(props.date, props.time), props.windowSize, props.timeWindowUnits)
        setTend(Tend.valueOf());
        setTstart(Tstart.valueOf())
    }, [props.windowSize, props.timeWindowUnits, props.time, props.date])

    return (
        <div className="d-flex flex-column flex-grow-1" style={{ overflowY: 'auto', minHeight: 0 }}>
            {status === 'error' ?
                <Alert Class="alert-danger">
                    An error occurred while fetching relay performance data.
                </Alert>
            : null}
            <div className="card flex-grow-1">
                <div className="card-header">Breaker Performance:</div>
                <div className="card-body d-flex flex-column">
                    {status === 'loading' ?
                        <div className="d-flex align-items-center justify-content-center flex-grow-1">
                            <ReactIcons.SpiningIcon Size={'50%'} />
                        </div>
                    : realyPerformance.length === 0 ?
                        <Alert Class="alert-info" Style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            No relay performance data.
                        </Alert>
                    :
                    <ConfigurableTable<IRelayPerformance>
                        Data={sortedData}
                        SortKey={sortKey}
                        Ascending={ascending}
                        OnSort={sortCallback}
                        KeySelector={(item, index) => index!}
                        TableClass="table"
                        LocalStorageKey="SEBrowser.RelayReportPane"
                    >
                        <Column<IRelayPerformance>
                            Key={'EventID'}
                            AllowSort={true}
                            Field={'EventID'}
                            Content={({ item }) =>
                                <a id="eventLink" target="_blank" href={homePath + 'Main/OpenSEE?eventid=' + item.EventID}>
                                    <div style={{ width: '100%', height: '100%' }}>{item.EventID}</div>
                                </a>}
                        >
                            Event ID
                        </Column>
                        {GetConfigurableColumnsFromTypeEntries<IRelayPerformance>(recordFields, 'MM/DD/YY HH:mm:ss.SSSS')}
                    </ConfigurableTable>}
                </div>
            </div>
            {realyPerformance.length > 0 ? < div className="card">
                <div className="card-header">Historic Breaker Performance</div>
                <div className="card-body">
                    <Plot
                        height={400}
                        width={innerWidth - 345}
                        showBorder={false}
                        defaultTdomain={[Tstart, Tend]}
                        legend={'bottom'}
                        Tlabel={'Time'}
                        Ylabel={'Trip (micros)'}
                        showMouse={true}
                        useMetricFactors={false}
                    >
                        <LineWithThreshold
                            highlightHover={true}
                            showPoints={true}
                            lineStyle={'-'}
                            color={RandomColor()}
                            data={realyPerformance.map(ev => [moment.utc(ev.TripInitiate).valueOf(), ev.TripTime * 0.1] as [number, number]).reverse()}
                            threshHolds={realyPerformance.length > 0 && realyPerformance[0].TripTimeAlert != 0 && realyPerformance[0].TripTimeAlert != undefined ? [{ Value: realyPerformance[0].TripTimeAlert, Color: '#ff0000' }] : []}
                            legend={'Trip Time'}
                        />
                    </Plot>
                    <Plot
                        height={400}
                        width={innerWidth - 345}
                        showBorder={false}
                        defaultTdomain={[Tstart, Tend]}
                        legend={'bottom'}
                        Tlabel={'Time'}
                        Ylabel={'Pickup (micros)'}
                        showMouse={true}
                        useMetricFactors={false}
                    >
                        <LineWithThreshold
                            highlightHover={true}
                            showPoints={true}
                            lineStyle={'-'}
                            color={RandomColor()}
                            data={realyPerformance.map(ev => [moment.utc(ev.TripInitiate).valueOf(), ev.PickupTime * 0.1] as [number, number]).reverse()}
                            threshHolds={realyPerformance.length > 0 && realyPerformance[0].PickupTimeAlert != 0 && realyPerformance[0].PickupTimeAlert != undefined ? [{ Value: realyPerformance[0].PickupTimeAlert, Color: '#ff0000' }] : []}
                            legend={'Pickup Time'}
                        />
                    </Plot>
                    <Plot
                        height={400}
                        width={innerWidth - 345}
                        showBorder={false}
                        defaultTdomain={[Tstart, Tend]}
                        legend={'bottom'}
                        Tlabel={'Time'}
                        Ylabel={'TCC (A/s)'}
                        showMouse={true}
                        useMetricFactors={false}
                    >
                        <LineWithThreshold
                            highlightHover={true}
                            showPoints={true}
                            lineStyle={'-'}
                            color={RandomColor()}
                            data={realyPerformance.map(ev => [moment.utc(ev.TripInitiate).valueOf(), ev.TripCoilCondition] as [number, number]).reverse()}
                            threshHolds={realyPerformance.length > 0 && realyPerformance[0].TripcoilConditionAlert != 0 && realyPerformance[0].TripcoilConditionAlert != undefined ? [{ Value: realyPerformance[0].TripcoilConditionAlert, Color: '#ff0000' }] : []}
                            legend={'Trip Coil condition'}
                        />
                    </Plot>


                    <Plot
                        height={400}
                        width={innerWidth - 345}
                        showBorder={false}
                        defaultTdomain={[Tstart, Tend]}
                        legend={'bottom'}
                        Tlabel={'Time'}
                        Ylabel={'TCE (A)'}
                        showMouse={true}
                        useMetricFactors={false}
                    >
                        <Line
                            highlightHover={true}
                            showPoints={true}
                            lineStyle={'-'}
                            color={RandomColor()}
                            data={realyPerformance.map(ev => [moment.utc(ev.TripInitiate).valueOf(), ev.Imax1] as [number, number]).reverse()}
                            legend={'Plunger starts to Move'}
                        />
                        <Line
                            highlightHover={true}
                            showPoints={true}
                            lineStyle={'-'}
                            color={RandomColor()}
                            data={realyPerformance.map(ev => [moment.utc(ev.TripInitiate).valueOf(), ev.IplungerLatch] as [number, number]).reverse()}
                            legend={'Plunger hits Latch'}
                        />
                        <Line
                            highlightHover={true}
                            showPoints={true}
                            lineStyle={'-'}
                            color={RandomColor()}
                            data={realyPerformance.map(ev => [moment.utc(ev.TripInitiate).valueOf(), ev.PickupTimeCurrent] as [number, number]).reverse()}
                            legend={'Plunger hits Buffer'}
                        />
                        <Line
                            highlightHover={true}
                            showPoints={true}
                            lineStyle={'-'}
                            color={RandomColor()}
                            data={realyPerformance.map(ev => [moment.utc(ev.TripInitiate).valueOf(), ev.Imax2] as [number, number]).reverse()}
                            legend={'maximum TCE'}
                        />
                        <Line
                            highlightHover={true}
                            showPoints={true}
                            lineStyle={'-'}
                            color={RandomColor()}
                            data={realyPerformance.map(ev => [moment.utc(ev.TripInitiate).valueOf(), ev.Idrop] as [number, number]).reverse()}
                            legend={'A finger opens'}
                        />
                    </Plot>

                    <Plot
                        height={400}
                        width={innerWidth - 345}
                        showBorder={false}
                        defaultTdomain={[Tstart, Tend]}
                        legend={'bottom'}
                        Tlabel={'Time'}
                        Ylabel={'Timing (micros)'}
                        showMouse={true}
                        useMetricFactors={false}
                    >
                        <Line
                            highlightHover={true}
                            showPoints={true}
                            lineStyle={'-'}
                            color={RandomColor()}
                            data={realyPerformance.map(ev => [moment.utc(ev.TripInitiate).valueOf(), ev.Tmax1 / 10.0] as [number, number]).reverse()}
                            legend={'Plunger starts to Move'}
                        />
                        <Line
                            highlightHover={true}
                            showPoints={true}
                            lineStyle={'-'}
                            color={RandomColor()}
                            data={realyPerformance.map(ev => [moment.utc(ev.TripInitiate).valueOf(), ev.TplungerLatch / 10.0] as [number, number]).reverse()}
                            legend={'Plunger hits Latch'}
                        />
                        <Line
                            highlightHover={true}
                            showPoints={true}
                            lineStyle={'-'}
                            color={RandomColor()}
                            data={realyPerformance.map(ev => [moment.utc(ev.TripInitiate).valueOf(), ev.TiDrop / 10.0] as [number, number]).reverse()}
                            legend={'A finger opens'}
                        />
                        <Line
                            highlightHover={true}
                            showPoints={true}
                            lineStyle={'-'}
                            color={RandomColor()}
                            data={realyPerformance.map(ev => [moment.utc(ev.TripInitiate).valueOf(), ev.Tend / 10.0] as [number, number]).reverse()}
                            legend={'TCE Extinction'}
                        />
                    </Plot>

                    <Plot
                        height={400}
                        width={innerWidth - 345}
                        showBorder={false}
                        defaultTdomain={[Tstart, Tend]}
                        legend={'bottom'}
                        Tlabel={'Time'}
                        Ylabel={'ArcingTime (micros)'}
                        showMouse={true}
                        useMetricFactors={false}
                    >
                        <Line
                            highlightHover={true}
                            showPoints={true}
                            lineStyle={'-'}
                            color={RandomColor()}
                            data={realyPerformance.filter(ev => ev.ExtinctionTimeA != undefined).map(ev => [moment.utc(ev.TripInitiate).valueOf(), ev.ExtinctionTimeA! / 10.0] as [number, number]).reverse()}
                            legend={'A'}
                        />
                        <Line
                            highlightHover={true}
                            showPoints={true}
                            lineStyle={'-'}
                            color={RandomColor()}
                            data={realyPerformance.filter(ev => ev.ExtinctionTimeB != undefined).map(ev => [moment.utc(ev.TripInitiate).valueOf(), ev.ExtinctionTimeB! / 10.0] as [number, number]).reverse()}
                            legend={'B'}
                        />
                        <Line
                            highlightHover={true}
                            showPoints={true}
                            lineStyle={'-'}
                            color={RandomColor()}
                            data={realyPerformance.filter(ev => ev.ExtinctionTimeC != undefined).map(ev => [moment.utc(ev.TripInitiate).valueOf(), ev.ExtinctionTimeC! / 10.0] as [number, number]).reverse()}
                            legend={'C'}
                        />
                    </Plot>

                    <Plot
                        height={400}
                        width={innerWidth - 345}
                        showBorder={false}
                        defaultTdomain={[Tstart, Tend]}
                        legend={'bottom'}
                        Tlabel={'Time'}
                        Ylabel={'I2C (A2s)'}
                        showMouse={true}
                        useMetricFactors={false}
                    >
                        <Line
                            highlightHover={true}
                            showPoints={true}
                            lineStyle={'-'}
                            color={RandomColor()}
                            data={realyPerformance.filter(ev => ev.I2CA != undefined).map(ev => [moment.utc(ev.TripInitiate).valueOf(), ev.I2CA] as [number, number]).reverse()}
                            legend={'A'}
                        />
                        <Line
                            highlightHover={true}
                            showPoints={true}
                            lineStyle={'-'}
                            color={RandomColor()}
                            data={realyPerformance.filter(ev => ev.I2CB != undefined).map(ev => [moment.utc(ev.TripInitiate).valueOf(), ev.I2CB] as [number, number]).reverse()}
                            legend={'B'}
                        />
                        <Line
                            highlightHover={true}
                            showPoints={true}
                            lineStyle={'-'}
                            color={RandomColor()}
                            data={realyPerformance.filter(ev => ev.I2CC != undefined).map(ev => [moment.utc(ev.TripInitiate).valueOf(), ev.I2CC] as [number, number]).reverse()}
                            legend={'C'}
                        />
                    </Plot>
                </div>
            </div> : null}
        </div>
    )
}

function getRelayPerformance(props: RelayReportNavBarProps): JQuery.jqXHR<IRelayPerformance[]> {
    const adjustedTime = findAppropriateUnit(getMoment(props.date, props.time),
        getStartEndTime(getMoment(props.date, props.time), props.windowSize, props.timeWindowUnits)[1],
        props.timeWindowUnits);

    return $.ajax({
        type: "GET",
        url: `${homePath}api/PQDashboard/RelayReport/getRelayPerformance?lineID=${props.BreakerID}&channelID=${props.ChannelID}}&date=${props.date}` +
            `&time=${props.time}&timeWindowunits=${adjustedTime[0]}&windowSize=${adjustedTime[1]}`,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: false,
        async: true
    });
}

export default RelayReportPane;