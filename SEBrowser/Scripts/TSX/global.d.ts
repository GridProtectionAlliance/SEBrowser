//******************************************************************************************************
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
    }
    interface State<T> {
        Status: SEBrowser.Status,
        Data: T[],
        Error: null | string,
        SortField: keyof T,
        Ascending: boolean,
        Record?: T,
        SearchText?: string
    }

    interface EventSearchState extends Redux.State<OpenXDA.Event> {
        TimeRange: SEBrowser.IReportTimeFilter,
        EventType: SEBrowser.IEventTypeFilters,
        EventCharacteristic: SEBrowser.IEventCharacteristicFilters
    }

} 
export namespace SEBrowser {
    type Status = 'loading' | 'idle' | 'error' | 'changed' | 'unitiated';
    interface State { tab?: string, startTime?: string, endTime?: string, context?: string, meterGroup?: number }
    interface EventPreviewPaneSetting { ID: number, Name: string, Show: boolean, OrderBy: number }
    interface IReportTimeFilter { date: string, time: string, windowSize: number, timeWindowUnits: number }
    interface IEventCharacteristicFilters { durationMin: number, durationMax: number, Phase: { A: boolean, B: boolean, C: boolean } }
    interface IEventTypeFilters { faults: boolean, sags: boolean, swells: boolean, interruptions: boolean, breakerOps: boolean, transients: boolean, relayTCE: boolean, others: boolean}
}

export namespace OpenXDA {
    interface Event { EventID: number, FileStartTime: string, MeterName: string, AssetName: string, AssetType: AssetTypeName, VoltageClass: string, BreakerOperation: boolean, DurationSeconds:number, PerUnitMagnitude: number, EventType: string }

    type AssetTypeName = 'Line' | 'Breaker' | 'Transformer' | 'CapacitorBank' | 'Bus';
    type EventTypeName = 'Fault' | 'RecloseIntoFault' | 'BreakerOpen' | 'Interruption' | 'Sag' | 'Swell' | 'Transient' | 'Other' | 'Test' | 'Breaker' | 'Snapshot';

}

