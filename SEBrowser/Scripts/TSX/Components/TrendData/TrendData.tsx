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
import { TrendSearch } from '../../global';
import AllSettingsModal from './Settings/AllSettingsModal';
import { SelectDateTimeFormat, SelectTrendDataSettings } from './../SettingsSlice';
import { useAppSelector } from './../../hooks';
import { SVGIcons } from '@gpa-gemstone/gpa-symbols';
import defaultPlotScreen from './TrendPlot/DefaultTrendScreen';

const trendSearchId = "TrendDataChartAll";
const defaultsIgnored = new Set(["ID", "TimeFilter", "Type", "Channels", "PlotFilter"]);

interface IProps {
    useParams: { screen: string }
}

const TrendData = (props: IProps) => {
    const dateTimeFormat = useAppSelector(SelectDateTimeFormat);
    const closureHandler = React.useRef<((o: boolean) => void)>(() => { return; });

    const plotChannels: number[] = [202];
    const [plotList, setPlotList] = React.useState<TrendSearch.ITrendPlot[]>([]);

    const [showNav, setShowNav] = React.useState<boolean>(getShowNav());
    const [defaultPlotSettings, setDefaultPlotSettings] = React.useState<TrendSearch.ITrendPlot>({
        TimeFilter: { start: moment.utc().format(dateTimeFormat), end: moment.utc().add(12, 'hours').format(dateTimeFormat) },
        Type: 'Line',
        Channels: [],
        PlotFilter: [{ Text: "Minimum", Value: "min", Selected: true }, { Text: "Maximum", Value: "max", Selected: true }, { Text: "Average/Values", Value: "avg", Selected: true }],
        ID: "blank",
        Width: 50,
        Height: 50,
        AxisZoom: 'AutoValue',
        ShowEvents: false
    });
    const [markerDefaults, setMarkerDefaults] = React.useState<TrendSearch.IMarkerSettingsBundle>({
        Symb: {
            Default: {
                // Need to overwrite these
                ID: "Symb",
                xPos: undefined,
                yPos: undefined,
                axis: "left",
                xBox: undefined,
                yBox: undefined,
                // Symbol
                symbol: SVGIcons.ArrowDropDown,
                radius: 12,
                color: "#000000",
                // Note
                format: "HH:mm",
                note: "",
                opacity: 1,
                fontColor: "#000000",
                fontSize: 1,
                type: "Symb"
            },
            ShouldApply: false
        },
        VeHo: {
            Default: {
                // Need to overwrite these
                ID: "Veho",
                value: undefined,
                axis: "left",
                isHori: undefined,
                // Defaults
                color: "#E41000",
                line: "short-dash",
                width: 4,
                type: "VeHo"
            },
            ShouldApply: false
        },
        Event: {
            Default: {
                // Need to overwrite ID
                ID: "Event",
                axis: "left",
                type: "Event-Vert",
                color: "#E41000",
                line: "short-dash",
                width: 4
            },
            ShouldApply: false
        }
    });
    const [lineDefaults, setLineDefaults] = React.useState<TrendSearch.ILinePlotSettingsBundle>({
        Min: {
            Default: {
                Width: 3,
                Type: 'short-dash'
            },
            ShouldApply: false
        },
        Max: {
            Default: {
                Width: 3,
                Type: 'short-dash'
            },
            ShouldApply: false
        },
        Avg: {
            Default: {
                Width: 3,
                Type: 'solid'
            },
            ShouldApply: false
        },
        Colors: {
            Default: {
                ApplyType: "Random",
                Colors: [
                    {
                        Label: "Color 1",
                        MinColor: "#A30000",
                        AvgColor: "#A30000",
                        MaxColor: "#A30000"
                    },
                    {
                        Label: "Color 2",
                        MinColor: "#0029A3",
                        AvgColor: "#0029A3",
                        MaxColor: "#0029A3"
                    },
                    {
                        Label: "Color 3",
                        MinColor: "#007A29",
                        AvgColor: "#007A29",
                        MaxColor: "#007A29"
                    },
                    {
                        Label: "Color 4",
                        MinColor: "#FF0000",
                        AvgColor: "#FF0000",
                        MaxColor: "#FF0000"
                    },
                    {
                        Label: "Color 5",
                        MinColor: "#0066CC",
                        AvgColor: "#0066CC",
                        MaxColor: "#0066CC"
                    },
                    {
                        Label: "Color 6",
                        MinColor: "#33CC33",
                        AvgColor: "#33CC33",
                        MaxColor: "#33CC33"
                    }
                ]
            },
            ShouldApply: false
        }
    });
    const [showSettings, setShowSettings] = React.useState<boolean>(false);
    const [plotsMovable, setPlotsMovable] = React.useState<boolean>(false);
    const trendDatasettings = useAppSelector(SelectTrendDataSettings);

    React.useEffect(() => {
        defaultPlotScreen(plotChannels, props.useParams.screen).then((defaults) => {
            console.log('defaults set to plotChannels', defaults);
            setPlotList(defaults);
        })
    }, [])

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
        setPlotList(newList);
    }), [plotList]);

    const concatNewContainers = React.useCallback((newContainers: TrendSearch.ITrendPlot[]) => {
        const defaultAppliedContainers = _.cloneDeep(newContainers);
        Object.keys(defaultPlotSettings).forEach(field => {
            if (defaultPlotSettings[field] != null && !defaultsIgnored.has(field))
                defaultAppliedContainers.forEach(container => {
                    container[field] = defaultPlotSettings[field];
                });
        });
        if (trendDatasettings.InsertAtStart)
            setPlotList(defaultAppliedContainers.concat(plotList));
        else
            setPlotList(plotList.concat(defaultAppliedContainers));
    }, [plotList, setPlotList, trendDatasettings.InsertAtStart, defaultPlotSettings]);

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
        <div className="container-fluid d-flex h-100 flex-column" style={{ height: 'inherit' }}>
            <TrendSearchNavbar
                ToggleVis={toggleNavbar}
                ShowNav={showNav}
                SetShowAllSettings={setShowSettings}
                AddNewCharts={concatNewContainers}
                RemoveAllCharts={removeAllCharts}
                TimeFilter={defaultPlotSettings.TimeFilter}
                LinePlot={defaultPlotSettings.PlotFilter}
                Movable={plotsMovable}
                SetMovable={setPlotsMovable}
                PlotIds={plotList.map(plot => { return { ID: plot.ID, Width: plot.Width, Height: plot.Height } })}
            />
            <div className={'row'} style={{ flex: 1, overflow: 'hidden' }}>
                <div className={'col-12'} style={{ height: '100%', overflowY: 'scroll', overflowX: 'hidden' }} id={trendSearchId}>
                    {plotList.map(element => <TrendPlot key={element.ID} DragMode={plotsMovable}
                        Plot={element} SetPlot={setPlot} RemovePlot={removePlot} SplicePlot={movePlot}
                        HandleOverlay={closeSettings} MarkerDefaults={markerDefaults} LineDefaults={lineDefaults}
                    />)}
                </div>
            </div>
            <AllSettingsModal Show={showSettings} SetShow={setShowSettings} ApplyFieldToAll={setAllPlot}
                Defaults={defaultPlotSettings} SetDefaults={setDefaultPlotSettings}
                MarkerDefaults={markerDefaults} SetMarkerDefaults={setMarkerDefaults}
                LinePlotDefaults={lineDefaults} SetLinePlotDefaults={setLineDefaults} />
        </div>
    );
}

export default TrendData;
