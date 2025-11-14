//******************************************************************************************************
//  ValueListGroupSlice.ts - Gbtc
//
//  Copyright © 2020, Grid Protection Alliance.  All Rights Reserved.
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
//  08/08/2025 - Gabriel Santos
//       Generated original version of source code.
//
//******************************************************************************************************

import { Application, SystemCenter } from '@gpa-gemstone/application-typings';
import { AsyncThunk, createAsyncThunk, createSlice, Draft, PayloadAction, SerializedError, Slice } from '@reduxjs/toolkit';
import { WritableDraft } from 'immer/dist/types/types-external';
import { Redux } from '../global';
import { RootState } from './Store';

export default class ValueListGroupSlice {
    public APIPath = "api/ValueList";
    public Name = "ValueList";

    public Slice: Slice<Redux.IValueListSliceState>;
    public Reducer: any;

    public Fetch: (AsyncThunk<SystemCenter.Types.ValueListItem[], string, any>);
    private fetchHandles: {
        [group: string]: JQuery.jqXHR<SystemCenter.Types.ValueListItem[]> | null;
    }

    constructor() {
        this.fetchHandles = {};
        this.Fetch = createAsyncThunk(`${this.Name}/Fetch`, async (groupName: string, { signal }) => {
            if (this.fetchHandles?.[groupName]?.abort != null)
                this.fetchHandles[groupName].abort('New Intiated');

            const handle: JQuery.jqXHR<SystemCenter.Types.ValueListItem[]> = $.ajax({
                type: "GET",
                url: `${homePath}api/ValueList/Group/${groupName}`,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });
            this.fetchHandles[groupName] = handle;

            signal.addEventListener('abort', () => {
                if (handle.abort !== undefined) handle.abort();
            });

            return await handle;
        });
        this.Slice = createSlice({
            name: this.Name,
            initialState: {
                Status: {},
                Error: null,
                Data: {},
                ActiveFetchID: {}
            } as Redux.IValueListSliceState,
            reducers: {},
            extraReducers: (builder) => {
                builder.addCase(this.Fetch.fulfilled, (state: WritableDraft<Redux.IValueListSliceState>, action: PayloadAction<SystemCenter.Types.ValueListItem[], string, { requestId: string, arg: string }, never>) => {
                    if (state.ActiveFetchID?.[action.meta.arg] != null)
                        state.ActiveFetchID[action.meta.arg] = state.ActiveFetchID[action.meta.arg].filter(id => id !== action.meta.requestId);
                    state.Status[action.meta.arg] = 'idle';
                    state.Error = null;
                    state.Data[action.meta.arg] = action.payload as Draft<SystemCenter.Types.ValueListItem[]>;
                });
                builder.addCase(this.Fetch.pending, (state: WritableDraft<Redux.IValueListSliceState>, action: PayloadAction<undefined, string, { arg: string, requestId: string }, never>) => {
                    if (state.ActiveFetchID?.[action.meta.arg] != null)
                        state.ActiveFetchID[action.meta.arg].push(action.meta.requestId);
                    else
                        state.ActiveFetchID[action.meta.arg] = [action.meta.requestId];
                    state.Status[action.meta.arg] = 'loading';
                });
                builder.addCase(this.Fetch.rejected, (state: WritableDraft<Redux.IValueListSliceState>, action: PayloadAction<unknown, string, { arg: string, requestId: string }, SerializedError>) => {
                    if (state.ActiveFetchID?.[action.meta.arg] != null)
                        state.ActiveFetchID[action.meta.arg] = state.ActiveFetchID[action.meta.arg].filter(id => id !== action.meta.requestId);
                    else
                        state.ActiveFetchID[action.meta.arg] = [];

                    if (state.ActiveFetchID[action.meta.arg].length > 0)
                        return;

                    state.Status[action.meta.arg] = 'error';
                    state.Error = (action.error.message == null ? '' : action.error.message);
                });
            }

        });
        this.Reducer = this.Slice.reducer;
    }

    public Status = (state: RootState, group: string) => (state[this.Name].Status?.[group] ?? 'uninitiated') as Application.Types.Status;
    public Data = (state: RootState, group: string) => (state[this.Name].Data?.[group] ?? []) as SystemCenter.Types.ValueListItem[];
}