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
import { TrendSearch } from '../../../../global';
import { BlockPicker } from 'react-color';
import { LineTypeOptions } from '../SettingsModal';
import TrendChannelTable from '../../Components/TrendChannelTable';
import { LineSettings } from '../TabProperties/LineSettings';

interface IChannelTabProps {
    // Assumption that this doesnt change outside of this overlay
    SeriesSettings: TrendSearch.ISeriesSettings[],
    SetSeriesSettings: (newSettings: TrendSearch.ISeriesSettings[]) => void,
    Channels: TrendSearch.ITrendChannel[],
    SetChannels: (newSettings: TrendSearch.ITrendChannel[]) => void,
    Type: TrendSearch.IPlotTypes
}

const ChannelTab = React.memo((props: IChannelTabProps) => {
    // Sizing Variables
    const sideSettingRef = React.useRef(null);
    const [settingsHeight, setSettingsHeight] = React.useState<number>(500);

    // Settings Controls
    const [currentChannelId, setCurrentChannelId] = React.useState<string>(undefined);
    const [currentSeriesSetting, setCurrentSeriesSetting] = React.useState<TrendSearch.ISeriesSettings>(undefined);

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
    const removeChannel = React.useCallback((channel: TrendSearch.ITrendChannel) => {
        // Remove Setting
        const allSettings = [...props.SeriesSettings];
        const indexSetting = allSettings.findIndex(setting => setting.Channel.ID === channel.ID);
        allSettings.splice(indexSetting, 1);
        props.SetSeriesSettings(allSettings);
    }, [props.SeriesSettings, props.SetSeriesSettings, props.Channels, props.SetChannels]);

    const editChannel = React.useCallback((seriesSetting: TrendSearch.ISeriesSettings) => {
        const allSettings = [...props.SeriesSettings];
        const index = allSettings.findIndex(setting => setting.Channel.ID === seriesSetting.Channel.ID);
        allSettings.splice(index, 1, seriesSetting);
        // Handle updating list
        props.SetSeriesSettings(allSettings);
        // Handle updating current
        setCurrentSeriesSetting(seriesSetting);
    }, [props.SeriesSettings, props.SetSeriesSettings]);

    const getSettingsList = React.useCallback(() => {
        switch (props.Type) {
            case 'Line':
                if (!currentSeriesSetting.Settings['Minimum']?.['HasData'] && !currentSeriesSetting.Settings['Average']?.['HasData'] && !currentSeriesSetting.Settings['Maximum']?.['HasData'])
                    return (
                        <div style={{
                            backgroundColor: "grey", borderRadius: ('25px 25px 25px 25px'),
                            width: '100%', height: '100%'
                        }} />
                    );
                return (
                    <div className="row" style={{ height: '100%', width: '100%' }}>
                        {
                            Object.keys(currentSeriesSetting.Settings).map(seriesKey =>
                                <LineSettings SeriesSettings={currentSeriesSetting} SetSeriesSettings={editChannel} Series={seriesKey} />
                            )
                        }
                    </div>
                );
            case 'Cyclic':
                return (
                    <>
                        <BlockPicker onChangeComplete={(color) => editChannel({ ...currentSeriesSetting, Settings: {Color: color.hex } })} color={currentSeriesSetting['Color']} triangle={"hide"} />
                    </>
                );
            default:
                console.error("Unexpected chart type in ChannelTab.tsx");
                return null;
        }
    }, [props.Type, currentSeriesSetting, editChannel, LineTypeOptions]);

    return (
        <div className="row" style={{ paddingLeft: 20, paddingRight: 20 }}>
            <div className="col" style={{ width: '40%', height: settingsHeight }}>
                <TrendChannelTable Height={settingsHeight} TrendChannels={props.Channels} SetTrendChannels={props.SetChannels} OnChannelRemoval={removeChannel}
                    Type='single' Selected={currentChannelId} SetSelected={setCurrentChannelId} />
            </div>
            <div className="col" style={{ width: '60%', overflowY: 'scroll', maxHeight: 'calc(100vh - 264px)' }} ref={sideSettingRef}>
                {currentSeriesSetting === undefined ? null :
                    getSettingsList()
                }
            </div>
        </div>
    );
});

export { ChannelTab };