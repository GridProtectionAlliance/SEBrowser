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
using openXDA.Model;
using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Runtime.Caching;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace SEBrowser.Controllers
{
    [RoutePrefix("api/OpenXDA")]

    public class OpenXDAController : ApiController
    {
        #region [ Members ]
        const string SettingsCategory = "systemSettings";
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
            public string transientType { get; set; }
            public string sagType { get; set; }
            public string swellType { get; set; }
            public List<int> meterIDs { get; set; }
            public List<int> typeIDs { get; set; }
            public List<int> assetIDs { get; set; }
            public List<int> groupIDs { get; set; }
            public List<int> locationIDs { get; set; }
            public string numberResults { get; set; }
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
                DateTime dateTime = DateTime.ParseExact(postData.date + " " + postData.time, "MM/dd/yyyy HH:mm:ss.fff", new CultureInfo("en-US"));

                string eventType = getEventTypeFilter(postData);
                string phase = getPhaseFilter(postData);
                string eventCharacteristic = getEventCharacteristicFilter(postData);
                string asset = getAssetFilters(postData);

                string filters = $"{(string.IsNullOrEmpty(eventType) ? "" : $"AND ({eventType})")} ";
                filters += $"{(string.IsNullOrEmpty(phase) ? "" : $"AND ({phase})")}  ";
                filters += $"{(string.IsNullOrEmpty(eventCharacteristic) ? "" : $"AND {eventCharacteristic}")} ";
                filters += $"{(string.IsNullOrEmpty(asset) ? "" : $"AND {asset}")}";

                string query =
                    $@"SELECT  
                        [SEBrowser.EventSearchEventView].*, 
                        [SEBrowser.EventSearchDetailsView].* 
                    FROM 
                        ( 
                            SELECT TOP {postData.numberResults ?? "100"} 
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
                            )";

                DataTable table = connection.RetrieveData(query, dateTime);

                return table;
            }

        }

        private string getTimeFilter(EventSearchPostData postData)
        {
            string timeWindowUnits = ((TimeWindowUnits)postData.timeWindowUnits).GetDescription();

            return $"Event.StartTime BETWEEN DATEADD({timeWindowUnits},{-1 * postData.windowSize}, {{0}}) AND DATEADD({timeWindowUnits},{postData.windowSize}, {{0}})";
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

        [Route("GetEventSearchAssetVoltageDisturbances"), HttpGet]
        public DataTable GetEventSearchAssetVoltageDisturbances()
        {
            using (AdoDataConnection connection = new(SettingsCategory))
            {
                Dictionary<string, string> query = Request.QueryParameters();
                int eventID = int.Parse(query["EventID"]);

                DataTable table = connection.RetrieveData(@" 
SELECT 
                EventType.Name as EventType,
                Phase.Name as Phase,
                Disturbance.PerUnitMagnitude,
                Disturbance.DurationSeconds,
                Disturbance.StartTime,
                DisturbanceSeverity.SeverityCode,
                CASE 
                    WHEN Disturbance.ID = EventWorstDisturbance.WorstDisturbanceID THEN 1
                    ELSE 0
                END as IsWorstDisturbance
            FROM 
                Disturbance 
                JOIN Phase ON Disturbance.PhaseID = Phase.ID 
                JOIN EventType ON Disturbance.EventTypeID = EventType.ID 
                JOIN DisturbanceSeverity ON Disturbance.ID = DisturbanceSeverity.DisturbanceID
                JOIN EventWorstDisturbance ON Disturbance.EventID = EventWorstDisturbance.EventID
            WHERE
                Phase.Name != 'WORST' AND  
                Disturbance.EventID = {0}
            ORDER BY Disturbance.StartTime
            ", eventID
                ); 
                return table;
            }
        }

        [Route("GetEventSearchFaultSegments"), HttpGet]
        public DataTable GetEventSearchFaultSegments()
        {
            using (AdoDataConnection connection = new(SettingsCategory))
            {
                Dictionary<string, string> query = Request.QueryParameters();
                int eventID = int.Parse(query["EventID"]);

                DataTable table = connection.RetrieveData(@" 
                    SELECT
	                    SegmentType.Name as SegmentType, 
	                    FaultSegment.StartTime,
	                    FaultSegment.EndTime
                    FROM
	                    FaultSegment JOIN
	                    SegmentType ON FaultSegment.SegmentTypeID = SegmentType.ID	                    
                    WHERE
                        eventid = {0} AND
                        SegmentType.Name != 'Fault'
                    ORDER BY FaultSegment.StartTime
                    ", eventID
                    );

                return table;
            }

        }

        [Route("GetEventSearchHistory/{eventID:int}/{count:int}"), HttpGet]
        public DataTable GetEventSearchHistory(int eventID, int count = 10)
        {
            using (AdoDataConnection connection = new(SettingsCategory))
            {
                DataTable table = connection.RetrieveData(@" 
                    SELECT
                        TOP " + count.ToString() + @"
	                    EventType.Name as EventType,
	                    Event.StartTime,
	                    Event.ID
                    FROM
	                    Event JOIN
	                    EventType ON Event.EventTypeID = EventType.ID JOIN
	                    Event as OrgEvt ON Event.MeterID = OrgEvt.MeterID AND Event.AssetID = OrgEvt.AssetID AND Event.ID != OrgEvt.ID
                    WHERE 
	                    OrgEvt.ID = {0}
                    ORDER BY 
                        Event.StartTime DESC
                    "
                    , eventID);

                return table;
            }

        }

        [Route("GetEventSearchHistoryStats/{eventID:int}"), HttpGet]
        public DataTable GetEventSearchHistoryStats(int eventID, int count = 10)
        {
            using (AdoDataConnection connection = new(SettingsCategory))
            {
                DataTable table = connection.RetrieveData(@" 
                    SELECT
	                    ROUND(MAX(VPeak)/Asset.VoltageKV/1000, 3) as VPeakMax,
	                    MAX(VMax) as VMax,
	                    MIN(VMin) as VMin,
	                    MAX(IMax) as IMax,
	                    MAX(I2tMax) as I2tMax,
	                    ROUND(MAX(IPeak),3) as IPeakMax,
	                    ROUND(AVG(InitialMW),3) as AVGMW
                    FROM
	                    Asset  JOIN
	                    Event ON Event.AssetID = Asset.ID JOIN
	                    EventStat ON EventStat.EventID = Event.ID  OUTER APPLY
	                    (SELECT ROUND(MAX(VMax)/Asset.VoltageKV/1000,3) as VMax FROM (VALUES(VAMax), (VBMax), (VCMax), (VABMax), (VBCMax), (VCAMax)) AS VMaxView(VMax)) as VMax OUTER APPLY
	                    (SELECT ROUND(MIN(VMin)/Asset.VoltageKV/1000,3) as VMin FROM (VALUES(VAMin), (VBMin), (VCMin), (VABMin), (VBCMin), (VCAMin)) AS VMinView(VMin)) as VMin OUTER APPLY
	                    (SELECT ROUND(MAX(IMax),3) as IMax FROM (VALUES(IAMax), (IBMax), (ICMax)) AS IMaxView(IMax)) as IMax OUTER APPLY
	                    (SELECT ROUND(MAX(I2tMax),3) as I2tMax FROM (VALUES(IA2t), (IB2t), (IC2t)) AS I2tView(I2tMax)) as I2tMax
                    WHERE Asset.ID = (SELECT AssetID FROM Event WHERE ID = {0})
                    GROUP BY VoltageKV
                    "
                    , eventID);

                return table;
            }

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

        [Route("GetTimeCorrelatedSags"), HttpGet]
        public DataTable GetTimeCorrelatedSags()
        {
            const string TimeCorrelatedSagsSQL =
                "SELECT " +
                "    Event.ID AS EventID, " +
                "    EventType.Name AS EventType, " +
                "    FORMAT(Sag.PerUnitMagnitude * 100.0, '0.#') AS SagMagnitudePercent, " +
                "    FORMAT(Sag.DurationSeconds * 1000.0, '0') AS SagDurationMilliseconds, " +
                "    FORMAT(Sag.DurationCycles, '0.##') AS SagDurationCycles, " +
                "    Event.StartTime, " +
                "    Meter.Name AS MeterName, " +
                "    Asset.AssetName " +
                "FROM " +
                "    Event JOIN " +
                "    EventType ON Event.EventTypeID = EventType.ID JOIN " +
                "    Meter ON Event.MeterID = Meter.ID JOIN " +
                "    MeterAsset ON " +
                "        Event.MeterID = MeterAsset.MeterID AND " +
                "        Event.AssetID = MeterAsset.AssetID JOIN" +
                "   Asset ON Asset.ID = MeterAsset.AssetID  CROSS APPLY " +
                "    ( " +
                "        SELECT TOP 1 " +
                "            Disturbance.PerUnitMagnitude, " +
                "            Disturbance.DurationSeconds, " +
                "            Disturbance.DurationCycles " +
                "        FROM " +
                "            Disturbance JOIN " +
                "            EventType DisturbanceType ON Disturbance.EventTypeID = DisturbanceType.ID JOIN " +
                "            Phase ON " +
                "                Disturbance.PhaseID = Phase.ID AND " +
                "                Phase.Name = 'Worst' " +
                "        WHERE " +
                "            Disturbance.EventID = Event.ID AND " +
                "            DisturbanceType.Name = 'Sag' AND " +
                "            Disturbance.StartTime <= {1} AND " +
                "            Disturbance.EndTime >= {0} " +
                "        ORDER BY PerUnitMagnitude DESC " +
                "    ) Sag " +
                "ORDER BY " +
                "    Event.StartTime, " +
                "    Sag.PerUnitMagnitude";

            Dictionary<string, string> query = Request.QueryParameters();
            int eventID = int.Parse(query["eventId"]);

            if (eventID <= 0) return new DataTable();
            using (AdoDataConnection connection = new(SettingsCategory))
            {
                double timeTolerance = connection.ExecuteScalar<double>("SELECT Value FROM Setting WHERE Name = 'TimeTolerance'");
                DateTime startTime = connection.ExecuteScalar<DateTime>("SELECT StartTime FROM Event WHERE ID = {0}", eventID);
                DateTime endTime = connection.ExecuteScalar<DateTime>("SELECT EndTime FROM Event WHERE ID = {0}", eventID);
                DateTime adjustedStartTime = startTime.AddSeconds(-timeTolerance);
                DateTime adjustedEndTime = endTime.AddSeconds(timeTolerance);
                DataTable dataTable = connection.RetrieveData(TimeCorrelatedSagsSQL, adjustedStartTime, adjustedEndTime);
                return dataTable;
            }
        }

        [Route("GetFileName/{eventID:int}"), HttpGet]
        public IHttpActionResult GetFileName(int eventID)
        {
            using (AdoDataConnection connection = new(SettingsCategory))
            {
                DataFile dataFile = new TableOperations<DataFile>(connection).QueryRecord("FileSize DESC", new RecordRestriction("FileGroupID = (SELECT FileGroupID FROM Event WHERE ID = {0})", eventID));
                return Ok(dataFile.FilePath);
            }


        }

        [Route("GetMeterConfiguration/{eventID:int}"), HttpGet]
        public IHttpActionResult GetMeterConfiguration(int eventID)
        {
            using (AdoDataConnection connection = new(SettingsCategory))
            {
                const string SQL = @"
                SELECT
	                Meter.AssetKey as MeterKey,
	                FileGroupMeterConfiguration.MeterConfigurationID
                FROM
	                FileGroup JOIN
	                Event ON Event.FileGroupID = FileGroup.ID LEFT JOIN
	                FileGroupMeterConfiguration ON FileGroup.ID = FileGroupMeterConfiguration.FileGroupID JOIN
	                Meter ON Event.MeterID = Meter.ID
                WHERE
	                Event.ID = {0}
                ";

                DataTable dataTable = connection.RetrieveData(SQL, eventID);
                return Ok(dataTable.Select().First().ItemArray);
            }

        }


        [Route("GetMappedChannels/{eventID:int}"), HttpGet]
        public IHttpActionResult GetMappedChannels(int eventID)
        {
            using (AdoDataConnection connection = new(SettingsCategory))
            {
                const string SQL = @"
                    SELECT
	                    Channel.Name as Channel,
	                    Series.SourceIndexes as Mapping
                    FROM
	                    Event LEFT JOIN
	                    Channel ON Event.MeterID = Channel.MeterID AND Event.AssetID = Channel.AssetID LEFT JOIN
	                    Series ON Channel.ID = Series.ChannelID LEFT JOIN
	                    MeasurementType ON MeasurementType.ID = Channel.MeasurementTypeID LEFT JOIN
	                    Phase ON Channel.PhaseID = Phase.ID
                    WHERE 
	                    Event.ID = {0} AND Enabled = 1 AND Series.SourceIndexes !=''
                    ORDER BY
	                    MeasurementType.Name DESC, Phase.Name ASC
                ";

                DataTable dataTable = connection.RetrieveData(SQL, eventID);
                return Ok(dataTable);
            }


        }

        [Route("GetFaultInfo/{eventID:int}"), HttpGet]
        public IHttpActionResult GetFaultInfo(int eventID)
        {
            using (AdoDataConnection connection = new(SettingsCategory))
            {
                try
                {

                    const string SQL = @"
                        select 
	                        Distance,
	                        Asset.AssetKey as AssetName,
	                        Location.LocationKey as StationName,
                            FaultSummary.Inception, 
	                        Structure.Latitude,
	                        Structure.Longitude
                        FROM
	                        FaultSummary JOIN
	                        Event ON Event.ID = FaultSummary.EventID JOIN
	                        Asset ON Event.AssetID = Asset.ID JOIN
	                        Meter ON event.MeterID = MEter.ID JOIN
	                        Location ON Meter.LocationID = Location.ID LEFT JOIN 
                            NearestStructure ON FaultSummary.ID = NearestStructure.FaultSummaryID LEFT JOIN
	                        Structure ON NearestStructure.StructureID = Structure.ID
                        WHERE
	                        FaultSummary.EventID = {0} AND FaultSummary.IsSelectedAlgorithm = 1
                    ";

                    DataTable dataTable = connection.RetrieveData(SQL, eventID);

                    return Ok(dataTable);

                }
                catch (Exception ex)
                {
                    return InternalServerError(ex);
                }

            }

        }

        [Route("GetLightningInfo/{eventID:int}/{timeWindow:int}"), HttpGet]
        public IHttpActionResult GetLightningInfo(int eventID, int timeWindow)
        {
            using (AdoDataConnection connection = new(SettingsCategory))
            {
                try
                {

                    const string SQL = @"
                        SELECT
	                        Service, DisplayTime, Amplitude, Latitude,Longitude
                        FROM
	                        LightningStrike JOIN
	                        Event ON LightningStrike.EventID = Event.ID JOIN
	                        FaultSummary ON Event.ID = FaultSummary.EventID AND FaultSummary.IsSelectedAlgorithm = 1
                        WHERE
	                        Event.ID = {0} AND CAST(LightningStrike.DisplayTime as datetime2) BETWEEN DateAdd(S,-{1}, FaultSummary.Inception) AND  DateAdd(S,{1}, FaultSummary.Inception)
                    ";

                    DataTable dataTable = connection.RetrieveData(SQL, eventID, timeWindow);

                    return Ok(dataTable);

                }
                catch (Exception ex)
                {
                    return InternalServerError(ex);
                }

            }

        }

        [Route("LineParameters/{eventID:int}"), HttpGet]
        public IHttpActionResult GetLineParameters(int eventID)
        {
            using (AdoDataConnection connection = new(SettingsCategory))
            {
                try
                {

                    const string SQL = @"
                        SELECT
	                        LineView.*
                        FROM
	                        LineView JOIN
	                        Event ON Event.AssetID = LineView.ID
                        WHERE
	                        Event.ID = {0}
                    ";

                    DataTable dataTable = connection.RetrieveData(SQL, eventID);

                    return Ok(dataTable);

                }
                catch (Exception ex)
                {
                    return InternalServerError(ex);
                }

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



        [Route("GetData"), HttpGet]
        public IHttpActionResult GetData()
        {
            using (AdoDataConnection connection = new(SettingsCategory))
            {
                Dictionary<string, string> query = Request.QueryParameters();
                DateTime epoch = new(1970, 1, 1);

                int eventId = int.Parse(query["eventId"]);
                string type = query["type"];
                string dataType = query["dataType"];
                int pixels = (int)double.Parse(query["pixels"]);

                Event evt = new TableOperations<Event>(connection).QueryRecordWhere("ID = {0}", eventId);
                Meter meter = new TableOperations<Meter>(connection).QueryRecordWhere("ID = {0}", evt.MeterID);
                meter.ConnectionFactory = () => new AdoDataConnection(SettingsCategory);

                int calcCycle = connection.ExecuteScalar<int?>("SELECT CalculationCycle FROM FaultSummary WHERE EventID = {0} AND IsSelectedAlgorithm = 1", evt.ID) ?? -1;
                double systemFrequency = connection.ExecuteScalar<double?>("SELECT Value FROM Setting WHERE Name = 'SystemFrequency'") ?? 60.0;

                DateTime startTime = (query.ContainsKey("startDate") ? DateTime.Parse(query["startDate"]) : evt.StartTime);
                DateTime endTime = (query.ContainsKey("endDate") ? DateTime.Parse(query["endDate"]) : evt.EndTime);
                if (dataType == "Time")
                {
                    DataGroup dataGroup;
                    dataGroup = QueryDataGroup(eventId, meter);
                    Dictionary<string, IEnumerable<double[]>> returnData = new();
                    bool hasVoltLN = dataGroup.DataSeries.Select(x => x.SeriesInfo.Channel.Phase.Name).Where(x => x.Contains("N")).Any();
                    foreach (var series in dataGroup.DataSeries)
                    {
                        List<double[]> data = series.DataPoints.Select(dp => new double[2] { (dp.Time - epoch).TotalMilliseconds, dp.Value }).ToList();
                        if (type == "Voltage")
                        {
                            if (series.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && series.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && series.SeriesInfo.Channel.Phase.Name.Contains("N"))
                            {
                                if (!returnData.ContainsKey("V" + series.SeriesInfo.Channel.Phase.Name))
                                    returnData.Add("V" + series.SeriesInfo.Channel.Phase.Name, Downsample(data, pixels));
                            }
                            else if (series.SeriesInfo.Channel.MeasurementType.Name == "Voltage" && series.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous" && !hasVoltLN)
                            {
                                if (!returnData.ContainsKey("V" + series.SeriesInfo.Channel.Phase.Name))
                                    returnData.Add("V" + series.SeriesInfo.Channel.Phase.Name, Downsample(data, pixels));
                            }

                        }
                        else if (type == "TripCoilCurrent")
                        {
                            if (series.SeriesInfo.Channel.MeasurementType.Name == "TripCoilCurrent" && series.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous")
                            {
                                if (!returnData.ContainsKey("TCE" + series.SeriesInfo.Channel.Phase.Name))
                                    returnData.Add("TCE" + series.SeriesInfo.Channel.Phase.Name, Downsample(data, pixels));
                            }
                        }
                        else
                        {
                            if (series.SeriesInfo.Channel.MeasurementType.Name == "Current" && series.SeriesInfo.Channel.MeasurementCharacteristic.Name == "Instantaneous")
                            {
                                if (!returnData.ContainsKey("I" + series.SeriesInfo.Channel.Phase.Name))
                                    returnData.Add("I" + series.SeriesInfo.Channel.Phase.Name, Downsample(data, pixels));
                            }
                        }

                    }

                    return Ok(returnData);
                }

                return Ok();
            }

        }

        // getEventInformation
        [Route("GetEventInformation/{eventID:int}"), HttpGet]
        public IHttpActionResult GetEventInformation(int eventID)
        {
            using (AdoDataConnection connection = new(SettingsCategory))
            {
                int meterID = connection.ExecuteScalar<int>("SELECT MeterID FROM Event WHERE ID = {0}", eventID);
                var ids = new
                {
                    Meter = meterID,
                    Asset = connection.ExecuteScalar<int>("SELECT AssetID FROM Event WHERE ID = {0}", eventID),
                    Location = connection.ExecuteScalar<int>("SELECT LocationID FROM Meter WHERE ID = {0}", meterID)
                };
                return Ok(ids);
            }
        }


        private DataGroup QueryDataGroup(int eventID, Meter meter)
        {
            string target = $"DataGroup-{eventID}";

            Task<DataGroup> dataGroupTask = new(() =>
            {
                List<byte[]> data = ChannelData.DataFromEvent(eventID, () => new AdoDataConnection(SettingsCategory));
                return ToDataGroup(meter, data);

            });

            if (s_memoryCache.Add(target, dataGroupTask, new CacheItemPolicy { SlidingExpiration = TimeSpan.FromMinutes(10.0D) }))
                dataGroupTask.Start();

            dataGroupTask = (Task<DataGroup>)s_memoryCache.Get(target);

            return dataGroupTask.Result;

        }


        private DataGroup ToDataGroup(Meter meter, List<byte[]> data)
        {
            DataGroup dataGroup = new();
            dataGroup.FromData(meter, data);
            VIDataGroup vIDataGroup = new(dataGroup);
            return vIDataGroup.ToDataGroup();
        }

        private List<double[]> Downsample(List<double[]> series, int maxSampleCount)
        {
            List<double[]> data = new();
            DateTime epoch = new(1970, 1, 1);
            double startTime = series.First()[0];
            double endTime = series.Last()[0];
            int step = (int)(endTime * 1000 - startTime * 1000) / maxSampleCount;
            if (step < 1)
                step = 1;

            series = series.Where(x => x[0] >= startTime && x[0] <= endTime).ToList();

            int index = 0;

            for (double n = startTime * 1000; n <= endTime * 1000; n += 2 * step)
            {
                double[] min = null;
                double[] max = null;

                while (index < series.Count() && series[index][0] * 1000 < n + 2 * step)
                {
                    if (min == null || min[1] > series[index][1])
                        min = series[index];

                    if (max == null || max[1] <= series[index][1])
                        max = series[index];

                    ++index;
                }

                if (min != null)
                {
                    if (min[0] < max[0])
                    {
                        data.Add(min);
                        data.Add(max);
                    }
                    else if (min[0] > max[0])
                    {
                        data.Add(max);
                        data.Add(min);
                    }
                    else
                    {
                        data.Add(min);
                    }
                }
            }

            return data;

        }


        #endregion

    }
}
