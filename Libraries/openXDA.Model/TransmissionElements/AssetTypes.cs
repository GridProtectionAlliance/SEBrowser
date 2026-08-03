//******************************************************************************************************
//  AssetTypes.cs - Gbtc
//
//  Copyright © 2019, Grid Protection Alliance.  All Rights Reserved.
//
//  Licensed to the Grid Protection Alliance (GPA) under one or more contributor license agreements. See
//  the NOTICE file distributed with this work for additional information regarding copyright ownership.
//  The GPA licenses this file to you under the MIT License (MIT), the "License"; you may
//  not use this file except in compliance with the License. You may obtain a copy of the License at:
//
//      http://opensource.org/licenses/MIT
//
//  Unless agreed to in writing, the subject software distributed under the License is distributed on an
//  "AS-IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. Refer to the
//  License for the specific language governing permissions and limitations.
//
//  Code Modification History:
//  ----------------------------------------------------------------------------------------------------
//  12/24/2019 - C. Lackner
//       Generated original version of source code.
//
//******************************************************************************************************

using System.ComponentModel.DataAnnotations;
using Gemstone.Data.Model;

namespace openXDA.Model
{
    public enum AssetType
    {
        Line = 1,
        Bus = 2,
        Breaker = 3,
        CapacitorBank = 4,
        LineSegement = 5,
        Transformer = 6,
        CapBankRelay = 7,
        DER = 8,
        StationAux = 9,
        StationBattery = 10,
        Generation = 11
    }

    [TableName("AssetType")]
    public class AssetTypes
    {
        [PrimaryKey(true)]
        public int ID { get; set; }

        [StringLength(50)]
        [DefaultSortOrder]
        public string Name { get; set; }

        [StringLength(250)]
        public string Description { get; set; }
    }
}
