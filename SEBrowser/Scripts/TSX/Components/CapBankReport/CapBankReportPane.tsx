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
        // Special case because if they are both disabled we treat them as both enabled....
        // This case would make no sense otherwhise
        if (this.props.showRes !== this.props.showNonRes)
            filter = `&resFilt=${this.props.showRes ? '1' : '0'}`

        //Next Filter is CapBankStatus
        let capBankStat = [];
        if (this.props.CBStatAll || this.props.CBStatError)
            capBankStat.push(-1);
        if (this.props.CBStatAll || this.props.CBStat0)
            capBankStat.push(0);
        if (this.props.CBStatAll || this.props.CBStat2)
            capBankStat.push(2);
        if (this.props.CBStatAll || this.props.CBStat3)
            capBankStat.push(3);
        if (this.props.CBStatAll || this.props.CBStat4)
            capBankStat.push(4);
        if (this.props.CBStatAll || this.props.CBStat5)
            capBankStat.push(5);
        if (this.props.CBStatAll || this.props.CBStat6)
            capBankStat.push(6);
        if (this.props.CBStatAll || this.props.CBStat7)
            capBankStat.push(7);
        if (this.props.CBStatAll || this.props.CBStat8)
            capBankStat.push(8);
        if (this.props.CBStatAll || this.props.CBStat10)
            capBankStat.push(10);
        if (this.props.CBStatAll || this.props.CBStat11)
            capBankStat.push(11);
        if (this.props.CBStatAll || this.props.CBStat12)
            capBankStat.push(12);
        if (this.props.CBStatAll || this.props.CBStat20)
            capBankStat.push(20);
        if (this.props.CBStatAll || this.props.CBStat21)
            capBankStat.push(21);
        if (this.props.CBStatAll || this.props.CBStat22)
            capBankStat.push(22);

        if (capBankStat.length > 0)
            filter = filter + `&statFilt=${capBankStat.join(',')}`

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

    render() {
        if (this.props.CapBankID == -1) return <div></div>;

        return (
            <div style={{ width: '100%', height: '100%', maxHeight: '100%', position: 'relative', float: 'right', overflowY: 'scroll' }}>
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

                {(this.state.TrendData.RestrikeDuration.length > 0 ?
                <div className="card">
                    <div className="card-header">Capbank Restrike Duration</div>
                    <div className="card-body">
                        <TrendingCard data={this.state.TrendData.RestrikeDuration} keyString={'RestDur'} allowZoom={true} height={200} yLabel={'duration (ms)'} Tstart={this.state.Tstart} Tend={this.state.Tend} />
                    </div>
                </div> : null)}
                {(this.state.TrendData.RestrikeI.length > 0 ?
                <div className="card">
                    <div className="card-header">Capbank Restrike Current</div>
                    <div className="card-body">
                            <TrendingCard data={this.state.TrendData.RestrikeI} keyString={'RestI'} allowZoom={true} height={200} yLabel={'Current (kA)'} Tstart={this.state.Tstart} Tend={this.state.Tend} />
                    </div>
                </div> : null)}
                {(this.state.TrendData.RestrikeV.length > 0 ?
                <div className="card">
                    <div className="card-header">Capbank Restrike Voltage</div>
                    <div className="card-body">
                            <TrendingCard data={this.state.TrendData.RestrikeV} keyString={'RestV'} allowZoom={true} height={200} yLabel={'Voltage (kV)'} Tstart={this.state.Tstart} Tend={this.state.Tend} />
                    </div>
                </div> : null)}

                {(this.state.TrendData.PISDuration.length > 0 ?
                    <div className="card">
                        <div className="card-header">Capbank Switching Duration</div>
                        <div className="card-body">
                            <TrendingCard data={this.state.TrendData.PISDuration} keyString={'PisDur'} allowZoom={true} height={200} yLabel={'Duration (ms)'} Tstart={this.state.Tstart} Tend={this.state.Tend} />
                        </div>
                    </div> : null)}
                {(this.state.TrendData.PISZ.length > 0 ?
                    <div className="card">
                        <div className="card-header">Capbank Switching Impedance</div>
                        <div className="card-body">
                            <TrendingCard data={this.state.TrendData.PISZ} keyString={'PisZ'} allowZoom={true} height={200} yLabel={'Impedance (Ohm)'} Tstart={this.state.Tstart} Tend={this.state.Tend} />
                        </div>
                    </div> : null)}
                {(this.state.TrendData.PISI.length > 0 ?
                    <div className="card">
                        <div className="card-header">Capbank Switching Current</div>
                        <div className="card-body">
                            <TrendingCard data={this.state.TrendData.PISI} keyString={'PisI'} allowZoom={true} height={200} yLabel={'Current (kA)'} Tstart={this.state.Tstart} Tend={this.state.Tend} />
                        </div>
                    </div> : null)}

                {(this.state.TrendData.KFactor.length > 0 ?
                    <div className="card">
                        <div className="card-header">Capbank K Factor</div>
                        <div className="card-body">
                            <TrendingCard data={this.state.TrendData.KFactor} keyString={'kfactor'} allowZoom={true} height={200} yLabel={'k ()'} Tstart={this.state.Tstart} Tend={this.state.Tend} />
                        </div>
                    </div> : null)}
                {(this.state.TrendData.RelaydV.length > 0 ?
                    <div className="card">
                        <div className="card-header">Capbank Relay Voltage Difference</div>
                        <div className="card-body">
                            <TrendingCard data={this.state.TrendData.RelaydV} keyString={'reldV'} allowZoom={true} height={200} yLabel={'Voltage (V)'} Tstart={this.state.Tstart} Tend={this.state.Tend} />
                        </div>
                    </div> : null)}
                {(this.state.TrendData.RelayV.length > 0 ?
                    <div className="card">
                        <div className="card-header">Capbank Relay Voltage</div>
                        <div className="card-body">
                            <TrendingCard data={this.state.TrendData.RelayV} keyString={'relV'} allowZoom={true} height={200} yLabel={'Voltage (V)'} Tstart={this.state.Tstart} Tend={this.state.Tend} />
                        </div>
                    </div> : null)}
                {(this.state.TrendData.RelayXV.length > 0 ?
                    <div className="card">
                        <div className="card-header">Capbank Relay Voltage- Impedance Ratio Missmatch</div>
                        <div className="card-body">
                            <TrendingCard data={this.state.TrendData.RelayXV} keyString={'relXV'} allowZoom={true} height={200} yLabel={'ratio missmatch (%)'} Tstart={this.state.Tstart} Tend={this.state.Tend} />
                        </div>
                    </div> : null)}
                {(this.state.TrendData.RelayXLV.length > 0 ?
                    <div className="card">
                        <div className="card-header">Capbank Relay Impedances</div>
                        <div className="card-body">
                            <TrendingCard data={this.state.TrendData.RelayXLV} keyString={'relX'} allowZoom={true} height={200} yLabel={'Current (kA)'} Tstart={this.state.Tstart} Tend={this.state.Tend} />
                        </div>
                    </div> : null)}
                {(this.state.TrendData.Ineutral.length > 0 ?
                    <div className="card">
                        <div className="card-header">Capbank Neutral Current</div>
                        <div className="card-body">
                            <TrendingCard data={this.state.TrendData.Ineutral} keyString={'In'} allowZoom={true} height={200} yLabel={'Current (A)'} Tstart={this.state.Tstart} Tend={this.state.Tend} />
                        </div>
                    </div> : null)}
                {(this.state.TrendData.Unbalance.length > 0 ?
                    <div className="card">
                        <div className="card-header">Capbank Unbalance Factors</div>
                        <div className="card-body">
                            <TrendingCard data={this.state.TrendData.Unbalance} keyString={'ubal'} allowZoom={true} height={200} yLabel={'Unbalance (%)'} Tstart={this.state.Tstart} Tend={this.state.Tend} />
                        </div>
                    </div> : null)}
                {(this.state.TrendData.BusV.length > 0 ?
                    <div className="card">
                        <div className="card-header">Capbank Zero Sequence Voltage</div>
                        <div className="card-body">
                            <TrendingCard data={this.state.TrendData.BusV} keyString={'V0'} allowZoom={true} height={200} yLabel={'Voltage (V)'} Tstart={this.state.Tstart} Tend={this.state.Tend} />
                        </div>
                    </div> : null)}
                {(this.state.TrendData.BusZ.length > 0 ?
                    <div className="card">
                        <div className="card-header">Capbank Zero Sequence Impedance</div>
                        <div className="card-body">
                            <TrendingCard data={this.state.TrendData.BusZ} keyString={'Z0'} allowZoom={true} height={200} yLabel={'Impedance (Ohm)'} Tstart={this.state.Tstart} Tend={this.state.Tend} />
                        </div>
                    </div> : null)}


                <div className="card">
                    <div className="card-header">CapBank Analytic Event Overview</div>
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
                `&bankNum=${this.props.selectedBank}` + this.getFilterString(),
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
                href={'./eventsearch?line=true&date=' + moment(row.Time).format('MM/DD/YYYY') + '&time=' + moment(row.Time).format('HH:mm:ss.SSS') + '&windowSize=10&timeWindowUnits=2&tab=All&eventid=' + row.EventId}
            > {moment(row.Time).format('MM/DD/YY HH:mm:ss.SSSS')}</a></td>
            <td key={'Phase' + row.ID}>{row.Phase}</td>
            <td key={'Status' + row.ID}>{row.Status}</td>
            <td key={'Operation' + row.ID}>{row.Operation}</td>
            <td key={'Resonance' + row.ID}>{(row.Resonance ? 'Yes' : 'No')}</td>
            <td key={'Health' + row.ID}>{row.CapBankHealth}</td>
            <td key={'PIS' + row.ID}>{row.PreInsertionSwitch}</td>
            <td key={'Restrike' + row.ID}>{row.Restrike}</td>
        </tr>
    );
}

const EventHeader = () => {
    return (
        <tr key='Header'>
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
