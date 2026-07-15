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
import store, { EventTypeSlice, MeterSlice, AssetSlice, LocationSlice, AssetGroupSlice } from './Store/Store';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import MeterActivity from './Components/MeterActivity/MeterActivity';
import EventSearch from './Components/EventSearch/EventSearch';
import TrendData from './Components/TrendData/TrendData';
import BreakerReport from './Components/Reports/BreakerReport/BreakerReport';
import RelayReport from './Components/Reports/TripCoilReport/TripCoilReport';
import CapBankReport from './Components/Reports/CapBankReport/CapBankReport';
import DERReport from './Components/Reports/DERReport/DERReport';
import { Application as ApplicationTypes, SystemCenter } from '@gpa-gemstone/application-typings';
import { Application, Page, Section } from '@gpa-gemstone/react-interactive';
import Settings from './Store/Settings';
import { ReactIcons } from '@gpa-gemstone/gpa-symbols';
import { useAppDispatch, useAppSelector } from './hooks';
import { LoadSettings } from './Store/SettingsSlice';
import { FetchWidgetAuthorization } from './Store/WidgetAuthorizationSlice';
import { HeartBeatCheck } from '@gpa-gemstone/common-pages';
import { LIB_VERSION } from './version';

let isRedirecting = false;

//Intercept requests at the XHR level to redirect 401 response to the login page
const originalXHRSend = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.send = function (...args) {
    this.addEventListener('load', function () {
        if (this.status === 401 && !isRedirecting) {
            isRedirecting = true;
            const returnPath = encodeURIComponent(window.location.pathname + window.location.search);
            window.location.assign(`${homePath}Login?redir=${returnPath}`);
        }
    });

    return originalXHRSend.apply(this, args);
};

const PQBrowser = () => {
    const dispatch = useAppDispatch();

    const [links, setLinks] = React.useState<SystemCenter.Types.ValueListItem[]>([]);
    const [showSettings, setShowSettings] = React.useState<boolean>(false);
    const [backendVersion, setBackendVersion] = React.useState<string>('0.0.0');
    const [getBackendVersionStatus, setGetBackendVersionStatus] = React.useState<ApplicationTypes.Types.Status>('uninitiated');

    const evtTypeStatus = useAppSelector(EventTypeSlice.FetchStatus);
    const meterStatus = useAppSelector(MeterSlice.FetchStatus);
    const assetStatus = useAppSelector(AssetSlice.FetchStatus);
    const locationStatus = useAppSelector(LocationSlice.FetchStatus);
    const assetGroupStatus = useAppSelector(AssetGroupSlice.FetchStatus);

    //Effect to fetch event types
    React.useEffect(() => {
        if (evtTypeStatus == 'changed' || evtTypeStatus == 'uninitiated')
            dispatch(EventTypeSlice.Fetch({}));
    }, [evtTypeStatus]);

    //Effect to fetch meters
    React.useEffect(() => {
        if (meterStatus == 'changed' || meterStatus == 'uninitiated')
            dispatch(MeterSlice.Fetch({}));
    }, [meterStatus]);

    //Effect to fetch assets
    React.useEffect(() => {
        if (assetStatus == 'changed' || assetStatus == 'uninitiated')
            dispatch(AssetSlice.Fetch({}));
    }, [assetStatus]);

    //Effect to fetch locations
    React.useEffect(() => {
        if (locationStatus == 'changed' || locationStatus == 'uninitiated')
            dispatch(LocationSlice.Fetch({}));
    }, [locationStatus]);

    //Effect to fetch asset groups
    React.useEffect(() => {
        if (assetGroupStatus == 'changed' || assetGroupStatus == 'uninitiated')
            dispatch(AssetGroupSlice.Fetch({}));
    }, [assetGroupStatus]);

    //Effect to load settings/ custom reports on app mount
    React.useEffect(() => {
        const settingsRequest = dispatch(LoadSettings());
        const authorizationRequest = dispatch(FetchWidgetAuthorization());

        const handle = getCustomReports();

        handle.done(data => setLinks(data));
        return () => {
            settingsRequest.abort();
            authorizationRequest.abort();
            if (handle.abort != undefined) handle.abort();
        }
    }, [])

    React.useEffect(() => {
        setGetBackendVersionStatus('loading');
        const handle = getBackendVersion();

        handle.done(data => {
            setBackendVersion(data);
            setGetBackendVersionStatus('idle');
        });
        handle.fail(() => setGetBackendVersionStatus('error'));

        return () => {
            if (handle.abort != undefined) handle.abort();
        }
    }, []);

    const versionUI = React.useMemo(() => (
        <div className="row m-0">
            <div className="col-12 p-0">
                <p className="text-center">
                    {getBackendVersionStatus === 'error' ?
                        'Version: n/a' :
                        getBackendVersionStatus === 'loading' ? <ReactIcons.SpiningIcon /> : `Version: ${backendVersion}`}
                </p>
                <p className="text-center">
                    UI Version: {LIB_VERSION}
                </p>
            </div>
        </div>
    ), [backendVersion, getBackendVersionStatus]);

    return (
        <>
            <HeartBeatCheck IntervalMS={30000} HeartBeat={heartBeatCheck} />
            <Application
                HomePath={homePath}
                DefaultPath={"eventsearch"}
                DocumentTitleFormatter={(page, app) => `${page} - ${app}`}
                OnSignOut={() => window.location.href = logoutPath}
                Logo={homePath + "Images/PQ Browser.png"}
                SidebarUI={versionUI}
                NavBarContent={
                    <ul className="navbar-nav mr-l">
                        <li className="nav-item" style={{ width: '84px' }}>
                            <button type="button" className="btn btn-primary"
                                style={{
                                    borderRadius: "0.25rem",
                                    height: 30, paddingLeft: 6,
                                    paddingRight: 6, paddingTop: 2
                                }}
                                onClick={() => setShowSettings(true)}
                            >
                                <ReactIcons.Settings />
                            </button>
                        </li>
                    </ul>
                }
            >
                <Page Name={'eventsearch'} Label={'Event Search'}>
                    <EventSearch />
                </Page>
                <Page Name={'meteractivity'} Label={'Meter Activity'}>
                    <MeterActivity />
                </Page>
                <Page Name={'trenddata'} Label={'Trend Data'}>
                    <TrendData />
                </Page>
                <Section Label={"Custom Reports"}>
                    {links.map((item, i) =>
                        <Page
                            key={i}
                            Name={item.AltValue ?? item.Value}
                            Label={item.Value}
                        >
                            {createWidget(item.AltValue ?? item.Value)}
                        </Page>)}
                </Section>
            </Application>
            <Settings Show={showSettings} Close={() => setShowSettings(false)} />
        </>
    );
}

const getCustomReports = () => {
    return $.ajax({
        type: "GET",
        url: `${homePath}api/ValueList/Group/CustomReports`,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        async: true
    });
}

const getBackendVersion = () => {
    return $.ajax({
        type: 'GET',
        url: `${homePath}api/System/Version`,
        contentType: 'application/json; charset=utf-8',
        dataType: 'text',
        cache: false,
        async: true
    });
}

const createWidget = (item: string) => {
    if (item === "breakerreport")
        return <BreakerReport />
    if (item === "relayreport")
        return <RelayReport />
    if (item === "capbankreport")
        return <CapBankReport />
    if (item === "derreport")
        return <DERReport />
}

const heartBeatCheck = () => {
    return $.ajax({
        url: `${homePath}api/SEBrowser/HeartBeat`,
        method: 'GET',
        cache: false,
        async: true
    });
}

ReactDOM.render(<Provider store={store}><PQBrowser /></Provider>, document.getElementById('pageBody'));
