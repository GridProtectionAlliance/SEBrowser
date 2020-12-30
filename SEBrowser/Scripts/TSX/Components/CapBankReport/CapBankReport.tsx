//******************************************************************************************************
//  CapBankReport.tsx - Gbtc
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
//******************************************************************************************************

import * as React from 'react';
import { clone, isEqual } from 'lodash';

import createHistory from "history/createBrowserHistory"
import { History } from 'history';
import CapBankReportNavBar, { CapBankReportNavBarProps } from './CapBankReportNavBar';
import CapBankReportPane from './CapBankReportPane';
import * as queryString from 'querystring';

const momentDateFormat = "MM/DD/YYYY";
const momentTimeFormat = "HH:mm:ss.SSS";

interface IProps { }
interface IState {
    searchBarProps: CapBankReportNavBarProps,
}


export default class CapBankReport extends React.Component<IProps, IState>{
    history: History<any>;
    historyHandle: any;


    constructor(props, context) {
        super(props, context);

        this.history = createHistory();
        var query = queryString.parse(this.history['location'].search);

        this.state = {
            searchBarProps: {
                stateSetter: this.stateSetter.bind(this),
                CapBankID: (query['capBankId'] != undefined ? parseInt(query['capBankId'] as string) : -1),
                date: (query['date'] != undefined ? query['date'] : moment().format(momentDateFormat)),
                time: (query['time'] != undefined ? query['time'] : moment().format(momentTimeFormat)),
                windowSize: (query['windowSize'] != undefined ? parseInt(query['windowSize'].toString()) : 10),
                timeWindowUnits: (query['timeWindowUnits'] != undefined ? parseInt(query['timeWindowUnits'].toString()) : 2),          
                selectedBank: (query['selectedBank'] != undefined ? parseInt(query['selectedBank'].toString()) : -1),
                StationId: (query['StationId'] != undefined ? parseInt(query['StationId'] as string) : -1),
                numBanks: 0,
                ResFilt: [0,1],
                StatFilt: [999],
                OpFilt: [999],
                RestFilt: [999],
                PISFilt: [999],
                HealthFilt: [999]
            },
        };
    }
    
    render() {
        return (
            <div style={{ width: '100%', height: '100%' }}>
                <CapBankReportNavBar {...this.state.searchBarProps}/>
                <div style={{ width: '100%', height: 'calc( 100% - 250px)' }}>
                    <CapBankReportPane {...this.state.searchBarProps}/>
                </div>
            </div>
        );
    }

    
    stateSetter(obj) {
        function toQueryString(state: IState) {
            var dataTypes = ["boolean", "number", "string"]
            var stateObject: IState = clone(state);
            $.each(Object.keys(stateObject.searchBarProps), (index, key) => {
                if (dataTypes.indexOf(typeof (stateObject.searchBarProps[key])) < 0)
                    delete stateObject.searchBarProps[key];
            })
            return queryString.stringify(stateObject.searchBarProps as any);
        }

        var oldQueryString = toQueryString(this.state);

        this.setState(obj, () => {
            var newQueryString = toQueryString(this.state);

            if (!isEqual(oldQueryString, newQueryString)) {
                clearTimeout(this.historyHandle);
                this.historyHandle = setTimeout(() => this.history['push'](this.history['location'].pathname + '?' + newQueryString), 500);
            }
        });
    }


}


