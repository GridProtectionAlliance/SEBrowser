//******************************************************************************************************
//  EventSearchSettings.tsx - Gbtc
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
import { CheckBox, Input } from '@gpa-gemstone/react-forms';
import { Redux } from '../../global';

interface IProps {
    Settings: Redux.IEventSearchSettings,
    SetSettings: (settings: Redux.IEventSearchSettings) => void
}

const EventSearchSettings = (props: IProps) => (
    <div className="row">
        <div className="col-12">
            <div className="row">
                <div className="col">
                    <Input<Redux.IEventSearchSettings>
                        Record={props.Settings}
                        Field='NumberResults'
                        Setter={props.SetSettings}
                        Valid={() => true}
                        Label='Number of Results'
                        Help='Sets the maximum number of events returned by an event search and displayed in the results table and magnitude-duration chart.'
                        Type='integer'
                    />
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <CheckBox<Redux.IEventSearchSettings>
                        Record={props.Settings}
                        Field='AggregateMagDur'
                        Setter={props.SetSettings}
                        Label='Aggregate Events on Mag-Dur chart'
                        Help='Groups nearby events into numbered clusters on the magnitude-duration chart. Select a cluster to zoom in.'
                    />
                </div>
            </div>
        </div>
    </div>
);

export default EventSearchSettings;
