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
        private string m_collumns = null;
        private Dictionary<string, string> m_sortCollumns = null;

        public string Columns 
        {
            get
            {
                if (m_collumns is null)
                    using (AdoDataConnection connection = new(Settings.Default))
                    {
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
                        Dictionary<string,int> uniqueCollumns = rows
                            .GroupBy(r => r["COLUMN_NAME"].ToString())
                            .ToDictionary((k) => k.Key, (k) => k.Count());

                        Dictionary<string, int> currentCount = new ();
                        List<string> columns = new List<string>();
                        foreach (DataRow row in rows)
                        {
                            if (!uniqueCollumns.TryGetValue(row["COLUMN_NAME"].ToString(), out int count))
                                continue;
                            if (count == 1)
                            {
                                columns.Add($"[{row["TABLE_NAME"]}].[{row["COLUMN_NAME"]}]");
                                continue;
                            }
                            int i = 0;
                            if (!currentCount.TryGetValue(row["COLUMN_NAME"].ToString(), out i))
                            {
                                currentCount.Add(row["COLUMN_NAME"].ToString(), 0);
                            }
                            currentCount[row["COLUMN_NAME"].ToString()] = i + 1;
                            columns.Add($"[{row["TABLE_NAME"]}].[{row["COLUMN_NAME"]}] AS [{row["COLUMN_NAME"]} {i}]");
                        }

                        m_collumns = string.Join(",", columns);
                    }
                return m_collumns;
            }
        }

        public Dictionary<string,string> SortColumns
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

        
        #endregion

        #region [ Constructors ]
    public OpenXDAController() : base() { }
            #endregion

        #region [ Static ]
        private static MemoryCache s_memoryCache;

        static OpenXDAController()
        {
            s_memoryCache = new MemoryCache("OpenXDA");
        }
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

                Dictionary<string, int> eventTypeLookup = new TableOperations<EventType>(connection).QueryRecords().ToList()
                    .ToDictionary(x => x.Name, x => x.ID);

                string[] disturbanceTypes = { "Sag", "Swell", "Transient", "Interruption" };
                string[] faultTypes = { "Fault", "RecloseIntoFault" };

                //If eventID is provided no filters are needed this is a 1-1 lookup
                if (postData.eventID is not null)
                {
                    queryParameter = postData.eventID;
                    recordFilter = "Event.ID = {0}";
                }
                else
                {
                    queryParameter = DateTime.ParseExact(postData.date + " " + postData.time, "MM/dd/yyyy HH:mm:ss.fff", new CultureInfo("en-US"));
                    recordFilter = getTimeFilter(postData);

                    string eventType = (postData.typeIDs is null) ? null : getEventTypeFilter(postData);
                    string phase = (postData.phases is null) ? null : getPhaseFilter(postData);
                    string eventCharacteristic = getEventCharacteristicFilter(postData, eventTypeLookup, disturbanceTypes);
                    string asset = getAssetFilters(postData);

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
                                 Event.StartTime AS StartTime,
                                 Event.AssetID AS AssetID,
                                 Event.MeterID AS MeterID,
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
                                    SELECT NULL, NULL, NULL, NULL, NULL WHERE EVENT.EventTypeID NOT IN ({string.Join(",", disturbanceTypes.Select(x => eventTypeLookup.TryGetValue(x, out int id) ? id : -1))})
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
                    	            Event.EventTypeID IN ({string.Join(",", faultTypes.Select(x => eventTypeLookup.TryGetValue(x, out int id) ? id : -1))}) AND
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

        private string getTimeFilter(EventSearchPostData postData)
        {
            string timeWindowUnits = ((TimeWindowUnits)postData.timeWindowUnits).GetDescription();

            return $"StartTime BETWEEN DATEADD({timeWindowUnits},{-1 * postData.windowSize}, {{0}}) AND DATEADD({timeWindowUnits},{postData.windowSize}, {{0}})";
        }

        private string getEventTypeFilter(EventSearchPostData postData)
        {
            if (postData.typeIDs.Count() > 0)
                return ($"EventTypeID IN ({string.Join(",", postData.typeIDs)})");
            return ($"EventTypeID IN (-1)");
        }

        private string getPhaseFilter(EventSearchPostData postData)
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

            return $"Phase IN ({phaseCombined})))";
        }

        private string getEventCharacteristicFilter(EventSearchPostData postData, Dictionary<string, int> eventTypesLookup, string[] disturbanceTypes)
        {

            List<string> characteristics = new();

            //Min and Max Durations
            if (postData.durationMin > 0)
            {
                characteristics.Add($"(LargestDisturbanceDuration > {postData.durationMin} OR EventTypeID NOT IN ({string.Join(", ", disturbanceTypes.Select(x => eventTypesLookup.TryGetValue(x, out int id) ? id : -1))}))");
            }
            if (postData.durationMax > 0)
            {
                characteristics.Add($"(SmallestDisturbanceDuration < {postData.durationMax} OR EventTypeID NOT IN ({string.Join(", ", disturbanceTypes.Select(x => eventTypesLookup.TryGetValue(x, out int id) ? id : -1))}))");

            }

            // Sag Min and Max
            if (postData.sagMin > 0)
            {
                characteristics.Add($"(LargestDisturbanceMagnitude > {postData.sagMin} OR EventTypeID <> {eventTypesLookup["Sag"]})");
            }
            if (postData.sagMax > 0)
            {
                characteristics.Add($"(SmallestDisturbanceMagnitude < {postData.sagMax} OR EventTypeID <> {eventTypesLookup["Sag"]})");
            }

            // Swell Min and Max
            if (postData.swellMin > 0)
            {
                characteristics.Add($"(LargestDisturbanceMagnitude > {postData.swellMin} OR EventTypeID <> {eventTypesLookup["Swell"]})");

            }
            if (postData.swellMax > 0)
            {
                characteristics.Add($"(SmallestDisturbanceMagnitude < {postData.swellMax} OR EventTypeID <> {eventTypesLookup["Swell"]})");

            }

            // Transient min and max
            if (postData.transientMin > 0)
            {
                characteristics.Add($"(LargestDisturbanceMagnitude > {postData.transientMin} OR EventTypeID <> {eventTypesLookup["Transient"]})");
            }
            if (postData.transientMax > 0)
            {
                characteristics.Add($"(SmallestDisturbanceMagnitude < {postData.transientMax} OR EventTypeID <> {eventTypesLookup["Transient"]})");

            }

            // Mag Dur Curves
            if (!postData.curveOutside || !postData.curveInside)
            {
                string filt = "((SmallestDisturbanceMagnitude IS NOT NULL AND LargestDisturbanceMagnitude IS NOT NULL AND ";
                filt += "LargestDisturbanceDuration IS NOT NULL AND SmallestDisturbanceDuration IS NOT NULL AND ";
                string curve = $"(SELECT TOP 1 Area FROM StandardMagDurCurve WHERE ID = {postData.curveID})";
                // Special because for INSIDE we check if there is any overlap 
                filt += $"{curve}.STIntersects(geometry::STGeomFromText(CONCAT('Polygon((',SmallestDisturbanceDuration,' ',SmallestDisturbanceMagnitude, ',' " +
                    $"LargestDisturbanceDuration,' ',SmallestDisturbanceMagnitude, ','" +
                    $"LargestDisturbanceDuration,' ',LargestDisturbanceMagnitude, ','" +
                    $"SmallestDisturbanceDuration,' ',LargestDisturbanceMagnitude, ','" +
                    $"SmallestDisturbanceDuration,' ',SmallestDisturbanceMagnitude," +
                    $"'))',0)) = {(postData.curveInside ? 1 : 0)}) OR " +
                    $" EventTypeID NOT IN ({string.Join(",", disturbanceTypes.Select(x => eventTypesLookup.TryGetValue(x, out int id) ? id : -1))}))";
                characteristics.Add(filt);
            }

            return string.Join(" AND ", characteristics);
        }

        private string getAssetFilters(EventSearchPostData postData)
        {
            List<string> assets = new();

            if (postData.meterIDs.Count() > 0)
                assets.Add($"MeterID IN ({string.Join(",", postData.meterIDs)})");

            if (postData.assetIDs.Count() > 0)
                assets.Add($"AssetID IN ({string.Join(",", postData.assetIDs)})");

            if (postData.locationIDs.Count() > 0)
            {
                string filt = $"(AssetID IN (SELECT AssetLocation.AssetID FROM AssetLocation WHERE AssetLocation.LocationID IN ({string.Join(",", postData.locationIDs)}))";
                filt += $" OR MeterID IN (SELECT Meter.ID FROM Meter WHERE Meter.LocationID IN ({string.Join(",", postData.locationIDs)})))";
                assets.Add(filt);
            }

            if (postData.groupIDs.Count() > 0)
            {
                string filt = $"(AssetID IN (SELECT AssetAssetGroup.AssetID FROM AssetAssetGroup WHERE AssetAssetGroup.AssetGroupID IN ({string.Join(",", postData.groupIDs)}))";
                filt += $" OR MeterID IN (SELECT MeterAssetGroup.MeterID FROM MeterAssetGroup WHERE MeterAssetGroup.AssetGroupID IN ({string.Join(",", postData.groupIDs)})))";
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
