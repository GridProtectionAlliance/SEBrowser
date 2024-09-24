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

using FaultData.DataAnalysis;
using GSF;
using GSF.Data;
using GSF.Data.Model;
using GSF.Web;
using Microsoft.AspNet.SignalR.Infrastructure;
using openXDA.Model;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Runtime.Caching;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Windows.Forms;

namespace SEBrowser.Controllers
{
    [RoutePrefix("api/OpenXDA")]

    public class OpenXDAController : ApiController
    {
        #region [ Members ]
        const string SettingsCategory = "systemSettings";

        private string m_collumns = null;
        private Dictionary<string, string> m_sortCollumns = null;

        public string Collumns 
        {
            get
            {
                if (m_collumns is null)
                    using (AdoDataConnection connection = new(SettingsCategory))
                    {
                        DataTable collumns = connection.RetrieveData(@"
                            SELECT COLUMN_NAME,TABLE_NAME
                                FROM INFORMATION_SCHEMA.COLUMNS 
                            WHERE TABLE_NAME = 'SEBrowser.EventSearchEventView'
                                OR TABLE_NAME = 'SEBrowser.EventSearchDetailsView' 
                                AND COLUMN_NAME NOT LIKE 'Sort.%'");
                        m_collumns = String.Join(",",collumns.Select()
                            .Select(r => $"[{r["TABLE_NAME"]}].[{r["COLUMN_NAME"]}]")
                            );
                    }
                return m_collumns;
            }
        }

        public Dictionary<string,string> SortCollumns
        {
            get
            {
                if (m_sortCollumns is null)
                    using (AdoDataConnection connection = new(SettingsCategory))
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
                            r => $"[{r["TABLE_NAME"]}.{r["COLUMN_NAME"]}]");
                           ;
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
            public string start { get; set; }
            public string end { get; set; }
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
            public string transientType { get; set; }
            public string sagType { get; set; }
            public string swellType { get; set; }
            public List<int> meterIDs { get; set; }
            public List<int> typeIDs { get; set; }
            public List<int> assetIDs { get; set; }
            public List<int> groupIDs { get; set; }
            public List<int> locationIDs { get; set; }
            public string numberResults { get; set; }
            public bool ascending { get; set; }
            public string sortKey { get; set; }
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

        [Route("GetEventSearchData"), HttpPost]
        public DataTable GetEventSearchData(EventSearchPostData postData)
        {
            using (AdoDataConnection connection = new(SettingsCategory))
            {
                DateTime startTime = DateTime.ParseExact(postData.start, "MM/dd/yyyy HH:mm:ss.fff", new CultureInfo("en-US"));
                DateTime endTime = DateTime.ParseExact(postData.end, "MM/dd/yyyy HH:mm:ss.fff", new CultureInfo("en-US"));
                    
                string eventType = (postData.typeIDs is null) ? null : getEventTypeFilter(postData);
                string phase = (postData.phases is null) ? null : getPhaseFilter(postData);
                string eventCharacteristic = getEventCharacteristicFilter(postData);
                string asset = getAssetFilters(postData);

                string filters = $"{(string.IsNullOrEmpty(eventType) ? "" : $"AND ({eventType})")} ";
                filters += $"{(string.IsNullOrEmpty(phase) ? "" : $"AND ({phase})")}  ";
                filters += $"{(string.IsNullOrEmpty(eventCharacteristic) ? "" : $"AND {eventCharacteristic}")} ";
                filters += $"{(string.IsNullOrEmpty(asset) ? "" : $"AND {asset}")}";

                string sortBy = postData.sortKey ?? "Time";
                if (!SortCollumns.TryGetValue(sortBy, out sortBy))
                    sortBy = postData.sortKey ?? "Time";
                sortBy = $"ORDER BY [{sortBy}] {(postData.ascending ? "ASC" : "DESC")}";

                string query =
                    $@"SELECT TOP {postData.numberResults ?? "100"} 
                    {Collumns}
                FROM 
                    ( 
                        SELECT 
                            Event.ID EventID, 
                            EventWorstDisturbance.WorstDisturbanceID DisturbanceID, 
                            FaultSummary.FaultNumber FaultID 
                        FROM 
                            Event JOIN 
                            EventType ON Event.EventTypeID = EventType.ID LEFT OUTER JOIN 
                            EventWorstDisturbance ON 
                                EventWorstDisturbance.EventID = Event.ID AND 
                                EventType.Name IN ('Sag', 'Swell', 'Interruption', 'Transient') LEFT OUTER JOIN 
                            FaultGroup ON 
                                FaultGroup.EventID = Event.ID AND 
                                COALESCE(FaultGroup.FaultDetectionLogicResult, 0) <> 0 LEFT OUTER JOIN 
                            FaultSummary ON 
                                FaultSummary.EventID = Event.ID AND 
                                FaultSummary.IsSelectedAlgorithm <> 0 AND 
                                ( 
                                    FaultGroup.ID IS NOT NULL OR 
                                    ( 
                                        FaultSummary.IsValid <> 0 AND 
                                        FaultSummary.IsSuppressed = 0 
                                    ) 
                                ) AND 
                                EventType.Name IN ('Fault', 'RecloseIntoFault') 
                        WHERE 
                            ({getTimeFilter(postData)}) AND 
                            ( 
                                EventWorstDisturbance.ID IS NOT NULL OR 
                                FaultSummary.ID IS NOT NULL OR 
                                EventType.Name IN ('BreakerOpen', 'Other') 
                            ) 
                            {filters} 
                    ) Main LEFT JOIN 
                    [SEBrowser.EventSearchEventView] ON Main.EventID = [SEBrowser.EventSearchEventView].EventID Inner JOIN     
                    [SEBrowser.EventSearchDetailsView] ON 
                        Main.EventID = [SEBrowser.EventSearchDetailsView].EventID AND 
                        ( 
                            (Main.DisturbanceID IS NOT NULL AND [SEBrowser.EventSearchDetailsView].DisturbanceID = Main.DisturbanceID) OR 
                            (Main.FaultID IS NOT NULL AND [SEBrowser.EventSearchDetailsView].FaultID = Main.FaultID) OR 
                            (COALESCE([SEBrowser.EventSearchDetailsView].DisturbanceID, Main.DisturbanceID) IS NULL AND COALESCE([SEBrowser.EventSearchDetailsView].FaultID, Main.FaultID) IS NULL) 
                        ) {sortBy}";

                DataTable table = connection.RetrieveData(query, startTime, endTime);

                return table;
            }

        }

        private string getTimeFilter(EventSearchPostData postData)
        {
            return $"Event.StartTime BETWEEN '{postData.start}' AND '{postData.end}'";
        }

        private string getEventTypeFilter(EventSearchPostData postData)
        {
            List<string> eventTypes = new();

            // The ELSE clause is required because TVA would like to be able to specify filters that make no sense... 
            if (postData.typeIDs.Count() > 0)
                eventTypes.Add($"(SELECT d.EventTypeID FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstDisturbanceID) IN ({string.Join(",", postData.typeIDs)})");
            else
                eventTypes.Add($"(SELECT d.EventTypeID FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstDisturbanceID) IN (-1)");

            if (postData.typeIDs.Count() > 0)
                eventTypes.Add($"Event.EventTypeID IN ({string.Join(",", postData.typeIDs)})");
            else
                eventTypes.Add($"Event.EventTypeID IN (-1)");

            return string.Join(" OR ", eventTypes);
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

            return $"(EventWorstDisturbance.WorstDisturbanceID IN (SELECT Disturbance.ID FROM Disturbance WHERE Disturbance.PhaseID IN (Select Phase.ID FROM Phase Where Phase.Name IN ({phaseCombined}))) OR FaultSummary.FaultType IN ({phaseCombined}))";
        }

        private string getEventCharacteristicFilter(EventSearchPostData postData)
        {

            List<string> characteristics = new();

            //Min and Max Durations
            if (postData.durationMin > 0)
            {
                string filt = $"((SELECT d.DurationCycles FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstDisturbanceID) >= {postData.durationMin} OR ";
                filt += $" FaultSummary.DurationCycles >= {postData.durationMin})";
                characteristics.Add(filt);
            }
            if (postData.durationMax > 0)
            {
                string filt = $" ((SELECT d.DurationCycles FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstDisturbanceID) <= {postData.durationMax} OR";
                filt += $" FaultSummary.DurationCycles <= {postData.durationMax})";
                characteristics.Add(filt);
            }

            // Sag Min and Max
            if (postData.sagMin > 0)
            {
                string filt;
                if (postData.sagType == "LL")
                    filt = $"((SELECT d.PerUnitMagnitude FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstLLDisturbanceID) >= {postData.sagMin} OR (SELECT d.EventTypeID FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstDisturbanceID) IN (SELECT ID FROM EventType WHERE Name <> 'Sag'))";
                else if (postData.sagType == "LN")
                    filt = $"((SELECT d.PerUnitMagnitude FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstLNDisturbanceID) >= {postData.sagMin} OR (SELECT d.EventTypeID FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstDisturbanceID) IN (SELECT ID FROM EventType WHERE Name <> 'Sag'))";
                else
                    filt = $"((SELECT d.PerUnitMagnitude FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstLLDisturbanceID) >= {postData.sagMin} OR (SELECT d.PerUnitMagnitude FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstLNDisturbanceID) >= {postData.sagMin} OR (SELECT d.EventTypeID FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstDisturbanceID) IN (SELECT ID FROM EventType WHERE Name <> 'Sag'))";
                characteristics.Add(filt);
            }
            if (postData.sagMax > 0)
            {
                string filt;
                if (postData.sagType == "LL")
                    filt = $"((SELECT d.PerUnitMagnitude FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstLLDisturbanceID) <= {postData.sagMax} OR (SELECT d.EventTypeID FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstDisturbanceID) IN (SELECT ID FROM EventType WHERE Name <> 'Sag'))";
                else if (postData.sagType == "LN")
                    filt = $"((SELECT d.PerUnitMagnitude FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstLNDisturbanceID) <= {postData.sagMax} OR (SELECT d.EventTypeID FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstDisturbanceID) IN (SELECT ID FROM EventType WHERE Name <> 'Sag'))";
                else
                    filt = $"((SELECT d.PerUnitMagnitude FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstLLDisturbanceID) <= {postData.sagMax} OR (SELECT d.PerUnitMagnitude FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstLNDisturbanceID) <= {postData.sagMax} OR (SELECT d.EventTypeID FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstDisturbanceID) IN (SELECT ID FROM EventType WHERE Name <> 'Sag'))";
                characteristics.Add(filt);
            }

            // Swell Min and Max
            if (postData.swellMin > 0)
            {
                string filt;
                if (postData.swellType == "LL")
                    filt = $"((SELECT d.PerUnitMagnitude FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstLLDisturbanceID) >= {postData.swellMin} OR (SELECT d.EventTypeID FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstDisturbanceID) IN (SELECT ID FROM EventType WHERE Name <> 'Swell'))";
                else if (postData.swellType == "LN")
                    filt = $"((SELECT d.PerUnitMagnitude FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstLNDisturbanceID) >= {postData.swellMin} OR (SELECT d.EventTypeID FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstDisturbanceID) IN (SELECT ID FROM EventType WHERE Name <> 'Swell'))";
                else
                    filt = $"((SELECT d.PerUnitMagnitude FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstLLDisturbanceID) >= {postData.swellMin} OR (SELECT d.PerUnitMagnitude FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstLNDisturbanceID) >= {postData.swellMin} OR (SELECT d.EventTypeID FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstDisturbanceID) IN (SELECT ID FROM EventType WHERE Name <> 'Swell'))";
                characteristics.Add(filt);
            }
            if (postData.swellMax > 0)
            {
                string filt;
                if (postData.swellType == "LL")
                    filt = $"((SELECT d.PerUnitMagnitude FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstLLDisturbanceID) <= {postData.swellMax} OR (SELECT d.EventTypeID FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstDisturbanceID) IN (SELECT ID FROM EventType WHERE Name <> 'Swell'))";
                else if (postData.swellType == "LN")
                    filt = $"((SELECT d.PerUnitMagnitude FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstLNDisturbanceID) <= {postData.swellMax} OR (SELECT d.EventTypeID FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstDisturbanceID) IN (SELECT ID FROM EventType WHERE Name <> 'Swell'))";
                else
                    filt = $"((SELECT d.PerUnitMagnitude FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstLLDisturbanceID) <= {postData.swellMax} OR (SELECT d.PerUnitMagnitude FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstLNDisturbanceID) <= {postData.swellMax} OR (SELECT d.EventTypeID FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstDisturbanceID) IN (SELECT ID FROM EventType WHERE Name <> 'Swell'))";
                characteristics.Add(filt);
            }

            // Transient min and max
            if (postData.transientMin > 0)
            {
                string filt;
                if (postData.transientType == "LL")
                    filt = $"((SELECT d.PerUnitMagnitude FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstLLDisturbanceID) >= {postData.transientMin} OR (SELECT d.EventTypeID FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstDisturbanceID) IN (SELECT ID FROM EventType WHERE Name <> 'Transient'))";
                else if (postData.transientType == "LN")
                    filt = $"((SELECT d.PerUnitMagnitude FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstLNDisturbanceID) >= {postData.transientMin} OR (SELECT d.EventTypeID FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstDisturbanceID) IN (SELECT ID FROM EventType WHERE Name <> 'Transient'))";
                else
                    filt = $"((SELECT d.PerUnitMagnitude FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstLLDisturbanceID) >= {postData.transientMin} OR (SELECT d.PerUnitMagnitude FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstLNDisturbanceID) >= {postData.transientMin} OR (SELECT d.EventTypeID FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstDisturbanceID) IN (SELECT ID FROM EventType WHERE Name <> 'Transient'))";
                characteristics.Add(filt);
            }
            if (postData.transientMax > 0)
            {
                string filt;
                if (postData.transientType == "LL")
                    filt = $"((SELECT d.PerUnitMagnitude FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstLLDisturbanceID) <= {postData.transientMax} OR (SELECT d.EventTypeID FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstDisturbanceID) IN (SELECT ID FROM EventType WHERE Name <> 'Transient'))";
                else if (postData.transientType == "LN")
                    filt = $"((SELECT d.PerUnitMagnitude FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstLNDisturbanceID) <= {postData.transientMax} OR (SELECT d.EventTypeID FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstDisturbanceID) IN (SELECT ID FROM EventType WHERE Name <> 'Transient'))";
                else
                    filt = $"((SELECT d.PerUnitMagnitude FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstLLDisturbanceID) <= {postData.transientMax} OR (SELECT d.PerUnitMagnitude FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstLNDisturbanceID) <= {postData.transientMax} OR (SELECT d.EventTypeID FROM Disturbance d WHERE d.ID = EventWorstDisturbance.WorstDisturbanceID) IN (SELECT ID FROM EventType WHERE Name <> 'Transient'))";
                characteristics.Add(filt);
            }

            // Mag Dur Curves
            if (!postData.curveOutside || !postData.curveInside)
            {
                string filt = $"( (SELECT d.DurationSeconds FROM Disturbance d WHERE d.ID = WorstDisturbanceID) IS NOT NULL AND (SELECT d.PerUnitMagnitude FROM Disturbance d WHERE d.ID = WorstDisturbanceID) IS NOT NULL AND (SELECT TOP 1 Area FROM StandardMagDurCurve WHERE ID = {postData.curveID})";
                filt += $".STContains(geometry::Point((SELECT d.DurationSeconds FROM Disturbance d WHERE d.ID = WorstDisturbanceID),(SELECT d.PerUnitMagnitude FROM Disturbance d WHERE d.ID = WorstDisturbanceID),0)) = {(postData.curveInside ? 1 : 0)})";
                characteristics.Add(filt);
            }

            return string.Join(" AND ", characteristics);
        }

        private string getAssetFilters(EventSearchPostData postData)
        {
            List<string> assets = new();

            if (postData.meterIDs.Count() > 0)
                assets.Add($"Event.MeterID IN ({string.Join(",", postData.meterIDs)})");

            if (postData.assetIDs.Count() > 0)
                assets.Add($"Event.AssetID IN ({string.Join(",", postData.assetIDs)})");

            if (postData.locationIDs.Count() > 0)
            {
                string filt = $"(Event.AssetID IN (SELECT AssetLocation.AssetID FROM AssetLocation WHERE AssetLocation.LocationID IN ({string.Join(",", postData.locationIDs)}))";
                filt += $" OR Event.MeterID IN (SELECT Meter.ID FROM Meter WHERE Meter.LocationID IN ({string.Join(",", postData.locationIDs)})))";
                assets.Add(filt);
            }

            if (postData.groupIDs.Count() > 0)
            {
                string filt = $"(Event.AssetID IN (SELECT AssetAssetGroup.AssetID FROM AssetAssetGroup WHERE AssetAssetGroup.AssetGroupID IN ({string.Join(",", postData.groupIDs)}))";
                filt += $" OR Event.MeterID IN (SELECT MeterAssetGroup.MeterID FROM MeterAssetGroup WHERE MeterAssetGroup.AssetGroupID IN ({string.Join(",", postData.groupIDs)})))";
                assets.Add(filt);
            }

            return string.Join(" AND ", assets);
        }


        [Route("GetEventSearchMeterMakes"), HttpGet]
        public IHttpActionResult GetEventSearchMeterMakes()
        {
            using (AdoDataConnection connection = new(SettingsCategory))
            {

                DataTable table = connection.RetrieveData(@"SELECT DISTINCT Make FROM Meter");

                return Ok(table.Select().Select(x => x["Make"].ToString()));
            }

        }

        [Route("GetEventSearchMeterModels/{make}"), HttpGet]
        public IHttpActionResult GetEventSearchMeterModels(string make)
        {
            using (AdoDataConnection connection = new(SettingsCategory))
            {

                DataTable table = connection.RetrieveData(@"SELECT DISTINCT Model FROM Meter WHERE Make = {0}", make);

                return Ok(table.Select().Select(x => x["Model"].ToString()));
            }

        }

        [Route("GetRelayPerformance"), HttpGet]
        public DataTable GetRelayPerformance()
        {
            Dictionary<string, string> query = Request.QueryParameters();
            int eventID = int.Parse(query["eventId"]);
            if (eventID <= 0) return new DataTable();
            using (AdoDataConnection connection = new(SettingsCategory))
            {
                Event evt = new TableOperations<Event>(connection).QueryRecordWhere("ID = {0}", eventID);
                return RelayHistoryTable(evt.AssetID, -1);
            }

        }

        [Route("getCapBankAnalytic"), HttpGet]
        public DataTable GetCapBankAnalytic()
        {
            Dictionary<string, string> query = Request.QueryParameters();
            int eventID = int.Parse(query["eventId"]);
            if (eventID <= 0) return new DataTable();
            using (AdoDataConnection connection = new(SettingsCategory))
            {
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

                return connection.RetrieveData(sqlQuery, eventID); ;
            }

        }

        private DataTable RelayHistoryTable(int relayID, int eventID)
        {
            DataTable dataTable;

            using (AdoDataConnection connection = new(SettingsCategory))
            {
                if (eventID > 0) { dataTable = connection.RetrieveData("SELECT * FROM BreakerHistory WHERE BreakerID = {0} AND EventID = {1}", relayID, eventID); }
                else { dataTable = connection.RetrieveData("SELECT * FROM BreakerHistory WHERE BreakerID = {0}", relayID); }
            }
            return dataTable;
        }

        #endregion

    }
}
