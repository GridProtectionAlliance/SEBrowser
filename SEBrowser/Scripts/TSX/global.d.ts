﻿//******************************************************************************************************
//  global.d.ts - Gbtc
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
//  02/19/2020 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************
import { SystemCenter } from '@gpa-gemstone/application-typings';
import { IGenericSliceState } from '@gpa-gemstone/react-interactive';

declare global {
    var homePath: string;
    var xdaInstance: string;
    var scInstance: string;
    var openSEEInstance: string;
    var faultLocationInstance: string;
    var controllerViewPath: string;
    var version: string;

    namespace queryString {
        function parse(str: string, opts?: object): object
        function stringify(obj: object, opts?: object): object

    }
}



export namespace Redux {
    interface StoreState {
        EventSearch: EventSearchState,
        MagDurCurve: IGenericSliceState<SEBrowser.MagDurCurve>,
        Meter: IGenericSliceState<OpenXDA.Meter>,
        Asset: IGenericSliceState<OpenXDA.Asset>,
        AssetGroup: IGenericSliceState<OpenXDA.AssetGroup>,
        DetailedMeter: IGenericSliceState<SystemCenter.Types.DetailedMeter>,
        DetailedAsset: IGenericSliceState<SystemCenter.Types.DetailedAsset>,
        DetailedLocation: IGenericSliceState<SystemCenter.Types.DetailedLocation>,
        Location: IGenericSliceState<OpenXDA.Location>
    }

    interface State<T> {
        Status: SEBrowser.Status,
        Data: T[],
        Error: null | string,
        SortField: keyof T,
        Ascending: boolean,
        Record?: T,
    }

    interface EventSearchState extends Redux.State<any> {
        TimeRange: SEBrowser.IReportTimeFilter,
        EventType: SEBrowser.IEventTypeFilters,
        EventCharacteristic: SEBrowser.IEventCharacteristicFilters,
        SelectedMeters: OpenXDA.Meter[],
        SelectedAssets: OpenXDA.Asset[],
        SelectedStations: OpenXDA.Location[],
        SelectedGroups: OpenXDA.AssetGroup[],
        SelectedDetailedMeters: SystemCenter.Types.DetailedMeter[],
        SelectedDetailedAssets: SystemCenter.Types.DetailedAsset[],
        SelectedDetailedStations: SystemCenter.Types.DetailedLocation[],
        isReset: boolean
    }

} 
export namespace SEBrowser {
    type Status = 'loading' | 'idle' | 'error' | 'changed' | 'unitiated';
    interface State { tab?: string, startTime?: string, endTime?: string, context?: string, meterGroup?: number }
    interface EventPreviewPaneSetting { ID: number, Name: string, Show: boolean, OrderBy: number }
    interface IReportTimeFilter { date: string, time: string, windowSize: number, timeWindowUnits: number }
    interface IEventCharacteristicFilters {
        durationMin: number, durationMax: number,
        Phase: { A: boolean, B: boolean, C: boolean },
        transientMin: number, transientMax: number, transientType: ('LL'|'LN'|'both'),            
        sagMin: number, sagMax: number, sagType: ('LL' | 'LN' | 'both'),
        swellMin: number, swellMax: number, swellType: ('LL' | 'LN' | 'both'),
        curveID: number, curveInside: boolean, curveOutside: boolean
    }
    interface IEventTypeFilters { faults: boolean, sags: boolean, swells: boolean, interruptions: boolean, breakerOps: boolean, transients: boolean, relayTCE: boolean, others: boolean}
    interface MagDurCurve { ID: number, Name: string, XHigh: number, XLow: number, YHigh: number, YLow: number, UpperCurve: string, LowerCurve: string, Area: string }
}

export namespace OpenXDA {
    type AssetTypeName = 'Line' | 'Breaker' | 'Transformer' | 'CapacitorBank' | 'Bus';
    type EventTypeName = 'Fault' | 'RecloseIntoFault' | 'BreakerOpen' | 'Interruption' | 'Sag' | 'Swell' | 'Transient' | 'Other' | 'Test' | 'Breaker' | 'Snapshot';
    interface Asset { ID: number, AssetKey: string, AssetName: string, AssetType: string, VoltageKV: number, Meters: number, Locations: string }
    interface Meter { ID: number, AssetKey: string, Name: string, Location: string, MappedAssets: number, Make: string, Model: string }
    interface AssetGroup { ID: number, Name: string, DisplayDashboard: boolean, AssetGroups: number, Meters: number, Assets: number, Users: number }
    interface Location { ID: number, LocationKey: string, Name: string, Assets: number, Meters: number }
}

