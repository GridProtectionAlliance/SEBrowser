//******************************************************************************************************
//  HelperFunctions.ts - Gbtc
//
//  Copyright © 2023, Grid Protection Alliance.  All Rights Reserved.
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
//  08/14/25 - Gabriel Santos
//       Generated original version of source code.
//
//******************************************************************************************************

import { TrendSearch } from '../../Global';

// Returns an array of booleans telling which components are common to all channels
export function findCommonComponents(components: string[], channels: TrendSearch.ITrendChannel[]): boolean[] {
    const allCommon: boolean[] = [];
    components.forEach(component => {
        const parts = component.split('.');
        if (parts.length !== 2) allCommon.push(false);
        else if ('series'.localeCompare(parts[0], undefined, { sensitivity: 'base' }) === 0)
            allCommon.push(
                !channels
                    .some((channel) => channel.Series.some(series => series?.[parts[1]] !== channels[0].Series?.[0]?.[parts[1]]))
            );
        else if ('channel'.localeCompare(parts[0], undefined, { sensitivity: 'base' }) === 0)
            allCommon.push(
                !channels
                    .some((channel) => channel?.[parts[1]] !== channels[0]?.[parts[1]])
            );
        else allCommon.push(false);
    });
    return allCommon;
}
