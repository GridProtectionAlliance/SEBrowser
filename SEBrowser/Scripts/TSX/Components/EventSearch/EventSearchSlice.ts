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

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { SEBrowser, OpenXDA, Redux } from '../../global';
import * as _ from 'lodash';
import {  ajax } from 'jquery';
import moment from 'moment';

// #region [ Thunks ]
export const FetchEventSearches = createAsyncThunk('EventSearchs/FetchEventSearches', (params: object, { dispatch }) => {
    return  GetEventSearchs(params);
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
        SearchText: ''
    } as Redux.State<OpenXDA.Event>,
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
export const { Sort } = EventSearchsSlice.actions;
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


// #endregion
