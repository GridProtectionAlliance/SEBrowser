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

export default class EventSearchAssetVoltageDisturbances extends React.Component<{ EventID: number }, {tableRows: Array<JSX.Element> }>{
    seBrowserService: SEBrowserService;
    constructor(props, context) {
        super(props, context);

        this.seBrowserService = new SEBrowserService();

        this.state = {
            tableRows: []
        };
    }

    componentDidMount() {
        if (this.props.EventID >= 0)
            this.createTableRows(this.props.EventID);
    }
    componentWillUnmount() {
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.EventID >= 0)
            this.createTableRows(nextProps.EventID);
    }


    createTableRows(eventID: number) {
        this.seBrowserService.getEventSearchAsssetVoltageDisturbancesData(eventID).done(data => {
            var rows = data.map((d, i) => {
                const style = (d.IsWorstDisturbance === "true") ? { backgroundColor: "lightyellow" } : { backgroundColor: "transparent" }
                return <tr key={i} style={style}>
                    <td>{d.EventType}</td>
                    <td>{d.Phase}</td>
                    <td>{(d.PerUnitMagnitude * 100).toFixed(1)}</td>
                    <td>{(d.DurationSeconds * 1000).toFixed(2)}</td>
                    <td>{moment(d.StartTime).format('HH:mm:ss.SSS')}</td>
                </tr> 
            })

            this.setState({ tableRows: rows });
    
        });
    }

    render() {
        return (
            <div className="card">
                <div className="card-header">Voltage Disturbance in Waveform:</div>
                   
                <div className="card-body">
                    <table className="table">
                        <thead>
                            <tr><th>Disturbance Type</th><th>Phase</th><th>Magnitude (%)</th><th>Duration (ms)</th><th>Start Time</th></tr>
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
