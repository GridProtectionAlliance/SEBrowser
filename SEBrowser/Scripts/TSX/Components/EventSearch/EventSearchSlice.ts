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
import { AssetGroupSlice, AssetSlice, EventTypeSlice, LocationSlice, MeterSlice } from '../../Store';
import { SystemCenter, OpenXDA } from '@gpa-gemstone/application-typings';
import { findAppropriateUnit, getStartEndTime, getMoment } from './TimeWindowUtils';
import { dispatch } from 'd3';

const momentDateFormat = "MM/DD/YYYY";

let fetchHandle: JQuery.jqXHR<any> | null = null;

// #region [ Thunks ]
export const FetchEventSearches = createAsyncThunk('EventSearchs/FetchEventSearches', async (_, { signal, getState }) => {
    const time = (getState() as any).EventSearch.TimeRange as SEBrowser.IReportTimeFilter;
    const types = (getState() as any).EventSearch.EventType as number[];
    const characteristics = (getState() as any).EventSearch.EventCharacteristic as SEBrowser.IEventCharacteristicFilters;
    const meterList = (getState() as any).EventSearch.SelectedMeters as SystemCenter.Types.DetailedMeter[];
    const assetList = (getState() as any).EventSearch.SelectedAssets as SystemCenter.Types.DetailedAsset[];
    const locationList = (getState() as any).EventSearch.SelectedStations as SystemCenter.Types.DetailedLocation[];
    const groupList = (getState() as any).EventSearch.SelectedGroups as OpenXDA.Types.AssetGroup[];
    const settings = (getState() as Redux.StoreState).Settings.eventSearch;
    const sortKey = (getState() as Redux.StoreState).EventSearch.SortField;
    const ascending = (getState() as Redux.StoreState).EventSearch.Ascending;

    const adjustedTime = findAppropriateUnit(
        ...getStartEndTime(getMoment(time.date, time.time), time.windowSize, time.timeWindowUnits),
        time.timeWindowUnits);


    const filter = {
        date: time.date, time: time.time, windowSize: adjustedTime[1], timeWindowUnits: adjustedTime[0],
        typeIDs: types,
        durationMin: characteristics.durationMin ?? 0, durationMax: characteristics.durationMax ?? 0,
        phases: {
            AN: characteristics.phases.AN, BN: characteristics.phases.BN, CN: characteristics.phases.CN, AB: characteristics.phases.AB, BC: characteristics.phases.BC,
            CA: characteristics.phases.CA, ABG: characteristics.phases.ABG, BCG: characteristics.phases.BCG, ABC: characteristics.phases.ABC, ABCG: characteristics.phases.ABCG,
        },
        transientMin: characteristics.transientMin ?? 0, transientMax: characteristics.transientMax ?? 0, transientType: characteristics.transientType,
        sagMin: characteristics.sagMin ?? 0, sagMax: characteristics.sagMax ?? 0, sagType: characteristics.sagType,
        swellMin: characteristics.swellMin ?? 0, swellMax: characteristics.swellMax ?? 0, swellType: characteristics.swellType,
        curveID: characteristics.curveID, curveInside: characteristics.curveInside, curveOutside: characteristics.curveOutside,
        meterIDs: meterList.map(item => item.ID), assetIDs: assetList.map(item => item.ID),
        groupIDs: groupList.map(item => item.ID), locationIDs: locationList.map(item => item.ID),
        numberResults: settings.NumberResults,
    } 

    const additionalArguments = {
        numberResults: settings.NumberResults,
        ascending,
        sortKey
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

export const Sort = createAsyncThunk('EventSearchs/Sort', async (arg: { SortField: string, Ascending: boolean }, { signal, getState, dispatch }) => {
    return dispatch(FetchEventSearches());
})

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

    if (state.EventType.Status == 'unintiated')
        await dispatch(EventTypeSlice.Fetch());
    state = getState() as Redux.StoreState;
    return dispatch(EventSearchsSlice.actions.ProcessQuery({
        query, assets: state.Asset.Data, groups: state.AssetGroup.Data,
        locations: state.Location.Data,
        meters: state.Meter.Data,
        typeIDs: state.EventType.Data
    }));
});

export const ResetFilters = createAsyncThunk('EventSearchs/ResetFilterThunk', async (_: void, { dispatch, getState }) => {
    let state = getState() as Redux.StoreState;
    
    if (state.EventType.Status == 'unintiated')
        await dispatch(EventTypeSlice.Fetch());
    state = getState() as Redux.StoreState;
    return dispatch(EventSearchsSlice.actions.ResetFilters({
        types: state.EventType.Data
    }));
});
export const SetFilters = createAsyncThunk('EventSearchs/SetFilters', async (args: {
    characteristics?: SEBrowser.IEventCharacteristicFilters,
    types?: number[],
    time?: SEBrowser.IReportTimeFilter
}, { dispatch, getState }) => {
    let state = getState() as Redux.StoreState;
    if (state.EventType.Status == 'unintiated')
        await dispatch(EventTypeSlice.Fetch());
    state = getState() as Redux.StoreState;
    return dispatch(EventSearchsSlice.actions.SetFilters({ ...args, eventTypes: state.EventType.Data }));
});

export const SetFilterLists = createAsyncThunk('EventSearchs/SetFilterLists', async (args: {
    Meters: SystemCenter.Types.DetailedMeter[],
    Assets: SystemCenter.Types.DetailedAsset[],
    Groups: OpenXDA.Types.AssetGroup[],
    Stations: SystemCenter.Types.DetailedLocation[],
}, { dispatch, getState }) => {
    let state = getState() as Redux.StoreState;
    if (state.EventType.Status == 'unintiated')
        await dispatch(EventTypeSlice.Fetch());
    state = getState() as Redux.StoreState;
    return dispatch(EventSearchsSlice.actions.SetFilterLists({ ...args, eventTypes: state.EventType.Data }));
});
// #endregion

// #region [ Slice ]
export const EventSearchsSlice = createSlice({
    name: 'EventSearch',
    initialState: {
        Status: 'unitiated',
        Data: [],
        Error: null,
        SortField: 'Time',
        Ascending: true,
        SearchText: '',
        EventCharacteristic: {
            durationMax: null, durationMin: null, phases: {
                AN: true, BN: true, CN: true, AB: true, BC: true, CA: true, ABG: true, BCG: true, ABC: true, ABCG: true
            },
            transientMin: null, transientMax: null, sagMin: null, sagMax: null, swellMin: null, swellMax: null,
            sagType: 'both', swellType: 'both', transientType: 'both',
            curveID: 1, curveInside: true, curveOutside: true
        },
        TimeRange: {
            date: moment.utc().subtract(84,'h').format(momentDateFormat),
            time: '12:00:00.000',
            windowSize: 84,
            timeWindowUnits: 3
        },
        EventType: [],
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
        ProcessQuery: (state, action: PayloadAction<{
            query: queryString.ParsedUrlQuery, assets: SystemCenter.Types.DetailedAsset[],
            groups: OpenXDA.Types.AssetGroup[], locations: SystemCenter.Types.DetailedLocation[],
            meters: SystemCenter.Types.DetailedMeter[], typeIDs: SEBrowser.EventType[]
        }>) => {


            state.TimeRange.date = action.payload.query['date']?.toString() ?? state.TimeRange.date;
            state.TimeRange.time = action.payload.query['time']?.toString() ?? state.TimeRange.time;
            state.TimeRange.windowSize = parseFloat(action.payload.query['windowSize']?.toString() ?? state.TimeRange.windowSize.toString());
            state.TimeRange.timeWindowUnits = parseInt(action.payload.query['timeWindowUnits']?.toString() ?? state.TimeRange.timeWindowUnits.toString());

            state.EventType = parseList('types', action.payload.query)?.map(id => action.payload.typeIDs.find(item => item.ID == parseInt(id))).filter(item => item != null).map(t => t.ID) ?? action.payload.typeIDs.filter(item => item.ShowInFilter).map(t => t.ID);

            state.SelectedAssets = parseList('assets', action.payload.query)?.map(id => action.payload.assets.find(item => item.ID == parseInt(id))).filter(item => item != null) ?? [];
            state.SelectedGroups = parseList('groups', action.payload.query)?.map(id => action.payload.groups.find(item => item.ID == parseInt(id))).filter(item => item != null) ?? [];
            state.SelectedMeters = parseList('meters', action.payload.query)?.map(id => action.payload.meters.find(item => item.ID == parseInt(id))).filter(item => item != null) ?? [];
            state.SelectedStations = parseList('stations', action.payload.query)?.map(id => action.payload.locations.find(item => item.ID == parseInt(id))).filter(item => item != null) ?? [];

            state.EventCharacteristic.durationMin = parseFloat(action.payload.query['durationMin']?.toString() ?? null);
            state.EventCharacteristic.durationMax = parseFloat(action.payload.query['durationMax']?.toString() ?? null);

            state.EventCharacteristic.transientMin = parseFloat(action.payload.query['transientMin']?.toString() ?? null);
            state.EventCharacteristic.transientMax = parseFloat(action.payload.query['transientMax']?.toString() ?? null);

            state.EventCharacteristic.sagMin = parseFloat(action.payload.query['sagMin']?.toString() ?? null);
            state.EventCharacteristic.sagMax = parseFloat(action.payload.query['sagMax']?.toString() ?? null);

            state.EventCharacteristic.swellMax = parseFloat(action.payload.query['swellMax']?.toString() ?? null);
            state.EventCharacteristic.swellMin = parseFloat(action.payload.query['swellMin']?.toString() ?? null);

            state.EventCharacteristic.sagType = (action.payload.query['sagType'] ?? 'both') as ('both' | 'LL' | 'LN');
            state.EventCharacteristic.swellType = (action.payload.query['swellType'] ?? 'both') as ('both' | 'LL' | 'LN');
            state.EventCharacteristic.transientType = (action.payload.query['transientType'] ?? 'both') as ('both' | 'LL' | 'LN');

            state.EventCharacteristic.curveID = parseInt(action.payload.query['curveID']?.toString() ?? '1');
            state.EventCharacteristic.curveInside = (action.payload.query['curveInside'] ?? 'true') == 'true';
            state.EventCharacteristic.curveOutside = (action.payload.query['curveOutside'] ?? 'true') == 'true';

            state.EventCharacteristic.phases.AN = (action.payload.query['PhaseAN'] ?? 'true') == 'true';
            state.EventCharacteristic.phases.BN = (action.payload.query['PhaseBN'] ?? 'true') == 'true';
            state.EventCharacteristic.phases.CN = (action.payload.query['PhaseCN'] ?? 'true') == 'true';
            state.EventCharacteristic.phases.AB = (action.payload.query['PhaseAB'] ?? 'true') == 'true';
            state.EventCharacteristic.phases.BC = (action.payload.query['PhaseBC'] ?? 'true') == 'true';
            state.EventCharacteristic.phases.CA = (action.payload.query['PhaseCA'] ?? 'true') == 'true';
            state.EventCharacteristic.phases.ABG = (action.payload.query['PhaseABG'] ?? 'true') == 'true';
            state.EventCharacteristic.phases.BCG = (action.payload.query['PhaseBCG'] ?? 'true') == 'true';
            state.EventCharacteristic.phases.ABC = (action.payload.query['PhaseABC'] ?? 'true') == 'true';
            state.EventCharacteristic.phases.ABCG = (action.payload.query['PhaseABCG'] ?? 'true') == 'true';

            state.isReset = computeReset(state, action.payload.typeIDs);
            state.Status = 'changed';
        },
        SetFilters: (state, action: PayloadAction<{ eventTypes: SEBrowser.EventType[], characteristics?: SEBrowser.IEventCharacteristicFilters, types?: number[], time?: SEBrowser.IReportTimeFilter }>) => {
            state.Status = 'changed';
            if (action.payload.time !== undefined)
                state.TimeRange = action.payload.time;
            if (action.payload.types !== undefined)
                state.EventType = action.payload.types;
            if (action.payload.characteristics !== undefined)
                state.EventCharacteristic = action.payload.characteristics;

            state.EventCharacteristic.durationMax = isNaN(state.EventCharacteristic.durationMax) ? null : state.EventCharacteristic.durationMax;
            state.EventCharacteristic.durationMin = isNaN(state.EventCharacteristic.durationMin) ? null : state.EventCharacteristic.durationMin;

            state.EventCharacteristic.transientMax = isNaN(state.EventCharacteristic.transientMax) ? null : state.EventCharacteristic.transientMax;
            state.EventCharacteristic.transientMin = isNaN(state.EventCharacteristic.transientMin) ? null : state.EventCharacteristic.transientMin;
            state.EventCharacteristic.sagMax = isNaN(state.EventCharacteristic.sagMax) ? null : state.EventCharacteristic.sagMax;
            state.EventCharacteristic.sagMin = isNaN(state.EventCharacteristic.sagMin) ? null : state.EventCharacteristic.sagMin;
            state.EventCharacteristic.swellMax = isNaN(state.EventCharacteristic.swellMax) ? null : state.EventCharacteristic.swellMax;
            state.EventCharacteristic.swellMin = isNaN(state.EventCharacteristic.swellMin) ? null : state.EventCharacteristic.swellMin;


            state.isReset = computeReset(state, action.payload.eventTypes);
        },
        ResetFilters: (state, action: PayloadAction<{ types: SEBrowser.EventType[] }>) => {
            state.EventCharacteristic = {
                durationMax: null, durationMin: null,
                phases: { AN: true, BN: true, CN: true, AB: true, BC: true, CA: true, ABG: true, BCG: true, ABC: true, ABCG: true }, 
                transientMin: null, transientMax: null, sagMin: null, sagMax: null, swellMin: null, swellMax: null, sagType: 'both', swellType: 'both', transientType: 'both',
                curveID: 1, curveInside: true, curveOutside: true
            };

            state.EventType = action.payload.types.filter(e => e.ShowInFilter).map(e => e.ID);
            state.SelectedStations = [];
            state.SelectedMeters = [];
            state.SelectedGroups = [];
            state.SelectedAssets = [];
            state.isReset = true;
            state.Status = 'changed';
        },
        SetFilterLists: (state, action: PayloadAction<{
            Meters: SystemCenter.Types.DetailedMeter[],
            Assets: SystemCenter.Types.DetailedAsset[], Groups: OpenXDA.Types.AssetGroup[], Stations: SystemCenter.Types.DetailedLocation[],
            eventTypes: SEBrowser.EventType[]
        }>) => {
            state.SelectedStations = action.payload.Stations;
            state.SelectedMeters = action.payload.Meters;
            state.SelectedGroups = action.payload.Groups;
            state.SelectedAssets = action.payload.Assets;

            state.isReset = computeReset(state, action.payload.eventTypes);
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
        builder.addCase(Sort.pending, (state, action) => {
            if (state.SortField === action.meta.arg.SortField)
                state.Ascending = !action.meta.arg.Ascending;
            else
                state.SortField = action.meta.arg.SortField;
           
        });

    }

});
// #endregion

// #region [ Selectors ]
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

function computeReset(state: Redux.EventSearchState, eventTypes: SEBrowser.EventType[]): boolean {
    const event = state.EventCharacteristic.durationMax == null && state.EventCharacteristic.durationMin == null &&
        state.EventCharacteristic.transientMin == null && state.EventCharacteristic.transientMax == null &&
        state.EventCharacteristic.sagMin == null && state.EventCharacteristic.sagMax == null &&
        state.EventCharacteristic.swellMin == null && state.EventCharacteristic.swellMax == null &&
        state.EventCharacteristic.phases.AN && state.EventCharacteristic.phases.BN && state.EventCharacteristic.phases.CN && state.EventCharacteristic.phases.AB && state.EventCharacteristic.phases.BC && state.EventCharacteristic.phases.CA && state.EventCharacteristic.phases.ABG && state.EventCharacteristic.phases.BCG && state.EventCharacteristic.phases.ABC && state.EventCharacteristic.phases.ABCG &&
        state.EventCharacteristic.curveInside && state.EventCharacteristic.curveOutside;

    const types = eventTypes.filter(e => e.ShowInFilter).length == state.EventType.length;
    return event && types && state.SelectedAssets.length == 0 && state.SelectedStations.length == 0 && state.SelectedMeters.length == 0 && state.SelectedGroups.length == 0;
}

function GenerateQueryParams(event: SEBrowser.IEventCharacteristicFilters, type: number[],
    time: SEBrowser.IReportTimeFilter, assets: SystemCenter.Types.DetailedAsset[], groups: OpenXDA.Types.AssetGroup[],
    meters: SystemCenter.Types.DetailedMeter[], stations: SystemCenter.Types.DetailedLocation[]): any {
    const result: any = {};
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

    if (type.length > 0 && type.length < 100) {
        let i = 0;
        type.forEach(ag => {
            result["types" + i] = ag;
            i = i + 1;
        })
    }

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

    if (!event.phases.AN)
        result['AN'] = false;
    if (!event.phases.BN)
        result['BN'] = false;
    if (!event.phases.CN)
        result['CN'] = false;
    if (!event.phases.AB)
        result['AB'] = false;
    if (!event.phases.BC)
        result['BC'] = false;
    if (!event.phases.CA)
        result['CA'] = false;
    if (!event.phases.ABG)
        result['ABG'] = false;
    if (!event.phases.BCG)
        result['BCG'] = false;
    if (!event.phases.ABC)
        result['ABC'] = false;
    if (!event.phases.ABCG)
        result['ABCG'] = false;

    result["date"] = time.date;
    result["time"] = time.time;
    result["windowSize"] = time.windowSize;
    result["timeWindowUnits"] = time.timeWindowUnits;


    return result;
}

function parseList(key: string, object: any) {
    const result = [];
    let i = 0;

    while (object[key + i] != null) {
        result.push(object[key + i]);
        i = i + 1;
    }

    if (result.length == 0)
        return null;
    return result;

}
// #endregion

