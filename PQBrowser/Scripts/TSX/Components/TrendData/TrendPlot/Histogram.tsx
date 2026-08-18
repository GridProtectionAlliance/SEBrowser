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
import { Bar, BarGroup, Line, Plot } from '@gpa-gemstone/react-graph';
import { ToolTip } from '@gpa-gemstone/react-forms';
import { LoadingIcon } from '@gpa-gemstone/react-interactive';
import { useGetContainerPosition } from '@gpa-gemstone/helper-functions';
import { IMultiCheckboxOption, TrendSearch } from '../../../global';
import { SelectGeneralSettings, SelectTrendDataSettings } from '../../../Store/SettingsSlice';
import { useAppSelector } from '../../../hooks';
import GraphError from './GraphError';
import { ITrendWidgetProps } from './TrendWidgetRegistry';
import { CsvRow, downloadCsv } from './TrendCsv';
import { parseTrendDataResponse, requestTrendData } from '../Utils/TrendDataRequest';

const binCount = 10;

const seriesTypes = ['Minimum', 'Average', 'Maximum'];

type SeriesType = typeof seriesTypes[number];

type SeriesSettingsWithChannel = TrendSearch.ISeriesSettings & { Channel: TrendSearch.ITrendChannel };

interface IHistogramSeries {
    ID: string,
    ChannelID: string,
    SeriesKey: string,
    Color: string,
    Percentages: number[],
    Label: string,
    Settings: TrendSearch.IHistogramSettings
}

interface IHistogramBinnedSeries {
    ID: string,
    ChannelID: string,
    SeriesKey: string,
    Percentages: number[]
}

interface IHistogramBinnedData {
    BinWidth: number,
    Domain: [number, number],
    Series: IHistogramBinnedSeries[]
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
    const binningKey = getHistogramBinningKey(props.ChannelInfo, props.PlotFilter);
    const binnedData = React.useMemo(() => buildHistogramData(points, props.ChannelInfo, props.PlotFilter), [points, binningKey]);
    const data = React.useMemo(() => applyHistogramSettings(binnedData, props.ChannelInfo), [binnedData, props.ChannelInfo]);
    const enabledVisualizationCount = React.useMemo(() => data?.Series.reduce((count, series) =>
        count + (series.Settings.Enabled ?? true ? 1 : 0) +
        ((series.Settings.ShowCumulativeProbability ?? true) && (series.Settings.CumulativeProbabilityEnabled ?? true) ? 1 : 0), 0) ?? 0, [data]);
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
                const settings = { ...(channel.Settings ?? {}) } as TrendSearch.IHistogramSeriesSettings;
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

    const setHistogramEnabled = React.useCallback((
        channelID: string,
        seriesKey: string,
        field: 'Enabled' | 'CumulativeProbabilityEnabled',
        action: React.SetStateAction<boolean>
    ) => {
        props.SetChannelInfo(currentSettings => currentSettings.map(channel => {
            if (channel.Channel?.ID !== channelID) return channel;
            const settings = channel.Settings as TrendSearch.IHistogramSeriesSettings;
            const seriesSettings = settings[seriesKey];
            if (seriesSettings == null) return channel;
            const currentEnabled = seriesSettings[field] ?? true;
            const enabled = typeof action === 'function' ? action(currentEnabled) : action;
            return {
                ...channel,
                Settings: {
                    ...settings,
                    [seriesKey]: { ...seriesSettings, [field]: enabled }
                }
            };
        }));
    }, [props.SetChannelInfo]);

    const exportCsv = React.useCallback(() => {
        if (data != null) downloadCsv(buildHistogramCsvRows(data), props.Title);
    }, [data, props.Title]);

    if (graphStatus === 'error')
        return <GraphError Height={height} Title={props.Title}>{props.Controls}</GraphError>;

    const barWidth = data == null || data.Series.length === 0 ? 0 : data.BinWidth * 0.9 / data.Series.length;
    const maxPercentage = Math.max(1, ...(data?.Series.flatMap(series => series.Percentages) ?? []));

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
                defaultYdomain={[[0, maxPercentage], [0, 100]]}
                XAxisType="value"
                onSelect={props.OnSelect}
                onCapture={captureCallback}
                onCaptureComplete={() => captureCallback(0)}
                onDataInspect={graphStatus === 'idle' && data != null && enabledVisualizationCount > 0 ? exportCsv : undefined}
                cursorOverride={props.Cursor}
                snapMouse={trendDataSettings.MarkerSnapping}
                legend={trendDataSettings.LegendDisplay}
                useMetricFactors={props.Metric ?? false}
                holdMenuOpen={!trendDataSettings.StartWithOptionsClosed}
                limitZoom={true}
                Tlabel={props.XAxisLabel}
                Ylabel={[props.YLeftLabel, props.YRightLabel]}
                showMouse={props.MouseHighlight}
                yDomain={props.AxisZoom}
            >
                {data?.Series.map((series, seriesIndex) =>
                    <BarGroup
                        key={series.ID}
                        Legend={series.Label}
                        Enabled={series.Settings.Enabled ?? true}
                        SetEnabled={enabled => setHistogramEnabled(series.ChannelID, series.SeriesKey, 'Enabled', enabled)}
                    >
                        {series.Percentages.map((percentage, binIndex) =>
                            <Bar
                                key={`${series.ID}_${binIndex}`}
                                Data={[0, percentage]}
                                BarOrigin={data.Domain[0] + binIndex * data.BinWidth + data.BinWidth * 0.05 + seriesIndex * barWidth}
                                BarWidth={barWidth}
                                Color={series.Color}
                                Axis="left"
                            />
                        )}
                    </BarGroup>
                )}
                {data?.Series.filter(series => series.Settings.ShowCumulativeProbability ?? true).map(series =>
                    <Line
                        key={`${series.ID}_cumulative`}
                        highlightHover={false}
                        autoShowPoints={false}
                        lineStyle={series.Settings.Type}
                        color={series.Settings.CumulativeProbabilityColor ?? series.Color}
                        data={getCumulativeProbability(series.Percentages, data.Domain[0], data.BinWidth)}
                        legend={series.Settings.CumulativeProbabilityLabel ?? `${series.Label} Cumulative Probability`}
                        axis="right"
                        width={series.Settings.Width}
                        enabled={series.Settings.CumulativeProbabilityEnabled ?? true}
                        setEnabled={enabled => setHistogramEnabled(series.ChannelID, series.SeriesKey, 'CumulativeProbabilityEnabled', enabled)}
                    />
                )}
                {props.Overlays}
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
 * Each returned series contains the percentage of its finite samples falling into each bin.
 */
const buildHistogramData = (points?: TrendSearch.IPQData[] | null, channelInfo?: TrendSearch.ISeriesSettings[] | null,
    plotFilter?: IMultiCheckboxOption[] | null): IHistogramBinnedData | null => {
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
        const settings = channel.Settings as TrendSearch.IHistogramSeriesSettings | null | undefined;
        return plottedSeries.flatMap(type => {
            const seriesSetting = settings?.[type];
            if (seriesSetting == null) return [];
            const counts = Array<number>(binCount).fill(0);
            const values = channelPoints.map(point => point[type]).filter(Number.isFinite);
            values.forEach(value => {
                const bin = Math.min(binCount - 1, Math.floor((value - minimum) / binWidth));
                counts[Math.max(0, bin)] += 1;
            });
            return {
                ID: `${channel.Channel.ID}_${type}`,
                ChannelID: channel.Channel.ID,
                SeriesKey: type,
                Percentages: values.length === 0 ? counts : counts.map(count => 100 * count / values.length)
            };
        });
    });

    return { BinWidth: binWidth, Domain: [minimum, maximum], Series: series };
};

/** Applies current labels, colors, and visibility without rebuilding histogram bins. */
const applyHistogramSettings = (data?: IHistogramBinnedData | null,
    channelInfo?: TrendSearch.ISeriesSettings[] | null): IHistogramData | null => {
    if (data == null) return null;
    const series = data.Series.flatMap(binnedSeries => {
        const channel = (channelInfo ?? []).find(channel => channel.Channel?.ID === binnedSeries.ChannelID);
        const settings = (channel?.Settings as TrendSearch.IHistogramSeriesSettings | undefined)?.[binnedSeries.SeriesKey];
        if (settings == null) return [];
        return [{ ...binnedSeries, Color: settings.Color, Label: settings.Label, Settings: settings }];
    });
    return { ...data, Series: series };
};

/** Builds a memoization key from bin-affecting settings so display-only changes do not rebuild histogram bins. */
const getHistogramBinningKey = (channelInfo?: TrendSearch.ISeriesSettings[] | null,
    plotFilter?: IMultiCheckboxOption[] | null): string => {
    const channels = (channelInfo ?? []).filter(hasChannel).map(channel => {
        const settings = channel.Settings as TrendSearch.IHistogramSeriesSettings;
        const configuredSeries = seriesTypes.filter(type => settings?.[type] != null).join(',');
        return `${channel.Channel.ID}:${configuredSeries}`;
    }).join('|');
    return `${channels};${getSeriesPlotted(plotFilter).join(',')}`;
};

/** Returns an empirical cumulative distribution at each histogram bin boundary. */
const getCumulativeProbability = (percentages: number[], minimum: number, binWidth: number): [number, number][] => {
    let cumulative = 0;
    return [[minimum, 0] as [number, number]].concat(percentages.map((percentage, index) => {
        cumulative += percentage;
        return [minimum + (index + 1) * binWidth, cumulative];
    }));
};

/** Builds CSV rows from the shared bins and series values displayed by the histogram. */
export const buildHistogramCsvRows = (data: IHistogramData): CsvRow[] => {
    const barSeries = data.Series.filter(series => series.Settings.Enabled ?? true);
    const cumulativeSeries = data.Series.filter(series =>
        (series.Settings.ShowCumulativeProbability ?? true) && (series.Settings.CumulativeProbabilityEnabled ?? true)
    );
    const cumulativeValues = cumulativeSeries.map(series =>
        getCumulativeProbability(series.Percentages, data.Domain[0], data.BinWidth).slice(1).map(point => point[1])
    );
    return [
        [
            'Bin Start',
            'Bin End',
            ...barSeries.map(series => series.Label),
            ...cumulativeSeries.map(series => series.Settings.CumulativeProbabilityLabel ?? `${series.Label} Cumulative Probability`)
        ],
        ...Array.from({ length: binCount }, (_, binIndex) => [
            data.Domain[0] + binIndex * data.BinWidth,
            data.Domain[0] + (binIndex + 1) * data.BinWidth,
            ...barSeries.map(series => series.Percentages[binIndex]),
            ...cumulativeValues.map(values => values[binIndex])
        ])
    ];
};

export { Histogram };
