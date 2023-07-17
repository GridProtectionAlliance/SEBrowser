//******************************************************************************************************
//  TrendData.tsx - Gbtc
//
//  Copyright © 2023, Grid Protection Alliance.  All Rights Reserved.
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
//  03/30/23 - Gabriel Santos
//       Generated original version of source code.
//
//******************************************************************************************************

import React from 'react';
import TrendSearchNavbar from './TrendDataNavbar';
import { TrendPlot, ITrendPlot } from './TrendPlot/TrendPlot';
import { OverlayDrawer } from '@gpa-gemstone/react-interactive';
import AllSettingsModal from './AllSettingsModal';

const TrendData = () => {
    const closureHandler = React.useRef<((o: boolean) => void)>(() => { });
    const [showNav, setShowNav] = React.useState<boolean>(getShowNav());
    const [navHeight, setNavHeight] = React.useState<number>(0);
    const [plotList, setPlotList] = React.useState<ITrendPlot[]>([]);
    const [showSettings, setShowSettings] = React.useState<boolean>(false);
    const overlayPortalID = "TrendDataChartPortal";
    const overlayDrawer = "TrendDataNavbar";

    function getShowNav(): boolean {
        if (localStorage.hasOwnProperty('SEbrowser.TrendData.ShowNav'))
            return JSON.parse(localStorage.getItem('SEbrowser.TrendData.ShowNav'));
        else
            return true;
    }

    const removePlot = React.useCallback(((ID: string) => {
        const index = plotList.findIndex(item => item.ID === ID);
        const newList = [...plotList];
        newList.splice(index, 1);
        setPlotList(newList);
    }), [plotList]);

    const setPlot = React.useCallback(((ID: string, record: ITrendPlot, field: keyof (ITrendPlot)) => {
        const index = plotList.findIndex(item => item.ID === ID);
        const newList: any[] = [...plotList];
        newList[index][field] = record[field] as any;
        setPlotList(newList);
    }), [plotList]);

    const setAllPlot = React.useCallback(((record: ITrendPlot, field: keyof (ITrendPlot)) => {
        const newList: any[] = [...plotList];
        newList.forEach((item: ITrendPlot, index: number) => {
            newList[index][field] = record[field];
        });
        setPlotList(newList);
    }), [plotList]);

    const concatNewContainers = React.useCallback(((newContainers: ITrendPlot[]) => {
        for (const container of newContainers) {
            if (container.Channels.length === 0) continue;
            let title = container.Channels.some(channel => channel.MeterID !== container.Channels[0].MeterID) ?
                "Multi-Meter " : (container.Channels[0].MeterShortName ?? container.Channels[0].MeterName);
            title += container.Channels.some(channel => channel.AssetID !== container.Channels[0].AssetID) ?
                "" : ` - ${container.Channels[0].AssetName}`
            title += container.Channels.some(channel => channel.ChannelGroup !== container.Channels[0].ChannelGroup) ?
                "" : ` - ${container.Channels[0].ChannelGroup}`
            container.Title = title;
        }
        setPlotList(plotList.concat(newContainers));
    }), [plotList, setPlotList]);

    const closeSettings = React.useCallback((
        (open: boolean) => closureHandler.current(open)
    ), [closureHandler.current]);

    const toggleNavbar = React.useCallback((
        () => setShowNav(!showNav)
    ), [showNav]);

    return (
        <div style={{ width: '100%', height: '100%' }} data-drawer={overlayDrawer}>
            <TrendSearchNavbar
                ToggleVis={toggleNavbar}
                ShowNav={showNav}
                SetHeight={setNavHeight}
                DisableAllSettings={plotList.length === 0} //TODO: Does this count as a function? Should this be a const with callback?
                SetShowAllSettings={setShowSettings}
                AddNewCharts={concatNewContainers}
            />
            <div style={{ width: '100%', height: (showNav ? 'calc(100% - ' + navHeight + 'px)' : 'calc( 100% - 52px)'), overflowY: 'scroll' }}>
                {plotList.map(element => <TrendPlot key={element.ID}
                    Plot={element} SetPlot={setPlot} RemovePlot={removePlot}
                    OverlayPortalID={overlayPortalID} HandleOverlay={closeSettings}
                />)}
            </div>
            <OverlayDrawer Title={''} Open={false} Location={'top'} Target={overlayDrawer} GetOverride={(s) => { closureHandler.current = s; }} HideHandle={true}>
                <div id={overlayPortalID} style={{opacity: 1, background: undefined, color: 'black' }} />
            </OverlayDrawer>
            <AllSettingsModal Show={showSettings} SetShow={setShowSettings} ApplyFieldToAll={setAllPlot} />
        </div>
    );
}

export default TrendData;
