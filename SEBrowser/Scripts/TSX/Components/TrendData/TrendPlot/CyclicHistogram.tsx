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
import { SelectTrendDataSettings, SelectGeneralSettings } from './../../SettingsSlice';
import { useAppSelector } from './../../../hooks';
import GraphError from './GraphError';
import { Application } from '@gpa-gemstone/application-typings';
import { LoadingIcon, ToolTip } from '@gpa-gemstone/react-interactive';
import { HeatMapChart, Plot } from '@gpa-gemstone/react-graph';
import { HexToHsv } from '@gpa-gemstone/helper-functions';
import { Warning } from '@gpa-gemstone/gpa-symbols';

interface IProps {
    ID: string,
    TimeFilter: SEBrowser.IReportTimeFilter,
    ChannelInfo: ICyclicSeries,
    PlotFilter: IMultiCheckboxOption[],
    Height: number,
    Width: number,
    OnSelect: (time: number, values: number[]) => void,
    SetExtraSpace: (extra: number) => void,
    Title?: string,
    Metric?: boolean,
    XAxisLabel?: string,
    YAxisLabel?: string,
    Cursor?: string,
    MouseHighlight: 'none' | 'horizontal' | 'vertical',
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
    TimeSpan: number,
    BinSize: number,
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
    const [hover, setHover] = React.useState<boolean>(false);
    const [barColor, setBarColor] = React.useState<{ Hue: number, Saturation: number }>(null);
    const [metaData, setMetaData] = React.useState<TrendSearch.IMetaData[]>(null);
    // Height mangement
    const [titleHeight, setTitleHeight] = React.useState<number>(0);
    const [plotHeight, setPlotHeight] = React.useState<number>(props.Height);
    const [extraLegendHeight, setExtraLegendHeight] = React.useState<number>(0);
    const titleRef = React.useRef(null);
    const oldValues = React.useRef<{ ChannelInfo: ICyclicSeries, TimeFilter: SEBrowser.IReportTimeFilter }>({ ChannelInfo: null, TimeFilter: null });
    const trendDatasettings = useAppSelector(SelectTrendDataSettings);
    const generalSettings = useAppSelector(SelectGeneralSettings);

    React.useLayoutEffect(() => setTitleHeight(titleRef?.current?.offsetHeight ?? 0));

    React.useEffect(() => {
        if (props.ChannelInfo == null || props.TimeFilter == null) return;
        if (_.isEqual(props.TimeFilter, oldValues.current.TimeFilter) && props.ChannelInfo.Channel.ID === oldValues.current.ChannelInfo.Channel.ID) return;

        const centerTime: moment.Moment = moment(props.TimeFilter.date + props.TimeFilter.time, timeFilterFormat);
        const startTime: string = centerTime.add(-props.TimeFilter.windowSize, formatWindowUnit(props.TimeFilter.timeWindowUnits)).format(serverFormat);
        // Need to move back in the other direction, so entire window
        const endTime: string = centerTime.add(2 * props.TimeFilter.windowSize, formatWindowUnit(props.TimeFilter.timeWindowUnits)).format(serverFormat);

        const handle = GetMetaData(props.ChannelInfo.Channel.ID, startTime, endTime);
        return () => {
            if (handle != null && handle.abort != null) handle.abort();
        };
    }, [props.ChannelInfo, props.TimeFilter]);

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
        if (chartData == null || chartData.Series.length === 0) setTimeLimits([0, 1]);
        else {
            const timeSeries = chartData.Series.map(point => point[0]);
            setTimeLimits([Math.min(...timeSeries), Math.max(...timeSeries) + chartData.TimeSpan]);
        }
    }, [chartData]);

    React.useEffect(() => {
        if (props.ChannelInfo?.Color == null) return;
        const color = HexToHsv(props.ChannelInfo.Color);
        setBarColor({ Hue: color.h, Saturation: color.s})
    }, [props.ChannelInfo?.Color]);

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
            oldValues.current = { ChannelInfo: props.ChannelInfo, TimeFilter: props.TimeFilter };
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
                {props.AlwaysRender}
            </GraphError>
        );
    else
        return (
            <div className="row">
                <LoadingIcon Show={graphStatus === 'loading' || graphStatus === 'unintiated'} Size={29} />
                <h4 ref={titleRef} style={{ textAlign: "center", width: `${props.Width}px`, marginBottom: '0px' }}>
                    {props?.Title ?? ''}
                        {(chartData?.Series?.length == null || chartData.Series.length === 0) ?
                            <span data-tooltip={props.ID} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>{Warning}</span>
                            : null
                        }
                </h4>
                <Plot height={plotHeight} width={props.Width} legendHeight={plotHeight / 2 + extraLegendHeight} legendWidth={props.Width / 2} moveMenuLeft={generalSettings.MoveOptionsLeft}
                    defaultTdomain={timeLimits} onSelect={props.OnSelect} onCapture={captureCallback} onCaptureComplete={() => captureCallback(0)} cursorOverride={props.Cursor} snapMouse={trendDatasettings.MarkerSnapping}
                    legend={trendDatasettings.LegendDisplay} useMetricFactors={props.Metric} holdMenuOpen={!trendDatasettings.StartWithOptionsClosed} showDateOnTimeAxis={true}
                    Tlabel={props.XAxisLabel} Ylabel={[props.YAxisLabel]} showMouse={props.MouseHighlight} zoomMode={props.AxisZoom} defaultYdomain={props.DefaultZoom}>
                    {(chartData?.Series?.length == null || chartData.Series.length === 0 || barColor === null) ? null :
                        <HeatMapChart data={chartData.Series} sampleMs={chartData.TimeSpan} binSize={chartData.BinSize} hue={barColor.Hue} saturation={barColor.Saturation} fillStyle={'fill'} axis={'left'} legendUnit={'%'} />
                    }
                    {props.children}
                    {props.AlwaysRender}
                </Plot>
                <ToolTip Show={hover} Position={'bottom'} Theme={'dark'} Target={props.ID}>
                    Selected Channel has no Data for the selected Time Window.
                </ToolTip>
            </div>);
});

export { CyclicHistogram, ICyclicSeries };