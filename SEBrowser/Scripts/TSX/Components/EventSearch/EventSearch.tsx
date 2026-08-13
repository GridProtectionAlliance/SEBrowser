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
import { HelpIcon, ToggleSwitch } from '@gpa-gemstone/react-forms';
import { useGetContainerPosition } from '@gpa-gemstone/helper-functions';
import { ErrorBoundary } from '@gpa-gemstone/common-pages';
import { ReactIcons } from '@gpa-gemstone/gpa-symbols';

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
    const [queryReady, setQueryReady] = React.useState<boolean>(false);
    const [resultCount, setResultCount] = React.useState<number | null>(null);

    const previewPaneRef = React.useRef<HTMLDivElement | null>(null);
    const { height: previewPaneHeight } = useGetContainerPosition(previewPaneRef);

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

    const magDurWidgetView = React.useMemo<EventWidget.IWidgetView>(() => ({
        ID: 0,
        Name: DynamicMagDurChart.Name,
        Type: DynamicMagDurChart.Name,
        Setting: JSON.stringify({
            ...DynamicMagDurChart.DefaultSettings,
            Aggregate: eventSearchSettings.AggregateMagDur,
            NumberResults: eventSearchSettings.NumberResults
        })
    }), [eventSearchSettings.AggregateMagDur, eventSearchSettings.NumberResults]);

    const eventSearchWidgetView = React.useMemo<EventWidget.IWidgetView>(() => ({
        ID: 1,
        Name: DynamicEventSearch.Name,
        Type: DynamicEventSearch.Name,
        Setting: JSON.stringify({
            ...DynamicEventSearch.DefaultSettings,
            NumberResults: eventSearchSettings.NumberResults
        })
    }), [eventSearchSettings.NumberResults]);

    React.useEffect(() => {
        if (!queryReady)
            return;

        const q = queryString.stringify(queryParam, "&", "=");
        const handle = setTimeout(() => navigate(history.pathname + '?' + q), 500);
        return (() => { clearTimeout(handle); })
    }, [queryParam, queryReady])

    return (
        <div className="d-flex flex-column" style={{ width: '100%', height: '100%' }} data-drawer={'eventPreviewPane'}>
            <ErrorBoundary ErrorMessage={'Error loading page.'}>
                <EventSearchNavbar />
            </ErrorBoundary>
            <ErrorBoundary ErrorMessage={'Error loading page.'} ClassName={'h-100'}>
                <VerticalSplit style={{ width: '100%', flex: 1, minHeight: 0 }}>
                    <SplitSection Width={50} MinWidth={25} MaxWidth={75}>
                        <div className="d-flex flex-column" style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                            <div className='row m-0 flex-shrink-0'>
                                <div className='col-6 pl-1 d-flex justify-content-start'>
                                    {resultCount != null ?
                                        <p className="d-flex align-items-center">
                                            Results: {resultCount}
                                            {resultCount === eventSearchSettings.NumberResults ?
                                                <HelpIcon Help={`${showMagDur ? 'Events without a magnitude and duration are not displayed on the chart. ' : ''}Only the first ${resultCount} results are shown - please narrow your search or increase the number of results in the application settings.`} />
                                                : null}
                                        </p> : null}
                                </div>
                                <div className='col-6 pr-1 p-0 d-flex justify-content-end'>
                                    <ToggleSwitch<{ UseMagDur: boolean }>
                                        Record={{ UseMagDur: showMagDur }}
                                        Field="UseMagDur"
                                        Label={showMagDur ? 'List' : 'Mag/Dur'}
                                        Setter={(rec) => setShowMagDur(rec.UseMagDur)}
                                    />
                                </div>
                            </div>
                            <div style={{ width: '100%', flex: 1, minHeight: 0 }}>
                                {queryReady ?
                                    <CollectionWidgetRouter
                                        Widget={showMagDur ? magDurWidgetView : eventSearchWidgetView}
                                        AvailableWidgets={availableWidgets}
                                        EventFilter={currentFilter}
                                        GetEventData={getEventData}
                                        OnDataLoaded={setResultCount}
                                        EventID={eventId}
                                        Callback={handleEventSelect}
                                        HomePath={homePath}
                                        WidgetAuthorization={widgetAuthorization}
                                    />
                                    : <div className="d-flex justify-content-center align-items-center h-100">
                                        <ReactIcons.SpiningIcon Size={'50%'} />
                                    </div>}
                            </div>
                        </div>
                    </SplitSection>
                    <SplitSection Width={50} MinWidth={25} MaxWidth={75}>
                        <div ref={previewPaneRef} style={{ width: '100%', height: '100%', position: 'relative', overflowY: 'hidden' }}>
                            <ErrorBoundary ErrorMessage={'Error loading page.'} ClassName={'h-100'}>
                                <EventPreviewPane
                                    Event={selectedEvent}
                                    InitialTab={initialTab}
                                    Height={previewPaneHeight}
                                />
                            </ErrorBoundary>
                        </div>
                    </SplitSection>
                </VerticalSplit>
            </ErrorBoundary>
        </div>
    );
}

export default EventSearch;
