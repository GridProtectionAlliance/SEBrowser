//******************************************************************************************************
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
//  03/28/2023 - Stephen C. Wills
//       Overhaul to fix time zone conversions.
//
//******************************************************************************************************

using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Web.Http;
using GSF.Collections;
using GSF.Data;

namespace SEBrowser.Controllers
{
    [RoutePrefix("api/Lightning")]
    public class LightningQueryController : ApiController
    {
        private class VaisalaCounter
        {
            public VaisalaCounter(string serviceName, string tableName)
            {
                ServiceName = serviceName;
                TableName = tableName;
            }

            public string ServiceName { get; }
            public string TableName { get; }
            public string StrokeColumnName => $"{ServiceName} - Stroke";
            public string FlashColumnName => $"{ServiceName} - Flash";

            public Dictionary<DateTime, int> StrokeLookup { get; }
                = new Dictionary<DateTime, int>();

            public Dictionary<DateTime, int> FlashLookup { get; }
                = new Dictionary<DateTime, int>();
        }

        private const string SettingsCategory = "dbLightning";

        [Route("{eventID:int}"), HttpGet]
        public IHttpActionResult Get(int eventID)
        {
            TimeZoneInfo xdaTimeZone;
            DateTime eventTime;

            using (AdoDataConnection xdaConnection = new("systemSettings"))
            {
                string systemTime = xdaConnection.ExecuteScalar<string>("SELECT TOP 1 Value FROM Setting WHERE Name = 'System.XDATimeZone'");
                xdaTimeZone = TimeZoneInfo.FindSystemTimeZoneById(systemTime);
                eventTime = xdaConnection.ExecuteScalar<DateTime>("SELECT StartTime FROM Event WHERE ID = {0}", eventID);
            }

            VaisalaCounter[] counters = new[]
            {
                new VaisalaCounter("Vaisala", "GIS.VAISALAREALTIMEPOINT"),
                new VaisalaCounter("Vaisala Reprocess", "GIS.VAISALAREPROCESSEDELLIPSE")
            };

            using (AdoDataConnection connection = new(SettingsCategory))
            {
                Func<string, IEnumerable<DateTime>> queryFunc = CreateQueryFunc(connection, xdaTimeZone, eventTime);
                PopulateCounters(counters, queryFunc);
            }

            DataTable table = AsDataTable(counters);
            return Ok(table);
        }

        private Func<string, IEnumerable<DateTime>> CreateQueryFunc(AdoDataConnection connection, TimeZoneInfo timeZone, DateTime eventTime)
        {
            const string QueryFormat =
                "SELECT eventutctime " +
                "FROM {0} " +
                "WHERE {{0}} <= eventutctime AND eventutctime <= {{1}} " +
                "ORDER BY eventutctime";

            DateTime eventTimeUTC = TimeZoneInfo.ConvertTimeToUtc(eventTime, timeZone);
            DateTime endTime = eventTimeUTC.AddHours(30);
            DateTime startTime = endTime.AddDays(-30);

            return tableName =>
            {
                string query = string.Format(QueryFormat, tableName);
                IDataReader ExecuteQuery() => connection.ExecuteReader(query, startTime, endTime);
                return AsEnumerable(ExecuteQuery).Select(dt => TimeZoneInfo.ConvertTimeFromUtc(dt, timeZone));
            };
        }

        private IEnumerable<DateTime> AsEnumerable(Func<IDataReader> queryFunc)
        {
            using IDataReader reader = queryFunc();

            while (reader.Read())
                yield return reader.GetDateTime(0);
        }

        private void PopulateCounters(IEnumerable<VaisalaCounter> counters, Func<string, IEnumerable<DateTime>> queryFunc)
        {
            foreach (var counter in counters)
            {
                DateTime previousTime = DateTime.MinValue;

                foreach (DateTime strikeTime in queryFunc(counter.TableName))
                {
                    DateTime strikeDate = strikeTime.Date;
                    counter.StrokeLookup.AddOrUpdate(strikeDate, 0, (_, count) => count + 1);

                    if (strikeTime != previousTime)
                        counter.FlashLookup.AddOrUpdate(strikeDate, 0, (_, count) => count + 1);

                    previousTime = strikeTime;
                }
            }
        }

        private DataTable AsDataTable(IEnumerable<VaisalaCounter> counters)
        {
            DataTable table = new DataTable();
            table.Columns.Add("Day", typeof(DateTime));

            foreach (var counter in counters)
            {
                table.Columns.Add(counter.StrokeColumnName, typeof(int));
                table.Columns.Add(counter.FlashColumnName, typeof(int));
            }

            IEnumerable<DateTime> days = counters
                .SelectMany(counter => new[] { counter.StrokeLookup, counter.FlashLookup })
                .SelectMany(kvp => kvp.Keys)
                .Distinct();

            foreach (DateTime day in days)
            {
                DataRow row = table.NewRow();
                row["Day"] = day;

                foreach (var counter in counters)
                {
                    if (counter.StrokeLookup.TryGetValue(day, out int strokeCount))
                        row[counter.StrokeColumnName] = strokeCount;

                    if (counter.FlashLookup.TryGetValue(day, out int flashCount))
                        row[counter.FlashColumnName] = flashCount;
                }
            }

            return table;
        }
    }
}