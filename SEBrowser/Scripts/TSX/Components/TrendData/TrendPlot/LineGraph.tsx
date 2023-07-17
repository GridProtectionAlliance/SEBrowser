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
import { IMultiCheckboxOption, SEBrowser } from '../../../Global';
import { Application } from '@gpa-gemstone/application-typings';
import { LoadingIcon, ServerErrorIcon } from '@gpa-gemstone/react-interactive';
import { Button, Line, Plot } from '@gpa-gemstone/react-graph';

interface IProps {
    TimeFilter: SEBrowser.IReportTimeFilter,
    ChannelInfo: ILineSeries[],
    PlotFilter: IMultiCheckboxOption[],
    Height: number,
    Width: number,
    OnSelect: (time: number, value: number) => void,
    Title?: string,
    Metric?: boolean,
    XAxisLabel?: string,
    AlwaysRender: React.ReactNode,
    children: React.ReactNode
}

interface ILineSeries{
    Channel: SEBrowser.ITrendChannel,
    AvgLineType?: ':' | '-',
    MinMaxLineType?: ':' | '-',
    Label?: string,
    Color?: string
}

interface IChartData {
    ChannelID: number,
    MinSeries: [number, number][],
    MaxSeries: [number, number][],
    AvgSeries: [number, number][]
}

// Formats that will be used for dateBoxes
const timeFilterFormat = "MM/DD/YYYYhh:mm:ss.SSS";
const serverFormat = "YYYY-MM-DD[T]hh:mm:ss.SSS[Z]";

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

const LineGraph = React.memo((props: IProps) => {
    // Graph Consts
    const [timeLimits, setTimeLimits] = React.useState<[number, number]>([0, 1]);
    const [displayMin, setDisplayMin] = React.useState<boolean>(true);
    const [displayMax, setDisplayMax] = React.useState<boolean>(true);
    const [displayAvg, setDisplayAvg] = React.useState<boolean>(true);
    const [allChartData, setAllChartData] = React.useState<IChartData[]>([]);
    const [graphStatus, setGraphStatus] = React.useState<Application.Types.Status>('unintiated');
    const [oldValues, setOldValues] = React.useState<{ ChannelInfo: ILineSeries[], TimeFilter: SEBrowser.IReportTimeFilter }>({ ChannelInfo: [], TimeFilter: null });

    React.useEffect(() => {
        if (props.ChannelInfo == null || props.TimeFilter == null) return;
        const centerTime: moment.Moment = moment(props.TimeFilter.date + props.TimeFilter.time, timeFilterFormat);
        const startTime: string = centerTime.add(-props.TimeFilter.windowSize, formatWindowUnit(props.TimeFilter.timeWindowUnits)).format(serverFormat);
        // Need to move back in the other direction, so entire window
        const endTime: string = centerTime.add(2 * props.TimeFilter.windowSize, formatWindowUnit(props.TimeFilter.timeWindowUnits)).format(serverFormat);

        // Need to figure out which channels we need info for
        let channels: number[] = props.ChannelInfo.map(chan => chan.Channel.ID);
        // If the time filter is the same, we only need to ask for information on channels we have not yet seen
        if (_.isEqual(props.TimeFilter, oldValues.TimeFilter))
            channels = channels.filter(channel => oldValues.ChannelInfo.findIndex(oldChannel => oldChannel.Channel.ID === channel) === -1);
        setOldValues({ ChannelInfo: props.ChannelInfo, TimeFilter: props.TimeFilter });
        const handle = GetTrendData(channels, startTime, endTime);
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

    function GetTrendData(channels: number[], startTime: string, endTime: string): JQuery.jqXHR<SEBrowser.IPQData[]> {
        if (channels.length === 0) {
            setAllChartData(CulledTrendData());
            return null;
        }
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
        }).done((data: SEBrowser.IPQData[]) => {
            const newData: IChartData[] =
                data.map(channelInfo => {
                    const timeSeries = channelInfo.Points.map(dataPoint => moment(dataPoint.Timestamp, serverFormat).valueOf());
                    const channelID = Number("0x" + channelInfo.ChannelID);
                    return ({
                        ChannelID: channelID,
                        MinSeries: channelInfo.Points.map((dataPoint, index) => [timeSeries[index], dataPoint.Minimum]),
                        MaxSeries: channelInfo.Points.map((dataPoint, index) => [timeSeries[index], dataPoint.Maximum]),
                        AvgSeries: channelInfo.Points.map((dataPoint, index) => [timeSeries[index], dataPoint.Average])
                    });
                });
            const oldData = CulledTrendData();
            setAllChartData(oldData.concat(newData));
            setGraphStatus('idle');
        }).fail(() => {
            setGraphStatus('error');
        });
    }

    function CulledTrendData(): IChartData[] {
        return allChartData.filter(oldSeries =>
            props.ChannelInfo.findIndex(channel => channel.Channel.ID === oldSeries.ChannelID) !== -1);
    }

    if (graphStatus === 'error' || (graphStatus === 'idle' && allChartData.findIndex(chartData => chartData.MinSeries.length + chartData.MaxSeries.length + chartData.AvgSeries.length > 0) < 0))
        return (
            <>
                <div className="row" style={{ alignItems: "center", justifyContent: "center", width: "100%", height: "50%" }}>
                    <ServerErrorIcon Show={true} Label={'No Data Available'} Size={props.Height / 7} />
                </div>
                <div className="row" style={{ width: "100%", height: "50%" }}>
                    {React.Children.map(props.AlwaysRender, (element) => {
                        if (!React.isValidElement(element))
                            return null;
                        if ((element as React.ReactElement<unknown>).type === Button)
                            return (
                                <div className="col" style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", height: "100%" }}>
                                    <button type="button"
                                        className={'btn btn-primary'}
                                        onClick={() => { element.props.onClick() }}>
                                        {element}
                                    </button>
                                </div>);
                        return null;
                    })}
                </div>
            </>);
    else
        return (
            <div className="row">
                <LoadingIcon Show={graphStatus === 'loading' || graphStatus === 'unintiated'} Size={29} />
                {props.Title !== undefined ? <h4 style={{ textAlign: "center", width: `${props.Width}px` }}>{props.Title}</h4> : null}
                <Plot height={props.Height - (props.Title !== undefined ? 34 : 5)} width={props.Width} showBorder={false}
                    defaultTdomain={timeLimits} onSelect={props.OnSelect}
                    legend={'bottom'} useMetricFactors={props.Metric ?? false}
                    Tlabel={props.XAxisLabel ?? 'Time'} Ylabel={'Units'} showMouse={true}>
                    {allChartData.flatMap((chartData, index) => {
                        const lineArray: JSX.Element[] = [];
                        const channelSetting: ILineSeries = props.ChannelInfo.find((channel) => channel.Channel.ID === chartData.ChannelID);
                        const baseLabel: string = channelSetting?.Label ?? channelSetting?.Channel?.Name ?? "Unknown Channel";
                        const colorValue: string = channelSetting?.Color ?? "#E41000";
                        if (displayAvg && chartData.AvgSeries.length > 0)
                            lineArray.push(<Line highlightHover={false} key={"avg" + index} showPoints={false} lineStyle={channelSetting?.AvgLineType ?? '-'} color={colorValue} data={chartData.AvgSeries} legend={baseLabel + " avg"} />);
                        if (displayMin && chartData.MinSeries.length > 0)
                            lineArray.push(<Line highlightHover={false} key={"min" + index} showPoints={false} lineStyle={channelSetting?.MinMaxLineType ?? ':'} color={colorValue} data={chartData.MinSeries} legend={baseLabel + " min"} />);
                        if (displayMax && chartData.MaxSeries.length > 0)
                            lineArray.push(<Line highlightHover={false} key={"max" + index} showPoints={false} lineStyle={channelSetting?.MinMaxLineType ?? ':'} color={colorValue} data={chartData.MaxSeries} legend={baseLabel + " max"} />);
                        return lineArray;
                    })}
                    {props.children}
                    {props.AlwaysRender}
                </Plot>
            </div>);
});

export { LineGraph, ILineSeries };