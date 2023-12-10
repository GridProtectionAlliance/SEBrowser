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
import { SystemCenter, OpenXDA as XDA } from '@gpa-gemstone/application-typings';
import { IGenericSliceState } from '@gpa-gemstone/react-interactive';

declare global {
    let homePath: string;
    let xdaInstance: string;
    let scInstance: string;
    let openSEEInstance: string;
    let faultLocationInstance: string;
    let controllerViewPath: string;
    let version: string;

    namespace queryString {
        function parse(str: string, opts?: object): object
        function stringify(obj: object, opts?: object): object

    }

}

//Todo: Move to gemstone?
export interface IMultiCheckboxOption {
    Value: number | string,
    Text: string,
    Selected: boolean
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
        EventNote: IGenericSliceState<XDA.Types.Note>,
        MeterNote: IGenericSliceState<XDA.Types.Note>,
        AssetNote: IGenericSliceState<XDA.Types.Note>,
        LocationNote: IGenericSliceState<XDA.Types.Note>,
        Phase: IGenericSliceState<XDA.Types.Phase>,
        ChannelGroup: IGenericSliceState<SEBrowser.ChannelGroup>
    }

    interface State<T> {
        Status: SEBrowser.Status,
        Data: T[],
        Error: null | string,
        SortField: string,
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
        trendData: ITrendDataSettings,
        timeZone: string,
        DateTimeSetting: SEBrowser.TimeWindowMode
    }

    interface IEventSearchSettings {
        NumberResults: number,
        WidgetCategories: SEBrowser.IWidgetCategory[],
        AggregateMagDur: boolean
    }

    interface ITrendDataSettings {
        BorderPlots: boolean,
        InsertAtStart: boolean,
        MarkerSnapping: boolean,
        StartWithOptionsClosed: boolean,
        MoveOptionsLeft: boolean,
        LegendDisplay: 'bottom' | 'right' | 'hidden'
    }
}
export namespace SEBrowser {
    type Status = 'loading' | 'idle' | 'error' | 'changed' | 'unitiated';
    type TimeWindowMode =   'center' | 'startWindow' | 'endWindow' | 'startEnd';
      
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
    interface IWidgetCategory { ID: number, Name: string, OrderBy: number }
}

export namespace TrendSearch {
    interface ChannelGroup {
        ID: number,
        Name: string,
        Description: string
    }

    interface ITrendChannel {
        ID: number,
        Name: string,
        Description: string,
        AssetID: number,
        AssetKey: string,
        AssetName: string,
        MeterID: number,
        MeterKey: string,
        MeterName: string,
        MeterShortName: string,
        Phase: string,
        ChannelGroup: string,
        ChannelGroupType: string,
        Unit: string
    }

    interface IPQData {
        ChannelID: string,
        Points: {
            Tag: string,
            Minimum: number,
            Maximum: number,
            Average: number,
            QualityFlags: number,
            Timestamp: string
        }[]
    }

    interface ICyclicData {
        ChannelID: string,
        BinSize: number,
        TimeSpanMs: number,
        Points: [string, number, number][]
    }

    type IPlotTypes = 'Line'|'Cyclic';

    interface ITrendPlot {
        // Represents Data Needed by Outer
        TimeFilter: SEBrowser.IReportTimeFilter,
        Type: IPlotTypes,
        Channels: SEBrowser.ITrendChannel[],
        PlotFilter: IMultiCheckboxOption[],
        ID: string,
        // Represents Non-default Data
        Title?: string,
        XAxisLabel?: string,
        YLeftLabel?: string,
        YRightLabel?: string,
        Metric?: boolean,
        Width?: number,
        Height?: number,
        ShowEvents?: boolean,
        AxisZoom?: 'Rect' | 'AutoValue' | 'HalfAutoValue',
        DefaultZoom?: [number, number][]
    }

    type LineStyles = ":" | "-";

    interface IMarker {
        ID: string,
        axis: 'right' | 'left',
        color: string
    }

    interface ISymbolic extends IMarker {
        // Symbolic marker
        format: string,
        symbol: JSX.Element,
        xPos: number,
        yPos: number,
        radius: number,
        // Infobox
        note: string,
        xBox: number,
        yBox: number,
        opacity: number,
        fontColor: string,
        fontSize: number
    }

    interface IVertHori extends IMarker {
        isHori: boolean,
        value: number,
        width: number,
        line: LineStyles
    }

    // Properties of indivdual events
    interface IEventMarker {
        value: number,
        meterID: number,
        eventID: number
    }

    // Settings that will apply to all event markers
    interface IEventSymbolicSettings extends IMarker {
        type: "symbolic",
        symbol: JSX.Element,
        alignTop: boolean,
    }

    interface IEventVertSettings extends IMarker {
        type: "vertical",
        width: number,
        line: LineStyles
    }

    type EventMarkerSettings = IEventSymbolicSettings | IEventVertSettings;
}

export namespace OpenXDA {
    type AssetTypeName = 'Line' | 'Breaker' | 'Transformer' | 'CapacitorBank' | 'Bus';
    type EventTypeName = 'Fault' | 'RecloseIntoFault' | 'BreakerOpen' | 'Interruption' | 'Sag' | 'Swell' | 'Transient' | 'Other' | 'Test' | 'Breaker' | 'Snapshot';
}