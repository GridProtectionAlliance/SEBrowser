//******************************************************************************************************
//  TrendDataSettings.tsx - Gbtc
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
    Settings: Redux.ITrendDataSettings,
    SetSettings: (settings: Redux.ITrendDataSettings) => void
}

const legendDisplayOptions = [
    {
        Value: 'bottom',
        Label: 'Beneath Plot',
    },
    {
        Value: 'right',
        Label: 'Right of Plot',
    },
    {
        Value: 'hidden',
        Label: 'Hide all Plot Legends',
    }
];

const TrendDataSettings = (props: IProps) => (
    <div className="row">
        <div className="col-12">
            <div className="row">
                <div className="col">
                    <Select<Redux.ITrendDataSettings>
                        Options={legendDisplayOptions}
                        Record={props.Settings}
                        Field='LegendDisplay'
                        Setter={props.SetSettings}
                        Label='Plot Legend Display Options'
                        Help='Controls whether plot legends appear beneath each plot, to its right, or are hidden.'
                    />
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <CheckBox<Redux.ITrendDataSettings>
                        Record={props.Settings}
                        Field='BorderPlots'
                        Setter={props.SetSettings}
                        Label='Enable Plot Borders'
                        Help='Draws a border around each trend-data plot.'
                    />
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <CheckBox<Redux.ITrendDataSettings>
                        Record={props.Settings}
                        Field='InsertAtStart'
                        Setter={props.SetSettings}
                        Label='Add New Plots to Top'
                        Help='Adds newly created trend-data plots above existing plots instead of below them.'
                    />
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <CheckBox<Redux.ITrendDataSettings>
                        Record={props.Settings}
                        Field='StartWithOptionsClosed'
                        Setter={props.SetSettings}
                        Label='Toolbar Closed by Default'
                        Help='Starts each plot with its toolbar collapsed.'
                    />
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <CheckBox<Redux.ITrendDataSettings>
                        Record={props.Settings}
                        Field='MarkerSnapping'
                        Setter={props.SetSettings}
                        Label='Snap Markers to Nearest Data Point'
                        Help='Snaps marker placement to the nearest plotted data point.'
                    />
                </div>
            </div>
        </div>
    </div>
);

export default TrendDataSettings;
