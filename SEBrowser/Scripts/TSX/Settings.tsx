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
import { SelectEventSearchSettings, SetEventSearch } from './Components/SettingsSlice';
import { Redux } from './global';
import { FetchEventSearches } from './Components/EventSearch/EventSearchSlice';



const Settings = (props: { Show: boolean, Close: () => void }) => {
    const dispatch = useAppDispatch();
    const evtSearchsettings = useAppSelector(SelectEventSearchSettings)
    const [evtSearch, setEvtSearch] = React.useState<Redux.IEventSearchSettings>()
    const searchSettingsOptions = [
        {
            Value: 'Center Date/Time and Window',
            Label: 'Center Date/Time and Window',
        },
        {
            Value: 'Start Date/Time and Window',
            Label: 'Start Date/Time and Window',
        },
        {
            Value: 'End Date/Time and Window',
            Label: 'End Date/Time and Window',
        },
        {
            Value: 'Start and End Date/Time',
            Label: 'Start and End Date/Time',
        },
    ];

    React.useEffect(() => {
        setEvtSearch(evtSearchsettings);
    }, [evtSearchsettings])

    React.useEffect(() => {
        if (props.Show)
            setEvtSearch(evtSearchsettings);
    }, [props.Show])

    function save() {
        dispatch(SetEventSearch(evtSearch));
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
                            <legend className="w-auto" style={{ fontSize: 'large' }}>General Settings:</legend>
                            <div className="row">
                                <div className="col">
                                    <Select<Redux.IEventSearchSettings>
                                        Options={searchSettingsOptions}
                                        Record={evtSearch}
                                        Field='DateTimeSetting'
                                        Setter={setEvtSearch}
                                        Label='Date/Time Filter Mode'
                                    />
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