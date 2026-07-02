//******************************************************************************************************
//  WidgetAuthorizationSlice.ts - Gbtc
//
//  Copyright © 2026, Grid Protection Alliance.  All Rights Reserved.
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
//  07/02/2026 - Preston Crawford
//       Generated original version of source code.
//
//******************************************************************************************************
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { EventWidget } from '../../../EventWidgets/TSX/global';
import { WidgetRequirements } from './WidgetRequirements';
import type { RootState } from './Store';

declare let homePath: string;

const defaultAuthorization: EventWidget.IWidgetAuthorization = {
    Notes: {
        CanAdd: false,
        CanEdit: false,
        CanModify: false
    }
};

export const FetchWidgetAuthorization = createAsyncThunk('WidgetAuthorization/FetchThunk', async () => {
    const resources = [...WidgetRequirements.Notes.Add, ...WidgetRequirements.Notes.Edit];

    const access: boolean[] = await $.ajax({
        type: 'POST',
        url: `${homePath}api/authorization/access`,
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify(resources),
        cache: false,
        async: true
    });

    const canAdd = access.slice(0, WidgetRequirements.Notes.Add.length).every((granted) => granted);
    const canEdit = access.slice(WidgetRequirements.Notes.Add.length).every((granted) => granted);

    return {
        Notes: {
            CanAdd: canAdd,
            CanEdit: canEdit,
            CanModify: canAdd && canEdit
        }
    };
});

const widgetAuthorizationSlice = createSlice({
    name: 'WidgetAuthorization',
    initialState: {
        WidgetAuthorization: defaultAuthorization,
        Status: 'uninitiated'
    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(FetchWidgetAuthorization.pending, (state) => {
            state.Status = 'loading';
        });
        builder.addCase(FetchWidgetAuthorization.rejected, (state) => {
            state.WidgetAuthorization = defaultAuthorization;
            state.Status = 'error';
        });
        builder.addCase(FetchWidgetAuthorization.fulfilled, (state, action) => {
            state.WidgetAuthorization = action.payload;
            state.Status = 'idle';
        });
    }
});

export const WidgetAuthorizationReducer = widgetAuthorizationSlice.reducer;
export const SelectWidgetAuthorization = (state: RootState) => state.WidgetAuthorization.WidgetAuthorization;
export const SelectNoteAuthorization = (state: RootState) => state.WidgetAuthorization.WidgetAuthorization.Notes;
export const SelectWidgetAuthorizationStatus = (state: RootState) => state.WidgetAuthorization.Status;