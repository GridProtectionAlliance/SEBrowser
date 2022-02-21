//******************************************************************************************************
//  EventSearchNoteWindow.tsx - Gbtc
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
//  04/25/2019 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SelectEventSearchs } from './EventSearchSlice';
import { LoadingScreen, Modal, ServerErrorIcon, ToolTip } from '@gpa-gemstone/react-interactive';
import Table, { SelectTable } from '@gpa-gemstone/react-table';
import { EventNoteSlice } from '../../Store';
import { Application, OpenXDA } from '@gpa-gemstone/application-typings';
import { EventNote } from './EventNoteSlice';
import moment from 'moment';
import { CrossMark } from '@gpa-gemstone/gpa-symbols';
import { TextArea } from '@gpa-gemstone/react-forms';


const EventSearchListedEventsNoteWindow: React.FC<{}> = () => {
    const [show, setShow] = React.useState<boolean>(false);
    const events = useSelector(SelectEventSearchs);
    const selectedIDs = useSelector(EventNoteSlice.EventIDs);
    const dispatch = useDispatch();

    const [noteType, setNoteType] = React.useState<OpenXDA.Types.NoteType>({ ID: -1, Name: 'Event', ReferenceTableName: 'Event' });
    const [noteTag, setNoteTag] = React.useState<OpenXDA.Types.NoteTag>({ ID: -1, Name: 'General' });
    const [noteApp, setNoteApp] = React.useState<OpenXDA.Types.NoteApplication>({ ID: -1, Name: 'SEbrowser' });

    const [note, setNote] = React.useState<EventNote>(CreateNewNote());


    function CreateNewNote() {
        const newNote: EventNote = {
            ID: -1,
            ReferenceTableID: -1,
            NoteTagID: noteTag?.ID ?? -1,
            NoteTypeID: noteType?.ID ?? -1,
            NoteApplicationID: noteApp?.ID ?? -1,
            Timestamp: '',
            UserAccount: '',
            Note: '',
            IDs: selectedIDs.map(() => -1),
            EventIDs: selectedIDs,
            NumEvents: selectedIDs.length
        }

        return newNote;
    }

    React.useEffect(() => {
        setNote(CreateNewNote());
    }, [selectedIDs, noteType, noteTag, noteApp])

    React.useEffect(() => {
        let typeHandle = getNoteType();
        return () => { if (typeHandle != null && typeHandle.abort != null) typeHandle.abort(); }
    }, []);

    React.useEffect(() => {
        let tagHandle = getNoteTag();
        return () => { if (tagHandle != null && tagHandle.abort != null) tagHandle.abort(); }
    }, []);

    React.useEffect(() => {
        let appHandle = getNoteApp();
        return () => { if (appHandle != null && appHandle.abort != null) appHandle.abort(); }
    }, []);

    React.useEffect(() => { })

    function getNoteType(): JQuery.jqXHR<OpenXDA.Types.NoteType[]> {
        let handle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenXDA/NoteType`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        handle.done((d: OpenXDA.Types.NoteType[]) => {

            let record = d.find(r => r.ReferenceTableName == 'Event')
            setNoteType(record);
        });

        return handle;
    }

    function getNoteApp(): JQuery.jqXHR<OpenXDA.Types.NoteApplication[]> {
        let handle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenXDA/NoteApp`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        handle.done((d: OpenXDA.Types.NoteApplication[]) => {
            let record = d.find(r => r.Name == "SEbrowser")
            setNoteApp(record);
        });

        return handle;
    }

    function getNoteTag(): JQuery.jqXHR<OpenXDA.Types.NoteTag[]> {
        let handle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenXDA/NoteTag`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        handle.done((d: OpenXDA.Types.NoteTag[]) => {
            let record = d.find(r => r.Name == "General")
            setNoteTag(record);
        });

        return handle;
    }

    function ProcessWhitespace(txt: string | number): React.ReactNode {
        if (txt == null)
            return <>N/A</>
        let lines = txt.toString().split("<br>");
        return lines.map((item, index) => {
            if (index == 0)
                return <> {item} </>
            return <> <br /> {item} </>
        })
    }

    function handleAdd(d: EventNote) {
        dispatch(EventNoteSlice.DBAction({ verb: 'POST', record: { ...d, UserAccount: undefined, Timestamp: moment().format('MM/DD/YYYY HH:mm') } }))
        setNote(CreateNewNote());
    }

    return (
        <div>
            <button className="btn btn-primary" onClick={() => setShow(true)}>Add Notes</button>

            <Modal Show={show} ShowX={true} Title={'Add Notes to an Event'} Size={'xlg'}
                ShowCancel={true} CancelBtnClass={'btn-default'}
                DisableCancel={note.Note === null || note.Note.length === 0}
                DisableConfirm={note.Note === null || note.Note.length === 0 || selectedIDs.length == 0}
                CancelText={'Clear'}
                ConfirmText={'Add Note'}
                CancelShowToolTip={(note.Note === null || note.Note.length === 0)}
                ConfirmShowToolTip={(note.Note === null || note.Note.length === 0) || selectedIDs.length == 0}
                CancelToolTipContent={<p>{CrossMark} The note field is already empty. </p>}
                ConfirmToolTipContent={selectedIDs.length > 0 ? < p > {CrossMark} A note needs to be entered. </p> : <p> {CrossMark} At least 1 Event needs to be selected. </p>}
                CallBack={(conf, isBtn) => {
                    if (!isBtn)
                        setShow(false);
                    if (conf && isBtn)
                        handleAdd(note);
                    if (!confirm && isBtn)
                        setNote((n) => ({ ...n, Note: '' }))
                }}>

                <div className="row">
                    <div className="col-6">
                        <SelectTable
                            cols={[
                                { field: "Time", key: "Time", label: "Time", content: (item, key, fld, style) => ProcessWhitespace(item[fld]) },
                                { field: "Event Type", key: "Event Type", label: "Event Type" },
                                { field: "Meter", key: "Meter", label: "Meter" },
                                { field: "Asset", key: "Asset", label: "Asset" }                                
                            ]}
                            ascending={true}
                            sortKey={'Time'}
                            data={events}
                            KeyField={'EventID'}
                            onSelection={(d) => dispatch(EventNoteSlice.SetSelectedEvents(d.map(i => i["EventID"])))}
                            theadStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                            tbodyStyle={{ display: 'block', overflowY: 'scroll', maxHeight: window.innerHeight - 400 }}
                            rowStyle={{ display: 'table', tableLayout: 'fixed', width: 'calc(100%)' }}
                        />
                    </div>
                    <div className="col-6">
                        <EventNoteWindow note={note} setNote={(n) => setNote(n)} />
                    </div>
                </div> 
            </Modal>
        </div>
    );
    
}

interface IEvNoteProps { note: EventNote, setNote: (n:EventNote) => void }
const EventNoteWindow = (props: IEvNoteProps) => {
    const data: EventNote[] = useSelector(EventNoteSlice.Data)
    const dataStatus: Application.Types.Status = useSelector(EventNoteSlice.Status)
    const sortField: keyof OpenXDA.Types.Note = useSelector(EventNoteSlice.SortField)
    const ascending: boolean = useSelector(EventNoteSlice.Ascending);

    const selectedIDs = useSelector(EventNoteSlice.EventIDs);


    const dispatch = useDispatch();

    const h = window.innerHeight - 400;


    React.useEffect(() => {
        if (dataStatus === 'unintiated' || dataStatus === 'changed')
            dispatch(EventNoteSlice.Fetch(selectedIDs));
    }, [dataStatus]);

    if (dataStatus === "error")
        return (<div style={{ width: '100%', height: '100%' }}>
            <div style={{ height: '40px', margin: 'auto', marginTop: 'calc(50% - 20 px)' }}>
                <ServerErrorIcon Show={true} Size={40} Label={'A Server Error Occurred. Please Reload the Application'} />
            </div>
        </div>)

    return <div className="card" style={{ marginBottom: 10, maxHeight: h, width: '100%' }}>
        <LoadingScreen Show={dataStatus === 'loading'} />
        <div className="card-header">
            <div className="row">
                <div className="col">
                    <h4>{'Notes:'}</h4>
                </div>
            </div>
        </div>
        <div className="card-body" style={{ maxHeight: h - 100, overflowY: 'auto', width: '100%' }}>
            <div>
                <Table<EventNote>
                    cols={[
                        { key: 'Note', field: 'Note', label: 'Note', headerStyle: { width: '50%' }, rowStyle: { width: '50%' } },
                        { key: 'Timestamp', field: 'Timestamp', label: 'Time', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' }, content: (item) => moment.utc(item.Timestamp).format("MM/DD/YYYY HH:mm") },
                        { key: 'UserAccount', field: 'UserAccount', label: 'User', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' } },
                        { key: 'Num', field: 'NumEvents', label: 'Num. of Events', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' }, content: (item) => item.IDs.length },
                    ]}
                    tableClass="table table-hover"
                    data={data}
                    sortKey={sortField}
                    ascending={ascending}
                    onSort={(d) => {
                        if (d.colField === undefined)
                            return;
                        if (d.colField === sortField)
                            dispatch(EventNoteSlice.Sort({ SortField: sortField, Ascending: ascending }))
                        else
                            dispatch(EventNoteSlice.Sort({ SortField: d.colField, Ascending: true }))

                    }}
                    onClick={() => { return; }}
                    theadStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                    tbodyStyle={{ display: 'block', overflowY: 'scroll', maxHeight: window.innerHeight - 300, width: '100%' }}
                    rowStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                    selected={() => false}
                />
            </div>
            <div className="row">
                <div className={'col-12'}>
                    <TextArea<EventNote> Record={props.note} Rows={4} Field={'Note'} Setter={(n) => props.setNote(n)} Valid={() => props.note.Note != null && props.note.Note.length > 0} Label={''} />
                </div>
            </div>
        </div>
        <div className="card-footer">
        </div>
    </div>
}
export default EventSearchListedEventsNoteWindow