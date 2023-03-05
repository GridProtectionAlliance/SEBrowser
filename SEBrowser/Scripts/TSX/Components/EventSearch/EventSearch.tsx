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
import EventSearchList from './EventSearchList';
import { History } from 'history';
import EventSearchNavbar from './EventSearchNavbar';
import EventPreviewPane from './EventSearchPreview/EventSearchPreviewPane';
import EventSearchListedEventsNoteWindow from './EventSearchListedEventsNoteWindow';
import queryString from 'querystring';
import EventSearchMagDur from './EventSearchMagDur';
import { ProcessQuery, SelectEventList, SelectQueryParam } from './EventSearchSlice';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { SplitSection, VerticalSplit } from '@gpa-gemstone/react-interactive';

interface IProps { }

type tab = 'Waveform' | 'Fault' | 'Correlating' | 'Configuration' | 'All' | undefined;

const EventSearch = (props: IProps) => {
    const history = useLocation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const [eventId, setEventId] = React.useState<number>(-1);
    const [initialTab, setInitialTab] = React.useState<tab>(undefined);
    const [showMagDur, setShowMagDur] = React.useState<boolean>(false);
    const [showNav, setShowNav] = React.useState<boolean>(getShowNav());
    const [navHeight, setNavHeight] = React.useState<number>(0);

    const queryParam = useAppSelector(SelectQueryParam);
    const evtList = useAppSelector(SelectEventList);

    React.useEffect(() => {
        var query = queryString.parse(history.search.replace("?",""), "&", "=", { decodeURIComponent: queryString.unescape });

        dispatch(ProcessQuery(query));


        setInitialTab(query['tab'] != undefined ? query['tab'].toString() as any : undefined);
        setShowMagDur(query['magDur'] != undefined ? query['magDur'] == 'true' : false);
        setEventId(query['eventid'] != undefined ? parseInt(query['eventid'].toString()) : -1);

    }, []);

   
    React.useEffect(() => {
        let q = queryString.stringify(queryParam, "&", "=", { encodeURIComponent: queryString.escape });
        let handle = setTimeout(() => navigate(history.pathname + '?' + q), 500);
        return (() => { clearTimeout(handle); })
    }, [queryParam])

    React.useEffect(() => {
        localStorage.setItem('SEbrowser.EventSearch.ShowNav', showNav.toString())
    }, [showNav])

    React.useEffect(() => {
        localStorage.setItem('SEbrowser.EventSearch.EventIDs', evtList)
    }, [evtList])


    function getShowNav(): boolean {
        if (localStorage.hasOwnProperty('SEbrowser.EventSearch.ShowNav'))
            return JSON.parse(localStorage.getItem('SEbrowser.EventSearch.ShowNav'))
        else
            return true;
    }

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <EventSearchNavbar
                toggleVis={() => setShowNav((c) => !c)}
                showNav={showNav}
                setHeight={setNavHeight}
            />
            <VerticalSplit style={{ width: '100%', height: (showNav ? 'calc(100% - ' + navHeight + 'px)': 'calc( 100% - 52px)') }}>
                    <SplitSection Width={50} MinWidth={25} MaxWidth={75}>
                        <div style={{ width: '100%', height: '100%', maxHeight: '100%', position: 'relative', float: 'left', overflowY: 'hidden' }}>
                            <div style={{ width: 'calc(100% - 300px)', padding: 10, float: 'left' }}>
                            </div>
                            <div style={{ width: 160, float: 'right', padding: 10 }}>
                            <button className='btn btn-danger' onClick={() => setShowMagDur((c) => !c)} >
                                View As {showMagDur ? 'List' : 'Mag/Dur'}
                            </button>
                            </div>
                            {showMagDur ?
                                <EventSearchMagDur
                                Height={window.innerHeight - ((showNav ? navHeight : 52) + 120)}
                                    EventID={eventId}
                                SelectEvent={setEventId}
                                /> :
                            <EventSearchList eventid={eventId}
                                selectEvent={setEventId}
                                height={window.innerHeight - ((showNav ? navHeight : 52) + 120)} />
                            }
                        </div>
                    </SplitSection>
                    <SplitSection Width={50} MinWidth={25} MaxWidth={75}>
                        <div style={{ width: '100%', height: '100%', position: 'relative', float: 'right', overflowY: 'hidden' }}>
                        <EventPreviewPane
                            EventID={eventId}
                            InitialTab={initialTab}
                            Height={window.innerHeight - ((showNav ? navHeight : 52) + 62)} />
                        </div>
                    </SplitSection>
                </VerticalSplit>
        </div>
    );
}

export default EventSearch;
