//******************************************************************************************************
//  EventSearchData.ts - Gbtc
//
//  Copyright (c) 2026, Grid Protection Alliance.  All Rights Reserved.
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
//******************************************************************************************************

import { OpenXDA, SystemCenter } from '@gpa-gemstone/application-typings';
import { PQBrowser } from '../../global';
import { findAppropriateUnit, getMoment, getStartEndTime } from './TimeWindowUtils';
import { DynamicEventSearchRow, GetDynamicEventSearchData, IDynamicEventSearchRequest, IDynamicEventSearchQuery } from '../../../../EventWidgets/TSX/CollectionWidget/DynamicEventTable/DynamicEventSearchData';

export type { DynamicEventSearchRow, IDynamicEventSearchRequest, IDynamicEventSearchQuery };
export { GetDynamicEventSearchData };

declare let homePath: string;

// Fetches the search row for a single event directly, independent of the current search filters
export function GetEventSearchRecord(eventID: number): JQuery.jqXHR<DynamicEventSearchRow[]> {
    return GetDynamicEventSearchData({ eventID }, `${homePath}api/OpenXDA/GetEventSearchData`);
}

export function BuildDynamicEventSearchRequest(
    time: PQBrowser.IReportTimeFilter,
    types: number[],
    characteristics: PQBrowser.IEventCharacteristicFilters,
    meterList: SystemCenter.Types.DetailedMeter[],
    assetList: SystemCenter.Types.DetailedAsset[],
    locationList: SystemCenter.Types.DetailedLocation[],
    groupList: OpenXDA.Types.AssetGroup[],
    numberResults: number
): IDynamicEventSearchRequest {
    const adjustedTime = findAppropriateUnit(getMoment(time.date, time.time),
        getStartEndTime(getMoment(time.date, time.time), time.windowSize, time.timeWindowUnits)[1],
        time.timeWindowUnits);

    return {
        date: time.date,
        time: time.time,
        windowSize: adjustedTime[1],
        timeWindowUnits: adjustedTime[0],
        typeIDs: types,
        durationMin: characteristics.durationMin ?? 0,
        durationMax: characteristics.durationMax ?? 0,
        phases: {
            AN: characteristics.phases.AN,
            BN: characteristics.phases.BN,
            CN: characteristics.phases.CN,
            AB: characteristics.phases.AB,
            BC: characteristics.phases.BC,
            CA: characteristics.phases.CA,
            ABG: characteristics.phases.ABG,
            BCG: characteristics.phases.BCG,
            ABC: characteristics.phases.ABC,
            ABCG: characteristics.phases.ABCG,
        },
        transientMin: characteristics.transientMin ?? 0,
        transientMax: characteristics.transientMax ?? 0,
        sagMin: characteristics.sagMin ?? 0,
        sagMax: characteristics.sagMax ?? 0,
        swellMin: characteristics.swellMin ?? 0,
        swellMax: characteristics.swellMax ?? 0,
        curveID: characteristics.curveID,
        curveInside: characteristics.curveInside,
        curveOutside: characteristics.curveOutside,
        meterIDs: meterList.map(item => item.ID),
        assetIDs: assetList.map(item => item.ID),
        groupIDs: groupList.map(item => item.ID),
        locationIDs: locationList.map(item => item.ID),
        numberResults
    };
}
