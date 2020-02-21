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

    namespace moment {
        function utc(timestamp: string): any;
    }
    function moment(inp?: any, format?: any, strict?: boolean): any;
    function moment(inp?: any, format?: any, language?: string, strict?: boolean): any;

    namespace queryString {
        function parse(str: string, opts?: object): object
        function stringify(obj: object, opts?: object): object

    }
}


export namespace SEBrowser {
    interface State { tab?: string, startTime?: string, endTime?: string, context?: string, meterGroup?: number }
}

export namespace OpenXDA {
    interface Event { EventID: number, FileStartTime: string, AssetName: string, AssetType: AssetTypeName, VoltageClass: string, EventType: string, BreakerOperation: boolean }

    type AssetTypeName = 'Line' | 'Breaker' | 'Transformer' | 'CapacitorBank' | 'Bus';
}

