//******************************************************************************************************
//  DetailedMeter.cs - Gbtc
//
//  Copyright © 2019, Grid Protection Alliance.  All Rights Reserved.
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
//  08/01/2020 - C. Lackner
//       Generated original version of source code.
//
//******************************************************************************************************

using Gemstone.Configuration;
using Gemstone.Data;
using Gemstone.Data.Model;

namespace SystemCenter.Model
{
    public class DetailedMeter
    {
        [PrimaryKey(true)]
        public int ID { get; set; }

        [DefaultSortOrder]
        public string AssetKey { get; set; }

        public string Name { get; set; }

        public string Location { get; set; }

        public int MappedAssets { get; set; }

        public string Make { get; set; }

        public string Model { get; set; }

        // The frontend prefixes any user-defined Additional Field filter with "AdditionalField.", so this matches that prefix, strips
        // it back to the real field name, and resolves the value through the AdditionalFieldSearch view.
        [SearchExtension(@"^AdditionalField\.")]
        public static RecordRestriction GetAdditionalFieldRestriction(IRecordFilter filter)
        {
            string fieldName = filter.FieldName["AdditionalField.".Length..];

            TableOperations<DetailedMeter> tableOps = new(new AdoDataConnection(Settings.Default));
            if (RecordFilter<DetailedMeter>.WildCardOperators.Contains(filter.Operator, StringComparer.OrdinalIgnoreCase) && filter.SearchParameter is string stringVal)
                filter.SearchParameter = stringVal.Replace("*", tableOps.WildcardChar);

            return new RecordRestriction(
                $"ID IN (SELECT ParentTableID FROM AdditionalFieldSearch WHERE ParentTable = 'Meter' AND FieldName = {{0}} AND Value {filter.Operator} {{1}})",
                fieldName, filter.SearchParameter);
        }
    }
}
