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

export interface Substation {
    LocationID: number, AssetKey: string, AssetName: string
}

export interface CapBankReportNavBarProps {
    stateSetter(state): void,
    CapBankID: number,
    startDate: number,
    endDate: number

}

export default class CapBankReportNavBar extends React.Component<CapBankReportNavBarProps, { LineID: number, LocationID: number, showCoilSelection: boolean }>{
    seBrowserService: SEBrowserService;

    constructor(props, context) {
        super(props, context);

        this.seBrowserService = new SEBrowserService();
        this.state = {
            LocationID: -1,
            LineID: -1,
            showCoilSelection: false
        };
    }

    componentDidMount() {
        this.getSubstationData();
    }

    componentWillReceiveProps(nextProps: CapBankReportNavBarProps) {
    }

    getCapBankData(LocationID: number) {
        
        this.setState({ LocationID: LocationID });
        this.seBrowserService.GetCapBankData(LocationID).done(results => {
            $(this.refs.Breaker).children().remove();
            for (var capBank of results) {
                $(this.refs.Breaker).append(new Option(capBank.AssetKey, capBank.Id.toString()));
            };

            if ($(this.refs.Breaker).children("option:selected").val()) {
                this.setCapBank( parseInt($(this.refs.Breaker).children("option:selected").val().toString()));
            }
            
        });
       
    }

    setCapBank(capBankId: number) {
       
        var object = _.clone(this.props) as CapBankReportNavBarProps;
        object.CapBankID = capBankId;
        this.props.stateSetter({ searchBarProps: object });

        

    }

    getSubstationData() {
        this.seBrowserService.GetCapBankSubstationData().done(results => {
            $(this.refs.SubStation).children().remove();
            for (var station of results) {
                $(this.refs.SubStation).append(new Option(station.AssetName, station.LocationID.toString()));
                if ($(this.refs.SubStation).children("option:selected").val()) {
                    var selected = parseInt($(this.refs.SubStation).children("option:selected").val().toString());
                    this.setState({ LocationID: selected });
                    this.getCapBankData(selected);
                }};
        });
    }

   
    render() {

        return (
            <nav className="navbar navbar-expand-lg navbar-light bg-light">

                <div className="collapse navbar-collapse" id="navbarSupportedContent" style={{ width: '100%' }}>
                    <ul className="navbar-nav mr-auto" style={{ width: '100%' }}>
                        <li className="nav-item" style={{ width: '50%', paddingRight: 10 }}>
                            <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                                <legend className="w-auto" style={{ fontSize: 'large' }}>Substation:</legend>
                                <form>
                                    <div className="form-group" style={{ height: 30 }}>
                                        <label style={{ width: 200, position: 'relative', float: "left" }}>Substation: </label>
                                        <select ref="SubStation" style={{ width: 'calc(100% - 200px)', position: 'relative', float: "right", border: '1px solid #ced4da', borderRadius: '.25em' }} onChange={(e) => {
                                            this.getCapBankData((e.target as any).value);
                                        }} >
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ height: 30 }}>
                                        <label style={{ width: 200, position: 'relative', float: "left" }}>Cap Bank: </label>
                                        <select ref="Breaker" style={{ width: 'calc(100% - 200px)', position: 'relative', float: "right", border: '1px solid #ced4da', borderRadius: '.25em' }} onChange={(e) => {
                                            this.setCapBank(parseInt((e.target as any).value.toString()));
                                        }} >
                                        </select>
                                    </div>
                                </form>
                            </fieldset>
                        </li>
                        <li className="nav-item" style={{ width: '50%' , paddingRight: 10 }}>
                            <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                                <legend className="w-auto" style={{ fontSize: 'large' }}>Time:</legend>
                                <form>
                                    

                                </form>
                            </fieldset>
                        </li>

                    </ul>
                </div>
            </nav>
        );
    }
}
