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
//  07/16/2026 - Preston Crawford
//       Moved settings into Components and split each tab into its own component.
//
//******************************************************************************************************
import * as React from 'react';
import { Modal, TabSelector } from '@gpa-gemstone/react-interactive';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { SelectEventSearchSettings, SelectTrendDataSettings, SelectGeneralSettings, SelectTutorialSettings, SetEventSearch, SetTrendData, SetGeneral, SetTutorials } from '../../Store/SettingsSlice';
import { Redux } from '../../global';
import { TutorialKeys } from '../../TutorialKeys';
import EventSearchSettings from './EventSearchSettings';
import TrendDataSettings from './TrendDataSettings';
import GeneralSettings from './GeneralSettings';
import TutorialSettings from './TutorialSettings';

const tabs = [
    { Id: 'eventSearch', Label: 'Event Search' },
    { Id: 'trendData', Label: 'Trend Data' },
    { Id: 'general', Label: 'General' },
    { Id: 'tutorials', Label: 'Tutorials' }
];

const Settings = (props: { Show: boolean, Close: () => void }) => {
    const dispatch = useAppDispatch();
    const evtSearchsettings = useAppSelector(SelectEventSearchSettings);
    const trendDatasettings = useAppSelector(SelectTrendDataSettings);
    const generalSettings = useAppSelector(SelectGeneralSettings);
    const tutorialSettings = useAppSelector(SelectTutorialSettings);

    const [evtSearch, setEvtSearch] = React.useState<Redux.IEventSearchSettings>(evtSearchsettings);
    const [trendData, setTrendData] = React.useState<Redux.ITrendDataSettings>(trendDatasettings);
    const [general, setGeneral] = React.useState<Redux.IGeneralSettings>(generalSettings);
    const [tutorials, setTutorials] = React.useState<Redux.ITutorialSettings>(tutorialSettings);
    const [tab, setTab] = React.useState<string>('eventSearch');

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
        setTutorials(tutorialSettings);
    }, [tutorialSettings]);

    React.useEffect(() => {
        if (props.Show) {
            setEvtSearch(evtSearchsettings);
            setTrendData(trendDatasettings);
            setGeneral(generalSettings);
            setTutorials(tutorialSettings);
        }
    }, [props.Show]);

    function save() {
        dispatch(SetEventSearch(evtSearch));
        dispatch(SetTrendData(trendData));
        dispatch(SetGeneral(general));
        dispatch(SetTutorials(tutorials));

        if (!tutorials.UseTutorials && tutorialSettings.UseTutorials)
            Object.values(TutorialKeys).forEach(key => localStorage.setItem(key, 'false'));
    }

    return (
        <Modal Title={'Settings'}
            CallBack={(c) => { if (c) save(); props.Close() }} Show={props.Show}
            ShowCancel={false} ShowX={true}
            Size={'lg'}
        >
            <TabSelector CurrentTab={tab} SetTab={setTab} Tabs={tabs} />
            {tab === 'eventSearch' ?
                <EventSearchSettings Settings={evtSearch} SetSettings={setEvtSearch} />
                : tab === 'trendData' ?
                    <TrendDataSettings Settings={trendData} SetSettings={setTrendData} />
                    : tab === 'general' ?
                        <GeneralSettings Settings={general} SetSettings={setGeneral} />
                        : tab === 'tutorials' ?
                            <TutorialSettings Settings={tutorials} SetSettings={setTutorials} />
                            : null}
        </Modal>
    );
}

export default Settings;
