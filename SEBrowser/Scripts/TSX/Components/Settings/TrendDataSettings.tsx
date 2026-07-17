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
import { CheckBox, MultiCheckBoxSelect, Select } from '@gpa-gemstone/react-forms';
import { Application, OpenXDA } from '@gpa-gemstone/application-typings';
import { ReactIcons } from '@gpa-gemstone/gpa-symbols';
import { IMultiCheckboxOption, Redux, TrendSearch } from '../../global';
import { ChannelGroupController, PhaseController } from '../../Store/ControllerFunctions';

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

const series = [
    { Value: 'Minimum', Label: 'Minimum' },
    { Value: 'Maximum', Label: 'Maximum' },
    { Value: 'Average', Label: 'Average/Values' }
];

const TrendDataSettings = (props: IProps) => {
    const [phaseStatus, setPhaseStatus] = React.useState<Application.Types.Status>('uninitiated');
    const [phases, setPhases] = React.useState<OpenXDA.Types.Phase[]>([]);
    const [channelGroupStatus, setChannelGroupStatus] = React.useState<Application.Types.Status>('uninitiated');
    const [channelGroups, setChannelGroups] = React.useState<TrendSearch.ChannelGroup[]>([]);

    React.useEffect(() => {
        setPhaseStatus('loading');
        const handle = PhaseController.GetAll('Name', true)
            .done(data => { setPhases(data); setPhaseStatus('idle'); })
            .fail(() => setPhaseStatus('error'));
        return () => { if (handle?.abort != null) handle.abort(); };
    }, []);

    React.useEffect(() => {
        setChannelGroupStatus('loading');
        const handle = ChannelGroupController.GetAll('Name', true)
            .done(data => { setChannelGroups(data); setChannelGroupStatus('idle'); })
            .fail(() => setChannelGroupStatus('error'));
        return () => { if (handle?.abort != null) handle.abort(); };
    }, []);

    const phaseOptions = phases.map(phase => ({
        Value: phase.ID,
        Label: phase.Name,
        Selected: props.Settings.DefaultPhaseIDs?.includes(phase.ID) ?? ['AB', 'BC', 'CA'].includes(phase.Name)
    }));

    const channelGroupOptions = channelGroups.map(group => ({
        Value: group.ID,
        Label: group.Name,
        Selected: props.Settings.DefaultChannelGroupIDs?.includes(group.ID) ?? group.Name === 'Voltage'
    }));
    
    const seriesOptions = series.map(option => ({
        ...option,
        Selected: props.Settings.DefaultSeries?.includes(option.Value) ?? true
    }));

    function updateOptions(field: 'DefaultPhaseIDs' | 'DefaultChannelGroupIDs' | 'DefaultSeries', changedOptions: IMultiCheckboxOption[], options: IMultiCheckboxOption[]) {
        const updated = options.map(option => ({
            ...option,
            Selected: option.Selected !== changedOptions.some(changed => changed.Value === option.Value)
        }));
        props.SetSettings({
            ...props.Settings,
            [field]: updated.filter(option => option.Selected).map(option => option.Value)
        });
    }

    return (
        <div className="row">
            <div className="col-12">
                <fieldset className="border" style={{ padding: '10px' }}>
                    <legend className="w-auto" style={{ fontSize: 'large' }}>Plot Settings:</legend>
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
                </fieldset>
                <fieldset className="border" style={{ padding: '10px' }}>
                    <legend className="w-auto" style={{ fontSize: 'large' }}>Trend Channel Filters:</legend>
                    <label>Phase:</label>
                    {phaseStatus === 'loading' ?
                        <div className='d-flex align-items-center flex-column justify-content-center'>
                            <ReactIcons.SpiningIcon />
                        </div> :
                        <MultiCheckBoxSelect
                            Options={phaseOptions}
                            Label=''
                            OnChange={(_evt, options) => updateOptions('DefaultPhaseIDs', options, phaseOptions)}
                        />
                    }
                    <label>Channel Group:</label>
                    {channelGroupStatus === 'loading' ?
                        <div className='d-flex align-items-center flex-column justify-content-center'>
                            <ReactIcons.SpiningIcon />
                        </div> :
                        <MultiCheckBoxSelect
                            Options={channelGroupOptions}
                            Label=''
                            OnChange={(_evt, options) => updateOptions('DefaultChannelGroupIDs', options, channelGroupOptions)}
                        />
                    }
                    <label>Series Plotted:</label>
                    <MultiCheckBoxSelect
                        Options={seriesOptions}
                        Label=''
                        OnChange={(_evt, options) => updateOptions('DefaultSeries', options, seriesOptions)}
                    />
                </fieldset>
            </div>
        </div>
    );
};

export default TrendDataSettings;
