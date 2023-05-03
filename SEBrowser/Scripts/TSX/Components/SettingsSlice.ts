//******************************************************************************************************
//  SettingsSlice.tsx - Gbtc
//
//  Copyright © 2023, Grid Protection Alliance.  All Rights Reserved.
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
//  12/08/2022 - Harrison Stropkay
//       Generated original version of source code.
//  01/17/2023 - C Lackner
//       Cleaned up Settings code.
//
//******************************************************************************************************
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Redux } from '../global';

declare var homePath: string;

export const LoadSettings = createAsyncThunk('Settings/LoadSettingsThunk', async () => {
    return Promise.all([loadTimeZone(), loadWidgetCategories()])
});


const settingsSlice = createSlice({
    name: 'Settings',

    initialState: {
        eventSearch: {
            NumberResults: 100,
            WidgetCategories: [],
            AggregateMagDur: true,
        },
        timeZone: 'UTC',
    } as Redux.SettingsState,

    reducers: {
        SetEventSearch: (state: Redux.SettingsState, action: { type: string, payload: Redux.IEventSearchSettings }) => {
            state.eventSearch = action.payload;
            saveSettings(state);
        },
    },
    extraReducers: (builder) => {

        builder.addCase(LoadSettings.fulfilled, (state, action) => {
            let preserved = readSettings();

            if (preserved != undefined) {
                state.eventSearch = preserved.eventSearch;
            }
            else
                state.eventSearch = { NumberResults: 100, WidgetCategories: [], AggregateMagDur: true };

            state.timeZone = action.payload[0];
            state.eventSearch.WidgetCategories = action.payload[1];
        });    
        
        builder.addCase(LoadSettings.rejected, (state, action) => {
            let preserved = readSettings();

            if (preserved != undefined) {
                state.eventSearch = preserved.eventSearch;
            }
            else
                state.eventSearch = { NumberResults: 100, WidgetCategories: [], AggregateMagDur: true };
            state.timeZone = 'UTC';
        });
    }
    
})

function readSettings() {
    try {
        const serializedState = localStorage.getItem('SEBrowser.Settings');
        if (serializedState === null) {
            return undefined;
        }
        let state: Redux.SettingsState = JSON.parse(serializedState);
        return state;
    } catch (err) {
        return undefined;
    }
}

function saveSettings(state: Redux.SettingsState) {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem('SEBrowser.Settings', serializedState);
    } catch {
        // ignore write errors
    }
}

function loadTimeZone() {
    return $.ajax({
        type: "GET",
        url: `${homePath}api/SEBrowser/GetTimeZone`,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        async: true
    });

}

function loadWidgetCategories() {
    return $.ajax({
        type: "GET",
        url: `${homePath}api/openXDA/WidgetCategory`,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        async: true
    });
}


export const SettingsReducer = settingsSlice.reducer
export const { SetEventSearch } = settingsSlice.actions
export const SelectEventSearchSettings = (state: Redux.StoreState) => state.Settings.eventSearch
export const SelectTimeZone = (state: Redux.StoreState) => state.Settings.timeZone
export const SelectWidgetCategories = (state: Redux.StoreState) => state.Settings.eventSearch.WidgetCategories