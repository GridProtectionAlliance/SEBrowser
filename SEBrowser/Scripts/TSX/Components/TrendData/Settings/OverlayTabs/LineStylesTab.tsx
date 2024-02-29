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
import { TrendSearch } from '../../../../Global';
import { LineStyles } from '../TabProperties/LineStyles'

interface IChannelTabProps {
    MinStyle: TrendSearch.ILineStyleSettings,
    SetMinStyle: (newSettings: TrendSearch.ILineStyleSettings) => void,
    AvgStyle: TrendSearch.ILineStyleSettings,
    SetAvgStyle: (newSettings: TrendSearch.ILineStyleSettings) => void,
    MaxStyle: TrendSearch.ILineStyleSettings,
    SetMaxStyle: (newSettings: TrendSearch.ILineStyleSettings) => void
}

const LineStylesTab = React.memo((props: IChannelTabProps) => {
    return (
        <div className="col" style={{ paddingLeft: 20, paddingRight: 20 }}>
            <br/>
            <div className="row">
                <div style={{
                    border: "thin black solid", color: "white", backgroundColor: "#1064da"
                    }}>These settings will only apply to line plots.</div>
            </div>
            <div className="row" style={{ overflowY: 'scroll', maxHeight: 'calc(100vh - 264px)' }}>
                <LineStyles DefaultStyle={props.MinStyle} SetDefaultStyle={props.SetMinStyle} Series='Min' />
                <LineStyles DefaultStyle={props.AvgStyle} SetDefaultStyle={props.SetAvgStyle} Series='Avg' />
                <LineStyles DefaultStyle={props.MaxStyle} SetDefaultStyle={props.SetMaxStyle} Series='Max' />
            </div>
        </div>
    );
});

export { LineStylesTab };