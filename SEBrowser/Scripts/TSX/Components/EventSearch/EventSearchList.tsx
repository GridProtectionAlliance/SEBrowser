//******************************************************************************************************
//  EventSearchList.tsx - Gbtc
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
//  04/24/2019 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React from 'react';
import ReactDOM from 'react-dom';
import { LoadingIcon, OverlayDrawer } from '@gpa-gemstone/react-interactive';
import { ConfigTable } from '@gpa-gemstone/react-interactive';
import { ReactTable } from '@gpa-gemstone/react-table'
import { useAppDispatch, useAppSelector } from '../../hooks';
import { Redux } from '../../global';
import { SelectEventSearchsAscending, SelectEventSearchsSortField, Sort, SelectEventSearchsStatus, FetchEventSearches, SelectEventSearchs } from './EventSearchSlice';
import { SelectEventSearchSettings } from '../SettingsSlice';

interface IProps {
    eventid: number,
    selectEvent: (id: number) => void,
    height: number
}

interface IColumn {
    key: string,
    label: string,
    field: keyof any,
}

export default function EventSearchList(props: IProps) {
    const ref = React.useRef();
    const closureHandler = React.useRef<((o: boolean) => void)>(() => {/*Do Nothing*/ });
    const count = React.useRef(null);

    const dispatch = useAppDispatch();

    const status = useAppSelector(SelectEventSearchsStatus);
    const sortField = useAppSelector(SelectEventSearchsSortField);
    const ascending = useAppSelector(SelectEventSearchsAscending);
    const data = useAppSelector((state: Redux.StoreState) => SelectEventSearchs(state));
    const numberResults = useAppSelector((state: Redux.StoreState) => SelectEventSearchSettings(state).NumberResults);

    const [cols, setCols] = React.useState<IColumn[]>([]);
    const [hCounter, setHCounter] = React.useState<number>(0);

    React.useEffect(() => {
        document.addEventListener("keydown", handleKeyPress, false);

        return () => {
            document.removeEventListener("keydown", handleKeyPress, false);
        }
    })

    React.useEffect(() => {
        if (status != 'unitiated' && status != 'changed') return;

        dispatch(FetchEventSearches());
    }, [status]);

    React.useEffect(() => {
        let flds = [];
        if (data.length == 0)
            return;

        flds = Object.keys(data[0]).filter(item => item != "Time" && item != "DisturbanceID" && item != "EventID" && item != "EventID1" && item != 'MagDurDuration' && item != 'MagDurMagnitude').sort();

        if (flds.length != cols.length)
            setCols(flds.map(item => ({ field: item, key: item, label: item })))
    }, [data])

    React.useLayoutEffect(() => {
        setHCounter(count?.current?.offsetHeight ?? 0)
    });

    function closeSettings(open: boolean) {
        closureHandler.current(open);
    }

    function handleKeyPress(event) {
        if (data.length == 0) return;

        const index = data.map(a => a.EventID.toString()).indexOf(props.eventid.toString());

        if (event.keyCode == 40) // arrow down key
        {
            event.preventDefault();

            if (props.eventid == -1)
                props.selectEvent(data[0].EventID);
            else if (index == data.length - 1)
                props.selectEvent(data[0].EventID);
            else
                props.selectEvent(data[index + 1].EventID);

        }
        else if (event.keyCode == 38)  // arrow up key
        {
            event.preventDefault();

            if (props.eventid == -1)
                props.selectEvent(data[data.length - 1].EventID);
            else if (index == 0)
                props.selectEvent(data[data.length - 1].EventID);
            else
                props.selectEvent(data[index - 1].EventID);
        }

        setScrollBar();
    }

    function setScrollBar() {
        const rowHeight = $(ReactDOM.findDOMNode(ref.current)).find('tbody').children()[0].clientHeight;
        const index = data.map(a => a.EventID.toString()).indexOf(props.eventid.toString());
        const tableHeight = data.length * rowHeight;
        const windowHeight = window.innerHeight - 314;
        const tableSectionCount = Math.ceil(tableHeight / windowHeight);
        const tableSectionHeight = Math.ceil(tableHeight / tableSectionCount);
        const rowsPerSection = tableSectionHeight / rowHeight;
        const sectionIndex = Math.floor(index / rowsPerSection);
        const scrollTop = $(ReactDOM.findDOMNode(ref.current)).find('tbody').scrollTop();

        if (scrollTop <= sectionIndex * tableSectionHeight || scrollTop >= (sectionIndex + 1) * tableSectionHeight - tableSectionHeight / 2)
            $(ReactDOM.findDOMNode(ref.current)).find('tbody').scrollTop(sectionIndex * tableSectionHeight);
    }

    function ProcessWhitespace(txt: string | number): React.ReactNode {
        if (txt == null)
            return <>N/A</>;
        const lines = txt.toString().split("<br>");
        return lines.map((item, i) => {
            if (i == 0)
                return <div key={i}> {item} </div>;
            return <> <br /> {item} </>;
        })
    }
    return (
        <>
            <div ref={ref} style={{
                width: '100%',
                maxHeight: props.height,
                overflowY: "hidden",
                overflowX: "hidden",
                opacity: (status == 'loading' ? 0.5 : undefined),
                backgroundColor: (status == 'loading' ? '#00000' : undefined)
            }}>
                {status == 'loading' ?
                    <div style={{ height: '40px', width: '40px', margin: 'auto' }}>
                        <LoadingIcon Show={true} Size={40} />
                    </div>
                    : null}
                {cols.length > 0 ?
                    <ConfigTable.Table<any>
                        LocalStorageKey="SEbrowser.EventSearch.TableCols"
                        TableClass="table table-hover"
                        Data={data}
                        SortKey={sortField}
                        Ascending={ascending}
                        TheadStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%', height: 60 }}
                        TbodyStyle={{ display: 'block', overflowY: 'scroll', maxHeight: props.height - hCounter - 60 }}
                        RowStyle={{ display: 'table', tableLayout: 'fixed', width: 'calc(100%)' }}
                        TableStyle={{ marginBottom: 0 }}
                        KeySelector={(item) => (item.EventID.toString() + '-' + item.DisturbanceID)}
                        OnClick={(item) => props.selectEvent(item.row.EventID)}
                        SettingsPortal={'TableSettings'}
                        OnSettingsChange={closeSettings}
                        Selected={(item) => {
                            if (item.EventID == props.eventid) return true;
                            else return false;
                        }}
                        OnSort={(d) => {
                            if (d.colKey == sortField) dispatch(Sort({ Ascending: ascending, SortField: sortField }));
                            else dispatch(Sort({ Ascending: true, SortField: d.colKey }));
                        }}
                    >
                        <ReactTable.Column<any>
                            Key={'Time'}
                            AllowSort={true}
                            Content={({ item, field }) => ProcessWhitespace(item[field])}
                            Field={'Time'}
                        >
                            Time
                        </ReactTable.Column>
                        {...cols.map((c, i) => (
                            <ConfigTable.Configurable key={i} Key={c.label} Label={c.label} Default={c.key === 'Event Type'}>
                                <ReactTable.Column<any>
                                    Key={c.key}
                                    AllowSort={true}
                                    Field={c.label}
                                    Content={({ item, field }) => ProcessWhitespace(item[field])}
                                >
                                    {c.label}
                                </ReactTable.Column>
                            </ConfigTable.Configurable>
                        ))}
                    </ConfigTable.Table>
                    : null}
                {status == 'loading' ?
                    null
                    : data.length == numberResults ?
                        <div style={{ padding: 10, backgroundColor: '#458EFF', color: 'white' }} ref={count}>
                            Only the first {data.length} results are shown (sorted {(ascending ? 'ascending' : 'descending')} by {sortField}) - please narrow your search or increase the number of results in the application settings.
                        </div>
                        : <div style={{ padding: 10, backgroundColor: '#458EFF', color: 'white' }} ref={count}>{data.length} results</div>
                }
            </div>
            <OverlayDrawer Title={''} Open={false} Location={'right'} Target={'eventPreviewPane'} GetOverride={(s) => { closureHandler.current = s; }} HideHandle={true}>
                <div id={'TableSettings'} style={{ height: 500, width: 800, opacity: 1, background: undefined, color: 'black' }}></div>
            </OverlayDrawer>
        </>
    );
}

