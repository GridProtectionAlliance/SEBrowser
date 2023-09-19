//******************************************************************************************************
//  ChannelTab.tsx - Gbtc
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
//  09/19/23 - Gabriel Santos
//       Generated original version of source code.
//
//******************************************************************************************************
import React from 'react';
import { BlockPicker } from 'react-color';
import { ILineSeries } from '../../TrendPlot/LineGraph';
import { ICyclicSeries } from '../../TrendPlot/CyclicHistogram';
import { TrendSearch } from '../../../../global';
import { CheckBox, Input, Select } from '@gpa-gemstone/react-forms';
import TrendChannelTable from '../../Components/TrendChannelTable';

interface IChannelTabProps {
    // Assumption that this doesnt change outside of this overlay
    SeriesSettings: SeriesSettings[],
    SetSeriesSettings: (newSettings: SeriesSettings[]) => void,
    Channels: TrendSearch.ITrendChannel[],
    SetChannels: (newSettings: TrendSearch.ITrendChannel[]) => void,
    Type: TrendSearch.IPlotTypes
}

export type SeriesSettings = ILineSeries | ICyclicSeries;

const ChannelTab = React.memo((props: IChannelTabProps) => {
    // Sizing Variables
    const sideSettingRef = React.useRef(null);
    const [settingsHeight, setSettingsHeight] = React.useState<number>(500);

    // Settings Controls
    const [currentChannelId, setCurrentChannelId] = React.useState<number>(undefined);
    const [currentSeriesSetting, setCurrentSeriesSetting] = React.useState<SeriesSettings>(undefined);

    // Get Heights and Widths
    React.useLayoutEffect(() => {
        const baseHeight = sideSettingRef?.current?.offsetHeight ?? 400;
        setSettingsHeight(baseHeight < 400 ? 400 : baseHeight);
    });

    React.useEffect(() => {
        // Means were in the first render/ after cleanup
        if (currentChannelId === undefined) return;
        // Set our buffer to new channel
        setCurrentSeriesSetting(props.SeriesSettings.find(setting => setting.Channel.ID === currentChannelId));
    }, [currentChannelId]);

    // Functions to handle removing/editing channels
    const removeChannel = React.useCallback((id: number) => {
        // Remove Setting
        const allSettings = [...props.SeriesSettings];
        const indexSetting = allSettings.findIndex(setting => setting.Channel.ID === id);
        allSettings.splice(indexSetting, 1);
        props.SetSeriesSettings(allSettings);
        // Remove Channel
        const allChannels = [...props.Channels];
        const indexChannel = allChannels.findIndex(chan => chan.ID === id);
        allChannels.splice(indexChannel, 1);
        props.SetChannels(allChannels);
    }, [props.SeriesSettings, props.SetSeriesSettings, props.Channels, props.SetChannels]);

    const editChannel = React.useCallback((seriesSetting: SeriesSettings) => {
        const allSettings = [...props.SeriesSettings];
        const index = allSettings.findIndex(setting => setting.Channel.ID === seriesSetting.Channel.ID);
        allSettings.splice(index, 1, seriesSetting);
        // Handle updating list
        props.SetSeriesSettings(allSettings);
        // Handle updating current
        setCurrentSeriesSetting(seriesSetting);
    }, [props.SeriesSettings, props.SetSeriesSettings]);

    const lineTypeOptions = [{ Label: "Dashed", Value: ":" }, { Label: "Solid", Value: "-" }];

    const getSettingsList = React.useCallback(() => {
        switch (props.Type) {
            case 'Line':
                return (
                    <>
                        <BlockPicker onChangeComplete={(color) => editChannel({ ...currentSeriesSetting, Color: color.hex })} color={currentSeriesSetting['Color']} triangle={"hide"} />
                        <Input<ILineSeries> Record={currentSeriesSetting} Label={'Legend Label'} Field={'Label'} Setter={editChannel} Valid={() => true} />
                        <Select<ILineSeries> Record={currentSeriesSetting} Label={'Average Line Style'} Field={'AvgLineType'} Setter={editChannel} Options={lineTypeOptions} />
                        <Select<ILineSeries> Record={currentSeriesSetting} Label={'Min/Max Line Style'} Field={'MinMaxLineType'} Setter={editChannel} Options={lineTypeOptions} />
                        <Input<ILineSeries> Record={currentSeriesSetting} Label={'Line Width (pixels)'} Field={'Width'} Setter={editChannel} Type={'number'}
                            Feedback={"Width must be a positive number"} Valid={() => {
                                return currentSeriesSetting['Width'] > 0;
                            }} />
                        <CheckBox<ILineSeries> Record={currentSeriesSetting} Label={'Move to Right Axis'} Field={'RightAxis'} Setter={editChannel} />
                    </>
                );
            case 'Cyclic':
                return (
                    <>
                        <BlockPicker onChangeComplete={(color) => editChannel({ ...currentSeriesSetting, Color: color.hex })} color={currentSeriesSetting['Color']} triangle={"hide"} />
                    </>
                );
            default:
                console.error("Unexpected chart type in ChannelTab.tsx");
                return null;
        }

    }, [props.Type, currentSeriesSetting, editChannel, lineTypeOptions]);

    return (
        <div className="row" style={{ paddingLeft: 20, paddingRight: 20 }}>
            <div className="col" style={{ width: '40%', height: settingsHeight }}>
                <TrendChannelTable Height={settingsHeight} TrendChannels={props.Channels} RemoveChannel={removeChannel}
                    Type='single' Selected={currentChannelId} SetSelected={setCurrentChannelId} />
            </div>
            <div className="col" style={{ width: '60%'}} ref={sideSettingRef}>
                {currentSeriesSetting === undefined ? null :
                    getSettingsList()
                }
            </div>
        </div>
    );
});

export { ChannelTab };