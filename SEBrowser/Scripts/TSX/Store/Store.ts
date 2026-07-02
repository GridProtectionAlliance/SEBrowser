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

import { OpenXDA, SystemCenter } from '@gpa-gemstone/application-typings';
import { ReadOnlyGenericSlice_Gemstone } from "@gpa-gemstone/common-pages";
import { configureStore } from '@reduxjs/toolkit';
import EventSearchReducer from './EventSearchSlice';
import { SettingsReducer } from './SettingsSlice';
import GroupSlice from './ValueListGroupSlice'
import { EventTypeControllerPath, MeterController, AssetController, LocationController, AssetGroupController } from './ControllerFunctions';

//Dispatch and Selector Typed
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>

export const EventTypeSlice = new ReadOnlyGenericSlice_Gemstone<OpenXDA.Types.EventType>("EventType", "Category", true, EventTypeControllerPath);
export const MeterSlice = new ReadOnlyGenericSlice_Gemstone<SystemCenter.Types.DetailedMeter>("Meter", "Name", true, MeterController);
export const AssetSlice = new ReadOnlyGenericSlice_Gemstone<SystemCenter.Types.DetailedAsset>("Asset", "AssetName", true, AssetController);
export const LocationSlice = new ReadOnlyGenericSlice_Gemstone<SystemCenter.Types.DetailedLocation>("Location", "LocationKey", true, LocationController);
export const AssetGroupSlice = new ReadOnlyGenericSlice_Gemstone<OpenXDA.Types.AssetGroup>("AssetGroup", "Name", true, AssetGroupController);
export const ValueListGroupSlice = new GroupSlice();

const reducer = {
    EventSearch: EventSearchReducer,
    Settings: SettingsReducer,
    EventType: EventTypeSlice.Reducer,
    Meter: MeterSlice.Reducer,
    Asset: AssetSlice.Reducer,
    Location: LocationSlice.Reducer,
    AssetGroup: AssetGroupSlice.Reducer,
    ValueList: ValueListGroupSlice.Reducer
}

const store = configureStore({ reducer });
export default store;