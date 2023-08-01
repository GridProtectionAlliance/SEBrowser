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
import { IMultiCheckboxOption, SEBrowser } from '../../../global';
import { GenerateQueryParams } from '../../EventSearch/EventSearchSlice';
import { momentDateFormat, momentTimeFormat } from '../../ReportTimeFilter';
import { SettingsOverlay } from './SettingsOverlay';

//TODO: move to global
interface ITrendPlot {
    TimeFilter: SEBrowser.IReportTimeFilter,
    Type: 'Line',
    Channels: SEBrowser.ITrendChannel[],
    PlotFilter: IMultiCheckboxOption[],
    ID: string,
    Width: number,
    Height: number,
    Title?: string,
    XAxisLabel?: string,
    Metric?: boolean
}

interface IContainerProps {
    // Manage Plot
    Plot: ITrendPlot,
    SetPlot: (id: string, record: ITrendPlot, field: keyof (ITrendPlot)) => void,
    RemovePlot: (id: string) => void,
    // Manage Overlay
    HandleOverlay: (open: boolean) => void,
    OverlayPortalID: string
}

interface IMarker {
    // Symbolic marker
    ID: string,
    symbol: string,
    xPos: number,
    yPos: number,
    radius: number,
    // Infobox
    note: string,
    xBox: number,
    yBox: number,
    opacity: number
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

    // Plot Markers
    const [symbolicMarkers, setSymbolicMarkers] = React.useState<IMarker[]>([]);
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

    // Set default channel settings
    React.useEffect(() => {
        //These two are only used in the label construction
        // If two channels are found with different meternames, we must append the meter name to the channel name
        const useMeterAppend: boolean = props.Plot.Channels.some((channel) =>
            channel.MeterKey !== props.Plot.Channels[0].MeterKey);
        // Second verse, same as the first, using asset names
        const useAssetAppend: boolean = props.Plot.Channels.some((channel) =>
            channel.AssetKey !== props.Plot.Channels[0].AssetKey);

        const constructLabel: (channel: SEBrowser.ITrendChannel) => string = (channel) => {
            let label: string = channel.Name;
            label = (useAssetAppend ? `${channel.AssetName} - ` : "") + label;
            label = (useMeterAppend ? `${channel.MeterShortName ?? channel.MeterName} - ` : "") + label;
            return label;
        };

        const getDefaultValue: (channel: SEBrowser.ITrendChannel) => SeriesSettings = (channel) => {
            switch (props.Plot.Type) {
                case 'Line': default:
                    return ({ Channel: channel, Color: SpacedColor(0.9, 0.9), MinMaxLineType: ':', AvgLineType: '-', Label: constructLabel(channel) })
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
                return { value: moment(datum.Time, eventFormat).valueOf(), meterKey: datum["Meter Key"], eventID: datum["EventID"] }
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
        const time = moment(marker.value, "x");
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
        const newPlot: ITrendPlot = { ...props.Plot, Channels: allChannels };
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

    const setMarker = React.useCallback((ID: string, value: any, field: keyof (IMarker)) => {
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
        <div className="col" style={{ width: props.Plot.Width - 1 + '%', height: props.Plot.Height-1 + '%', float: 'left' }} ref={chartRef} onDragOver={handleDragOver} onDrop={handleChannelDrop}>
            {props.Plot.Type === 'Line' ?
                <LineGraph ChannelInfo={plotAllSeriesSettings} TimeFilter={props.Plot.TimeFilter} PlotFilter={props.Plot.PlotFilter}
                    Title={props.Plot.Title} XAxisLabel={props.Plot.XAxisLabel} Height={chartHeight} Width={chartWidth} Metric={props.Plot.Metric}
                    OnSelect={createMarker} AlwaysRender={[overlayButton, closeButton]}>
                    {eventMarkers.map((marker, i) =>
                        <VerticalMarker key={"Event_" + i}
                            Value={marker.value} color={"#E41000"} lineStyle={':'} width={4}
                            onClick={(value) => { if (customSelect.current !== "drag") return; navigateEvent(marker); }} />
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
            <SettingsOverlay SeriesSettings={plotAllSeriesSettings} SetSeriesSettings={setPlotAllSeriesSettings} SetShow={setShowSettings} Show={showSettings} SetPlot={props.SetPlot}
            OverlayPortalID={props.OverlayPortalID} Plot={props.Plot} Markers={symbolicMarkers} SetMarkers={setSymbolicMarkers} />
        </div>
    );
});

export { TrendPlot, ITrendPlot, IMarker };
