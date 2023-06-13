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
import { BlockPicker } from 'react-color';
import { ILineSeries } from './LineGraph';
import { IMultiCheckboxOption } from '../../../global';
import ReportTimeFilter from '../../ReportTimeFilter';
import { Input, MultiCheckBoxSelect, Select } from '@gpa-gemstone/react-forms';
import { SpacedColor } from '@gpa-gemstone/helper-functions';
import TrendChannelTable from '../TrendChannelTable';
import { TabSelector, Warning } from '@gpa-gemstone/react-interactive';
import { ITrendPlot } from './TrendPlot';
import { PlotSettings } from './PlotSettings';

interface IOverlayProps {
    // Manage Plot
    Plot: ITrendPlot,
    SetPlot: (id: string, record: ITrendPlot, field: keyof (ITrendPlot)) => void,
    // Assumption that this doesnt change outside of this overlay
    SeriesSettings?: SeriesSettings[]
    SetSeriesSettings: (newSettings: SeriesSettings[]) => void
    // Manage Overlay
    Show: boolean,
    SetShow: (value: boolean) => void,
    OverlayPortalID: string
}

type SeriesSettings = ILineSeries;

const SettingsOverlay = React.memo((props: IOverlayProps) => {
    // Sizing Variables
    const sideSettingRef = React.useRef(null);
    const [settingsHeight, setSettingsHeight] = React.useState<number>(500);

    // Settings Controls
    const [tab, setTab] = React.useState<string>("plot");
    const [showWarning, setShowWarning] = React.useState<boolean>(false);
    const [removeId, setRemoveId] = React.useState<number>(undefined);
    const [currentSettingsChannel, setCurrentSettingsChannel] = React.useState<number>(undefined);

    // Settings Buffers
    const [plotSettingsBuffer, setPlotSettingsBuffer] = React.useState<ITrendPlot>(null);
    const [seriesSettingsBuffer, setSeriesSettingsBuffer] = React.useState<SeriesSettings>(undefined);
    const [seriesSettingsMultiBuffer, setSeriesSettingsMultiBuffer] = React.useState<SeriesSettings[]>([]);

    // Get Heights and Widths
    React.useLayoutEffect(() => {
        const baseHeight = sideSettingRef?.current?.offsetHeight ?? 400;
        setSettingsHeight(baseHeight < 400 ? 400 : baseHeight);
    });

    // Create Settings Variables
    React.useEffect(() => {
        clearBuffers();
        if (props.Plot.Type === 'Line')
            props.SetSeriesSettings(
                // Get old setting if it exists, otherwise just get new one
                props.Plot.Channels.map(channel => (
                    props.SeriesSettings?.find(oldSetting => oldSetting.Channel.ID === channel.ID) ??
                    ({ Channel: channel, Color: SpacedColor(0.9, 0.9), MinMaxLineType: ':', AvgLineType: '-' })
                ))
            );
    }, [props.Plot.Type, props.Plot.Channels]);

    // Create Settings Buffers
    React.useEffect(() => {
        setPlotSettingsBuffer(props.Plot);
    }, [props.Plot]);

    React.useEffect(() => {
        // Means were in the first render/ after cleanup
        if (currentSettingsChannel === undefined) return;

        // If this is defined, it means we will have to save multiple changes to multiple settings later, so we should hold on to the old stuff
        if (seriesSettingsBuffer !== undefined) {
            const oldIndex = seriesSettingsMultiBuffer.findIndex(setting => setting.Channel.ID === currentSettingsChannel);
            // The setting is new, thus push it onto the array
            if (oldIndex < 0) {
                setSeriesSettingsMultiBuffer([...seriesSettingsMultiBuffer, seriesSettingsBuffer]);
            }
            // Setting is not new, update old
            else {
                const newSettings = [...seriesSettingsMultiBuffer];
                newSettings.splice(oldIndex, 1);
                setSeriesSettingsMultiBuffer(newSettings);
            }
        }

        // Set our buffer to new channel
        setSeriesSettingsBuffer(props.SeriesSettings.find(setting => setting.Channel.ID === currentSettingsChannel));
    }, [currentSettingsChannel]);

    function checkAndSetValue(field: keyof(ITrendPlot)): void {
        if (!_.isEqual(props[field], plotSettingsBuffer[field]))
            props.SetPlot(props.Plot.ID, plotSettingsBuffer, field);
    }

    function clearBuffers(): void {
        setCurrentSettingsChannel(undefined);
        setSeriesSettingsBuffer(undefined);
        setSeriesSettingsMultiBuffer([]);
    }

    function validateTrendPlot(field: keyof ITrendPlot): boolean {
        if (field === 'Height' || field === 'Width') {
            const checkValue = plotSettingsBuffer[field];
            return checkValue <= 100 && checkValue >= 0;
        }
        return true;
    }

    // Functions to handle removing/adding channels
    const removeChannel = React.useCallback((id: number) => {
        const allChannels = [...props.Plot.Channels];
        const index = allChannels.findIndex(channel => channel.ID === id);
        allChannels.splice(index, 1);
        const newPlot: ITrendPlot = { ...props.Plot };
        newPlot.Channels = allChannels;
        props.SetPlot(props.Plot.ID, newPlot, 'Channels')
    }, [props.SetPlot, props.Plot.Channels]);

    const warnRemoveChannel = React.useCallback((id: number) => {
        // implies there could be a change lost
        if (currentSettingsChannel !== undefined || seriesSettingsBuffer !== undefined || seriesSettingsMultiBuffer.length !== 0) {
            setShowWarning(true);
            setRemoveId(id);
        }
        else
            removeChannel(id);
    }, [currentSettingsChannel, seriesSettingsBuffer, seriesSettingsMultiBuffer, removeChannel, props.SetPlot]);

    const lineTypeOptions = [{ Label: "Dashed", Value: ":" }, { Label: "Solid", Value: "-" }];

    const Tabs = [
        { Id: "plot", Label: "Plot" },
        { Id: "series", Label: "Channel" }
    ];

    return (
        <>
            {props.Show ? <Portal node={document && document.getElementById(props.OverlayPortalID)}>
                <div className="card">
                    <div className="card-header">
                        <h4 className="modal-title">{`Change Plot: ${props.Plot.Title ?? `${props.Plot.Channels.length} Channel ${props.Plot.Type} Plot`}`}</h4>
                    </div>
                    <div className="card-body" style={{ maxHeight: 'calc(100% - 210px)', overflowY: 'auto' }}>
                        <TabSelector CurrentTab={tab} SetTab={setTab} Tabs={Tabs} />
                        <hr />
                        <div className="tab-content" style={{ maxHeight: window.innerHeight - 235, overflow: 'hidden' }}>
                            <div className={"tab-pane " + (tab == "plot" ? " active" : "fade")} id="plot">
                                <PlotSettings Plot={plotSettingsBuffer} SetPlot={setPlotSettingsBuffer} />
                            </div>
                        </div>
                        <div className="tab-content" style={{ maxHeight: window.innerHeight - 235, overflow: 'hidden' }}>
                            <div className={"tab-pane " + (tab == "series" ? " active" : "fade")} id="series">
                                <div className="row" style={{ paddingLeft: 20, paddingRight: 20 }}>
                                    <div className="col" style={{ width: '40%', height: settingsHeight }}>
                                        <TrendChannelTable Height={settingsHeight} TrendChannels={props.Plot.Channels} RemoveChannel={warnRemoveChannel}
                                            Type='single' Selected={currentSettingsChannel} SetSelected={setCurrentSettingsChannel} />
                                    </div>
                                    <div className="col" style={{ width: '60%'}} ref={sideSettingRef}>
                                        {seriesSettingsBuffer === undefined ? null :
                                            <>
                                                <BlockPicker onChangeComplete={(color) => setSeriesSettingsBuffer({ ...seriesSettingsBuffer, Color: color.hex })} color={seriesSettingsBuffer.Color} triangle={"hide"} />
                                                <Input<SeriesSettings> Record={seriesSettingsBuffer} Label={'Legend Label'} Field={'Label'} Setter={setSeriesSettingsBuffer} Valid={() => true} />
                                                <Select<SeriesSettings> Record={seriesSettingsBuffer} Label={'Average Line Style'} Field={'AvgLineType'} Setter={setSeriesSettingsBuffer} Options={lineTypeOptions} />
                                                <Select<SeriesSettings> Record={seriesSettingsBuffer} Label={'Min/Max Line Style'} Field={'MinMaxLineType'} Setter={setSeriesSettingsBuffer} Options={lineTypeOptions} />
                                            </>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card-footer">
                        <button type="button"
                            className={'btn btn-primary float-left'}
                            onClick={() => {
                                // Each of the fields that are set global to all channels
                                Object.keys(plotSettingsBuffer).forEach(field => checkAndSetValue(field as keyof (ITrendPlot)));
                                // Remove settings that got changed from base, then add back in
                                let newSettings = [...props.SeriesSettings]
                                    .filter(setting =>
                                        setting.Channel.ID !== seriesSettingsBuffer?.Channel?.ID &&
                                        seriesSettingsMultiBuffer.findIndex(newSetting => setting.Channel.ID === newSetting.Channel.ID) < 0
                                    );
                                newSettings = newSettings.concat(seriesSettingsMultiBuffer);
                                if (seriesSettingsBuffer !== undefined)
                                    newSettings.push(seriesSettingsBuffer);
                                props.SetSeriesSettings(newSettings);
                                clearBuffers();
                                props.SetShow(false);
                            }}>Save Changes</button>
                        <button type="button"
                            className={'btn btn-cancel float-right'}
                            onClick={() => {
                                clearBuffers();
                                setPlotSettingsBuffer(props.Plot);
                                props.SetShow(false);
                            }}>Discard Changes</button>
                    </div>
                </div>
            </Portal> : null}
            <Warning Title={'Discard Changes?'}
                CallBack={(confirmed) => {
                    if (confirmed) removeChannel(removeId);
                    setShowWarning(false);
                    setRemoveId(undefined);
                }
                }
                Show={showWarning} Message={'Removing a channel will also discard any changes made.'} />
        </>
    );
});

export { SettingsOverlay };