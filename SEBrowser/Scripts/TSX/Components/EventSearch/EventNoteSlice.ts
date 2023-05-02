//******************************************************************************************************
//  EventNoteSlice.tsx - Gbtc
//
//  Copyright © 2021, Grid Protection Alliance.  All Rights Reserved.
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
//  11/15/2021 - C Lackner
//       Generated original version of source code.
//
//******************************************************************************************************
import { Application, OpenXDA } from '@gpa-gemstone/application-typings'
import { ActionCreatorWithPayload, AsyncThunk, createAsyncThunk, createSlice, Draft, PayloadAction, Slice } from '@reduxjs/toolkit';
import _ from 'lodash';
import { Redux, SEBrowser } from '../../global';

declare var homePath: string;


export type NoteType = 'Event' | 'Asset' | 'Meter' | 'Location' | 'Customer' 



export default class NoteSlice {
    Name: string = "";
    APIPath: string = "";
    NoteType: NoteType;
    Slice: (Slice<Redux.NoteState>);
    Fetch: (AsyncThunk<any, void | number, {}>);
    DBAction: (AsyncThunk<any, { verb: 'POST' | 'DELETE' | 'PATCH', record: OpenXDA.Types.Note }, {}>);
    Sort: ActionCreatorWithPayload<{ SortField: keyof OpenXDA.Types.Note, Ascending: boolean }, string>;
    Reducer: any;
    SetSelectedEvents: ActionCreatorWithPayload<number[], string>;


    constructor(name: NoteType) {
        this.NoteType = name;
        this.Name = name + 'Note';
        this.APIPath = `${homePath}api/OpenXDA/Note`;

        const fetch = createAsyncThunk(`${this.Name} / Fetch${this.Name}`, async (parentID: number, { getState }) => {
            const sortfield = ((getState() as any)[this.Name]).SortField
            const asc = ((getState() as any)[this.Name]).Ascending
            const handle = this.GetNotes(parentID, sortfield, asc);
            return await handle;
        });

        const dBAction = createAsyncThunk(`${this.Name}/DBAction${this.Name}`, async (args: { verb: 'POST' | 'DELETE' | 'PATCH', record: OpenXDA.Types.Note }, { }) => {
            const handle = this.Action(args.verb, args.record);
            return await handle
        });

        const slice = createSlice({
            name: this.Name,
            initialState: {
                Status: 'unintiated',
                SearchStatus: 'unintiated',
                Error: null,
                Data: [] as OpenXDA.Types.Note[],
                SortField: 'Timestamp',
                Ascending: false,
                ParentID: null,
                SearchResults: [],
                Filter: []
            } as Redux.NoteState,
            reducers: {
                Sort: (state: any, action: PayloadAction<{ SortField: keyof OpenXDA.Types.Note, Ascending: boolean }>) => {
                    if (state.SortField === action.payload.SortField)
                        state.Ascending = !action.payload.Ascending;
                    else
                        state.SortField = action.payload.SortField as Draft<keyof OpenXDA.Types.Note>;

                    state.Data = _.orderBy(state.Data, [state.SortField], [state.Ascending ? "asc" : "desc"])
                }
            },
            extraReducers: (builder) => {

                builder.addCase(fetch.fulfilled, (state, action) => {
                    state.Status = 'idle';
                    const d = _.groupBy(JSON.parse(action.payload) as OpenXDA.Types.Note[], (n) => n.Note + "|" + n.Timestamp + "|" + n.UserAccount);
                    state.Data = Object.keys(d).map(item => ({ ...d[item][0], EventIDs: d[item].map(o => o.ReferenceTableID), IDs: d[item].map(o => o.ID), NumEvents: d[item].length }));
                    state.Data = _.orderBy(state.Data, [state.SortField], [state.Ascending ? "asc" : "desc"]);
                });
                builder.addCase(fetch.pending, (state, action) => {
                    state.ParentID = (action.meta.arg == null ? 0 : action.meta.arg as number);
                    state.Status = 'loading';
                });

                builder.addCase(fetch.rejected, (state, action) => {
                    state.Status = 'error';
                });

                builder.addCase(dBAction.pending, (state) => {
                    state.Status = 'loading';
                });
                builder.addCase(dBAction.rejected, (state, action) => {
                    state.Status = 'error';
                });
                builder.addCase(dBAction.fulfilled, (state) => {
                    state.Status = 'changed';
                });
            }

        });

        this.Fetch = fetch;
        this.DBAction = dBAction;
        this.Slice = slice;
        const { Sort } = slice.actions
        this.Sort = Sort;
        this.Reducer = slice.reducer;
    }

    private GetNotes(parentID: number | void, sortField: keyof OpenXDA.Types.Note, Ascending: boolean): JQuery.jqXHR<string> {

        const filter = [
            { FieldName: 'NoteTypeID', SearchText: "(SELECT ID FROM NoteType WHERE ReferenceTableName = '" + this.NoteType + "')", Operator: '=', Type: 'integer', isPivotColumn: false },
            { FieldName: 'ReferenceTableID', SearchText: parentID, Operator: '=', Type: 'integer', isPivotColumn: false },
            { FieldName: 'NoteApplicationID', SearchText: "(SELECT ID From NoteApplication WHERE Name = 'SystemCenter')", Operator: '=', Type: 'integer', isPivotColumn: false },
            { FieldName: 'NoteTagID', SearchText: "(SELECT ID From NoteTag WHERE Name = 'Configuration')", Operator: '=', Type: 'integer', isPivotColumn: false }
        ]

        return $.ajax({
            type: "POST",
            url: `${homePath}api/OpenXDA/Note/SearchableList`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            data: JSON.stringify({ Searches: filter, OrderBy: sortField, Ascending: Ascending }),
            cache: false,
            async: true
        })

    }

    private Action(verb: 'POST' | 'DELETE' | 'PATCH', record: OpenXDA.Types.Note): JQuery.jqXHR<OpenXDA.Types.Note> {
        let action = '';
        if (verb === 'POST') action = 'Add';
        else if (verb === 'DELETE') action = 'Delete';
        else if (verb === 'PATCH') action = 'Update';

        return $.ajax({
            type: verb,
            url: `${this.APIPath}/${action}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            data: JSON.stringify({ ...record }),
            cache: false,
            async: true
        });
    }

    public Data = (state: any) => state[this.Name].Data as OpenXDA.Types.Note[];
    public Status = (state: any) => state[this.Name].Status as Application.Types.Status;
    public SortField = (state: any) => state[this.Name].SortField as keyof OpenXDA.Types.Note;
    public Ascending = (state: any) => state[this.Name].Ascending as boolean;
    public EventIDs = (state: any) => state[this.Name].ParentID as number[];
}