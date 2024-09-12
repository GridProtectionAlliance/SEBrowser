//******************************************************************************************************
//  LineStyles.tsx - Gbtc
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
//  02/25/23 - Gabriel Santos
//       Generated original version of source code.
//
//******************************************************************************************************
import React from 'react';
import { Input, Select } from '@gpa-gemstone/react-forms';
import { LineTypeOptions } from '../SettingsModal';
import { TrendSearch } from '../../../../global';

interface IChannelTabProps {
    DefaultStyle: TrendSearch.ILineStyleSettings,
    SetDefaultStyle: (newSettings: TrendSearch.ILineStyleSettings) => void,
    Series: 'Min' | 'Max' | 'Avg'
}

const LineStyles = React.memo((props: IChannelTabProps) => {
    return (
        <div className="col" style={{ width: 'auto' }}>
            <h4>{props.Series} Settings</h4>
            <Input<TrendSearch.ILineStyleSettings> Record={props.DefaultStyle} Label={'Line Width (pixels)'}
                Field={'Width'} Setter={props.SetDefaultStyle} Type={'number'}
                Feedback={"Width must be a positive number"} Valid={() => {
                    return props.DefaultStyle['Width'] > 0;
                }} />
            <Select<TrendSearch.ILineStyleSettings> Record={props.DefaultStyle} Label={'Line Style'}
                Field={'Type'} Setter={props.SetDefaultStyle} Options={LineTypeOptions} />
        </div>
    );
});

export { LineStyles };