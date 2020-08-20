//******************************************************************************************************
// CapBankReportPane.tsx - Gbtc
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
//
//******************************************************************************************************
import * as React from 'react';
import { CapBankReportNavBarProps } from './CapBankReportNavBar';
import _ from 'lodash';
import TrendingCard from './TrendingCard';
//import RelayPerformanceTrend from './RelayPerformanceTrend';

interface ICapBankReportPaneState { EventData: Array<ICBEvent> }


interface ICBEvent {
    ID: number, EventID: number, Phase: string, Status: string, DataErrorID: number, Operation: string, DeltaQ: number, MVAsc: number, IsRes: boolean, Time: string
}

export default class CapBankReportPane extends React.Component<CapBankReportNavBarProps, ICapBankReportPaneState> {
   
    eventTableHandle: JQuery.jqXHR;
    constructor(props, context) {
        super(props, context);

        this.state = {
            EventData: [],
        };

        
    }


    componentDidMount() {
        if (this.props.CapBankID >= 0)
            this.getData(this.props.CapBankID);
    }

    componentWillReceiveProps(nextProps) {
        let oldProps = _.clone(this.props);

        if (!_.isEqual(nextProps, oldProps) && nextProps.CapBankID >= 0)
            this.getData(nextProps.CapBankID);
    }

    getEventTableData(capBankId: number): JQuery.jqXHR {
        if (this.eventTableHandle !== undefined)
            this.eventTableHandle.abort();

        this.eventTableHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/PQDashboard/CapBankReport/GetEventTable?capBankId=${capBankId}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: false,
            async: true
        });

        return this.eventTableHandle;
    }

    getData(capBankId: number) {
        this.getEventTableData(capBankId).then(data => {
            
            if (data == null) {
                this.setState({EventData: []})
                return;
            }
            this.setState({ EventData: data })
        });
    }

    render() {
        if (this.props.CapBankID == -1) return <div></div>;

        return (
            <div style={{ width: '100%', height: '100%', maxHeight: '100%', position: 'relative', float: 'right', overflowY: 'scroll' }}>
                <div className="card">
                    <div className="card-header">Cap Bank Analytic Events</div>
                    <div className="card-body">
                        <table className="table">
                            <thead>
                                <EventHeader/>
                            </thead>
                            <tbody>
                                {this.state.EventData.map(row => EventRow(row))}
                            </tbody>

                        </table>
                    </div>
                </div>
                <div className="card">
                    <div className="card-header">Cap Bank Analytic Events</div>
                    <div className="card-body">
                        <TrendingCard getData={this.getXpostData.bind(this)} keyString={'XPost'} allowZoom={true} height={200} Tstart={1500} Tend={1700} yLabel={'Test Label'} />
                    </div>
                </div>
            </div>)
        
    }

    getXpostData(ctrl: TrendingCard) {
        ctrl.stateSetter({
            data: [{data: [[1500,10],[1550,15],[1600,10],[1650,15],[1700,20]], color: '#ff0000', label: 'Test'}]
        });
    }
}

const EventRow = (row: ICBEvent) => {
    return (
        <tr key={row.ID}>
            <td key={'Time' + row.ID}>{moment(row.Time).format('MM/DD/YY HH:mm:ss.SSSS')}</td>
            <td key={'Phase' + row.ID}>{row.Phase}</td>
            <td key={'Operation' + row.ID}>{row.Operation}</td>
            <td key={'Status' + row.ID}>{row.Status}</td>
            <td key={'DeltaQ' + row.ID}>{row.DeltaQ.toFixed(2)} kVA</td>
            <td key={'ShortCircuit' + row.ID}>{row.MVAsc.toFixed(2)} MVA</td>
            <td key={'Resonance' + row.ID}>{(row.IsRes? 'Yes' : 'No')}</td>
            <td key={'openSee' + row.ID}></td>
        </tr>
    );
}

const EventHeader = () => {
    return (
        <tr key='Header'>
            <th key='Time'>Time</th>
            <th key='Phase'>Phase</th>
            <th key='Operation'>Cap Bank Operation</th>
            <th key='Status'>Analysis Status</th>
            <th key='DeltaQ'>Change in Q (kVAR)</th>
            <th key='ShortCircuit'>SC Q (MVA)</th>
            <th key='Resonance'>Resonance</th>
            <th key='openSee'></th>
        </tr>
    );
}

