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
import SEBrowserService from './../../../../TS/Services/SEBrowser';
import moment from 'moment';

export default class EventSearchFaultSegments extends React.Component<{ EventID: number }, {tableRows: Array<JSX.Element>, count: number }>{
    seBrowserService: SEBrowserService;
    handle: JQuery.jqXHR;
    constructor(props, context) {
        super(props, context);

        this.seBrowserService = new SEBrowserService();

        this.state = {
            tableRows: [],
            count: 0
        };

        this.handle = null;
    }

    componentDidMount() {
        if (this.props.EventID >= 0)
            this.createTableRows(this.props.EventID);
    }
    componentWillUnmount() {
        if (this.handle.abort != undefined) this.handle.abort();
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.EventID >= 0)
            this.createTableRows(nextProps.EventID);
    }


    createTableRows(eventID: number) {
        this.handle = this.seBrowserService.getEventSearchAsssetFaultSegmentsData(eventID).done(data => {
            var rows = data.map((d,i) =>
                <tr key={i}>
                    <td>{d.SegmentType}</td>
                    <td>{moment(d.StartTime).format('HH:mm:ss.SSS')}</td>
                    <td>{moment(d.EndTime).format('HH:mm:ss.SSS')}</td>
                    <td>{(moment(d.EndTime).diff(moment(d.StartTime))/16.66667).toFixed(1)}</td>
                </tr>)

            this.setState({ tableRows: rows , count: rows.length});
        });
    }

    render() {
        return (
            <div className="card" style={{display: (this.state.count > 0 ? 'block': 'none')}}>
                <div className="card-header">Fault Evolution Summary:</div>

                <div className="card-body">
                    <table className="table">
                        <thead>
                            <tr><th>Evolution</th><th>Inception</th><th>End</th><th>Duration (c)</th></tr>
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
