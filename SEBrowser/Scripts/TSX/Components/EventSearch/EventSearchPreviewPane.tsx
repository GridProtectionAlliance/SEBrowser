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
import TVAESRIMap from './TVA/ESRIMap';
import EventSearchOpenSEE from './EventSearchOpenSEE';
import TVALightningChart from './TVA/Lightning';
import TVAFaultInfo from './TVA/FaultInfo';
import LineParameters from './LineParameters';
import StructureInfo from './TVA/StructureInfo';
import TVASIDA from './TVA/SIDA';
import TVASOE from './TVA/SOE';
import TVALSC from './TVA/LSC';
import TVAPQWeb from './TVA/PQWeb';
import EventSearchCapBankAnalyticOverview from './EventSearchCapBankAnalyticOverview';

export default class EventPreviewPane extends React.Component<{ EventID: number, AssetType: OpenXDA.AssetTypeName, EventType: OpenXDA.EventTypeName, StartTime: string }, { Settings: Array<SEBrowser.EventPreviewPaneSetting>, Tab: 'Waveform' | 'Fault' | 'Correlating' | 'Configuration' | 'All'}> {
    constructor(props) {
        super(props);

        this.state = {
            Settings: [],
            Tab: 'Waveform'
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

        return (
            <>
                <ul className="nav nav-tabs">
                    <li className="nav-item">
                        <a className={"nav-link" + (this.state.Tab == "Waveform" ? " active" : "")} onClick={() => this.setState({ Tab: 'Waveform' })}>Waveform Analysis</a>
                    </li>
                    <li className="nav-item">
                        <a className={"nav-link" + (this.state.Tab == "Fault" ? " active" : "")} onClick={() => this.setState({ Tab: 'Fault' })}>Fault</a>
                    </li>
                    <li className="nav-item">
                        <a className={"nav-link" + (this.state.Tab == "Correlating" ? " active" : "")} onClick={() => this.setState({ Tab: 'Correlating' })}>Correlating Events</a>
                    </li>
                    <li className="nav-item">
                        <a className={"nav-link" + (this.state.Tab == "Configuration" ? " active" : "")} onClick={() => this.setState({ Tab: 'Configuration' })}>Configuration</a>
                    </li>
                    <li className="nav-item">
                        <a className={"nav-link" + (this.state.Tab == "All" ? " active" : "")} onClick={() => this.setState({ Tab: 'All' })}>All</a>
                    </li>
                </ul>
                <div style={{ height: 'calc(100% - 72px)', maxHeight: 'calc(100% - 72px)', overflowY: 'scroll'}}>
            {this.state.Settings.filter(setting => setting.Show).map((setting, index) => {
            if (setting.Name.indexOf('EventSearchOpenSEE') >= 0 && (this.state.Tab == "Waveform" || this.state.Tab == "All"))
                return <EventSearchOpenSEE key={index} EventID={this.props.EventID} />;
            else if (setting.Name.indexOf('EventSearchFaultSegments') >= 0 && (this.state.Tab == "Waveform" || this.state.Tab == "All"))
                return <EventSearchFaultSegments key={index} EventID={this.props.EventID} />;
            else if (setting.Name.indexOf('EventSearchAssetVoltageDisturbances') >= 0 && (this.state.Tab == "Waveform" || this.state.Tab == "All"))
                return <EventSearchAssetVoltageDisturbances key={index} EventID={this.props.EventID} />;
            else if (setting.Name.indexOf('EventSearchCorrelatedSags') >= 0 && (this.state.Tab == "Correlating" || this.state.Tab == "All"))
                return <EventSearchCorrelatedSags key={index} EventID={this.props.EventID} />;
            else if (setting.Name.indexOf('TVAESRIMap') >= 0 && (this.state.Tab == "Fault" || this.state.Tab == "All"))
                return <TVAESRIMap key={index} EventID={this.props.EventID} />;
            else if (setting.Name.indexOf('TVAFaultInfo') >= 0 && this.props.AssetType == 'Line' && (this.props.EventType == 'Fault' || this.props.EventType == "RecloseIntoFault") && (this.state.Tab == "Fault" || this.state.Tab == "All"))
                return <TVAFaultInfo key={index} EventID={this.props.EventID} />;
            else if (setting.Name.indexOf('LineParameters') >= 0 && this.props.AssetType == 'Line' && (this.props.EventType == 'Fault' || this.props.EventType == "RecloseIntoFault") && (this.state.Tab == "Fault" || this.state.Tab == "All"))
                return <LineParameters key={index} EventID={this.props.EventID} />;
            else if (setting.Name.indexOf('TVALightning') >= 0 && (this.state.Tab == "Fault" || this.state.Tab == "All"))
                return <TVALightningChart key={index} EventID={this.props.EventID} />;
            else if (setting.Name.indexOf('TVASIDA') >= 0 && (this.state.Tab == "Correlating" || this.state.Tab == "All"))
                return <TVASIDA key={index} EventID={this.props.EventID} />;
            else if (setting.Name.indexOf('TVASOE') >= 0 && (this.state.Tab == "Correlating" || this.state.Tab == "All"))
                return <TVASOE key={index} EventID={this.props.EventID} />;
            else if (setting.Name.indexOf('TVALSC') >= 0 && (this.state.Tab == "Correlating" || this.state.Tab == "All"))
                return <TVALSC key={index} EventID={this.props.EventID} />;
            else if (setting.Name.indexOf('TVAPQWeb') >= 0 && (this.state.Tab == "Correlating" || this.state.Tab == "All"))
                return <TVAPQWeb key={index} EventID={this.props.EventID} StartTime={this.props.StartTime} />;

            else if (setting.Name.indexOf('TVAStructureInfo') >= 0 && (this.state.Tab == "Fault" || this.state.Tab == "All"))
                return <StructureInfo key={index} EventID={this.props.EventID} />;

            else if (setting.Name.indexOf('EventSearchFileInfo') >= 0 && (this.state.Tab == "Configuration" || this.state.Tab == "All"))
                return <EventSearchFileInfo key={index} EventID={this.props.EventID} />;
            else if (setting.Name.indexOf('EventSearchHistory') >= 0 && (this.state.Tab == "Fault" || this.state.Tab == "All"))
                return <EventSearchHistory key={index} EventID={this.props.EventID} />;
            else if (setting.Name.indexOf('EventSearchRelayPerformance') >= 0 && this.props.AssetType == 'Breaker' && ( this.state.Tab == "All"))
                return <EventSearchRelayPerformance key={index} EventID={this.props.EventID} />;
            else if (setting.Name.indexOf('EventSearchBreakerPerformance') >= 0 && this.props.AssetType == 'Breaker' && (this.state.Tab == "All"))
                return <EventSearchBreakerPerformance key={index} EventID={this.props.EventID} />;
            else if (setting.Name.indexOf('EventSearchCapBankAnalyticOverview') >= 0 && this.props.AssetType == 'CapacitorBank' && (this.state.Tab == "All"))
                return <EventSearchCapBankAnalyticOverview key={index} EventID={this.props.EventID} />;
            else if (setting.Name.indexOf('EventSearchNoteWindow') >= 0 && (this.state.Tab == "Configuration" || this.state.Tab == "All"))
                return <EventSearchNoteWindow key={index} EventID={this.props.EventID} />;
            })}
        </div>
        </>)
    }
}

