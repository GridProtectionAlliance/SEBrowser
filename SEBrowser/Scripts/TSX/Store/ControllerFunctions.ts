//******************************************************************************************************
//  ControllerFunctions.ts - Gbtc
//
//  Copyright © 2026, Grid Protection Alliance.  All Rights Reserved.
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
//  06/19/2026 - P. Crawford
//       Generated original version of source code.
//
//******************************************************************************************************

import { SystemCenter, OpenXDA } from '@gpa-gemstone/application-typings';
import { ReadOnlyControllerFunctions_Gemstone } from '@gpa-gemstone/common-pages';
import { TrendSearch } from '../global';

declare let homePath: string;

// Controller API paths
export const MeterControllerPath = `${homePath}api/OpenXDA/Meter`;
export const AssetControllerPath = `${homePath}api/OpenXDA/Asset`;
export const EventTypeControllerPath = `${homePath}api/OpenXDA/EventType`;
export const LocationControlerPath = `${homePath}api/OpenXDA/Location`;
export const AssetGroupControllerPath = `${homePath}api/openXDA/AssetGroup`;
export const PhaseControllerPath = `${homePath}api/OpenXDA/Phase`;
export const ChannelGroupControllerPath = `${homePath}api/openXDA/ChannelGroup`;

// Shared read-only controllers - instantiated once here and reused across the app
export const MeterController = new ReadOnlyControllerFunctions_Gemstone<SystemCenter.Types.DetailedMeter>(MeterControllerPath);
export const AssetController = new ReadOnlyControllerFunctions_Gemstone<SystemCenter.Types.DetailedAsset>(AssetControllerPath);
export const LocationController = new ReadOnlyControllerFunctions_Gemstone<SystemCenter.Types.DetailedLocation>(LocationControlerPath);
export const AssetGroupController = new ReadOnlyControllerFunctions_Gemstone<OpenXDA.Types.AssetGroup>(AssetGroupControllerPath);
export const EventTypeController = new ReadOnlyControllerFunctions_Gemstone<OpenXDA.Types.EventType>(EventTypeControllerPath);
export const PhaseController = new ReadOnlyControllerFunctions_Gemstone<OpenXDA.Types.Phase>(PhaseControllerPath);
export const ChannelGroupController = new ReadOnlyControllerFunctions_Gemstone<TrendSearch.ChannelGroup>(ChannelGroupControllerPath);
