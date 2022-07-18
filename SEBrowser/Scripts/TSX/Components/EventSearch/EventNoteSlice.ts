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



export default class NoteSlice {
    Name: string = "";
    APIPath: string = "";
    Slice: (Slice<Redux.NoteState>);
    Fetch: (AsyncThunk<any, void | number[], {}>);
    DBAction: (AsyncThunk<any, { verb: 'POST' | 'DELETE' | 'PATCH', record: SEBrowser.EventNote }, {}>);
    Sort: ActionCreatorWithPayload<{ SortField: keyof SEBrowser.EventNote, Ascending: boolean }, string>;
    Reducer: any;
    SetSelectedEvents: ActionCreatorWithPayload<number[], string>;


    constructor() {
        this.Name = 'EventNote';
        this.APIPath = `${homePath}api/OpenXDA/Note`;

        const fetch = createAsyncThunk(`${this.Name} / Fetch${this.Name}`, async (eventIDs: number[], { getState }) => {
            const sortfield = ((getState() as any)[this.Name]).SortField
            const asc = ((getState() as any)[this.Name]).Ascending
            const handle = this.GetNotes(eventIDs, sortfield, asc);
            return await handle;
        });

        const dBAction = createAsyncThunk(`${this.Name}/DBAction${this.Name}`, async (args: { verb: 'POST' | 'DELETE' | 'PATCH', record: SEBrowser.EventNote }, {}) => {

            const handle = args.record.IDs.map((id, i) => this.Action(args.verb, { ...args.record, ReferenceTableID: args.record.EventIDs[i], ID: id }));

            return await Promise.all(handle)
        });

        const slice = createSlice({
            name: this.Name,
            initialState: {
                Status: 'unintiated',
                Data: [] as SEBrowser.EventNote[],
                SortField: 'Timestamp',
                Ascending: false,
                ParentID: [],
            } as Redux.NoteState,
            reducers: {
                Sort: (state: any, action: PayloadAction<{ SortField: keyof SEBrowser.EventNote, Ascending: boolean }>) => {
                    if (state.SortField === action.payload.SortField)
                        state.Ascending = !action.payload.Ascending;
                    else
                        state.SortField = action.payload.SortField as Draft<keyof SEBrowser.EventNote>;

                    if (state.SortField == 'EventIDs' || state.SortField == 'IDs')
                        return
                    else
                    state.Data = _.orderBy(state.Data, [state.SortField], [state.Ascending ? "asc" : "desc"])
                },
                SetSelectedEvents: (state: any, action: PayloadAction<number[]>) => {
                    state.ParentID = action.payload;
                    state.Status = 'changed';
                },
            },
            extraReducers: (builder) => {

                builder.addCase(fetch.fulfilled, (state, action) => {
                    state.Status = 'idle';
                    const d = _.groupBy(JSON.parse(action.payload) as OpenXDA.Types.Note[], (n) => n.Note + "|" + n.Timestamp + "|" + n.UserAccount);
                    state.Data = Object.keys(d).map(item => ({ ...d[item][0], EventIDs: d[item].map(o => o.ReferenceTableID), IDs: d[item].map(o => o.ID), NumEvents: d[item].length }));
                    state.Data = _.orderBy(state.Data, [state.SortField], [state.Ascending ? "asc" : "desc"]);
                });
                builder.addCase(fetch.pending, (state, action) => {
                    state.ParentID = (action.meta.arg == null ? [] : action.meta.arg as number[]);
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
        const { Sort, SetSelectedEvents } = slice.actions
        this.Sort = Sort;
        this.SetSelectedEvents = SetSelectedEvents;
        this.Reducer = slice.reducer;
    }

    private GetNotes(parentID: number[], sortField: keyof OpenXDA.Types.Note, Ascending: boolean): JQuery.jqXHR<string> {

        const filter = [
            { FieldName: 'NoteTypeID', SearchText: "(SELECT ID FROM NoteType WHERE ReferenceTableName = 'Event')", Operator: '=', Type: 'integer', isPivotColumn: false },
            { FieldName: 'ReferenceTableID', SearchText: '(' + (parentID.length > 0? parentID.join(',') : "-1") + ')', Operator: 'IN', Type: 'integer', isPivotColumn: false },
            { FieldName: 'NoteApplicationID', SearchText: "(SELECT ID From NoteApplication WHERE Name = 'SEbrowser')", Operator: '=', Type: 'integer', isPivotColumn: false },
            { FieldName: 'NoteTagID', SearchText: "(SELECT ID From NoteTag WHERE Name = 'General')", Operator: '=', Type: 'integer', isPivotColumn: false }
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

    public Data = (state: any) => state[this.Name].Data as SEBrowser.EventNote[];
    public Status = (state: any) => state[this.Name].Status as Application.Types.Status;
    public SortField = (state: any) => state[this.Name].SortField as keyof OpenXDA.Types.Note;
    public Ascending = (state: any) => state[this.Name].Ascending as boolean;
    public EventIDs = (state: any) => state[this.Name].ParentID as number[];
}