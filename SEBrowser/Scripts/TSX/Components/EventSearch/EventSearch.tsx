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
import moment from 'moment';
import EventSearchList from './EventSearchList';
import { History } from 'history';
import EventSearchNavbar from './EventSearchNavbar';
import EventPreviewPane from './EventSearchPreview/EventSearchPreviewPane';
import EventSearchListedEventsNoteWindow from './EventSearchListedEventsNoteWindow';
import { OpenXDA, SEBrowser } from '../../global';
import queryString from 'querystring';
import EventSearchMagDur from './EventSearchMagDur';
import { useDispatch, useSelector } from 'react-redux';
import { ProcessQuery, SelectQueryParam, SetFilters } from './EventSearchSlice';
import createHistory from "history/createBrowserHistory";
import { AssetGroupSlice, AssetSlice, LocationSlice, MeterSlice } from '../../Store';


const momentDateTimeFormat = "MM/DD/YYYY HH:mm:ss.SSS";
const momentDateFormat = "MM/DD/YYYY";
const momentTimeFormat = "HH:mm:ss.SSS";

interface IProps { }

type tab = 'Waveform' | 'Fault' | 'Correlating' | 'Configuration' | 'All' | undefined;
const EventSearch = (props: IProps) => {
    const history = React.useRef<History<any>>();

    const dispatch = useDispatch();

    const meterList = useSelector(MeterSlice.SearchResults);
    const assetList = useSelector(AssetSlice.SearchResults);
    const assetGroupList = useSelector(AssetGroupSlice.SearchResults);
    const locationList = useSelector(LocationSlice.SearchResults);
    const meterStatus = useSelector(MeterSlice.Status);
    const assetStatus = useSelector(AssetSlice.Status);
    const assetGroupStatus = useSelector(AssetGroupSlice.Status);
    const locationStatus = useSelector(LocationSlice.Status);

    const [eventId, setEventId] = React.useState<number>(-1);
    const [searchText, setSearchText] = React.useState<string>('');
    const [searchList, setSearchList] = React.useState<OpenXDA.Event[]>([]);
    const [initialTab, setInitialTab] = React.useState<tab>(undefined);
    const [showMagDur, setShowMagDur] = React.useState<boolean>(false);
    const [showNav, setShowNav] = React.useState<boolean>(true);

    const queryParam = useSelector(SelectQueryParam);

    React.useEffect(() => {
        history.current = createHistory();
        var query = queryString.parse(history.current['location'].search.replace("?",""), "&", "=", { decodeURIComponent: queryString.unescape });

        dispatch(ProcessQuery(query));


        setInitialTab(query['tab'] != undefined ? query['tab'].toString() as any : undefined);
        setShowMagDur(query['magDur'] != undefined ? query['magDur'] == 'true' : false);
        setEventId(query['eventid'] != undefined ? parseInt(query['eventid'].toString()) : -1);

    }, []);

    React.useEffect(() => {
        if (meterStatus == 'changed' || meterStatus == 'unintiated')
            dispatch(MeterSlice.Fetch());
    }, [meterStatus]);

    React.useEffect(() => {
        if (assetStatus == 'changed' || assetStatus == 'unintiated')
            dispatch(AssetSlice.Fetch());
    }, [assetStatus]);

    React.useEffect(() => {
        if (assetGroupStatus == 'changed' || assetGroupStatus == 'unintiated')
            dispatch(AssetGroupSlice.Fetch());
    }, [assetGroupStatus]);

    React.useEffect(() => {
        if (locationStatus == 'changed' || locationStatus == 'unintiated')
            dispatch(LocationSlice.Fetch());
    }, [locationStatus]);

    React.useEffect(() => {
        let q = queryString.stringify(queryParam, "&", "=", { encodeURIComponent: queryString.escape });
        let handle = setTimeout(() => history.current['push'](history.current['location'].pathname + '?' + q), 500);
        return (() => { clearTimeout(handle); })
    }, [queryParam])

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <EventSearchNavbar
                toggleVis={() => setShowNav((c) => !c)}
                showNav={showNav}
            />
            <div style={{ width: '100%', height: (showNav ? 'calc( 100% - 303px)' : 'calc( 100% - 52px)')}}>
                <div style={{ width: '50%', height: '100%', maxHeight: '100%', position: 'relative', float: 'left', overflowY: 'hidden' }}>
                    <div style={{ width: 'calc(100% - 300px)', padding: 10, float: 'left' }}>
                        <input className='form-control' type='text' placeholder='Search...' value={searchText} onChange={(evt) => setSearchText(evt.target.value)} />
                    </div>
                    <div style={{ width: 120, float: 'right', padding: 10 }}>
                        <EventSearchListedEventsNoteWindow searchList={searchList} />
                    </div>
                    <div style={{ width: 160, float: 'right', padding: 10 }}>
                        <button className='btn btn-danger' onClick={() => setShowMagDur((c) => !c)} > View As {showMagDur ? 'List' : 'Mag/Dur'}</button>
                    </div>
                    {showMagDur ?
                        <EventSearchMagDur Width={(window.innerWidth - 300) / 2}
                            Height={window.innerHeight - ((showNav? 303 : 52) + 58)}
                            EventID={eventId} SearchText={searchText}
                            OnSelect={(evt, point) => setEventId(point.EventID)}
                        /> :
                        <EventSearchList eventid={eventId} searchText={searchText} selectEvent={setEventId} height={window.innerHeight - ((showNav ? 303 : 52) + 58)}/>
                    }
                </div>
                <div style={{ width: '50%', height: '100%', position: 'relative', float: 'right', overflowY: 'hidden' }}>
                    <EventPreviewPane EventID={eventId} InitialTab={initialTab} />
                </div>

            </div>
        </div>
    );
}

export default EventSearch;
