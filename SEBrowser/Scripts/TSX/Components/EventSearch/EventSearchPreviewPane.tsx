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
import { OpenXDA, SEBrowser } from 'global'
import EventSearchBreakerPerformance from './EventSearchBreakerPerformance';
import EventSearchFileInfo from './EventSearchFileInfo';
import TVAESRIMap from './TVAESRIMap/TVAESRIMap';
import EventSearchOpenSEE from './EventSearchOpenSEE';
import TVALightningChart from './TVALightning/TVALightning';

export default class EventPreviewPane extends React.Component<{ EventID: number, AssetType: OpenXDA.AssetTypeName }, { Settings: Array<SEBrowser.EventPreviewPaneSetting>}> {
    constructor(props) {
        super(props);

        this.state = {
            Settings: []
        }
    }

    componentDidMount() {
        this.GetSettings();
    }

    GetSettings() {
        $.ajax({
            type: "GET",
            url: `${homePath}api/SEBrowser/GetEventPreviewPaneSettings`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        }).done((settings: Array<SEBrowser.EventPreviewPaneSetting>) => this.setState({ Settings: settings }));
    }
    
    render() {
        if (this.props.EventID == -1 || this.state.Settings.length == 0) return <div></div>;

        return this.state.Settings.filter(setting => setting.Show).map((setting, index) => {
            if (setting.Name.indexOf('EventSearchOpenSEE') >= 0)
                return <EventSearchOpenSEE key={index} EventID={this.props.EventID} />;
            else if (setting.Name.indexOf('EventSearchFaultSegments') >= 0)
                return <EventSearchFaultSegments key={index} EventID={this.props.EventID} />;
            else if (setting.Name.indexOf('EventSearchAssetVoltageDisturbances') >= 0)
                return <EventSearchAssetVoltageDisturbances key={index} EventID={this.props.EventID} />;
            else if (setting.Name.indexOf('EventSearchCorrelatedSags') >= 0)
                return <EventSearchCorrelatedSags key={index} EventID={this.props.EventID} />;
            else if (setting.Name.indexOf('TVAESRIMap') >= 0)
                return <TVAESRIMap key={index} EventID={this.props.EventID} />;
            else if (setting.Name.indexOf('TVALightning') >= 0)
                return <TVALightningChart key={index} EventID={this.props.EventID} />;
            else if (setting.Name.indexOf('EventSearchFileInfo') >= 0)
                return <EventSearchFileInfo key={index} EventID={this.props.EventID} />;
            else if (setting.Name.indexOf('EventSearchHistory') >= 0)
                return <EventSearchHistory key={index} EventID={this.props.EventID} />;
            else if (setting.Name.indexOf('EventSearchRelayPerformance') >= 0 && this.props.AssetType == 'Breaker')
                return <EventSearchRelayPerformance key={index} EventID={this.props.EventID} />;
            else if (setting.Name.indexOf('EventSearchBreakerPerformance') >= 0 && this.props.AssetType == 'Breaker')
                return <EventSearchBreakerPerformance key={index} EventID={this.props.EventID}/>;
            else if (setting.Name.indexOf('EventSearchNoteWindow') >= 0)
                return <EventSearchNoteWindow key={index} EventID={this.props.EventID} />;
        });
    }
}

