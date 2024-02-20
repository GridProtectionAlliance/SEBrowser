//******************************************************************************************************
//  SettingsModal.tsx - Gbtc
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
//  02/06/24 - Gabriel Santos
//       Overhauled to use modals
//
//******************************************************************************************************
import React from 'react';
import _ from 'lodash';
import { ILineSeries } from '../TrendPlot/LineGraph';
import { ICyclicSeries } from '../TrendPlot/CyclicHistogram';
import { TrendSearch } from '../../../global';
import { TabSelector, Modal } from '@gpa-gemstone/react-interactive';
import { PlotSettings } from './PlotSettings';
import { MarkerTab } from './OverlayTabs/MarkerTab';
import { ChannelTab } from './OverlayTabs/ChannelTab';

interface IOverlayProps {
    // Manage Plot
    Plot: TrendSearch.ITrendPlot,
    SetPlot: (id: string, record: TrendSearch.ITrendPlot, field: keyof (TrendSearch.ITrendPlot)) => void,
    // Manage Markers
    SymbolicMarkers: TrendSearch.ISymbolic[],
    SetSymbolicMarkers: (markers: TrendSearch.ISymbolic[]) => void,
    VertHoriMarkers: TrendSearch.IVertHori[],
    SetVertHoriMarkers: (markers: TrendSearch.IVertHori[]) => void,
    EventSettings: TrendSearch.EventMarkerSettings,
    SetEventSettings: (setting: TrendSearch.EventMarkerSettings) => void,
    // Assumption that this doesnt change outside of this overlay
    SeriesSettings?: SeriesSettings[]
    SetSeriesSettings: (newSettings: SeriesSettings[]) => void
    // Manage Overlay
    Show: boolean,
    SetShow: (value: boolean) => void,
    OverlayPortalID: string
}

export type SeriesSettings = ILineSeries | ICyclicSeries;

const SettingsModal = React.memo((props: IOverlayProps) => {
    // Settings Controls
    const [tab, setTab] = React.useState<string>("plot");
    const [confirmDisabled, setConfirmDisabled] = React.useState<boolean>(false);
    // Plot Tab Buffers
    const [plotBuffer, setPlotBuffer] = React.useState<TrendSearch.ITrendPlot>(null);
    // Channels Tab Buffers
    const [seriesBuffer, setSeriesBuffer] = React.useState<SeriesSettings[]>([]);
    const [channelsBuffer, setChannelsBuffer] = React.useState<TrendSearch.ITrendChannel[]>([]);
    // Markers Tab Buffers
    const [symbolicsBuffer, setSymbolicsBuffer] = React.useState<TrendSearch.ISymbolic[]>([]);
    const [markersBuffer, setMarkersBuffer] = React.useState<TrendSearch.IVertHori[]>([]);
    const [eventBuffer, setEventBuffer] = React.useState<TrendSearch.EventMarkerSettings>(null);

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
        setSymbolicsBuffer(props.SymbolicMarkers);
    }, [props.SymbolicMarkers]);

    React.useEffect(() => {
        setMarkersBuffer(props.VertHoriMarkers);
    }, [props.VertHoriMarkers]);

    React.useEffect(() => {
        setEventBuffer(props.EventSettings);
    }, [props.EventSettings]);

    function checkAndSetValue(record: TrendSearch.ITrendPlot, field: keyof (TrendSearch.ITrendPlot)): void {
        if (!_.isEqual(props.Plot[field], record[field]))
            props.SetPlot(props.Plot.ID, record, field);
    }

    const Tabs = [
        { Id: "plot", Label: "Plot" },
        { Id: "marks", Label: "Marker" },
        { Id: "series", Label: "Channel" }
    ];

    return (
        <Modal Title={`Change Plot: ${props.Plot.Title ?? `${props.Plot.Channels.length} Channel ${props.Plot.Type} Plot`}`} ShowX={false} Size='xlg'
            ShowConfirm={true} ConfirmText='Save Changes' DisableConfirm={confirmDisabled} ShowCancel={true} CancelText='Discard Changes'
            Show={props.Show} CallBack={(conf) => {
                if (conf) {
                    // Each of the fields that are set global to all channels (do this field by field to avoid unneccessary rerenders)
                    const plotSettings = { ...plotBuffer };
                    plotSettings.Channels = channelsBuffer;
                    Object.keys(plotSettings).forEach(field => checkAndSetValue(plotSettings, field as keyof (TrendSearch.ITrendPlot)));
                    // Do other settings
                    props.SetSeriesSettings(seriesBuffer);
                    props.SetSymbolicMarkers(symbolicsBuffer);
                    props.SetVertHoriMarkers(markersBuffer);
                    props.SetEventSettings(eventBuffer);

                } else {
                    // Reset buffers
                    setPlotBuffer(props.Plot);
                    setSeriesBuffer(props.SeriesSettings);
                    setChannelsBuffer(props.Plot.Channels);
                    setSymbolicsBuffer(props.SymbolicMarkers);
                    setMarkersBuffer(props.VertHoriMarkers);
                    setEventBuffer(props.EventSettings);
                }
                setTab("plot");
                props.SetShow(false);

        }}>
            <TabSelector CurrentTab={tab} SetTab={setTab} Tabs={Tabs} />
            <div className="tab-content" style={{ overflow: 'hidden' }}>
            <div className="tab-content" style={{ maxHeight: window.innerHeight - 235, overflow: 'hidden' }}>
                <div className={"tab-pane " + (tab == "plot" ? " active" : "fade")} id="plot">
                    <PlotSettings Plot={plotBuffer} SetPlot={setPlotBuffer} SetConfirmDisabled={setConfirmDisabled} />
                </div>
            </div>
            <div className="tab-content" style={{ overflow: 'hidden' }}>
                <div className={"tab-pane " + (tab == "series" ? " active" : "fade")} id="series">
                    <ChannelTab Type={props.Plot.Type} SetChannels={setChannelsBuffer} Channels={channelsBuffer} SeriesSettings={seriesBuffer} SetSeriesSettings={setSeriesBuffer} />
                </div>
            </div>
            <div className="tab-content" style={{ overflow: 'hidden' }}>
                <div className={"tab-pane " + (tab == "marks" ? " active" : "fade")} id="marks">
                    <MarkerTab VeHoMarkers={markersBuffer} SetVeHoMarkers={setMarkersBuffer} SymbMarkers={symbolicsBuffer} SetSymbMarkers={setSymbolicsBuffer}
                        EventSettings={eventBuffer} SetEventSettings={setEventBuffer} DisplayEventSettings={plotBuffer?.ShowEvents ?? false} />
                </div>
            </div>
        </Modal>
    );
});

const LineTypeOptions = [{ Label: "Dashed", Value: ":" }, { Label: "Solid", Value: "-" }];
const AxisOptions = [{ Label: "Right", Value: "right" }, { Label: "Left", Value: "left" }];

export { SettingsModal, LineTypeOptions, AxisOptions };