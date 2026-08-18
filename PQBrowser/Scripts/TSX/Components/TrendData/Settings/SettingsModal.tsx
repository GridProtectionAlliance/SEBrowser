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
import { TrendSearch } from '../../../global';
import { TabSelector, Modal } from '@gpa-gemstone/react-interactive';
import type { ITrendWidgetSettings } from '../TrendPlot/TrendWidgetRegistry';

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
    SeriesSettings?: TrendSearch.ISeriesSettings[]
    SetSeriesSettings: (newSettings: TrendSearch.ISeriesSettings[]) => void
    // Manage Overlay
    Show: boolean,
    SetShow: (value: boolean) => void,
    Settings?: ITrendWidgetSettings
}

const SettingsModal = React.memo((props: IOverlayProps) => {
    // Settings Controls
    const [tab, setTab] = React.useState<string>("plot");
    const [confirmDisabled, setConfirmDisabled] = React.useState<boolean>(false);
    // Plot Tab Buffers
    const [plotBuffer, setPlotBuffer] = React.useState<TrendSearch.ITrendPlot | null>(null);
    // Channels Tab Buffers
    const [seriesBuffer, setSeriesBuffer] = React.useState<TrendSearch.ISeriesSettings[]>([]);
    const [channelsBuffer, setChannelsBuffer] = React.useState<TrendSearch.ITrendChannel[]>([]);
    // Markers Tab Buffers
    const [symbolicsBuffer, setSymbolicsBuffer] = React.useState<TrendSearch.ISymbolic[]>([]);
    const [markersBuffer, setMarkersBuffer] = React.useState<TrendSearch.IVertHori[]>([]);
    const [eventBuffer, setEventBuffer] = React.useState<TrendSearch.EventMarkerSettings | null>(null);

    // Create Settings Buffers
    React.useEffect(() => {
        setPlotBuffer(props.Plot);
    }, [props.Plot]);

    React.useEffect(() => {
        setSeriesBuffer(props.SeriesSettings ?? []);
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

    const PlotSettings = props.Settings?.Plot;
    const MarkerSettings = props.Settings?.Marker;
    const ChannelSettings = props.Settings?.Channel;
    const tabs = [
        PlotSettings == null ? null : { Id: "plot", Label: "Plot" },
        MarkerSettings == null ? null : { Id: "marks", Label: "Marker" },
        ChannelSettings == null ? null : { Id: "series", Label: "Channel" }
    ].filter(tab => tab != null);

    React.useEffect(() => {
        if (props.Show && !tabs.some(settingsTab => settingsTab.Id === tab))
            setTab(tabs[0]?.Id ?? "plot");
    }, [props.Show, PlotSettings, MarkerSettings, ChannelSettings, tab]);

    function checkAndSetValue(record: TrendSearch.ITrendPlot, field: keyof (TrendSearch.ITrendPlot)): void {
        if (!_.isEqual(props.Plot[field], record[field]))
            props.SetPlot(props.Plot.ID, record, field);
    }

    return (
        <Modal 
        Title={`Change Plot: ${props.Plot.Title ?? `${props.Plot.Channels.length} Channel ${props.Plot.Type} Plot`}`} 
        ShowX={false} 
        Size='xlg'
            ShowConfirm={true} 
            ConfirmText='Save Changes' 
            DisableConfirm={confirmDisabled} 
            ShowCancel={true} 
            CancelText='Discard Changes'
            Show={props.Show} 
            CallBack={(conf) => {
                if (conf) {
                    // Each of the fields that are set global to all channels (do this field by field to avoid unneccessary rerenders)
                    const plotSettings = { ...plotBuffer };
                    if (ChannelSettings != null) plotSettings.Channels = channelsBuffer;
                    if (PlotSettings != null || ChannelSettings != null)
                        Object.keys(plotSettings).forEach(field => checkAndSetValue(plotSettings, field as keyof (TrendSearch.ITrendPlot)));
                    // Do other settings
                    if (ChannelSettings != null) props.SetSeriesSettings(seriesBuffer);
                    if (MarkerSettings != null) {
                        props.SetSymbolicMarkers(symbolicsBuffer);
                        props.SetVertHoriMarkers(markersBuffer);
                        props.SetEventSettings(eventBuffer);
                    }

                } else {
                    // Reset buffers
                    setPlotBuffer(props.Plot);
                    setSeriesBuffer(props.SeriesSettings ?? []);
                    setChannelsBuffer(props.Plot.Channels);
                    setSymbolicsBuffer(props.SymbolicMarkers);
                    setMarkersBuffer(props.VertHoriMarkers);
                    setEventBuffer(props.EventSettings);
                }
                setTab(tabs[0]?.Id ?? "plot");
                props.SetShow(false);

            }}>
            <TabSelector
             CurrentTab={tab}
              SetTab={setTab} 
              Tabs={tabs}
               />
            {PlotSettings == null ? null :
                <div className="tab-content" style={{ overflow: 'hidden' }}>
                    <div className={"tab-pane " + (tab == "plot" ? " active" : "fade")} id="plot">
                        <PlotSettings
                            Plot={plotBuffer}
                            SetPlot={setPlotBuffer}
                            SetConfirmDisabled={setConfirmDisabled}
                            IsGlobalSettings={false}
                        />
                    </div>
                </div>
            }
            {ChannelSettings == null ? null :
                <div className="tab-content" style={{ overflow: 'hidden' }}>
                    <div className={"tab-pane " + (tab == "series" ? " active" : "fade")} id="series">
                        <ChannelSettings
                            PlotFilter={plotBuffer?.PlotFilter ?? []}
                            SetChannels={setChannelsBuffer}
                            Channels={channelsBuffer}
                            SeriesSettings={seriesBuffer}
                            SetSeriesSettings={setSeriesBuffer}
                        />
                    </div>
                </div>
            }
            {MarkerSettings == null ? null :
                <div className="tab-content" style={{ overflow: 'hidden' }}>
                    <div className={"tab-pane " + (tab == "marks" ? " active" : "fade")} id="marks">
                        <MarkerSettings
                            VeHoMarkers={markersBuffer}
                            SetVeHoMarkers={setMarkersBuffer}
                            SymbMarkers={symbolicsBuffer}
                            SetSymbMarkers={setSymbolicsBuffer}
                            EventSettings={eventBuffer}
                            SetEventSettings={setEventBuffer}
                            DisplayEventSettings={plotBuffer?.ShowEvents ?? false}
                            IsGlobalSettings={false}
                            XAxisType={plotBuffer?.Type === 'Histogram' ? 'value' : 'time'}
                        />
                    </div>
                </div>
            }
        </Modal>
    );
});

const LineTypeOptions = [{ Label: "Solid", Value: "solid" }, { Label: "Short Dashes", Value: "short-dash" }, { Label: "Dashes", Value: "dash" }, { Label: "Long Dashes", Value: "long-dash" }];
const AxisOptions = [{ Label: "Right", Value: "right" }, { Label: "Left", Value: "left" }];

export { SettingsModal, LineTypeOptions, AxisOptions };
