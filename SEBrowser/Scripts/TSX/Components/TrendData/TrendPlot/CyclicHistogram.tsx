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
import { IMultiCheckboxOption, SEBrowser, TrendSearch } from '../../../Global';
import { SelectTrendDataSettings, SelectMoveOptionsLeftSetting } from './../../SettingsSlice';
import { useAppSelector } from './../../../hooks';
import GraphError from './GraphError';
import { Application } from '@gpa-gemstone/application-typings';
import { LoadingIcon } from '@gpa-gemstone/react-interactive';
import { HeatMapChart, Plot } from '@gpa-gemstone/react-graph';
import { HexToHsv } from '@gpa-gemstone/helper-functions';

interface IProps {
    TimeFilter: SEBrowser.IReportTimeFilter,
    ChannelInfo: ICyclicSeries,
    PlotFilter: IMultiCheckboxOption[],
    Height: number,
    Width: number,
    OnSelect: (time: number, values: number[]) => void,
    Title?: string,
    Metric?: boolean,
    XAxisLabel?: string,
    YAxisLabel?: string,
    Cursor?: string,
    AxisZoom?: 'Rect' | 'AutoValue' | 'HalfAutoValue',
    DefaultZoom?: [number, number][]
    AlwaysRender: React.ReactNode,
    children?: React.ReactNode
}

interface ICyclicSeries{
    Channel: TrendSearch.ITrendChannel,
    Color: string
}


interface IChartData {
    ChannelID: number,
    BinSize: number,
    TimeSpan: number,
    Series: [number, number, number][]
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

const CyclicHistogram = React.memo((props: IProps) => {
    // Graph Consts
    const [timeLimits, setTimeLimits] = React.useState<[number, number]>([0, 1]);
    const [chartData, setChartData] = React.useState<IChartData>(null);
    const [graphStatus, setGraphStatus] = React.useState<Application.Types.Status>('unintiated');
    const [oldValues, setOldValues] = React.useState<{ ChannelInfo: ICyclicSeries, TimeFilter: SEBrowser.IReportTimeFilter }>({ ChannelInfo: null, TimeFilter: null });
    const [barColor, setBarColor] = React.useState<{ Hue: number, Saturation: number }>(null);
    const trendDatasettings = useAppSelector(SelectTrendDataSettings);
    const moveLeft = useAppSelector(SelectMoveOptionsLeftSetting);

    React.useEffect(() => {
        if (props.ChannelInfo == null || props.TimeFilter == null) return;
        if (_.isEqual(props.TimeFilter, oldValues.TimeFilter) && props.ChannelInfo.Channel.ID === oldValues.ChannelInfo.Channel.ID) return;

        const centerTime: moment.Moment = moment(props.TimeFilter.date + props.TimeFilter.time, timeFilterFormat);
        const startTime: string = centerTime.add(-props.TimeFilter.windowSize, formatWindowUnit(props.TimeFilter.timeWindowUnits)).format(serverFormat);
        // Need to move back in the other direction, so entire window
        const endTime: string = centerTime.add(2 * props.TimeFilter.windowSize, formatWindowUnit(props.TimeFilter.timeWindowUnits)).format(serverFormat);

        const handle = GetCyclicData(props.ChannelInfo.Channel.ID, startTime, endTime);
        handle.done((data: TrendSearch.ICyclicData[]) => {
            if (data.length === 0 || data[0].Points. length === 0) return;
            const channelID = Number("0x" + data[0].ChannelID);
            setChartData({
                ChannelID: channelID,
                BinSize: data[0].BinSize,
                // 10k ticks per ms
                TimeSpan: data[0].TimeSpanMs,
                Series: data[0].Points.map((dataPoint) => [moment.utc(dataPoint[0], serverFormat).valueOf(), dataPoint[1], 100*dataPoint[2]]),
            });
            setOldValues({ ChannelInfo: props.ChannelInfo, TimeFilter: props.TimeFilter });
        });
        return () => {
            if (handle != null && handle.abort != null) handle.abort();
        };
    }, [props.ChannelInfo, props.TimeFilter]);

    React.useEffect(() => {
        if (chartData == null || chartData.Series.length === 0) setTimeLimits([0, 1]);
        else {
            const averageTimeDuration = (chartData.Series[chartData.Series.length - 1][0] - chartData.Series[0][0]) / chartData.Series.length;
            setTimeLimits([chartData.Series[0][0], chartData.Series[chartData.Series.length - 1][0] + averageTimeDuration]);
        }
    }, [chartData]);

    React.useEffect(() => {
        if (props.ChannelInfo?.Color == null) return;
        const color = HexToHsv(props.ChannelInfo.Color);
        setBarColor({ Hue: color.h, Saturation: color.s})
    }, [props.ChannelInfo?.Color]);

    function GetCyclicData(channel: number, startTime: string, endTime: string): JQuery.jqXHR<TrendSearch.ICyclicData[]> {
        setGraphStatus('loading');
        return $.ajax({
            type: "POST",
            url: `${homePath}api/OpenXDA/GetCyclicChartData`,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({
                Channels: [channel],
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
                {props.Title !== undefined ? <h4 style={{ textAlign: "center", width: `${props.Width}px` }}>{props.Title}</h4> : null}
                <Plot height={props.Height - (props.Title !== undefined ? 34 : 5)} width={props.Width} showBorder={trendDatasettings.BorderPlots} moveMenuLeft={moveLeft}
                    defaultTdomain={timeLimits} onSelect={props.OnSelect} cursorOverride={props.Cursor} snapMouse={trendDatasettings.MarkerSnapping}
                    legend={trendDatasettings.LegendDisplay} useMetricFactors={props.Metric} holdMenuOpen={!trendDatasettings.StartWithOptionsClosed} showDateOnTimeAxis={true}
                    Tlabel={props.XAxisLabel} Ylabel={[props.YAxisLabel]} showMouse={true} zoomMode={props.AxisZoom} defaultYdomain={props.DefaultZoom}>
                    {(chartData?.Series?.length == null || chartData.Series.length === 0 || barColor === null) ? null :
                        <HeatMapChart data={chartData.Series} sampleMs={chartData.TimeSpan} binSize={chartData.BinSize} hue={barColor.Hue} saturation={barColor.Saturation} fillStyle={'fill'} axis={'left'} legendUnit={'%'} />
                    }
                    {props.children}
                    {props.AlwaysRender}
                </Plot>
            </div>);
});

export { CyclicHistogram, ICyclicSeries };