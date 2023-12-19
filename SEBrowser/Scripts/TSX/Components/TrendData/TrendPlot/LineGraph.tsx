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
import { SelectTrendDataSettings, SelectMoveOptionsLeftSetting } from './../../SettingsSlice';
import { useAppSelector } from './../../../hooks';
import GraphError from './GraphError';
import { Application } from '@gpa-gemstone/application-typings';
import { LoadingIcon, ToolTip } from '@gpa-gemstone/react-interactive';
import { Line, Plot } from '@gpa-gemstone/react-graph';
import { Warning } from '@gpa-gemstone/gpa-symbols';

interface IProps {
    ID: string,
    TimeFilter: SEBrowser.IReportTimeFilter,
    ChannelInfo: ILineSeries[],
    SetChannelInfo: (newSettings: ILineSeries[]) => void,
    PlotFilter: IMultiCheckboxOption[],
    Height: number,
    Width: number,
    OnSelect: (time: number, values: number[]) => void,
    Title?: string,
    Metric?: boolean,
    XAxisLabel?: string,
    YLeftLabel?: string,
    YRightLabel?: string,
    Cursor?: string,
    AxisZoom?: 'Rect' | 'AutoValue' | 'HalfAutoValue',
    DefaultZoom?: [number, number][]
    AlwaysRender: React.ReactNode,
    children: React.ReactNode
}

interface ILineSettings { Color: string, Width: number, Type: TrendSearch.LineStyles, Axis: 'right'|'left', Label: string, HasData: boolean }

// Exported Type
interface ILineSeries{
    Channel: TrendSearch.ITrendChannel,
    Min: ILineSettings,
    Max: ILineSettings,
    Avg: ILineSettings
}

interface IChartData {
    ChannelID: number,
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
    const [allChartData, setAllChartData] = React.useState<IChartData[]>([]);
    const [graphStatus, setGraphStatus] = React.useState<Application.Types.Status>('unintiated');
    const [oldValues, setOldValues] = React.useState<{ ChannelInfo: ILineSeries[], TimeFilter: SEBrowser.IReportTimeFilter }>({ ChannelInfo: [], TimeFilter: null });
    const trendDatasettings = useAppSelector(SelectTrendDataSettings);
    const moveLeft = useAppSelector(SelectMoveOptionsLeftSetting);

    React.useEffect(() => {
        if (props.ChannelInfo == null || props.TimeFilter == null) return;
        const centerTime: moment.Moment = moment(props.TimeFilter.date + props.TimeFilter.time, timeFilterFormat);
        const startTime: string = centerTime.add(-props.TimeFilter.windowSize, formatWindowUnit(props.TimeFilter.timeWindowUnits)).format(serverFormat);
        // Need to move back in the other direction, so entire window
        const endTime: string = centerTime.add(2 * props.TimeFilter.windowSize, formatWindowUnit(props.TimeFilter.timeWindowUnits)).format(serverFormat);

        let newChannels: number[] = props.ChannelInfo.map(chan => chan.Channel.ID);
        let keptOldData: IChartData[] = [];
        // If the time filter is the same, we only need to ask for information on channels we have not yet seen
        if (_.isEqual(props.TimeFilter, oldValues.TimeFilter)) {
            newChannels = newChannels.filter(channel => oldValues.ChannelInfo.findIndex(oldChannel => oldChannel.Channel.ID === channel) === -1);
            // This represents data we already have and still need (only makes sense if we aren't changing our time window)
            keptOldData = allChartData.filter(oldSeries =>
                props.ChannelInfo.findIndex(channel => channel.Channel.ID === oldSeries.ChannelID) !== -1);
            // If this condition is satified, it must mean we removed channels, and thus, only need to remove irrelevant data (settings handled in Trendplot)
            if (newChannels.length === 0) {
                setAllChartData(keptOldData);
                setOldValues({ ChannelInfo: props.ChannelInfo, TimeFilter: props.TimeFilter });
                return;
            }
        }
        const handle = GetTrendData(newChannels, startTime, endTime);
        handle.done((data: TrendSearch.IPQData[]) => {
            let newData: IChartData[] =
                data.map(channelInfo => {
                    const timeSeries = channelInfo.Points.map(dataPoint => moment.utc(dataPoint.Timestamp, serverFormat).valueOf());
                    const channelID = Number("0x" + channelInfo.ChannelID);
                    return ({
                        ChannelID: channelID,
                        MinSeries: channelInfo.Points.map((dataPoint, index) => [timeSeries[index], dataPoint.Minimum]),
                        MaxSeries: channelInfo.Points.map((dataPoint, index) => [timeSeries[index], dataPoint.Maximum]),
                        AvgSeries: channelInfo.Points.map((dataPoint, index) => [timeSeries[index], dataPoint.Average])
                    });
                });
            newData = newData.concat(keptOldData);
            setAllChartData(newData);
            setOldValues({ ChannelInfo: props.ChannelInfo, TimeFilter: props.TimeFilter });
            // Set settings on which don't have data
            const newChannelInfo = [...props.ChannelInfo];
            newChannelInfo.forEach((setting, index) => {
                const channelData = newData.find(data => data.ChannelID === setting.Channel.ID);
                const newSetting = _.cloneDeep(setting);
                if (channelData === undefined) {
                    newSetting.Min.HasData = false;
                    newSetting.Avg.HasData = false;
                    newSetting.Max.HasData = false;
                    newChannelInfo[index] = newSetting;
                } else {
                    newSetting.Min.HasData = channelData.MinSeries.length !== 0;
                    newSetting.Avg.HasData = channelData.AvgSeries.length !== 0;
                    newSetting.Max.HasData = channelData.MaxSeries.length !== 0;
                    newChannelInfo[index] = newSetting;
                }
            });
            props.SetChannelInfo(newChannelInfo);
        });
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
        const chartData: IChartData = allChartData.find(chartData => chartData.AvgSeries.length > 0);
        setTimeLimits(chartData === undefined ? [0, 1] : [chartData.AvgSeries[0][0], chartData.AvgSeries[chartData.AvgSeries.length - 1][0]]);
    }, [allChartData]);

    function GetTrendData(channels: number[], startTime: string, endTime: string): JQuery.jqXHR<TrendSearch.IPQData[]> {
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
            dataType: 'json',
            cache: false,
            async: true
        }).done(() => {
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
                {props.Title !== undefined ?
                    <h4 style={{ textAlign: "center", width: `${props.Width}px` }}>
                        {props.Title}
                        {props.ChannelInfo.findIndex(info => !(info.Min.HasData || info.Max.HasData || info.Avg.HasData)) != -1 ?
                            <span data-tooltip={props.ID} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>{Warning}</span>
                            : null
                        }
                    </h4> : null}
                <Plot height={props.Height - (props.Title !== undefined ? 34 : 5)} width={props.Width} moveMenuLeft={moveLeft} showDivCapture={true} divCaptureId={props.ID}
                    defaultTdomain={timeLimits} onSelect={props.OnSelect} cursorOverride={props.Cursor} snapMouse={trendDatasettings.MarkerSnapping} legendHeight={props.Height / 2 - 34} legendWidth={props.Width / 2}
                    legend={trendDatasettings.LegendDisplay} useMetricFactors={props.Metric} holdMenuOpen={!trendDatasettings.StartWithOptionsClosed} showDateOnTimeAxis={true}
                    Tlabel={props.XAxisLabel} Ylabel={[props.YLeftLabel, props.YRightLabel]} showMouse={true} zoomMode={props.AxisZoom} defaultYdomain={props.DefaultZoom}>
                    {allChartData.flatMap((chartData, index) => {
                        const lineArray: JSX.Element[] = [];
                        const channelSetting: ILineSeries = props.ChannelInfo.find((channel) => channel.Channel.ID === chartData.ChannelID);
                        if (channelSetting === undefined) return null;
                        if (displayAvg && channelSetting.Avg.HasData)
                            lineArray.push(<Line highlightHover={false} key={"avg_" + index} showPoints={false} lineStyle={channelSetting.Avg.Type}
                                color={channelSetting.Avg.Color} data={chartData.AvgSeries} legend={channelSetting.Avg.Label} axis={channelSetting.Avg.Axis} width={channelSetting.Avg.Width} />);
                        if (displayMin && channelSetting.Min.HasData)
                            lineArray.push(<Line highlightHover={false} key={"min_" + index} showPoints={false} lineStyle={channelSetting.Min.Type}
                                color={channelSetting.Min.Color} data={chartData.MinSeries} legend={channelSetting.Min.Label} axis={channelSetting.Min.Axis} width={channelSetting.Min.Width} />);
                        if (displayMax && channelSetting.Max.HasData)
                            lineArray.push(<Line highlightHover={false} key={"max_" + index} showPoints={false} lineStyle={channelSetting.Max.Type}
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

export { LineGraph, ILineSeries, ILineSettings };