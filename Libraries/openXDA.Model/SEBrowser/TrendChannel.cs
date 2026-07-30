//******************************************************************************************************
//  TrendChannel.cs - Gbtc
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
//  07/31/2025 - G. Santos
//       Generated original version of source code.
//
//******************************************************************************************************

using Gemstone.Data.Model;

namespace SEBrowser.Model
{
    public class TrendChannel
    {
        [PrimaryKey(true)]
        public string ID { get; set; }
        public int ChannelID { get; set; }
        [DefaultSortOrder]
        public string Name { get; set; }
        public string Description { get; set; }
        public int AssetID { get; set; }
        public string AssetKey { get; set; }
        public string AssetName { get; set; }
        public int MeterID { get; set; }
        public string MeterKey { get; set; }
        public string MeterName { get; set; }
        public string MeterShortName { get; set; }
        public string Phase { get; set; }
        public string ChannelGroup { get; set; }
        public string ChannelGroupType { get; set; }
        public string Unit { get; set; }
    }
}
