﻿//******************************************************************************************************
//  LightningQueryController.cs - Gbtc
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
//  04/01/2020 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

using GSF.Data;
using System;
using System.Web.Http;

namespace SEBrowser.Controllers
{
    [RoutePrefix("api/Lightning")]
    public class LightningQueryController : ApiController
    {
        const string SettingsCategory = "dbLightning";

        [Route("{eventID:int}"), HttpGet]
        public IHttpActionResult Get(int eventID) {
            try
            {
                using (AdoDataConnection xdaConnection = new("systemSettings"))
                using (AdoDataConnection connection = new(SettingsCategory))
                {

                    DateTime dateTime = xdaConnection.ExecuteScalar<DateTime>("SELECT StartTime FROM Event WHERE ID = {0}", eventID);

#if DEBUG
                    return Ok(connection.RetrieveData("SELECT * FROM Data",""));
#else
                    string query = @"
                        DECLARE @EndOfPeriodUTC DATETIME2 = DATEADD(HOUR,30, CAST(CAST({0} as DATE) as DATETIME2))
                        DECLARE @BeginningOfPeriodUTC DATETIME2 = DATEADD(DAY,-30, @EndOfPeriodUTC)

                        SELECT *
                        FROM (
                            SELECT CAST(eventtime as Date) as Day , Count(*) as cnt, 'Vaisala - Stroke' as Service
                            FROM TX_Lightning.VAISALAREALTIMEPOINT
                            WHERE eventutctime >= @BeginningOfPeriodUTC and eventtime < @EndOfPeriodUTC
                            GROUP BY CAST(eventtime as Date)
                            UNION
                            SELECT CAST(eventtime as Date) as Day , Count(*) as cnt, 'Vaisala - Flash' as Service
                            FROM (select distinct eventutctime, eventtime from TX_Lightning.VAISALAREALTIMEPOINT) t
                            WHERE eventutctime >= @BeginningOfPeriodUTC and eventtime < @EndOfPeriodUTC
                            GROUP BY CAST(eventtime as Date)
                            UNION
                            SELECT CAST(DATEADD(HOUR, -6, eventutctime)as Date) as Day , Count(*) as cnt, 'Vaisala Reprocess - Stroke' as Service
                            FROM TX_Lightning.VAISALAREPROCESSEDELLIPSE
                            WHERE eventutctime >= @BeginningOfPeriodUTC and eventutctime < @EndOfPeriodUTC
                            GROUP BY CAST(DATEADD(HOUR, -6, eventutctime)as Date)
                            UNION
                            SELECT CAST(DATEADD(HOUR, -6, eventutctime)as Date) as Day , Count(*) as cnt, 'Vaisala Reprocess - Flash' as Service
                            FROM (select distinct eventutctime from TX_Lightning.VAISALAREPROCESSEDELLIPSE)t
                            WHERE eventutctime >= @BeginningOfPeriodUTC and eventutctime < @EndOfPeriodUTC
                            GROUP BY CAST(DATEADD(HOUR, -6, eventutctime)as Date)
                            UNION
                            SELECT CAST(eventtime as Date) as Day , Count(*) as cnt, 'Weatherbug' as Service
                            FROM TX_Lightning.LIGHTNING_WEATHERBUG
                            WHERE eventutctime >= @BeginningOfPeriodUTC and eventtime < @EndOfPeriodUTC
                            GROUP BY CAST(eventtime as Date)
                        ) as tbl
                        PIVOT
                        (
	                        SUM(cnt)
	                        FOR Service IN ([Vaisala - Stroke], [Vaisala - Flash], [Vaisala Reprocess - Stroke], [Vaisala Reprocess - Flash], [Weatherbug])
                        )as pvt
                        Order BY Day
                    ";
                    return Ok(connection.RetrieveData(query, dateTime.ToUniversalTime()));
#endif
                }
            }
            catch (Exception ex) {
                return InternalServerError(ex);
            }
        }

    }
}