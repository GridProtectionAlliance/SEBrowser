//******************************************************************************************************
// CapBankReportPane.tsx - Gbtc
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
//
//******************************************************************************************************
import * as React from 'react';
import moment from 'moment';

import { CapBankReportNavBarProps } from './CapBankReportNavBar';
import { Warning, Modal } from '@gpa-gemstone/react-interactive';
import { Plot, Line } from '@gpa-gemstone/react-graph'
import { findAppropriateUnit, getMoment, getStartEndTime } from '../../EventSearch/TimeWindowUtils';

interface ITrendSeries {

    data: Array<[number, number]>,
    color: string,
    label: string,
    lineStyle: ('-' | ':'),
    includeLegend: boolean,
}


interface ITrendDataSet {
    DeltaQ: Array<ITrendSeries>,
    Irms: Array<ITrendSeries>,
    DeltaIrms: Array<ITrendSeries>,
    Vrms: Array<ITrendSeries>,
    DeltaVrms: Array<ITrendSeries>,
    Q: Array<ITrendSeries>,
    Freq: Array<ITrendSeries>,
    THDI: Array<ITrendSeries>,
    DeltaTHDI: Array<ITrendSeries>,
    THDV: Array<ITrendSeries>,
    DeltaTHDV: Array<ITrendSeries>,
    SwitchingFreq: Array<ITrendSeries>,
    PeakV: Array<ITrendSeries>,
    Xcap: Array<ITrendSeries>,
    DeltaXcap: Array<ITrendSeries>,
    RestrikeDuration: Array<ITrendSeries>,
    RestrikeI: Array<ITrendSeries>,
    RestrikeV: Array<ITrendSeries>,
    PISDuration: Array<ITrendSeries>,
    PISZ: Array<ITrendSeries>,
    PISI: Array<ITrendSeries>,
    KFactor: Array<ITrendSeries>,
    RelaydV: Array<ITrendSeries>,
    RelayXLV: Array<ITrendSeries>,
    RelayV: Array<ITrendSeries>,
    RelayXV: Array<ITrendSeries>,
    Ineutral: Array<ITrendSeries>,
    BusZ: Array<ITrendSeries>,
    BusV: Array<ITrendSeries>,
    Unbalance: Array<ITrendSeries>,
}

interface ICBEvent {
    ID: number,
    Time: string
    Status: string,
    EventId: number,
    Operation: string,
    Resonance: boolean,
    Phase: string,
    CapBankHealth: string,
    Restrike: string,
    PreInsertionSwitch: string
}

const emptyTrendData: ITrendDataSet = {
    DeltaQ: [],
    Irms: [],
    DeltaIrms: [],
    Vrms: [],
    DeltaVrms: [],
    Q: [],
    Freq: [],
    THDI: [],
    DeltaTHDI: [],
    THDV: [],
    DeltaTHDV: [],
    SwitchingFreq: [],
    PeakV: [],
    Xcap: [],
    DeltaXcap: [],
    RestrikeDuration: [],
    RestrikeI: [],
    RestrikeV: [],
    PISDuration: [],
    PISZ: [],
    PISI: [],
    KFactor: [],
    RelaydV: [],
    RelayXLV: [],
    RelayV: [],
    RelayXV: [],
    Ineutral: [],
    BusZ: [],
    BusV: [],
    Unbalance: []
};

const getFilterString = (props: CapBankReportNavBarProps) => {
        let filter = "";

        //First Filter is Resonance
        if (props.ResFilt.length > 0)
            filter = `&resFilt=${props.ResFilt.join(',')}`

        //Next Filter is CapBankStatus
        if ((props.StatFilt.length > 0) && (!props.StatFilt.includes(999)))
            filter = filter + `&statFilt=${props.StatFilt.join(',')}`

        //Next Filter is Operation
        if ((props.OpFilt.length > 0) && (!props.OpFilt.includes(999)))
            filter = filter + `&operationFilt=${props.OpFilt.join(',')}`

        //Next Filter is Restrike Filter
        if ((props.RestFilt.length > 0) && (!props.RestFilt.includes(999)))
            filter = filter + `&restrikeFilt=${props.RestFilt.join(',')}`

        //Next Filter is Switching Health Filter
        if ((props.PISFilt.length > 0) && (!props.PISFilt.includes(999)))
            filter = filter + `&switchingHealthFilt=${props.PISFilt.join(',')}`

        //Next Filter is CB Health Filter
        if ((props.HealthFilt.length > 0) && (!props.HealthFilt.includes(999)))
            filter = filter + `&healthFilt=${props.HealthFilt.join(',')}`

        //Next Filter is Phase Filter
        if ((props.PhaseFilter.length > 0) && (!props.PhaseFilter.includes(999)))
            filter = filter + `&phaseFilt=${props.PhaseFilter.join(',')}`
        
        return filter;
};

const CapBankReportPane = (props: CapBankReportNavBarProps) => {
    const [eventData, setEventData] = React.useState<ICBEvent[]>([]);
    const [trendData, setTrendData] = React.useState<ITrendDataSet>(emptyTrendData);
    const [showWarning, setShowWarning] = React.useState<boolean>(false);
    const [showCapBankEdit, setShowCapBankEdit] = React.useState<boolean>(false);
    const [selectedCapBank, setSelectedCapBank] = React.useState<number>(1);
    const [selectedEvent, setSelectedEvent] = React.useState<number>(0);
    const [pointTable, setPointTable] = React.useState<{ title: string, content: JSX.Element }>(null);
    const [refreshKey, setRefreshKey] = React.useState<number>(0);
    const eventTableHandle = React.useRef<JQuery.jqXHR>(null);
    const trendHandle = React.useRef<JQuery.jqXHR>(null);

    const { date, time, windowSize, timeWindowUnits } = props.TimeFilter;
    const filterString = getFilterString(props);
    const [Tstart, Tend] = React.useMemo(() => {
        const [start, end] = getStartEndTime(getMoment(date, time), windowSize, timeWindowUnits);
        return [start.valueOf(), end.valueOf()];
    }, [date, time, windowSize, timeWindowUnits]);

    const getData = React.useCallback(() => {
        if (eventTableHandle.current != null)
            eventTableHandle.current.abort();
        if (trendHandle.current != null)
            trendHandle.current.abort();

        const eventTimeFrame = findAppropriateUnit(getMoment(date),
            getStartEndTime(getMoment(date, time), windowSize, timeWindowUnits)[1], timeWindowUnits);
        const trendTimeFrame = findAppropriateUnit(getMoment(date, time),
            getStartEndTime(getMoment(date, time), windowSize, timeWindowUnits)[0], timeWindowUnits);

        const eventRequest = $.ajax({
            type: "GET",
            url: `${homePath}api/PQDashboard/CapBankReport/GetEventTable?capBankId=${props.CapBankID}&date=${date}` +
                `&time=${time}&timeWindowunits=${eventTimeFrame[0]}&windowSize=${eventTimeFrame[1]}` +
                `&bankNum=${props.selectedBank}` + filterString,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: false,
            async: true
        });
        eventTableHandle.current = eventRequest;
        eventRequest.done((data: ICBEvent[]) => {
            if (eventTableHandle.current === eventRequest)
                setEventData(data == null ? [] : data);
        });

        const trendRequest = $.ajax({
            type: "GET",
            url: `${homePath}api/PQDashboard/CapBankReport/GetTrend?capBankId=${props.CapBankID}&date=${date}` +
                `&time=${time}&timeWindowunits=${trendTimeFrame[0]}&windowSize=${trendTimeFrame[1]}` +
                `&bankNum=${props.selectedBank}` + filterString,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: false,
            async: true
        });
        trendHandle.current = trendRequest;
        trendRequest.done((data: ITrendDataSet) => {
            if (data != null && trendHandle.current === trendRequest)
                setTrendData(data);
        });
    }, [props.CapBankID, props.selectedBank, date, time, windowSize, timeWindowUnits, filterString]);

    React.useEffect(() => {
        if (props.CapBankID < 0)
            return;

        getData();

        return () => {
            if (eventTableHandle.current != null)
                eventTableHandle.current.abort();
            if (trendHandle.current != null)
                trendHandle.current.abort();
        };
    }, [props.CapBankID, getData, refreshKey]);

    const updateCapBank = React.useCallback(() => {
        const h = $.ajax({
            type: "GET",
            url: `${homePath}api/PQDashboard/CapBankReport/SetCapBank/${selectedEvent}/${selectedCapBank}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: false,
            async: true
        });

        h.then(() => {
            setRefreshKey(key => key + 1);
        })
    }, [selectedEvent, selectedCapBank]);

    const createPointTable = (d: ITrendSeries[], title: string, unit: string) => {

        let indices = d.map(() => 0);
        const rows = [];

        while (indices.some((item, index) => item < d[index].data.length)) {
            const T = Math.min(...indices.map((item, index) => item < d[index].data.length ? d[index].data[item][0] : NaN).filter(n => !isNaN(n)));
            rows.push(<tr onClick={() => window.open('./eventsearch?line=true&date=' + moment.utc(T).format('MM/DD/YYYY') + '&time=' + moment.utc(T).format('HH:mm:ss.SSS') + '&windowSize=1&timeWindowUnits=1&tab=All&eventid=-1', "_blank")}>
                <td>{moment.utc(T).format('MM/DD/YY HH:mm:ss.SSS')}</td>
                {d.map((item, index) => <td key={index}>{indices[index] < item.data.length && item.data[indices[index]][0] == T ? item.data[indices[index]][1].toPrecision(6) : 'N/A'}</td>)}
            </tr>)
            indices = indices.map((item, index) => item < d[index].data.length && d[index].data[item][0] == T ? item + 1 : item);
        }

        const content = <div style={{ maxHeight: innerHeight - 250 }}>
            <table className="table table-bordered table-hover" style={{ maxHeight: innerHeight - 250, marginBottom: 0, display: 'block', overflowY: 'scroll' }} >
                <thead>
                    <tr>
                        <th>Time</th>
                        {d.map((item, index) => <th key={index}><span>{item.label} {unit}</span> </th>)}
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table>
        </div>

        setPointTable({ title, content });
    };

    if (props.CapBankID == -1) return <div></div>;


        const bankOptions = [];
        let i;
        for (i = 0; i < props.numBanks; i++) {
            bankOptions.push(<option key={i} value={i + 1}> {i + 1} </option>)
        }

    return (
            <>
                <Modal
                    Title='Assign Event to a Capacitor Bank'
                    ShowX={true}
                    CallBack={(confirmed) => {
                        setShowCapBankEdit(false);
                        if (confirmed)
                            setShowWarning(true);
                    }}
                    Show={showCapBankEdit}
                    Size={'sm'}
                    ShowCancel={false}
                    ConfirmText={'Update'}
                >
                    <form>
                        <label style={{ width: '100%', position: 'relative', float: "left" }}>Capacitor Bank: </label>
                        <div className="form-group" style={{ height: 30 }}>
                            <select style={{ height: 35, width: 'calc(98%)', position: 'relative', float: "left", border: '1px solid #ced4da', borderRadius: '.25em' }} onChange={(e) => {
                                setSelectedCapBank(Number(e.target.value));
                            }} value={selectedCapBank}>
                                {bankOptions}
                            </select>
                        </div>
                    </form>
                </Modal>
                <Modal
                    Title={pointTable == null ? '' : pointTable.title}
                    Show={pointTable != null}
                    ShowX={true}
                    CallBack={() => setPointTable(null)}
                    ShowCancel={false}
                    ConfirmText={'Close'}
                    Size={'xlg'}
                >
                    {pointTable == null ? null : pointTable.content}
                </Modal>
                <Warning
                    Show={showWarning}
                    Title={'Confirm Capacitor Bank Assignment'}
                    Message={'The Capacitor Bank manually assigned to this event can not be changed in the future. Are you sure you want to continue?'}
                    CallBack={(confirmed) => { setShowWarning(false); if (confirmed) updateCapBank(); else setShowCapBankEdit(true); }}
                />
                <div style={{ width: '100%', height: '100%', maxHeight: '100%', position: 'relative', float: 'right', overflowY: 'scroll' }}>
                    {(trendData.Q.length > 0 ?
                        <div className="card">
                            <div className="card-header">Short Circuit Power</div>
                            <div className="card-body">
                                <Plot
                                    height={250}
                                    width={innerWidth - 345}
                                    showBorder={false}
                                    defaultTdomain={[Tstart, Tend]}
                                    legend={'bottom'}
                                    Tlabel={'Time'}
                                    Ylabel={'Short Circuit Power (MVA)'}
                                    showMouse={true}
                                    onDataInspect={() => createPointTable(trendData.Q, 'Short Circuit Power', '(MVA)')}
                                >
                                    {trendData.Q.map((s, i) => <Line
                                        highlightHover={true}
                                        showPoints={true}
                                        lineStyle={s.lineStyle}
                                        color={s.color}
                                        data={s.data}
                                        legend={s.label}
                                        key={i}
                                    />)}
                                </Plot>
                            </div>
                        </div> : null)}

                    {(trendData.DeltaQ.length > 0?
                    <div className="card">
                        <div className="card-header">Change in Q</div>
                            <div className="card-body">
                                <Plot
                                    height={250}
                                    width={innerWidth - 345}
                                    showBorder={false}
                                    defaultTdomain={[Tstart, Tend]}
                                    legend={'bottom'}
                                    Tlabel={'Time'}
                                    Ylabel={'Delta Q (kVAR)'}
                                    showMouse={true}
                                    onDataInspect={() => createPointTable(trendData.DeltaQ, 'Change in Q','(MVA)')}
                                >
                                    {trendData.DeltaQ.map((s, i) => <Line
                                        highlightHover={true}
                                        showPoints={true}
                                        lineStyle={s.lineStyle}
                                        color={s.color}
                                        data={s.data}
                                        legend={s.label}
                                        key={i}
                                    />)}
                                </Plot>
                            </div>
                        </div> : null)}


                    {(trendData.Irms.length > 0 ?
                        <div className="card">
                            <div className="card-header">RMS Current</div>
                            <div className="card-body">
                                <Plot
                                    height={250}
                                    width={innerWidth - 345}
                                    showBorder={false}
                                    defaultTdomain={[Tstart, Tend]}
                                    legend={'bottom'}
                                    Tlabel={'Time'}
                                    Ylabel={'I RMS (A)'}
                                    showMouse={true}
                                    onDataInspect={() => createPointTable(trendData.Irms, 'RMS Current','(A)')}
                                >
                                    {trendData.Irms.map((s, i) => <Line
                                        highlightHover={true}
                                        showPoints={true}
                                        lineStyle={s.lineStyle}
                                        color={s.color}
                                        data={s.data}
                                        legend={s.label}
                                        key={i}
                                    />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(trendData.DeltaIrms.length > 0 ?
                        <div className="card">
                            <div className="card-header">Change in RMS Current</div>
                            <div className="card-body">
                                <Plot
                                    height={250}
                                    width={innerWidth - 345}
                                    showBorder={false}
                                    defaultTdomain={[Tstart, Tend]}
                                    legend={'bottom'}
                                    Tlabel={'Time'}
                                    Ylabel={'Delta I RMS (A)'}
                                    showMouse={true}
                                    onDataInspect={() => createPointTable(trendData.DeltaIrms, 'Change in RMS Current','(A)')}
                                >
                                    {trendData.DeltaIrms.map((s, i) => <Line
                                        highlightHover={true}
                                        showPoints={true}
                                        lineStyle={s.lineStyle}
                                        color={s.color}
                                        data={s.data}
                                        legend={s.label}
                                        key={i}
                                    />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(trendData.Vrms.length > 0 ?
                        <div className="card">
                            <div className="card-header">RMS Voltage</div>
                            <div className="card-body">
                                <Plot
                                    height={250}
                                    width={innerWidth - 345}
                                    showBorder={false}
                                    defaultTdomain={[Tstart, Tend]}
                                    legend={'bottom'}
                                    Tlabel={'Time'}
                                    Ylabel={'V RMS (%)'}
                                    showMouse={true}
                                    useMetricFactors={false}
                                    onDataInspect={() => createPointTable(trendData.Vrms, 'RMS Voltage','(%)')}
                                >
                                    {trendData.Vrms.map((s, i) => <Line
                                        highlightHover={true}
                                        showPoints={true}
                                        lineStyle={s.lineStyle}
                                        color={s.color}
                                        data={s.data}
                                        legend={s.label}
                                        key={i}
                                    />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(trendData.DeltaVrms.length > 0 ?
                        <div className="card">
                            <div className="card-header">Change in RMS Voltage</div>
                            <div className="card-body">
                                <Plot
                                    height={250}
                                    width={innerWidth - 345}
                                    showBorder={false}
                                    defaultTdomain={[Tstart, Tend]}
                                    legend={'bottom'}
                                    Tlabel={'Time'}
                                    Ylabel={'Delta V RMS (%)'}
                                    showMouse={true}
                                    useMetricFactors={false}
                                    onDataInspect={() => createPointTable(trendData.DeltaVrms, 'Change in RMS Voltage','(%)')}
                                >
                                    {trendData.DeltaVrms.map((s, i) => <Line
                                        highlightHover={true}
                                        showPoints={true}
                                        lineStyle={s.lineStyle}
                                        color={s.color}
                                        data={s.data}
                                        legend={s.label}
                                        key={i}
                                    />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(trendData.Freq.length > 0 ?
                        <div className="card">
                            <div className="card-header">Resonance Frequency</div>
                            <div className="card-body">
                                <Plot
                                    height={250}
                                    width={innerWidth - 345}
                                    showBorder={false}
                                    defaultTdomain={[Tstart, Tend]}
                                    legend={'bottom'}
                                    Tlabel={'Time'}
                                    Ylabel={'Res. Freq. (Hz)'}
                                    showMouse={true}
                                    onDataInspect={() => createPointTable(trendData.Freq, 'Resonance Frequency','(Hz)')}
                                >
                                    {trendData.Freq.map((s, i) => <Line
                                        highlightHover={true}
                                        showPoints={true}
                                        lineStyle={s.lineStyle}
                                        color={s.color}
                                        data={s.data}
                                        legend={s.label}
                                        key={i}
                                    />)}
                                </Plot>
                            </div>
                        </div> : null)}

                    {(trendData.PeakV.length > 0 ?
                        <div className="card">
                            <div className="card-header">Peak Voltage</div>
                            <div className="card-body">
                                <Plot
                                    height={250}
                                    width={innerWidth - 345}
                                    showBorder={false}
                                    defaultTdomain={[Tstart, Tend]}
                                    legend={'bottom'}
                                    Tlabel={'Time'}
                                    Ylabel={'Voltage peak (%)'}
                                    showMouse={true}
                                    useMetricFactors={false}
                                    onDataInspect={() => createPointTable(trendData.PeakV, 'Peak Voltage','(%)')}
                                >
                                    {trendData.PeakV.map((s, i) => <Line
                                        highlightHover={true}
                                        showPoints={true}
                                        lineStyle={s.lineStyle}
                                        color={s.color}
                                        data={s.data}
                                        legend={s.label}
                                        key={i}
                                    />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(trendData.THDV.length > 0 ?
                        <div className="card">
                            <div className="card-header">Voltage THD</div>
                            <div className="card-body">
                                <Plot
                                    height={250}
                                    width={innerWidth - 345}
                                    showBorder={false}
                                    defaultTdomain={[Tstart, Tend]}
                                    legend={'bottom'}
                                    Tlabel={'Time'}
                                    Ylabel={'THD (%)'}
                                    showMouse={true}
                                    useMetricFactors={false}
                                    onDataInspect={() => createPointTable(trendData.THDV, 'Voltage THD','(%)')}
                                >
                                    {trendData.THDV.map((s, i) => <Line
                                        highlightHover={true}
                                        showPoints={true}
                                        lineStyle={s.lineStyle}
                                        color={s.color}
                                        data={s.data}
                                        legend={s.label}
                                        key={i}
                                    />)}
                                </Plot>
                            </div>
                        </div> : null)}

                    {(trendData.DeltaTHDV.length > 0 ?
                        <div className="card">
                            <div className="card-header">Change in Voltage THD</div>
                            <div className="card-body">
                                <Plot
                                    height={250}
                                    width={innerWidth - 345}
                                    showBorder={false}
                                    defaultTdomain={[Tstart, Tend]}
                                    legend={'bottom'}
                                    Tlabel={'Time'}
                                    Ylabel={'Delta THD (%)'}
                                    showMouse={true}
                                    useMetricFactors={false}
                                    onDataInspect={() => createPointTable(trendData.DeltaTHDV, 'Change in Voltage THD','(%)')}
                                >
                                    {trendData.DeltaTHDV.map((s, i) => <Line
                                        highlightHover={true}
                                        showPoints={true}
                                        lineStyle={s.lineStyle}
                                        color={s.color}
                                        data={s.data}
                                        legend={s.label}
                                        key={i}
                                    />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(trendData.THDI.length > 0 ?
                        <div className="card">
                            <div className="card-header">Current THD</div>
                            <div className="card-body">
                                <Plot
                                    height={250}
                                    width={innerWidth - 345}
                                    showBorder={false}
                                    defaultTdomain={[Tstart, Tend]}
                                    legend={'bottom'}
                                    Tlabel={'Time'}
                                    Ylabel={'THD (%)'}
                                    showMouse={true}
                                    useMetricFactors={false}
                                    onDataInspect={() => createPointTable(trendData.THDI, 'Current THD','(%)')}
                                >
                                    {trendData.THDI.map((s, i) => <Line
                                        highlightHover={true}
                                        showPoints={true}
                                        lineStyle={s.lineStyle}
                                        color={s.color}
                                        data={s.data}
                                        legend={s.label}
                                        key={i}
                                    />)}
                                </Plot>
                            </div>
                        </div> : null)}

                    {(trendData.DeltaTHDI.length > 0 ?
                        <div className="card">
                            <div className="card-header">Change in Current THD</div>
                            <div className="card-body">
                                <Plot
                                    height={250}
                                    width={innerWidth - 345}
                                    showBorder={false}
                                    defaultTdomain={[Tstart, Tend]}
                                    legend={'bottom'}
                                    Tlabel={'Time'}
                                    Ylabel={'Delta THD (%)'}
                                    showMouse={true}
                                    useMetricFactors={false}
                                    onDataInspect={() => createPointTable(trendData.THDI, 'Change in Current THD','(%)')}
                                >
                                    {trendData.DeltaTHDI.map((s, i) => <Line
                                        highlightHover={true}
                                        showPoints={true}
                                        lineStyle={s.lineStyle}
                                        color={s.color}
                                        data={s.data}
                                        legend={s.label}
                                        key={i}
                                    />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(trendData.SwitchingFreq.length > 0 ?
                        <div className="card">
                            <div className="card-header">Switching Frequency</div>
                            <div className="card-body">
                                <Plot
                                    height={250}
                                    width={innerWidth - 345}
                                    showBorder={false}
                                    defaultTdomain={[Tstart, Tend]}
                                    legend={'bottom'}
                                    Tlabel={'Time'}
                                    Ylabel={'Switching Freq. (Hz)'}
                                    showMouse={true}
                                    onDataInspect={() => createPointTable(trendData.SwitchingFreq, 'Switching Frequency','(Hz)')}
                                >
                                    {trendData.SwitchingFreq.map((s, i) => <Line
                                        highlightHover={true}
                                        showPoints={true}
                                        lineStyle={s.lineStyle}
                                        color={s.color}
                                        data={s.data}
                                        legend={s.label}
                                        key={i}
                                    />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(trendData.Xcap.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capacitor Bank Impedance</div>
                            <div className="card-body">
                                <Plot
                                    height={250}
                                    width={innerWidth - 345}
                                    showBorder={false}
                                    defaultTdomain={[Tstart, Tend]}
                                    legend={'bottom'}
                                    Tlabel={'Time'}
                                    Ylabel={'Impedance (Ohm)'}
                                    showMouse={true}
                                    onDataInspect={() => createPointTable(trendData.Xcap, 'Capacitor Bank Impedance','(Ohm)')}
                                >
                                    {trendData.Xcap.map((s, i) => <Line
                                        highlightHover={true}
                                        showPoints={true}
                                        lineStyle={s.lineStyle}
                                        color={s.color}
                                        data={s.data}
                                        legend={s.label}
                                        key={i}
                                    />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(trendData.DeltaXcap.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capacitor Bank Impedance Change</div>
                            <div className="card-body">
                                <Plot
                                    height={250}
                                    width={innerWidth - 345}
                                    showBorder={false}
                                    defaultTdomain={[Tstart, Tend]}
                                    legend={'bottom'}
                                    Tlabel={'Time'}
                                    Ylabel={'Impedance (Ohm)'}
                                    showMouse={true}
                                    onDataInspect={() => createPointTable(trendData.DeltaXcap, 'Capacitor Bank Impedance Change','(Ohm)')}
                                >
                                    {trendData.DeltaXcap.map((s, i) => <Line
                                        highlightHover={true}
                                        showPoints={true}
                                        lineStyle={s.lineStyle}
                                        color={s.color}
                                        data={s.data}
                                        legend={s.label}
                                        key={i}
                                    />)}
                                </Plot>
                            </div>
                        </div> : null)}

                    {(trendData.RestrikeDuration.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capacitor Bank Restrike Duration</div>
                                <div className="card-body">
                                <Plot
                                    height={250}
                                    width={innerWidth - 345}
                                    showBorder={false}
                                    defaultTdomain={[Tstart, Tend]}
                                    legend={'bottom'}
                                    Tlabel={'Time'}
                                    Ylabel={'Duration (cycles)'}
                                    onDataInspect={() => createPointTable(trendData.RestrikeDuration, 'Capacitor Bank Restrike Duration','(cycles)')}
                                    showMouse={true}
                                >
                                    {trendData.RestrikeDuration.map((s, i) => <Line
                                        highlightHover={true}
                                        showPoints={true}
                                        lineStyle={s.lineStyle}
                                        color={s.color}
                                        data={s.data}
                                        legend={s.label}
                                        key={i}
                                    />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(trendData.RestrikeI.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capacitor Bank Restrike Current Peak</div>
                            <div className="card-body">
                                <Plot
                                    height={250}
                                    width={innerWidth - 345}
                                    showBorder={false}
                                    defaultTdomain={[Tstart, Tend]}
                                    legend={'bottom'}
                                    Tlabel={'Time'}
                                    Ylabel={'Current Peak (kA)'}
                                    showMouse={true}
                                    onDataInspect={() => createPointTable(trendData.RestrikeI, 'Capacitor Bank Restrike Current Peak','(kA)')}
                                >
                                    {trendData.RestrikeI.map((s, i) => <Line
                                        highlightHover={true}
                                        showPoints={true}
                                        lineStyle={s.lineStyle}
                                        color={s.color}
                                        data={s.data}
                                        legend={s.label}
                                        key={i}
                                    />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(trendData.RestrikeV.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capacitor Bank Restrike Voltage Peak</div>
                            <div className="card-body">
                                <Plot
                                    height={250}
                                    width={innerWidth - 345}
                                    showBorder={false}
                                    defaultTdomain={[Tstart, Tend]}
                                    legend={'bottom'}
                                    Tlabel={'Time'}
                                    Ylabel={'Voltage Peak (kV)'}
                                    showMouse={true}
                                    onDataInspect={() => createPointTable(trendData.RestrikeV, 'Capacitor Bank Restrike Voltage Peak','(kV)')}
                                >
                                    {trendData.RestrikeV.map((s, i) => <Line
                                        highlightHover={true}
                                        showPoints={true}
                                        lineStyle={s.lineStyle}
                                        color={s.color}
                                        data={s.data}
                                        legend={s.label}
                                        key={i}
                                    />)}
                                </Plot>
                          </div>
                        </div> : null)}

                    {(trendData.PISDuration.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capacitor Bank Pre-Insertion Switching Duration</div>
                            <div className="card-body">
                                <Plot
                                    height={250}
                                    width={innerWidth - 345}
                                    showBorder={false}
                                    defaultTdomain={[Tstart, Tend]}
                                    legend={'bottom'}
                                    Tlabel={'Time'}
                                    Ylabel={'Duration (cycles)'}
                                    showMouse={true}
                                    onDataInspect={() => createPointTable(trendData.PISDuration, 'Capacitor Bank Pre-Insertion Switching Duration','(cycles)')}
                                >
                                    {trendData.PISDuration.map((s, i) => <Line
                                        highlightHover={true}
                                        showPoints={true}
                                        lineStyle={s.lineStyle}
                                        color={s.color}
                                        data={s.data}
                                        legend={s.label}
                                        key={i}
                                    />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(trendData.PISZ.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capacitor Bank Pre-Insertion Switching Impedance</div>
                            <div className="card-body">
                                <Plot
                                    height={250}
                                    width={innerWidth - 345}
                                    showBorder={false}
                                    defaultTdomain={[Tstart, Tend]}
                                    legend={'bottom'}
                                    Tlabel={'Time'}
                                    Ylabel={'Impedance (Ohm)'}
                                    showMouse={true}
                                    onDataInspect={() => createPointTable(trendData.PISZ, 'Capacitor Bank Pre-Insertion Switching Impedance','(Ohm)')}
                                >
                                    {trendData.PISZ.map((s, i) => <Line
                                        highlightHover={true}
                                        showPoints={true}
                                        lineStyle={s.lineStyle}
                                        color={s.color}
                                        data={s.data}
                                        legend={s.label}
                                        key={i}
                                    />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(trendData.PISI.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capacitor Bank Pre-Insertion Switching Current</div>
                            <div className="card-body">
                                <Plot
                                    height={250}
                                    width={innerWidth - 345}
                                    showBorder={false}
                                    defaultTdomain={[Tstart, Tend]}
                                    legend={'bottom'}
                                    Tlabel={'Time'}
                                    Ylabel={'Current (kA)'}
                                    showMouse={true}
                                    onDataInspect={() => createPointTable(trendData.PISI, 'Capacitor Bank Pre-Insertion Switching Current','(kA)')}
                                >
                                    {trendData.PISI.map((s, i) => <Line
                                        highlightHover={true}
                                        showPoints={true}
                                        lineStyle={s.lineStyle}
                                        color={s.color}
                                        data={s.data}
                                        legend={s.label}
                                        key={i}
                                    />)}
                                </Plot>
                            </div>
                        </div> : null)}

                    {(trendData.KFactor.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capacitor Bank K Factor</div>
                            <div className="card-body">
                                <Plot
                                    height={250}
                                    width={innerWidth - 345}
                                    showBorder={false}
                                    defaultTdomain={[Tstart, Tend]}
                                    legend={'bottom'}
                                    Tlabel={'Time'}
                                    Ylabel={'K Factor'}
                                    showMouse={true}
                                    useMetricFactors={false}
                                    onDataInspect={() => createPointTable(trendData.KFactor, 'Capacitor Bank k Factor','')}
                                >
                                    {trendData.KFactor.map((s, i) => <Line
                                        highlightHover={true}
                                        showPoints={true}
                                        lineStyle={s.lineStyle}
                                        color={s.color}
                                        data={s.data}
                                        legend={s.label}
                                        key={i}
                                    />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(trendData.RelaydV.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capacitor Bank Relay Differential Voltage</div>
                            <div className="card-body">
                                <Plot
                                    height={250}
                                    width={innerWidth - 345}
                                    showBorder={false}
                                    defaultTdomain={[Tstart, Tend]}
                                    legend={'bottom'}
                                    Tlabel={'Time'}
                                    Ylabel={'Diff. Voltage (V)'}
                                    showMouse={true}
                                    onDataInspect={() => createPointTable(trendData.RelaydV, 'Capacitor Bank Relay Differential Voltage','(V)')}
                                >
                                    {trendData.RelaydV.map((s, i) => <Line
                                        highlightHover={true}
                                        showPoints={true}
                                        lineStyle={s.lineStyle}
                                        color={s.color}
                                        data={s.data}
                                        legend={s.label}
                                        key={i}
                                    />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(trendData.RelayV.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capacitor Bank Relay Voltage</div>
                            <div className="card-body">
                                <Plot
                                    height={250}
                                    width={innerWidth - 345}
                                    showBorder={false}
                                    defaultTdomain={[Tstart, Tend]}
                                    legend={'bottom'}
                                    Tlabel={'Time'}
                                    Ylabel={'Voltage (V)'}
                                    showMouse={true}
                                    onDataInspect={() => createPointTable(trendData.RelayV, 'Capacitor Bank Relay Voltage','(V)')}
                                >
                                    {trendData.RelayV.map((s, i) => <Line
                                        highlightHover={true}
                                        showPoints={true}
                                        lineStyle={s.lineStyle}
                                        color={s.color}
                                        data={s.data}
                                        legend={s.label}
                                        key={i}
                                    />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(trendData.RelayXV.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capacitor Bank Voltage-Impedance Ratio Missmatch</div>
                            <div className="card-body">
                                <Plot
                                    height={250}
                                    width={innerWidth - 345}
                                    showBorder={false}
                                    defaultTdomain={[Tstart, Tend]}
                                    legend={'bottom'}
                                    Tlabel={'Time'}
                                    Ylabel={'ratio missmatch (%)'}
                                    showMouse={true}
                                    useMetricFactors={false}
                                >  onDataInspect={() => createPointTable(trendData.RelayXV, 'Capacitor Bank Voltage-Impedance Ratio Missmatch','(%)')}
                                    {trendData.RelayXV.map((s, i) => <Line
                                        highlightHover={true}
                                        showPoints={true}
                                        lineStyle={s.lineStyle}
                                        color={s.color}
                                        data={s.data}
                                        legend={s.label}
                                        key={i}
                                    />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(trendData.RelayXLV.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capacitor Bank LV Cap Reactance or Midstack Reactances</div>
                            <div className="card-body">
                                <Plot
                                    height={250}
                                    width={innerWidth - 345}
                                    showBorder={false}
                                    defaultTdomain={[Tstart, Tend]}
                                    legend={'bottom'}
                                    Tlabel={'Time'}
                                    Ylabel={'Reactance (Ohm)'}
                                    showMouse={true}
                                    onDataInspect={() => createPointTable(trendData.RelayXLV, 'Capacitor Bank LV Cap Reactance or Midstack Reactances','(Ohm)')}
                                >
                                    {trendData.RelayXLV.map((s, i) => <Line
                                        highlightHover={true}
                                        showPoints={true}
                                        lineStyle={s.lineStyle}
                                        color={s.color}
                                        data={s.data}
                                        legend={s.label}
                                        key={i}
                                    />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(trendData.Ineutral.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capacitor Bank Neutral Current</div>
                            <div className="card-body">
                                <Plot
                                    height={250}
                                    width={innerWidth - 345}
                                    showBorder={false}
                                    defaultTdomain={[Tstart, Tend]}
                                    legend={'bottom'}
                                    Tlabel={'Time'}
                                    Ylabel={'Current (A)'}
                                    showMouse={true}
                                    onDataInspect={() => createPointTable(trendData.Ineutral, 'Capacitor Bank Neutral Current','(A)')}
                                >
                                    {trendData.Ineutral.map((s, i) => <Line
                                        highlightHover={true}
                                        showPoints={true}
                                        lineStyle={s.lineStyle}
                                        color={s.color}
                                        data={s.data}
                                        legend={s.label}
                                        key={i}
                                    />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(trendData.Unbalance.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capacitor Bank Unbalance Factors</div>
                            <div className="card-body">
                                <Plot
                                    height={250}
                                    width={innerWidth - 345}
                                    showBorder={false}
                                    defaultTdomain={[Tstart, Tend]}
                                    legend={'bottom'}
                                    Tlabel={'Time'}
                                    Ylabel={'Unbalance (%)'}
                                    showMouse={true}
                                    useMetricFactors={false}
                                    onDataInspect={() => createPointTable(trendData.Unbalance, 'Capacitor Bank Unbalance Factors','(%)')}
                                >
                                    {trendData.Unbalance.map((s, i) => <Line
                                        highlightHover={true}
                                        showPoints={true}
                                        lineStyle={s.lineStyle}
                                        color={s.color}
                                        data={s.data}
                                        legend={s.label}
                                        key={i}
                                    />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(trendData.BusV.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capacitor Bank Zero Sequence Voltage</div>
                            <div className="card-body">
                                <Plot
                                    height={250}
                                    width={innerWidth - 345}
                                    showBorder={false}
                                    defaultTdomain={[Tstart, Tend]}
                                    legend={'bottom'}
                                    Tlabel={'Time'}
                                    Ylabel={'Voltage (V)'}
                                    showMouse={true}
                                    onDataInspect={() => createPointTable(trendData.BusV, 'Capacitor Bank Zero Sequence Voltage','(V)')}
                                >
                                    {trendData.BusV.map((s, i) => <Line
                                        highlightHover={true}
                                        showPoints={true}
                                        lineStyle={s.lineStyle}
                                        color={s.color}
                                        data={s.data}
                                        legend={s.label}
                                        key={i}
                                    />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(trendData.BusZ.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capacitor Bank Zero Sequence Impedance</div>
                            <div className="card-body">
                                <Plot
                                    height={250}
                                    width={innerWidth - 345}
                                    showBorder={false}
                                    defaultTdomain={[Tstart, Tend]}
                                    legend={'bottom'}
                                    Tlabel={'Time'}
                                    Ylabel={'Impedance (Ohm)'}
                                    showMouse={true}
                                    onDataInspect={() => createPointTable(trendData.BusZ, 'Capacitor Bank Zero Sequence Impedance','(Ohm)')}
                                >
                                    {trendData.BusZ.map((s, i) => <Line
                                        highlightHover={true}
                                        showPoints={true}
                                        lineStyle={s.lineStyle}
                                        color={s.color}
                                        data={s.data}
                                        legend={s.label}
                                        key={i}
                                    />)}
                                </Plot>
                            </div>
                        </div> : null)}


                    <div className="card">
                        <div className="card-header">Capacitor Bank Analytic Event Overview</div>
                        <div className="card-body">
                            <table className="table">
                                <thead>
                                    <EventHeader showEdit={props.selectedBank == -2} />
                                </thead>
                                <tbody>
                                    {eventData.map(row => EventRow(row, props.selectedBank == -2, (eventID) => { setShowCapBankEdit(true); setSelectedEvent(eventID); setSelectedCapBank(1); }))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </>
    );
};

export default CapBankReportPane;

const EventRow = (row: ICBEvent, showEdit: boolean, onEdit: (eventID: number) => void) => {
    return (
        <tr key={row.ID}>
            {showEdit ? <td key={'Edit' + row.ID}> <i className='fa fa-edit fa-2x' onClick={() => onEdit(row.ID)}></i></td> : null}
            <td key={'Time' + row.ID}><a target="_blank"
                href={'./eventsearch?line=true&date=' + moment.utc(row.Time).format('MM/DD/YYYY') + '&time=' + moment.utc(row.Time).format('HH:mm:ss.SSS') + '&windowSize=10&timeWindowUnits=2&tab=All&eventid=' + row.EventId}
            > {moment.utc(row.Time).format('MM/DD/YY HH:mm:ss.SSS')}</a></td>
            <td key={'Phase' + row.ID}>{row.Phase}</td>
            <td key={'Status' + row.ID}>{row.Status}</td>
            <td key={'Operation' + row.ID}>{row.Operation}</td>
            <td key={'Resonance' + row.ID}>{(row.Resonance ? 'Yes' : 'No')}</td>
            <td key={'Health' + row.ID}>{row.CapBankHealth}</td>
            <td key={'Restrike' + row.ID}>{(row.Restrike == undefined ? 'N/A' : row.Restrike)}</td>
            <td key={'PIS' + row.ID}>{(row.PreInsertionSwitch == undefined ? 'N/A' : row.PreInsertionSwitch)}</td>
        </tr>
    );
}

const EventHeader = (props: { showEdit: boolean }) => {
    return (
        <tr key='Header'>
            {props.showEdit? <th key="Edit"> </th> : null}
            <th key='Time'>Time</th>
            <th key='Phase'>Phase</th>
            <th key='Status'>Analysis Status</th>
            <th key='Operation'>Capacitor Bank Operation</th>
            <th key='Resonance'>Resonance</th>
            <th key='Health'>Capacitor Bank Health</th>
            <th key='Restrike'>Restrike</th>
            <th key='PIS'>PreInsertionSwitching Condition</th>
        </tr>
    );
}
