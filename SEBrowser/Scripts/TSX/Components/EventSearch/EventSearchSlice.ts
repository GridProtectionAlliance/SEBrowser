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

import { createSlice, createAsyncThunk, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { SEBrowser, Redux } from '../../global';
import * as _ from 'lodash';
import { ajax } from 'jquery';
import moment from 'moment';
import queryString from 'querystring';
import { AssetGroupSlice, AssetSlice, LocationSlice, MeterSlice } from '../../Store';
import { SystemCenter, OpenXDA } from '@gpa-gemstone/application-typings';


const momentDateTimeFormat = "MM/DD/YYYY HH:mm:ss.SSS";
const momentDateFormat = "MM/DD/YYYY";
const momentTimeFormat = "HH:mm:ss.SSS";

let fetchHandle: JQuery.jqXHR<any> | null = null;

// #region [ Thunks ]
export const FetchEventSearches = createAsyncThunk('EventSearchs/FetchEventSearches', async (_, { signal, dispatch, getState }) => {
    const time = (getState() as any).EventSearch.TimeRange as SEBrowser.IReportTimeFilter;
    const types = (getState() as any).EventSearch.EventType as SEBrowser.IEventTypeFilters;
    const characteristics = (getState() as any).EventSearch.EventCharacteristic as SEBrowser.IEventCharacteristicFilters;
    const meterList = (getState() as any).EventSearch.SelectedMeters as SystemCenter.Types.DetailedMeter[];
    const assetList = (getState() as any).EventSearch.SelectedAssets as SystemCenter.Types.DetailedAsset[];
    const locationList = (getState() as any).EventSearch.SelectedStations as SystemCenter.Types.DetailedLocation[];
    const groupList = (getState() as any).EventSearch.SelectedGroups as OpenXDA.Types.AssetGroup[];

    const settings = (getState() as Redux.StoreState).Settings.eventSearch;

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
        groupIDs: groupList.map(item => item.ID), locationIDs: locationList.map(item => item.ID),
        numberResults: settings.NumberResults,
    }

    const additionalArguments = {
        numberResults: settings.NumberResults
    }

    if (fetchHandle != null && fetchHandle.abort != null)
        fetchHandle.abort();

    const handle = GetEventSearchs({
        ...filter,
        ...additionalArguments
    });
    fetchHandle = handle;
    signal.addEventListener('abort', () => {
        if (handle.abort !== undefined) handle.abort();
    });

    return await handle;
});

export const ProcessQuery = createAsyncThunk('EventSearchs/ProcessQuery', async (query: queryString.ParsedUrlQuery , { dispatch, getState }) => {
    let state = getState() as Redux.StoreState;
    if (state.Asset.Status == 'unintiated')
        await dispatch(AssetSlice.Fetch());
    if (state.Meter.Status == 'unintiated')
        await dispatch(MeterSlice.Fetch());
    if (state.AssetGroup.Status == 'unintiated')
        await dispatch(AssetGroupSlice.Fetch());
    if (state.Location.Status == 'unintiated')
        await dispatch(LocationSlice.Fetch());

    state = getState() as Redux.StoreState;
    return dispatch(EventSearchsSlice.actions.ProcessQuery({
        query, assets: state.Asset.Data, groups: state.AssetGroup.Data, locations: [], meters: state.Meter.Data
    }));
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
        TimeRange: { date: moment.utc().format(momentDateFormat), time: '12:00:00.000', windowSize: 10, timeWindowUnits: 5 },
        EventType: { breakerOps: true, faults: true, interruptions: true, others: true, relayTCE: true, swells: true, sags: true, transients: true },
        isReset: true,
        SelectedAssets: [],
        SelectedGroups: [],
        SelectedMeters: [],
        SelectedStations: [],
        SelectedDetailedMeters: [],
        SelectedDetailedAssets: [],
        SelectedDetailedStations: [],
        ActiveFetchID: []
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
        ProcessQuery: (state, action: PayloadAction<{
            query: queryString.ParsedUrlQuery, assets: SystemCenter.Types.DetailedAsset[],
            groups: OpenXDA.Types.AssetGroup[], locations: SystemCenter.Types.DetailedLocation[], meters: SystemCenter.Types.DetailedMeter[],
        }>) => {


            state.TimeRange.date = action.payload.query['date']?.toString() ?? state.TimeRange.date;
            state.TimeRange.time = action.payload.query['time']?.toString() ?? state.TimeRange.time;
            state.TimeRange.windowSize = parseFloat(action.payload.query['windowSize']?.toString() ?? state.TimeRange.windowSize.toString());
            state.TimeRange.timeWindowUnits = parseInt(action.payload.query['timeWindowUnits']?.toString() ?? state.TimeRange.timeWindowUnits.toString());

            state.EventType.faults = (action.payload.query['faults'] ?? 'true') == 'true';
            state.EventType.sags = (action.payload.query['sags'] ?? 'true') == 'true';
            state.EventType.swells = (action.payload.query['swells'] ?? 'true') == 'true';
            state.EventType.interruptions = (action.payload.query['interruptions'] ?? 'true') == 'true';
            state.EventType.breakerOps = (action.payload.query['breakerOps'] ?? 'true') == 'true';
            state.EventType.transients = (action.payload.query['transients'] ?? 'true') == 'true';
            state.EventType.relayTCE = (action.payload.query['relayTCE'] ?? 'true') == 'true';
            state.EventType.others = (action.payload.query['others'] ?? 'true') == 'true';

            state.SelectedAssets = parseList('assets', action.payload.query)?.map(id => action.payload.assets.find(item => item.ID == parseInt(id))).filter(item => item != null) ?? [];
            state.SelectedGroups = parseList('groups', action.payload.query)?.map(id => action.payload.groups.find(item => item.ID == parseInt(id))).filter(item => item != null) ?? [];
            state.SelectedMeters = parseList('meters', action.payload.query)?.map(id => action.payload.meters.find(item => item.ID == parseInt(id))).filter(item => item != null) ?? [];
            state.SelectedStations = parseList('stations', action.payload.query)?.map(id => action.payload.locations.find(item => item.ID == parseInt(id))).filter(item => item != null) ?? [];

            state.EventCharacteristic.durationMin = parseFloat(action.payload.query['durationMin']?.toString() ?? '0');
            state.EventCharacteristic.durationMax = parseFloat(action.payload.query['durationMax']?.toString() ?? '0');

            state.EventCharacteristic.transientMin = parseFloat(action.payload.query['transientMin']?.toString() ?? '0');
            state.EventCharacteristic.transientMax = parseFloat(action.payload.query['transientMax']?.toString() ?? '0');

            state.EventCharacteristic.sagMin = parseFloat(action.payload.query['sagMin']?.toString() ?? '0');
            state.EventCharacteristic.sagMax = parseFloat(action.payload.query['sagMax']?.toString() ?? '0');

            state.EventCharacteristic.swellMax = parseFloat(action.payload.query['swellMax']?.toString() ?? '0');
            state.EventCharacteristic.swellMin = parseFloat(action.payload.query['swellMin']?.toString() ?? '0');

            state.EventCharacteristic.sagType = (action.payload.query['sagType'] ?? 'both') as ('both' | 'LL' | 'LN');
            state.EventCharacteristic.swellType = (action.payload.query['swellType'] ?? 'both') as ('both' | 'LL' | 'LN');
            state.EventCharacteristic.transientType = (action.payload.query['transientType'] ?? 'both') as ('both' | 'LL' | 'LN');

            state.EventCharacteristic.curveID = parseInt(action.payload.query['curveID']?.toString() ?? '1');
            state.EventCharacteristic.curveInside = (action.payload.query['curveInside'] ?? 'true') == 'true';
            state.EventCharacteristic.curveOutside = (action.payload.query['curveOutside'] ?? 'true') == 'true';

            state.EventCharacteristic.Phase.A = (action.payload.query['PhaseA'] ?? 'true') == 'true';
            state.EventCharacteristic.Phase.B = (action.payload.query['PhaseB'] ?? 'true') == 'true';
            state.EventCharacteristic.Phase.C = (action.payload.query['PhaseC'] ?? 'true') == 'true';

            state.isReset = computeReset(state);
            state.Status = 'changed';
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
        SetFilterLists: (state, action: PayloadAction<{
            Meters: SystemCenter.Types.DetailedMeter[],
            Assets: SystemCenter.Types.DetailedAsset[], Groups: OpenXDA.Types.AssetGroup[], Stations: SystemCenter.Types.DetailedLocation[]
        }>) => {
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
            state.ActiveFetchID = state.ActiveFetchID.filter(id => id !== action.meta.requestId);
            state.Status = 'idle';
            state.Error = null;
            const sorted = _.orderBy(action.payload, [state.SortField], [state.Ascending ? "asc" : "desc"])
            state.Data = sorted

        });
        builder.addCase(FetchEventSearches.pending, (state, action) => {
            state.Status = 'loading';
            state.ActiveFetchID.push(action.meta.requestId);
        });
        builder.addCase(FetchEventSearches.rejected, (state, action) => {
            state.ActiveFetchID = state.ActiveFetchID.filter(id => id !== action.meta.requestId);
            if (state.ActiveFetchID.length > 0)
                return;
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
export const SelectTimeFilter = (state: Redux.StoreState) => state.EventSearch.TimeRange;
export const SelectTypeFilter = (state: Redux.StoreState) => state.EventSearch.EventType;
export const SelectCharacteristicFilter = (state: Redux.StoreState) => state.EventSearch.EventCharacteristic;
export const SelectReset = (state: Redux.StoreState) => state.EventSearch.isReset;
export const SelectMeterList = (state: Redux.StoreState) => state.EventSearch.SelectedMeters;
export const SelectAssetList = (state: Redux.StoreState) => state.EventSearch.SelectedAssets;
export const SelectAssetGroupList = (state: Redux.StoreState) => state.EventSearch.SelectedGroups;
export const SelectStationList = (state: Redux.StoreState) => state.EventSearch.SelectedStations;

export const SelectQueryParam = createSelector(
    (state: Redux.StoreState) => state.EventSearch.EventCharacteristic,
    (state: Redux.StoreState) => state.EventSearch.EventType,
    (state: Redux.StoreState) => state.EventSearch.TimeRange,
    (state: Redux.StoreState) => state.EventSearch.SelectedAssets,
    (state: Redux.StoreState) => state.EventSearch.SelectedGroups,
    (state: Redux.StoreState) => state.EventSearch.SelectedMeters,
    (state: Redux.StoreState) => state.EventSearch.SelectedStations,
    GenerateQueryParams
);

export const SelectEventList = createSelector(
    (state: Redux.StoreState) => state.EventSearch.Data,
    (d) => d.map(i => i["EventID"]).join(",")
);
// #endregion

// #region [ Async Functions ]
function GetEventSearchs(params: any): JQuery.jqXHR<any[]> {
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
        state.EventCharacteristic.Phase.A && state.EventCharacteristic.Phase.B && state.EventCharacteristic.Phase.C &&
        state.EventCharacteristic.curveInside && state.EventCharacteristic.curveOutside;

    const types = state.EventType.breakerOps && state.EventType.faults && state.EventType.interruptions && state.EventType.others
        && state.EventType.relayTCE && state.EventType.swells && state.EventType.sags && state.EventType.transients;

    return event && types && state.SelectedAssets.length == 0 && state.SelectedStations.length == 0 && state.SelectedMeters.length == 0 && state.SelectedGroups.length == 0;
}

function GenerateQueryParams(event: SEBrowser.IEventCharacteristicFilters, type: SEBrowser.IEventTypeFilters,
    time: SEBrowser.IReportTimeFilter, assets: SystemCenter.Types.DetailedAsset[], groups: OpenXDA.Types.AssetGroup[],
    meters: SystemCenter.Types.DetailedMeter[], stations: SystemCenter.Types.DetailedLocation[]): any {
    let result: any = {};
    if (assets.length > 0 && assets.length < 100) {
        let i = 0;
        assets.forEach(a => {
            result["assets" + i] = a.ID;
            i = i + 1;
        })
    }
    if (meters.length > 0 && meters.length < 100) {
        let i = 0;
        meters.forEach(m => {
            result["meters" + i] = m.ID;
            i = i + 1;
        })
    }
    if (stations.length > 0 && stations.length < 100) {
        let i = 0;
        stations.forEach(s => {
            result["stations" + i] = s.ID;
            i = i + 1;
        })
    }
    if (groups.length > 0 && groups.length < 100) {
        let i = 0;
        groups.forEach(ag => {
            result["groups" + i] = ag.ID;
            i = i + 1;
        })
    }

    if (!type.faults)
        result['faults'] = false;

    if (!type.sags)
        result['sags'] = false;

    if (!type.swells)
        result['swells'] = false;

    if (!type.interruptions)
        result['interruptions'] = false;

    if (!type.breakerOps)
        result['breakerOps'] = false;

    if (!type.transients)
        result['transients'] = false;

    if (!type.relayTCE)
        result['relayTCE'] = false;

    if (!type.others)
        result['others'] = false;

    if (event.durationMin != 0)
        result['durationMin'] = event.durationMin
    if (event.durationMax != 0)
        result['durationMax'] = event.durationMax

    if (event.transientMin != 0)
        result['transientMin'] = event.transientMin
    if (event.transientMax != 0)
        result['transientMax'] = event.transientMax

    if (event.sagMin != 0)
        result['sagMin'] = event.sagMin
    if (event.sagMax != 0)
        result['sagMax'] = event.sagMax

    if (event.swellMax != 0)
        result['swellMax'] = event.swellMax
    if (event.swellMin != 0)
        result['swellMin'] = event.swellMin

    if (event.sagType != 'both')
        result['sagType'] = event.sagType
    if (event.swellType != 'both')
        result['swellType'] = event.swellType
    if (event.transientType != 'both')
        result['transientType'] = event.transientType

    if (event.curveID != 1)
        result['curveID'] = event.curveID
    if (!event.curveInside)
        result['curveInside'] = false
    if (!event.curveOutside)
        result['curveOutside'] = false;

    if (!event.Phase.A)
        result['PhaseA'] = false;
    if (!event.Phase.B)
        result['PhaseB'] = false;
    if (!event.Phase.C)
        result['PhaseC'] = false;

    result["date"] = time.date;
    result["time"] = time.time;
    result["windowSize"] = time.windowSize;
    result["timeWindowUnits"] = time.timeWindowUnits;


    return result;
}

function parseList(key: string, object: any) {
    let result = [];
    let i = 0;

    while (object[key + i] != null) {
        result.push(object[key + i]);
        i = i + 1;
    }

    return result;

}
// #endregion

