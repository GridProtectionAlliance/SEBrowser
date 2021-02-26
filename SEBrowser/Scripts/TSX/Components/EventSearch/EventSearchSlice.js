"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectEventSearchBySearchText = exports.SelectEventSearchsAscending = exports.SelectEventSearchsSortField = exports.SelectEventSearchsStatus = exports.SelectEventSearchByID = exports.SelectEventSearchs = exports.Sort = exports.EventSearchsSlice = exports.FetchEventSearches = void 0;
var toolkit_1 = require("@reduxjs/toolkit");
var _ = require("lodash");
var jquery_1 = require("jquery");
// #region [ Thunks ]
exports.FetchEventSearches = toolkit_1.createAsyncThunk('EventSearchs/FetchEventSearches', function (params, _a) {
    var dispatch = _a.dispatch;
    return GetEventSearchs(params);
});
// #endregion
// #region [ Slice ]
exports.EventSearchsSlice = toolkit_1.createSlice({
    name: 'EventSearch',
    initialState: {
        Status: 'unitiated',
        Data: [],
        Error: null,
        SortField: 'FileStartTime',
        Ascending: true,
        SearchText: ''
    },
    reducers: {
        Sort: function (state, action) {
            if (state.SortField === action.payload.SortField)
                state.Ascending = !action.payload.Ascending;
            else
                state.SortField = action.payload.SortField;
            var sorted = _.orderBy(state.Data, [state.SortField], [state.Ascending ? "asc" : "desc"]);
            state.Data = sorted;
        },
        SetSearchText: function (state, action) {
            state.SearchText = action.payload;
        }
    },
    extraReducers: function (builder) {
        builder.addCase(exports.FetchEventSearches.fulfilled, function (state, action) {
            state.Status = 'idle';
            state.Error = null;
            var sorted = _.orderBy(action.payload, [state.SortField], [state.Ascending ? "asc" : "desc"]);
            state.Data = sorted;
        });
        builder.addCase(exports.FetchEventSearches.pending, function (state, action) {
            state.Status = 'loading';
        });
        builder.addCase(exports.FetchEventSearches.rejected, function (state, action) {
            state.Status = 'error';
            state.Error = action.error.message;
        });
    }
});
// #endregion
// #region [ Selectors ]
exports.Sort = exports.EventSearchsSlice.actions.Sort;
exports.default = exports.EventSearchsSlice.reducer;
exports.SelectEventSearchs = function (state) { return state.EventSearch.Data; };
exports.SelectEventSearchByID = function (state, id) { return state.EventSearch.Data.find(function (ds) { return ds.EventID === id; }); };
exports.SelectEventSearchsStatus = function (state) { return state.EventSearch.Status; };
exports.SelectEventSearchsSortField = function (state) { return state.EventSearch.SortField; };
exports.SelectEventSearchsAscending = function (state) { return state.EventSearch.Ascending; };
exports.SelectEventSearchBySearchText = function (state, searchText) { return state.EventSearch.Data; };
// #endregion
// #region [ Async Functions ]
function GetEventSearchs(params) {
    return jquery_1.ajax({
        type: "POST",
        url: homePath + "api/OpenXDA/GetEventSearchData",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(params),
        dataType: 'json',
        cache: true,
        async: true
    });
}
// #endregion
//# sourceMappingURL=EventSearchSlice.js.map