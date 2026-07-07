//******************************************************************************************************
//  SearchRestrictionHelper.cs - Gbtc
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
//  07/07/2026 - P. Crawford
//       Generated original version of source code.
//
//******************************************************************************************************

using Gemstone.Data.Model;

namespace openXDA.Model
{
    internal static class SearchRestrictionHelper
    {
        // IN / NOT IN filters carry an array SearchParameter that must expand to one placeholder per element;
        // a single placeholder cannot bind an array.
        internal static RecordRestriction GetSearchRestriction(string fieldExpression, IRecordFilter filter, int parameterOffset = 0)
        {
            if (!string.Equals(filter.Operator, "IN", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(filter.Operator, "NOT IN", StringComparison.OrdinalIgnoreCase))
                return new RecordRestriction($"{fieldExpression} {filter.Operator} {{{parameterOffset}}}", filter.SearchParameter);

            object[] parameters = GetSearchParameters(filter.SearchParameter).ToArray();
            string placeholders = string.Join(", ", parameters.Select((_, index) => $"{{{index + parameterOffset}}}"));

            return new RecordRestriction($"{fieldExpression} {filter.Operator} ({placeholders})", parameters);
        }

        private static IEnumerable<object> GetSearchParameters(object searchParameter)
        {
            if (searchParameter is string searchText)
                return searchText.Trim('(', ')').Split(',').Select(value => (object)value.Trim());

            if (searchParameter is System.Collections.IEnumerable parameters)
                return parameters.Cast<object>();

            return [searchParameter];
        }
    }
}
