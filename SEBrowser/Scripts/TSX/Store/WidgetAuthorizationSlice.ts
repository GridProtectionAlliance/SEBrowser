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

const getDefaultAuthorization = (): EventWidget.IWidgetAuthorization => ({
    Notes: {
        Create: false,
        Update: false,
        Delete: false
    },
    EventInfo: {
        Create: false,
        Update: false,
        Delete: false
    }
});

export const FetchWidgetAuthorization = createAsyncThunk('WidgetAuthorization/FetchThunk', async () => {
    return loadWidgetAuthorization();
});

const widgetAuthorizationSlice = createSlice({
    name: 'WidgetAuthorization',
    initialState: {
        WidgetAuthorization: getDefaultAuthorization(),
        Status: 'uninitiated'
    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(FetchWidgetAuthorization.pending, (state) => {
            state.Status = 'loading';
        });
        builder.addCase(FetchWidgetAuthorization.rejected, (state) => {
            state.WidgetAuthorization = getDefaultAuthorization();
            state.Status = 'error';
        });
        builder.addCase(FetchWidgetAuthorization.fulfilled, (state, action) => {
            state.WidgetAuthorization = action.payload;
            state.Status = 'idle';
        });
    }
});

const loadWidgetAuthorization = async (): Promise<EventWidget.IWidgetAuthorization> => {
    const authorization = getDefaultAuthorization();

    for (const [widget, requirements] of Object.entries(WidgetRequirements)) {
        const resources = requirements.flatMap((requirement) => requirement.RequiredResources);
        const access: boolean[] = await $.ajax({
            type: 'POST',
            url: `${homePath}api/authorization/access`,
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: JSON.stringify(resources),
            cache: false,
            async: true
        });

        const resultMap: Record<string, boolean> = {};

        requirements.forEach((requirement, index, widgetRequirements) => {
            const start = widgetRequirements
                .slice(0, index)
                .reduce((count, current) => count + current.RequiredResources.length, 0);

            resultMap[requirement.Label] = access
                .slice(start, start + requirement.RequiredResources.length)
                .every((granted) => granted);
        });

        Object.assign(authorization[widget as keyof EventWidget.IWidgetAuthorization], resultMap);
    }

    return authorization;
};

export const WidgetAuthorizationReducer = widgetAuthorizationSlice.reducer;
export const SelectWidgetAuthorization = (state: RootState) => state.WidgetAuthorization.WidgetAuthorization;
export const SelectNoteAuthorization = (state: RootState) => state.WidgetAuthorization.WidgetAuthorization.Notes;
export const SelectWidgetAuthorizationStatus = (state: RootState) => state.WidgetAuthorization.Status;
