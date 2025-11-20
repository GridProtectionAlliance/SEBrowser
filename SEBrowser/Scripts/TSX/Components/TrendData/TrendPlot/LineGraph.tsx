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
import { IMultiCheckboxOption, SEBrowser, TrendSearch } from '../../../Global';
import { SelectTrendDataSettings, SelectGeneralSettings } from '../../../Store/SettingsSlice';
import { useAppSelector } from './../../../hooks';
import GraphError from './GraphError';
import { Application } from '@gpa-gemstone/application-typings';
import { LoadingIcon, ToolTip } from '@gpa-gemstone/react-interactive';
import { Line, Plot } from '@gpa-gemstone/react-graph';
import { ReactIcons } from '@gpa-gemstone/gpa-symbols';

interface IProps {
    ID: string,
    TimeFilter: SEBrowser.IReportTimeFilter,
    ChannelInfo: TrendSearch.ISeriesSettings[],
    SetChannelInfo: (newSettings: TrendSearch.ISeriesSettings[]) => void,
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
    [key: string]: [number, number][]
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
    const [hover, setHover] = React.useState<boolean>(false);
    const [allChartData, setAllChartData] = React.useState<Map<string,IChartData>>(new Map<string,IChartData>());
    const [graphStatus, setGraphStatus] = React.useState<Application.Types.Status>('uninitiated');
    // Height mangement
    const [titleHeight, setTitleHeight] = React.useState<number>(0);
    const [plotHeight, setPlotHeight] = React.useState<number>(props.Height);
    const [extraLegendHeight, setExtraLegendHeight] = React.useState<number>(0);
    const titleRef = React.useRef(null);
    const oldValues = React.useRef<{ ChannelInfo: TrendSearch.ISeriesSettings[], TimeFilter: SEBrowser.IReportTimeFilter }>({ ChannelInfo: [], TimeFilter: null });
    const trendDatasettings = useAppSelector(SelectTrendDataSettings);
    const generalSettings = useAppSelector(SelectGeneralSettings);

    React.useLayoutEffect(() => setTitleHeight(titleRef?.current?.offsetHeight ?? 0));

    React.useEffect(() => {
        if (props.ChannelInfo == null || props.TimeFilter == null) return;
        const centerTime: moment.Moment = moment(props.TimeFilter.date + props.TimeFilter.time, timeFilterFormat);
        const startTime: string = centerTime.add(-props.TimeFilter.windowSize, formatWindowUnit(props.TimeFilter.timeWindowUnits)).format(serverFormat);
        // Need to move back in the other direction, so entire window
        const endTime: string = centerTime.add(2 * props.TimeFilter.windowSize, formatWindowUnit(props.TimeFilter.timeWindowUnits)).format(serverFormat);

        let newChannels: number[] = _.uniq(props.ChannelInfo.map(chan => chan.Channel.ChannelID));
        let keptOldData: Map<string,IChartData> = new Map<string,IChartData>();
        // If the time filter is the same, we only need to ask for information on channels we have not yet seen
        if (_.isEqual(props.TimeFilter, oldValues.current.TimeFilter)) {
            newChannels = newChannels.filter(channel => oldValues.current.ChannelInfo.findIndex(oldChannel => oldChannel.Channel.ChannelID === channel) === -1);
            // This represents data we already have and still need (only makes sense if we aren't changing our time window)
            keptOldData = allChartData;
            keptOldData.forEach((_, channelID) => {
                if (props.ChannelInfo.findIndex(channel => channel.Channel.ChannelID === Number("0x"+channelID)) < 0)
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
                    // Todo: Handle alternate Series Types
                    if (cachedData.has(point.Tag)) {
                        const chartData = cachedData.get(point.Tag);
                        chartData.Minimum.push([timeStamp, point.Minimum]);
                        chartData.Average.push([timeStamp, point.Average]);
                        chartData.Maximum.push([timeStamp, point.Maximum]);
                    } else {
                        const chartData: IChartData = {
                            Minimum: [[timeStamp, point.Minimum]],
                            Average: [[timeStamp, point.Average]],
                            Maximum: [[timeStamp, point.Maximum]]
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
                let channelID = setting.Channel.ChannelID.toString(16);
                channelID = "0".repeat(8 - channelID.length) + channelID;
                const channeldata = cachedData.get(channelID);
                const newSettings = _.cloneDeep(setting.Settings) as TrendSearch.ILineSeriesSettings;
                Object.keys(newSettings).forEach(key => {
                    // Hide all if no data
                    if (channeldata == null) newSettings[key].HasData = false;
                    // Hide min/max if no data
                    else if (key === "Minimum" || key === "Maximum") newSettings[key].HasData = channeldata[key].length !== 0;
                    // Show all others (any strange keys should default to showing average)
                    else newSettings[key].HasData = true;
                });
                newchannelinfo[index].Settings = newSettings;
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
                <LoadingIcon Show={graphStatus === 'loading' || graphStatus === 'uninitiated'} Size={29} />
                <h4 ref={titleRef} style={{ textAlign: "center", width: `${props.Width}px`, marginBottom: '0px'}}>
                    {props?.Title ?? ''}
                    {props?.ChannelInfo == null || props.ChannelInfo.findIndex(info => Object.keys(info.Settings).some(key => !info.Settings[key].HasData)) != -1 ?
                        <span data-tooltip={props.ID} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}><ReactIcons.Warning Color="var(--warning)" /></span>
                        : null
                    }
                </h4>
                <Plot height={plotHeight} width={props.Width} legendHeight={plotHeight / 2 + extraLegendHeight} legendWidth={props.Width / 2} menuLocation={generalSettings.MoveOptionsLeft ? 'left' : 'right'}
                    defaultTdomain={timeLimits} onSelect={props.OnSelect} onCapture={captureCallback} onCaptureComplete={() => captureCallback(0)} cursorOverride={props.Cursor} snapMouse={trendDatasettings.MarkerSnapping}
                    legend={trendDatasettings.LegendDisplay} useMetricFactors={props.Metric ?? false} holdMenuOpen={!trendDatasettings.StartWithOptionsClosed} showDateOnTimeAxis={false} limitZoom={true}
                    Tlabel={props.XAxisLabel} Ylabel={[props.YLeftLabel, props.YRightLabel]} showMouse={props.MouseHighlight} yDomain={props.AxisZoom} defaultYdomain={props.DefaultZoom}>
                    {props?.ChannelInfo == null ? null : props.ChannelInfo.map((series, index) => {
                        const lineArray: JSX.Element[] = [];
                        const channelSetting = props.ChannelInfo.find((channel) => channel.Channel.ID === series.Channel.ID)?.Settings as TrendSearch.ILineSeriesSettings;
                        const dataKey = [...allChartData.keys()].find(key => series.Channel.ChannelID === Number("0x" + key));
                        const chartData = allChartData.get(dataKey);
                        if (channelSetting == null || chartData == null) return null;
                        Object.keys(chartData).forEach(key => {
                            if ((channelSetting?.[key]?.HasData ?? false) && (props.PlotFilter.find(element => element.Value === key)?.Selected ?? true)) {
                                const dataKey = chartData?.[key] == null ? "Average" : key;
                                lineArray.push(<Line highlightHover={false} key={`${key}_${index}`} autoShowPoints={generalSettings.ShowDataPoints} lineStyle={channelSetting[key].Type}
                                    color={channelSetting[key].Color} data={chartData[dataKey]} legend={channelSetting[key].Label} axis={channelSetting[key].Axis} width={channelSetting[key].Width} />);

                            }
                        });
                        return lineArray;
                    })}
                    {props.children}
                    {props.AlwaysRender}
                </Plot>
                <ToolTip Show={hover} Position={'bottom'} Target={props.ID}>
                    Some of the selected Channels have no Data for the selected Time Window.
                </ToolTip>
            </div>);
});

export { LineGraph };