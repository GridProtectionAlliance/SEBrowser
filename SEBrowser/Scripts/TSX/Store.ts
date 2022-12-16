//******************************************************************************************************
//  Store.ts - Gbtc
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
//  09/09/2020 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import { SystemCenter, OpenXDA } from '@gpa-gemstone/application-typings';
import { GenericSlice } from '@gpa-gemstone/react-interactive';
import { configureStore } from '@reduxjs/toolkit';
import NoteSlice from './Components/EventSearch/EventNoteSlice';
import EventSearchReducer from './Components/EventSearch/EventSearchSlice';
import { SettingsSlice } from './Components/EventSearch/EventSearchSettingsSlice';
import { SEBrowser,  } from './global';

declare var homePath: string;

//Dispatch and Selector Typed
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>

export const MagDurCurveSlice = new GenericSlice<SEBrowser.MagDurCurve>('MagDurCurve', `${homePath}api/StandardMagDurCurve`, 'Name');
export const AssetGroupSlice = new GenericSlice<OpenXDA.Types.AssetGroup>('AssetGroup', `${homePath}api/openXDA/AssetGroup`, 'Name');

export const MeterSlice = new GenericSlice<SystemCenter.Types.DetailedMeter>("Meter", `${homePath}api/OpenXDA/Meter`, "Name", true);
export const AssetSlice = new GenericSlice<SystemCenter.Types.DetailedAsset>("Asset", `${homePath}api/OpenXDA/Asset`, "AssetName", true);
export const LocationSlice = new GenericSlice<SystemCenter.Types.DetailedLocation>("Location", `${homePath}api/OpenXDA/Location`, "LocationKey", true);


export const EventNoteSlice = new NoteSlice();

const reducer = {
    EventSearch: EventSearchReducer,
    MagDurCurve: MagDurCurveSlice.Reducer,
    Meter: MeterSlice.Reducer,
    Asset: AssetSlice.Reducer,
    AssetGroup: AssetGroupSlice.Reducer,
    Location: LocationSlice.Reducer,
    EventNote: EventNoteSlice.Reducer,
    Settings: SettingsSlice.reducer,
}

const store = configureStore({ reducer });
export default store;
