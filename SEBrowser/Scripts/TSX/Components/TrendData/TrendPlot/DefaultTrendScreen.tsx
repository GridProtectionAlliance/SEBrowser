//******************************************************************************************************
//  DefaultTrendScreen.tsx - Gbtc
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
//  09/25/24 - Collins Self
//       Generated original version of source code.
//
//******************************************************************************************************

import moment from 'moment';
import { TrendSearch } from 'Scripts/TSX/global';
const dateTimeFormat = 'MM/DD/YYYY HH:mm:ss.SSS'

/**
 * @param channels Default value of channel IDs
 * @param screen Default number of plots to show
 * @returns Promise of an Array of trend plots to pass as default screen
 */
export default function defaultPlotScreen(channels: number[], screen: string): Promise<Array<TrendSearch.ITrendPlot>> {
    const trendFilter = {
        Phases: [],
        ChannelGroups: [],
        MeterList: [],
        AssetList: [],
        ChannelIDs: channels
    }
    function GetTrendChannels(): JQuery.jqXHR<TrendSearch.ITrendChannel[]> {
        return $.ajax({
            type: "POST",
            url: `${homePath}api/OpenXDA/GetTrendSearchData`,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(trendFilter),
            dataType: 'json',
            cache: true,
            async: true
        });
    }

    return new Promise((resolve, reject) => {
        GetTrendChannels().done((data: TrendSearch.ITrendChannel[]) => {
            switch (screen) {
                case 'screen1':
                    resolve([{
                        TimeFilter: { start: moment.utc().format(dateTimeFormat), end: moment.utc().add(12, 'hours').format(dateTimeFormat) },
                        Type: 'Line',
                        Channels: [{
                            AssetID: 6,
                            AssetKey: "BLUDHAVEN_13-T1",
                            AssetName: "Bludhaven 13 T1",
                            ChannelGroup: "Voltage",
                            ChannelGroupType: "V RMS",
                            Description: null,
                            ID: 202,
                            MeterID: 5,
                            MeterKey: "Bludhaven 13-T1",
                            MeterName: "Bludhaven 13-T1",
                            MeterShortName: null,
                            Name: "V RMS A",
                            Phase: "AN",
                            Unit: "V"
                        }, {
                            AssetID: 6,
                            AssetKey: "BLUDHAVEN_13-T1",
                            AssetName: "Bludhaven 13 T1",
                            ChannelGroup: "Voltage",
                            ChannelGroupType: "V RMS",
                            Description: null,
                            ID: 202,
                            MeterID: 5,
                            MeterKey: "Bludhaven 13-T1",
                            MeterName: "Bludhaven 13-T1",
                            MeterShortName: null,
                            Name: "V RMS A",
                            Phase: "AN",
                            Unit: "V"
                        }],
                        PlotFilter: [
                            { Text: "Minimum", Value: "min", Selected: true },
                            { Text: "Maximum", Value: "max", Selected: true },
                            { Text: "Average/Values", Value: "avg", Selected: true }
                        ],
                        ID: "blank",
                        Width: 100,
                        Height: 100,
                        AxisZoom: 'AutoValue',
                        ShowEvents: false
                    }]);
                    break;
                case 'screen2':
                    resolve([{
                        TimeFilter: { start: moment.utc().format(dateTimeFormat), end: moment.utc().add(12, 'hours').format(dateTimeFormat) },
                        Type: 'Line',
                        Channels: data,
                        PlotFilter: [
                            { Text: "Minimum", Value: "min", Selected: true },
                            { Text: "Maximum", Value: "max", Selected: true },
                            { Text: "Average/Values", Value: "avg", Selected: true }
                        ],
                        ID: "blank",
                        Width: 50,
                        Height: 100,
                        AxisZoom: 'AutoValue',
                        ShowEvents: false
                    }, {
                        TimeFilter: { start: moment.utc().format(dateTimeFormat), end: moment.utc().add(12, 'hours').format(dateTimeFormat) },
                        Type: 'Line',
                        Channels: data,
                        PlotFilter: [
                            { Text: "Minimum", Value: "min", Selected: true },
                            { Text: "Maximum", Value: "max", Selected: true },
                            { Text: "Average/Values", Value: "avg", Selected: true }
                        ],
                        ID: "blank",
                        Width: 50,
                        Height: 100,
                        AxisZoom: 'AutoValue',
                        ShowEvents: false
                    }]);
                    break;
                default:
                    resolve([]);
            }
        }) // when we get to status stuff have a .fail(error) status
    })
}