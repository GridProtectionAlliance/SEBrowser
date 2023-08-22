//******************************************************************************************************
//  ChartContainer.tsx - Gbtc
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
//  04/14/23 - Gabriel Santos
//       Generated original version of source code.
//
//******************************************************************************************************
import React from 'react';
import _ from 'lodash';
import queryString from 'querystring';
import moment from 'moment';
import { CreateGuid, SpacedColor } from '@gpa-gemstone/helper-functions';
import { TrashCan, Pencil, Plus, Flag } from '@gpa-gemstone/gpa-symbols';
import { Button, SymbolicMarker, Infobox, VerticalMarker, HorizontalMarker } from '@gpa-gemstone/react-graph';
import { SystemCenter } from '@gpa-gemstone/application-typings';
import { LineGraph, ILineSeries } from './LineGraph';
import { SEBrowser, TrendSearch } from '../../../global';
import { GenerateQueryParams } from '../../EventSearch/EventSearchSlice';
import { momentDateFormat, momentTimeFormat } from '../../ReportTimeFilter';
import { SettingsOverlay } from './SettingsOverlay';

//TODO: move to global

interface IContainerProps {
    // Manage Plot
    Plot: TrendSearch.ITrendPlot,
    SetPlot: (id: string, record: TrendSearch.ITrendPlot, field: keyof (TrendSearch.ITrendPlot)) => void,
    RemovePlot: (id: string) => void,
    // Manage Overlay
    HandleOverlay: (open: boolean) => void,
    OverlayPortalID: string
}

interface IVertHori {
    ID: string,
    value: number,
}

interface IEventMarker {
    value: number,
    meterKey: string,
    eventID: number
}

type SeriesSettings = ILineSeries;

const TrendPlot = React.memo((props: IContainerProps) => {
    // Sizing Variables
    const chartRef = React.useRef(null);
    const [chartWidth, setChartWidth] = React.useState<number>(500);
    const [chartHeight, setChartHeight] = React.useState<number>(500);

    // Plot Saved Settings
    const [plotAllSeriesSettings, setPlotAllSeriesSettings] = React.useState<SeriesSettings[]>(null);
    const changedProperties = React.useRef<Set<string>>(new Set<string>());

    // Plot Markers
    const [symbolicMarkers, setSymbolicMarkers] = React.useState<TrendSearch.IMarker[]>([]);
    const [verticalMarkers, setVerticalMarkers] = React.useState<IVertHori[]>([]);
    const [horizontalMarkers, setHorizontalMarkers] = React.useState<IVertHori[]>([]);

    // Settings Controls
    const [showSettings, setShowSettings] = React.useState<boolean>(false);
    type customSelects = "drag" | "symbol" | "horizontal" | "vertical";
    const customSelect = React.useRef<customSelects>("drag");

    // Event Information
    const [showEvents, setShowEvents] = React.useState<boolean>(false);
    const [eventMarkers, setEventMarkers] = React.useState<IEventMarker[]>([]);
    const eventFormat = "MM/DD/YYYY[ <br> ]hh:mm:ss.SSSSSSS";

    // Get Heights and Widths
    React.useLayoutEffect(() => {
        setChartWidth(chartRef?.current?.offsetWidth ?? 500);
        setChartHeight(chartRef?.current?.offsetHeight ?? 500);
    });

    // Pre-filter settings that shouldn't get auto-updated
    React.useEffect(() => {
        Object.keys(props.Plot).forEach((field: string) => {
            if (props.Plot != null)
                changedProperties.current.add(field);
        });
    }, []);

    // Set default channel settings
    React.useEffect(() => {
        // These two are only used in the label construction
        // If two channels are found with different meternames, we must append the meter name to the channel name
        const useMeterAppend: boolean = props.Plot.Channels.some((channel) =>
            channel.MeterKey !== props.Plot.Channels[0].MeterKey);
        // Second verse, same as the first, using asset names
        const useAssetAppend: boolean = props.Plot.Channels.some((channel) =>
            channel.AssetKey !== props.Plot.Channels[0].AssetKey);

        const constructLabel: (channel: TrendSearch.ITrendChannel) => string = (channel) => {
            let label: string = channel.Name;
            label = (useAssetAppend ? `${channel.AssetName} - ` : "") + label;
            label = (useMeterAppend ? `${channel.MeterShortName ?? channel.MeterName} - ` : "") + label;
            return label;
        };

        const getDefaultValue: (channel: TrendSearch.ITrendChannel) => SeriesSettings = (channel) => {
            switch (props.Plot.Type) {
                case 'Line': default:
                    return ({
                        Channel: channel, Color: SpacedColor(0.9, 0.9), MinMaxLineType: ':', AvgLineType: '-',
                        Label: constructLabel(channel), RightAxis: channel.ChannelGroup !== props.Plot.Channels[0].ChannelGroup
                    })
            }
        };

        // Get old setting if it exists, otherwise just make a new one
        setPlotAllSeriesSettings(
            props.Plot.Channels.map(channel => (
                plotAllSeriesSettings?.find(oldSetting => oldSetting.Channel.ID === channel.ID) ??
                getDefaultValue(channel)
            ))
        );
    }, [props.Plot.Type, props.Plot.Channels]);

    // Set default plot settings
    React.useEffect(() => {
        if (plotAllSeriesSettings === null) return;
        const newPlot = { ...props.Plot };
        if (!changedProperties.current.has('Title')) {
            let title = plotAllSeriesSettings.some(series => series.Channel.MeterID !== plotAllSeriesSettings[0].Channel.MeterID) ?
                "Multi-Meter " : (plotAllSeriesSettings[0].Channel.MeterShortName ?? plotAllSeriesSettings[0].Channel.MeterName);
            title += plotAllSeriesSettings.some(series => series.Channel.AssetID !== plotAllSeriesSettings[0].Channel.AssetID) ?
                "" : ` - ${plotAllSeriesSettings[0].Channel.AssetName}`;
            title += plotAllSeriesSettings.some(series => series.Channel.ChannelGroup !== plotAllSeriesSettings[0].Channel.ChannelGroup) ?
                "" : ` - ${plotAllSeriesSettings[0].Channel.ChannelGroup}`;
            newPlot.Title = title;
            props.SetPlot(newPlot.ID, newPlot, 'Title');
        }
        if (!changedProperties.current.has('XAxisLabel')) {
            newPlot.XAxisLabel = "Time";
            props.SetPlot(newPlot.ID, newPlot, 'XAxisLabel');
        }

        // Need this function for vertical labels
        const vertLabelFunc = (field: 'YRightLabel'|'YLeftLabel') => {
            const isOnAxis = (isRightAxis: boolean): boolean => (isRightAxis === ('YRightLabel' === field));
            const constructLabel = (field: keyof TrendSearch.ITrendChannel, maxUniques: number): string => {
                const foundArray = Array<string | number>(maxUniques + 1);
                let label = "";
                for (let index = 0; index < foundArray.length; index++) {
                    const firstOnAxis = plotAllSeriesSettings.find(series => isOnAxis(series.RightAxis) && foundArray.find(type => type === series.Channel[field]) === undefined);
                    if (firstOnAxis === undefined) break;
                    foundArray[index] = firstOnAxis.Channel[field];
                    if (index !== 0)
                        label += '/';
                    if (index !== foundArray.length -1)
                        label += `${firstOnAxis.Channel[field]}`;
                    else
                        label += '...';
                }
                return label;
            }
            const numberOfItems = 2;
            newPlot[field] = `${constructLabel('ChannelGroupType', numberOfItems)} (${constructLabel('Unit', numberOfItems)})`;
            props.SetPlot(newPlot.ID, newPlot, field);
        }

        if (!changedProperties.current.has('YLeftLabel'))
            vertLabelFunc('YLeftLabel');
        if (!changedProperties.current.has('YRightLabel'))
            vertLabelFunc('YRightLabel');


    }, [plotAllSeriesSettings]);

    // Handle the overlay
    React.useEffect(() => {
        props.HandleOverlay(showSettings);
    }, [showSettings]);

    React.useEffect(() => {
        if (!showEvents || props.Plot.Channels == null || props.Plot.TimeFilter == null) return;
        const meters: number[] = props.Plot.Channels.map(item => item.MeterID); // TODO: Filter to unique ID's only
        const assets: number[] = props.Plot.Channels.map(item => item.AssetID);

        const handle = GetEventData(props.Plot.TimeFilter, meters, assets);
        return () => {
            if (handle != null && handle.abort != null) handle.abort();
        };
    }, [showEvents, props.Plot.Channels, props.Plot.TimeFilter]);

    function GetEventData(timeFilter: SEBrowser.IReportTimeFilter, meters: number[], assets: number[]): JQuery.jqXHR<any[]> {
        if (assets.length === 0 || meters.length === 0) {
            return null;
        }
        return $.ajax({
            type: "POST",
            url: `${homePath}api/OpenXDA/GetEventSearchData`,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({
                date: timeFilter.date, time: timeFilter.time,
                windowSize: timeFilter.windowSize, timeWindowUnits: timeFilter.timeWindowUnits,
                meterIDs: meters, assetIDs: assets, locationIDs: [], groupIDs: [],
                curveOutside: true, curveInside: true,
                numberResults: 15,
            }),
            dataType: 'json',
            cache: true,
            async: true
        }).done((data: any[]) => {
            setEventMarkers(data.map(datum => {
                return { value: moment.utc(datum.Time, eventFormat).valueOf(), meterKey: datum["Meter Key"], eventID: datum["EventID"] }
            }));
        });
    }

    function navigateEvent(marker: IEventMarker): () => void {
        const meter: SystemCenter.Types.DetailedMeter = {
            ID: props.Plot.Channels.find(channel => channel.MeterKey === marker.meterKey).MeterID,
            AssetKey: '',
            Name: '',
            Location: '',
            MappedAssets: 0,
            Make: '',
            Model: ''
        }
        const time = moment.utc(marker.value, "x");
        const timeFilter: SEBrowser.IReportTimeFilter = {
            date: time.format(momentDateFormat),
            time: time.format(momentTimeFormat),
            windowSize: 1,
            timeWindowUnits: 3,
        }
        const queryParams = GenerateQueryParams(null, [], timeFilter, [], [], [meter], [], marker.eventID);
        const queryUrl = queryString.stringify(queryParams, "&", "=", { encodeURIComponent: queryString.escape });
        const baseUrl = window.location.pathname.split('/');
        const urlIndex = baseUrl.indexOf("trenddata");
        baseUrl.splice(urlIndex, baseUrl.length - urlIndex);
        const handle = setTimeout(() => window.open(`${baseUrl.join('/')}/eventsearch?${queryUrl}`, '_blank'), 500);
        return (() => { clearTimeout(handle); })
    }

    // Setter to also track what has been changed manually
    const handleSetPlot = React.useCallback((id: string, record: TrendSearch.ITrendPlot, field: keyof (TrendSearch.ITrendPlot)) => {
        props.SetPlot(id, record, field);
        changedProperties.current.add(field);
    }, [props.SetPlot, changedProperties]);

    const handleChannelDrop = React.useCallback((event: any) => {
        event.preventDefault();
        let allChannels = props.Plot.Channels.concat(JSON.parse(event.dataTransfer.getData('text/plain')));
        const channelIdSet = new Set<number>();
        // Get uniques only
        allChannels = allChannels.filter(channel => {
            if (channelIdSet.has(channel.ID))
                return false;
            channelIdSet.add(channel.ID);
            return true;
        });
        const newPlot: TrendSearch.ITrendPlot = { ...props.Plot, Channels: allChannels };
        props.SetPlot(props.Plot.ID, newPlot, 'Channels');
    }, [props.Plot.Channels, props.SetPlot]);

    const handleDragOver = React.useCallback((event: any) => {
        event.preventDefault();
    }, []);

    // Buttons added to the plots
    const closeButton = (
        <Button onClick={() => {
            props.RemovePlot(props.Plot.ID);
            setShowSettings(false);
        }}>
            {TrashCan}
        </Button>);

    const overlayButton = (
        <Button onClick={() => setShowSettings(!showSettings)}>
            {Pencil}
        </Button>);

    const eventButton = (
        <Button onClick={() => setShowEvents(!showEvents)}>
            {Flag}
        </Button>);

    const customSelectButton = (selectMode: customSelects, symbol: string) => {
        return (<Button onClick={() => {
            customSelect.current = selectMode;
            return () => { customSelect.current = "drag"; };
        }} isSelect={true}>
            {symbol}
        </Button>);
    };

    const createMarker = React.useCallback((time: number, value: number) => {
        switch (customSelect.current) {
            case "symbol": {
                const currentMarkers = [...symbolicMarkers];
                const newId = CreateGuid();
                currentMarkers.push({
                    ID: newId,
                    // Symbol
                    symbol: Plus,
                    radius: 10,
                    xPos: time,
                    yPos: value,
                    // Note
                    note: "",
                    opacity: 1,
                    xBox: time,
                    yBox: value
                });
                setSymbolicMarkers(currentMarkers);
                return;
            }
            case "vertical": {
                const currentMarkers = [...verticalMarkers];
                const newId = CreateGuid();
                currentMarkers.push({
                    ID: newId,
                    value: time
                });
                setVerticalMarkers(currentMarkers);
                return;
            }
            case "horizontal": {
                const currentMarkers = [...horizontalMarkers];
                const newId = CreateGuid();
                currentMarkers.push({
                    ID: newId,
                    value: value
                });
                setHorizontalMarkers(currentMarkers);
                return;
            }
            default: return;
        }
    }, [symbolicMarkers, setSymbolicMarkers, verticalMarkers, setVerticalMarkers, horizontalMarkers, setHorizontalMarkers]);

    const setMarker = React.useCallback((ID: string, value: any, field: keyof (TrendSearch.IMarker)) => {
        const index = symbolicMarkers.findIndex(item => item.ID === ID);
        const newList: any[] = [...symbolicMarkers];
        newList[index][field] = value;
        setSymbolicMarkers(newList);
    }, [symbolicMarkers, setSymbolicMarkers]);

    const setVertical = React.useCallback((ID: string, value: number) => {
        const index = verticalMarkers.findIndex(item => item.ID === ID);
        const newList: any[] = [...verticalMarkers];
        newList[index]["value"] = value;
        setVerticalMarkers(newList);
    }, [verticalMarkers, setVerticalMarkers]);

    const setHorizontal = React.useCallback((ID: string, value: number) => {
        const index = horizontalMarkers.findIndex(item => item.ID === ID);
        const newList: any[] = [...horizontalMarkers];
        newList[index]["value"] = value;
        setHorizontalMarkers(newList);
    }, [horizontalMarkers, setHorizontalMarkers]);

    return (
        <div className="col" style={{ width: (props.Plot.Width ?? 100) - 1 + '%', height: (props.Plot.Height ?? 50) - 1 + '%', float: 'left' }} ref={chartRef} onDragOver={handleDragOver} onDrop={handleChannelDrop}>
            {props.Plot.Type === 'Line' ?
                <LineGraph ChannelInfo={plotAllSeriesSettings} TimeFilter={props.Plot.TimeFilter} PlotFilter={props.Plot.PlotFilter}
                    Title={props.Plot.Title} XAxisLabel={props.Plot.XAxisLabel} YLeftLabel={props.Plot.YLeftLabel} YRightLabel={props.Plot.YRightLabel}
                    Height={chartHeight} Width={chartWidth} Metric={props.Plot.Metric}
                    OnSelect={createMarker} AlwaysRender={[overlayButton, closeButton]}>
                    {eventMarkers.map((marker, i) =>
                        <VerticalMarker key={"Event_" + i}
                            Value={marker.value} color={"#E41000"} lineStyle={':'} width={4}
                            onClick={() => { if (customSelect.current !== "drag") return; navigateEvent(marker); }} />
                    )}
                    {verticalMarkers.map((marker, i) =>
                        <VerticalMarker key={"Vert_" + i}
                            Value={marker.value} color={"#E41000"} lineStyle={':'} width={4}
                            setValue={(value) => { if (customSelect.current !== "drag") return; setVertical(marker.ID, value); }}/>
                    )}
                    {horizontalMarkers.map((marker, i) =>
                        <HorizontalMarker key={"Hori_" + i}
                            Value={marker.value} color={"#E41000"} lineStyle={':'} width={4}
                            setValue={(value) => { if (customSelect.current !== "drag") return; setHorizontal(marker.ID, value); }} />
                    )}
                    {symbolicMarkers.map((marker, i) =>
                        <SymbolicMarker key={"Marker_" + i}
                            xPos={marker.xPos} yPos={marker.yPos} radius={marker.radius}
                            setPosition={(x, y) => { if (customSelect.current !== "drag") return; setMarker(marker.ID, x, 'xPos'); setMarker(marker.ID, y, 'yPos'); setMarker(marker.ID, x, 'xBox'); setMarker(marker.ID, y, 'yBox'); }}>
                            <>{marker.symbol}</>
                        </SymbolicMarker>
                    )}
                    {symbolicMarkers.map((marker, i) =>
                        <Infobox key={"Info_" + i} origin="upper-center"
                            x={marker.xBox} y={marker.yBox} opacity={marker.opacity}
                            width={100} height={80} offset={15}
                            setPosition={(x, y) => { if (customSelect.current !== "drag") return; setMarker(marker.ID, x, 'xBox'); setMarker(marker.ID, y, 'yBox'); }}>
                            <div style={{ background: 'white', overflow: 'auto', whiteSpace: 'pre-wrap', opacity: marker.opacity ?? 1 }}>
                                {`(X:${moment(marker.xPos).format("mm:ss.SS")}, Y:${marker.yPos.toFixed(2)})\n${marker.note}`}
                            </div>
                        </Infobox>
                    )}
                    {customSelectButton("symbol", Plus)} {customSelectButton("horizontal", "-")} {customSelectButton("vertical", "|")} {eventButton}
                </LineGraph> : null}
            <SettingsOverlay SeriesSettings={plotAllSeriesSettings} SetSeriesSettings={setPlotAllSeriesSettings} SetShow={setShowSettings} Show={showSettings} SetPlot={handleSetPlot}
            OverlayPortalID={props.OverlayPortalID} Plot={props.Plot} Markers={symbolicMarkers} SetMarkers={setSymbolicMarkers} />
        </div>
    );
});

export default TrendPlot;
