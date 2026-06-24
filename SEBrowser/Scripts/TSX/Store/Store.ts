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
import { ReadWriteGenericSlice_Gemstone } from "@gpa-gemstone/common-pages";
import { configureStore } from '@reduxjs/toolkit';
import EventSearchReducer from './EventSearchSlice';
import { SettingsReducer } from './SettingsSlice';
import GroupSlice from './ValueListGroupSlice'
import { TrendSearch } from '../global';
import { EventTypeControllerPath } from './ControllerFunctions';

//Dispatch and Selector Typed
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>

export const EventTypeSlice = new ReadWriteGenericSlice_Gemstone<OpenXDA.Types.EventType>("EventType", "Category", true, EventTypeControllerPath);

export const ValueListGroupSlice = new GroupSlice();

const reducer = {
    EventSearch: EventSearchReducer,
    Settings: SettingsReducer,
    EventType: EventTypeSlice.Reducer,
    ValueList: ValueListGroupSlice.Reducer
}

const store = configureStore({ reducer });
export default store;