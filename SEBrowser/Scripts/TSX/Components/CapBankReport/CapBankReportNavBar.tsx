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
    LocationID: number, AssetKey: string, AssetName: string
}

export interface CapBankReportNavBarProps {
    stateSetter(state): void,
    CapBankID: number,
    date: string,
    time: string,
    windowSize: number,
    timeWindowUnits: number,
    selectedBank: number,
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
    subStations: Array<Substation>

}

export default class CapBankReportNavBar extends React.Component<CapBankReportNavBarProps, Istate>{
    seBrowserService: SEBrowserService;

    constructor(props, context) {
        super(props, context);
        this.seBrowserService = new SEBrowserService();
        this.state = {
            capBanks: [],
            subStations: [],
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


    getSubstationData() {
        this.seBrowserService.GetCapBankSubstationData().done(results => {
            $(this.refs.SubStation).children().remove();
            for (var station of results) {
                $(this.refs.SubStation).append(new Option(station.AssetName, station.LocationID.toString()));
                if ($(this.refs.SubStation).children("option:selected").val()) {
                    var selected = parseInt($(this.refs.SubStation).children("option:selected").val().toString());
                    this.getCapBankData(selected);
                }};
        });
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
            <nav className="navbar navbar-expand-lg navbar-light bg-light">

                <div className="collapse navbar-collapse" id="navbarSupportedContent" style={{ width: '100%' }}>
                    <ul className="navbar-nav mr-auto" style={{ width: '100%' }}>
                        <li className="nav-item" style={{ width: '50%', paddingRight: 10 }}>
                            <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                                <legend className="w-auto" style={{ fontSize: 'large' }}>Capacitor Bank:</legend>
                                <form>
                                    <label style={{ width: '100%', position: 'relative', float: "left"  }}>Substation: </label>
                                    <div className="form-group" style={{ height: 30 }}>
                                        <select ref="SubStation" style={{ height: 35, width: 'calc(98%)', position: 'relative', float: "left", border: '1px solid #ced4da', borderRadius: '.25em' }} onChange={(e) => {
                                            this.getCapBankData((e.target as any).value);
                                        }} >
                                        </select>
                                    </div>
                                    <label style={{ width: '100%', position: 'relative', float: "left" }}>Cap Bank Group: </label>
                                    <div className="form-group" style={{ height: 30 }}>
                                        <select ref="Breaker" style={{ height: 35, width: 'calc(98%)', position: 'relative', float: "left", border: '1px solid #ced4da', borderRadius: '.25em' }} onChange={(e) => {
                                            this.setCapBank(parseInt((e.target as any).value.toString()));
                                        }} >
                                            {this.state.capBanks.map(item => <option key={item.Id} value={item.Id}> {item.AssetKey} </option>)}
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
                        <li className="nav-item" style={{ width: '50%', paddingRight: 10 }}>
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

                    </ul>
                </div>
            </nav>
        );
    }
}
