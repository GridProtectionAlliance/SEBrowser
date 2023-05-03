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
import { SelectWidgetCategories } from '../../SettingsSlice';
import { TabSelector } from '@gpa-gemstone/react-interactive';


interface IProps {
    EventID: number,
    InitialTab?: string,
    Height: number
}

export default function EventPreviewPane(props: IProps) {
    const dispatch = useAppDispatch();

    const categories = useAppSelector(SelectWidgetCategories);
    const [settings, setSettings] = React.useState<SEBrowser.EventPreviewPaneSetting[]>([]);
    const [tab, setTab] = React.useState<string>(props.InitialTab == null || props.InitialTab == undefined ? 'All' : props.InitialTab);
    const [widgets, setWidgets] = React.useState<SEBrowser.IWidgetView[]>([]);
    const event: any = useAppSelector((state: Redux.StoreState) => SelectEventSearchByID(state,props.EventID));
    React.useEffect(() => {
        GetSettings();
    }, []);

    React.useEffect(() => {
        loadWidgetCategories();
        console.log(tab);
        console.log(widgets);
    }, [tab])
    
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

    function loadWidgetCategories() {
        return $.ajax({
            type: "GET",
            url: `${homePath}api/openXDA/Widget/${tab}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        }).done((d) => { setWidgets(d) });
    }


        if (event == undefined || settings.length == 0) return <div></div>;

        return (
            <>
                <TabSelector CurrentTab={tab} SetTab={setTab} Tabs={categories.map(t => {
                    return { Id: t.ID.toString(), Label: t.Name }
                }) } />
                <div style={{ height: props.Height - 37.5, maxHeight: props.Height - 37.5, overflowY: 'scroll', overflowX: 'hidden' }}>
                    {widgets.filter(widget => widget.Enabled).map((widget, index) => {
                        if (widget.Name === 'EventSearchOpenSEE')
                            return <EventSearchOpenSEE key={index} eventID={props.EventID} />;
                        else if (widget.Name === 'pqi')
                            return <EventSearchPQI key={index} eventID={props.EventID} />;
                        else if (widget.Name === 'EventSearchFaultSegments')
                            return <EventSearchFaultSegments key={index} eventID={props.EventID} />;
                        else if (widget.Name === 'EventSearchAssetVoltageDisturbances')
                            return <EventSearchAssetVoltageDisturbances key={index} eventID={props.EventID} />;
                        else if (widget.Name === 'EventSearchCorrelatedSags')
                            return <EventSearchCorrelatedSags key={index} eventID={props.EventID} />;
                        else if (widget.Name === 'TVAESRIMap')
                            return <TVAESRIMap key={index} eventID={props.EventID} />;
                        else if (widget.Name === 'TVAFaultInfo')
                            return <TVAFaultInfo key={index} eventID={props.EventID} />;
                        else if (widget.Name === 'LineParameters')
                            return <LineParameters key={index} eventID={props.EventID} />;
                        else if (widget.Name === 'TVALightning')
                            return <TVALightningChart key={index} eventID={props.EventID} />;
                        else if (widget.Name === 'TVASIDA')
                            return <TVASIDA key={index} eventID={props.EventID} />;
                        else if (widget.Name === 'TVASOE')
                            return <TVASOE key={index} eventID={props.EventID} />;
                        else if (widget.Name === 'TVALSC')
                            return <TVALSC key={index} eventID={props.EventID} />;
                        else if (widget.Name === 'TVAPQWeb')
                            return <TVAPQWeb key={index} eventID={props.EventID} startTime={event.FileStartTime} />;

                        else if (widget.Name === 'TVAStructureInfo')
                            return <StructureInfo key={index} eventID={props.EventID} />;

                        else if (widget.Name === 'EventSearchFileInfo')
                            return <EventSearchFileInfo key={index} eventID={props.EventID} />;
                        else if (widget.Name === 'EventSearchHistory')
                            return <EventSearchHistory key={index} eventID={props.EventID} />;
                        else if (widget.Name === 'EventSearchRelayPerformance')
                            return <EventSearchRelayPerformance key={index} eventID={props.EventID} />;
                        else if (widget.Name === 'EventSearchBreakerPerformance')
                            return <EventSearchBreakerPerformance key={index} eventID={props.EventID} />;
                        else if (widget.Name === 'EventSearchCapBankAnalyticOverview')
                            return <EventSearchCapBankAnalyticOverview key={index} eventID={props.EventID} />;
                        else if (widget.Name === 'EventSearchNoteWindow')
                            return <EventSearchNoteWindow key={index} eventID={props.EventID} />;
                        else if (widget.Name === 'HECCOIR')
                            return <InterruptionReport key={index} eventID={props.EventID} />;
                    })}
                </div>
        </>)
}

