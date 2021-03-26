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
import Modal from '../Modal';
import { Warning } from '@gpa-gemstone/react-interactive';
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
    THD: Array<ITrendSeries>,
    DeltaTHD: Array<ITrendSeries>,
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
    SelectedEvent: number
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
                THD: [],
                DeltaTHD: [],
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
            SelectedEvent: 0
        };

        
    }


    componentDidMount() {
        if (this.props.CapBankID >= 0)
            this.getData();
    }

    componentDidUpdate(oldProps: CapBankReportNavBarProps) {
        let newProps = _.clone(this.props);
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
        let h = $.ajax({
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

    render() {
        if (this.props.CapBankID == -1) return <div></div>;


        let bankOptions = [];
        let i;
        for (i = 0; i < this.props.numBanks; i++) {
            bankOptions.push(<option key={i} value={i + 1}> {i + 1} </option>)
        }

        return (
            <>
                <Modal Title='Assign Event to a CapBank' ShowX={true} CallBack={(confirmed) => { if (!confirmed) this.setState({ ShowCapBankEdit: false }); else this.setState({ ShowCapBankEdit: false, ShowWarning: true }); }} Show={this.state.ShowCapBankEdit} Size={'sm'} ShowCancel={false} ConfirmText={'Update'} >
                    <form>
                        <label style={{ width: '100%', position: 'relative', float: "left" }}>CapBank: </label>
                        <div className="form-group" style={{ height: 30 }}>
                            <select style={{ height: 35, width: 'calc(98%)', position: 'relative', float: "left", border: '1px solid #ced4da', borderRadius: '.25em' }} onChange={(e) => {
                                this.setState({ SelectedCapBank: (e.target as any).value });
                            }} value={this.state.SelectedCapBank}>
                                {bankOptions}
                            </select>
                        </div>
                    </form>
                </Modal >
                <Warning Show={this.state.ShowWarning} Title={'Confirm CapBank Assignment'} Message={'The CapBank manually assigned to this event can not be changed in the future. Are you sure you want to continue?'}
                    CallBack={(confirmed) => { this.setState({ ShowWarning: false }); if (confirmed) this.updateCapBank(); else this.setState({ ShowCapBankEdit: true });}} />
                <div style={{ width: '100%', height: '100%', maxHeight: '100%', position: 'relative', float: 'right', overflowY: 'scroll' }}>
                    {(this.state.TrendData.Q.length > 0 ?
                        <div className="card">
                            <div className="card-header">Short Circuit Power</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'} Ylabel={'Short Circuit Power (MVA)'} showMouse={true}>
                                    {this.state.TrendData.Q.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}

                    {(this.state.TrendData.DeltaQ.length > 0?
                    <div className="card">
                        <div className="card-header">Change in Q</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'} Ylabel={'Delta Q (kVAR)'} showMouse={true}>
                                    {this.state.TrendData.DeltaQ.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}


                    {(this.state.TrendData.Irms.length > 0 ?
                        <div className="card">
                            <div className="card-header">RMS Current</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'} Ylabel={'I RMS (A)'} showMouse={true}>
                                    {this.state.TrendData.Irms.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(this.state.TrendData.DeltaIrms.length > 0 ?
                        <div className="card">
                            <div className="card-header">RMS Current Change</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'} Ylabel={'Delta I RMS (A)'} showMouse={true}>
                                    {this.state.TrendData.DeltaIrms.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(this.state.TrendData.Vrms.length > 0 ?
                        <div className="card">
                            <div className="card-header">RMS Voltage</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'} Ylabel={'V RMS (pu)'} showMouse={true}>
                                    {this.state.TrendData.Vrms.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(this.state.TrendData.DeltaVrms.length > 0 ?
                        <div className="card">
                            <div className="card-header">RMS Voltage Change</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'} Ylabel={'Delta V RMS (pu)'} showMouse={true}>
                                    {this.state.TrendData.DeltaVrms.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(this.state.TrendData.Freq.length > 0 ?
                        <div className="card">
                            <div className="card-header">Resonance Frequency</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'} Ylabel={'Res. Freq. (Hz)'} showMouse={true}>
                                    {this.state.TrendData.Freq.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}

                    {(this.state.TrendData.PeakV.length > 0 ?
                        <div className="card">
                            <div className="card-header">Peak Voltage</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'} Ylabel={'Voltage peak (pu)'} showMouse={true}>
                                    {this.state.TrendData.PeakV.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(this.state.TrendData.THD.length > 0 ?
                        <div className="card">
                            <div className="card-header">Voltage and Current THD</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'} Ylabel={'THD (%)'} showMouse={true}>
                                    {this.state.TrendData.THD.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}

                    {(this.state.TrendData.DeltaTHD.length > 0 ?
                        <div className="card">
                            <div className="card-header">Change in Voltage and Current THD</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'} Ylabel={'Delta THD (%)'} showMouse={true}>
                                    {this.state.TrendData.DeltaTHD.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(this.state.TrendData.SwitchingFreq.length > 0 ?
                        <div className="card">
                            <div className="card-header">Switching Frequency</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'} Ylabel={'Switching Freq. (Hz)'} showMouse={true}>
                                    {this.state.TrendData.SwitchingFreq.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(this.state.TrendData.Xcap.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capbank Impedance</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'} Ylabel={'Impedance (Ohm)'} showMouse={true}>
                                    {this.state.TrendData.Xcap.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(this.state.TrendData.DeltaXcap.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capbank Impedance Change</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'} Ylabel={'Impedance (Ohm)'} showMouse={true}>
                                    {this.state.TrendData.DeltaXcap.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}

                    {(this.state.TrendData.RestrikeDuration.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capbank Restrike Duration</div>
                                <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'} Ylabel={'Duration (cycles)'} showMouse={true}>
                                    {this.state.TrendData.RestrikeDuration.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(this.state.TrendData.RestrikeI.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capbank Restrike Current Peak</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'} Ylabel={'Current Peak (kA)'} showMouse={true}>
                                    {this.state.TrendData.RestrikeI.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(this.state.TrendData.RestrikeV.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capbank Restrike Voltage Peak</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'} Ylabel={'Voltage Peak (kV)'} showMouse={true}>
                                    {this.state.TrendData.RestrikeV.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                          </div>
                        </div> : null)}

                    {(this.state.TrendData.PISDuration.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capbank Pre-Insertion Switching Duration</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'} Ylabel={'Duration (cycles)'} showMouse={true}>
                                    {this.state.TrendData.PISDuration.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(this.state.TrendData.PISZ.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capbank Pre-Insertion Switching Impedance</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'} Ylabel={'Impedance (Ohm)'} showMouse={true}>
                                    {this.state.TrendData.PISZ.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(this.state.TrendData.PISI.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capbank Pre-Insertion Switching Current</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'} Ylabel={'Current (kA)'} showMouse={true}>
                                    {this.state.TrendData.PISI.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}

                    {(this.state.TrendData.KFactor.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capbank K Factor</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'} Ylabel={'K Factor'} showMouse={true}>
                                    {this.state.TrendData.KFactor.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(this.state.TrendData.RelaydV.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capbank Relay Differential Voltage</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'} Ylabel={'Diff. Voltage (V)'} showMouse={true}>
                                    {this.state.TrendData.RelaydV.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(this.state.TrendData.RelayV.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capbank Relay Voltage</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'} Ylabel={'Voltage (V)'} showMouse={true}>
                                    {this.state.TrendData.RelayV.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(this.state.TrendData.RelayXV.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capbank Voltage-Impedance Ratio Missmatch</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'} Ylabel={'ratio missmatch (%)'} showMouse={true}>
                                    {this.state.TrendData.RelayXV.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(this.state.TrendData.RelayXLV.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capbank LV Cap Reactance</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'} Ylabel={'Reactance (Ohm)'} showMouse={true}>
                                    {this.state.TrendData.RelayXLV.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(this.state.TrendData.Ineutral.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capbank Neutral Current</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'} Ylabel={'Current (A)'} showMouse={true}>
                                    {this.state.TrendData.Ineutral.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(this.state.TrendData.Unbalance.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capbank Unbalance Factors</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'} Ylabel={'Unbalance (%)'} showMouse={true}>
                                    {this.state.TrendData.Unbalance.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(this.state.TrendData.BusV.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capbank Zero Sequence Voltage</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'} Ylabel={'Voltage (V)'} showMouse={true}>
                                    {this.state.TrendData.BusV.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}
                    {(this.state.TrendData.BusZ.length > 0 ?
                        <div className="card">
                            <div className="card-header">Capbank Zero Sequence Impedance</div>
                            <div className="card-body">
                                <Plot height={250} width={innerWidth - 345} showBorder={false} defaultTdomain={[this.state.Tstart, this.state.Tend]} legend={'bottom'} Tlabel={'Time'} Ylabel={'Impedance (Ohm)'} showMouse={true}>
                                    {this.state.TrendData.BusZ.map((s, i) => <Line highlightHover={true} showPoints={true} lineStyle={s.lineStyle} color={s.color} data={s.data} legend={s.label} key={i} />)}
                                </Plot>
                            </div>
                        </div> : null)}


                    <div className="card">
                        <div className="card-header">CapBank Analytic Event Overview</div>
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
        let dT = this.props.windowSize;
        let Tcenter = moment.utc(this.props.date + " " + this.props.time,"MM/DD/YYYY HH:mm:ss.SSSS");
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

        let Tstart = cloneDeep(Tcenter);
        Tstart.subtract(dT, dUnit);
        let Tend = cloneDeep(Tcenter);
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
            <td key={'Time' + row.ID}><a
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
            <th key='Operation'>CapBank Operation</th>
            <th key='Resonance'>Resonance</th>
            <th key='Health'>CapBank Health</th>
            <th key='Restrike'>Restrike</th>
            <th key='PIS'>PreInsertionSwitching Condition</th>
        </tr>
    );
}
