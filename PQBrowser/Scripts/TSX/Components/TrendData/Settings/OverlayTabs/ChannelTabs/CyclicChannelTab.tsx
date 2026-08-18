//******************************************************************************************************
//  CyclicChannelTab.tsx - Gbtc
//
//  Copyright © 2026, Grid Protection Alliance.  All Rights Reserved.
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
//  07/17/26 - Preston Crawford
//       Generated original version of source code.
//
//******************************************************************************************************
import React from 'react';
import { ColorPicker } from '@gpa-gemstone/react-forms';
import { TrendSearch } from '../../../../../global';
import { ChannelTab } from './ChannelTab';
import type { IChannelEditorProps, IChannelSettingsProps } from './ChannelTab';

const CyclicChannelEditor = (props: IChannelEditorProps) => (
    <ColorPicker<TrendSearch.ICyclicSeriesSettings>
        Record={props.SeriesSettings.Settings as TrendSearch.ICyclicSeriesSettings}
        Field={'Color'}
        Label={'Color'}
        Setter={settings => props.SetSeriesSettings({ ...props.SeriesSettings, Settings: settings })}
    />
);

const CyclicChannelTab = (props: IChannelSettingsProps) => <ChannelTab {...props} Editor={CyclicChannelEditor} />;

export { CyclicChannelTab };
