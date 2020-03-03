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

function EventSearchNoteWindow(props: { EventID: number }): JSX.Element {
    const [tableRows, setTableRows] = React.useState<Array<JSX.Element>>([]);
    const [note, setNote] = React.useState<string>('');
    const [count, setCount] = React.useState<number>(0);

    React.useEffect(() => {
        return createTableRows();
    }, [props.EventID]);

    function createTableRows() {
        let handle = getNotes(props.EventID);
        handle.done(data => {
            var rows = data.map(d => <tr key={d.ID}><td>{d.Note}</td><td>{moment(d.Timestamp).format("MM/DD/YYYY HH:mm")}</td><td>{d.UserAccount}</td><td>
                <button className="btn btn-sm" onClick={(e) => handleEdit(d)}><span><i className="fa fa-pencil"></i></span></button>
                <button className="btn btn-sm" onClick={(e) => handleDelete(d)}><span><i className="fa fa-times"></i></span></button>
            </td></tr>)

            setTableRows(rows);
            setCount(rows.length);
        });

        return function () {
            if (handle.abort != undefined) handle.abort();
        }
    }

    function getNotes(eventid: number): JQuery.jqXHR {
        return $.ajax({
            type: "GET",
            url: `${homePath}api/OpenXDA/GetNotes?eventId=${eventid}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: false,
            async: true
        });
    }


    function addNote(note): JQuery.jqXHR{
        return $.ajax({
            type: "POST",
            url: `${homePath}api/OpenXDA/AddNote`,
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

    function deleteNote(note): any {
        return $.ajax({
            type: "DELETE",
            url: `${homePath}api/OpenXDA/DeleteNote`,
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


    function handleAdd() {
        addNote({ ID: 0, EventID: props.EventID, Note: note }).done(e => {
            setNote('');
            createTableRows();
        });
    }

    function handleDelete(d) {
        deleteNote(d).done(() => createTableRows());
    }

    function handleEdit(d) {
        setNote(d.Note);
        deleteNote(d).done(() => createTableRows());
    }

    return (
        <div className="card">
            <div className="card-header">Notes:</div>
            <div className="card-body">
                <table className="table">
                    <thead>
                        <tr><th style={{ width: '50%' }}>Note</th><th>Time</th><th>User</th><th></th></tr>
                    </thead>
                    <tbody>
                        {tableRows}
                    </tbody>

                </table>
                <textarea className="form-control" rows={4} value={note} onChange={(e) => setNote((e.target as any).value)}></textarea>
                

            </div>
            <div className="card-footer"><button className="btn btn-primary" onClick={handleAdd} disabled={note.length == 0}>Add Note</button></div>

        </div>
    );
}

export default EventSearchNoteWindow;