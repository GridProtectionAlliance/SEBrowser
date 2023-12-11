//******************************************************************************************************
//  Settings.tsx - Gbtc
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
//  01/17/2023 - C. Lackner
//       Generated original version of source code.
//
//******************************************************************************************************
import * as React from 'react';
import { Modal } from '@gpa-gemstone/react-interactive';
import { CheckBox, Input, Select } from '@gpa-gemstone/react-forms';
import { useAppDispatch, useAppSelector } from './hooks';
import { SelectEventSearchSettings, SelectTrendDataSettings, SelectGeneralSettings, SetEventSearch, SetTrendData, SetGeneral } from './Components/SettingsSlice';
import { Redux } from './global';
import { FetchEventSearches } from './Components/EventSearch/EventSearchSlice';

const Settings = (props: { Show: boolean, Close: () => void }) => {
    const dispatch = useAppDispatch();
    const evtSearchsettings = useAppSelector(SelectEventSearchSettings);
    const trendDatasettings = useAppSelector(SelectTrendDataSettings);
    const generalSettings = useAppSelector(SelectGeneralSettings);

    const [evtSearch, setEvtSearch] = React.useState<Redux.IEventSearchSettings>();
    const [trendData, setTrendData] = React.useState<Redux.ITrendDataSettings>();
    const [general, setGeneral] = React.useState<any>();

    const searchSettingsOptions = [
        {
            Value: 'center',
            Label: 'Center Date/Time and Window',
        },
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

    const legendDisplayOptions = [
        {
            Value: 'bottom',
            Label: 'Show Legend at Bottom of Plot',
        },
        {
            Value: 'right',
            Label: 'Show Legend at Right of Plot',
        },
        {
            Value: 'hidden',
            Label: 'Hide all Plot Legends',
        }
    ];

    React.useEffect(() => {
        setEvtSearch(evtSearchsettings);
    }, [evtSearchsettings]);

    React.useEffect(() => {
        setTrendData(trendDatasettings);
    }, [trendDatasettings]);

    React.useEffect(() => {
        setGeneral(generalSettings);
    }, [generalSettings]);

    React.useEffect(() => {
        if (props.Show) {
            setEvtSearch(evtSearchsettings);
            setTrendData(trendDatasettings);
            setGeneral(generalSettings);
        }
    }, [props.Show]);

    function save() {
        dispatch(SetEventSearch(evtSearch));
        dispatch(SetTrendData(trendData));
        dispatch(SetGeneral(general));
        dispatch(FetchEventSearches());
    }

    return (
        <>
            <Modal Title={'Settings'}
                CallBack={(c) => { if (c) save(); props.Close() }} Show={props.Show}
                ShowCancel={false} ShowX={true}
                Size={'lg'}
            >
                <div className="row">
                    <div className="col-6">
                            <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                                <legend className="w-auto" style={{ fontSize: 'large' }}>Event Search Settings:</legend>
                                <div className={"row"}>
                                    <div className={'col'}>
                                    <Input<Redux.IEventSearchSettings>
                                        Record={evtSearch} Field='NumberResults'
                                        Setter={setEvtSearch} Valid={() => true}
                                        Label='Number of Results' Type='integer' />
                                    </div>
                            </div>
                            <div className={"row"}>
                                <div className={'col'}>
                                    <CheckBox<Redux.IEventSearchSettings>
                                        Record={evtSearch}
                                        Field='AggregateMagDur'
                                        Setter={setEvtSearch}
                                        Label='Aggregate Events on Mag-Dur chart' />
                                </div>
                            </div>
                        </fieldset>
                    </div>
                    <div className="col-6">
                        <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                            <legend className="w-auto" style={{ fontSize: 'large' }}>Trend Data Settings:</legend>
                            <div className={"row"}>
                                <div className={'col'}>
                                    <Select<Redux.ITrendDataSettings>
                                        Options={legendDisplayOptions}
                                        Record={trendData}
                                        Field='LegendDisplay'
                                        Setter={setTrendData}
                                        Label='Display Mode of Plot Legends'
                                    />
                                </div>
                            </div>
                            <div className={"row"}>
                                <div className={'col'}>
                                    <CheckBox<Redux.ITrendDataSettings>
                                        Record={trendData}
                                        Field='BorderPlots'
                                        Setter={setTrendData}
                                        Label='Display Border Around Trend Data Plots'/>
                                </div>
                            </div>
                            <div className={"row"}>
                                <div className={'col'}>
                                    <CheckBox<Redux.ITrendDataSettings>
                                        Record={trendData}
                                        Field='InsertAtStart'
                                        Setter={setTrendData}
                                        Label='Insert New Plots at Beginning of Page'/>
                                </div>
                            </div>
                            <div className={"row"}>
                                <div className={'col'}>
                                    <CheckBox<Redux.ITrendDataSettings>
                                        Record={trendData}
                                        Field='StartWithOptionsClosed'
                                        Setter={setTrendData}
                                        Label='Plot Toolbar Closed on Plot Creation'/>
                                </div>
                            </div>
                            <div className={"row"}>
                                <div className={'col'}>
                                    <CheckBox<Redux.ITrendDataSettings>
                                        Record={trendData}
                                        Field='MarkerSnapping'
                                        Setter={setTrendData}
                                        Label='Enforce New Markers to Snap to Nearest Datapoint'/>
                                </div>
                            </div>
                        </fieldset>
                    </div>
                </div>
                <div className="row">
                    <div className="col-6">
                        <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                            <legend className="w-auto" style={{ fontSize: 'large' }}>General Settings:</legend>
                            <div className="row">
                                <div className="col">
                                    <Select
                                        Options={searchSettingsOptions}
                                        Record={general}
                                        Field='DateTime'
                                        Setter={(g) => setGeneral(g)}
                                        Label='Date/Time Filter Mode'
                                    />
                                </div>
                            </div>
                            <div className={"row"}>
                                <div className={'col'}>
                                    <CheckBox<any>
                                        Record={general}
                                        Field='MoveOptionsLeft'
                                        Setter={(g) => setGeneral(g)}
                                        Label='Display Plot Toolbar on Left Side of Plot' />
                                </div>
                            </div>
                        </fieldset>
                    </div>
                </div>
        </Modal>
        </>
    );
}

export default Settings;