//******************************************************************************************************
//  LineGraph.tsx - Gbtc
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
//  04/18/23 - Gabriel Santos
//       Generated original version of source code.
//
//******************************************************************************************************
import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import { IMultiCheckboxOption, SEBrowser, TrendSearch } from '../../../global';
import { SelectTrendDataSettings, SelectGeneralSettings } from './../../SettingsSlice';
import { useAppSelector } from './../../../hooks';
import GraphError from './GraphError';
import { Application } from '@gpa-gemstone/application-typings';
import { LoadingIcon, ToolTip } from '@gpa-gemstone/react-interactive';
import { Line, Plot } from '@gpa-gemstone/react-graph';
import { Warning } from '@gpa-gemstone/gpa-symbols';

interface IProps {
    ID: string,
    TimeFilter: SEBrowser.IReportTimeFilter,
    ChannelInfo: TrendSearch.ILineSeries[],
    SetChannelInfo: (newSettings: TrendSearch.ILineSeries[]) => void,
    PlotFilter: IMultiCheckboxOption[],
    Height: number,
    Width: number,
    OnSelect: (time: number, values: number[]) => void,
    SetExtraSpace: (extra: number) => void,
    Title?: string,
    Metric?: boolean,
    XAxisLabel?: string,
    YLeftLabel?: string,
    YRightLabel?: string,
    Cursor?: string,
    MouseHighlight: 'none' | 'horizontal' | 'vertical',
    AxisZoom?: 'Manual' | 'AutoValue' | 'HalfAutoValue',
    DefaultZoom?: [number, number][]
    AlwaysRender: React.ReactNode,
    children: React.ReactNode
}

interface IChartData {
    MinSeries: [number, number][],
    MaxSeries: [number, number][],
    AvgSeries: [number, number][]
}

// TODO: These can be in a shared place with eventSearchBar
function formatWindowUnit(i: number) {
    if (i == 7)
        return "years";
    if (i == 6)
        return "months";
    if (i == 5)
        return "weeks";
    if (i == 4)
        return "days";
    if (i == 3)
        return "hours";
    if (i == 2)
        return "minutes";
    if (i == 1)
        return "seconds";
    return "milliseconds";
}

// Formats that will be used for dateBoxes
const timeFilterFormat = "MM/DD/YYYYHH:mm:ss.SSS";
const serverFormat = "YYYY-MM-DD[T]HH:mm:ss.SSSZ";

const LineGraph = React.memo((props: IProps) => {
    // Graph Consts
    const [timeLimits, setTimeLimits] = React.useState<[number, number]>([0, 1]);
    const [displayMin, setDisplayMin] = React.useState<boolean>(true);
    const [displayMax, setDisplayMax] = React.useState<boolean>(true);
    const [displayAvg, setDisplayAvg] = React.useState<boolean>(true);
    const [hover, setHover] = React.useState<boolean>(false);
    const [allChartData, setAllChartData] = React.useState<Map<string, IChartData>>(new Map<string, IChartData>());
    const [graphStatus, setGraphStatus] = React.useState<Application.Types.Status>('unintiated');
    // Height mangement
    const [titleHeight, setTitleHeight] = React.useState<number>(0);
    const [plotHeight, setPlotHeight] = React.useState<number>(props.Height);
    const [extraLegendHeight, setExtraLegendHeight] = React.useState<number>(0);
    const titleRef = React.useRef(null);
    const oldValues = React.useRef<{ ChannelInfo: TrendSearch.ILineSeries[], TimeFilter: SEBrowser.IReportTimeFilter }>({ ChannelInfo: [], TimeFilter: null });
    const trendDatasettings = useAppSelector(SelectTrendDataSettings);
    const generalSettings = useAppSelector(SelectGeneralSettings);

    React.useLayoutEffect(() => setTitleHeight(titleRef?.current?.offsetHeight ?? 0));

    React.useEffect(() => {
        if (props.ChannelInfo == null || props.TimeFilter == null) return;
        const centerTime: moment.Moment = moment(props.TimeFilter.date + props.TimeFilter.time, timeFilterFormat);
        const startTime: string = centerTime.add(-props.TimeFilter.windowSize, formatWindowUnit(props.TimeFilter.timeWindowUnits)).format(serverFormat);
        // Need to move back in the other direction, so entire window
        const endTime: string = centerTime.add(2 * props.TimeFilter.windowSize, formatWindowUnit(props.TimeFilter.timeWindowUnits)).format(serverFormat);

        let newChannels: number[] = props.ChannelInfo.map(chan => chan.Channel.ID);
        let keptOldData: Map<string, IChartData> = new Map<string, IChartData>();
        // If the time filter is the same, we only need to ask for information on channels we have not yet seen
        if (_.isEqual(props.TimeFilter, oldValues.current.TimeFilter)) {
            newChannels = newChannels.filter(channel => oldValues.current.ChannelInfo.findIndex(oldChannel => oldChannel.Channel.ID === channel) === -1);
            // This represents data we already have and still need (only makes sense if we aren't changing our time window)
            keptOldData = allChartData;
            keptOldData.forEach((data, channelID) => {
                if (props.ChannelInfo.findIndex(channel => channel.Channel.ID === Number("0x" + channelID)) < 0)
                    keptOldData.delete(channelID);
            }
            );
            // If this condition is satified, it must mean we removed channels, and thus, only need to remove irrelevant data (settings handled in Trendplot)
            if (newChannels.length === 0) {
                setAllChartData(keptOldData);
                oldValues.current = { ChannelInfo: props.ChannelInfo, TimeFilter: props.TimeFilter };
                return;
            }
        }
        const handle = GetTrendData(newChannels, keptOldData, startTime, endTime);
        return () => {
            if (handle != null && handle.abort != null) handle.abort();
        };
    }, [props.ChannelInfo, props.TimeFilter]);

    React.useEffect(() => {
        setDisplayMin(props.PlotFilter.find(element => element.Value === "min")?.Selected ?? false);
        setDisplayMax(props.PlotFilter.find(element => element.Value === "max")?.Selected ?? false);
        setDisplayAvg(props.PlotFilter.find(element => element.Value === "avg")?.Selected ?? false);
    }, [props.PlotFilter]);

    React.useEffect(() => {
        const centerTime: moment.Moment = moment.utc(props.TimeFilter.date + props.TimeFilter.time, timeFilterFormat);
        const startTime: number = centerTime.add(-props.TimeFilter.windowSize, formatWindowUnit(props.TimeFilter.timeWindowUnits)).valueOf();
        // Need to move back in the other direction, so entire window
        const endTime: number = centerTime.add(2 * props.TimeFilter.windowSize, formatWindowUnit(props.TimeFilter.timeWindowUnits)).valueOf();
        setTimeLimits([startTime, endTime]);
    }, [props.TimeFilter]);

    React.useEffect(() => {
        setPlotHeight(props.Height - titleHeight - 5);
    }, [props.Height, titleHeight]);

    const captureCallback = React.useCallback((extraLegendHeight: number) => {
        props.SetExtraSpace(extraLegendHeight);
        setExtraLegendHeight(extraLegendHeight)
        return props.ID;
    }, [props.ID, setExtraLegendHeight, props.SetExtraSpace]);

    function GetTrendData(channels: number[], cachedData: Map<string, IChartData>, startTime: string, endTime: string): JQuery.jqXHR<TrendSearch.IPQData> {
        setGraphStatus('loading');
        return $.ajax({
            type: "POST",
            url: `${homePath}api/OpenXDA/GetLineChartData`,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({
                Channels: channels,
                StartTime: startTime,
                StopTime: endTime
            }),
            dataType: 'text',
            cache: false,
            async: true
        }).done((data: string) => {
            const newPoints: string[] = data.split("\n");
            newPoints.forEach(jsonPoint => {
                let point: TrendSearch.IPQData = undefined;
                try {
                    if (jsonPoint !== "") point = JSON.parse(jsonPoint);
                }
                catch {
                    console.error("Failed to parse point: " + jsonPoint);
                }
                if (point !== undefined) {
                    const timeStamp = moment.utc(point.Timestamp, serverFormat).valueOf();
                    if (cachedData.has(point.Tag)) {
                        const chartData = cachedData.get(point.Tag);
                        chartData.MinSeries.push([timeStamp, point.Minimum]);
                        chartData.AvgSeries.push([timeStamp, point.Average]);
                        chartData.MaxSeries.push([timeStamp, point.Maximum]);
                    } else {
                        const chartData: IChartData = {
                            MinSeries: [[timeStamp, point.Minimum]],
                            AvgSeries: [[timeStamp, point.Minimum]],
                            MaxSeries: [[timeStamp, point.Minimum]]
                        }
                        cachedData.set(point.Tag, chartData);
                    }
                }
            });
            setAllChartData(cachedData);
            oldValues.current = { ChannelInfo: props.ChannelInfo, TimeFilter: props.TimeFilter };
            //// Set settings on which don't have data
            const newchannelinfo = [...props.ChannelInfo];
            newchannelinfo.forEach((setting, index) => {
                // All tags from hids is exactly 8 characters long, need to reconstruct tag for matching
                let channelID = setting.Channel.ID.toString(16);
                channelID = "0".repeat(8 - channelID.length) + channelID;
                const channeldata = cachedData.get(channelID);
                const newsetting = _.cloneDeep(setting);
                if (channeldata === undefined) {
                    newsetting.Min.HasData = false;
                    newsetting.Avg.HasData = true; // ToDo: Needed to display warning, perhaps we should change the name of this var to show?
                    newsetting.Max.HasData = false;
                    newchannelinfo[index] = newsetting;
                } else {
                    newsetting.Min.HasData = channeldata.MinSeries.length !== 0;
                    newsetting.Avg.HasData = true;
                    newsetting.Max.HasData = channeldata.MaxSeries.length !== 0;
                    newchannelinfo[index] = newsetting;
                }
            });
            props.SetChannelInfo(newchannelinfo);
            setGraphStatus('idle');
        }).fail(() => {
            setGraphStatus('error');
        });
    }

    if (graphStatus === 'error')
        return (
            <GraphError Height={props.Height} Title={props.Title}>
                {props.AlwaysRender}
            </GraphError>
        );
    else
        return (
            <div className="row">
                <LoadingIcon Show={graphStatus === 'loading' || graphStatus === 'unintiated'} Size={29} />
                <h4 ref={titleRef} style={{ textAlign: "center", width: `${props.Width}px`, marginBottom: '0px' }}>
                    {props?.Title ?? ''}
                    {props?.ChannelInfo == null || props.ChannelInfo.findIndex(info => !(info.Min.HasData || info.Max.HasData || info.Avg.HasData)) != -1 ?
                        <span data-tooltip={props.ID} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>{Warning}</span>
                        : null
                    }
                </h4>
                <Plot height={plotHeight} width={props.Width} legendHeight={plotHeight / 2 + extraLegendHeight} legendWidth={props.Width / 2} menuLocation={generalSettings.MoveOptionsLeft ? 'left' : 'right'}
                    defaultTdomain={timeLimits} onSelect={props.OnSelect} onCapture={captureCallback} onCaptureComplete={() => captureCallback(0)} cursorOverride={props.Cursor} snapMouse={trendDatasettings.MarkerSnapping}
                    legend={trendDatasettings.LegendDisplay} useMetricFactors={props.Metric ?? false} holdMenuOpen={!trendDatasettings.StartWithOptionsClosed} showDateOnTimeAxis={false} limitZoom={true}
                    Tlabel={props.XAxisLabel} Ylabel={[props.YLeftLabel, props.YRightLabel]} showMouse={props.MouseHighlight} yDomain={props.AxisZoom} defaultYdomain={props.DefaultZoom}>
                    {props?.ChannelInfo == null ? null : props.ChannelInfo.map((series, index) => {
                        const lineArray: JSX.Element[] = [];
                        const channelSetting: TrendSearch.ILineSeries = props.ChannelInfo.find((channel) => channel.Channel.ID === series.Channel.ID);
                        const dataKey = [...allChartData.keys()].find(key => series.Channel.ID === Number("0x" + key))
                        const chartData = allChartData.get(dataKey);
                        if (channelSetting === undefined) return null;
                        if (displayMin && channelSetting.Min.HasData)
                            lineArray.push(<Line highlightHover={false} key={"min_" + index} autoShowPoints={generalSettings.ShowDataPoints} lineStyle={channelSetting.Min.Type}
                                color={channelSetting.Min.Color} data={chartData.MinSeries} legend={channelSetting.Min.Label} axis={channelSetting.Min.Axis} width={channelSetting.Min.Width} />);
                        if (displayAvg && channelSetting.Avg.HasData)
                            lineArray.push(<Line highlightHover={false} key={"avg_" + index} autoShowPoints={generalSettings.ShowDataPoints} lineStyle={channelSetting.Avg.Type}
                                color={channelSetting.Avg.Color} data={chartData?.AvgSeries} legend={channelSetting.Avg.Label} axis={channelSetting.Avg.Axis} width={channelSetting.Avg.Width} />);
                        if (displayMax && channelSetting.Max.HasData)
                            lineArray.push(<Line highlightHover={false} key={"max_" + index} autoShowPoints={generalSettings.ShowDataPoints} lineStyle={channelSetting.Max.Type}
                                color={channelSetting.Max.Color} data={chartData.MaxSeries} legend={channelSetting.Max.Label} axis={channelSetting.Max.Axis} width={channelSetting.Max.Width} />);
                        return lineArray;
                    })}
                    {props.children}
                    {props.AlwaysRender}
                </Plot>
                <ToolTip Show={hover} Position={'bottom'} Theme={'dark'} Target={props.ID}>
                    Some of the selected Channels have no Data for the selected Time Window.
                </ToolTip>
            </div>);
});

export { LineGraph };