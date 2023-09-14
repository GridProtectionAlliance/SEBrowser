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
import { Application } from '@gpa-gemstone/application-typings';
import { LoadingIcon, ServerErrorIcon } from '@gpa-gemstone/react-interactive';
import { Button, ColoredBarChart, Plot } from '@gpa-gemstone/react-graph';
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
    AlwaysRender: React.ReactNode,
    children: React.ReactNode
}

interface ICyclicSeries{
    Channel: TrendSearch.ITrendChannel,
    Color: string
}


interface IChartData {
    ChannelID: number,
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
    const [barColor, setBarColor] = React.useState<{ Hue: number, Value: number }>(null);

    React.useEffect(() => {
        if (props.ChannelInfo == null || props.TimeFilter == null) return;
        if (_.isEqual(props.TimeFilter, oldValues.TimeFilter) && props.ChannelInfo.Channel.ID === oldValues.ChannelInfo.Channel.ID) return;

        const centerTime: moment.Moment = moment(props.TimeFilter.date + props.TimeFilter.time, timeFilterFormat);
        const startTime: string = centerTime.add(-props.TimeFilter.windowSize, formatWindowUnit(props.TimeFilter.timeWindowUnits)).format(serverFormat);
        // Need to move back in the other direction, so entire window
        const endTime: string = centerTime.add(2 * props.TimeFilter.windowSize, formatWindowUnit(props.TimeFilter.timeWindowUnits)).format(serverFormat);

        const handle = GetCyclicData(props.ChannelInfo.Channel.ID, startTime, endTime);
        handle.done((data: TrendSearch.IPQData[]) => {
            if (data.length === 0) return;
            const timeSeries = data[0].Points.map(dataPoint => moment.utc(dataPoint.Timestamp, serverFormat).valueOf());
            const channelID = Number("0x" + data[0].ChannelID);
            setChartData({
                ChannelID: channelID,
                Series: data[0].Points.map((dataPoint, index) => [timeSeries[index], dataPoint.Average, dataPoint.Maximum]),
            });
            setOldValues({ ChannelInfo: props.ChannelInfo, TimeFilter: props.TimeFilter });
        });
        return () => {
            if (handle != null && handle.abort != null) handle.abort();
        };
    }, [props.ChannelInfo, props.TimeFilter]);

    React.useEffect(() => {
        if (chartData == null) setTimeLimits([0, 1]);
        else {
            const averageTimeDuration = (chartData.Series[chartData.Series.length - 1][0] - chartData.Series[0][0]) / chartData.Series.length;
            setTimeLimits([chartData.Series[0][0], chartData.Series[chartData.Series.length - 1][0] + averageTimeDuration]);
        }
    }, [chartData]);

    React.useEffect(() => {
        if (props.ChannelInfo?.Color == null) return;
        const color = HexToHsv(props.ChannelInfo.Color);
        setBarColor({ Hue: color.h, Value: color.v})
    }, [props.ChannelInfo?.Color]);

    function GetCyclicData(channel: number, startTime: string, endTime: string): JQuery.jqXHR<TrendSearch.IPQData[]> {
        setGraphStatus('loading');
        return $.ajax({
            type: "POST",
            url: `${homePath}api/OpenXDA/GetLineChartData`,
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
                    defaultTdomain={timeLimits} onSelect={props.OnSelect} cursorOverride={props.Cursor}
                    legend={'bottom'} useMetricFactors={props.Metric} holdMenuOpen={true} showDateOnTimeAxis={true}
                    Tlabel={props.XAxisLabel} Ylabel={[props.YAxisLabel]} showMouse={true}>
                    {(chartData?.Series == null || barColor === null) ? null :
                        <ColoredBarChart data={chartData.Series} hue={barColor.Hue} value={barColor.Value} barStyle={'fill'} axis={'left'} />
                    }
                    {props.children}
                    {props.AlwaysRender}
                </Plot>
            </div>);
});

export { CyclicHistogram, ICyclicSeries };