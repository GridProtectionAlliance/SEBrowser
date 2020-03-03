//******************************************************************************************************
//  EventSearchAssetVoltageDisturbances.tsx - Gbtc
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
//  04/25/2019 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import React from 'react';
import SEBrowserService from './../../../TS/Services/SEBrowser';

export default class EventSearchHistory extends React.Component<{ EventID: number }, {tableRows: Array<JSX.Element>, count: number }>{
    seBrowserService: SEBrowserService;
    constructor(props, context) {
        super(props, context);

        this.seBrowserService = new SEBrowserService();

        this.state = {
            tableRows: [],
            count: 10
        };
    }

    componentDidMount() {
        if (this.props.EventID >= 0)
            this.createTableRows(this.props.EventID, this.state.count);
    }
    componentWillUnmount() {
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.eventId >= 0)
            this.createTableRows(nextProps.eventId, this.state.count);
    }


    createTableRows(eventID: number, count: number) {
        this.seBrowserService.getEventSearchAsssetHistoryData(eventID, count).done(data => {
            var rows = data.map((d,i) =>
                <tr key={i}>
                    <td>{d.EventType}</td>
                    <td>{moment(d.StartTime).format('MM/DD/YYYY HH:mm:ss.SSS')}</td>
                    <td><a href={homePath + 'Main/OpenSEE?eventid=' + d.ID} target="_blank">View in OpenSEE</a></td>
                </tr>)

            this.setState({ tableRows: rows});
        });
    }

    render() {
        return (
            <div className="card">
                <div className="card-header">Asset History:
                    <select className='pull-right' value={this.state.count} onChange={(evt) => this.setState({ count: parseInt(evt.target.value) }, () => this.createTableRows(this.props.EventID, this.state.count) )}>
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="75">75</option>
                        <option value="100">100</option>

                    </select>
                </div>
                <div className="card-body">
                    <table className="table">
                        <thead>
                            <tr><th>Event Type</th><th>Date</th><th></th></tr>
                        </thead>
                        <tbody>
                            {this.state.tableRows}
                        </tbody>

                    </table>

                </div>
            </div>
        );
    }
}
