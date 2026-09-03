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
import { PQBrowser, Redux } from '../global';
import moment from 'moment';
import queryString from 'querystring';
import { SystemCenter, OpenXDA } from '@gpa-gemstone/application-typings';
import { BuildDynamicEventSearchRequest } from '../Components/EventSearch/EventSearchData';
import { EventTypeSlice } from './Store';
import type { RootState } from './Store';

const momentDateFormat = "MM/DD/YYYY";

// #region [ Thunks ]
export const ResetFilters = createAsyncThunk('EventSearchs/ResetFilterThunk', async (_: void, { dispatch, getState }) => {
    const eventTypes = EventTypeSlice.Data(getState());
    return dispatch(EventSearchsSlice.actions.ResetFilters({ types: eventTypes }));
});

export const SetFilters = createAsyncThunk('EventSearchs/SetFilters', async (args: {
    characteristics?: PQBrowser.IEventCharacteristicFilters,
    types?: number[],
    time?: PQBrowser.IReportTimeFilter
}, { dispatch, getState }) => {
    const eventTypes = EventTypeSlice.Data(getState());
    return dispatch(EventSearchsSlice.actions.SetFilters({ ...args, eventTypes }));
});

export const SetFilterLists = createAsyncThunk('EventSearchs/SetFilterLists', async (args: {
    Meters: SystemCenter.Types.DetailedMeter[],
    Assets: SystemCenter.Types.DetailedAsset[],
    Groups: OpenXDA.Types.AssetGroup[],
    Stations: SystemCenter.Types.DetailedLocation[],
}, { dispatch, getState }) => {
    const eventTypes = EventTypeSlice.Data(getState());
    return dispatch(EventSearchsSlice.actions.SetFilterLists({ ...args, eventTypes }));
});
// #endregion

const initialState: Redux.EventSearchState = {
    EventCharacteristic: {
        durationMax: null,
        durationMin: null,
        phases: {
            AN: true,
            BN: true,
            CN: true,
            AB: true,
            BC: true,
            CA: true,
            ABG: true,
            BCG: true,
            ABC: true,
            ABCG: true
        },
        transientMin: null,
        transientMax: null,
        sagMin: null,
        sagMax: null,
        swellMin: null,
        swellMax: null,
        curveID: 1,
        curveInside: true,
        curveOutside: true
    },
    TimeRange: {
        date: moment.utc().subtract(84, 'h').format(momentDateFormat),
        time: '12:00:00.000',
        windowSize: 84,
        timeWindowUnits: 3
    },
    EventType: [],
    isReset: true,
    SelectedAssets: [],
    SelectedGroups: [],
    SelectedMeters: [],
    SelectedStations: []
};

// #region [ Slice ]
export const EventSearchsSlice = createSlice({
    name: 'EventSearch',
    initialState,
    reducers: {
        ProcessQuery: (state, action: PayloadAction<{
            query: queryString.ParsedUrlQuery,
            assets: SystemCenter.Types.DetailedAsset[],
            groups: OpenXDA.Types.AssetGroup[],
            locations: SystemCenter.Types.DetailedLocation[],
            meters: SystemCenter.Types.DetailedMeter[],
            typeIDs: OpenXDA.Types.EventType[]
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

            state.EventCharacteristic.durationMin = parseOptionalNumber(action.payload.query['durationMin']);
            state.EventCharacteristic.durationMax = parseOptionalNumber(action.payload.query['durationMax']);

            state.EventCharacteristic.transientMin = parseOptionalNumber(action.payload.query['transientMin']);
            state.EventCharacteristic.transientMax = parseOptionalNumber(action.payload.query['transientMax']);

            state.EventCharacteristic.sagMin = parseOptionalNumber(action.payload.query['sagMin']);
            state.EventCharacteristic.sagMax = parseOptionalNumber(action.payload.query['sagMax']);

            state.EventCharacteristic.swellMax = parseOptionalNumber(action.payload.query['swellMax']);
            state.EventCharacteristic.swellMin = parseOptionalNumber(action.payload.query['swellMin']);

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
        },
        SetFilters: (state, action: PayloadAction<{ eventTypes: OpenXDA.Types.EventType[], characteristics?: PQBrowser.IEventCharacteristicFilters, types?: number[], time?: PQBrowser.IReportTimeFilter }>) => {
            if (action.payload.time !== undefined)
                state.TimeRange = action.payload.time;
            if (action.payload.types !== undefined)
                state.EventType = action.payload.types;
            if (action.payload.characteristics !== undefined)
                state.EventCharacteristic = action.payload.characteristics;

            state.EventCharacteristic.durationMax = isNaN(state.EventCharacteristic.durationMax ?? NaN) ? null : state.EventCharacteristic.durationMax;
            state.EventCharacteristic.durationMin = isNaN(state.EventCharacteristic.durationMin ?? NaN) ? null : state.EventCharacteristic.durationMin;

            state.EventCharacteristic.transientMax = isNaN(state.EventCharacteristic.transientMax ?? NaN) ? null : state.EventCharacteristic.transientMax;
            state.EventCharacteristic.transientMin = isNaN(state.EventCharacteristic.transientMin ?? NaN) ? null : state.EventCharacteristic.transientMin;
            state.EventCharacteristic.sagMax = isNaN(state.EventCharacteristic.sagMax ?? NaN) ? null : state.EventCharacteristic.sagMax;
            state.EventCharacteristic.sagMin = isNaN(state.EventCharacteristic.sagMin ?? NaN) ? null : state.EventCharacteristic.sagMin;
            state.EventCharacteristic.swellMax = isNaN(state.EventCharacteristic.swellMax ?? NaN) ? null : state.EventCharacteristic.swellMax;
            state.EventCharacteristic.swellMin = isNaN(state.EventCharacteristic.swellMin ?? NaN) ? null : state.EventCharacteristic.swellMin;

            state.isReset = computeReset(state, action.payload.eventTypes);
        },
        ResetFilters: (state, action: PayloadAction<{ types: OpenXDA.Types.EventType[] }>) => {
            state.EventCharacteristic = {
                durationMax: null, durationMin: null,
                phases: { AN: true, BN: true, CN: true, AB: true, BC: true, CA: true, ABG: true, BCG: true, ABC: true, ABCG: true },
                transientMin: null, transientMax: null, sagMin: null, sagMax: null, swellMin: null, swellMax: null,
                curveID: 1, curveInside: true, curveOutside: true
            };

            state.EventType = action.payload.types.filter(e => e.ShowInFilter).map(e => e.ID);
            state.SelectedStations = [];
            state.SelectedMeters = [];
            state.SelectedGroups = [];
            state.SelectedAssets = [];
            state.isReset = true;
        },
        SetFilterLists: (state, action: PayloadAction<{
            Meters: SystemCenter.Types.DetailedMeter[],
            Assets: SystemCenter.Types.DetailedAsset[], Groups: OpenXDA.Types.AssetGroup[], Stations: SystemCenter.Types.DetailedLocation[],
            eventTypes: OpenXDA.Types.EventType[]
        }>) => {
            state.SelectedStations = action.payload.Stations;
            state.SelectedMeters = action.payload.Meters;
            state.SelectedGroups = action.payload.Groups;
            state.SelectedAssets = action.payload.Assets;

            state.isReset = computeReset(state, action.payload.eventTypes);
        }
    }

});
// #endregion

// #region [ Selectors ]
export default EventSearchsSlice.reducer;
export const { ProcessQuery } = EventSearchsSlice.actions;
export const SelectTimeFilter = (state: RootState) => state.EventSearch.TimeRange;
export const SelectTypeFilter = (state: RootState) => state.EventSearch.EventType;
export const SelectCharacteristicFilter = (state: RootState) => state.EventSearch.EventCharacteristic;
export const SelectReset = (state: RootState) => state.EventSearch.isReset;
export const SelectMeterList = (state: RootState) => state.EventSearch.SelectedMeters;
export const SelectAssetList = (state: RootState) => state.EventSearch.SelectedAssets;
export const SelectAssetGroupList = (state: RootState) => state.EventSearch.SelectedGroups;
export const SelectStationList = (state: RootState) => state.EventSearch.SelectedStations;

export const SelectQueryParam = createSelector(
    (state: RootState) => state.EventSearch.EventCharacteristic,
    (state: RootState) => state.EventSearch.EventType,
    (state: RootState) => state.EventSearch.TimeRange,
    (state: RootState) => state.EventSearch.SelectedAssets,
    (state: RootState) => state.EventSearch.SelectedGroups,
    (state: RootState) => state.EventSearch.SelectedMeters,
    (state: RootState) => state.EventSearch.SelectedStations,
    GenerateQueryParams
);

export const SelectEventSearchRequest = createSelector(
    (state: RootState) => state.EventSearch.TimeRange,
    (state: RootState) => state.EventSearch.EventType,
    (state: RootState) => state.EventSearch.EventCharacteristic,
    (state: RootState) => state.EventSearch.SelectedMeters,
    (state: RootState) => state.EventSearch.SelectedAssets,
    (state: RootState) => state.EventSearch.SelectedStations,
    (state: RootState) => state.EventSearch.SelectedGroups,
    (state: RootState) => state.Settings.eventSearch.NumberResults,
    BuildDynamicEventSearchRequest
);
// #endregion

// #region [ Async Functions ]
function computeReset(state: Redux.EventSearchState, eventTypes: OpenXDA.Types.EventType[]): boolean {
    const event = state.EventCharacteristic.durationMax == null && state.EventCharacteristic.durationMin == null &&
        state.EventCharacteristic.transientMin == null && state.EventCharacteristic.transientMax == null &&
        state.EventCharacteristic.sagMin == null && state.EventCharacteristic.sagMax == null &&
        state.EventCharacteristic.swellMin == null && state.EventCharacteristic.swellMax == null &&
        state.EventCharacteristic.phases.AN && state.EventCharacteristic.phases.BN && state.EventCharacteristic.phases.CN && state.EventCharacteristic.phases.AB && state.EventCharacteristic.phases.BC && state.EventCharacteristic.phases.CA && state.EventCharacteristic.phases.ABG && state.EventCharacteristic.phases.BCG && state.EventCharacteristic.phases.ABC && state.EventCharacteristic.phases.ABCG &&
        state.EventCharacteristic.curveInside && state.EventCharacteristic.curveOutside;

    const types = eventTypes.filter(e => e.ShowInFilter).length == state.EventType.length;
    return event && types && state.SelectedAssets.length == 0 && state.SelectedStations.length == 0 && state.SelectedMeters.length == 0 && state.SelectedGroups.length == 0;
}

export function GenerateQueryParams(
    event: PQBrowser.IEventCharacteristicFilters,
    type: number[],
    time: PQBrowser.IReportTimeFilter,
    assets: SystemCenter.Types.DetailedAsset[],
    groups: OpenXDA.Types.AssetGroup[],
    meters: SystemCenter.Types.DetailedMeter[],
    stations: SystemCenter.Types.DetailedLocation[],
    eventID: number | null = null
): any {
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

    if (event != null) {
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
    }

    if (time != null) {
        result["date"] = time.date;
        result["time"] = time.time;
        result["windowSize"] = time.windowSize;
        result["timeWindowUnits"] = time.timeWindowUnits;
    }

    if (eventID != null) {
        result['eventid'] = eventID;
    }

    return result;
}

function parseOptionalNumber(value: string | string[] | undefined): number | null {
    const parsed = parseFloat(value?.toString() ?? '');
    return Number.isNaN(parsed) ? null : parsed;
}

function parseList(key: string, object: any) {
    const result: any[] = [];
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
