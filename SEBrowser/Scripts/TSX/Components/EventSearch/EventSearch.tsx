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
import { useDispatch } from 'react-redux';
import { SetFilters } from './EventSearchSlice';
import createHistory from "history/createBrowserHistory";


const momentDateTimeFormat = "MM/DD/YYYY HH:mm:ss.SSS";
const momentDateFormat = "MM/DD/YYYY";
const momentTimeFormat = "HH:mm:ss.SSS";

interface IProps { }

type tab = 'Waveform' | 'Fault' | 'Correlating' | 'Configuration' | 'All' | undefined;
const EventSearch = (props: IProps) => {
    const history = React.useRef<History<any>>();

    const dispatch = useDispatch();

    const [eventId, setEventId] = React.useState<number>(-1);
    const [searchText, setSearchText] = React.useState<string>('');
    const [searchList, setSearchList] = React.useState<OpenXDA.Event[]>([]);
    const [initialTab, setInitialTab] = React.useState<tab>(undefined);
    const [showMagDur, setShowMagDur] = React.useState<boolean>(false);
    const [showNav, setShowNav] = React.useState<boolean>(true);

    React.useEffect(() => {
        history.current = createHistory();
        var query = queryString.parse(history.current['location'].search, "&", "=", { decodeURIComponent: queryString.unescape });

        const eventTypes = {
            faults: (query['faults'] != undefined ? query['faults'] == 'true' : true),
            sags: (query['sags'] != undefined ? query['sags'] == 'true' : true),
            swells: (query['swells'] != undefined ? query['swells'] == 'true' : true),
            interruptions: (query['interruptions'] != undefined ? query['interruptions'] == 'true' : true),
            breakerOps: (query['breakerOps'] != undefined ? query['breakerOps'] == 'true' : true),
            transients: (query['transients'] != undefined ? query['transients'] == 'true' : true),
            relayTCE: (query['relayTCE'] != undefined ? query['realyTCE'] == 'true' : true),
            others: (query['others'] != undefined ? query['others'] == 'true' : true)
        }

        const times = {
            date: (query['date'] != undefined ? query['date'] as string : moment().format(momentDateFormat)),
            time: (query['time'] != undefined ? query['time'] as string : moment().format(momentTimeFormat)),
            windowSize: (query['windowSize'] != undefined ? parseInt(query['windowSize'].toString()) : 10),
            timeWindowUnits: (query['timeWindowUnits'] != undefined ? parseInt(query['timeWindowUnits'].toString()) : 2)
        };

        const characteristics = {
            durationMax: 0,
            durationMin: 0,
            Phase: { A: true, B: true, C: true }
        }


        setInitialTab(query['tab'] != undefined ? query['tab'].toString() as any : undefined);
        setShowMagDur(query['magDur'] != undefined ? query['magDur'] == 'true' : false);

        setSearchText(query['searchText'] != undefined ? query['searchText'].toString() : '');
        setEventId(query['eventid'] != undefined ? parseInt(query['eventid'].toString()) : -1);

        dispatch(SetFilters({ characteristics: characteristics, time: times, types: eventTypes }));
    }, []);

    
    return (
        <div style={{ width: '100%', height: '100%' }}>
            <EventSearchNavbar
                toggleVis={() => setShowNav((c) => !c)}
                showNav={showNav}
            />
            <div style={{ width: '100%', height: 'calc( 100% - 210px)' }}>
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
                            Height={window.innerHeight - 300}
                            EventID={eventId} SearchText={searchText}
                            OnSelect={(evt, point) => setEventId(point.EventID)}
                        /> :
                        <EventSearchList eventid={eventId} searchText={searchText} selectEvent={setEventId} />
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
