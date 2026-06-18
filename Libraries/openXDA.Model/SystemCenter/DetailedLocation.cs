//******************************************************************************************************
//  DetailedLocation.cs - Gbtc
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

namespace SystemCenter.Model;

[PostRoles("Administrator, Transmission SME")]
public class DetailedLocation
{
    [PrimaryKey(true)]
    public int ID { get; set; }

    [DefaultSortOrder]
    public string LocationKey { get; set; }

    public string Name { get; set; }

    public string Alias { get; set; }

    public string ShortName { get; set; }

    public double Longitude { get; set; }

    public double Latitude { get; set; }

    public string Description { get; set; }

    public int Meters { get; set; }

    public int Assets { get; set; }

    // The frontend prefixes any user-defined Additional Field filter with "AdditionalField.", so this matches that prefix, strips
    // it back to the real field name, and resolves the value through the AdditionalFieldSearch view.
    [SearchExtension(@"^AdditionalField\.")]
    public static RecordRestriction GetAdditionalFieldRestriction(IRecordFilter filter)
    {
        string fieldName = filter.FieldName["AdditionalField.".Length..];

        TableOperations<DetailedLocation> tableOps = new(new AdoDataConnection(Settings.Default));
        if (RecordFilter<DetailedLocation>.WildCardOperators.Contains(filter.Operator, StringComparer.OrdinalIgnoreCase) && filter.SearchParameter is string stringVal)
            filter.SearchParameter = stringVal.Replace("*", tableOps.WildcardChar);

        return new RecordRestriction(
            $"ID IN (SELECT ParentTableID FROM AdditionalFieldSearch WHERE ParentTable = 'Location' AND FieldName = {{0}} AND Value {filter.Operator} {{1}})",
            fieldName, filter.SearchParameter);
    }

    [SearchExtension("^Meter$")]
    public static RecordRestriction GetMeterRestriction(IRecordFilter filter)
    {
        TableOperations<DetailedLocation> tableOps = new(new AdoDataConnection(Settings.Default));
        if (RecordFilter<DetailedLocation>.WildCardOperators.Contains(filter.Operator, StringComparer.OrdinalIgnoreCase) && filter.SearchParameter is string stringVal)
            filter.SearchParameter = stringVal.Replace("*", tableOps.WildcardChar);

        return new RecordRestriction(
            $"ID IN (SELECT Meter.LocationID FROM Meter WHERE Meter.AssetKey {filter.Operator} {{0}})",
            filter.SearchParameter);
    }

    [SearchExtension("^Asset$")]
    public static RecordRestriction GetAssetRestriction(IRecordFilter filter)
    {
        TableOperations<DetailedLocation> tableOps = new(new AdoDataConnection(Settings.Default));
        if (RecordFilter<DetailedLocation>.WildCardOperators.Contains(filter.Operator, StringComparer.OrdinalIgnoreCase) && filter.SearchParameter is string stringVal)
            filter.SearchParameter = stringVal.Replace("*", tableOps.WildcardChar);

        return new RecordRestriction(
            $"ID IN (SELECT AssetLocation.LocationID FROM Asset JOIN AssetLocation ON AssetLocation.AssetID = Asset.ID WHERE Asset.AssetKey {filter.Operator} {{0}})",
            filter.SearchParameter);
    }
}
