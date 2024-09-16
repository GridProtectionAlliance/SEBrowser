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
import { useSelector } from 'react-redux';
import moment from 'moment';
import { CreateGuid, SpacedColor } from '@gpa-gemstone/helper-functions';
import { TrashCan, Pencil, Plus } from '@gpa-gemstone/gpa-symbols';
import { Button, SymbolicMarker, Infobox, VerticalMarker, HorizontalMarker, AxisMap } from '@gpa-gemstone/react-graph';
import { SystemCenter } from '@gpa-gemstone/application-typings';
import { LineGraph } from './LineGraph';
import { SEBrowser, TrendSearch } from '../../../global';
import { SelectTrendDataSettings, SelectGeneralSettings, SelectDateTimeSetting, SelectDateTimeFormat } from './../../SettingsSlice';
import { useAppSelector } from './../../../hooks';
import { GenerateQueryParams } from '../../EventSearch/EventSearchSlice';
import { SettingsModal, SeriesSettings } from '../Settings/SettingsModal';
import { CyclicHistogram, ICyclicSeries } from './CyclicHistogram';

type customSelects = "drag" | "symbol" | "horizontal" | "vertical";
const defaultSelect = "drag";
const defaultHighlight = "vertical";
const defaultCursor = undefined;
const phaseMeasurementColorIndex = new Map<string, number>([
    ["VoltageAN", 0],
    ["VoltageAB", 0],
    ["VoltageBN", 1],
    ["VoltageBC", 1],
    ["VoltageCN", 2],
    ["VoltageCA", 2],
    ["CurrentAN", 3],
    ["CurrentAC", 3],
    ["CurrentBN", 4],
    ["CurrentBC", 4],
    ["CurrentCN", 5],
    ["CurrentCA", 5]
])

interface IContainerProps {
    // Manage Plot
    Plot: TrendSearch.ITrendPlot,
    SetPlot: (id: string, record: TrendSearch.ITrendPlot, field: keyof (TrendSearch.ITrendPlot)) => void,
    RemovePlot: (id: string) => void,
    SplicePlot: (idNear: string, idMove: string, isBeforeNear: boolean) => void,
    // Manage Overlay
    HandleOverlay: (open: boolean) => void,
    // Drag Mode
    DragMode: boolean,
    MarkerDefaults: TrendSearch.IMarkerSettingsBundle,
    LineDefaults: TrendSearch.ILinePlotSettingsBundle
}

const TrendPlot: React.FunctionComponent<IContainerProps> = (props: IContainerProps) => {
    // Sizing Variables
    const chartRef = React.useRef(null);
    const [chartWidth, setChartWidth] = React.useState<number>(500);
    const [chartHeight, setChartHeight] = React.useState<number>(500);
    const [extraHeight, setExtraHeight] = React.useState<number>(0);

    // Plot Saved Settings
    const generalSettings = useAppSelector(SelectGeneralSettings);
    const dateTimeFormat = useSelector(SelectDateTimeFormat);
    const trendDatasettings = useAppSelector(SelectTrendDataSettings);
    const [plotAllSeriesSettings, setPlotAllSeriesSettings] = React.useState<SeriesSettings[]>(null);
    const colorIndex = React.useRef<{ ind: number, assetMap: Map<string, number> }>({ ind: -1, assetMap: new Map<string, number>() });
    const changedProperties = React.useRef<Set<string>>(new Set<string>());

    // Plot Markers
    const [symbolicMarkers, setSymbolicMarkers] = React.useState<TrendSearch.ISymbolic[]>([]);
    const [horiVertMarkers, setHoriVertMarkers] = React.useState<TrendSearch.IVertHori[]>([]);
    const [mousePosition, setMousePosition] = React.useState<{ x: number, y: number }>({ x: 0, y: 0 });

    // Event Information
    const [eventMarkers, setEventMarkers] = React.useState<TrendSearch.IEventMarker[]>([]);
    const [eventSettings, setEventSettings] = React.useState<TrendSearch.EventMarkerSettings>(props.MarkerDefaults.Event.Default);

    // Settings Controls
    const [showSettings, setShowSettings] = React.useState<boolean>(false);
    const [customSelect, setCustomSelect] = React.useState<customSelects>(defaultSelect);
    const [customCursor, setCustomCursor] = React.useState<string>(defaultCursor);
    const [lineHighlight, setLineHighlight] = React.useState<'none' | 'horizontal' | 'vertical'>(defaultHighlight);

    // Determine color to use
    const getColor = React.useCallback((colorSetting: TrendSearch.IColorSettings, channel?: TrendSearch.ITrendChannel) => {
        const getRandomColor = () => {
            const randomColor = SpacedColor(0.9, 0.9);
            const newColor: TrendSearch.IColor = {
                Label: '',
                MinColor: randomColor,
                AvgColor: randomColor,
                MaxColor: randomColor
            }
            return newColor;
        }
        const getDefaultColor = () => {
            if (colorSetting.Colors.length !== 0) return colorSetting.Colors[0];
            return getRandomColor();
        }
        switch (colorSetting.ApplyType) {
            case "Random":
                return getRandomColor();
            case "Individual": {
                colorIndex.current.ind = (colorIndex.current.ind + 1) % colorSetting.Colors.length;
                return colorSetting.Colors[colorIndex.current.ind];
            }
            case "Asset": {
                if (channel === undefined) return getDefaultColor();
                const currentIndex = colorIndex.current.assetMap.get(channel.AssetKey);
                if (currentIndex === undefined || colorIndex.current.ind === -1) {
                    colorIndex.current.ind = (colorIndex.current.ind + 1) % colorSetting.Colors.length;
                    colorIndex.current.assetMap.set(channel.AssetKey, colorIndex.current.ind);
                }
                return colorSetting.Colors[currentIndex];
            }
            case "PhaseType": {
                if (channel === undefined) return getDefaultColor();
                const currentIndex = phaseMeasurementColorIndex.get(channel.ChannelGroup + channel.Phase) ?? 0;
                if (currentIndex >= colorSetting.Colors.length) getDefaultColor();
                return colorSetting.Colors[currentIndex];
            }
        }
    }, []);

    const buildAssetDictionary = React.useCallback((channels: TrendSearch.ITrendChannel[]) => {
        const sortedChannels = _.orderBy(channels, ["AssetName"], ["asc"]);
        let previousKey: string = undefined;
        let previousIndex = -1;
        sortedChannels.forEach(chan => {
            if (chan.AssetKey !== previousKey || previousIndex === -1) {
                previousIndex += 1;
                previousKey = chan.AssetKey;
                colorIndex.current.assetMap.set(previousKey, previousIndex);
            }
        });
        colorIndex.current.ind = previousIndex;
    }, []);

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

    // Update markers if they should be updated
    React.useEffect(() => {
        const defaultsIgnoredMarker = new Set(["ID", "xPos", "yPos", "xBox", "yBox", "axis", "value", "isHori", "note"]);
        const applyFunc: <T>(markers: T[], defaultMarker: T) => T[] = (markers, defaultMarker) => {
            const newMarkers = [...markers];
            newMarkers.forEach((marker, ind) => {
                Object.keys(marker).forEach(field => {
                    if (!defaultsIgnoredMarker.has(field)) newMarkers[ind][field] = defaultMarker[field];
                });
            });
            return newMarkers;
        }
        if (props.MarkerDefaults.Symb.ShouldApply) setSymbolicMarkers(applyFunc(symbolicMarkers, props.MarkerDefaults.Symb.Default));
        if (props.MarkerDefaults.VeHo.ShouldApply) setHoriVertMarkers(applyFunc(horiVertMarkers, props.MarkerDefaults.VeHo.Default));
        if (props.MarkerDefaults.Event.ShouldApply) setEventSettings(props.MarkerDefaults.Event.Default);
    }, [props.MarkerDefaults]);

    // Update lines if they should be updated
    React.useEffect(() => {
        if (props.Plot.Type !== 'Line' || plotAllSeriesSettings == null || plotAllSeriesSettings.length === 0) return;
        const applyStyleFunc: (
            newSettings: TrendSearch.ILineSeries[],
            defaultStyle: TrendSearch.ILineStyleSettings,
            styleField: 'Min' | 'Max' | 'Avg')
            => boolean = (newSettings, defaultStyle, styleField) => {
                newSettings.forEach((_setting, ind) => {
                    Object.keys(defaultStyle).forEach(field => {
                        newSettings[ind][styleField][field] = defaultStyle[field];
                    });
                });
                return true;
            }
        const applyColorFunc: (
            newSettings: TrendSearch.ILineSeries[],
            newColors: TrendSearch.IColorSettings)
            => void = (newSettings, newColors) => {
                newSettings.forEach((setting, ind) => {
                    const newColor = getColor(newColors, setting.Channel);
                    newSettings[ind]["Min"].Color = newColor.MinColor;
                    newSettings[ind]["Avg"].Color = newColor.AvgColor;
                    newSettings[ind]["Max"].Color = newColor.MaxColor;
                });
            }
        const newSettings: TrendSearch.ILineSeries[] = [...(plotAllSeriesSettings as TrendSearch.ILineSeries[])];
        let shouldApply = false;
        if (props.LineDefaults.Min.ShouldApply) shouldApply = applyStyleFunc(newSettings, props.LineDefaults.Min.Default, 'Min');
        if (props.LineDefaults.Avg.ShouldApply) shouldApply = applyStyleFunc(newSettings, props.LineDefaults.Avg.Default, 'Avg');
        if (props.LineDefaults.Max.ShouldApply) shouldApply = applyStyleFunc(newSettings, props.LineDefaults.Max.Default, 'Max');
        if (props.LineDefaults.Colors.ShouldApply) {
            shouldApply = true;
            colorIndex.current = { ind: -1, assetMap: new Map<string, number>() };
            if (props.LineDefaults.Colors.Default.ApplyType === "Asset") buildAssetDictionary(props.Plot.Channels);
            applyColorFunc(newSettings, props.LineDefaults.Colors.Default);
        }
        if (shouldApply) setPlotAllSeriesSettings(newSettings);
    }, [props.MarkerDefaults]);

    // Set default channel settings
    React.useEffect(() => {
        if (props?.Plot?.Channels?.some === undefined) return;
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

        const getDefaultValue: (channel: TrendSearch.ITrendChannel, passChannelToColor: boolean) => SeriesSettings = (channel, passChannelToColor) => {
            switch (props.Plot.Type) {
                case 'Line': default: {
                    const baseLabel = constructLabel(channel);
                    const color: TrendSearch.IColor = getColor(props.LineDefaults.Colors.Default, passChannelToColor ? channel : undefined);
                    return ({
                        Channel: channel,
                        Min: { Color: color.MinColor, Width: props.LineDefaults.Min.Default.Width, Type: props.LineDefaults.Min.Default.Type, Axis: 'left', Label: baseLabel + ' min', HasData: false },
                        Avg: { Color: color.AvgColor, Width: props.LineDefaults.Avg.Default.Width, Type: props.LineDefaults.Avg.Default.Type, Axis: 'left', Label: baseLabel + ' avg', HasData: false },
                        Max: { Color: color.MaxColor, Width: props.LineDefaults.Max.Default.Width, Type: props.LineDefaults.Max.Default.Type, Axis: 'left', Label: baseLabel + ' max', HasData: false }
                    });
                }
                case 'Cyclic': {
                    return ({
                        Channel: channel, Color: SpacedColor(1, 0.9)
                    });
                }
            }
        };

        let passChannel = false;
        if (plotAllSeriesSettings == null && props.Plot.Type === "Line") {
            passChannel = true;
            colorIndex.current = { ind: -1, assetMap: new Map<string, number>() };
            if (props.LineDefaults.Colors.Default.ApplyType === "Asset") buildAssetDictionary(props.Plot.Channels);
        }
        // Get old setting if it exists, otherwise just make a new one
        setPlotAllSeriesSettings(
            props.Plot.Channels.map(channel => {
                const oldSettings = plotAllSeriesSettings?.find(oldSetting => oldSetting.Channel.ID === channel.ID)
                if (oldSettings === undefined) return getDefaultValue(channel, passChannel);
                if (props.Plot.Type === 'Line') {
                    const baseLabel = constructLabel(channel);
                    oldSettings['Min']['Label'] = baseLabel + ' min';
                    oldSettings['Avg']['Label'] = baseLabel + ' avg';
                    oldSettings['Max']['Label'] = baseLabel + ' max';
                }
                return oldSettings;
            })
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
            if (plotAllSeriesSettings[0].Channel.ChannelGroup != null) {
                title += plotAllSeriesSettings.some(series => series.Channel.ChannelGroup !== plotAllSeriesSettings[0].Channel.ChannelGroup) ?
                    "" : ` - ${plotAllSeriesSettings[0].Channel.ChannelGroup}`;
            }
            newPlot.Title = title;
            props.SetPlot(newPlot.ID, newPlot, 'Title');
        }
        if (!changedProperties.current.has('XAxisLabel')) {
            newPlot.XAxisLabel = "";
            props.SetPlot(newPlot.ID, newPlot, 'XAxisLabel');
        }

        // Need this function for vertical labels
        const vertLabelFunc = (field: 'YRightLabel' | 'YLeftLabel') => {
            const isOnAxis = (isRightAxis: boolean): boolean => (isRightAxis === ('YRightLabel' === field));
            const constructLabel = (field: keyof TrendSearch.ITrendChannel, maxUniques: number): string => {
                const foundArray = Array<string | number>(maxUniques + 1);
                let label = "";
                for (let index = 0; index < foundArray.length; index++) {
                    const firstOnAxis = plotAllSeriesSettings.find(series => isOnAxis(series['RightAxis'] ?? false) && foundArray.find(type => type === series.Channel[field]) === undefined);
                    if (firstOnAxis === undefined || firstOnAxis.Channel[field] == null) break;
                    foundArray[index] = firstOnAxis.Channel[field];
                    if (index !== 0)
                        label += '/';
                    if (index !== foundArray.length - 1)
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
        if (!props.Plot.ShowEvents || props.Plot.Channels == null || props.Plot.TimeFilter == null) return;
        const meters: number[] = props.Plot.Channels.map(item => item.MeterID); // TODO: Filter to unique ID's only
        const assets: number[] = props.Plot.Channels.map(item => item.AssetID);

        const handle = GetEventData(props.Plot.TimeFilter, meters, assets);
        return () => {
            if (handle != null && handle.abort != null) handle.abort();
        };
    }, [props.Plot.ShowEvents, props.Plot.Channels, props.Plot.TimeFilter]);

    function GetEventData(timeFilter: SEBrowser.IReportTimeFilter, meters: number[], assets: number[]): JQuery.jqXHR<any[]> {
        if (assets.length === 0 || meters.length === 0) {
            return null;
        }
        return $.ajax({
            type: "POST",
            url: `${homePath}api/OpenXDA/GetEventSearchData`,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({
                start: timeFilter.start, end: timeFilter.end,
                meterIDs: meters, assetIDs: assets, locationIDs: [], groupIDs: [],
                curveOutside: true, curveInside: true,
                numberResults: 15,
            }),
            dataType: 'json',
            cache: true,
            async: true
        }).done((data: any[]) => {
            setEventMarkers(data.map(datum => {
                const meterID = props.Plot.Channels.find(channel => channel.MeterKey === datum["Meter Key"]).MeterID;
                return { value: moment.utc(datum.Time, dateTimeFormat).valueOf(), meterID: meterID, eventID: datum["EventID"] }
            }));
        });
    }

    function navigateEvent(marker: TrendSearch.IEventMarker): () => void {
        const meter: SystemCenter.Types.DetailedMeter = {
            ID: marker.meterID,
            AssetKey: '',
            Name: '',
            Location: '',
            MappedAssets: 0,
            Make: '',
            Model: ''
        }
        const time = moment.utc(marker.value, "x");
        const timeFilter: SEBrowser.IReportTimeFilter = {
            start: time.format(dateTimeFormat),
            end: time.format(dateTimeFormat),
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

    const handleDropChannel = React.useCallback((event: any) => {
        event.preventDefault();
        // Note: if we're in dragmode, it shouldn't be the wrong data coming in but we should check anyway
        if (!props.DragMode) {
            const data = JSON.parse(event.dataTransfer.getData('text/plain'));
            if (data?.length == null) return;
            let allChannels = props.Plot.Channels.concat(data);
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
        }
    }, [props.Plot.Channels, props.SetPlot]);

    // Used in both drag-n-drops
    const handleDragOverChannel = React.useCallback((event: any) => {
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

    const createCustomButton = React.useCallback((cSymbol: string, cSelect: customSelects, cCursor: string, cHighlight: 'none' | 'horizontal' | 'vertical') =>
        <Button onClick={() => {
            setCustomSelect(cSelect);
            setCustomCursor(cCursor);
            setLineHighlight(cHighlight);
            return () => { setCustomSelect(defaultSelect); setLineHighlight(defaultHighlight); setCustomCursor(defaultCursor); };
        }} isSelect={true}>
            {cSymbol}
        </Button>
        , [setCustomSelect, setCustomCursor, setLineHighlight]);

    const createMarker = React.useCallback((time: number, values: number[]) => {
        // Todo: Make this a toggle
        const axis = 'left';
        const axisNumber = AxisMap.get(axis);
        let isHori = false;
        switch (customSelect) {
            case "symbol": {
                const currentMarkers = [...symbolicMarkers];
                const newMarker = _.cloneDeep(props.MarkerDefaults.Symb.Default);
                newMarker.ID = CreateGuid();
                newMarker.xPos = time;
                newMarker.yPos = values[axisNumber];
                newMarker.axis = axis;
                newMarker.xBox = time;
                newMarker.yBox = values[axisNumber];
                currentMarkers.push(newMarker);
                setSymbolicMarkers(currentMarkers);
                return;
            }
            case "horizontal":
                isHori = true;
            // falls through
            case "vertical": {
                const currentMarkers = [...horiVertMarkers];
                const newMarker = _.cloneDeep(props.MarkerDefaults.VeHo.Default);
                newMarker.ID = CreateGuid();
                newMarker.value = isHori ? values[axisNumber] : time;
                newMarker.axis = axis;
                newMarker.isHori = isHori;
                currentMarkers.push(newMarker);
                setHoriVertMarkers(currentMarkers);
                return;
            }
            default: return;
        }
    }, [symbolicMarkers, setSymbolicMarkers, horiVertMarkers, setHoriVertMarkers, customSelect]);

    const setSymbolic = React.useCallback((ID: string, value: any, field: keyof (TrendSearch.ISymbolic)) => {
        const index = symbolicMarkers.findIndex(item => item.ID === ID);
        const newList: any[] = [...symbolicMarkers];
        newList[index][field] = value;
        setSymbolicMarkers(newList);
    }, [symbolicMarkers, setSymbolicMarkers]);

    const setVertHori = React.useCallback((ID: string, value: number) => {
        const index = horiVertMarkers.findIndex(item => item.ID === ID);
        const newList: any[] = [...horiVertMarkers];
        newList[index]["value"] = value;
        setHoriVertMarkers(newList);
    }, [horiVertMarkers, setHoriVertMarkers]);

    const setHoverPosition = React.useCallback((xArg: number, yArg: number) => {
        setMousePosition({ x: xArg, y: yArg })
    }, [setMousePosition]);

    let plotBody = null;
    if (props.DragMode)
        plotBody = (
            <>
                <h4 style={{ textAlign: "center", userSelect: 'none' }}>{props.Plot.Title}</h4>
                <DragHalf isLeft={true} plotID={props.Plot.ID} splicePlot={props.SplicePlot} />
                <DragHalf isLeft={false} plotID={props.Plot.ID} splicePlot={props.SplicePlot} />
            </>
        );
    else {
        switch (props.Plot.Type) {
            case 'Line':
                plotBody = (
                    <LineGraph
                        ID={props.Plot.ID}
                        ChannelInfo={plotAllSeriesSettings as TrendSearch.ILineSeries[]}
                        SetChannelInfo={setPlotAllSeriesSettings}
                        TimeFilter={props.Plot.TimeFilter} PlotFilter={props.Plot.PlotFilter}
                        Title={props.Plot.Title}
                        XAxisLabel={props.Plot.XAxisLabel} YLeftLabel={props.Plot.YLeftLabel} YRightLabel={props.Plot.YRightLabel}
                        MouseHighlight={lineHighlight}
                        SetExtraSpace={setExtraHeight}
                        Height={chartHeight} Width={chartWidth}
                        Metric={props.Plot.Metric}
                        Cursor={customCursor}
                        AxisZoom={props.Plot.AxisZoom} DefaultZoom={props.Plot.DefaultZoom}
                        OnSelect={createMarker}
                        AlwaysRender={[overlayButton, closeButton]}>
                        {props.Plot.ShowEvents ? eventMarkers.map((marker, i) => {
                            if (eventSettings.type === "Event-Vert")
                                return (
                                    <VerticalMarker key={"Event_" + i} axis={eventSettings.axis}
                                        Value={marker.value} color={eventSettings.color} lineStyle={eventSettings.line} width={eventSettings.width}
                                        onClick={() => { if (customSelect !== "drag") return; navigateEvent(marker); }} />)
                            else
                                return (
                                    <SymbolicMarker key={"Marker_" + i} style={{ color: eventSettings.color }} axis={eventSettings.axis}
                                        usePixelPositioning={{ x: false, y: true }} xPos={marker.value} yPos={eventSettings.alignTop ? 11 : -11} radius={12}>
                                        {eventSettings.symbol}
                                    </SymbolicMarker>);
                        }) : null}
                        {horiVertMarkers.map((marker, i) => {
                            if (marker.isHori)
                                return (
                                    <HorizontalMarker key={"Hori_" + i} axis={marker.axis}
                                        Value={marker.value} color={marker.color} lineStyle={marker.line} width={marker.width}
                                        setValue={(value) => { if (customSelect !== "drag") return; setVertHori(marker.ID, value); }} />);
                            return (
                                <VerticalMarker key={"Vert_" + i} axis={marker.axis}
                                    Value={marker.value} color={marker.color} lineStyle={marker.line} width={marker.width}
                                    setValue={(value) => { if (customSelect !== "drag") return; setVertHori(marker.ID, value); }} />);
                        })}
                        {symbolicMarkers.map((marker, i) =>
                            <SymbolicMarker key={"Marker_" + i} style={{ color: marker.color }} axis={marker.axis}
                                xPos={marker.xPos} yPos={marker.yPos} radius={marker.radius}
                                setPosition={(x, y) => { if (customSelect !== "drag") return; setSymbolic(marker.ID, x, 'xPos'); setSymbolic(marker.ID, y, 'yPos'); setSymbolic(marker.ID, x, 'xBox'); setSymbolic(marker.ID, y, 'yBox'); }}>
                                {marker.symbol}
                            </SymbolicMarker>
                        )}
                        {symbolicMarkers.map((marker, i) =>
                            <Infobox key={"Info_" + i} origin="upper-center" axis={marker.axis}
                                x={marker.xBox} y={marker.yBox} opacity={marker.opacity}
                                childId={"Info_" + i} offset={15} disallowSnapping={true}
                                setPosition={(x, y) => { if (customSelect !== "drag") return; setSymbolic(marker.ID, x, 'xBox'); setSymbolic(marker.ID, y, 'yBox'); }}>
                                <div id={"Info_" + i} style={{
                                    display: 'inline-block', background: `rgba(255, 255, 255, ${marker.opacity})`, color: marker.fontColor,
                                    overflow: 'visible', whiteSpace: 'pre-wrap', fontSize: `${marker.fontSize}em`
                                }}>
                                    {`${moment.utc(marker.xPos).format(marker.format)}\n${marker.yPos.toFixed(2)}\n${marker.note}`}
                                </div>
                            </Infobox>
                        )}
                        {customSelect === "drag" ? null :
                            <Infobox key={"MouseOver"} origin={generalSettings.MoveOptionsLeft ? "upper-left" : "upper-right"}
                                x={generalSettings.MoveOptionsLeft ? 5 : -5} y={25} opacity={0.4} childId={"mouseInfo"} usePixelPositioning={true}
                                onMouseMove={setHoverPosition}>
                                <div id={"mouseInfo"} style={{ display: 'inline-block', background: 'white', overflow: 'visible', whiteSpace: 'pre-wrap', opacity: 0.7 }}>
                                    {`${moment.utc(mousePosition.x).format("HH:mm:SS")}\n${mousePosition.y.toFixed(2)}`}
                                </div>
                            </Infobox>}
                        {createCustomButton(Plus, "symbol", "crosshair", "vertical")}
                        {createCustomButton("-", "horizontal", "crosshair", "horizontal")}
                        {createCustomButton("|", "vertical", "crosshair", "vertical")}
                    </LineGraph>
                );
                break;
            case ('Cyclic'):
                plotBody = (
                    <CyclicHistogram
                        ID={props.Plot.ID}
                        ChannelInfo={(plotAllSeriesSettings?.length ?? 0) > 0 ? plotAllSeriesSettings[0] as ICyclicSeries : null}
                        TimeFilter={props.Plot.TimeFilter} PlotFilter={props.Plot.PlotFilter}
                        Title={props.Plot.Title}
                        XAxisLabel={props.Plot.XAxisLabel} YAxisLabel={props.Plot.YLeftLabel}
                        MouseHighlight={lineHighlight}
                        SetExtraSpace={setExtraHeight}
                        Height={chartHeight} Width={chartWidth}
                        Metric={props.Plot.Metric}
                        Cursor={customCursor}
                        AxisZoom={props.Plot.AxisZoom} DefaultZoom={props.Plot.DefaultZoom}
                        OnSelect={createMarker}
                        AlwaysRender={[overlayButton, closeButton]} />
                );
                break;
        }
    }
    return (
        <div id={props.Plot.ID} className="col"
            style={{
                width: (props.Plot.Width ?? 100) + '%', height: `calc(${(props.Plot.Height ?? 50)}% + ${extraHeight}px)`, float: 'left',
                border: (trendDatasettings.BorderPlots ? "thin black solid" : undefined)
            }}
            ref={chartRef} onDragOver={handleDragOverChannel} onDrop={handleDropChannel}>
            {plotBody}
            <SettingsModal SetShow={setShowSettings} Show={showSettings}
                Plot={props.Plot} SetPlot={handleSetPlot} SeriesSettings={plotAllSeriesSettings} SetSeriesSettings={setPlotAllSeriesSettings}
                SymbolicMarkers={symbolicMarkers} SetSymbolicMarkers={setSymbolicMarkers} VertHoriMarkers={horiVertMarkers} SetVertHoriMarkers={setHoriVertMarkers}
                EventSettings={eventSettings} SetEventSettings={setEventSettings} />
        </div>
    );
};

interface IDragHalf {
    isLeft: boolean,
    plotID: string,
    splicePlot: (idNear: string, idOf: string, beforeNear: boolean) => void
}
const DragHalf: React.FunctionComponent<IDragHalf> = (props) => {
    const [isHovered, setHovered] = React.useState<boolean>(false);

    const handleDrop = React.useCallback((event: any) => {
        event.preventDefault();
        setHovered(false);
        const data = JSON.parse(event.dataTransfer.getData('text/plain'));
        if (data?.length != null) return;
        if (props.plotID === data.ID) return;
        props.splicePlot(props.plotID, data.ID, props.isLeft);
    }, [props.plotID, props.splicePlot, props.isLeft]);

    const handleDragOver = React.useCallback((event: any) => {
        event.preventDefault();
    }, []);

    const handleDragEnter = React.useCallback(() => {
        setHovered(true);
    }, [setHovered]);

    const handleDragLeave = React.useCallback(() => {
        setHovered(false);
    }, [setHovered]);

    const handleDragStart = React.useCallback((event: any) => {
        event.dataTransfer.setData("text/plain", JSON.stringify({ ID: props.plotID }));
    }, [isHovered, props.plotID]);

    return (
        <div className="col" style={{ height: 'calc(100% - 43px)', width: '50%', padding: '0px', float: (props.isLeft ? 'left' : 'right') }}
            onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDragStart={handleDragStart} onDrop={handleDrop} draggable={true}>
            <div className="col" style={{
                backgroundColor: "grey", borderRadius: (props.isLeft ? '25px 0px 0px 25px' : '0px 25px 25px 0px'),
                width: 'calc(100% - 40px)', height: '100%', float: (props.isLeft ? 'right' : 'left'), userSelect: 'none'
            }} />
            <div className="col" style={{ width: '40px', height: '100%', justifyContent: 'center', float: (props.isLeft ? 'left' : 'right'), userSelect: 'none' }}>
                <div style={{ backgroundColor: (isHovered ? "black" : undefined), height: '100%', width: '5px' }} />
            </div>
        </div>
    );
}

export default TrendPlot;
