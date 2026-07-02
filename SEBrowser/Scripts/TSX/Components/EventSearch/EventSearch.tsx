//******************************************************************************************************
//  EventSearch.tsx - Gbtc
//
//  Copyright © 2019, Grid Protection Alliance.  All Rights Reserved.
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
//  04/08/2019 - Billy Ernest
//       Generated original version of source code.
//  08/22/2019 - Christoph Lackner
//       Added Cards for Relay Performance.
//
//******************************************************************************************************

import React from 'react';
import EventSearchNavbar from './Navbar/EventSearchNavbar';
import EventPreviewPane from './EventSearchPreviewPane';
import queryString from 'querystring';
import { ProcessQuery, SelectEventSearchRequest, SelectQueryParam, SelectTimeFilter } from '../../Store/EventSearchSlice';
import { SelectEventSearchSettings } from '../../Store/SettingsSlice';
import { SelectWidgetAuthorization } from '../../Store/WidgetAuthorizationSlice';
import { EventTypeSlice, MeterSlice, AssetSlice, LocationSlice, AssetGroupSlice } from '../../Store/Store';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { SplitSection, VerticalSplit } from '@gpa-gemstone/react-interactive';
import { OpenXDA } from '@gpa-gemstone/application-typings';
import { DynamicEventSearchRow, GetDynamicEventSearchData, GetEventSearchRecord, IDynamicEventSearchQuery } from './EventSearchData';
import { getMoment, getStartEndTime } from './TimeWindowUtils';
import { EventWidget } from '../../../../EventWidgets/TSX/global';
import DynamicEventSearch from '../../../../EventWidgets/TSX/CollectionWidget/DynamicEventTable/DynamicEventSearch';
import DynamicMagDurChart from '../../../../EventWidgets/TSX/CollectionWidget/DynamicMagDurChart/DynamicMagDurChart';
import CollectionWidgetRouter from '../../../../EventWidgets/TSX/CollectionWidgetWrapper';

const availableWidgets: EventWidget.ICollectionWidget<any, any, any>[] = [DynamicEventSearch, DynamicMagDurChart];

type tab = 'Waveform' | 'Fault' | 'Correlating' | 'Configuration' | 'All' | undefined;

const EventSearch = () => {
    const history = useLocation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const [eventId, setEventId] = React.useState<number>(-1);
    const [selectedEvent, setSelectedEvent] = React.useState<DynamicEventSearchRow | undefined>(undefined);
    const [initialTab, setInitialTab] = React.useState<tab>(undefined);
    const [showMagDur, setShowMagDur] = React.useState<boolean>(false);
    const [showNav, setShowNav] = React.useState<boolean>(getShowNav());
    const [navHeight, setNavHeight] = React.useState<number>(0);
    const [queryReady, setQueryReady] = React.useState<boolean>(false);

    const queryParam = useAppSelector(SelectQueryParam);
    const eventRequest = useAppSelector(SelectEventSearchRequest);
    const timeRange = useAppSelector(SelectTimeFilter);
    const eventSearchSettings = useAppSelector(SelectEventSearchSettings);
    const widgetAuthorization = useAppSelector(SelectWidgetAuthorization);

    const eventTypeStatus = useAppSelector(EventTypeSlice.FetchStatus);
    const meterStatus = useAppSelector(MeterSlice.FetchStatus);
    const assetStatus = useAppSelector(AssetSlice.FetchStatus);
    const locationStatus = useAppSelector(LocationSlice.FetchStatus);
    const assetGroupStatus = useAppSelector(AssetGroupSlice.FetchStatus);
    const typeIDs = useAppSelector(EventTypeSlice.Data);
    const meters = useAppSelector(MeterSlice.Data);
    const assets = useAppSelector(AssetSlice.Data);
    const locations = useAppSelector(LocationSlice.Data);
    const groups = useAppSelector(AssetGroupSlice.Data);

    const referenceDataReady = [eventTypeStatus, meterStatus, assetStatus, locationStatus, assetGroupStatus]
        .every(status => status !== 'uninitiated' && status !== 'loading');
    const hasProcessedQuery = React.useRef(false);

    React.useEffect(() => {
        const query = queryString.parse(history.search.replace("?", ""), "&", "=");

        setInitialTab(query['tab'] != undefined ? query['tab'].toString() as any : undefined);
        setShowMagDur(query['magDur'] != undefined ? query['magDur'] == 'true' : false);
        setEventId(query['eventid'] != undefined ? parseInt(query['eventid'].toString()) : -1);
    }, []);

    // Effect to process the URL query string once the app-root reference data (meters/assets/locations/groups/event types) is ready
    React.useEffect(() => {
        if (hasProcessedQuery.current || !referenceDataReady)
            return;

        hasProcessedQuery.current = true;
        const query = queryString.parse(history.search.replace("?", ""), "&", "=");
        dispatch(ProcessQuery({ query, assets, groups, locations, meters, typeIDs }));
        setQueryReady(true);
    }, [referenceDataReady]);

    const getEventData = React.useCallback((query: IDynamicEventSearchQuery) =>
        GetDynamicEventSearchData({ ...eventRequest, sortKey: query?.SortField, ascending: query?.Ascending ?? true }, `${homePath}api/OpenXDA/GetEventSearchData`)
            .done((data) => {
                localStorage.setItem('SEbrowser.EventSearch.EventIDs', data.map(d => d.EventID).join(','));
            }),
        [eventRequest]);

    // Effect to load the selected event's record directly by ID (e.g. deep-linked from the URL) so selection does not depend on the current filter results
    React.useEffect(() => {
        if (eventId < 0 || selectedEvent?.EventID === eventId)
            return;

        const handle = GetEventSearchRecord(eventId);
        handle.done((records) => {
            if (records.length > 0)
                setSelectedEvent(records[0]);
        });

        return () => {
            if (handle?.abort != null)
                handle.abort();
        };
    }, [eventId, selectedEvent]);

    const currentFilter = React.useMemo<EventWidget.ICollectionFilter>(() => {
        const center = getMoment(timeRange.date, timeRange.time);
        const [start, end] = getStartEndTime(center, timeRange.windowSize, timeRange.timeWindowUnits);
        return {
            TimeFilter: {
                StartTime: start.format(OpenXDA.Consts.DateTimeFormat),
                EndTime: end.format(OpenXDA.Consts.DateTimeFormat)
            }
        };
    }, [timeRange]);

    const handleEventSelect = React.useCallback((id: number, disturbanceID?: number, faultID?: number) => {
        setEventId(id);
        setSelectedEvent({ EventID: id, DisturbanceID: disturbanceID, FaultID: faultID });
    }, []);

    const magDurSettings = React.useMemo(() => ({
        ...DynamicMagDurChart.DefaultSettings,
        Aggregate: eventSearchSettings.AggregateMagDur,
        NumberResults: eventSearchSettings.NumberResults
    }), [eventSearchSettings.AggregateMagDur, eventSearchSettings.NumberResults]);

    const eventSearchListSettings = React.useMemo(() => ({
        ...DynamicEventSearch.DefaultSettings,
        NumberResults: eventSearchSettings.NumberResults
    }), [eventSearchSettings.NumberResults]);

    const magDurWidgetView = React.useMemo<EventWidget.IWidgetView>(() => ({
        ID: 0, Name: DynamicMagDurChart.Name, Type: DynamicMagDurChart.Name, Setting: JSON.stringify(magDurSettings)
    }), [magDurSettings]);

    const eventSearchWidgetView = React.useMemo<EventWidget.IWidgetView>(() => ({
        ID: 0, Name: DynamicEventSearch.Name, Type: DynamicEventSearch.Name, Setting: JSON.stringify(eventSearchListSettings)
    }), [eventSearchListSettings]);

    React.useEffect(() => {
        if (!queryReady)
            return;

        const q = queryString.stringify(queryParam, "&", "=");
        const handle = setTimeout(() => navigate(history.pathname + '?' + q), 500);
        return (() => { clearTimeout(handle); })
    }, [queryParam, queryReady])

    React.useEffect(() => {
        localStorage.setItem('SEbrowser.EventSearch.ShowNav', showNav.toString())
    }, [showNav])

    return (
        <div style={{ width: '100%', height: '100%' }} data-drawer={'eventPreviewPane'}>
            <EventSearchNavbar
                toggleVis={() => setShowNav((c) => !c)}
                showNav={showNav}
                setHeight={setNavHeight}
            />
            <VerticalSplit style={{ width: '100%', height: (showNav ? 'calc(100% - ' + navHeight + 'px)' : 'calc( 100% - 52px)') }}>
                <SplitSection Width={50} MinWidth={25} MaxWidth={75}>
                    <div style={{ width: '100%', height: '100%', maxHeight: '100%', position: 'relative', float: 'left', overflowY: 'hidden' }}>
                        <div style={{ width: 'calc(100% - 300px)', padding: 10, float: 'left' }}>
                        </div>
                        <div style={{ width: 160, float: 'right', padding: 10 }}>
                            <button className='btn btn-danger' onClick={() => setShowMagDur((c) => !c)} >
                                View As {showMagDur ? 'List' : 'Mag/Dur'}
                            </button>
                        </div>
                        <div style={{ width: '100%', height: window.innerHeight - ((showNav ? navHeight : 52) + 120) }}>
                            <CollectionWidgetRouter
                                Widget={showMagDur ? magDurWidgetView : eventSearchWidgetView}
                                AvailableWidgets={availableWidgets}
                                EventFilter={currentFilter}
                                GetEventData={getEventData}
                                EventID={eventId}
                                Callback={handleEventSelect}
                                HomePath={homePath}
                                WidgetAuthorization={widgetAuthorization}
                            />
                        </div>
                    </div>
                </SplitSection>
                <SplitSection Width={50} MinWidth={25} MaxWidth={75}>
                    <div style={{ width: '100%', height: '100%', position: 'relative', float: 'right', overflowY: 'hidden' }}>
                        <EventPreviewPane
                            Event={selectedEvent}
                            InitialTab={initialTab}
                            Height={window.innerHeight - ((showNav ? navHeight : 52) + 62)}
                        />
                    </div>
                </SplitSection>
            </VerticalSplit>
        </div>
    );
}

const getShowNav = (): boolean  => {
    if (Object.prototype.hasOwnProperty.call(localStorage, 'SEbrowser.EventSearch.ShowNav')) {
        const value = localStorage.getItem('SEbrowser.EventSearch.ShowNav');
        if (value == null)
            return true;
        return JSON.parse(value);
    }
    else
        return true;
}

export default EventSearch;