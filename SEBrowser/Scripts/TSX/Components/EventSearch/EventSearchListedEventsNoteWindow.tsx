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
import SEBrowserService from './../../../TS/Services/SEBrowser';
import { orderBy, filter, clone } from 'lodash';
import { OpenXDA } from '../../global';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { SelectEventSearchBySearchText } from './EventSearchSlice';

interface NoteMade { EventIds: Array<number>, Note: string, Timestamp: string, UserAccount: string }

interface IState {
    show: boolean,
    note: string,
    ids: Array<number>,
    notesMade: Array<{EventIds: Array<number>, Note: string, Timestamp: string, UserAccount: string}>
}

const EventSearchListedEventsNoteWindow: React.FC < {} > = () => {
    const [show, setShow] = React.useState<boolean>(false);
    const [note, setNote] = React.useState<string>('');
    const [notesmade, setNotesMade] = React.useState<NoteMade[]>([])
    const [selectedIds, setSelectedIDs] = React.useState<number[]>([]);
    const events = useSelector(SelectEventSearchBySearchText);


    var tableRows: Array<JSX.Element> = events.map((evt, index) => {
        return (
            <tr key={index} style={{ display: 'table', tableLayout: 'fixed', width: 'calc(100%)' }}>
                <td><input type='checkbox' checked={selectedIds.indexOf(evt.EventID) >= 0} value={evt.EventID} onChange={(e) => {
                    var selected = $(e.target).prop('checked');
                    var eventId = parseInt(e.target.value);
                    var list = clone(selectedIds);

                    if (selected && !(list.indexOf(eventId) >= 0)) {

                        list.push(eventId);
                        setSelectedIDs(list.sort())
                    }
                    else if (!selected && (list.indexOf(eventId) >= 0)) {
                        list = list.filter(a => a != eventId);
                        setSelectedIDs(list.sort())
                    }

                }} /></td>
                <td><span>{moment(evt.FileStartTime).format('MM/DD/YYYY')}<br />{moment(evt.FileStartTime).format('HH:mm:ss.SSSSSSS')}</span></td>
                <td>{evt.AssetName}</td>
                <td>{evt.EventType}</td>
            </tr>
        );
    });

    var madeNotes: Array<JSX.Element> = notesmade.map((noteMade, index) => {
        return (
            <tr key={index} style={{ display: 'table', tableLayout: 'fixed', width: 'calc(100%)' }}>
                <td>{noteMade.Note}</td>
                <td><span>{moment(noteMade.Timestamp).format('MM/DD/YYYY')}<br />{moment(noteMade.Timestamp).format('HH:mm:ss.SSSSSSS')}</span></td>
                <td>{noteMade.UserAccount}</td>
                <td><button className="btn btn-sm" onClick={(e) => handleDelete(noteMade)}><span><i className="fa fa-times"></i></span></button></td>
            </tr>
            
        )
    });

        return (
            <div>
                <button className="btn btn-primary form-control" onClick={() => setShow(true)} title="Click here to add a note to all events listed below ...">Add Notes</button>

                <div className="modal fade show" style={{ display: (show ? 'block' : 'none') }} role="dialog">
                    <div className="modal-dialog" style={{maxWidth: '75%'}} role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h3 className="modal-title">Add notes for the following events.</h3>
                                <button type="button" className="close" onClick={() => setShow(false)}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body" style={{maxHeight: 650, height: 650}}>
                                <div style={{width: '50%', float: 'left', padding: 10}}>
                                    <table className="table">
                                        <thead style={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}>
                                            <tr><td><input type='checkbox' checked={events.length == selectedIds.length} onChange={(e) => {
                                                var selected = $(e.target).prop('checked');

                                                if (selected) {
                                                    setSelectedIDs(events.map(a => a.EventID).sort())
                                                }
                                                else if (!selected) {
                                                    setSelectedIDs([]);
                                                }

                                            }} /></td><td>Time</td><td>Asset</td><td>Type</td></tr>
                                        </thead>
                                        <tbody style={{ display: 'block', overflowY: 'scroll', height: 580, maxHeight: 580 }}>
                                            {tableRows}
                                        </tbody>
                                    </table>
                                </div>
                                <div style={{ width: '50%', float: 'right', padding: 10 }}>
                                    <table className="table">
                                        <thead style={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}>
                                            <tr><td>Note</td><td>Time</td><td>User</td><td></td></tr>
                                        </thead>
                                        <tbody style={{ display: 'block', overflowY: 'scroll', height: 437, maxHeight: 437}}>
                                            {madeNotes}
                                        </tbody>
                                    </table>
                                    <textarea className="form-control" value={note} rows={4} onChange={(e) => setNote( (e.target as any).value )}></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-primary" onClick={() => handleAdd()} disabled={note.length == 0}>Add Note</button>
                                <button className="btn btn-secondary" onClick={() => setShow(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    

    

    function handleAdd() {
        this.addMultiNote(this.state.note, this.state.ids).done(notesMade => {
            var list = clone(this.state.notesMade);
            list.push({ Note: notesMade[0].Note, Timestamp: notesMade[0].Timestamp, UserAccount: notesMade[0].UserAccount, EventIds: notesMade.map(a => a.EventID)});
            this.setState({ note: '', notesMade: list });
        });
    }

    function handleDelete(noteMade) {
        this.deleteMultiNote(noteMade.Note, noteMade.UserAccount, noteMade.Timestamp);
        var list = clone(this.state.notesMade);
        list = list.filter(note => note != noteMade);
        this.setState({notesMade: list});
    }

    function handleEdit(d) {
        this.setState({ note: d.Note });
        this.deleteNote(d).done(() => this.createTableRows());
    }

    function addMultiNote(note: string, eventIDs: Array<number>): JQuery.jqXHR {
        return $.ajax({
            type: "POST",
            url: `${homePath}api/OpenXDA/Note/Multi`,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({ note: note, eventIDs: eventIDs }),
            cache: false,
            async: true,
            processData: false,
            error: function (jqXhr, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });
    }

    function deleteNote(note): JQuery.jqXHR {
        return $.ajax({
            type: "DELETE",
            url: `${homePath}api/OpenXDA/Note`,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(note),
            cache: false,
            async: true,
            processData: false,
            error: function (jqXhr, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });
    }

    function deleteMultiNote(Note: string, UserAccount: string, Timestamp: string): JQuery.jqXHR {
        return $.ajax({
            type: "DELETE",
            url: `${homePath}api/OpenXDA/Note`,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({ Note: Note, UserAccount: UserAccount, Timestamp: Timestamp }),
            cache: false,
            async: true,
            processData: false,
            error: function (jqXhr, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });
    }

}

export default EventSearchListedEventsNoteWindow