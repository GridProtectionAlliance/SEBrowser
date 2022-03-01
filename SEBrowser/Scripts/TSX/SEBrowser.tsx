//******************************************************************************************************
//  SEBrowser.tsx - Gbtc
//
//  Copyright © 2020, Grid Protection Alliance.  All Rights Reserved.
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
//  02/19/2020 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import { Provider } from 'react-redux';
import store from './Store';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import MeterActivity from './Components/MeterActivity';
import EventSearch from './Components/EventSearch/EventSearch';
import BreakerReport from './Components/BreakerReport/BreakerReport';
import RelayReport from './Components/RelayReport/RelayReport';
import CapBankReport from './Components/CapBankReport/CapBankReport';
import DERAnalysisReport from './Components/DERAnalysisReport/DERAnalysisReport';

import { SystemCenter } from '@gpa-gemstone/application-typings';
import { Application, Page, Section } from '@gpa-gemstone/react-interactive';

const SEBrowserMainPage = (props: {}) => {
    const [links, setLinks] = React.useState<SystemCenter.Types.ValueListItem[]>([]);
    const [ignored, forceUpdate] = React.useReducer(x => x + 1, 0); // integer state for resize renders

    React.useEffect(() => {
        let handle = $.ajax({
            type: "GET",
            url: `${homePath}api/ValueList/Group/CustomReports`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });


        handle.done(data => setLinks(data));
        return () => { if(handle.abort != undefined) handle.abort()}
    }, []);


    React.useEffect(() => {
        window.addEventListener('resize', (evt) => forceUpdate());

        return () => {
            window.removeEventListener('resize', (evt) => { });
        }
    }, [])

    const createWidget = (item: string) => {
        if (item === "breakerreport")
            return <BreakerReport />
        if (item === "relayreport")
            return <RelayReport />
        if (item === "capbankreport")
            return <CapBankReport />
        if (item === "derreport")
            return <DERAnalysisReport />
    }

    return (
        <Application HomePath={homePath} DefaultPath={"eventsearch"} Logo={homePath + "Images/SE Browser Spelled out - 40 high.png"} Version={version}>
            <Page Name={'eventsearch'} Label={'Event Search'}>
                <EventSearch />
            </Page>
            <Page Name={'meteractivity'} Label={'Meter Activity'}>
                <MeterActivity />
            </Page>
            <Section Label={"Custom Reports"}>
                {links.map((item, i) => <Page key={i} Name={item.AltValue} Label={item.Value}>{createWidget(item.AltValue)}</Page>)}
            </Section>
        </Application>
    );
}

ReactDOM.render(<Provider store={store}><SEBrowserMainPage /></Provider>, document.getElementById('pageBody'));

