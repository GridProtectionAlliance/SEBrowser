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

export type IScreenType = 'screen1' | 'screen2';

// take from url which layout to have - given its there

function plotScreen(screenType: IScreenType, dateTimeFormat: string): TrendSearch.ITrendPlot[] {
    switch (screenType) {
        case 'screen1':
            return [{
                TimeFilter: { start: moment.utc().format(dateTimeFormat), end: moment.utc().add(12, 'hours').format(dateTimeFormat) },
                Type: 'Line',
                Channels: [
                    {
                        "ID": 142,
                        "Name": "V RMS A",
                        "Description": null,
                        "AssetID": 48,
                        "AssetKey": "XFR-1",
                        "AssetName": "Bludhaven Transformer",
                        "MeterID": 1,
                        "MeterKey": "Bludhaven 13-T2",
                        "MeterName": "Bludhaven 13-T2",
                        "MeterShortName": null,
                        "Phase": "AN",
                        "ChannelGroup": "Voltage",
                        "ChannelGroupType": "V RMS",
                        "Unit": "V"
                    },
                    {
                        "ID": 143,
                        "Name": "V RMS B",
                        "Description": null,
                        "AssetID": 48,
                        "AssetKey": "XFR-1",
                        "AssetName": "Bludhaven Transformer",
                        "MeterID": 1,
                        "MeterKey": "Bludhaven 13-T2",
                        "MeterName": "Bludhaven 13-T2",
                        "MeterShortName": null,
                        "Phase": "BN",
                        "ChannelGroup": "Voltage",
                        "ChannelGroupType": "V RMS",
                        "Unit": "V"
                    }
                ],
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
            }]
    }
}

export default plotScreen;