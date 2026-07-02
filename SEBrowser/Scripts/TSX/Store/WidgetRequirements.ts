//******************************************************************************************************
//  WidgetRequirements.ts - Gbtc
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
//  07/02/2026 - Preston Crawford
//       Generated original version of source code.
//
//******************************************************************************************************

export enum ResourceAccessType {
    Create = 0,
    Read = 1,
    Update = 2,
    Delete = 3
}

export interface IResourceAccessEntry {
    ResourceType: string,
    ResourceName: string,
    Access: ResourceAccessType
}

const noteControllers = ['OpenXDAEventNote', 'OpenXDAMeterNote', 'OpenXDAAssetNote', 'OpenXDALocationNote'];

const noteResources = (access: ResourceAccessType): IResourceAccessEntry[] => noteControllers.map((name) => ({ ResourceType: 'Controller', ResourceName: name, Access: access }));

// Resources required for each named widget permission. A permission is granted
// only if the user has access to every resource in its list.
export const WidgetRequirements = {
    Notes: {
        Add: noteResources(ResourceAccessType.Create),
        Edit: noteResources(ResourceAccessType.Update)
    }
};
