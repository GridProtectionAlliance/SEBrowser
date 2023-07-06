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
import { CreateGuid } from '@gpa-gemstone/helper-functions';
import { CrossMark, Pencil, Plus } from '@gpa-gemstone/gpa-symbols';
import { Button, SymbolicMarker, Infobox } from '@gpa-gemstone/react-graph';
import { LineGraph, ILineSeries } from './LineGraph';
import { IMultiCheckboxOption, SEBrowser } from '../../../global';
import { SettingsOverlay } from './SettingsOverlay';
import { ToolTip } from '@gpa-gemstone/react-interactive';
import moment from 'moment';

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

type SeriesSettings = ILineSeries;

const TrendPlot = React.memo((props: IContainerProps) => {
    // Sizing Variables
    const chartRef = React.useRef(null);
    const [chartWidth, setChartWidth] = React.useState<number>(500);
    const [chartHeight, setChartHeight] = React.useState<number>(500);

    // Plot Saved Settings
    const [plotAllSeriesSettings, setPlotAllSeriesSettings] = React.useState<SeriesSettings[]>(null);

    // Plot Markers
    const [markers, setMarkers] = React.useState<IMarker[]>([]);

    // Settings Controls
    const [showSettings, setShowSettings] = React.useState<boolean>(false);
    const makeMode = React.useRef<boolean>(false);

    // Get Heights and Widths
    React.useLayoutEffect(() => {
        setChartWidth(chartRef?.current?.offsetWidth ?? 500);
        setChartHeight(chartRef?.current?.offsetHeight ?? 500);
    });

    // Handle the overlay
    React.useEffect(() => {
        props.HandleOverlay(showSettings);
    }, [showSettings]);

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
            {CrossMark}
        </Button>);

    const overlayButton = (
        <Button onClick={() => setShowSettings(!showSettings)}>
            {Pencil}
        </Button>);

    const addMarkerButton = (
        <Button onClick={() => {
            makeMode.current = true;
            return () => { makeMode.current = false; };
        }} isSelect={true}>
            {Plus}
        </Button>
        );

    const createMarker = React.useCallback((time: number, value: number) => {
        console.log(makeMode.current);
        // Means our custom select is not selected
        if (!makeMode.current) return;
        const currentMarkers = [...markers];
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
        setMarkers(currentMarkers);
        return;
    }, [markers, setMarkers]);

    const setMarker = React.useCallback((ID: string, value: any, field: keyof (IMarker)) => {
        const index = markers.findIndex(item => item.ID === ID);
        const newList: any[] = [...markers];
        newList[index][field] = value;
        setMarkers(newList);
        return true;
    }, [markers, setMarkers]);

    return (
        <div className="col" style={{ width: props.Plot.Width - 1 + '%', height: props.Plot.Height-1 + '%', float: 'left' }} ref={chartRef} onDragOver={handleDragOver} onDrop={handleChannelDrop}>
            <div className="row">
                {props.Plot.Type === 'Line' ?
                    <LineGraph ChannelInfo={plotAllSeriesSettings} TimeFilter={props.Plot.TimeFilter} PlotFilter={props.Plot.PlotFilter}
                        Title={props.Plot.Title} XAxisLabel={props.Plot.XAxisLabel} Height={chartHeight} Width={chartWidth} Metric={props.Plot.Metric}
                        OnSelect={createMarker}> 
                        {markers.map((marker, i) =>
                            <SymbolicMarker key={"Marker_" + i}
                                xPos={marker.xPos} yPos={marker.yPos} radius={marker.radius}
                                setPosition={(x, y) => { if (makeMode.current) return; setMarker(marker.ID, x, 'xPos'); setMarker(marker.ID, y, 'yPos'); setMarker(marker.ID, x, 'xBox'); setMarker(marker.ID, y, 'yBox'); }}>
                                <>{marker.symbol}</>
                            </SymbolicMarker>
                        )}
                        {markers.map((marker, i) =>
                            <Infobox key={"Info_" + i} origin="upper-center"
                                x={marker.xBox} y={marker.yBox} opacity={marker.opacity}
                                width={100} height={80} offset={15}
                                setPosition={(x, y) => { if (makeMode.current) return; setMarker(marker.ID, x, 'xBox'); setMarker(marker.ID, y, 'yBox'); }}>
                                <div style={{ background: 'white', overflow: 'auto', whiteSpace: 'pre-wrap', opacity: marker.opacity ?? 1 }}>
                                    {`(X:${moment(marker.xPos).format("mm:ss.SS")}, Y:${marker.yPos.toFixed(2)})\n${marker.note}`}
                                </div>
                            </Infobox>
                        )}
                        {addMarkerButton} {overlayButton} {closeButton}
                    </LineGraph> : null}
            </div>
            <SettingsOverlay SeriesSettings={plotAllSeriesSettings} SetSeriesSettings={setPlotAllSeriesSettings} SetShow={setShowSettings} Show={showSettings} SetPlot={props.SetPlot}
            OverlayPortalID={props.OverlayPortalID} Plot={props.Plot} Markers={markers} SetMarkers={setMarkers} />
        </div>
    );
});

export { TrendPlot, ITrendPlot, IMarker };
