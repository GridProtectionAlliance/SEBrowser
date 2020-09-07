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
                showRes: (query['showRes'] != undefined ? query['showRes'] == 'true' : true),
                showNonRes: (query['showNonRes'] != undefined ? query['showNonRes'] == 'true' : true),
                CBStatError: (query['CBStatError'] != undefined ? query['CBStatError'] == 'true' : false),
                CBStat0: (query['CBStat0'] != undefined ? query['CBStat0'] == 'true' : true),
                CBStat2: (query['CBStat2'] != undefined ? query['CBStat2'] == 'true' : true),
                CBStat3: (query['CBStat3'] != undefined ? query['CBStat3'] == 'true' : true),
                CBStat4: (query['CBStat4'] != undefined ? query['CBStat4'] == 'true' : true),
                CBStat5: (query['CBStat5'] != undefined ? query['CBStat5'] == 'true' : true),
                CBStat6: (query['CBStat6'] != undefined ? query['CBStat6'] == 'true' : true),
                CBStat7: (query['CBStat7'] != undefined ? query['CBStat7'] == 'true' : true),
                CBStat8: (query['CBStat8'] != undefined ? query['CBStat8'] == 'true' : true),
                CBStat10: (query['CBStat10'] != undefined ? query['CBStat10'] == 'true' : true),
                CBStat11: (query['CBStat11'] != undefined ? query['CBStat11'] == 'true' : true),
                CBStat12: (query['CBStat12'] != undefined ? query['CBStat12'] == 'true' : true),
                CBStat20: (query['CBStat20'] != undefined ? query['CBStat20'] == 'true' : true),
                CBStat21: (query['CBStat21'] != undefined ? query['CBStat21'] == 'true' : true),
                CBStat22: (query['CBStat22'] != undefined ? query['CBStat22'] == 'true' : true),
                CBStatAll: (query['CBStatAll'] != undefined ? query['CBStatAll'] == 'true' : true),
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


