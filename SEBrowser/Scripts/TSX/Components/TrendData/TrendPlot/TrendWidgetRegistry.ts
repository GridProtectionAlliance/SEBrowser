//******************************************************************************************************
//  TrendWidgetRegistry.ts - Gbtc
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
//  Unless agreed to in writing, software distributed under the License is distributed on an "AS-IS"
//  BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. Refer to the License
//  for the specific language governing permissions and limitations.
//
//  Code Modification History:
//  ----------------------------------------------------------------------------------------------------
//  07/16/26 - Preston Crawford
//       Generated original version of source code.
//
//******************************************************************************************************
import React from 'react';
import { IMultiCheckboxOption, SEBrowser, TrendSearch } from '../../../global';
import { CyclicHistogram } from './CyclicHistogram';
import { Histogram } from './Histogram';
import { LineGraph } from './LineGraph';
import { Statistics } from './Statistics/Statistics';
import { PlotSettingsTab } from '../Settings/OverlayTabs/PlotSettingsTab';
import type { IPlotSettingsProps } from '../Settings/OverlayTabs/PlotSettingsTab';
import { HistogramPlotSettingsTab } from '../Settings/OverlayTabs/HistogramPlotSettingsTab';
import { MarkerTab } from '../Settings/OverlayTabs/MarkerTab';
import type { IMarkerSettingsProps } from '../Settings/OverlayTabs/MarkerTab';
import { CyclicChannelTab } from '../Settings/OverlayTabs/ChannelTabs/CyclicChannelTab';
import { HistogramChannelTab } from '../Settings/OverlayTabs/ChannelTabs/HistogramChannelTab';
import { LineChannelTab } from '../Settings/OverlayTabs/ChannelTabs/LineChannelTab';
import type { IChannelSettingsProps } from '../Settings/OverlayTabs/ChannelTabs/ChannelTab';

/** Props shared by every trend plot widget registered with {@link TrendWidgetRegistry}. */
export interface ITrendWidgetProps {
    /** Unique plot identifier used by captures, tooltips, controls, and rendered series keys. */
    ID: string,
    /** Centered report time window used when requesting trend data. */
    TimeFilter: SEBrowser.IReportTimeFilter,
    /** Selected channels and their per-series display settings and data-availability state. */
    ChannelInfo: TrendSearch.ISeriesSettings[],
    /** Updates channel series settings, including whether each series contains data. */
    SetChannelInfo: React.Dispatch<React.SetStateAction<TrendSearch.ISeriesSettings[]>>,
    /** Controls which data series, such as minimum, average, and maximum, are plotted. */
    PlotFilter: IMultiCheckboxOption[],
    /** Available widget height in pixels. */
    Height: number,
    /** Available widget width in pixels. */
    Width: number,
    /** Handles a graph selection at the supplied X coordinate and corresponding Y values. */
    OnSelect: (x: number, values: number[]) => void,
    /** Reports additional layout space required by captures or an expanded legend. */
    SetExtraSpace: (extra: number) => void,
    /** Optional heading displayed above the plot. */
    Title?: string,
    /** Enables metric-prefix formatting for axis and legend values. */
    Metric?: boolean,
    /** Optional X-axis label. */
    XAxisLabel?: string,
    /** Optional label for the left Y-axis. */
    YLeftLabel?: string,
    /** Optional label for the right Y-axis. */
    YRightLabel?: string,
    /** Optional CSS cursor override used while interacting with the plot. */
    Cursor?: string,
    /** Determines which mouse-following guide line is displayed. */
    MouseHighlight: 'none' | 'horizontal' | 'vertical',
    /** Determines whether the Y-axis is manually or automatically scaled. */
    AxisZoom?: 'Manual' | 'AutoValue' | 'HalfAutoValue',
    /** Initial Y-axis domains, ordered by the graph's axis index. */
    DefaultZoom?: [number, number][],
    /** Plot controls that should render regardless of the selected widget type. */
    Controls: React.ReactNode,
    /** Optional graph elements drawn over the primary data, such as event or user markers. */
    Overlays?: React.ReactNode
}

export interface ITrendWidgetSettings {
    Plot?: React.ComponentType<IPlotSettingsProps>,
    Marker?: React.ComponentType<IMarkerSettingsProps>,
    Channel?: React.ComponentType<IChannelSettingsProps>
}

export interface ITrendWidgetDefinition {
    Widget: React.ComponentType<ITrendWidgetProps>,
    Settings?: ITrendWidgetSettings
}

export const TrendWidgetRegistry: Record<TrendSearch.IPlotTypes, ITrendWidgetDefinition> = {
    Line: {
        Widget: LineGraph,
        Settings: {
            Plot: PlotSettingsTab,
            Marker: MarkerTab,
            Channel: LineChannelTab
        }
    },
    Cyclic: {
        Widget: CyclicHistogram,
        Settings: {
            Plot: PlotSettingsTab,
            Channel: CyclicChannelTab
        }
    },
    Histogram: {
        Widget: Histogram,
        Settings: {
            Plot: HistogramPlotSettingsTab,
            Marker: MarkerTab,
            Channel: HistogramChannelTab
        }
    },
    Statistics: {
        Widget: Statistics
    }
};
