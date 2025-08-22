//******************************************************************************************************
//  HelperFunctions.ts - Gbtc
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
//  08/14/25 - Gabriel Santos
//       Generated original version of source code.
//
//******************************************************************************************************

import { SVGIcons } from '@gpa-gemstone/gpa-symbols';
import moment from 'moment';
import { TrendSearch } from '../../Global';
import { momentDateFormat } from '../ReportTimeFilter';

// Returns an array of booleans telling which components are common to all channels
export function findCommonComponents(components: string[], channels: TrendSearch.ITrendChannel[]): boolean[] {
    const allCommon: boolean[] = [];
    components.forEach(component => {
        const parts = component.split('.');
        if (parts.length !== 2) allCommon.push(false);
        else if ('series'.localeCompare(parts[0], undefined, { sensitivity: 'base' }) === 0)
            allCommon.push(
                !channels
                    .some((channel) => channel.Series.some(series => series?.[parts[1]] !== channels[0].Series?.[0]?.[parts[1]]))
            );
        else if ('channel'.localeCompare(parts[0], undefined, { sensitivity: 'base' }) === 0)
            allCommon.push(
                !channels
                    .some((channel) => channel?.[parts[1]] !== channels[0]?.[parts[1]])
            );
        else allCommon.push(false);
    });
    return allCommon;
}

export namespace TrendDefaults {
    const lineSettings = "SEBrowser.TrendSearch.LineSettingsBundle";
    export function storeLineSettings(bundle: TrendSearch.ILinePlotSettingsBundle): void {
        localStorage.setItem(lineSettings, JSON.stringify(bundle))
    }
    export function getLineSettingsOrDefault(): TrendSearch.ILinePlotSettingsBundle {
        if (Object.prototype.hasOwnProperty.call(localStorage, lineSettings))
            return JSON.parse(localStorage.getItem(lineSettings));
        return {
            Minimum: {
                Default: {
                    Width: 3,
                    Type: 'short-dash'
                },
                ShouldApply: false
            },
            Maximum: {
                Default: {
                    Width: 3,
                    Type: 'short-dash'
                },
                ShouldApply: false
            },
            Average: {
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
                            Minimum: "#A30000",
                            Average: "#A30000",
                            Maximum: "#A30000"
                        },
                        {
                            Label: "Color 2",
                            Minimum: "#0029A3",
                            Average: "#0029A3",
                            Maximum: "#0029A3"
                        },
                        {
                            Label: "Color 3",
                            Minimum: "#007A29",
                            Average: "#007A29",
                            Maximum: "#007A29"
                        },
                        {
                            Label: "Color 4",
                            Minimum: "#FF0000",
                            Average: "#FF0000",
                            Maximum: "#FF0000"
                        },
                        {
                            Label: "Color 5",
                            Minimum: "#0066CC",
                            Average: "#0066CC",
                            Maximum: "#0066CC"
                        },
                        {
                            Label: "Color 6",
                            Minimum: "#33CC33",
                            Average: "#33CC33",
                            Maximum: "#33CC33"
                        }
                    ]
                },
                ShouldApply: false
            }
        }
    }

    const markerSettings = "SEBrowser.TrendSearch.MarkerSettingsBundle";
    export function storeMarkerSettings(bundle: TrendSearch.IMarkerSettingsBundle): void {
        localStorage.setItem(markerSettings, JSON.stringify(bundle))
    }
    export function getMarkerSettingsOrDefault(): TrendSearch.IMarkerSettingsBundle {
        if (Object.prototype.hasOwnProperty.call(localStorage, markerSettings))
            return JSON.parse(localStorage.getItem(markerSettings));
        return {
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
        }
    }

    const plotSettings = "SEBrowser.TrendSearch.PlotSettings";
    const storeFields: (keyof TrendSearch.ITrendPlot)[] = ["LabelComponents", "Height", "Width", "Metric", "ShowEvents"];
    export function storePlotSettings(plot: TrendSearch.ITrendPlot): void {
        const storedItems: { [key: string]: unknown } = {};
        storeFields.forEach(field => storedItems[field] = plot[field]);
        localStorage.setItem(plotSettings, JSON.stringify(storedItems));
    }
    export function getPlotSettingsOrDefault(): TrendSearch.ITrendPlot {
        const defaultPlot: TrendSearch.ITrendPlot = {
            TimeFilter: { date: moment.utc().format(momentDateFormat), time: '12:00:00.000', windowSize: 12, timeWindowUnits: 3 },
            Type: 'Line',
            Channels: [],
            PlotFilter: [{ Label: "Minimum", Value: "Minimum", Selected: true }, { Label: "Maximum", Value: "Maximum", Selected: true }, { Label: "Average/Values", Value: "Average", Selected: true }],
            ID: "blank",
            Width: 50,
            Height: 50,
            AxisZoom: 'AutoValue',
            ShowEvents: false,
            LabelComponents: []
        };
        let storedItems: { [key: string]: unknown } = {};
        if (Object.prototype.hasOwnProperty.call(localStorage, plotSettings))
            storedItems = JSON.parse(localStorage.getItem(plotSettings));
        Object.keys(storedItems).forEach(field => defaultPlot[field] = storedItems[field]);
        return defaultPlot;
    }
} 
