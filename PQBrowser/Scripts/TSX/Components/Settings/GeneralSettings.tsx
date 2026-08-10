//******************************************************************************************************
//  GeneralSettings.tsx - Gbtc
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
//  07/16/2026 - Preston Crawford
//       Generated original version of source code.
//
//******************************************************************************************************
import * as React from 'react';
import { CheckBox, Select } from '@gpa-gemstone/react-forms';
import { Redux } from '../../global';

interface IProps {
    Settings: Redux.IGeneralSettings,
    SetSettings: (settings: Redux.IGeneralSettings) => void
}

const searchSettingsOptions = [
    {
        Value: 'startWindow',
        Label: 'Start Date/Time and Window',
    },
    {
        Value: 'endWindow',
        Label: 'End Date/Time and Window',
    },
    {
        Value: 'startEnd',
        Label: 'Start and End Date/Time',
    },
];

const GeneralSettings = (props: IProps) => (
    <div className="row">
        <div className="col-12">
            <div className="row">
                <div className="col">
                    <Select<Redux.IGeneralSettings>
                        Options={searchSettingsOptions}
                        Record={props.Settings}
                        Field='DateTime'
                        Setter={props.SetSettings}
                        Label='Date/Time Filter Mode'
                        Help='Determines whether time filters use a start time plus a window, an end time minus a window, or explicit start and end times.'
                    />
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <CheckBox<Redux.IGeneralSettings>
                        Record={props.Settings}
                        Field='MoveOptionsLeft'
                        Setter={props.SetSettings}
                        Label='Move Toolbar to Left of Plot'
                        Help='Moves plot toolbars and hover readouts from the right side to the left.'
                    />
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <CheckBox<Redux.IGeneralSettings>
                        Record={props.Settings}
                        Field='ShowDataPoints'
                        Setter={props.SetSettings}
                        Label='Display Plot Datapoints on Zoom-In'
                        Help='Automatically displays individual data points on line plots when 100 or fewer points are visible.'
                    />
                </div>
            </div>
        </div>
    </div>
);

export default GeneralSettings;
