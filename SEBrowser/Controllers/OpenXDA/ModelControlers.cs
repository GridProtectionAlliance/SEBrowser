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

using Gemstone.Data;
using Gemstone.Data.Model;
using Gemstone.Identity;
using Gemstone.Web;
using openXDA.Model;
using SystemCenter.Model;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using SEBrowser.Model;
using Microsoft.AspNetCore.Mvc;
using Gemstone.Web.APIController;

namespace SEBrowser.Controllers.OpenXDA
{
    [Route("api/openXDA/AssetGroup")]
    public class OpenXDAAssetGroupController : ReadOnlyModelController<AssetGroupView>;

    [RootQueryRestriction("ShowInFilter = 1")]
    [UseEscapedName, TableName("EventType")]
    public class SEbrowserEventType : EventType;

    [Route("api/openXDA/EventType")]
    public class EventTypeController : ReadOnlyModelController<SEbrowserEventType>;

    [Route("api/openXDA/Asset")]
    public class OpenXDAAssetController : ReadOnlyModelController<DetailedAsset>;

    [Route("api/openXDA/Meter")]
    public class OpenXDAMeterController : ReadOnlyModelController<DetailedMeter>;

    [Route("api/openXDA/Location")]
    public class OpenXDALocationController : ReadOnlyModelController<DetailedLocation>;

    [Route("api/openXDA/Widget")]
    public class WidgetController : ControllerBase
    {
        [HttpGet, Route("{categoryID:int}")]
        public IActionResult GetWidgetsForCategory(int categoryID)
        {
            using AdoDataConnection connection = new(Gemstone.Configuration.Settings.Default);

            IEnumerable<WidgetView> records = new TableOperations<WidgetView>(connection)
                .QueryRecords(new RecordRestriction("CategoryID = {0}", categoryID));

            return Ok(records);
        }
    }

    [Route("api/OpenXDA/WidgetCategory")]
    public class WidgetCategoryController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetWidgetCategories()
        {
            using AdoDataConnection connection = new(Gemstone.Configuration.Settings.Default);

            IEnumerable<WidgetCategory> records = new TableOperations<WidgetCategory>(connection)
                .QueryRecords("OrderBy");

            return Ok(records);
        }
    }

    [Route("api/openXDA/AdditionalField")]
    public class AdditionalFieldController : ControllerBase
    {
        [HttpGet, Route("ParentTable/{openXDAParentTable}/{sort}/{ascending:int}")]
        public IActionResult GetAdditionalFieldsForTable(string openXDAParentTable, string sort, int ascending)
        {
            //Fix added for Capacitor Bank due to naming mismatch
            if (openXDAParentTable == "CapacitorBank")
                openXDAParentTable = "CapBank";

            string orderByExpression = $"{sort} {(ascending == 1 ? "ASC" : "DESC")}";

            // Asset additional fields are stored under the individual asset-type tables, not a single "Asset" table.
            RecordRestriction restriction = openXDAParentTable == "Asset"
                ? new RecordRestriction("ParentTable IN ('Line', 'Transformer', 'Breaker', 'CapBank', 'Bus', 'Generation', 'StationAux', 'StationBattery')")
                : new RecordRestriction("ParentTable = {0}", openXDAParentTable);

            using AdoDataConnection connection = new(Gemstone.Configuration.Settings.Default);

            IEnumerable<AdditionalField> records = new TableOperations<AdditionalField>(connection)
                .QueryRecords(orderByExpression, restriction);

            if (!User.IsInRole("Administrator"))
                records = records.Where(x => !x.IsSecure);

            return Ok(records);
        }
    }

    [Route("api/ValueList")]
    public class SEBrowserValueListController : ValueListController;

    [Route("api/openXDA/Phase")]
    public class PhaseController : ReadOnlyModelController<Phase>;

    [Route("api/openXDA/ChannelGroup")]
    public class ChannelGroupController : ReadOnlyModelController<ChannelGroup>;

    [Route("api/openXDA/StandardMagDurCurve")]
    public class StandardMagDurCurveController : ControllerBase
    {
        [HttpGet, Route("{sort}/{ascending:int}")]
        public IActionResult GetStandardMagDurCurves(string sort, int ascending)
        {
            string[] allowedSortColumns = { "ID", "Name", "Color", "Area" };
            string orderByExpression = $"{(allowedSortColumns.Contains(sort) ? sort : "Name")} {(ascending == 1 ? "ASC" : "DESC")}";

            using AdoDataConnection connection = new(Gemstone.Configuration.Settings.Default);

            // Converts the spatial Area (geometry) column into the "x y, x y, ..." coordinate string the frontend expects.
            DataTable curves = connection.RetrieveData($@"
                SELECT
                    ID, Name, Color,
                    REPLACE(REPLACE(RIGHT(Area.STAsText(), len(Area.STAsText()) - charindex('(', Area.STAsText())),')',''),'(','') AS Area
                FROM StandardMagDurCurve
                ORDER BY {orderByExpression}");

            return Ok(curves);
        }
    }
}