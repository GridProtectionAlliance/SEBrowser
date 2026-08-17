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
import { IMultiCheckboxOption, TrendSearch } from '../../../../../global';
import TrendChannelTable from '../../../Components/TrendChannelTable';
import { useGetContainerPosition } from '@gpa-gemstone/helper-functions';

export interface IChannelSettingsProps {
    // Assumption that this doesnt change outside of this overlay
    SeriesSettings: TrendSearch.ISeriesSettings[],
    SetSeriesSettings: (newSettings: TrendSearch.ISeriesSettings[]) => void,
    Channels: TrendSearch.ITrendChannel[],
    SetChannels: (newSettings: TrendSearch.ITrendChannel[]) => void,
    PlotFilter: IMultiCheckboxOption[]
}

export type IChannelSeriesSettings = TrendSearch.ISeriesSettings & { Channel: TrendSearch.ITrendChannel };

export interface IChannelEditorProps {
    SeriesSettings: IChannelSeriesSettings,
    SetSeriesSettings: (newSettings: TrendSearch.ISeriesSettings) => void,
    PlotFilter: IMultiCheckboxOption[]
}

interface IChannelTabProps extends IChannelSettingsProps {
    Editor: React.ComponentType<IChannelEditorProps>
}

const ChannelTab = React.memo((props: IChannelTabProps) => {
    // Sizing Variables
    const sideSettingRef = React.useRef(null);
    const { offsetHeight } = useGetContainerPosition(sideSettingRef);
    const settingsHeight = Math.max(400, offsetHeight);

    // Settings Controls
    const [currentChannelId, setCurrentChannelId] = React.useState<string>('');
    const [currentSeriesSetting, setCurrentSeriesSetting] = React.useState<IChannelSeriesSettings | undefined>(undefined);

    React.useEffect(() => {
        // Means were in the first render/ after cleanup
        if (currentChannelId.length === 0) return;
        // Set our buffer to new channel
        setCurrentSeriesSetting(props.SeriesSettings.find((setting): setting is IChannelSeriesSettings => setting.Channel?.ID === currentChannelId));
    }, [currentChannelId]);

    // Functions to handle removing/editing channels
    const removeChannel = React.useCallback((channel: TrendSearch.ITrendChannel) => {
        // Remove Setting
        const allSettings = [...props.SeriesSettings];
        const indexSetting = allSettings.findIndex(setting => setting.Channel?.ID === channel.ID);
        if (indexSetting < 0) return;
        allSettings.splice(indexSetting, 1);
        props.SetSeriesSettings(allSettings);
    }, [props.SeriesSettings, props.SetSeriesSettings, props.Channels, props.SetChannels]);

    const editChannel = React.useCallback((seriesSetting: TrendSearch.ISeriesSettings) => {
        const channel = seriesSetting.Channel;
        if (channel == null) return;
        const channelSettings: IChannelSeriesSettings = { ...seriesSetting, Channel: channel };
        const allSettings = [...props.SeriesSettings];
        const index = allSettings.findIndex(setting => setting.Channel?.ID === channel.ID);
        if (index < 0) return;
        allSettings.splice(index, 1, channelSettings);
        // Handle updating list
        props.SetSeriesSettings(allSettings);
        // Handle updating current
        setCurrentSeriesSetting(channelSettings);
    }, [props.SeriesSettings, props.SetSeriesSettings]);

    const Editor = props.Editor;

    return (
        <div className="row" style={{ paddingLeft: 20, paddingRight: 20 }}>
            <div className="col" style={{ width: '40%', height: settingsHeight }}>
                <TrendChannelTable
                    Height={settingsHeight}
                    TrendChannels={props.Channels}
                    SetTrendChannels={props.SetChannels}
                    OnChannelRemoval={removeChannel}
                    Type='single'
                    Selected={currentChannelId}
                    SetSelected={setCurrentChannelId}
                />
            </div>
            <div className="col" style={{ width: '60%', overflowY: 'scroll', maxHeight: 'calc(100vh - 264px)' }} ref={sideSettingRef}>
                {currentSeriesSetting === undefined ? null :
                    <Editor
                        SeriesSettings={currentSeriesSetting}
                        SetSeriesSettings={editChannel}
                        PlotFilter={props.PlotFilter}
                    />
                }
            </div>
        </div>
    );
});

export { ChannelTab };
