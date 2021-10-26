//******************************************************************************************************
//  EventSearchsSlice.ts - Gbtc
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
//  09/25/2020 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { SEBrowser, OpenXDA, Redux } from '../../global';
import * as _ from 'lodash';
import {  ajax } from 'jquery';
import moment from 'moment';

// #region [ Thunks ]
export const FetchEventSearches = createAsyncThunk('EventSearchs/FetchEventSearches', async (_, { dispatch, getState }) => {
    const time = (getState() as any).EventSearch.TimeRange as SEBrowser.IReportTimeFilter;
    const types = (getState() as any).EventSearch.EventType as SEBrowser.IEventTypeFilters;
    const characteristics = (getState() as any).EventSearch.EventCharacteristic as SEBrowser.IEventCharacteristicFilters;
    const meterList = (getState() as any).EventSearch.SelectedMeters as OpenXDA.Meter[];
    const assetList = (getState() as any).EventSearch.SelectedAssets as OpenXDA.Asset[];
    const locationList = (getState() as any).EventSearch.SelectedStations as OpenXDA.Location[];
    const groupList = (getState() as any).EventSearch.SelectedGroups as OpenXDA.AssetGroup[];

    const filter = {
        date: time.date, time: time.time, windowSize: time.windowSize, timeWindowUnits: time.timeWindowUnits,
        faults: types.faults, sags: types.sags, swells: types.swells, interruptions: types.interruptions, breakerOps: types.breakerOps, transients: types.transients, relayTCE: types.relayTCE, others: types.others,
        durationMin: characteristics.durationMin, durationMax: characteristics.durationMax,
        PhaseA: characteristics.Phase.A, PhaseB: characteristics.Phase.B, PhaseC: characteristics.Phase.C,
        transientMin: characteristics.transientMin, transientMax: characteristics.transientMax, transientType: characteristics.transientType,
        sagMin: characteristics.sagMin, sagMax: characteristics.sagMax, sagType: characteristics.sagType,
        swellMin: characteristics.swellMin, swellMax: characteristics.swellMax, swellType: characteristics.swellType,
        curveID: characteristics.curveID, curveInside: characteristics.curveInside, curveOutside: characteristics.curveOutside,
        meterIDs: meterList.map(item => item.ID), assetIDs: assetList.map(item => item.ID),
        groupIDs: groupList.map(item => item.ID), locationIDs: locationList.map(item => item.ID)
    }
    return await GetEventSearchs(filter);
});

// #endregion

// #region [ Slice ]
export const EventSearchsSlice = createSlice({
    name: 'EventSearch',
    initialState: {
        Status: 'unitiated',
        Data: [],
        Error: null,
        SortField: 'FileStartTime',
        Ascending: true,
        SearchText: '',
        EventCharacteristic: {
            durationMax: 0, durationMin: 0, Phase: { A: true, B: true, C: true }, transientMin: 0, transientMax: 0, sagMin: 0, sagMax: 0, swellMin: 0, swellMax: 0, sagType: 'both', swellType: 'both', transientType: 'both',
            curveID: 1, curveInside: true, curveOutside: true
        },
        TimeRange: { date: '01/01/2000', time: '12:00:00.000', windowSize: 1, timeWindowUnits: 2 },
        EventType: { breakerOps: true, faults: true, interruptions: true, others: true, relayTCE: true, swells: true, sags: true, transients: true },
        isReset: true,
        SelectedAssets: [],
        SelectedGroups: [],
        SelectedMeters: [],
        SelectedStations: []
    } as Redux.EventSearchState,
    reducers: {
        Sort: (state, action) => {
            if (state.SortField === action.payload.SortField)
                state.Ascending = !action.payload.Ascending;
            else
                state.SortField = action.payload.SortField;

            const sorted = _.orderBy(state.Data, [state.SortField], [state.Ascending ? "asc" : "desc"])
            state.Data = sorted;
        },
        SetSearchText: (state, action) => {
            state.SearchText = action.payload;
        },
        SetFilters: (state, action: PayloadAction<{ characteristics: SEBrowser.IEventCharacteristicFilters, types: SEBrowser.IEventTypeFilters, time: SEBrowser.IReportTimeFilter }>) => {
            state.Status = 'changed';
            state.TimeRange = action.payload.time;
            state.EventType = action.payload.types;
            state.EventCharacteristic = action.payload.characteristics;
            state.isReset = computeReset(state);
        },
        ResetFilters: (state, action: PayloadAction<void>) => {
            state.EventCharacteristic = {
                durationMax: 0, durationMin: 0, Phase: { A: true, B: true, C: true }, transientMin: 0, transientMax: 0, sagMin: 0, sagMax: 0, swellMin: 0, swellMax: 0, sagType: 'both', swellType: 'both', transientType: 'both',
                    curveID: 1, curveInside: true, curveOutside: true
            };

            state.EventType = { breakerOps: true, faults: true, interruptions: true, others: true, relayTCE: true, swells: true, sags: true, transients: true };
            state.SelectedStations = [];
            state.SelectedMeters = [];
            state.SelectedGroups = [];
            state.SelectedAssets = [];
            state.isReset = true;
            state.Status = 'changed';
        },
        SetFilterLists: (state, action: PayloadAction<{ Meters: OpenXDA.Meter[], Assets: OpenXDA.Asset[], Groups: OpenXDA.AssetGroup[], Stations: OpenXDA.Location[] }>) => {
            state.SelectedStations = action.payload.Stations;
            state.SelectedMeters = action.payload.Meters;
            state.SelectedGroups = action.payload.Groups;
            state.SelectedAssets = action.payload.Assets;

            state.isReset = computeReset(state);
            state.Status = 'changed';
        }
    },
    extraReducers: (builder) => {

        builder.addCase(FetchEventSearches.fulfilled, (state, action) => {
            state.Status = 'idle';
            state.Error = null;
            if (action.payload.length > 100) alert("The query you submitted was too large (" + action.payload.length.toString() + " records) and only the first 100 records were return.  Please refine your search if necessary.")
            const sorted = _.orderBy(action.payload, [state.SortField], [state.Ascending ? "asc" : "desc"])
            state.Data = sorted.slice(0,100);

        });
        builder.addCase(FetchEventSearches.pending, (state, action) => {
            state.Status = 'loading';
        });
        builder.addCase(FetchEventSearches.rejected, (state, action) => {
            state.Status = 'error';
            state.Error = action.error.message;

        });
    }

});
// #endregion

// #region [ Selectors ]
export const { Sort, SetFilters, ResetFilters, SetFilterLists } = EventSearchsSlice.actions;
export default EventSearchsSlice.reducer;
export const SelectEventSearchs = (state: Redux.StoreState) => state.EventSearch.Data;
export const SelectEventSearchByID = (state: Redux.StoreState, id: number) => state.EventSearch.Data.find(ds => ds.EventID === id);
export const SelectEventSearchsStatus = (state: Redux.StoreState) => state.EventSearch.Status;
export const SelectEventSearchsSortField = (state: Redux.StoreState) => state.EventSearch.SortField;
export const SelectEventSearchsAscending = (state: Redux.StoreState) => state.EventSearch.Ascending;
export const SelectEventSearchBySearchText = (state: Redux.StoreState, searchText: string) => state.EventSearch.Data.filter((d, i) => {
    if (searchText === '') return true
    else
    return d.AssetName.toLowerCase().indexOf(searchText) >= 0 ||
        d.AssetType.toLowerCase().indexOf(searchText) >= 0 ||
        d.EventType.toLowerCase().indexOf(searchText) >= 0 ||
        moment(d.FileStartTime).format('MM/DD/YYYY').toLowerCase().indexOf(searchText) >= 0 ||
        moment(d.FileStartTime).format('HH:mm:ss.SSSSSSS').toLowerCase().indexOf(searchText) >= 0 ||
        d.VoltageClass.toString().toLowerCase().indexOf(searchText) >= 0

});
export const SelectTimeFilter = (state: Redux.StoreState) => state.EventSearch.TimeRange;
export const SelectTypeFilter = (state: Redux.StoreState) => state.EventSearch.EventType;
export const SelectCharacteristicFilter = (state: Redux.StoreState) => state.EventSearch.EventCharacteristic;
export const SelectReset = (state: Redux.StoreState) => state.EventSearch.isReset;
export const SelectMeterList = (state: Redux.StoreState) => state.EventSearch.SelectedMeters;
export const SelectAssetList = (state: Redux.StoreState) => state.EventSearch.SelectedAssets;
export const SelectAssetGroupList = (state: Redux.StoreState) => state.EventSearch.SelectedGroups;
export const SelectStationList = (state: Redux.StoreState) => state.EventSearch.SelectedStations;

// #endregion

// #region [ Async Functions ]
function GetEventSearchs(params): JQuery.jqXHR<OpenXDA.Event[]> {
    return ajax({
        type: "POST",
        url: `${homePath}api/OpenXDA/GetEventSearchData`,
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(params),
        dataType: 'json',
        cache: true,
        async: true
    });
}

function computeReset(state: Redux.EventSearchState): boolean {
    const event = state.EventCharacteristic.durationMax == 0 && state.EventCharacteristic.durationMin == 0 &&
        state.EventCharacteristic.transientMin == 0 && state.EventCharacteristic.transientMax == 0 &&
        state.EventCharacteristic.sagMin == 0 && state.EventCharacteristic.sagMax == 0 &&
        state.EventCharacteristic.swellMin == 0 && state.EventCharacteristic.swellMax == 0 &&
        state.EventCharacteristic.Phase.A && state.EventCharacteristic.Phase.A && state.EventCharacteristic.Phase.A &&
        state.EventCharacteristic.curveInside && state.EventCharacteristic.curveOutside;

    const types = state.EventType.breakerOps && state.EventType.faults && state.EventType.interruptions && state.EventType.others
        && state.EventType.relayTCE && state.EventType.swells && state.EventType.sags && state.EventType.transients;

    return event && types && state.SelectedAssets.length == 0 && state.SelectedStations.length == 0 && state.SelectedMeters.length == 0 && state.SelectedGroups.length == 0;
}
// #endregion
