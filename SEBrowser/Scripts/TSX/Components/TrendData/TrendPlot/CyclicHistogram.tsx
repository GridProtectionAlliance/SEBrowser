//******************************************************************************************************
//  CyclicHistogram.tsx - Gbtc
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
//  09/06/23 - G. Santos
//       Generated original version of source code.
//
//******************************************************************************************************
import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import { SEBrowser, TrendSearch } from '../../../global';
import { SelectTrendDataSettings, SelectGeneralSettings } from '../../../Store/SettingsSlice';
import { useAppSelector } from './../../../hooks';
import GraphError from './GraphError';
import { Application } from '@gpa-gemstone/application-typings';
import { LoadingIcon } from '@gpa-gemstone/react-interactive';
import { HeatMapChart, Plot } from '@gpa-gemstone/react-graph';
import { HexToHsv, useGetContainerPosition } from '@gpa-gemstone/helper-functions';
import { Warning } from '@gpa-gemstone/gpa-symbols';
import { ToolTip } from '@gpa-gemstone/react-forms';
import type { ITrendWidgetProps } from './TrendWidgetRegistry';
import { serverFormat } from '../Utils/Constants';
import { getTrendTimeWindow } from '../Utils/TrendDataRequest';

interface IChartData {
    TimeSpan: number,
    BinSize: number,
    Series: [number, number, number][]
}

const CyclicHistogram = React.memo((props: ITrendWidgetProps) => {
    const channelInfo = props.ChannelInfo?.[0] ?? null;
    // Graph Consts
    const [timeLimits, setTimeLimits] = React.useState<[number, number]>([0, 1]);
    const [chartData, setChartData] = React.useState<IChartData | null>(null);
    const [graphStatus, setGraphStatus] = React.useState<Application.Types.Status>('uninitiated');
    const [hover, setHover] = React.useState<boolean>(false);
    const [barColor, setBarColor] = React.useState<{ Hue: number, Saturation: number } | null>(null);
    const [metaData, setMetaData] = React.useState<TrendSearch.IMetaData[] | null>(null);
    // Height mangement
    const [plotHeight, setPlotHeight] = React.useState<number>(props.Height);
    const [extraLegendHeight, setExtraLegendHeight] = React.useState<number>(0);
    const titleRef = React.useRef(null);
    const { offsetHeight: titleHeight } = useGetContainerPosition(titleRef);
    const oldValues = React.useRef<{ ChannelInfo: TrendSearch.ISeriesSettings | null, TimeFilter: SEBrowser.IReportTimeFilter | null }>({ ChannelInfo: null, TimeFilter: null });
    const trendDatasettings = useAppSelector(SelectTrendDataSettings);
    const generalSettings = useAppSelector(SelectGeneralSettings);

    React.useEffect(() => {
        if (channelInfo == null || props.TimeFilter == null) return;
        if (_.isEqual(props.TimeFilter, oldValues.current.TimeFilter) && channelInfo.Channel.ID === oldValues.current.ChannelInfo.Channel.ID) return;

        const timeWindow = getTrendTimeWindow(props.TimeFilter);
        const startTime = timeWindow.startTime.format(serverFormat);
        const endTime = timeWindow.endTime.format(serverFormat);

        const handle = GetMetaData(channelInfo.Channel.ChannelID, startTime, endTime);
        return () => {
            if (handle != null && handle.abort != null) handle.abort();
        };
    }, [channelInfo, props.TimeFilter]);

    React.useEffect(() => {
        if (metaData == null) return;
        if (metaData.length === 0) {
            setChartData(null);
            setGraphStatus('idle');
            return;
        }
        const newSeriesData: IChartData[] = Array<IChartData>(metaData.length);
        // Get all handles for all meta data
        const allHandles = metaData.map((metaData, index) => GetData(metaData, "Cyclic", newSeriesData, index));
        Promise.all(allHandles).then(() => {
            const concatSeries = newSeriesData[0];
            newSeriesData.forEach((data, index) => {
                if (index !== 0) {
                    concatSeries.Series = concatSeries.Series.concat(data.Series);
                    if (concatSeries.BinSize !== data.BinSize)
                        console.warn(`Different bin sizes detected for meta datas ${metaData[0]}, ${metaData[index]}`);
                    if (concatSeries.TimeSpan !== data.TimeSpan)
                        console.warn(`Different bin sizes detected for meta datas ${metaData[0]}, ${metaData[index]}`);
                }
            });
            setChartData(concatSeries);
            setGraphStatus('idle');
        });
    }, [metaData]);

    React.useEffect(() => {
        const timeWindow = getTrendTimeWindow(props.TimeFilter);
        setTimeLimits([timeWindow.startTime.valueOf(), timeWindow.endTime.valueOf()]);
    }, [props.TimeFilter]);

    React.useEffect(() => {
        if (channelInfo?.Settings?.Color == null) return;
        const color = HexToHsv(channelInfo.Settings.Color as string);
        setBarColor({ Hue: color.h, Saturation: color.s })
    }, [channelInfo?.Settings?.Color]);

    React.useEffect(() => {
        setPlotHeight(props.Height - titleHeight - 5);
    }, [props.Height, titleHeight]);

    const captureCallback = React.useCallback((extraLegendHeight: number) => {
        props.SetExtraSpace(extraLegendHeight);
        setExtraLegendHeight(extraLegendHeight)
        return props.ID;
    }, [props.ID, setExtraLegendHeight, props.SetExtraSpace]);

    function GetMetaData(channel: number, startTime: string, endTime: string): JQuery.jqXHR {
        setGraphStatus('loading');
        return $.ajax({
            type: "POST",
            url: `${homePath}api/OpenXDA/GetMetaData`,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({
                Channels: [channel],
                StartTime: startTime,
                StopTime: endTime
            }),
            dataType: 'text',
            cache: false,
            async: true
        }).done((data: string) => {
            const newMetaData: TrendSearch.IMetaData[] = [];
            const metaList: TrendSearch.IMetaData[] = JSON.parse(data);
            metaList.forEach(metaData => {
                if (metaData.ChannelID !== channel)
                    console.error("Server returned meta data that does not match channel requested: " + metaData);
                else newMetaData.push(metaData);
            });
            oldValues.current = { ChannelInfo: channelInfo, TimeFilter: props.TimeFilter };
            setMetaData(_.orderBy(newMetaData, ['StartTime'], ['asc']));
        }).fail(() => setGraphStatus('error'));
    }

    function GetData(metaData: TrendSearch.IMetaData, type: "Cyclic", populateArray: IChartData[], arrayIndex: number): JQuery.jqXHR<IChartData> {
        return $.ajax({
            type: "POST",
            url: `${homePath}api/OpenXDA/GetChartData/${type}`,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({
                Channel: metaData.ChannelID,
                Timestamp: metaData.StartTime
            }),
            dataType: 'json',
            cache: false,
            async: true
        }).done((data: TrendSearch.ICyclicData[]) => {
            const startTicks = moment.utc(metaData.StartTime, serverFormat).valueOf();
            const ticksPerIndex = (moment.utc(metaData.EndTime, serverFormat).valueOf() - startTicks) /
                ((metaData.SamplingRate / metaData.FundamentalFrequency) + 1);
            const binSize = (metaData.CyclesMax - metaData.CyclesMin) / metaData.CyclicHistogramBins;
            const newChartData: IChartData = {
                Series: [],
                TimeSpan: ticksPerIndex,
                BinSize: binSize
            }
            newChartData.Series = data.map(dataPoint => [
                startTicks + dataPoint.Sample * ticksPerIndex,
                metaData.CyclesMin + binSize * dataPoint.Bin,
                dataPoint.Value * 100
            ]);
            populateArray[arrayIndex] = (newChartData);
        }).fail(() => setGraphStatus('error'));
    }

    if (graphStatus === 'error')
        return (
            <GraphError Height={props.Height} Title={props.Title}>
                {props.Controls}
            </GraphError>
        );
    else
        return (
            <div className="row">
                <LoadingIcon Show={graphStatus === 'loading' || graphStatus === 'uninitiated'} Size={29} />
                <h4 ref={titleRef} style={{ textAlign: "center", width: `${props.Width}px`, marginBottom: '0px' }}>
                    {props?.Title ?? ''}
                    {(chartData?.Series?.length == null || chartData.Series.length === 0) ?
                        <span data-tooltip={props.ID} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>{Warning}</span>
                        : null
                    }
                </h4>
                <Plot
                    height={plotHeight}
                    width={props.Width}
                    legendHeight={plotHeight / 2 + extraLegendHeight}
                    legendWidth={props.Width / 2}
                    menuLocation={generalSettings.MoveOptionsLeft ? 'left' : 'right'}
                    defaultTdomain={timeLimits}
                    onSelect={props.OnSelect}
                    onCapture={captureCallback}
                    onCaptureComplete={() => captureCallback(0)}
                    cursorOverride={props.Cursor}
                    snapMouse={trendDatasettings.MarkerSnapping}
                    legend={trendDatasettings.LegendDisplay}
                    useMetricFactors={props.Metric ?? false}
                    holdMenuOpen={!trendDatasettings.StartWithOptionsClosed}
                    showDateOnTimeAxis={false}
                    limitZoom={true}
                    Tlabel={props.XAxisLabel}
                    Ylabel={[props.YLeftLabel]}
                    showMouse={props.MouseHighlight}
                    yDomain={props.AxisZoom}
                    defaultYdomain={props.DefaultZoom}
                >
                    {(chartData?.Series?.length == null || chartData.Series.length === 0 || barColor === null) ? null :
                        <HeatMapChart
                            data={chartData.Series}
                            sampleMs={chartData.TimeSpan}
                            binSize={chartData.BinSize}
                            hue={barColor.Hue}
                            saturation={barColor.Saturation}
                            fillStyle={'fill'}
                            axis={'left'}
                            legendUnit={'%'}
                        />
                    }
                    {props.Overlays}
                    {props.Controls}
                </Plot>
                <ToolTip Show={hover} Position={'bottom'} Target={props.ID}>
                    Selected Channel has no Data for the selected Time Window.
                </ToolTip>
            </div>
        );
});

export { CyclicHistogram };
