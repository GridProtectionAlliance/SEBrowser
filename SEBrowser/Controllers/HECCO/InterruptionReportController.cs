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
using System.Data.SqlClient;
using System.Collections.Generic;

namespace SEBrowser.Controllers
{
    [RoutePrefix("api/InterruptionReport")]
    public class InterruptionReportController : ApiController
    {
        const string SettingsCategory = "interruptionReport";


        public class Interruption
        {
            public DateTime? TimeOut { get; set; }
            public DateTime? TimeIn { get; set; }
            public string Class { get; set; }
            public string Area { get; set; }
            public int ReportNumber { get; set; }
            public string Explanation { get; set; }
            public string CircuitInfo { get; set; }
        }

        [Route("GetEvents/{hour:int}/{eventID:int}"), HttpGet]
        public IHttpActionResult GetData(int hour, int eventID) {

            try
            {
                DateTime start = DateTime.UtcNow;
                using (AdoDataConnection connection = new("systemSettings"))
                    start = connection.ExecuteScalar<DateTime>("SELECT StartTime FROM Event WHERE ID = {0} ", eventID);

                List<Interruption> result = new();
                DataSet ds = new();
                using (AdoDataConnection connection = new(SettingsCategory))
                {
                    using (SqlCommand command = ((SqlConnection)connection.Connection).CreateCommand())
                    {
                        using (SqlDataAdapter sda = new(command))
                        {
                            command.CommandType = System.Data.CommandType.StoredProcedure;
                            command.CommandText = "iradmin.GetIncidentsByDateTimeRange";
                            command.Parameters.AddWithValue("@startDateTime", start.AddHours(-hour));
                            command.Parameters.AddWithValue("@endDateTime", start.AddHours(hour));

                            sda.Fill(ds);
                        }
                    }
                }

                foreach (DataRow dr in ds.Tables[0].Rows)
                {
                    int recordNumber = int.Parse(dr["ReportNumber"].ToString());


                    DataRow[] children = ds.Tables[1].Select($"ReportNumber = {recordNumber}");

                    Interruption interruption = new()
                    {
                        TimeOut = DateTime.Parse(dr["TimeOut"].ToString()),
                        Class = dr["ClassType"].ToString(),
                        Area = dr["Area"].ToString(),
                        ReportNumber = recordNumber,
                        Explanation = dr["Explanation"].ToString(),
                        CircuitInfo = dr["CircuitInfo"].ToString(),
                        TimeIn = null
                    };

                    result.Add(interruption);
                    result.AddRange(children.Select((r) => new Interruption() {
                        TimeOut = DateTime.Parse(dr["TimeOut"].ToString()),
                        Class = "",
                        Area = r["Area"].ToString(),
                        ReportNumber = recordNumber,
                        Explanation = "",
                        CircuitInfo = "",
                        TimeIn = DateTime.Parse(r["TimeIn"].ToString())
                    }));
                }

                return Ok(result);
            }

            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
           
        }

    }
}