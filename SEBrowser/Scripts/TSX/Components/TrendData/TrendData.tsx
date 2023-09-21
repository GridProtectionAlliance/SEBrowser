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
import moment from 'moment';
import _ from 'lodash';
import TrendSearchNavbar from './TrendDataNavbar';
import TrendPlot from './TrendPlot/TrendPlot';
import { TrendSearch } from '../../Global';
import { OverlayDrawer } from '@gpa-gemstone/react-interactive';
import AllSettingsModal from './Settings/AllSettingsModal';
import { SelectTrendDataSettings } from './../SettingsSlice';
import { useAppSelector } from './../../hooks';

const momentDateFormat = "MM/DD/YYYY";

const TrendData = () => {
    const closureHandler = React.useRef<((o: boolean) => void)>(() => { return; });
    const [showNav, setShowNav] = React.useState<boolean>(getShowNav());
    const [navHeight, setNavHeight] = React.useState<number>(0);
    const [plotList, setPlotList] = React.useState<TrendSearch.ITrendPlot[]>([]);
    const [defaultPlotSettings, setDefaultPlotSettings] = React.useState<TrendSearch.ITrendPlot>({
        TimeFilter: { date: moment.utc().format(momentDateFormat), time: '12:00:00.000', windowSize: 12, timeWindowUnits: 3 },
        Type: 'Line',
        Channels: [],
        PlotFilter: [{ Text: "Minimum", Value: "min", Selected: true }, { Text: "Maximum", Value: "max", Selected: true }, { Text: "Average/Values", Value: "avg", Selected: true }],
        ID: "blank",
        Width: 50,
        Height: 50,
        ShowEvents: false
    });
    const [showSettings, setShowSettings] = React.useState<boolean>(false);
    const [plotsMovable, setPlotsMovable] = React.useState<boolean>(false);
    const trendDatasettings = useAppSelector(SelectTrendDataSettings);
    const overlayPortalID = "TrendDataChartPortal";
    const overlayDrawer = "TrendDataNavbar";
    const defaultsApplied = ["Title", "XAxisLabel", "YLeftLabel", "YRightLabel", "Metric", "Width", "Height", "ShowEvents"];

    function getShowNav(): boolean {
        if (Object.prototype.hasOwnProperty.call(localStorage, 'SEbrowser.TrendData.ShowNav'))
            return JSON.parse(localStorage.getItem('SEbrowser.TrendData.ShowNav'));
        else
            return true;
    }

    const removePlot = React.useCallback(((ID: string) => {
        const index = plotList.findIndex(item => item.ID === ID);
        const newList = [...plotList];
        newList.splice(index, 1);
        setPlotList(newList);
    }), [plotList, setPlotList]);

    const setPlot = React.useCallback(((ID: string, record: TrendSearch.ITrendPlot, field: keyof (TrendSearch.ITrendPlot)) => {
        const index = plotList.findIndex(item => item.ID === ID);
        const newList: any[] = [...plotList];
        newList[index][field] = record[field] as any;
        setPlotList(newList);
    }), [plotList, setPlotList]);

    const movePlot = React.useCallback(((idNear: string, idMove: string, isBeforeNear: boolean) => {
        if (idNear === idMove) return;
        const newList: any[] = [...plotList];
        const oldIndex = newList.findIndex(item => item.ID === idMove);
        if (oldIndex < 0) {
            console.error(`Could not find plot with ID ${idMove} when trying to move plot.`);
            return;
        }
        const movedItem = newList.splice(oldIndex, 1);
        const newIndex = newList.findIndex(item => item.ID === idNear);
        if (oldIndex < 0) {
            console.error(`Could not find plot with ID ${idNear} when trying to move plot.`);
            return;
        }
        newList.splice(newIndex + (isBeforeNear ? 0 : 1), 0, movedItem[0]);
        setPlotList(newList);
    }), [plotList, setPlotList]);

    const setAllPlot = React.useCallback(((record: TrendSearch.ITrendPlot, field: keyof (TrendSearch.ITrendPlot)) => {
        const newList: any[] = [...plotList];
        newList.forEach((item: TrendSearch.ITrendPlot, index: number) => {
            newList[index][field] = record[field];
        });
        setDefaultPlotSettings({ ...defaultPlotSettings, [field]: record[field] });
        setPlotList(newList);
    }), [plotList]);

    const concatNewContainers = React.useCallback((newContainers: TrendSearch.ITrendPlot[]) => {
        const defaultAppliedContainers = _.cloneDeep(newContainers);
        defaultsApplied.forEach(field => {
            if (defaultPlotSettings[field] != null)
                defaultAppliedContainers.forEach(container => {
                    container[field] = defaultPlotSettings[field];
                });
        });
        if (trendDatasettings.InsertAtStart)
            setPlotList(defaultAppliedContainers.concat(plotList));
        else
            setPlotList(plotList.concat(defaultAppliedContainers));
    }, [plotList, setPlotList, trendDatasettings.InsertAtStart]);

    const removeAllCharts = React.useCallback(() => {
        setPlotList([]);
    }, [setPlotList]);

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
                HasPlots={plotList.length === 0} //TODO: Does this count as a function? Should this be a const with callback?
                SetShowAllSettings={setShowSettings}
                AddNewCharts={concatNewContainers}
                RemoveAllCharts={removeAllCharts}
                TimeFilter={defaultPlotSettings.TimeFilter}
                LinePlot={defaultPlotSettings.PlotFilter}
                Movable={plotsMovable}
                SetMovable={setPlotsMovable}
            />
            <div style={{ width: '100%', height: (showNav ? 'calc(100% - ' + navHeight + 'px)' : 'calc( 100% - 52px)'), overflowY: 'scroll' }}>
                {plotList.map(element => <TrendPlot key={element.ID} DragMode={plotsMovable}
                    Plot={element} SetPlot={setPlot} RemovePlot={removePlot} SplicePlot={movePlot}
                    OverlayPortalID={overlayPortalID} HandleOverlay={closeSettings}
                />)}
            </div>
            <OverlayDrawer Title={''} Open={false} Location={'top'} Target={overlayDrawer} GetOverride={(s) => { closureHandler.current = s; }} HideHandle={true}>
                <div id={overlayPortalID} style={{opacity: 1, background: undefined, color: 'black' }} />
            </OverlayDrawer>
            <AllSettingsModal Show={showSettings} SetShow={setShowSettings} ApplyFieldToAll={setAllPlot} Defaults={defaultPlotSettings} SetDefaults={setDefaultPlotSettings} />
        </div>
    );
}

export default TrendData;
