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
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { AssetSlice, MeterSlice, PhaseSlice, ChannelGroupSlice } from '../../../Store';
import { SEBrowser } from '../../../Global';
import { Application } from '@gpa-gemstone/application-typings';
import { MultiCheckBoxSelect } from '@gpa-gemstone/react-forms';
import { DefaultSelects } from '@gpa-gemstone/common-pages';
import { ConfigurableTable, LoadingIcon, Modal, OverlayDrawer, Search, ServerErrorIcon } from '@gpa-gemstone/react-interactive';
import { SpacedColor } from '@gpa-gemstone/helper-functions';
import { MagnifyingGlass, CrossMark, UpArrow, DownArrow, Wrench } from '@gpa-gemstone/gpa-symbols'
import ReportTimeFilter from '../../ReportTimeFilter';
import NavbarFilterButton from '../../Common/NavbarFilterButton';
import { Button, Line, Plot } from '@gpa-gemstone/react-graph';

interface IProps {
    TimeFilter: SEBrowser.IReportTimeFilter,
    Channels: SEBrowser.ITrendChannel[],
    PlotFilter: {
        Value: number,
        Text: string,
        Selected: boolean
    }[],
    Height: number,
    Width: number,
    children: React.ReactNode
}

interface IPQData {
    ChannelID: string,
    Points: {
        Tag: string,
        Minimum: number,
        Maximum: number,
        Average: number,
        QualityFlags: number,
        Timestamp: string
    }[]
}

interface IChartData {
    Color: string,
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

const LineGraph = (props: IProps) => {
    // Graph Consts
    const [timeLimits, setTimeLimits] = React.useState<[number, number]>([0, 1]);
    const [displayMin, setDisplayMin] = React.useState<boolean>(true);
    const [displayMax, setDisplayMax] = React.useState<boolean>(true);
    const [displayAvg, setDisplayAvg] = React.useState<boolean>(true);
    const [allChartData, setAllChartData] = React.useState<IChartData[]>([]);
    const [graphStatus, setGraphStatus] = React.useState<Application.Types.Status>('unintiated');

    React.useEffect(() => {
        const centerTime: moment.Moment = moment(props.TimeFilter.date + props.TimeFilter.time, timeFilterFormat);
        const startTime: string = centerTime.add(-props.TimeFilter.windowSize, formatWindowUnit(props.TimeFilter.timeWindowUnits)).format(serverFormat);
        // Need to move back in the other direction, so entire window
        const endTime: string = centerTime.add(2 * props.TimeFilter.windowSize, formatWindowUnit(props.TimeFilter.timeWindowUnits)).format(serverFormat);
        const channels: number[] = props.Channels.map(chan => chan.ID);
        let handle = GetTrendData(channels, startTime, endTime);
        return () => {
            if (handle != null && handle.abort != null) handle.abort();
        };
    }, [props.Channels, props.TimeFilter]);

    React.useEffect(() => {
        setDisplayMin(props.PlotFilter.find(element => element.Text === "Minimum").Selected);
        setDisplayMax(props.PlotFilter.find(element => element.Text === "Maximum").Selected);
        setDisplayAvg(props.PlotFilter.find(element => element.Text === "Average").Selected);
    }, [props.PlotFilter]);

    React.useEffect(() => {
        let chartData: IChartData = allChartData.find(chartData => chartData.AvgSeries.length > 0);
        setTimeLimits(chartData === undefined ? [0, 1] : [chartData.AvgSeries[0][0], chartData.AvgSeries[chartData.AvgSeries.length - 1][0]]);
    }, [allChartData]);

    function GetTrendData(channels: number[], startTime: string, endTime: string): JQuery.jqXHR<any[]> {
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
        }).done((data: IPQData[]) => {
            setAllChartData(
                data.map(channelInfo => {
                    const timeSeries = channelInfo.Points.map(dataPoint => moment(dataPoint.Timestamp, serverFormat).valueOf());
                    console.log(JSON.stringify(channelInfo));
                    console.log(JSON.stringify(timeSeries));
                    const channelID = Number("0x" + channelInfo.ChannelID);
                    const color: string = allChartData.find(data => channelID === data.ChannelID)?.Color ?? SpacedColor(0.99, 0.99);
                    return ({ 
                        ChannelID: channelID,
                        Color: color,
                        MinSeries: channelInfo.Points.map((dataPoint, index) => [timeSeries[index], dataPoint.Minimum]),
                        MaxSeries: channelInfo.Points.map((dataPoint, index) => [timeSeries[index], dataPoint.Maximum]),
                        AvgSeries: channelInfo.Points.map((dataPoint, index) => [timeSeries[index], dataPoint.Average])
                    });
            }));
            setGraphStatus('idle');
        }).fail(() => {
            setGraphStatus('error');
        });
    }

    function GetDisplay() {
        if (graphStatus === 'loading' || graphStatus === 'unintiated')
            return <LoadingIcon Show={true} Size={40} />;
        if (graphStatus === 'error' || (graphStatus === 'idle' && allChartData.findIndex(chartData => chartData.MinSeries.length + chartData.MaxSeries.length + chartData.AvgSeries.length > 0) < 0))
            return (
                <div>
                    <ServerErrorIcon Show={true} Label={'No Data Available'} />
                    {React.Children.map(props.children, (element, i) => {
                        if (!React.isValidElement(element))
                            return null;
                        if ((element as React.ReactElement<any>).type === Button)
                            return (
                                <button type="button"
                                    className={'btn btn-primary float-left'}
                                    onClick={() => {element.props.onClick()} }>
                                    {element}
                                </button>);
                        return null;
                    })}
                </div>);
        else
            return (
                <Plot height={props.Height} width={props.Width} showBorder={false}
                    defaultTdomain={timeLimits}
                    legend={'bottom'}
                    Tlabel={'Time'} Ylabel={'Power (MW)'} showMouse={true}>
                    {allChartData.flatMap((chartData, index) => { 
                        let lineArray: JSX.Element[] = [];
                        let showMin: boolean = displayMin && chartData.MinSeries.length > 0;
                        let showAvg: boolean = displayAvg && chartData.AvgSeries.length > 0;
                        let channelName: string = props.Channels.find((channel) => channel.ID === chartData.ChannelID)?.Name ?? "Unknown Channel";
                        if (showAvg)
                            lineArray.push(<Line highlightHover={false} key={"avg" + index} showPoints={false} lineStyle={'-'} color={chartData.Color} data={chartData.AvgSeries} legend={channelName} />);
                        if (showMin)
                            lineArray.push(<Line highlightHover={false} key={"min" + index} showPoints={false} lineStyle={':'} color={chartData.Color} data={chartData.MinSeries} legend={showAvg ? undefined : channelName} />);
                        if (displayMax && chartData.MaxSeries.length > 0)
                            lineArray.push(<Line highlightHover={false} key={"max" + index} showPoints={false} lineStyle={':'} color={chartData.Color} data={chartData.MaxSeries} legend={showAvg || showMin ? undefined : channelName} />);
                        return lineArray;
                    })}
                    {props.children}
                </Plot>);
    }

    return (
        <div className="col" style={{ width: '50%', float: 'left' }}>
            {GetDisplay()}
        </div>
    );
}

export { LineGraph };