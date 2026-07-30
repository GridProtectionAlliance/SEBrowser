//******************************************************************************************************
//  HistogramChannelTab.tsx - Gbtc
//
//  Copyright © 2026, Grid Protection Alliance.  All Rights Reserved.
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
//  07/17/26 - Preston Crawford
//       Generated original version of source code.
//
//******************************************************************************************************
import React from 'react';
import { ColorPicker, Input, Select, ToggleSwitch } from '@gpa-gemstone/react-forms';
import { TrendSearch } from '../../../../../global';
import { LineTypeOptions } from '../../SettingsModal';
import { ChannelTab } from '../ChannelTabs/ChannelTab';
import type { IChannelEditorProps, IChannelSettingsProps } from '../ChannelTabs/ChannelTab';

const HistogramChannelEditor = (props: IChannelEditorProps) => {
    const settings = props.SeriesSettings.Settings as TrendSearch.IHistogramSeriesSettings;
    const visibleSeries = Object.keys(settings).filter(seriesKey =>
        settings[seriesKey].HasData &&
        (props.PlotFilter.find(option => option.Value === seriesKey)?.Selected ?? true)
    );

    if (visibleSeries.length === 0)
        return (
            <div style={{
                backgroundColor: "grey", borderRadius: ('25px 25px 25px 25px'),
                width: '100%', height: '100%'
            }} />
        );

    const setSeries = (seriesKey: string, series: TrendSearch.IHistogramSettings) => {
        props.SetSeriesSettings({
            ...props.SeriesSettings,
            Settings: { ...settings, [seriesKey]: series }
        });
    };

    return (
        <div className="row" style={{ height: '100%', width: '100%' }}>
            {visibleSeries.map(seriesKey =>
                <div className="col" style={{ width: 'auto' }} key={seriesKey}>
                    <h4>{seriesKey} Settings</h4>
                    <ColorPicker<TrendSearch.IHistogramSettings>
                        Record={settings[seriesKey]}
                        Field={'Color'}
                        Label={'Bar Color'}
                        Setter={series => setSeries(seriesKey, series)}
                    />
                    <Input<TrendSearch.IHistogramSettings>
                        Record={settings[seriesKey]}
                        Field={'Label'}
                        Label={'Legend Label'}
                        Setter={series => setSeries(seriesKey, series)}
                        Valid={() => true}
                    />
                    <hr style={{ borderTopWidth: '2px', margin: '1.5rem 0' }} />
                    <ToggleSwitch<TrendSearch.IHistogramSettings>
                        Record={withCumulativeDefaults(settings[seriesKey])}
                        Field={'ShowCumulativeProbability'}
                        Label={'Show Cumulative Probability'}
                        Setter={series => setSeries(seriesKey, series)}
                    />
                    <ColorPicker<TrendSearch.IHistogramSettings>
                        Record={withCumulativeDefaults(settings[seriesKey])}
                        Field={'CumulativeProbabilityColor'}
                        Label={'Cumulative Line Color'}
                        Setter={series => setSeries(seriesKey, series)}
                    />
                    <Input<TrendSearch.IHistogramSettings>
                        Record={withCumulativeDefaults(settings[seriesKey])}
                        Field={'CumulativeProbabilityLabel'}
                        Label={'Cumulative Legend Label'}
                        Setter={series => setSeries(seriesKey, series)}
                        Valid={() => true}
                    />
                    <Input<TrendSearch.IHistogramSettings>
                        Record={withCumulativeDefaults(settings[seriesKey])}
                        Field={'Width'}
                        Label={'Cumulative Line Width (pixels)'}
                        Setter={series => setSeries(seriesKey, series)}
                        Type={'number'}
                        Feedback={'Width must be a positive number'}
                        Valid={() => settings[seriesKey].Width > 0}
                    />
                    <Select<TrendSearch.IHistogramSettings>
                        Record={withCumulativeDefaults(settings[seriesKey])}
                        Field={'Type'}
                        Label={'Cumulative Line Style'}
                        Setter={series => setSeries(seriesKey, series)}
                        Options={LineTypeOptions}
                    />
                </div>
            )}
        </div>
    );
};

const withCumulativeDefaults = (settings: TrendSearch.IHistogramSettings): TrendSearch.IHistogramSettings => ({
    ...settings,
    ShowCumulativeProbability: settings.ShowCumulativeProbability ?? true,
    CumulativeProbabilityColor: settings.CumulativeProbabilityColor ?? settings.Color,
    CumulativeProbabilityLabel: settings.CumulativeProbabilityLabel ?? `${settings.Label} Cumulative Probability`
});

const HistogramChannelTab = (props: IChannelSettingsProps) => <ChannelTab {...props} Editor={HistogramChannelEditor} />;

export { HistogramChannelTab };
