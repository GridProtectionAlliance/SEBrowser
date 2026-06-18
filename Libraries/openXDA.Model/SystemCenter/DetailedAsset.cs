//******************************************************************************************************
//  DetailedAsset.cs - Gbtc
//
//  Copyright © 2021, Grid Protection Alliance.  All Rights Reserved.
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
//  10/22/2021 - C. Lackner
//       Generated original version of source code.
//
//******************************************************************************************************

using Gemstone.Configuration;
using Gemstone.Data;
using Gemstone.Data.Model;

namespace SystemCenter.Model
{
    public class DetailedAsset
    {
        [PrimaryKey(true)]
        public int ID { get; set; }

        [DefaultSortOrder]
        public string AssetKey { get; set; }
        public string AssetName { get; set; }
        public double VoltageKV { get; set; }
        public string AssetType { get; set; }
        public int Meters { get; set; }
        public int Locations { get; set; }

        // The frontend prefixes any user-defined Additional Field filter with "AdditionalField.", so this matches that prefix, strips
        // it back to the real field name, and resolves the value through the AdditionalFieldSearch view.
        [SearchExtension(@"^AdditionalField\.")]
        public static RecordRestriction GetAdditionalFieldRestriction(IRecordFilter filter)
        {
            string fieldName = filter.FieldName["AdditionalField.".Length..];

            TableOperations<DetailedAsset> tableOps = new(new AdoDataConnection(Settings.Default));
            if (RecordFilter<DetailedAsset>.WildCardOperators.Contains(filter.Operator, StringComparer.OrdinalIgnoreCase) && filter.SearchParameter is string stringVal)
                filter.SearchParameter = stringVal.Replace("*", tableOps.WildcardChar);

            return new RecordRestriction(
                $"ID IN (SELECT ParentTableID FROM AdditionalFieldSearch WHERE ParentTable IN ('Line', 'Transformer', 'Breaker', 'CapBank', 'Bus', 'Generation', 'StationAux', 'StationBattery') AND FieldName = {{0}} AND Value {filter.Operator} {{1}})",
                fieldName, filter.SearchParameter);
        }

        [SearchExtension("^Meter$")]
        public static RecordRestriction GetMeterRestriction(IRecordFilter filter)
        {
            TableOperations<DetailedAsset> tableOps = new(new AdoDataConnection(Settings.Default));
            if (RecordFilter<DetailedAsset>.WildCardOperators.Contains(filter.Operator, StringComparer.OrdinalIgnoreCase) && filter.SearchParameter is string stringVal)
                filter.SearchParameter = stringVal.Replace("*", tableOps.WildcardChar);

            return new RecordRestriction(
                $"ID IN (SELECT MeterAsset.AssetID FROM Meter JOIN MeterAsset ON Meter.ID = MeterAsset.MeterID WHERE Meter.AssetKey {filter.Operator} {{0}})",
                filter.SearchParameter);
        }

        [SearchExtension("^Location$")]
        public static RecordRestriction GetLocationRestriction(IRecordFilter filter)
        {
            TableOperations<DetailedAsset> tableOps = new(new AdoDataConnection(Settings.Default));
            if (RecordFilter<DetailedAsset>.WildCardOperators.Contains(filter.Operator, StringComparer.OrdinalIgnoreCase) && filter.SearchParameter is string stringVal)
                filter.SearchParameter = stringVal.Replace("*", tableOps.WildcardChar);

            return new RecordRestriction(
                $"ID IN (SELECT AssetLocation.AssetID FROM Location JOIN AssetLocation ON AssetLocation.LocationID = Location.ID WHERE Location.LocationKey {filter.Operator} {{0}})",
                filter.SearchParameter);
        }
    }
}
