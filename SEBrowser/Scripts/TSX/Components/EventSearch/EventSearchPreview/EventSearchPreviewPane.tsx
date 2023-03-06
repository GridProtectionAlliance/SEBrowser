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
import { OpenXDA, Redux, SEBrowser } from '../../../global'
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
import EventSearchPQI from './EventSearchPQI';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import EventSearchCapBankAnalyticOverview from './EventSearchCapBankAnalyticOverview';
import { SelectEventSearchByID } from './../EventSearchSlice';
import InterruptionReport from './HECCO/InterruptionReport';


interface IProps {
    EventID: number,
    InitialTab?: ('Waveform' | 'Fault' | 'Correlating' | 'Configuration' | 'All'),
    Height: number
}

export default function EventPreviewPane(props: IProps) {
    const dispatch = useAppDispatch();

    const [settings, setSettings] = React.useState<SEBrowser.EventPreviewPaneSetting[]>([]);
    const [tab, setTab] = React.useState<'Waveform' | 'Fault' | 'Correlating' | 'Configuration' | 'All'>(props.InitialTab == null ? 'Waveform' : props.InitialTab);
    const event: any = useAppSelector((state: Redux.StoreState) => SelectEventSearchByID(state,props.EventID));
    React.useEffect(() => {
        GetSettings();
    }, []);

    function GetSettings() {
        $.ajax({
            type: "GET",
            url: `${homePath}api/SEBrowser/GetEventPreviewPaneSettings`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        }).done((settings: Array<SEBrowser.EventPreviewPaneSetting>) => setSettings(settings));
    }
        if (event == undefined || settings.length == 0) return <div></div>;

        return (
            <>
                <ul className="nav nav-tabs">
                    <li className="nav-item">
                        <a className={"nav-link" + (tab == "Waveform" ? " active" : "")} onClick={() => setTab('Waveform')}>Waveform Analysis</a>
                    </li>
                    <li className="nav-item">
                        <a className={"nav-link" + (tab == "Fault" ? " active" : "")} onClick={() => setTab('Fault')}>Fault</a>
                    </li>
                    <li className="nav-item">
                        <a className={"nav-link" + (tab == "Correlating" ? " active" : "")} onClick={() =>  setTab('Correlating')}>Correlating Events</a>
                    </li>
                    <li className="nav-item">
                        <a className={"nav-link" + (tab == "Configuration" ? " active" : "")} onClick={() =>  setTab('Configuration')}>Configuration</a>
                    </li>
                    <li className="nav-item">
                        <a className={"nav-link" + (tab == "All" ? " active" : "")} onClick={() => setTab('All')}>All</a>
                    </li>
                </ul>
                <div style={{ height: 'calc(100% - 72px)', maxHeight: 'calc(100% - 72px)', overflowY: 'scroll'}}>
            {settings.filter(setting => setting.Show).map((setting, index) => {
            if (setting.Name.indexOf('EventSearchOpenSEE') >= 0 && (tab == "Waveform" || tab == "All"))
                return <EventSearchOpenSEE key={index} EventID={props.EventID} />;
            else if (setting.Name.indexOf('pqi') >= 0 && (tab == "Configuration" || tab == "All"))
                return <EventSearchPQI key={index} EventID={props.EventID} />;
            else if (setting.Name.indexOf('EventSearchFaultSegments') >= 0 && (tab == "Waveform" || tab == "All"))
                return <EventSearchFaultSegments key={index} EventID={props.EventID} />;
            else if (setting.Name.indexOf('EventSearchAssetVoltageDisturbances') >= 0 && (tab == "Waveform" || tab == "All"))
                return <EventSearchAssetVoltageDisturbances key={index} EventID={props.EventID} />;
            else if (setting.Name.indexOf('EventSearchCorrelatedSags') >= 0 && (tab == "Correlating" || tab == "All"))
                return <EventSearchCorrelatedSags key={index} EventID={props.EventID} />;
            else if (setting.Name.indexOf('TVAESRIMap') >= 0 && (tab == "Fault" || tab == "All"))
                return <TVAESRIMap key={index} EventID={props.EventID} />;
            else if (setting.Name.indexOf('TVAFaultInfo') >= 0 && event.AssetType == 'Line' && (event.EventType == 'Fault' || event.EventType == "RecloseIntoFault") && (tab == "Fault" || tab == "All"))
                return <TVAFaultInfo key={index} EventID={props.EventID} />;
            else if (setting.Name.indexOf('LineParameters') >= 0 && event.AssetType == 'Line' && (event.EventType == 'Fault' || event.EventType == "RecloseIntoFault") && (tab == "Fault" || tab == "All"))
                return <LineParameters key={index} EventID={props.EventID} />;
            else if (setting.Name.indexOf('TVALightning') >= 0 && (tab == "Fault" || tab == "All"))
                return <TVALightningChart key={index} EventID={props.EventID} />;
            else if (setting.Name.indexOf('TVASIDA') >= 0 && (tab == "Correlating" || tab == "All"))
                return <TVASIDA key={index} EventID={props.EventID} />;
            else if (setting.Name.indexOf('TVASOE') >= 0 && (tab == "Correlating" || tab == "All"))
                return <TVASOE key={index} EventID={props.EventID} />;
            else if (setting.Name.indexOf('TVALSC') >= 0 && (tab == "Correlating" || tab == "All"))
                return <TVALSC key={index} EventID={props.EventID} />;
            else if (setting.Name.indexOf('TVAPQWeb') >= 0 && (tab == "Correlating" || tab == "All"))
                return <TVAPQWeb key={index} EventID={props.EventID} StartTime={event.FileStartTime} />;

            else if (setting.Name.indexOf('TVAStructureInfo') >= 0 && (tab == "Fault" || tab == "All"))
                return <StructureInfo key={index} EventID={props.EventID} />;

            else if (setting.Name.indexOf('EventSearchFileInfo') >= 0 && (tab == "Configuration" || tab == "All"))
                return <EventSearchFileInfo key={index} EventID={props.EventID} />;
            else if (setting.Name.indexOf('EventSearchHistory') >= 0 && (tab == "Fault" || tab == "All"))
                return <EventSearchHistory key={index} EventID={props.EventID} />;
            else if (setting.Name.indexOf('EventSearchRelayPerformance') >= 0 && event.AssetType == 'Breaker' && ( tab == "All"))
                return <EventSearchRelayPerformance key={index} EventID={props.EventID} />;
            else if (setting.Name.indexOf('EventSearchBreakerPerformance') >= 0 && event.AssetType == 'Breaker' && (tab == "All"))
                return <EventSearchBreakerPerformance key={index} EventID={props.EventID} />;
            else if (setting.Name.indexOf('EventSearchCapBankAnalyticOverview') >= 0 && event.AssetType == 'CapacitorBank' && (tab == "All"))
                return <EventSearchCapBankAnalyticOverview key={index} EventID={props.EventID} />;
            else if (setting.Name.indexOf('EventSearchNoteWindow') >= 0 && (tab == "Configuration" || tab == "All"))
                    return <EventSearchNoteWindow key={index} EventID={props.EventID} />;
            else if (setting.Name.indexOf('HECCOIR') >= 0 && (tab == "Correlating" || tab == "All"))
                return <InterruptionReport key={index} EventID={props.EventID} />;
            })}
        </div>
        </>)
}

