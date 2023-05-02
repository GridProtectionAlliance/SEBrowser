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
import { Application, SystemCenter, OpenXDA as XDA } from '@gpa-gemstone/application-typings';
import { IGenericSlice } from '@gpa-gemstone/common-pages/lib/SliceInterfaces';
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
        Meter: IGenericSliceState<SystemCenter.Types.DetailedMeter>,
        Asset: IGenericSliceState<SystemCenter.Types.DetailedAsset>,
        AssetGroup: IGenericSliceState<XDA.Types.AssetGroup>,
        Location: IGenericSliceState<SystemCenter.Types.DetailedLocation>,
        Settings: SettingsState,
        EventType: IGenericSliceState<SEBrowser.EventType>,
        EventNote: NoteState,
        MeterNote: NoteState,
        AssetNote: NoteState,
        LocationNote: NoteState,
    }


    interface NoteState {
        Status: Application.Types.Status,
        Data: OpenXDA.Types.Note[],
        SortField: keyof OpenXDA.Types.Note,
        Ascending: boolean,
        ParentID: (number | null),
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
        EventType: number[],
        EventCharacteristic: SEBrowser.IEventCharacteristicFilters,
        SelectedMeters: SystemCenter.Types.DetailedMeter[],
        SelectedAssets: SystemCenter.Types.DetailedAsset[],
        SelectedStations: SystemCenter.Types.DetailedLocation[],
        SelectedGroups: XDA.Types.AssetGroup[],
        isReset: boolean,
        ActiveFetchID: string[]
    }

 
    interface SettingsState {
        eventSearch: IEventSearchSettings,
        timeZone: string
    }

    interface IEventSearchSettings {
        NumberResults: number,
        WidgetCategories: SEBrowser.IWidgetCategory[]
    }
}
export namespace SEBrowser {
    type Status = 'loading' | 'idle' | 'error' | 'changed' | 'unitiated';
    interface State { tab?: string, startTime?: string, endTime?: string, context?: string, meterGroup?: number }
    interface EventPreviewPaneSetting { ID: number, Name: string, Show: boolean, OrderBy: number }
    interface IReportTimeFilter { date: string, time: string, windowSize: number, timeWindowUnits: number }
    interface IPhaseFilters { AN: boolean, BN: boolean, CN: boolean, AB: boolean, BC: boolean, CA: boolean, ABG: boolean, BCG: boolean, ABC: boolean, ABCG: boolean }
    interface IEventCharacteristicFilters {
        durationMin: number, durationMax: number,
        phases: IPhaseFilters,
        transientMin?: number, transientMax?: number, transientType: ('LL'|'LN'|'both'),
        sagMin?: number, sagMax?: number, sagType: ('LL' | 'LN' | 'both'),
        swellMin?: number, swellMax?: number, swellType: ('LL' | 'LN' | 'both'),
        curveID: number, curveInside: boolean, curveOutside: boolean
    }
    
    interface MagDurCurve { ID: number, Name: string, XHigh: number, XLow: number, YHigh: number, YLow: number, UpperCurve: string, LowerCurve: string, Area: string }

    interface EventNote extends XDA.Types.Note {
        EventIDs: number[],
        IDs: number[],
        NumEvents: number
    }

    // Temporary until next gpa-gemstone update
    interface EventType extends XDA.Types.EventType { ShowInFilter: boolean, Category?: string, Name: string }

    interface IWidget<T> {
        eventID: number,
        setting?: T,
        width?: number,
        maxHeight?: number,
        disturbanceID?: number,
        faultID?: number,
        startTime?: number
    }

    interface IWidgetCategory { ID: number, Name: string, OrderBy: number }

    interface IWidgetView { ID: number, CategoryID: number, Name: string, setting: object, Enabled: boolean }
}

export namespace OpenXDA {
    type AssetTypeName = 'Line' | 'Breaker' | 'Transformer' | 'CapacitorBank' | 'Bus';
    type EventTypeName = 'Fault' | 'RecloseIntoFault' | 'BreakerOpen' | 'Interruption' | 'Sag' | 'Swell' | 'Transient' | 'Other' | 'Test' | 'Breaker' | 'Snapshot';
}


