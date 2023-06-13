//******************************************************************************************************
//  ChartContainer.tsx - Gbtc
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
//  04/14/23 - Gabriel Santos
//       Generated original version of source code.
//
//******************************************************************************************************
import React from 'react';
import _ from 'lodash';
import { CrossMark, Pencil } from '@gpa-gemstone/gpa-symbols';
import { Button } from '@gpa-gemstone/react-graph';
import { LineGraph, ILineSeries } from './LineGraph';
import { IMultiCheckboxOption, SEBrowser } from '../../../global';
import { SettingsOverlay } from './SettingsOverlay';

interface ITrendPlot {
    TimeFilter: SEBrowser.IReportTimeFilter,
    Type: 'Line',
    Channels: SEBrowser.ITrendChannel[],
    PlotFilter: IMultiCheckboxOption[],
    ID: string,
    Width: number,
    Height: number,
    Title?: string,
    XAxisLabel?: string
}

interface IContainerProps {
    // Manage Plot
    Plot: ITrendPlot,
    SetPlot: (id: string, record: ITrendPlot, field: keyof (ITrendPlot)) => void,
    RemovePlot: (id: string) => void,
    // Manage Overlay
    HandleOverlay: (open: boolean) => void,
    OverlayPortalID: string
}

type SeriesSettings = ILineSeries;

const TrendPlot = React.memo((props: IContainerProps) => {
    // Sizing Variables
    const chartRef = React.useRef(null);
    const [chartWidth, setChartWidth] = React.useState<number>(500);
    const [chartHeight, setChartHeight] = React.useState<number>(500);

    // Plot Saved Settings
    const [plotAllSeriesSettings, setPlotAllSeriesSettings] = React.useState<SeriesSettings[]>(null);

    // Settings Controls
    const [showSettings, setShowSettings] = React.useState<boolean>(false);

    // Get Heights and Widths
    React.useLayoutEffect(() => {
        setChartWidth(chartRef?.current?.offsetWidth ?? 500);
        setChartHeight(chartRef?.current?.offsetHeight ?? 500);
    });

    // Handle the overlay
    React.useEffect(() => {
        props.HandleOverlay(showSettings);
        console.log("outer show is " + showSettings)
    }, [showSettings]);

    const handleChannelDrop = React.useCallback((event: any) => {
        event.preventDefault();
        let allChannels = props.Plot.Channels.concat(JSON.parse(event.dataTransfer.getData('text/plain')));
        const channelIdSet = new Set<number>();
        // Get uniques only
        allChannels = allChannels.filter(channel => {
            if (channelIdSet.has(channel.ID))
                return false;
            channelIdSet.add(channel.ID);
            return true;
        });
        const newPlot: ITrendPlot = { ...props.Plot, Channels: allChannels };
        props.SetPlot(props.Plot.ID, newPlot, 'Channels');
    }, [props.Plot.Channels, props.SetPlot]);

    const handleDragOver = React.useCallback((event: any) => {
        event.preventDefault();
    }, []);

    // Buttons added to the plots
    const closeButton = (
        <Button onClick={() => {
            props.RemovePlot(props.Plot.ID);
            setShowSettings(false);
        }}>
            {CrossMark}
        </Button>);

    const overlayButton = (
        <Button onClick={() => setShowSettings(!showSettings)}>
            {Pencil}
        </Button>);

    return (
        <div className="col" style={{ width: props.Plot.Width - 1 + '%', height: props.Plot.Height-1 + '%', float: 'left' }} ref={chartRef} onDragOver={handleDragOver} onDrop={handleChannelDrop}>
            <div className="row">
                {props.Plot.Type === 'Line' ?
                    <LineGraph ChannelInfo={plotAllSeriesSettings} TimeFilter={props.Plot.TimeFilter} PlotFilter={props.Plot.PlotFilter} Title={props.Plot.Title} XAxisLabel={props.Plot.XAxisLabel}
                        Height={chartHeight} Width={chartWidth}>
                        {overlayButton} {closeButton}
                    </LineGraph> : null}
            </div>
            <SettingsOverlay SeriesSettings={plotAllSeriesSettings} SetSeriesSettings={setPlotAllSeriesSettings} SetShow={setShowSettings} Show={showSettings} SetPlot={props.SetPlot}
                OverlayPortalID={props.OverlayPortalID} Plot={props.Plot} />
        </div>
    );
});

export { TrendPlot, ITrendPlot };