//******************************************************************************************************
//  Histogram.tsx - Gbtc
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
import { Application } from '@gpa-gemstone/application-typings';
import { ReactIcons } from '@gpa-gemstone/gpa-symbols';
import { Bar, BarGroup, Plot } from '@gpa-gemstone/react-graph';
import { ToolTip } from '@gpa-gemstone/react-forms';
import { LoadingIcon } from '@gpa-gemstone/react-interactive';
import { useGetContainerPosition } from '@gpa-gemstone/helper-functions';
import { IMultiCheckboxOption, TrendSearch } from '../../../global';
import { SelectGeneralSettings, SelectTrendDataSettings } from '../../../Store/SettingsSlice';
import { useAppSelector } from '../../../hooks';
import GraphError from './GraphError';
import { ITrendWidgetProps } from './TrendWidgetRegistry';
import { parseTrendDataResponse, requestTrendData } from '../Utils/TrendDataRequest';

const binCount = 10;

const seriesTypes = ['Minimum', 'Average', 'Maximum'] as const;

type SeriesType = typeof seriesTypes[number];

type SeriesSettingsWithChannel = TrendSearch.ISeriesSettings & { Channel: TrendSearch.ITrendChannel };

interface IHistogramSeries {
    ID: string,
    Color: string,
    Counts: number[],
    Label: string
}

interface IHistogramData {
    BinWidth: number,
    Domain: [number, number],
    Series: IHistogramSeries[]
}

/**
 * Displays the distribution of selected minimum, average, and maximum channel values over a time window.
 * Each channel/series combination is rendered as a group of bars sharing one legend entry.
 */
const Histogram = React.memo((props: ITrendWidgetProps) => {
    const [points, setPoints] = React.useState<TrendSearch.IPQData[]>([]);
    const [graphStatus, setGraphStatus] = React.useState<Application.Types.Status>('uninitiated');
    const [hover, setHover] = React.useState<boolean>(false);
    const [extraLegendHeight, setExtraLegendHeight] = React.useState<number>(0);
    const titleRef = React.useRef<HTMLDivElement | null>(null);
    const { offsetHeight: titleHeight } = useGetContainerPosition(titleRef);
    const trendDataSettings = useAppSelector(SelectTrendDataSettings);
    const generalSettings = useAppSelector(SelectGeneralSettings);
    const height = props.Height ?? 0;
    const width = props.Width ?? 0;
    const channelIDs = (props.ChannelInfo ?? []).map(info => info?.Channel?.ChannelID).filter(isChannelID);
    const channelKey = channelIDs.join(',');
    const data = React.useMemo(() => buildHistogramData(points, props.ChannelInfo, props.PlotFilter), [points, props.ChannelInfo, props.PlotFilter]);
    const plotHeight = Math.max(0, height - titleHeight - 5);

    // Load the samples for the selected channels and time window.
    React.useEffect(() => {
        if (props.TimeFilter == null || channelKey.length === 0) {
            setPoints([]);
            return;
        }

        setGraphStatus('loading');

        const handle = requestTrendData(channelIDs, props.TimeFilter).done((response: string) => {
            const responsePoints = parseTrendDataResponse(response);
            setPoints(responsePoints);
            props.SetChannelInfo?.((props.ChannelInfo ?? []).map(channel => {
                const tag = getChannelTag(channel?.Channel?.ChannelID);
                if (tag == null) return channel;
                const channelPoints = responsePoints.filter(point => typeof point?.Tag === 'string' && point.Tag.toLowerCase() === tag);
                const settings = { ...(channel.Settings ?? {}) } as TrendSearch.ILineSeriesSettings;
                Object.keys(settings).forEach(type => {
                    const dataType = seriesTypes.find(seriesType => seriesType === type) ?? 'Average';
                    const setting = settings[type] ?? settings.Average;
                    if (setting != null)
                        settings[type] = { ...setting, HasData: channelPoints.some(point => Number.isFinite(point[dataType])) };
                });
                return { ...channel, Settings: settings };
            }));
            setGraphStatus('idle');
        }).fail(() => {
            setGraphStatus('error');
        });
        return () => handle.abort();
    }, [channelKey, props.TimeFilter]);

    // Keep the parent plot layout synchronized with space added or removed by the captured legend.
    const captureCallback = React.useCallback((height: number) => {
        props.SetExtraSpace(height);
        setExtraLegendHeight(height);
        return props.ID;
    }, [props.ID, props.SetExtraSpace]);

    if (graphStatus === 'error')
        return <GraphError Height={height} Title={props.Title}>{props.Controls}</GraphError>;

    const barWidth = data == null || data.Series.length === 0 ? 0 : data.BinWidth * 0.9 / data.Series.length;
    const maxCount = Math.max(1, ...(data?.Series.flatMap(series => series.Counts) ?? []));

    return (
        <div className="row">
            <LoadingIcon Show={graphStatus === 'loading' || graphStatus === 'uninitiated'} Size={29} />
            <div ref={titleRef} style={{ width: `${width}px` }}>
                <h4 style={{ textAlign: "center", marginTop: '0px', marginBottom: '0px' }}>
                    {props.Title ?? ''}
                    {data == null ?
                        <span data-tooltip={props.ID} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}><ReactIcons.Warning Color="var(--warning)" /></span>
                        : null}
                </h4>
            </div>
            <Plot
                height={plotHeight}
                width={width}
                legendHeight={plotHeight / 2 + extraLegendHeight}
                legendWidth={width / 2}
                menuLocation={generalSettings.MoveOptionsLeft ? 'left' : 'right'}
                defaultTdomain={data?.Domain ?? [0, 1]}
                defaultYdomain={[0, maxCount]}
                XAxisType="value"
                onSelect={props.OnSelect}
                onCapture={captureCallback}
                onCaptureComplete={() => captureCallback(0)}
                cursorOverride={props.Cursor}
                snapMouse={trendDataSettings.MarkerSnapping}
                legend={trendDataSettings.LegendDisplay}
                useMetricFactors={props.Metric ?? false}
                holdMenuOpen={!trendDataSettings.StartWithOptionsClosed}
                limitZoom={true}
                Tlabel={props.XAxisLabel}
                Ylabel={props.YLeftLabel}
                showMouse={props.MouseHighlight}
                yDomain={props.AxisZoom}
            >
                {data?.Series.map((series, seriesIndex) =>
                    <BarGroup key={series.ID} Legend={series.Label}>
                        {series.Counts.map((count, binIndex) =>
                            <Bar
                                key={`${series.ID}_${binIndex}`}
                                Data={[0, count]}
                                BarOrigin={data.Domain[0] + binIndex * data.BinWidth + data.BinWidth * 0.05 + seriesIndex * barWidth}
                                BarWidth={barWidth}
                                Color={series.Color}
                                Axis="left"
                            />
                        )}
                    </BarGroup>
                )}
                {props.Controls}
            </Plot>
            <ToolTip Show={hover} Position="bottom" Target={props.ID}>Selected Channels have no finite data for the selected Time Window.</ToolTip>
        </div>
    );
});

/** Converts a numeric channel ID to the eight-character hexadecimal tag returned by HIDS. */
const getChannelTag = (channelID?: number): string | null => {
    if (channelID == null || !Number.isFinite(channelID)) return null;
    return channelID.toString(16).padStart(8, '0').toLowerCase();
};

/** Narrows optional channel IDs to finite numbers. */
const isChannelID = (channelID?: number): channelID is number => channelID != null && Number.isFinite(channelID);

/** Narrows series settings to entries containing a channel with a valid HIDS tag. */
const hasChannel = (settings: TrendSearch.ISeriesSettings): settings is SeriesSettingsWithChannel =>
    getChannelTag(settings?.Channel?.ChannelID) != null;

/** Returns the minimum, average, and maximum series currently selected by the plot filter. */
const getSeriesPlotted = (plotFilter?: IMultiCheckboxOption[] | null): SeriesType[] =>
    seriesTypes.filter(type => plotFilter?.find(option => option?.Value === type)?.Selected ?? true);

/**
 * Builds equal-width value bins shared by all selected channels and series.
 * Each returned series contains the number of finite samples falling into each bin.
 */
const buildHistogramData = (points?: TrendSearch.IPQData[] | null, channelInfo?: TrendSearch.ISeriesSettings[] | null,
    plotFilter?: IMultiCheckboxOption[] | null): IHistogramData | null => {
    const channels = (channelInfo ?? []).filter(hasChannel);
    const validPoints = (points ?? []).filter(point => typeof point?.Tag === 'string');
    const plottedSeries = getSeriesPlotted(plotFilter);
    const channelTags = new Set(channels.map(channel => getChannelTag(channel.Channel.ChannelID)));
    let minimum = Infinity;
    let maximum = -Infinity;
    validPoints.filter(point => channelTags.has(point.Tag.toLowerCase())).forEach(point => {
        plottedSeries.forEach(type => {
            const value = point[type];
            if (!Number.isFinite(value)) return;
            minimum = Math.min(minimum, value);
            maximum = Math.max(maximum, value);
        });
    });

    if (!Number.isFinite(minimum) || !Number.isFinite(maximum)) return null;

    if (minimum === maximum) {
        const padding = Math.max(Math.abs(minimum) * 0.05, 0.5);
        minimum -= padding;
        maximum += padding;
    }

    const binWidth = (maximum - minimum) / binCount;
    if (!Number.isFinite(binWidth) || binWidth <= 0) return null;
    const series = channels.flatMap(channel => {
        const tag = getChannelTag(channel.Channel.ChannelID);
        const channelPoints = validPoints.filter(point => point.Tag.toLowerCase() === tag);
        const settings = channel.Settings as TrendSearch.ILineSeriesSettings | null | undefined;
        return plottedSeries.flatMap(type => {
            const seriesSetting = settings?.[type];
            if (seriesSetting == null) return [];
            const counts = Array<number>(binCount).fill(0);
            channelPoints.map(point => point[type]).filter(Number.isFinite).forEach(value => {
                const bin = Math.min(binCount - 1, Math.floor((value - minimum) / binWidth));
                counts[Math.max(0, bin)] += 1;
            });
            return {
                ID: `${channel.Channel.ID}_${type}`,
                Color: seriesSetting.Color,
                Counts: counts,
                Label: seriesSetting.Label
            };
        });
    });

    return { BinWidth: binWidth, Domain: [minimum, maximum], Series: series };
};

export { Histogram };
