//******************************************************************************************************
//  ModelControlers.cs - Gbtc
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
//  10/05/2021 - C. Lackner
//       Generated original version of source code.
//
//******************************************************************************************************

using GSF.Data;
using GSF.Data.Model;
using GSF.Identity;
using GSF.Web.Model;
using openXDA.Model;
using SystemCenter.Model;
using System;
using System.Collections.Generic;
using System.Data;
using System.Net;
using System.Web.Http;
using System.Linq;
using SEBrowser.Model;

namespace SEBrowser.Controllers.OpenXDA
{
    [RoutePrefix("api/openXDA/AssetGroup")]
    public class OpenXDAAssetGroupController : ModelController<AssetGroupView> { }

    [RoutePrefix("api/openXDA/EventType")]
    public class EventTypeController : ModelController<EventType> { }

    [RoutePrefix("api/openXDA/Asset")]
    public class OpenXDAAssetController : DetailedAssetController<DetailedAsset> { }

    [RoutePrefix("api/openXDA/Meter")]
    public class OpenXDAMeterController : ModelController<DetailedMeter> { }

    [RoutePrefix("api/openXDA/Location")]
    public class OpenXDALocationController : DetailedLocationController<DetailedLocation> { }

    [RoutePrefix("api/openXDA/Widget")]
    public class WidgetController : ModelController<Widget> { }

    [RoutePrefix("api/OpenXDA/WidgetCategory")]
    public class WidgetCategoryController : ModelController<WidgetCategory> { }

    [RoutePrefix("api/openXDA/AdditionalField")]
    public class AdditionalFieldController : ModelController<AdditionalField>
    {

        [HttpGet, Route("ParentTable/{openXDAParentTable}/{sort}/{ascending:int}")]
        public IHttpActionResult GetAdditionalFieldsForTable(string openXDAParentTable, string sort, int ascending)
        {
            if (GetRoles == string.Empty || User.IsInRole(GetRoles))
            {
                //Fix added Fro Capacitor Bank due to naming Missmatch
                if (openXDAParentTable == "CapacitorBank")
                    openXDAParentTable = "CapBank";

                string orderByExpression = DefaultSort;

                if (sort != null && sort != string.Empty)
                    orderByExpression = $"{sort} {(ascending == 1 ? "ASC" : "DESC")}";

                using (AdoDataConnection connection = new(Connection))
                {
                    IEnumerable<AdditionalField> records = new TableOperations<AdditionalField>(connection).QueryRecords(orderByExpression, new RecordRestriction("ParentTable = {0}", openXDAParentTable));
                    if (!User.IsInRole("Administrator"))
                    {
                        records = records.Where(x => !x.IsSecure);
                    }

                    return Ok(records);
                }
            }
            else
            {
                return Unauthorized();
            }
        }

    }

    [RoutePrefix("api/ValueList")]
    public class ValueListController : ModelController<ValueList>
    {
        [HttpGet, Route("Group/{groupName}")]
        public IHttpActionResult GetValueListForGroup(string groupName)
        {
            using (AdoDataConnection connection = new(Connection))
            {
                string tableName = new TableOperations<ValueListGroup>(connection).TableName;
                IEnumerable<ValueList> records = new TableOperations<ValueList>(connection).QueryRecordsWhere($"GroupID = ( SELECT ID FROM {tableName} WHERE Name = {{0}})", groupName);
                return Ok(records);
            }
        }

    }

}