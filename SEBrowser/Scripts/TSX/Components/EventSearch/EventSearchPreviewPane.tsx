//******************************************************************************************************
//  EventSearchPreviewPane.tsx - Gbtc
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
//  04/24/2019 - Billy Ernest
//       Generated original version of source code.
//  08/22/2019 - Christoph Lackner
//       Added Carde for Relay Performance and plot of TCE.
//
//******************************************************************************************************
import React from 'react';
import EventSearchNoteWindow from './EventSearchNoteWindow';
import EventSearchAssetVoltageDisturbances from './EventSearchAssetVoltageDisturbances';
import EventSearchFaultSegments from './EventSearchAssetFaultSegments';
import EventSearchHistory from './EventSearchAssetHistory';
import EventSearchCorrelatedSags from './EventSearchCorrelatedSags';
import EventSearchRelayPerformance from './EventSearchRelayPerformance';
import { OpenXDA } from 'global'
import EventSearchBreakerPerformance from './EventSearchBreakerPerformance';
import EventSearchPreviewD3Chart from './EventSearchPreviewD3Chart';
import EventSearchPreviewD3ChartAxis from './EventSearchPreviewD3ChartAxis';

export default class EventPreviewPane extends React.Component<{ eventid: number, AssetType: OpenXDA.AssetTypeName }, {}> {
    render() {
        if (this.props.eventid == -1) return <div></div>;

        return (
            <div>
                <div className="card">
                    <div className="card-header"><a href={homePath + 'Main/OpenSEE?eventid=' + this.props.eventid} target="_blank">View in OpenSEE</a></div>
                    <div className="card-body">
                        <EventSearchPreviewD3Chart EventID={this.props.eventid} MeasurementType='Voltage' DataType='Time' />
                        <EventSearchPreviewD3Chart EventID={this.props.eventid} MeasurementType='Current' DataType='Time' />
                        <EventSearchPreviewD3Chart EventID={this.props.eventid} MeasurementType='TripCoilCurrent' DataType='Time' />
                        <EventSearchPreviewD3ChartAxis EventID={this.props.eventid} />
                    </div>
                </div>
                <EventSearchFaultSegments eventId={this.props.eventid} />
                <EventSearchAssetVoltageDisturbances eventId={this.props.eventid} />
                <EventSearchCorrelatedSags eventId={this.props.eventid} />
                <EventSearchHistory eventId={this.props.eventid} />
                <EventSearchRelayPerformance EventID={this.props.eventid} IsBreaker={this.props.AssetType == 'Breaker'}/>
                <EventSearchBreakerPerformance EventID={this.props.eventid} IsBreaker={this.props.AssetType == 'Breaker'}/>
                <EventSearchNoteWindow eventId={this.props.eventid} />
            </div>
        );
    }
}

