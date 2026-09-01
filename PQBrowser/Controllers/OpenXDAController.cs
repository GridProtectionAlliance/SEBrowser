//******************************************************************************************************
//  OpenXDAController.cs - Gbtc
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
//  03/04/2020 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

using Gemstone.Configuration;
using Gemstone.Data;
using Gemstone.Data.Model;
using Gemstone.EnumExtensions;
using Gemstone.Numeric.Interpolation;
using Gemstone.Security.AccessControl;
using Microsoft.AspNetCore.Mvc;
using openXDA.Model;
using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.Linq;
using System.Runtime.Caching;

namespace PQBrowser.Controllers
{
    [Route("api/OpenXDA")]

    public class OpenXDAController : ControllerBase
    {
        #region [ Members ]

        
        #endregion

        #region [ Constructors ]
        public OpenXDAController() : base() { }
            #endregion

        #region [ Static ]
        private static MemoryCache s_memoryCache;

        static OpenXDAController()
        {
            s_memoryCache = new MemoryCache("OpenXDA");
            s_disturbanceTypes = new[] { "Sag", "Swell", "Transient", "Interruption" };
            s_faultTypes = new[] { "Fault", "RecloseIntoFault" };

            using AdoDataConnection connection = new(Settings.Default);
            {

                s_eventTypeLookup = new TableOperations<EventType>(connection).QueryRecords().ToList()
                    .ToDictionary(x => x.Name, x => x.ID);

                s_columnsByTable = new();

                DataTable collumns = connection.RetrieveData(@"
                            SELECT COLUMN_NAME,TABLE_NAME
                                FROM INFORMATION_SCHEMA.COLUMNS 
                            WHERE (TABLE_NAME = 'SEBrowser.EventSearchEventView'
                                OR TABLE_NAME = 'SEBrowser.EventSearchLongestDisturbanceView'
                                OR TABLE_NAME = 'SEBrowser.EventSearchShortestDisturbanceView' 
                                OR TABLE_NAME = 'SEBrowser.EventSearchLargestDisturbanceView' 
                                OR TABLE_NAME = 'SEBrowser.EventSearchSmallestDisturbanceView'
                                OR TABLE_NAME = 'SEBrowser.EventSearchFaultView')
                                AND COLUMN_NAME NOT LIKE 'Sort.%' 
                                AND COLUMN_NAME NOT LIKE 'EventID'
                                AND COLUMN_NAME NOT LIKE 'DisturbanceID'
                                AND COLUMN_NAME NOT LIKE 'FaultID'
                                AND COLUMN_NAME NOT LIKE 'Event Type'
                                ");

                IEnumerable<DataRow> rows = collumns.Select();
               
                Dictionary<string, int> uniqueCollumns = rows
                    .GroupBy(r => r["COLUMN_NAME"].ToString())
                    .ToDictionary((k) => k.Key, (k) => k.Count());

                Dictionary<string, int> currentCount = new();

                Action<string, string> addColumn = (string tbl, string col) => {
                    if (s_columnsByTable.ContainsKey(tbl))
                        s_columnsByTable[tbl].Add($"{col}");
                    else
                        s_columnsByTable.Add(tbl, new() { $"{col}" });
                };

                foreach (DataRow row in rows)
                {
                    string table = row["TABLE_NAME"].ToString();
                    string col = row["COLUMN_NAME"].ToString();

                    if (!uniqueCollumns.TryGetValue(col, out int count))
                        continue;
                    if (count == 1)
                    {
                        addColumn(table, $"[{col}]");
                        continue;
                    }
                    int i = 0;

                    if (!currentCount.TryGetValue(col, out i))
                    {
                        currentCount.Add(col, 0);
                    }
                    currentCount[col] = i + 1;

                    addColumn(table, $"[{col}] AS [{col} {i}]");
                }
            }

            

        }

        private static string[] s_disturbanceTypes;
        private static string[] s_faultTypes;
        private static Dictionary<string, int> s_eventTypeLookup;

        private string m_collumns = null;
        private Dictionary<string, string> m_sortCollumns = null;

        private static string Columns => string.Join(",", s_columnsByTable
            .Select((v) => string.Join(",", v.Value.Select(c => $"[{v.Key}].{c}"))));

        public Dictionary<string, string> SortColumns
        {
            get
            {
                if (m_sortCollumns is null)
                    using (AdoDataConnection connection = new(Settings.Default))
                    {
                        DataTable collumns = connection.RetrieveData(@"
                            SELECT COLUMN_NAME,TABLE_NAME
                                FROM INFORMATION_SCHEMA.COLUMNS 
                            WHERE (TABLE_NAME = 'SEBrowser.EventSearchEventView'
                                OR TABLE_NAME = 'SEBrowser.EventSearchDetailsView') 
                                AND COLUMN_NAME LIKE 'Sort.%'");

                        m_sortCollumns = collumns.Select()
                            .ToDictionary(
                            r => r["COLUMN_NAME"].ToString().Split('.')[1],
                            r => $"[{r["TABLE_NAME"]}].[{r["COLUMN_NAME"]}]");
                    }
                return m_sortCollumns;
            }
        }

        private static Dictionary<string, List<string>> s_columnsByTable;

        #endregion

        #region [ Event Search Page ]

        public class EventSearchPostData
        {
            public string date { get; set; }
            public string time { get; set; }
            public double windowSize { get; set; }
            public int timeWindowUnits { get; set; }
            public double durationMin { get; set; }
            public double durationMax { get; set; }
            public Phase phases { get; set; }
            public double transientMin { get; set; }
            public double transientMax { get; set; }
            public double sagMin { get; set; }
            public double sagMax { get; set; }
            public double swellMax { get; set; }
            public double swellMin { get; set; }
            public int curveID { get; set; }
            public bool curveInside { get; set; }
            public bool curveOutside { get; set; }
            public int[] meterIDs { get; set; }
            public int[] typeIDs { get; set; }
            public int[] assetIDs { get; set; }
            public int[] groupIDs { get; set; }
            public int[] locationIDs { get; set; }
            public int? numberResults { get; set; }
            public bool ascending { get; set; }
            public string sortKey { get; set; }
            public int? eventID { get; set; }
        }

        enum TimeWindowUnits
        {
            Millisecond,
            Second,
            Minute,
            Hour,
            Day,
            Week,
            Month,
            Year
        }

        public class Phase
        {
            public bool AN { get; set; }
            public bool BN { get; set; }
            public bool CN { get; set; }
            public bool AB { get; set; }
            public bool BC { get; set; }
            public bool CA { get; set; }
            public bool ABG { get; set; }
            public bool BCG { get; set; }
            public bool ABC { get; set; }
            public bool ABCG { get; set; }
        }

        // Read-style POST; without this, Gemstone's verb mapping would require Create access.
        [Route("GetEventSearchData"), HttpPost, ResourceAccess(ResourceAccessType.Read)]
        public DataTable GetEventSearchData([FromBody] EventSearchPostData postData)
        {
            if(postData is null)
                throw new Exception("Unable to parse request body");

            using AdoDataConnection connection = new(Settings.Default);
            {
                // When an eventID is provided, the request targets that single event and the time/characteristic filters are skipped
                object queryParameter;
                string recordFilter;
                string filters = "";

                
                //If eventID is provided no filters are needed this is a 1-1 lookup
                if (postData.eventID is not null)
                {
                    queryParameter = postData.eventID;
                    recordFilter = "Event.ID = {0}";
                }
                else
                {
                    queryParameter = DateTime.ParseExact(postData.date + " " + postData.time, "MM/dd/yyyy HH:mm:ss.fff", new CultureInfo("en-US"));
                    recordFilter = getTimeFilter(postData, "Event.StartTime");

                    string eventType = (postData.typeIDs is null) ? null : getEventTypeFilter(postData, "COALESCE(DisturbanceTypeID, EventTypeID)");
                    string phase = (postData.phases is null) ? null : getPhaseFilter(postData, "COALESCE(FaultSummary.FaultType,(SELECT Name FROM Phase WHERE ID = MaxMag.PhaseID))");
                    
                    string eventCharacteristic = getEventCharacteristicFilter(postData, "MinDur.DurationSeconds", 
                        "MaxDur.DurationSeconds", "MinMag.PerUnitMagnitude", "MaxMag.PerUnitMagnitude", "COALESCE(DisturbanceTypeID, EventTypeID)");
                    string asset = getAssetFilters(postData, "Event.AssetID", "Event.MeterID");

                    filters = $"{(string.IsNullOrEmpty(eventType) ? "" : $"AND ({eventType})")} ";
                    filters += $"{(string.IsNullOrEmpty(phase) ? "" : $"AND ({phase})")}  ";
                    filters += $"{(string.IsNullOrEmpty(eventCharacteristic) ? "" : $"AND {eventCharacteristic}")} ";
                    filters += $"{(string.IsNullOrEmpty(asset) ? "" : $"AND {asset}")}";
                }

                // Sort keys map to the views' "Sort.<key>" columns; unknown keys fall back to Time to keep user input out of the SQL
                if (!SortColumns.TryGetValue(postData.sortKey ?? "Time", out string sortColumn))
                    sortColumn = "[Time]";

                string sortBy = $"ORDER BY {sortColumn} {(postData.ascending ? "ASC" : "DESC")}";

               string query =
                    $"""
                    SELECT TOP {postData.numberResults?.ToString() ?? "100"}
                        EventType.Description AS [Event Type],
                        Main.Phase AS [Phase],
                        Main.EventID,
                        Main.LargestDisturbanceID AS DisturbanceID,
                        {Columns}
                    FROM
                        (
                            SELECT
                                 Event.ID EventID,
                    			 COALESCE(DisturbanceTypeID, EventTypeID) AS EventTypeID,
                                 MaxMag.ID AS LargestDisturbanceID,
                    			 MinMAG.ID AS SmallestDisturbanceID,
                    			 MinDur.ID AS ShortestDisturbanceID,
                    			 MaxDur.ID AS LongestDisturbanceID,
                    			 MaxMag.PerUnitMagnitude AS LargestDisturbanceMagnitude,
                    			 MinMag.PerUnitMagnitude AS SmallestDisturbanceMagnitude,
                    			 MinDur.DurationSeconds AS SmallestDisturbanceDuration,
                    			 MaxDur.DurationSeconds AS LargestDisturbanceDuration,
                                 FaultSummary.FaultNumber AS FaultID,
                                 COALESCE(FaultSummary.FaultType,(SELECT Name FROM Phase WHERE ID = MaxMag.PhaseID)) AS Phase
                            FROM
                                Event CROSS APPLY  (
                    	            SELECT Disturbance.EventTypeID AS DisturbanceTypeID,
                    	                MAX(Disturbance.PerUnitMagnitude) AS MaxMagnitude,
                                        MIN(Disturbance.PerUnitMagnitude) AS MinMagnitude,
                    	                MAX(Disturbance.DurationSeconds) AS MaxDuration,
                                        MIN(Disturbance.DurationSeconds) AS MinDuration
                    	            FROM Disturbance WHERE Disturbance.EventID = Event.ID  
                                    GROUP BY (EventTypeID) 
                                    UNION ALL
                                    SELECT NULL, NULL, NULL, NULL, NULL WHERE EVENT.EventTypeID NOT IN ({string.Join(",", s_disturbanceTypes.Select(x => s_eventTypeLookup.TryGetValue(x, out int id) ? id : -1))})
                                ) D OUTER APPLY (
                                    SELECT TOP 1 ID,
                                        PerUnitMagnitude,
                                        PhaseID
                                    FROM Disturbance
                                    WHERE EventID = Event.ID AND
                                        PerUnitMagnitude = D.MaxMagnitude AND
                                        D.DisturbanceTypeID = EventTypeID
                                ) MaxMag OUTER APPLY (
                                    SELECT TOP 1 ID,
                                        PerUnitMagnitude 
                                    FROM Disturbance
                                    WHERE EventID = Event.ID AND
                                        PerUnitMagnitude = D.MinMagnitude AND
                                        D.DisturbanceTypeID = EventTypeID
                                ) MinMag OUTER APPLY (
                                    SELECT TOP 1 ID,
                                        DurationSeconds
                                    FROM Disturbance 
                                    WHERE EventID = Event.ID AND
                                        DurationSeconds = D.MinDuration AND
                                        D.DisturbanceTypeID = EventTypeID
                                ) MinDur OUTER APPLY (
                                    SELECT TOP 1 ID,
                                        DurationSeconds
                                    FROM Disturbance
                                    WHERE EventID = Event.ID AND
                                        DurationSeconds = D.MaxDuration AND
                                        D.DisturbanceTypeID = EventTypeID
                                ) MaxDur LEFT OUTER JOIN 
                                FaultSummary ON 
                    	            FaultSummary.IsSelectedAlgorithm <> 0 AND
                    	            FaultSummary.IsValid <> 0 AND
                    	            FaultSummary.IsSuppressed = 0 AND
                    	            Event.EventTypeID IN ({string.Join(",", s_faultTypes.Select(x => s_eventTypeLookup.TryGetValue(x, out int id) ? id : -1))}) AND
                    	            D.DisturbanceTypeID IS NULL AND
                    	            Event.ID = FaultSummary.EventID
                            WHERE
                                ({recordFilter})
                                {filters}
                        ) Main INNER JOIN
                        EventType ON Main.EventTypeID = EventType.ID INNER JOIN
                        [SEBrowser.EventSearchEventView] ON Main.EventID = [SEBrowser.EventSearchEventView].EventID LEFT JOIN
                        [SEBrowser.EventSearchLongestDisturbanceView] ON 
                            (Main.LargestDisturbanceID IS NOT NULL AND [SEBrowser.EventSearchLongestDisturbanceView].DisturbanceID = Main.LargestDisturbanceID) LEFT JOIN
                        [SEBrowser.EventSearchShortestDisturbanceView] ON 
                            (Main.ShortestDisturbanceID IS NOT NULL AND [SEBrowser.EventSearchShortestDisturbanceView].DisturbanceID = Main.ShortestDisturbanceID)  LEFT JOIN
                        [SEBrowser.EventSearchSmallestDisturbanceView] ON    
                            (Main.SmallestDisturbanceID IS NOT NULL AND [SEBrowser.EventSearchSmallestDisturbanceView].DisturbanceID = Main.SmallestDisturbanceID) LEFT JOIN
                        [SEBrowser.EventSearchLargestDisturbanceView] ON 
                            (Main.LargestDisturbanceID IS NOT NULL AND [SEBrowser.EventSearchLargestDisturbanceView].DisturbanceID = Main.LargestDisturbanceID) LEFT JOIN
                        [SEBrowser.EventSearchFaultView] ON
                            Main.FaultID IS NOT NULL AND [SEBrowser.EventSearchFaultView].FaultID = Main.FaultID AND
                            Main.EventID = [SEBrowser.EventSearchFaultView].EventID 
                        {sortBy}
                    """;

                DataTable table = connection.RetrieveData(query, queryParameter);

                return table;
            }
        }

        // Read-style POST; without this, Gemstone's verb mapping would require Create access.
        [Route("GetMagDurChartData"), HttpPost, ResourceAccess(ResourceAccessType.Read)]
        public DataTable GetMagDurChartData([FromBody] EventSearchPostData postData)
        {
            if (postData is null)
                throw new Exception("Unable to parse request body");

            using AdoDataConnection connection = new(Settings.Default);
            {
                // When an eventID is provided, the request targets that single event and the time/characteristic filters are skipped
                object queryParameter;
                string recordFilter;
                string filters = "";

                //If eventID is provided no filters are needed this is a 1-1 lookup
                if (postData.eventID is not null)
                {
                    queryParameter = postData.eventID;
                    recordFilter = "Event.ID = {0}";
                }
                else
                {
                    queryParameter = DateTime.ParseExact(postData.date + " " + postData.time, "MM/dd/yyyy HH:mm:ss.fff", new CultureInfo("en-US"));
                    recordFilter = getTimeFilter(postData, "Event.StartTime");

                    string eventType = (postData.typeIDs is null) ? null : getEventTypeFilter(postData, "Disturbance.EventTypeID");
                    string phase = (postData.phases is null) ? null : getPhaseFilter(postData, "(SELECT Name FROM Phase WHERE ID = Disturbance.PhaseID)");

                    string eventCharacteristic = getEventCharacteristicFilter(postData,
                        "Disturbance.DurationSeconds", "Disturbance.DurationSeconds", 
                        "Disturbance.PerUnitMagnitude", "Disturbance.PerUnitMagnitude",
                        "Disturbance.EventTypeID");
                    string asset = getAssetFilters(postData, "Event.AssetID", "Event.MeterID");

                    filters = $"{(string.IsNullOrEmpty(eventType) ? "" : $"AND ({eventType})")} ";
                    filters += $"{(string.IsNullOrEmpty(phase) ? "" : $"AND ({phase})")}  ";
                    filters += $"{(string.IsNullOrEmpty(eventCharacteristic) ? "" : $"AND {eventCharacteristic}")} ";
                    filters += $"{(string.IsNullOrEmpty(asset) ? "" : $"AND {asset}")}";
                }

                string query =
                     $"""
                     SELECT TOP {postData.numberResults?.ToString() ?? "100"}
                        Event.ID EventID,
                        Disturbance.PerUnitMagnitude AS MagDurMagnitude,
                        Disturbance.DurationSeconds AS MagDurDuration,
                        EventType.Description AS [Event Type],
                        {string.Join(",", s_columnsByTable["SEBrowser.EventSearchEventView"])}
                    FROM
                    Disturbance INNER JOIN Event ON
                        Disturbance.EventID = Event.ID  INNER JOIN
                        EventType ON Disturbance.EventTypeID = EventType.ID LEFT JOIN
                    [SEBrowser.EventSearchEventView] ON Disturbance.EventID = [SEBrowser.EventSearchEventView].EventID
                    WHERE
                        ({recordFilter})
                        {filters}
                    """;

                DataTable table = connection.RetrieveData(query, queryParameter);

                return table;
            }
        }

        private string getTimeFilter(EventSearchPostData postData, string column)
        {
            string timeWindowUnits = ((TimeWindowUnits)postData.timeWindowUnits).GetDescription();

            return $"{column} BETWEEN DATEADD({timeWindowUnits},{-1 * postData.windowSize}, {{0}}) AND DATEADD({timeWindowUnits},{postData.windowSize}, {{0}})";
        }

        private string getEventTypeFilter(EventSearchPostData postData, string column)
        {
            if (postData.typeIDs.Count() > 0)
                return ($"{column} IN ({string.Join(",", postData.typeIDs)})");
            return ($"{column} IN (-1)");
        }

        private string getPhaseFilter(EventSearchPostData postData, string column)
        {
            Dictionary<string, bool> phases = new Dictionary<string, bool>
            {
                ["AN"] = postData.phases.AN,
                ["BN"] = postData.phases.BN,
                ["CN"] = postData.phases.CN,
                ["AB"] = postData.phases.AB,
                ["BC"] = postData.phases.BC,
                ["CA"] = postData.phases.CA,
                ["ABG"] = postData.phases.ABG,
                ["BCG"] = postData.phases.BCG,
                ["ABC"] = postData.phases.ABC,
                ["ABCG"] = postData.phases.ABCG
            };

            if (!phases.Any(item => !item.Value))   // all are true
            {
                return "";
            }

            if (!phases.Any(item => item.Value))    // all are false
            {
                return "(1=0)";
            }

            string phaseCombined = string.Join(", ", phases.Where(item => item.Value).Select(item => "\'" + item.Key + "\'"));

            return $"{column} IN ({phaseCombined})";
        }

        private string getEventCharacteristicFilter(EventSearchPostData postData, string minDurationColumn, string maxDurationColumn, string minMagnitudeColumn, string maxMagnitudeColumn, string eventTypeColumn)
        {

            List<string> characteristics = new();

            //Min and Max Durations
            if (postData.durationMin > 0)
            {
                characteristics.Add($"({maxDurationColumn} > {postData.durationMin} OR {eventTypeColumn} NOT IN ({string.Join(", ", s_disturbanceTypes.Select(x => s_eventTypeLookup.TryGetValue(x, out int id) ? id : -1))}))");
            }
            if (postData.durationMax > 0)
            {
                characteristics.Add($"({minDurationColumn} < {postData.durationMax} OR {eventTypeColumn} NOT IN ({string.Join(", ", s_disturbanceTypes.Select(x => s_eventTypeLookup.TryGetValue(x, out int id) ? id : -1))}))");
            }

            // Sag Min and Max
            if (postData.sagMin > 0)
            {
                characteristics.Add($"({maxMagnitudeColumn} > {postData.sagMin} OR {eventTypeColumn} <> {s_eventTypeLookup["Sag"]})");
            }
            if (postData.sagMax > 0)
            {
                characteristics.Add($"({minMagnitudeColumn} < {postData.sagMax} OR {eventTypeColumn} <> {s_eventTypeLookup["Sag"]})");
            }

            // Swell Min and Max
            if (postData.swellMin > 0)
            {
                characteristics.Add($"({maxMagnitudeColumn} > {postData.swellMin} OR {eventTypeColumn} <> {s_eventTypeLookup["Swell"]})");

            }
            if (postData.swellMax > 0)
            {
                characteristics.Add($"({minMagnitudeColumn} < {postData.swellMax} OR {eventTypeColumn} <> {s_eventTypeLookup["Swell"]})");

            }

            // Transient min and max
            if (postData.transientMin > 0)
            {
                characteristics.Add($"({maxMagnitudeColumn} > {postData.transientMin} OR {eventTypeColumn} <> {s_eventTypeLookup["Transient"]})");
            }
            if (postData.transientMax > 0)
            {
                characteristics.Add($"({minMagnitudeColumn} < {postData.transientMax} OR {eventTypeColumn} <> {s_eventTypeLookup["Transient"]})");
            }

            // Mag Dur Curves
            if (!postData.curveOutside || !postData.curveInside)
            {
                string filt = $"(({minMagnitudeColumn} IS NOT NULL AND " +
                    $"{maxMagnitudeColumn} IS NOT NULL AND ";
                filt += $"{maxDurationColumn} IS NOT NULL AND " +
                    $"{minDurationColumn} IS NOT NULL AND ";
                string curve = $"(SELECT TOP 1 Area FROM StandardMagDurCurve WHERE ID = {postData.curveID})";
                // Special because for INSIDE we check if there is any overlap 
                filt += $"{curve}.STIntersects(geometry::STGeomFromText(CONCAT('Polygon((',{minDurationColumn},' ',{minMagnitudeColumn}, ',' " +
                    $"{maxDurationColumn},' ',{minMagnitudeColumn}, ','" +
                    $"{maxDurationColumn},' ',{maxMagnitudeColumn}, ','" +
                    $"{minDurationColumn},' ',{maxMagnitudeColumn}, ','" +
                    $"{minDurationColumn},' ',{minMagnitudeColumn}," +
                    $"'))',0)) = {(postData.curveInside ? 1 : 0)}) OR " +
                    $" {eventTypeColumn} NOT IN ({string.Join(",", s_disturbanceTypes.Select(x => s_eventTypeLookup.TryGetValue(x, out int id) ? id : -1))}))";
                characteristics.Add(filt);
            }

            return string.Join(" AND ", characteristics);
        }

        private string getAssetFilters(EventSearchPostData postData, string meterIDColumn, string assetIDColumn)
        {
            List<string> assets = new();

            if (postData.meterIDs.Count() > 0)
                assets.Add($"{meterIDColumn} IN ({string.Join(",", postData.meterIDs)})");

            if (postData.assetIDs.Count() > 0)
                assets.Add($"{assetIDColumn} IN ({string.Join(",", postData.assetIDs)})");

            if (postData.locationIDs.Count() > 0)
            {
                string filt = $"({assetIDColumn} IN (SELECT AssetLocation.AssetID FROM AssetLocation WHERE AssetLocation.LocationID IN ({string.Join(",", postData.locationIDs)}))";
                filt += $" OR {meterIDColumn} IN (SELECT Meter.ID FROM Meter WHERE Meter.LocationID IN ({string.Join(",", postData.locationIDs)})))";
                assets.Add(filt);
            }

            if (postData.groupIDs.Count() > 0)
            {
                string filt = $"({assetIDColumn} IN (SELECT AssetAssetGroup.AssetID FROM AssetAssetGroup WHERE AssetAssetGroup.AssetGroupID IN ({string.Join(",", postData.groupIDs)}))";
                filt += $" OR {meterIDColumn} IN (SELECT MeterAssetGroup.MeterID FROM MeterAssetGroup WHERE MeterAssetGroup.AssetGroupID IN ({string.Join(",", postData.groupIDs)})))";
                assets.Add(filt);
            }

            return string.Join(" AND ", assets);
        }


        [Route("GetEventSearchMeterMakes"), HttpGet]
        public IActionResult GetEventSearchMeterMakes()
        {
            using (AdoDataConnection connection = new(Settings.Default))
            {

                DataTable table = connection.RetrieveData(@"SELECT DISTINCT Make FROM Meter");

                return Ok(table.Select().Select(x => x["Make"].ToString()));
            }

        }

        [Route("GetEventSearchMeterModels/{make}"), HttpGet]
        public IActionResult GetEventSearchMeterModels(string make)
        {
            using AdoDataConnection connection = new(Settings.Default);

            DataTable table = connection.RetrieveData(@"SELECT DISTINCT Model FROM Meter WHERE Make = {0}", make);

            return Ok(table.Select().Select(x => x["Model"].ToString()));
        }

        [Route("GetRelayPerformance"), HttpGet]
        public DataTable GetRelayPerformance(int eventId)
        {
            if (eventId <= 0) return new DataTable();
            using AdoDataConnection connection = new(Settings.Default);

            Event evt = new TableOperations<Event>(connection).QueryRecordWhere("ID = {0}", eventId);
            return RelayHistoryTable(evt.AssetID, -1);
        }

        [Route("getCapBankAnalytic"), HttpGet]
        public DataTable GetCapBankAnalytic(int eventId)
        {
            if (eventId <= 0) return new DataTable();
            using AdoDataConnection connection = new(Settings.Default);

            string sqlQuery = @"SELECT
                                            CBAnalyticResult.Id AS ID,
                                            CBAnalyticResult.Time AS Time,
                                            CBAnalyticResult.EventID AS EventId,
                                            CBStatus.Description AS Status,
                                            CBOperation.Description AS Operation,
                                            CBAnalyticResult.IsRes AS Resonance,
                                            Phase.Name AS Phase,
                                            CBBankHealth.Description AS CapBankHealth,
                                            CBRestrikeType.Description AS Restrike,
                                            CBSwitchingCondition.Description AS PreInsertionSwitch
                                        FROM CBAnalyticResult LEFT JOIN
                                            Phase ON Phase.ID = CBAnalyticResult.PhaseID LEFT JOIN
	                                        CBStatus ON CBStatus.ID = CBAnalyticResult.CBStatusID  LEFT JOIN
                                            CBOperation ON CBOperation.ID = CBAnalyticResult.CBOperationID LEFT JOIN
	                                        CBCapBankResult ON CBCapBankResult.CBResultID = CBAnalyticResult.Id LEFT JOIN
                                            CBBankHealth ON CBBankHealth.Id =  CBCapBankResult.CBBankHealthID LEFT JOIN
	                                        CBRestrikeResult ON CBRestrikeResult.CBResultID = CBAnalyticResult.Id LEFT JOIN
                                            CBRestrikeType ON CBRestrikeResult.CBRestrikeTypeID = CBRestrikeType.ID	LEFT JOIN
                                            CBSwitchHealthAnalytic ON CBSwitchHealthAnalytic.CBResultID = CBAnalyticResult.ID LEFT JOIN
                                            CBSwitchingCondition ON CBSwitchHealthAnalytic.CBSwitchingConditionID = CBSwitchingCondition.ID
                                        WHERE CBAnalyticResult.EventID = {0}";

            return connection.RetrieveData(sqlQuery, eventId);
        }

        private DataTable RelayHistoryTable(int relayID, int eventID)
        {
            DataTable dataTable;

            using (AdoDataConnection connection = new(Settings.Default))
            {
                if (eventID > 0) { dataTable = connection.RetrieveData("SELECT * FROM BreakerHistory WHERE BreakerID = {0} AND EventID = {1}", relayID, eventID); }
                else { dataTable = connection.RetrieveData("SELECT * FROM BreakerHistory WHERE BreakerID = {0}", relayID); }
            }
            return dataTable;
        }

        #endregion

    }
}
