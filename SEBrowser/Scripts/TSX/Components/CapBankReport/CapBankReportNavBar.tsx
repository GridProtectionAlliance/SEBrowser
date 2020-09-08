//******************************************************************************************************
//  CapBankReportNavBar.tsx - Gbtc
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
import SEBrowserService from './../../../TS/Services/SEBrowser';


const momentDateFormat = "MM/DD/YYYY";
const momentTimeFormat = "HH:mm:ss.SSS";


export interface Substation {
    LocationID: number, LocationKey: string, AssetName: string
}

export interface EventFilter {
    showRes: boolean,
    showNonRes: boolean,
    CBStatError: boolean,
    CBStat0: boolean,
    CBStat2: boolean,
    CBStat3: boolean,
    CBStat4: boolean,
    CBStat5: boolean,
    CBStat6: boolean,
    CBStat7: boolean,
    CBStat8: boolean,
    CBStat10: boolean,
    CBStat11: boolean,
    CBStat12: boolean,
    CBStat20: boolean,
    CBStat21: boolean,
    CBStat22: boolean,
    CBStatAll: boolean,
}

export interface CapBankReportNavBarProps extends EventFilter {
    stateSetter(state): void,
    CapBankID: number,
    date: string,
    time: string,
    windowSize: number,
    timeWindowUnits: number,
    selectedBank: number,
    StationId: number,
   
}

interface CapBank {
    Id: number,
    AssetKey: string,
    numBanks: number,
    fused: boolean,
    compensated: boolean
}

interface Istate {
    capBanks: Array<CapBank>,
    subStations: Array<Substation>,
}

export default class CapBankReportNavBar extends React.Component<CapBankReportNavBarProps, Istate>{
    seBrowserService: SEBrowserService;

    constructor(props: CapBankReportNavBarProps, context) {
        super(props, context);
        this.seBrowserService = new SEBrowserService();
        this.state = {
            capBanks: [],
            subStations: []
        };
    }

    componentDidMount() {
        this.getSubstationData();

        $('#datePicker').datetimepicker({ format: momentDateFormat });
        $('#datePicker').on('dp.change', (e) => {
            this.setDate((e.target as any).value);
        });

        $('#timePicker').datetimepicker({ format: momentTimeFormat });
        $('#timePicker').on('dp.change', (e) => {
            this.setTime((e.target as any).value);
        });
    }

    componentWillReceiveProps(nextProps: CapBankReportNavBarProps) {
    }

    getCapBankData(LocationID: number) {
        
        this.seBrowserService.GetCapBankData(LocationID).done(results => {
            this.setState({ capBanks: results })
        });
       
    }

    setCapBank(capBankId: number) {
       
        var object = _.clone(this.props) as CapBankReportNavBarProps;
        object.CapBankID = capBankId;
        object.selectedBank = -1;
        this.props.stateSetter({ searchBarProps: object });
    }

    setBankNumber(capBankNumber: number) {
        var object = _.clone(this.props) as CapBankReportNavBarProps;
        object.selectedBank = capBankNumber;
        this.props.stateSetter({ searchBarProps: object });
    }

    setDate(date: string) {

        var object = _.clone(this.props) as CapBankReportNavBarProps;
        object.date = date;
        this.props.stateSetter({ searchBarProps: object });
    }

    setTime(time: string) {

        var object = _.clone(this.props) as CapBankReportNavBarProps;
        object.time = time;
        this.props.stateSetter({ searchBarProps: object });
    }

    setTimeWindowUnits(timeWindowUnits: number) {

        var object = _.clone(this.props) as CapBankReportNavBarProps;
        object.timeWindowUnits = timeWindowUnits;
        this.props.stateSetter({ searchBarProps: object });
    }

    setWindowSize(windowSize: number) {

        var object = _.clone(this.props) as CapBankReportNavBarProps;
        object.windowSize = windowSize;
        this.props.stateSetter({ searchBarProps: object });
    }

    setFilter(obj) {
        var object = _.clone(this.props) as CapBankReportNavBarProps;
        if (obj.showRes != undefined)
            object.showRes = obj.showRes;
        if (obj.showNonRes != undefined)
            object.showNonRes = obj.showNonRes;
        if (obj.CBStatError != undefined)
            object.CBStatError = obj.CBStatError;
        if (obj.CBStat0 != undefined)
            object.CBStat0 = obj.CBStat0;
        if (obj.CBStat2 != undefined)
            object.CBStat2 = obj.CBStat2;
        if (obj.CBStat3 != undefined)
            object.CBStat3 = obj.CBStat3;
        if (obj.CBStat4 != undefined)
            object.CBStat4 = obj.CBStat4;
        if (obj.CBStat5 != undefined)
            object.CBStat5 = obj.CBStat5;
        if (obj.CBStat6 != undefined)
            object.CBStat6 = obj.CBStat6;
        if (obj.CBStat7 != undefined)
            object.CBStat7 = obj.CBStat7;
        if (obj.CBStat8 != undefined)
            object.CBStat8 = obj.CBStat8;
        if (obj.CBStat10 != undefined)
            object.CBStat10 = obj.CBStat10;
        if (obj.CBStat11 != undefined)
            object.CBStat11 = obj.CBStat11;
        if (obj.CBStat12 != undefined)
            object.CBStat12 = obj.CBStat12;
        if (obj.CBStat20 != undefined)
            object.CBStat20 = obj.CBStat20;
        if (obj.CBStat21 != undefined)
            object.CBStat21 = obj.CBStat21;
        if (obj.CBStat22 != undefined)
            object.CBStat22 = obj.CBStat22;
        if (obj.CBStatAll != undefined)
            object.CBStatAll = obj.CBStatAll;
        this.props.stateSetter({ searchBarProps: object });
    }

    getSubstationData() {
        this.seBrowserService.GetCapBankSubstationData().done(results => {
            if (results == null)
                return
            this.setState({ subStations: results });
            if (this.props.StationId != undefined)
                this.getCapBankData(this.props.StationId);
        });
    }

    setStation(id: number) {
        var object = _.clone(this.props) as CapBankReportNavBarProps;
        object.StationId = id;
        this.props.stateSetter({ searchBarProps: object });
        this.getCapBankData(id);
    }
   
    render() {

        let bankOptions: Array<JSX.Element> = [];
        let i = 1;
        let n = 1;
        if (this.state.capBanks.find(cB => cB.Id == this.props.CapBankID) != null)
            n = this.state.capBanks.find(cB => cB.Id == this.props.CapBankID).numBanks;

        bankOptions.push(<option key={-1} value={-1}> {'System'} </option>)

        for (i = 0; i < n; i++) {
            bankOptions.push(<option key={i} value={i+1}> {i+1} </option>)
        }
        

        return (
            <>
            <nav className="navbar navbar-expand-lg navbar-light bg-light">

                <div className="collapse navbar-collapse" id="navbarSupportedContent" style={{ width: '100%' }}>
                    <ul className="navbar-nav mr-auto" style={{ width: '100%' }}>
                        <li className="nav-item" style={{ width: '40%', paddingRight: 10 }}>
                            <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                                <legend className="w-auto" style={{ fontSize: 'large' }}>Capacitor Bank:</legend>
                                <form>
                                    <label style={{ width: '100%', position: 'relative', float: "left"  }}>Substation: </label>
                                    <div className="form-group" style={{ height: 30 }}>
                                            <select style={{ height: 35, width: 'calc(98%)', position: 'relative', float: "left", border: '1px solid #ced4da', borderRadius: '.25em' }} onChange={(e) => {
                                                this.setStation((e.target as any).value);
                                            }} value={this.props.StationId}>
                                                {this.state.subStations.map(item => <option key={item.LocationID} value={item.LocationID} > {item.AssetName} </option>)}
                                        </select>
                                    </div>
                                    <label style={{ width: '100%', position: 'relative', float: "left" }}>Cap Bank Group: </label>
                                    <div className="form-group" style={{ height: 30 }}>
                                            <select ref="Breaker" style={{ height: 35, width: 'calc(98%)', position: 'relative', float: "left", border: '1px solid #ced4da', borderRadius: '.25em' }} onChange={(e) => {
                                                this.setCapBank(parseInt((e.target as any).value.toString()));
                                            }} value={this.props.CapBankID}>
                                                {this.state.capBanks.map(item => <option key={item.Id} value={item.Id} > {item.AssetKey} </option>)}
                                        </select>
                                    </div>
                                    <label style={{ width: '100%', position: 'relative', float: "left" }}>Bank: </label>
                                    <div className="form-group" style={{ height: 30 }}>
                                            <select ref="CapBankId" style={{ height: 35, width: 'calc(98%)', position: 'relative', float: "left", border: '1px solid #ced4da', borderRadius: '.25em' }} onChange={(e) => {
                                                this.setBankNumber(parseInt((e.target as any).value.toString()));
                                            }} >
                                            {bankOptions}
                                        </select>
                                    </div>
                                </form>
                            </fieldset>
                        </li>
                        <li className="nav-item" style={{ width: '40%', paddingRight: 10 }}>
                            <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                                <legend className="w-auto" style={{ fontSize: 'large' }}>Time Window:</legend>
                                <form>
                                    <label style={{ width: '100%', position: 'relative', float: "left" }} >Date: </label>
                                    <div className="form-group" style={{ height: 30 }}>
                                        <div className='input-group' style={{ width: 'calc(49%)', position: 'relative', float: "right" }}>
                                            <input id="timePicker" className='form-control' value={this.props.time} onChange={(e) => {
                                                this.setTime((e.target as any).value);
                                            }} />
                                        </div>

                                        <div className='input-group date' style={{ width: 'calc(49%)', position: 'relative', float: "left" }}>
                                            <input className='form-control' id='datePicker' value={this.props.date} onChange={(e) => {
                                                this.setDate((e.target as any).value);
                                            }} />
                                        </div>

                                    </div>
                                    <label style={{ width: '100%', position: 'relative', float: "left" }}>Time Window(+/-): </label>
                                    <div className="form-group" style={{ height: 30 }}>
                                        <input style={{ height: 35, width: 'calc(49%)', position: 'relative', float: "left", border: '1px solid #ced4da', borderRadius: '.25em' }} value={this.props.windowSize} onChange={(e) => {
                                            this.setWindowSize((e.target as any).value);
                                        }} type="number" />
                                        <select style={{ height: 35, width: 'calc(49%)', position: 'relative', float: "right", border: '1px solid #ced4da', borderRadius: '.25em' }} value={this.props.timeWindowUnits} onChange={(e) => {
                                            this.setTimeWindowUnits((e.target as any).value);
                                        }} >
                                            <option value="7">Year</option>
                                            <option value="6">Month</option>
                                            <option value="5">Week</option>
                                            <option value="4">Day</option>
                                            <option value="3">Hour</option>
                                            <option value="2">Minute</option>
                                            <option value="1">Second</option>
                                            <option value="0">Millisecond</option>
                                        </select>

                                    </div>
                                </form>
                            </fieldset>
                        </li>
                        <li className="nav-item" style={{ width: '20%', paddingRight: 10 }}>
                            <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                                <legend className="w-auto" style={{ fontSize: 'large' }}>Additional Filter:</legend>
                                    <button className="btn btn-primary" data-toggle='modal' data-target='#newFilter' onClick={(evt) => evt.preventDefault()} >Edit Filter</button>
                            </fieldset>
                        </li>
                    </ul>
                </div>
            </nav>

            <div className="modal" id="newFilter">
                    <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">Filter CapBank Events</h4>
                            <button type="button" className="close" data-dismiss="modal">&times;</button>
                        </div>
                            <div className="modal-body" style={{display: 'inline-flex'}}>
                                <div style={{ width: '50%', paddingRight: 10 }}>
                                    <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                                        <legend className="w-auto" style={{ fontSize: 'large' }}>Resonance:</legend>
                                        <form>
                                            <ul style={{ listStyleType: 'none', padding: 0, width: '100%', position: 'relative', float: 'left' }}>
                                                <li><label><input type="checkbox" onChange={() => {
                                                    this.setFilter({ showRes: !this.props.showRes });
                                                }} checked={this.props.showRes} /> Resonance </label></li>
                                                <li><label><input type="checkbox" onChange={() => {
                                                    this.setFilter({ showNonRes: !this.props.showNonRes });
                                                }} checked={this.props.showNonRes} /> No Resonance</label></li>
                                            </ul>
                                        </form>
                                    </fieldset>
                                </div>
                                <div style={{ width: '50%', paddingRight: 10 }}>
                                    <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                                        <legend className="w-auto" style={{ fontSize: 'large' }}>CapBank Status:</legend>
                                        <form>
                                            <ul style={{ listStyleType: 'none', padding: 0, width: '100%', position: 'relative', float: 'left' }}>
                                                <li><label><input type="checkbox" onChange={() => {
                                                     this.setFilter({ CBStatAll: !this.props.CBStatAll});
                                                }} checked={this.props.CBStatAll} /> All </label></li>

                                                <li><label><input type="checkbox" onChange={() => {
                                                    let obj = {CBStat0: !this.props.CBStat0}
                                                    if (this.props.CBStatAll && this.props.CBStat0)
                                                        obj["CBStatAll"] = false;
                                                    this.setFilter(obj);
                                                }} checked={this.props.CBStat0 || this.props.CBStatAll} /> Normal </label></li>
                                                <li><label><input type="checkbox" onChange={() => {
                                                    let obj = { CBStat2: !this.props.CBStat2 }
                                                    if (this.props.CBStatAll && this.props.CBStat2)
                                                        obj["CBStatAll"] = false;
                                                    this.setFilter(obj);
                                                }} checked={this.props.CBStat2 || this.props.CBStatAll} /> Shorted/Blown Fluse </label></li>
                                                <li><label><input type="checkbox" onChange={() => {
                                                    let obj = { CBStat3: !this.props.CBStat3 }
                                                    if (this.props.CBStatAll && this.props.CBStat3)
                                                        obj["CBStatAll"] = false;
                                                    this.setFilter(obj);
                                                }} checked={this.props.CBStat3 || this.props.CBStatAll} /> Failed to Open </label></li>
                                                <li><label><input type="checkbox" onChange={() => {
                                                    let obj = { CBStat4: !this.props.CBStat4 }
                                                    if (this.props.CBStatAll && this.props.CBStat4)
                                                        obj["CBStatAll"] = false;
                                                    this.setFilter(obj);
                                                }} checked={this.props.CBStat4 || this.props.CBStatAll} /> Restrike; Opened </label>
                                                </li>
                                                <li><label><input type="checkbox" onChange={() => {
                                                    let obj = { CBStat5: !this.props.CBStat5 }
                                                    if (this.props.CBStatAll && this.props.CBStat5)
                                                        obj["CBStatAll"] = false;
                                                    this.setFilter(obj);
                                                }} checked={this.props.CBStat5 || this.props.CBStatAll} /> Restrike; Failed to Open </label>
                                                </li>
                                                <li><label><input type="checkbox" onChange={() => {
                                                    let obj = { CBStat6: !this.props.CBStat6 }
                                                    if (this.props.CBStatAll && this.props.CBStat6)
                                                        obj["CBStatAll"] = false;
                                                    this.setFilter(obj);
                                                }} checked={this.props.CBStat6 || this.props.CBStatAll} /> System Sag/Swell</label>
                                                </li>
                                                <li><label><input type="checkbox" onChange={() => {
                                                    let obj = { CBStat7: !this.props.CBStat7 }
                                                    if (this.props.CBStatAll && this.props.CBStat7)
                                                        obj["CBStatAll"] = false;
                                                    this.setFilter(obj);
                                                }} checked={this.props.CBStat7 || this.props.CBStatAll} /> No Switching Op. </label>
                                                </li>
                                                <li><label><input type="checkbox" onChange={() => {
                                                    let obj = { CBStat8: !this.props.CBStat8 }
                                                    if (this.props.CBStatAll && this.props.CBStat8)
                                                        obj["CBStatAll"] = false;
                                                    this.setFilter(obj);
                                                }} checked={this.props.CBStat8 || this.props.CBStatAll} /> Abnormal Pre-InsertionsSwitch </label>
                                                </li>

                                                <li><label><input type="checkbox" onChange={() => {
                                                    let obj = { CBStat10: !this.props.CBStat10 }
                                                    if (this.props.CBStatAll && this.props.CBStat10)
                                                        obj["CBStatAll"] = false;
                                                    this.setFilter(obj);
                                                }} checked={this.props.CBStat10 || this.props.CBStatAll} /> Failed to Close </label>
                                                </li>
                                                <li><label><input type="checkbox" onChange={() => {
                                                    let obj = { CBStat11: !this.props.CBStat11 }
                                                    if (this.props.CBStatAll && this.props.CBStat11)
                                                        obj["CBStatAll"] = false;
                                                    this.setFilter(obj);
                                                }} checked={this.props.CBStat11 || this.props.CBStatAll} /> Missing Pole </label>
                                                </li>
                                                <li><label><input type="checkbox" onChange={() => {
                                                    let obj = { CBStat12: !this.props.CBStat12 }
                                                    if (this.props.CBStatAll && this.props.CBStat12)
                                                        obj["CBStatAll"] = false;
                                                    this.setFilter(obj);
                                                }} checked={this.props.CBStat12 || this.props.CBStatAll} /> Dur. between Poles Long </label>
                                                </li>

                                                <li><label><input type="checkbox" onChange={() => {
                                                    let obj = { CBStat20: !this.props.CBStat20 }
                                                    if (this.props.CBStatAll && this.props.CBStat20)
                                                        obj["CBStatAll"] = false;
                                                    this.setFilter(obj);
                                                }} checked={this.props.CBStat20 || this.props.CBStatAll} /> Fuseless units shorted/ Fuse dailed to Clear </label>
                                                </li>
                                                <li><label><input type="checkbox" onChange={() => {
                                                    let obj = { CBStat21: !this.props.CBStat21 }
                                                    if (this.props.CBStatAll && this.props.CBStat21)
                                                        obj["CBStatAll"] = false;
                                                    this.setFilter(obj);
                                                }} checked={this.props.CBStat21 || this.props.CBStatAll} /> Blown Fuse Detected </label>
                                                </li>
                                                <li><label><input type="checkbox" onChange={() => {
                                                    let obj = { CBStat22: !this.props.CBStat22 }
                                                    if (this.props.CBStatAll && this.props.CBStat22)
                                                        obj["CBStatAll"] = false;
                                                    this.setFilter(obj);
                                                }} checked={this.props.CBStat22 || this.props.CBStatAll} /> Other </label>
                                                </li>

                                            </ul>
                                        </form>
                                    </fieldset>
                                </div>
                        </div>
                    </div>
                </div>

            </div>
            </>
        );
    }
}
