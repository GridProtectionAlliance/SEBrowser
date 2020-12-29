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
    ResFilt: Array<number>,
    StatFilt: Array<number>,
    OpFilt: Array<number>,
    RestFilt: Array<number>,
    PISFilt: Array<number>,
    HealthFilt: Array<number>,
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
    AssetName: string,
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
            subStations: [],
        };
    }

    componentDidMount() {
        this.getSubstationData();

        if (this.props.StationId > -1)
            this.getCapBankData(this.props.StationId);

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
      
        if (this.state.capBanks.length == 0)
            this.getCapBankData(nextProps.StationId);
    }

    getCapBankData(LocationID: number) {
        
        this.seBrowserService.GetCapBankData(LocationID).done(results => {
            this.setState({ capBanks: results })
            if (results.length > 0)
                this.setCapBank(results[0].Id)
            this.setBankNumber(-1);
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
            if (results == null)
                return
            this.setState({ subStations: results })

            if (this.props.StationId == -1 && results.length > 0)
                this.setStation(results[0].LocationID)
           
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

        bankOptions.push(<option key={-2} value={-2}> {'Unknown'} </option>);

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
                                                {this.state.capBanks.map(item => <option key={item.Id} value={item.Id} > {item.AssetName} </option>)}
                                        </select>
                                    </div>
                                    <label style={{ width: '100%', position: 'relative', float: "left" }}>Bank: </label>
                                    <div className="form-group" style={{ height: 30 }}>
                                            <select ref="CapBankId" style={{ height: 35, width: 'calc(98%)', position: 'relative', float: "left", border: '1px solid #ced4da', borderRadius: '.25em' }} onChange={(e) => {
                                                this.setBankNumber(parseInt((e.target as any).value.toString()));
                                            }} value={this.props.selectedBank}>
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
                                    <CBEventFilter activeFilter={this.props.ResFilt} showAll={false} Label={'Resonance'} setter={(result) => {
                                        var object = _.clone(this.props) as CapBankReportNavBarProps;
                                        object.ResFilt = result;
                                        this.props.stateSetter({ searchBarProps: object });
                                    }}
                                        filters={[
                                            { Label: 'Resonance', Values: [1] },
                                            { Label: 'No Resonance', Values: [0] }
                                        ]} />                                   

                                    <CBEventFilter activeFilter={this.props.OpFilt} showAll={true} Label={'Operation'} setter={(result) => {
                                        var object = _.clone(this.props) as CapBankReportNavBarProps;
                                        object.OpFilt = result;
                                        this.props.stateSetter({ searchBarProps: object });
                                    }}
                                        filters={[
                                            { Label: 'Sag/Swell', Values: [-200] },
                                            { Label: 'No Switching', Values: [-103, -102, -101] },
                                            { Label: 'Not Determined', Values: [-1] },
                                            { Label: 'Opening', Values: [101, 102] },
                                            { Label: 'Closing', Values: [201, 202] }
                                        ]} />

                                    <CBEventFilter activeFilter={this.props.RestFilt} showAll={true} Label={'Restrike'} setter={(result) => {
                                        var object = _.clone(this.props) as CapBankReportNavBarProps;
                                        object.RestFilt = result;
                                        this.props.stateSetter({ searchBarProps: object });
                                    }}
                                        filters={[
                                            { Label: 'No Restrike', Values: [0,20] },
                                            { Label: 'Possible Restrike', Values: [10] },
                                            { Label: 'Restrike', Values: [32, 42] },
                                            { Label: 'Reignition', Values: [31, 41] },
                                            { Label: 'Reversed Polarity', Values: [41, 42] }
                                        ]} />
                                </div>
                                <div style={{ width: '50%', paddingRight: 10 }}>
                                    <CBEventFilter activeFilter={this.props.StatFilt} showAll={true} Label={'Status'} setter={(result) => {
                                        var object = _.clone(this.props) as CapBankReportNavBarProps;
                                        object.StatFilt = result;
                                        this.props.stateSetter({ searchBarProps: object });
                                    }}
                                        filters={[
                                            { Label: 'Error', Values: [-1] },
                                            { Label: 'Normal', Values: [0] },
                                            { Label: '>2 cyc Between Poles', Values: [12] },
                                            { Label: 'Abnormal Health', Values: [2] },
                                            { Label: 'Failed Opening', Values: [3,4] },
                                            { Label: 'Failed Closing', Values: [10, 5] },
                                            { Label: 'Restrike/ Reignition', Values: [4,5] },
                                            { Label: 'Abnormal PreInsertion Switching', Values: [8] },
                                            { Label: 'Missing Pole', Values: [11] },
                                            { Label: 'Shorted Units', Values: [20] },
                                            { Label: 'Blown Fuse', Values: [21] },
                                            { Label: 'Other', Values: [6,22,7] }
                                        ]} />
                                    <CBEventFilter activeFilter={this.props.PISFilt} showAll={true} Label={'Switching Health'} setter={(result) => {
                                        var object = _.clone(this.props) as CapBankReportNavBarProps;
                                        object.PISFilt = result;
                                        this.props.stateSetter({ searchBarProps: object });
                                    }}
                                        filters={[
                                            { Label: 'Normal', Values: [0] },
                                            { Label: 'Transient', Values: [1] },
                                            { Label: 'Too Short', Values: [2] },
                                            { Label: 'Unknown', Values: [3] },
                                        ]} />
                                    <CBEventFilter activeFilter={this.props.HealthFilt} showAll={true} Label={'CapBank Health'} setter={(result) => {
                                        var object = _.clone(this.props) as CapBankReportNavBarProps;
                                        object.HealthFilt = result;
                                        this.props.stateSetter({ searchBarProps: object });
                                    }}
                                        filters={[
                                            { Label: 'Normal', Values: [0] },
                                            { Label: 'Shorted Units', Values: [1] },
                                            { Label: 'Blown Fuses', Values: [2] },
                                            { Label: 'Tap Voltages Missing', Values: [3] },
                                        ]} />
                                </div>
                        </div>
                    </div>
                </div>

            </div>
            </>
        );
    }
}

interface IFilter {
    Label: string,
    Values: Array<number>    
}

const CBEventFilter = (props: { filters: Array<IFilter>, Label: string, showAll: boolean, setter: (filter: Array<number>) => void, activeFilter: Array<number> }) => {

    const allSelected: boolean = props.activeFilter.includes(999);
    const isSelected: Array<boolean> = props.filters.map(item => mapState(item));

    function FilterChanged(index: number) {

        let updatedStat = isSelected.map((item, i) => (i === index ? !item : item));

        if (index !== -1 && allSelected)
           updatedStat = isSelected.map((item, i) => (i === index ? false : true));

        let result = [];
        updatedStat.forEach((item, i) => {
            if (item)
                result = result.concat(props.filters[i].Values)
        })

        if (index === -1 && !allSelected)
            result.push(999);
        
        props.setter(result)
    }

    function mapState(filter: IFilter) {
        let state: boolean = true;

        filter.Values.forEach(item => {
            if (!props.activeFilter.includes(item))
                state = false;
        })

        return state;
    }

    return (
        <div>
            <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                <legend className="w-auto" style={{ fontSize: 'large' }}>{props.Label}:</legend>
                <form>
                    <ul style={{ listStyleType: 'none', padding: 0, width: '100%', position: 'relative', float: 'left' }}>
                        {props.showAll ?
                            <li><label><input type="checkbox" onChange={() => { FilterChanged(-1) }} checked={allSelected} /> All </label></li>
                            : null}
                        {props.filters.map((filt, index) =>
                            <li key={index}><label><input type="checkbox" onChange={() => FilterChanged(index)} checked={isSelected[index] || (allSelected && props.showAll)} /> {filt.Label} </label></li>
                        )}
                    </ul>
                </form>
            </fieldset>
        </div>
        );
}