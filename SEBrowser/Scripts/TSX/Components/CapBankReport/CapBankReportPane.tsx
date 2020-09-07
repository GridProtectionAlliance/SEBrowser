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
import { CapBankReportNavBarProps } from './CapBankReportNavBar';
import _, { cloneDeep } from 'lodash';
import TrendingCard, { ITrendSeries } from './TrendingCard';
//import RelayPerformanceTrend from './RelayPerformanceTrend';

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
}

interface ICapBankReportPaneState {
    EventData: Array<ICBEvent>,
    SwitchingData: Array<ICBSwitching>,
    TrendData: ITrendDataSet,
    Tstart: number,
    Tend: number,
}


interface ICBEvent {
    ID: number, EventID: number, Phase: string, Status: string, DataErrorID: number, Operation: string, DeltaQ: number, MVAsc: number, IsRes: boolean, Time: string
}

interface ICBSwitching {
    ID: number, EventID: number, Phase: string, SwitchingCondition: string, R: number, X: number, Duration: number, Time: string
}

export default class CapBankReportPane extends React.Component<CapBankReportNavBarProps, ICapBankReportPaneState> {
   
    eventTableHandle: JQuery.jqXHR;
    switchingTableHandle: JQuery.jqXHR;
    trendHandle: JQuery.jqXHR;

    constructor(props, context) {
        super(props, context);

        this.state = {
            EventData: [],
            SwitchingData: [],
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
            },
            Tstart: 0,
            Tend: 0,
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

    getEventTableData(): JQuery.jqXHR {
        if (this.eventTableHandle !== undefined)
            this.eventTableHandle.abort();

        this.eventTableHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/PQDashboard/CapBankReport/GetEventTable?capBankId=${this.props.CapBankID}&date=${this.props.date}` +
                `&time=${this.props.time}&timeWindowunits=${this.props.timeWindowUnits}&windowSize=${this.props.windowSize}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: false,
            async: true
        });

        return this.eventTableHandle;
    }

    getSwitchingTableData(): JQuery.jqXHR {
        if (this.switchingTableHandle !== undefined)
            this.switchingTableHandle.abort();

        this.switchingTableHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/PQDashboard/CapBankReport/GetSwitchingTable?capBankId=${this.props.CapBankID}&date=${this.props.date}` +
                `&time=${this.props.time}&timeWindowunits=${this.props.timeWindowUnits}&windowSize=${this.props.windowSize}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: false,
            async: true
        });

        return this.switchingTableHandle;
    }

    getData() {
        this.getEventTableData().then(data => {
            
            if (data == null) {
                this.setState({EventData: []})
                return;
            }
            this.setState({ EventData: data })
        });

        this.getSwitchingTableData().then(data => {

            if (data == null) {
                this.setState({ SwitchingData: [] })
                return;
            }
            this.setState({ SwitchingData: data })
        });

        this.getTrendData().then(data => {

            if (data == null) {
                return;
            }
            this.setState({ TrendData: data });
        });

       
    }

    render() {
        if (this.props.CapBankID == -1) return <div></div>;

        return (
            <div style={{ width: '100%', height: '100%', maxHeight: '100%', position: 'relative', float: 'right', overflowY: 'scroll' }}>
                <div className="card">
                    <div className="card-header">Cap Bank Analytic Events</div>
                    <div className="card-body">
                        <table className="table">
                            <thead>
                                <EventHeader />
                            </thead>
                            <tbody>
                                {this.state.EventData.map(row => EventRow(row))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="card">
                    <div className="card-header">Pre-Insertion Switching Events</div>
                    <div className="card-body">
                        <table className="table">
                            <thead>
                                <SwitchingHeader />
                            </thead>
                            <tbody>
                                {this.state.SwitchingData.map(row => SwitchingRow(row))}
                            </tbody>
                        </table>
                    </div>
                </div>
                {(this.state.TrendData.Q.length > 0 ?
                    <div className="card">
                        <div className="card-header">Short Circuit Power</div>
                        <div className="card-body">
                            <TrendingCard data={this.state.TrendData.Q} keyString={'SC'} allowZoom={true} height={200} yLabel={'Short Circuit Power (MVAR)'} Tstart={this.state.Tstart} Tend={this.state.Tend} />
                        </div>
                    </div> : null)}
                {(this.state.TrendData.DeltaQ.length > 0?
                <div className="card">
                    <div className="card-header">Change in Q</div>
                        <div className="card-body">
                            <TrendingCard data={this.state.TrendData.DeltaQ} keyString={'Q'} allowZoom={true} height={200} yLabel={'Delta Q (kVAR)'} Tstart={this.state.Tstart} Tend={this.state.Tend} />
                        </div>
                    </div> : null)}
                {(this.state.TrendData.Irms.length > 0 ?
                    <div className="card">
                        <div className="card-header">RMS Current</div>
                        <div className="card-body">
                            <TrendingCard data={this.state.TrendData.Irms} keyString={'Irms'} allowZoom={true} height={200} yLabel={'I (A)'} Tstart={this.state.Tstart} Tend={this.state.Tend} />
                        </div>
                    </div> : null)}
                {(this.state.TrendData.DeltaIrms.length > 0 ?
                    <div className="card">
                        <div className="card-header">RMS Current Change</div>
                        <div className="card-body">
                            <TrendingCard data={this.state.TrendData.DeltaIrms} keyString={'dIrms'} allowZoom={true} height={200} yLabel={'Delta I (A)'} Tstart={this.state.Tstart} Tend={this.state.Tend} />
                        </div>
                    </div> : null)}
                {(this.state.TrendData.Vrms.length > 0 ?
                    <div className="card">
                        <div className="card-header">RMS Voltage</div>
                        <div className="card-body">
                            <TrendingCard data={this.state.TrendData.Vrms} keyString={'Vrms'} allowZoom={true} height={200} yLabel={'V (V)'} Tstart={this.state.Tstart} Tend={this.state.Tend} />
                        </div>
                    </div> : null)}
                {(this.state.TrendData.DeltaVrms.length > 0 ?
                    <div className="card">
                        <div className="card-header">RMS Voltage Change</div>
                        <div className="card-body">
                            <TrendingCard data={this.state.TrendData.DeltaVrms} keyString={'dVrms'} allowZoom={true} height={200} yLabel={'Delta V (V)'} Tstart={this.state.Tstart} Tend={this.state.Tend} />
                        </div>
                    </div> : null)}
                {(this.state.TrendData.Freq.length > 0 ?
                    <div className="card">
                        <div className="card-header">Resonance Frequency</div>
                        <div className="card-body">
                            <TrendingCard data={this.state.TrendData.Freq} keyString={'fres'} allowZoom={true} height={200} yLabel={'Res. Freq. (Hz)'} Tstart={this.state.Tstart} Tend={this.state.Tend} />
                        </div>
                    </div> : null)}

                {(this.state.TrendData.PeakV.length > 0 ?
                    <div className="card">
                        <div className="card-header">Peak Voltage</div>
                        <div className="card-body">
                            <TrendingCard data={this.state.TrendData.PeakV} keyString={'Vp'} allowZoom={true} height={200} yLabel={'Voltage peak (pu)'} Tstart={this.state.Tstart} Tend={this.state.Tend} />
                        </div>
                    </div> : null)}
                {(this.state.TrendData.THD.length > 0 ?
                    <div className="card">
                        <div className="card-header">Voltage and Current THD</div>
                        <div className="card-body">
                            <TrendingCard data={this.state.TrendData.THD} keyString={'thd'} allowZoom={true} height={200} yLabel={'THD (%)'} Tstart={this.state.Tstart} Tend={this.state.Tend} />
                        </div>
                    </div> : null)}

                {(this.state.TrendData.DeltaTHD.length > 0 ?
                    <div className="card">
                        <div className="card-header">Changein Current and Voltage THD</div>
                        <div className="card-body">
                            <TrendingCard data={this.state.TrendData.DeltaTHD} keyString={'dthd'} allowZoom={true} height={200} yLabel={'Delta THD (%)'} Tstart={this.state.Tstart} Tend={this.state.Tend} />
                        </div>
                    </div> : null)}
                {(this.state.TrendData.SwitchingFreq.length > 0 ?
                    <div className="card">
                        <div className="card-header">Switching Frequency</div>
                        <div className="card-body">
                            <TrendingCard data={this.state.TrendData.SwitchingFreq} keyString={'swfreq'} allowZoom={true} height={200} yLabel={'Switching Freq. (Hz)'} Tstart={this.state.Tstart} Tend={this.state.Tend} />
                        </div>
                    </div> : null)}
                {(this.state.TrendData.Xcap.length > 0 ?
                    <div className="card">
                        <div className="card-header">Capbank Impedance</div>
                        <div className="card-body">
                            <TrendingCard data={this.state.TrendData.Xcap} keyString={'Xcap'} allowZoom={true} height={200} yLabel={'Impedance (Ohm)'} Tstart={this.state.Tstart} Tend={this.state.Tend} />
                        </div>
                    </div> : null)}
                {(this.state.TrendData.DeltaXcap.length > 0 ?
                    <div className="card">
                        <div className="card-header">Capbank Impedance Change</div>
                        <div className="card-body">
                            <TrendingCard data={this.state.TrendData.DeltaXcap} keyString={'dXcap'} allowZoom={true} height={200} yLabel={'Impedance (Ohm)'} Tstart={this.state.Tstart} Tend={this.state.Tend} />
                        </div>
                    </div> : null)}
            </div>)
        
    }

    getTimeLimits() {
        let dT = this.props.windowSize;
        let Tcenter = moment(this.props.date + " " + this.props.time,"MM/dd/yyyy HH:mm:ss.SSSS");
        let dUnit = "";

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
                `&bankNum=${this.props.selectedBank}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: false,
            async: true
        });

        return this.trendHandle;
    }

    
}

const EventRow = (row: ICBEvent) => {
    return (
        <tr key={row.ID}>
            <td key={'Time' + row.ID}><a
                href={'./eventsearch?line=true&date=' + moment(row.Time).format('MM/DD/YYYY') + '&time=' + moment(row.Time).format('HH:mm:ss.SSS') + '&windowSize=10&timeWindowUnits=2&tab=All&eventid=' + row.EventID}
            > {moment(row.Time).format('MM/DD/YY HH:mm:ss.SSSS')}</a></td>
            <td key={'Phase' + row.ID}>{row.Phase}</td>
            <td key={'Operation' + row.ID}>{row.Operation}</td>
            <td key={'Status' + row.ID}>{row.Status}</td>
            <td key={'DeltaQ' + row.ID}>{row.DeltaQ.toFixed(2)} kVA</td>
            <td key={'ShortCircuit' + row.ID}>{row.MVAsc.toFixed(2)} MVA</td>
            <td key={'Resonance' + row.ID}>{(row.IsRes? 'Yes' : 'No')}</td>
            <td key={'openSee' + row.ID}></td>
        </tr>
    );
}

//09 % 2F02%2F2020
//12%3A31%3A09.616
const EventHeader = () => {
    return (
        <tr key='Header'>
            <th key='Time'>Time</th>
            <th key='Phase'>Phase</th>
            <th key='Operation'>Cap Bank Operation</th>
            <th key='Status'>Analysis Status</th>
            <th key='DeltaQ'>Change in Q (kVAR)</th>
            <th key='ShortCircuit'>SC Q (MVA)</th>
            <th key='Resonance'>Resonance</th>
            <th key='openSee'></th>
        </tr>
    );
}

const SwitchingHeader = () => {
    return (
        <tr key='Header'>
            <th key='Time'>Time</th>
            <th key='Phase'>Phase</th>
            <th key='Condition'>Switching Condition</th>
            <th key='R'>Resistance</th>
            <th key='X'>Reactance</th>
            <th key='Duration'>Switching Duration</th>
        </tr>
    );
}

const SwitchingRow = (row: ICBSwitching) => {
    return (
        <tr key={row.ID}>
            <td key={'Time' + row.ID}>{moment(row.Time).format('MM/DD/YY HH:mm:ss.SSSS')}</td>
            <td key={'Phase' + row.ID}>{row.Phase}</td>
            <td key={'Condition' + row.ID}>{row.SwitchingCondition}</td>
            <td key={'R' + row.ID}>{row.R.toFixed(3)} pu</td>
            <td key={'X' + row.ID}>{row.X.toFixed(3)} pu</td>
            <td key={'Duration' + row.ID}>{row.Duration.toFixed(2)} ms</td>
        </tr>
    );
}