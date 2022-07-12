//******************************************************************************************************
//  InterrruptionReportController.cs - Gbtc
//
//  Copyright © 2022, Grid Protection Alliance.  All Rights Reserved.
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
//  07/01/2022 - C. Lackner
//       Generated original version of source code.
//
//******************************************************************************************************

using HtmlAgilityPack;
using System;
using System.Data;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;
using GSF.Data;

namespace SEBrowser.Controllers
{
    [RoutePrefix("api/InterruptionReport")]
    public class InterruptionReportController : ApiController
    {
        const string SettingsCategory = "interruptionReport";

        [Route("GetEvents/{hour:int}/{eventID:int}"), HttpGet]
        public IHttpActionResult GetData(int hour, int eventID) {
           
            try
            {
                DateTime start = DateTime.UtcNow;
                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                    start = connection.ExecuteScalar<DateTime>("SELECT StartTime FROM Event WHERE ID = {0} ", eventID);
                using (AdoDataConnection connection = new AdoDataConnection(SettingsCategory))
                    return Ok(connection.RetrieveData("Exec devsql12.ir.iradmin.GetIncidentsByDateTimeRange({0},{1})",start.AddHours(hour), start.AddHours(hour)));
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
           
        }

    }
}