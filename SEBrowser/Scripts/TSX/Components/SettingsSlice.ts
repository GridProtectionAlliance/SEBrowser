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
import { cloneDeep } from 'lodash';
import { Redux } from '../global';

declare let homePath: string;

export const LoadSettings = createAsyncThunk('Settings/LoadSettingsThunk', async () => {
    return Promise.all([loadTimeZone(), loadWidgetCategories()])
});

const defaultState = {
    timeZone: 'UTC',
    eventSearch: {
        NumberResults: 100,
        WidgetCategories: [],
        AggregateMagDur: true,
    },
    trendData: {
        BorderPlots: false,
        InsertAtStart: false,
        MarkerSnapping: false,
        StartWithOptionsClosed: false,
        LegendDisplay: 'bottom'
    },
    general: {
        MoveOptionsLeft: false,
        ShowDataPoints: true,
        DateTimeMode: 'startEnd',
        DateTimeFormat: 'MM/DD/YYYY HH:mm:ss.SSS'
    }
} as Redux.SettingsState;

const settingsSlice = createSlice({
    name: 'Settings',

    initialState: cloneDeep(defaultState) as Redux.SettingsState,

    reducers: {
        SetEventSearch: (state: Redux.SettingsState, action: { type: string, payload: Redux.IEventSearchSettings }) => {
            state.eventSearch = action.payload;
            saveSettings(state);
        },
        SetTrendData: (state: Redux.SettingsState, action: { type: string, payload: Redux.ITrendDataSettings }) => {
            state.trendData = action.payload;
            saveSettings(state);
        },
        SetGeneral: (state: Redux.SettingsState, action: { type: string, payload: Redux.IGeneralSettings }) => {
            state.general = action.payload
            saveSettings(state);
        },
    },
    extraReducers: (builder) => {

        builder.addCase(LoadSettings.fulfilled, (state, action) => {
            const preserved = readSettings();

            Object.keys(preserved).forEach(key => {
                if (preserved[key] !== undefined) state[key] = preserved[key];
                else state[key] = cloneDeep(defaultState[key]);
            });

            state.timeZone = cloneDeep(action.payload[0]);
            state.eventSearch.WidgetCategories = cloneDeep(action.payload[1]);
            return state;
        });

        builder.addCase(LoadSettings.rejected, (state) => {
            const preserved = readSettings();

            Object.keys(preserved).forEach(key => {
                if (preserved[key] !== undefined) state[key] = preserved[key];
                else state[key] = cloneDeep(defaultState[key]);
            });

            state.timeZone = 'UTC';
            return state;
        });
    }

})

function readSettings() {
    let preserved: Redux.SettingsState;
    try {
        const serializedState = localStorage.getItem('SEBrowser.Settings');
        if (serializedState === null) throw new Error("No setting state found");
        preserved = JSON.parse(serializedState);
        return preserved;
    } catch (err) {
        return cloneDeep(defaultState);
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
export const { SetEventSearch, SetTrendData, SetGeneral } = settingsSlice.actions
export const SelectEventSearchSettings = (state: Redux.StoreState) => state.Settings.eventSearch
export const SelectTrendDataSettings = (state: Redux.StoreState) => state.Settings.trendData
export const SelectGeneralSettings = (state: Redux.StoreState) => state.Settings.general
export const SelectTimeZone = (state: Redux.StoreState) => state.Settings.timeZone
export const SelectWidgetCategories = (state: Redux.StoreState) => state.Settings.eventSearch.WidgetCategories
export const SelectDateTimeSetting = (state: Redux.StoreState) => state.Settings.general.DateTimeMode
export const SelectDateTimeFormat = (state: Redux.StoreState) => state.Settings.general.DateTimeFormat