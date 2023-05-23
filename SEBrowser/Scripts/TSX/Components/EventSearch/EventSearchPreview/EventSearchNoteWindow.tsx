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
import moment from 'moment';
import { SEBrowser } from '../../../global';
import { AssetNoteSlice, EventNoteSlice, LocationNoteSlice, MeterNoteSlice } from '../../../Store';
import { OpenXDA } from '@gpa-gemstone/application-typings';
import { Note } from '@gpa-gemstone/common-pages';
import { MultiCheckBoxSelect, Select } from '@gpa-gemstone/react-forms';

interface ISetting {
    NoteTypes: string[],
    NoteTags: string[]
}

interface IValue<T> { Value: T }

const NoteWidget: React.FC<SEBrowser.IWidget<ISetting>> = (props) => {
    const [noteType, setNoteType] = React.useState<OpenXDA.Types.NoteType>({ ID: -1, Name: 'Event', ReferenceTableName: 'Event' });
    const [selectedTags, setSelectedTags] = React.useState<number[]>([]);
    const [noteApp, setNoteApp] = React.useState<OpenXDA.Types.NoteApplication>({ ID: -1, Name: 'SEbrowser' });

    const [noteTypes, setNoteTypes] = React.useState<OpenXDA.Types.NoteType[]>([]);
    const [noteTags, setNoteTags] = React.useState<OpenXDA.Types.NoteTag[]>([]);

    const [ids, setIDs] = React.useState<{ EventID: number, MeterID: number, AssetID: number, LocationID: number }>({ EventID: props.eventID, MeterID: -1, AssetID: -1, LocationID: -1 });

   
    React.useEffect(() => {
        let idHandle = getIDs();
        return () => { if (idHandle != null && idHandle.abort != null) idHandle.abort(); }
    }, [props.eventID])

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

    React.useEffect(() => {
        if (noteType == null && noteTypes.length > 0)
            setNoteType(noteTypes[0]);
    }, [noteTypes, noteType])
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

            if (props.setting == null || props.setting.NoteTypes.length == 0)
                setNoteTypes(d);
            else
                setNoteTypes(props.setting.NoteTypes.map((t) => d.find((d) => d.Name.toLocaleLowerCase() == t.toLocaleLowerCase())));
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
            if (props.setting == null || props.setting.NoteTags.length == 0)
                setNoteTags(d);
            else
                setNoteTags(props.setting.NoteTags.map((t) => d.find((d) => d.Name.toLocaleLowerCase() == t.toLocaleLowerCase())));
        });

        return handle;
    }

    function getIDs(): JQuery.jqXHR {
        let handle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenXDA/GetEventInformation/${props.eventID}`,
            cache: true,
            async: true,
        }).done((d) => {
            setIDs({
                AssetID: d['Asset'],
                EventID: props.eventID,
                LocationID: d['Location'],
                MeterID: d['Meter']
            })
        })

        return handle;
    }

    let slice;
    if (ids == null || noteType == null)
        return null;
    if (noteType.Name == 'Event')
        slice = EventNoteSlice;
    else if (noteType.Name == 'Meter')
        slice = MeterNoteSlice;
    else if (noteType.Name == 'Asset')
        slice = AssetNoteSlice;
    else if (noteType.Name == 'Location')
        slice = LocationNoteSlice;
    else
        return null;
    let id;
    if (noteType.Name == 'Event')
        id = props.eventID;
    else if (noteType.Name == 'Meter')
        id = ids.MeterID;
    else if (noteType.Name == 'Asset')
        id = ids.AssetID;
    else if (noteType.Name == 'Location')
        id = ids.LocationID;

    return (
        <div className='card'>
            <div className='card-header'>Notes</div>
            <div className='row'>
                <div className='col'>
                    <MultiCheckBoxSelect Label={'Categories'}
                        Options={noteTags.map(t => ({ Selected: selectedTags.find(i => i == t.ID) != null, Text: t.Name, Value: t.ID }))}
                        OnChange={(evt, options) => { setSelectedTags(options.map(t => t.Value)); }}
                    />
                    <Select<OpenXDA.Types.NoteType>
                        Record={noteType}
                        Label={'Type'}
                        Options={noteTypes.map(t => ({ Label: t.Name, Value: t.ID.toString() }))}
                        Setter={(r) => setNoteType(noteTypes.find((t) => t.ID == r.ID))}
                        Field={'ID'} />
                </div>
            </div>
            <Note
                MaxHeight={window.innerHeight - 215}
                ReferenceTableID={id}
                NoteApplications={[noteApp]}
                NoteTags={noteTags.filter((t) => selectedTags.find(i => i == t.ID) != null)}
                NoteTypes={[noteType]}
                NoteSlice={slice}
                AllowAdd={true}
                Title={''}
                AllowEdit={true}
                AllowRemove={false}
                ShowCard={false}
            />
        </div>
    );

}

export default NoteWidget;