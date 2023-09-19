//******************************************************************************************************
//  SettingsOverlay.tsx - Gbtc
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
//  06/12/23 - Gabriel Santos
//       Generated original version of source code.
//
//******************************************************************************************************
import React from 'react';
import _ from 'lodash';
import { Portal } from 'react-portal';
import { ILineSeries } from '../TrendPlot/LineGraph';
import { ICyclicSeries } from '../TrendPlot/CyclicHistogram';
import { TrendSearch } from '../../../global';
import { TabSelector, Warning } from '@gpa-gemstone/react-interactive';
import { PlotSettings } from './PlotSettings';
import { MarkerTab } from './OverlayTabs/MarkerTab';
import { ChannelTab } from './OverlayTabs/ChannelTab';

interface IOverlayProps {
    // Manage Plot
    Plot: TrendSearch.ITrendPlot,
    SetPlot: (id: string, record: TrendSearch.ITrendPlot, field: keyof (TrendSearch.ITrendPlot)) => void,
    // Manage Markers
    Markers: TrendSearch.IMarker[],
    SetMarkers: (markers: TrendSearch.IMarker[]) => void,
    // Assumption that this doesnt change outside of this overlay
    SeriesSettings?: SeriesSettings[]
    SetSeriesSettings: (newSettings: SeriesSettings[]) => void
    // Manage Overlay
    Show: boolean,
    SetShow: (value: boolean) => void,
    OverlayPortalID: string
}

export type SeriesSettings = ILineSeries | ICyclicSeries;

const SettingsOverlay = React.memo((props: IOverlayProps) => {
    // Settings Controls
    const [tab, setTab] = React.useState<string>("plot");
    const [confirmDisabled, setConfirmDisabled] = React.useState<boolean>(false);


    // Settings Buffers
    const [plotBuffer, setPlotBuffer] = React.useState<TrendSearch.ITrendPlot>(null);
    const [seriesBuffer, setSeriesBuffer] = React.useState<SeriesSettings[]>([]);
    const [channelsBuffer, setChannelsBuffer] = React.useState<TrendSearch.ITrendChannel[]>([]);
    const [markersBuffer, setMarkersBuffer] = React.useState<TrendSearch.IMarker[]>([]);

    // Create Settings Buffers
    React.useEffect(() => {
        setPlotBuffer(props.Plot);
    }, [props.Plot]);

    React.useEffect(() => {
        setSeriesBuffer(props.SeriesSettings);
    }, [props.SeriesSettings]);

    React.useEffect(() => {
        setChannelsBuffer(props.Plot.Channels);
    }, [props.Plot.Channels]);

    React.useEffect(() => {
        setMarkersBuffer(props.Markers);
    }, [props.Markers]);

    function checkAndSetValue(record: TrendSearch.ITrendPlot, field: keyof (TrendSearch.ITrendPlot)): void {
        if (!_.isEqual(props.Plot[field], record[field]))
            props.SetPlot(props.Plot.ID, record, field);
    }

    const Tabs = [
        { Id: "plot", Label: "Plot" },
        { Id: "marks", Label: "Marker" },
        { Id: "series", Label: "Channel" }
    ];

    if (!props.Show) return null;
    return (
        <Portal node={document && document.getElementById(props.OverlayPortalID)}>
            <div className="card">
                <div className="card-header">
                    <h4 className="modal-title">{`Change Plot: ${props.Plot.Title ?? `${props.Plot.Channels.length} Channel ${props.Plot.Type} Plot`}`}</h4>
                </div>
                <div className="card-body" style={{ maxHeight: 'calc(100% - 210px)', overflowY: 'auto' }}>
                    <TabSelector CurrentTab={tab} SetTab={setTab} Tabs={Tabs} />
                    <hr />
                    <div className="tab-content" style={{ maxHeight: window.innerHeight - 235, overflow: 'hidden' }}>
                        <div className={"tab-pane " + (tab == "plot" ? " active" : "fade")} id="plot">
                            <PlotSettings Plot={plotBuffer} SetPlot={setPlotBuffer} SetConfirmDisabled={setConfirmDisabled} />
                        </div>
                    </div>
                    <div className="tab-content" style={{ maxHeight: window.innerHeight - 235, overflow: 'hidden' }}>
                        <div className={"tab-pane " + (tab == "series" ? " active" : "fade")} id="series">
                            <ChannelTab Type={props.Plot.Type} SetChannels={setChannelsBuffer} Channels={channelsBuffer} SeriesSettings={seriesBuffer} SetSeriesSettings={setSeriesBuffer} />
                        </div>
                    </div>
                    <div className="tab-content" style={{ maxHeight: window.innerHeight - 235, overflow: 'hidden' }}>
                        <div className={"tab-pane " + (tab == "marks" ? " active" : "fade")} id="marks">
                            <MarkerTab Markers={markersBuffer} SetMarkers={setMarkersBuffer}/>
                        </div>
                    </div>
                </div>
                <div className="card-footer">
                    <button type="button"
                        className={`btn btn-primary ${confirmDisabled ? 'disabled ' : ''}float-left`}
                        onClick={() => {
                            if (confirmDisabled) return;
                            // Each of the fields that are set global to all channels (do this field by field to avoid unneccessary rerenders)
                            const plotSettings = { ...plotBuffer };
                            plotSettings.Channels = channelsBuffer;
                            Object.keys(plotSettings).forEach(field => checkAndSetValue(plotSettings, field as keyof (TrendSearch.ITrendPlot)));
                            // Do other settings
                            props.SetSeriesSettings(seriesBuffer);
                            props.SetMarkers(markersBuffer);
                            props.SetShow(false);
                        }}>Save Changes</button>
                    <button type="button"
                        className={'btn btn-cancel float-right'}
                        onClick={() => {
                            setPlotBuffer(props.Plot);
                            props.SetShow(false);
                        }}>Discard Changes</button>
                </div>
            </div>
        </Portal>
    );
});

export { SettingsOverlay };