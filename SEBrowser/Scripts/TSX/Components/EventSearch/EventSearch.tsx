//******************************************************************************************************
//  EventSearch.tsx - Gbtc
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
//  04/08/2019 - Billy Ernest
//       Generated original version of source code.
//  08/22/2019 - Christoph Lackner
//       Added Cards for Relay Performance.
//
//******************************************************************************************************

import React from 'react';
import { clone, isEqual } from 'lodash';

import createHistory from "history/createBrowserHistory"
import { History } from 'history';
import EventSearchList from './EventSearchList';
import EventSearchNavbar, { EventSearchNavbarProps } from './EventSearchNavbar';
import EventPreviewPane from './EventSearchPreviewPane';
import EventSearchListedEventsNoteWindow from './EventSearchListedEventsNoteWindow';
import { OpenXDA } from '../../global';
import queryString from 'querystring';

const momentDateTimeFormat = "MM/DD/YYYY HH:mm:ss.SSS";
const momentDateFormat = "MM/DD/YYYY";
const momentTimeFormat = "HH:mm:ss.SSS";

interface IProps { }
interface IState extends EventSearchNavbarProps {
    eventid: number,
    searchText: string,
    searchList: Array<OpenXDA.Event>
}

export default class EventSearch extends React.Component<IProps, IState>{
    history: History<any>;
    historyHandle: any;

    constructor(props, context) {
        super(props, context);

        this.history = createHistory();
        var query = queryString.parse(this.history['location'].search, "&", "=", {decodeURIComponent: queryString.unescape});

        this.state = {
            line: (query['line'] != undefined ? query['line'] == 'true' : true),
            bus: (query['bus'] != undefined ? query['bus'] == 'true' : true),
            breaker: (query['breaker'] != undefined ? query['breaker'] == 'true' : true),
            transformer: (query['transformer'] != undefined ? query['transformer'] == 'true' : true),
            capacitorBank: (query['capacitorBank'] != undefined ? query['capacitorBank'] == 'true' : true),
            dfr: (query['dfr'] != undefined ? query['dfr'] == 'true' : true),
            pqMeter: (query['pqMeter'] != undefined ? query['pqMeter'] == 'true': true),
            g200: (query['g200'] != undefined ? query['g200'] == 'true' : true),
            one00to200: (query['one00to200'] != undefined ? query['one00to200'] == 'true' : true),
            thirty5to100: (query['thirty5to100'] != undefined ? query['thirty5to100'] == 'true' : true),
            oneTo35: (query['oneTo35'] != undefined ? query['oneTo35'] == 'true' : true),
            l1: (query['l1'] != undefined ? query['l1'] == 'true': true),
            faults: (query['faults'] != undefined ? query['faults'] == 'true' : true),
            sags: (query['sags'] != undefined ? query['sags'] == 'true' : true),
            swells: (query['swells'] != undefined ? query['swells'] == 'true' : true),
            interruptions: (query['interruptions'] != undefined ? query['interruptions'] == 'true' : true),
            breakerOps: (query['breakerOps'] != undefined ? query['breakerOps'] == 'true' : true),
            transients: (query['transients'] != undefined ? query['transients'] == 'true' : true),
            relayTCE: (query['relayTCE'] != undefined ? query['realyTCE'] == 'true' : true),
            others: (query['others'] != undefined ? query['others'] == 'true' : true),
            date: (query['date'] != undefined ? query['date'] : moment().format(momentDateFormat)),
            time: (query['time'] != undefined ? query['time'] : moment().format(momentTimeFormat)),
            windowSize: (query['windowSize'] != undefined ? parseInt(query['windowSize'].toString()) : 10),
            timeWindowUnits: (query['timeWindowUnits'] != undefined ? parseInt(query['timeWindowUnits'].toString()) : 2),
            eventid: (query['eventid'] != undefined ? parseInt(query['eventid'].toString()) : -1),
            searchText: (query['searchText'] != undefined ? query['searchText'].toString() : ''),
            make: (query['make'] != undefined ? query['make'].toString() : 'All'),
            model: (query['model'] != undefined ? query['model'].toString() : 'All'),
            searchList: [],
            stateSetter: this.stateSetter.bind(this)
        };
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    componentWillReceiveProps(nextProps: IProps) {
    }

    render() {
        return (
            <div style={{ width: '100%', height: '100%' }}>
                <EventSearchNavbar {...this.state}/>
                <div style={{ width: '100%', height: 'calc( 100% - 210px)' }}>
                    <div style={{ width: '50%', height: '100%', maxHeight: '100%', position: 'relative', float: 'left', overflowY: 'hidden' }}>
                        <div style={{width: 'calc(100% - 120px)', padding: 10, float: 'left'}}>
                            <input className='form-control' type='text' placeholder='Search...' value={this.state.searchText} onChange={(evt) => this.setState({searchText: evt.target.value})}/>
                        </div>
                        <div style={{ width: 120, float: 'right', padding: 10 }}>
                            <EventSearchListedEventsNoteWindow searchList={this.state.searchList} />
                        </div>
                        <EventSearchList eventid={this.state.eventid} searchText={this.state.searchText} searchBarProps={this.state} stateSetter={this.stateSetter.bind(this)} />
                    </div>
                    <div style={{ width: '50%', height: '100%', maxHeight: 'calc(100% - 100px)', position: 'relative', float: 'right', overflowY: 'scroll' }}>{
                        this.state.searchList.length > 0 && this.state.searchList.find(x => x.EventID == this.state.eventid) != undefined ? <EventPreviewPane eventid={this.state.eventid} AssetType={this.state.searchList.find(x => x.EventID == this.state.eventid).AssetType} />: null
                    }
                    </div>

                </div>
            </div>
        );
    }

    stateSetter(obj: any): void {
        function toQueryString(state: IState) {
            var dataTypes = ["boolean", "number", "string"]
            var stateObject: any = clone(state);
            stateObject.eventid = state.eventid;
            stateObject.searchText = state.searchText;
            delete stateObject.searchList;
            $.each(Object.keys(stateObject), (index, key) => {
                if (dataTypes.indexOf(typeof (stateObject[key])) < 0)
                    delete stateObject[key];
            })
            return queryString.stringify(stateObject, "&", "=", {encodeURIComponent: queryString.escape});
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