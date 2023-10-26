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
import { SelectTrendDataSettings } from './../../SettingsSlice';
import { useAppSelector } from './../../../hooks';
import GraphError from './GraphError';
import { Application } from '@gpa-gemstone/application-typings';
import { LoadingIcon } from '@gpa-gemstone/react-interactive';
import { Line, Plot } from '@gpa-gemstone/react-graph';

interface IProps {
    TimeFilter: SEBrowser.IReportTimeFilter,
    ChannelInfo: ILineSeries[],
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
    AlwaysRender: React.ReactNode,
    children: React.ReactNode
}

interface ILineSeries{
    Channel: TrendSearch.ITrendChannel,
    AvgLineType?: TrendSearch.LineStyles,
    MinMaxLineType?: TrendSearch.LineStyles,
    RightAxis?: boolean,
    Label?: string,
    Color?: string,
    Width?: number
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
    const [allChartData, setAllChartData] = React.useState<IChartData[]>([]);
    const [graphStatus, setGraphStatus] = React.useState<Application.Types.Status>('unintiated');
    const [oldValues, setOldValues] = React.useState<{ ChannelInfo: ILineSeries[], TimeFilter: SEBrowser.IReportTimeFilter }>({ ChannelInfo: [], TimeFilter: null });
    const trendDatasettings = useAppSelector(SelectTrendDataSettings);

    React.useEffect(() => {
        if (props.ChannelInfo == null || props.TimeFilter == null) return;
        const centerTime: moment.Moment = moment(props.TimeFilter.date + props.TimeFilter.time, timeFilterFormat);
        const startTime: string = centerTime.add(-props.TimeFilter.windowSize, formatWindowUnit(props.TimeFilter.timeWindowUnits)).format(serverFormat);
        // Need to move back in the other direction, so entire window
        const endTime: string = centerTime.add(2 * props.TimeFilter.windowSize, formatWindowUnit(props.TimeFilter.timeWindowUnits)).format(serverFormat);

        // Need to figure out which channels we need info for
        let newChannels: number[] = props.ChannelInfo.map(chan => chan.Channel.ID);
        // If the time filter is the same, we only need to ask for information on channels we have not yet seen
        let oldCulledData: IChartData[] = [];
        if (_.isEqual(props.TimeFilter, oldValues.TimeFilter)) {
            newChannels = newChannels.filter(channel => oldValues.ChannelInfo.findIndex(oldChannel => oldChannel.Channel.ID === channel) === -1);
            // This represents data we already have and still need
            oldCulledData = allChartData.filter(oldSeries =>
                props.ChannelInfo.findIndex(channel => channel.Channel.ID === oldSeries.ChannelID) !== -1);
            // If this condition is satified, it must mean we removed channels, and thus, only need to remove irrelevant data
            if (newChannels.length === 0) {
                setAllChartData(oldCulledData);
                setOldValues({ ChannelInfo: props.ChannelInfo, TimeFilter: props.TimeFilter });
                return;
            }
        }
        const handle = GetTrendData(newChannels, startTime, endTime);
        handle.done((data: TrendSearch.IPQData[]) => {
            const newData: IChartData[] =
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
            setAllChartData(oldCulledData.concat(newData));
            setOldValues({ ChannelInfo: props.ChannelInfo, TimeFilter: props.TimeFilter });
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
            <div className="row" style={trendDatasettings.BorderPlots ? {border: "thin black solid"} : undefined}>
                <LoadingIcon Show={graphStatus === 'loading' || graphStatus === 'unintiated'} Size={29} />
                {props.Title !== undefined ? <h4 style={{ textAlign: "center", width: `${props.Width}px` }}>{props.Title}</h4> : null}
                <Plot height={props.Height - (props.Title !== undefined ? 34 : 5)} width={props.Width} showBorder={false}
                    defaultTdomain={timeLimits} onSelect={props.OnSelect} cursorOverride={props.Cursor}
                    legend={trendDatasettings.LegendDisplay} useMetricFactors={props.Metric} holdMenuOpen={true} showDateOnTimeAxis={true}
                    Tlabel={props.XAxisLabel} Ylabel={[props.YLeftLabel, props.YRightLabel]} showMouse={true}>
                    {allChartData.flatMap((chartData, index) => {
                        const lineArray: JSX.Element[] = [];
                        const channelSetting: ILineSeries = props.ChannelInfo.find((channel) => channel.Channel.ID === chartData.ChannelID);
                        const baseLabel: string = channelSetting?.Label ?? channelSetting?.Channel?.Name ?? "Unknown Channel";
                        const colorValue: string = channelSetting?.Color ?? "#E41000";
                        const axis = (channelSetting?.RightAxis ?? false) ? 'right' : 'left';
                        if (displayAvg && chartData.AvgSeries.length > 0)
                            lineArray.push(<Line highlightHover={false} key={"avg" + index} showPoints={false} lineStyle={channelSetting?.AvgLineType ?? '-'}
                                color={colorValue} data={chartData.AvgSeries} legend={baseLabel + " avg"} axis={axis} width={channelSetting?.Width} />);
                        if (displayMin && chartData.MinSeries.length > 0)
                            lineArray.push(<Line highlightHover={false} key={"min" + index} showPoints={false} lineStyle={channelSetting?.MinMaxLineType ?? ':'}
                                color={colorValue} data={chartData.MinSeries} legend={baseLabel + " min"} axis={axis} width={channelSetting?.Width} />);
                        if (displayMax && chartData.MaxSeries.length > 0)
                            lineArray.push(<Line highlightHover={false} key={"max" + index} showPoints={false} lineStyle={channelSetting?.MinMaxLineType ?? ':'}
                                color={colorValue} data={chartData.MaxSeries} legend={baseLabel + " max"} axis={axis} width={channelSetting?.Width} />);
                        return lineArray;
                    })}
                    {props.children}
                    {props.AlwaysRender}
                </Plot>
            </div>);
});

export { LineGraph, ILineSeries };