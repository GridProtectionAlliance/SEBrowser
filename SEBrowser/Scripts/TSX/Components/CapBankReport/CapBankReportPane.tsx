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
import _, { cloneDeep } from 'lodash';
import { Warning, Modal } from '@gpa-gemstone/react-interactive';
import { Plot, Line } from '@gpa-gemstone/react-graph'

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

interface ICapBankReportPaneState {
    EventData: Array<ICBEvent>,
    TrendData: ITrendDataSet,
    Tstart: number,
    Tend: number,
    ShowWarning: boolean,
    ShowCapBankEdit: boolean,
    SelectedCapBank: number,
    SelectedEvent: number,
    ShowTable: boolean,
    TableContent: JSX.Element,
    TableTitle: string
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


export default class CapBankReportPane extends React.Component<CapBankReportNavBarProps, ICapBankReportPaneState> {
   
    eventTableHandle: JQuery.jqXHR;
    trendHandle: JQuery.jqXHR;

    constructor(props, context) {
        super(props, context);

        this.state = {
            EventData: [],
            TrendData: {
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

            },
            Tstart: 0,
            Tend: 0,
            ShowWarning: false,
            ShowCapBankEdit: false,
            SelectedCapBank: 1,
            SelectedEvent: 0,
            ShowTable: false,
            TableContent: null,
            TableTitle: ''
        };

        
    }


    componentDidMount() {
        if (this.props.CapBankID >= 0)
            this.getData();
    }

    componentDidUpdate(oldProps: CapBankReportNavBarProps) {
        const newProps = _.clone(this.props);
        if (!_.isEqual(newProps, oldProps) && newProps.CapBankID >= 0) {
            this.getData();
            this.getTimeLimits()
        }
            
    }

    getFilterString() {
        let filter = "";

        //First Filter is Resonance
        if (this.props.ResFilt.length > 0)
            filter = `&resFilt=${this.props.ResFilt.join(',')}`

        //Next Filter is CapBankStatus
        if ((this.props.StatFilt.length > 0) && (!this.props.StatFilt.includes(999)))
            filter = filter + `&statFilt=${this.props.StatFilt.join(',')}`

        //Next Filter is Operation
        if ((this.props.OpFilt.length > 0) && (!this.props.OpFilt.includes(999)))
            filter = filter + `&operationFilt=${this.props.OpFilt.join(',')}`

        //Next Filter is Restrike Filter
        if ((this.props.RestFilt.length > 0) && (!this.props.RestFilt.includes(999)))
            filter = filter + `&restrikeFilt=${this.props.RestFilt.join(',')}`

        //Next Filter is Switching Health Filter
        if ((this.props.PISFilt.length > 0) && (!this.props.PISFilt.includes(999)))
            filter = filter + `&switchingHealthFilt=${this.props.PISFilt.join(',')}`

        //Next Filter is CB Health Filter
        if ((this.props.HealthFilt.length > 0) && (!this.props.HealthFilt.includes(999)))
            filter = filter + `&healthFilt=${this.props.HealthFilt.join(',')}`

        //Next Filter is Phase Filter
        if ((this.props.PhaseFilter.length > 0) && (!this.props.PhaseFilter.includes(999)))
            filter = filter + `&phaseFilt=${this.props.PhaseFilter.join(',')}`
        
        return filter;
    }

    getEventTableData(): JQuery.jqXHR {
        if (this.eventTableHandle !== undefined)
            this.eventTableHandle.abort();

        this.eventTableHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/PQDashboard/CapBankReport/GetEventTable?capBankId=${this.props.CapBankID}&date=${this.props.date}` +
                `&time=${this.props.time}&timeWindowunits=${this.props.timeWindowUnits}&windowSize=${this.props.windowSize}` +
                `&bankNum=${this.props.selectedBank}` + this.getFilterString(),
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: false,
            async: true
        });

        return this.eventTableHandle;
    }

   
    getData() {
        this.getEventTableData().then(data => {
            
            if (data == null) {
                this.setState({EventData: []})
                return;
            }
            this.setState({ EventData: data })
        });

        

        this.getTrendData().then(data => {

            if (data == null) {
                return;
            }
            this.setState({ TrendData: data });
        });

       
    }

    updateCapBank() {
        const h = $.ajax({
            type: "GET",
            url: `${homePath}api/PQDashboard/CapBankReport/SetCapBank/${this.state.SelectedEvent}/${this.state.SelectedCapBank}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: false,
            async: true
        });

        h.then(d => {
            this.getData();
        })
    }

    createPointTable(d: ITrendSeries[], title: string, unit: string) {

        let indices = d.map((item, index) => 0);
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

        this.setState({ ShowTable: true, TableTitle: title, TableContent: content });
    }

    render() {
        if (this.props.CapBankID == -1) return <div></div>;


        const bankOptions = [];
        let i;
        for (i = 0; i < this.props.numBanks; i++) {
            bankOptions.push(<option key={i} value={i + 1}> {i + 1} </option>)
        }

        return (
            <>
                <Modal Title='Assign Event to a Capacitor Bank' ShowX={true} CallBack={(confirmed) => { if (!confirmed) this.setState({ ShowCapBankEdit: false }); else this.setState({ ShowCapBankEdit: false, ShowWarning: true }); }} Show={this.state.ShowCapBankEdit} Size={'sm'} ShowCancel={false} ConfirmText={'Update'} >
                    <form>
                        <label style={{ width: '100%', position: 'relative', float: "left" }}>Capacitor Bank: </label>
                        <div className="form-group" style={{ height: 30 }}>
                            <select style={{ height: 35, width: 'calc(98%)', position: 'relative', float: "left", border: '1px solid #ced4da', borderRadius: '.25em' }} onChange={(e) => {
                                this.setState({ SelectedCapBank: (e.target as any).value });
                            }} value={this.state.SelectedCapBank}>
                                {bankOptions}
                            </select>
                        </div>
                    </form>
                </Modal>
                <Modal Title={this.state.TableTitle} Show={this.state.ShowTable} ShowX={true} CallBack={() => this.setState({ ShowTable: false })} ShowCancel={false} ConfirmText={'Close'} Size={'xlg'}>
                    {this.state.TableContent}
                </Modal>
                <Warning Show={this.state.ShowWarning} Title={'Confirm Capacitor Bank Assignment'} Message={'The Capacitor Bank manually assigned to this event can not be changed in the future. Are you sure you want to continue?'}
                    CallBack={(confirmed) => { this.setState({ ShowWarning: false }); if (confirmed) this.updateCapBank(); else this.setState({ ShowCapBankEdit: true });}} />
                <div style={{ width: '100%', height: '100%', maxHeight: '100%', position: 'relative', float: 'right', overflowY: 'scroll' }}>
                    {(this.state.TrendData.Q.length > 0 ?
                        <div className="card">
                            <div className="card-header">Short Circuit Power</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'}
                                    Tlabel={'Time'} Ylabel={'Short Circuit Power (MVA)'} showMouse={true} onDataInspect={() => this.createPointTable(this.state.TrendData.Q, 'Short Circuit Power', '(MVA)')}>
                                    {this.state.TrendData.Q.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}

                    {(this.state.TrendData.DeltaQ.length > 0?
                    <div className="card">
                        <div className="card-header">Change in Q</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'}
                                    Tlabel={'Time'} Ylabel={'Delta Q (kVAR)'} showMouse={true} onDataInspect={() => this.createPointTable(this.state.TrendData.DeltaQ, 'Change in Q','(MVA)')}>
                                    {this.state.TrendData.DeltaQ.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}


                    {(this.state.TrendData.Irms.length > 0 ?
                        <div className="card">
                            <div className="card-header">RMS Current</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'}
                                    Tlabel={'Time'} Ylabel={'I RMS (A)'} showMouse={true} onDataInspect={() => this.createPointTable(this.state.TrendData.Irms, 'RMS Current','(A)')}>
                                    {this.state.TrendData.Irms.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(this.state.TrendData.DeltaIrms.length > 0 ?
                        <div className="card">
                            <div className="card-header">Change in RMS Current</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'}
                                    Tlabel={'Time'} Ylabel={'Delta I RMS (A)'} showMouse={true} onDataInspect={() => this.createPointTable(this.state.TrendData.DeltaIrms, 'Change in RMS Current','(A)')}>
                                    {this.state.TrendData.DeltaIrms.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(this.state.TrendData.Vrms.length > 0 ?
                        <div className="card">
                            <div className="card-header">RMS Voltage</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'}
                                    Tlabel={'Time'} Ylabel={'V RMS (%)'} showMouse={true} useMetricFactors={false} onDataInspect={() => this.createPointTable(this.state.TrendData.Vrms, 'RMS Voltage','(%)')}>
                                    {this.state.TrendData.Vrms.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(this.state.TrendData.DeltaVrms.length > 0 ?
                        <div className="card">
                            <div className="card-header">Change in RMS Voltage</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'}
                                    Ylabel={'Delta V RMS (%)'} showMouse={true} useMetricFactors={false} onDataInspect={() => this.createPointTable(this.state.TrendData.DeltaVrms, 'Change in RMS Voltage','(%)')}>
                                    {this.state.TrendData.DeltaVrms.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(this.state.TrendData.Freq.length > 0 ?
                        <div className="card">
                            <div className="card-header">Resonance Frequency</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'}
                                    Ylabel={'Res. Freq. (Hz)'} showMouse={true} onDataInspect={() => this.createPointTable(this.state.TrendData.Freq, 'Resonance Frequency','(Hz)')}>
                                    {this.state.TrendData.Freq.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}

                    {(this.state.TrendData.PeakV.length > 0 ?
                        <div className="card">
                            <div className="card-header">Peak Voltage</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'}
                                    Tlabel={'Time'} Ylabel={'Voltage peak (%)'} showMouse={true} useMetricFactors={false} onDataInspect={() => this.createPointTable(this.state.TrendData.PeakV, 'Peak Voltage','(%)')}>
                                    {this.state.TrendData.PeakV.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(this.state.TrendData.THDV.length > 0 ?
                        <div className="card">
                            <div className="card-header">Voltage THD</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'}
                                    Ylabel={'THD (%)'} showMouse={true} useMetricFactors={false} onDataInspect={() => this.createPointTable(this.state.TrendData.THDV, 'Voltage THD','(%)')}>
                                    {this.state.TrendData.THDV.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}

                    {(this.state.TrendData.DeltaTHDV.length > 0 ?
                        <div className="card">
                            <div className="card-header">Change in Voltage THD</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'}
                                    Tlabel={'Time'} Ylabel={'Delta THD (%)'} showMouse={true} useMetricFactors={false} onDataInspect={() => this.createPointTable(this.state.TrendData.DeltaTHDV, 'Change in Voltage THD','(%)')}>
                                    {this.state.TrendData.DeltaTHDV.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(this.state.TrendData.THDI.length > 0 ?
                        <div className="card">
                            <div className="card-header">Current THD</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'}
                                    Ylabel={'THD (%)'} showMouse={true} useMetricFactors={false} onDataInspect={() => this.createPointTable(this.state.TrendData.THDI, 'Current THD','(%)')}>
                                    {this.state.TrendData.THDI.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}

                    {(this.state.TrendData.DeltaTHDI.length > 0 ?
                        <div className="card">
                            <div className="card-header">Change in Current THD</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'}
                                    Ylabel={'Delta THD (%)'} showMouse={true} useMetricFactors={false} onDataInspect={() => this.createPointTable(this.state.TrendData.THDI, 'Change in Current THD','(%)')}>
                                    {this.state.TrendData.DeltaTHDI.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(this.state.TrendData.SwitchingFreq.length > 0 ?
                        <div className="card">
                            <div className="card-header">Switching Frequency</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'}
                                    Ylabel={'Switching Freq. (Hz)'} showMouse={true} onDataInspect={() => this.createPointTable(this.state.TrendData.SwitchingFreq, 'Switching Frequency','(Hz)')}>
                                    {this.state.TrendData.SwitchingFreq.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(this.state.TrendData.Xcap.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capacitor Bank Impedance</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'} Ylabel={'Impedance (Ohm)'}
                                    showMouse={true} onDataInspect={() => this.createPointTable(this.state.TrendData.Xcap, 'Capacitor Bank Impedance','(Ohm)')}>
                                    {this.state.TrendData.Xcap.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(this.state.TrendData.DeltaXcap.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capacitor Bank Impedance Change</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'} Ylabel={'Impedance (Ohm)'}
                                    showMouse={true} onDataInspect={() => this.createPointTable(this.state.TrendData.DeltaXcap, 'Capacitor Bank Impedance Change','(Ohm)')}>
                                    {this.state.TrendData.DeltaXcap.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}

                    {(this.state.TrendData.RestrikeDuration.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capacitor Bank Restrike Duration</div>
                                <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'} Ylabel={'Duration (cycles)'}
                                    onDataInspect={() => this.createPointTable(this.state.TrendData.RestrikeDuration, 'Capacitor Bank Restrike Duration','(cycles)')} showMouse={true}>
                                    {this.state.TrendData.RestrikeDuration.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(this.state.TrendData.RestrikeI.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capacitor Bank Restrike Current Peak</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'}
                                    Ylabel={'Current Peak (kA)'} showMouse={true} onDataInspect={() => this.createPointTable(this.state.TrendData.RestrikeI, 'Capacitor Bank Restrike Current Peak','(kA)')}>
                                    {this.state.TrendData.RestrikeI.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(this.state.TrendData.RestrikeV.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capacitor Bank Restrike Voltage Peak</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'}
                                    Ylabel={'Voltage Peak (kV)'} showMouse={true} onDataInspect={() => this.createPointTable(this.state.TrendData.RestrikeV, 'Capacitor Bank Restrike Voltage Peak','(kV)')}>
                                    {this.state.TrendData.RestrikeV.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                          </div>
                        </div> : null)}

                    {(this.state.TrendData.PISDuration.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capacitor Bank Pre-Insertion Switching Duration</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'}
                                    Ylabel={'Duration (cycles)'} showMouse={true} onDataInspect={() => this.createPointTable(this.state.TrendData.PISDuration, 'Capacitor Bank Pre-Insertion Switching Duration','(cycles)')}>
                                    {this.state.TrendData.PISDuration.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(this.state.TrendData.PISZ.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capacitor Bank Pre-Insertion Switching Impedance</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'}
                                    Ylabel={'Impedance (Ohm)'} showMouse={true} onDataInspect={() => this.createPointTable(this.state.TrendData.PISZ, 'Capacitor Bank Pre-Insertion Switching Impedance','(Ohm)')}>
                                    {this.state.TrendData.PISZ.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(this.state.TrendData.PISI.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capacitor Bank Pre-Insertion Switching Current</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'}
                                    Ylabel={'Current (kA)'} showMouse={true} onDataInspect={() => this.createPointTable(this.state.TrendData.PISI, 'Capacitor Bank Pre-Insertion Switching Current','(kA)')}>
                                    {this.state.TrendData.PISI.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}

                    {(this.state.TrendData.KFactor.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capacitor Bank K Factor</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'}
                                    Ylabel={'K Factor'} showMouse={true} useMetricFactors={false} onDataInspect={() => this.createPointTable(this.state.TrendData.KFactor, 'Capacitor Bank k Factor','')}>
                                    {this.state.TrendData.KFactor.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(this.state.TrendData.RelaydV.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capacitor Bank Relay Differential Voltage</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'}
                                    Ylabel={'Diff. Voltage (V)'} showMouse={true} onDataInspect={() => this.createPointTable(this.state.TrendData.RelaydV, 'Capacitor Bank Relay Differential Voltage','(V)')}>
                                    {this.state.TrendData.RelaydV.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(this.state.TrendData.RelayV.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capacitor Bank Relay Voltage</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'}
                                    Ylabel={'Voltage (V)'} showMouse={true} onDataInspect={() => this.createPointTable(this.state.TrendData.RelayV, 'Capacitor Bank Relay Voltage','(V)')}>
                                    {this.state.TrendData.RelayV.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(this.state.TrendData.RelayXV.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capacitor Bank Voltage-Impedance Ratio Missmatch</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'}
                                    Ylabel={'ratio missmatch (%)'} showMouse={true} useMetricFactors={false}>  onDataInspect={() => this.createPointTable(this.state.TrendData.RelayXV, 'Capacitor Bank Voltage-Impedance Ratio Missmatch','(%)')}
                                    {this.state.TrendData.RelayXV.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(this.state.TrendData.RelayXLV.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capacitor Bank LV Cap Reactance or Midstack Reactances</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'}
                                    Tlabel={'Time'} Ylabel={'Reactance (Ohm)'} showMouse={true} onDataInspect={() => this.createPointTable(this.state.TrendData.RelayXLV, 'Capacitor Bank LV Cap Reactance or Midstack Reactances','(Ohm)')}>
                                    {this.state.TrendData.RelayXLV.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(this.state.TrendData.Ineutral.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capacitor Bank Neutral Current</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'} Ylabel={'Current (A)'}
                                    showMouse={true} onDataInspect={() => this.createPointTable(this.state.TrendData.Ineutral, 'Capacitor Bank Neutral Current','(A)')}>
                                    {this.state.TrendData.Ineutral.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(this.state.TrendData.Unbalance.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capacitor Bank Unbalance Factors</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'}
                                    Ylabel={'Unbalance (%)'} showMouse={true} useMetricFactors={false} onDataInspect={() => this.createPointTable(this.state.TrendData.Unbalance, 'Capacitor Bank Unbalance Factors','(%)')}>
                                    {this.state.TrendData.Unbalance.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(this.state.TrendData.BusV.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capacitor Bank Zero Sequence Voltage</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'}
                                    Ylabel={'Voltage (V)'} showMouse={true} onDataInspect={() => this.createPointTable(this.state.TrendData.BusV, 'Capacitor Bank Zero Sequence Voltage','(V)')} >
                                    {this.state.TrendData.BusV.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(this.state.TrendData.BusZ.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capacitor Bank Zero Sequence Impedance</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'}
                                    Ylabel={'Impedance (Ohm)'} showMouse={true} onDataInspect={() => this.createPointTable(this.state.TrendData.BusZ, 'Capacitor Bank Zero Sequence Impedance','(Ohm)')}>
                                    {this.state.TrendData.BusZ.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}


                    <div className="card">
                        <div className="card-header">Capacitor Bank Analytic Event Overview</div>
                        <div className="card-body">
                            <table className="table">
                                <thead>
                                    <EventHeader showEdit={this.props.selectedBank == -2} />
                                </thead>
                                <tbody>
                                    {this.state.EventData.map(row => EventRow(row, this.props.selectedBank == -2, (obj) => this.setState(obj)))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </>
        )
        
    }

    getTimeLimits() {
        const dT = this.props.windowSize;
        const Tcenter = moment.utc(this.props.date + " " + this.props.time,"MM/DD/YYYY HH:mm:ss.SSSS");
        let dUnit: moment.unitOfTime.DurationConstructor;

        if (this.props.timeWindowUnits == 0)
            dUnit = "ms";
        else if (this.props.timeWindowUnits == 1)
            dUnit = "s"
        else if (this.props.timeWindowUnits == 2)
            dUnit = "m"
        else if (this.props.timeWindowUnits == 3)
            dUnit = "h"
        else if (this.props.timeWindowUnits == 4)
            dUnit = "d"
        else if (this.props.timeWindowUnits == 5)
            dUnit = "w"
        else if (this.props.timeWindowUnits == 6)
            dUnit = "M"
        else if (this.props.timeWindowUnits == 7)
            dUnit = "y"

        const Tstart = cloneDeep(Tcenter);
        Tstart.subtract(dT, dUnit);
        const Tend = cloneDeep(Tcenter);
        Tend.add(dT, dUnit);

        this.setState({ Tstart: Tstart.valueOf(), Tend: Tend.valueOf()})
    }

    getTrendData() {
        if (this.trendHandle !== undefined)
            this.trendHandle.abort();

        this.trendHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/PQDashboard/CapBankReport/GetTrend?capBankId=${this.props.CapBankID}&date=${this.props.date}` +
                `&time=${this.props.time}&timeWindowunits=${this.props.timeWindowUnits}&windowSize=${this.props.windowSize}` +
                `&bankNum=${this.props.selectedBank}` + this.getFilterString(),
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: false,
            async: true
        });

        return this.trendHandle;
    }

    
}

const EventRow = (row: ICBEvent, showEdit: boolean, stateSetter: (obj: any) => void) => {
    return (
        <tr key={row.ID}>
            {showEdit ? <td key={'Edit' + row.ID}> <i className='fa fa-edit fa-2x' onClick={() => stateSetter({ ShowCapBankEdit: true, SelectedEvent: row.ID, SelectedCapBank: 1})}></i></td> : null}
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
