using GSF;
using GSF.Data;
using GSF.Web;
using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.Linq;
using System.Runtime.Caching;
using System.Web;
using System.Web.Http;

namespace SEBrowser.Controllers
{
    [RoutePrefix("api/OpenXDA")]

    public class OpenXDAController: ApiController
    {
        #region [ Members ]
        const string SettingsCategory = "dbOpenXDA";
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
            public bool line { get; set; }
            public bool bus { get; set; }
            public bool breaker { get; set; }
            public bool transformer { get; set; }
            public bool capacitorBank { get; set; }
            public bool dfr { get; set; }
            public bool pqMeter { get; set; }
            public bool g200 { get; set; }
            public bool one00to200 { get; set; }
            public bool thirty5to100 { get; set; }
            public bool oneTo35 { get; set; }
            public bool l1 { get; set; }
            public bool faults { get; set; }
            public bool sags { get; set; }
            public bool swells { get; set; }
            public bool interruptions { get; set; }
            public bool breakerOps { get; set; }
            public bool transients { get; set; }
            public bool relayTCE { get; set; }
            public bool others { get; set; }
            public string date { get; set; }
            public string time { get; set; }
            public int windowSize { get; set; }
            public int timeWindowUnits { get; set; }
            public string make { get; set; }
            public string model { get; set; }
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

        [Route("GetEventSearchData"), HttpPost]
        public DataTable GetEventSearchData(EventSearchPostData postData)
        {
            using (AdoDataConnection connection = new AdoDataConnection(SettingsCategory))
            {
                DateTime dateTime = DateTime.ParseExact(postData.date + " " + postData.time, "MM/dd/yyyy HH:mm:ss.fff", new CultureInfo("en-US"));
                string timeWindowUnits = ((TimeWindowUnits)postData.timeWindowUnits).GetDescription();
                List<string> eventTypes = new List<string>();

                if (postData.faults)
                    eventTypes.Add(" ((EventType.Name  = 'Fault' AND (SELECT COUNT(*) FROM BreakerOperation WHERE BreakerOperation.EventID = Event.ID) = 0)  OR (EventType.Name  = 'RecloseIntoFault'))");
                if (postData.breakerOps)
                    eventTypes.Add("((EventType.Name  = 'Fault' AND (SELECT COUNT(*) FROM BreakerOperation WHERE BreakerOperation.EventID = Event.ID) > 0) OR (EventType.Name  = 'BreakerOpen'))");
                if (postData.sags)
                    eventTypes.Add("EventType.Name  = 'Sag'");
                if (postData.swells)
                    eventTypes.Add("EventType.Name  = 'Swell'");
                if (postData.interruptions)
                    eventTypes.Add("EventType.Name  = 'Interruption'");
                if (postData.transients)
                    eventTypes.Add("EventType.Name  = 'Transient'");
                if (postData.others)
                    eventTypes.Add("EventType.Name  = 'Other'");
                if (postData.relayTCE)
                    eventTypes.Add("(SELECT COUNT(RelayPerformance.ID) FROM RelayPerformance WHERE RelayPerformance.EventID = Event.ID) > 0");
                if (!eventTypes.Any())
                    eventTypes.Add("EventType.Name  = ''");

                string eventTypeRestriction = $"({string.Join(" OR ", eventTypes)})";

                List<string> voltageClasses = new List<string>();

                if (postData.g200)
                    voltageClasses.Add(" Asset.VoltageKV > 200 ");
                if (postData.one00to200)
                    voltageClasses.Add(" (Asset.VoltageKV > 100 AND Asset.VoltageKV <= 200) ");
                if (postData.thirty5to100)
                    voltageClasses.Add(" (Asset.VoltageKV > 35 AND Asset.VoltageKV <= 100) ");
                if (postData.oneTo35)
                    voltageClasses.Add(" (Asset.VoltageKV > 1 AND Asset.VoltageKV <= 35) ");
                if (postData.l1)
                    voltageClasses.Add(" Asset.VoltageKV <= 1 ");
                if (!voltageClasses.Any())
                    voltageClasses.Add(" Asset.VoltageKV = -1234567 ");

                string voltageClassRestriction = $"({string.Join(" OR ", voltageClasses)})";

                List<string> assetTypes = new List<string>();

                if (postData.line)
                    assetTypes.Add(" AssetType.Name = 'Line'");
                if (postData.bus)
                    assetTypes.Add(" AssetType.Name = 'Bus'");
                if (postData.transformer)
                    assetTypes.Add(" AssetType.Name = 'Transformer'");
                if (postData.breaker)
                    assetTypes.Add(" AssetType.Name = 'Breaker'");
                if (postData.capacitorBank)
                    assetTypes.Add(" AssetType.Name = 'CapacitorBank'");
                if (!assetTypes.Any())
                    assetTypes.Add(" AssetType.Name = 'None'");

                string assetTypesRestriction = $"({string.Join(" OR ", assetTypes)})";

                List<string> meterType = new List<string>();

                if (postData.dfr)
                    meterType.Add(" (SELECT COUNT(AssetID) FROM MeterAsset as ml WHERE event.MeterID = ml.MeterID) > 1 ");
                if (postData.pqMeter)
                    meterType.Add(" (SELECT COUNT(AssetID) FROM MeterAsset as ml WHERE event.MeterID = ml.MeterID) = 1 ");
                if (!meterType.Any())
                    meterType.Add(" (SELECT COUNT(AssetID) FROM MeterAsset as ml WHERE event.MeterID = ml.MeterID) < 1 ");

                string meterTypeRestriction = $"({string.Join(" OR ", meterType)})";

                string meterMakeRestriction = $"";
                if (postData.make != "All" && postData.model != "All")
                    meterMakeRestriction = $" AND Meter.Make = '{postData.make}' AND Meter.Model = '{postData.model}' ";
                else if (postData.make != "All")
                    meterMakeRestriction = $" AND Meter.Make = '{postData.make}'  ";

                string query = @" 
                    SELECT
                        TOP 100
	                    Event.ID as EventID,
	                    Asset.AssetKey as AssetName,
	                    AssetType.Name as AssetType,
	                    Asset.VoltageKV as VoltageClass,
	                    EventType.Name as EventType,
	                    Event.StartTime as FileStartTime,
	                    (SELECT COUNT(*) FROM BreakerOperation WHERE BreakerOperation.EventID = Event.ID) as BreakerOperation,
                        (SELECT COUNT(Channel.ID) FROM Channel LEFT JOIN MeasurementType ON Channel.MeasurementTypeID = MeasurementType.ID WHERE MeasurementType.Name = 'TripCoilCurrent' AND Channel.AssetID = Asset.ID ) as TripCoilCount
                    FROM
	                    Event JOIN
	                    EventType ON Event.EventTypeID = EventType.ID JOIN
	                    Asset ON Event.AssetID = Asset.ID JOIN
                        Meter ON Event.MeterID = Meter.ID JOIN
	                    AssetType ON Asset.AssetTypeID = AssetType.ID
                    WHERE
                        Event.StartTime BETWEEN DATEADD(" + timeWindowUnits + @", " + (-1 * postData.windowSize).ToString() + @", {0}) AND
                                                DATEADD(" + timeWindowUnits + @", " + (postData.windowSize).ToString() + @", {0}) AND
                    " + eventTypeRestriction + @" AND
                    " + voltageClassRestriction + @" AND
                    " + assetTypesRestriction + @" AND
                    " + meterTypeRestriction + meterMakeRestriction + @" 
                ";

                DataTable table = connection.RetrieveData(query, dateTime);

                return table;
            }

        }


        [Route("GetEventSearchAssetVoltageDisturbances"), HttpGet]
        public DataTable GetEventSearchAssetVoltageDisturbances()
        {
            using (AdoDataConnection connection = new AdoDataConnection(SettingsCategory))
            {
                Dictionary<string, string> query = Request.QueryParameters();
                int eventID = int.Parse(query["EventID"]);

                DataTable table = connection.RetrieveData(@" 
                    SELECT 
	                    EventType.Name as EventType,
	                    Phase.Name as Phase,
	                    Disturbance.PerUnitMagnitude,
	                    Disturbance.DurationSeconds,
	                    Disturbance.StartTime
                    FROM 
	                    Disturbance JOIN
	                    Phase ON Disturbance.PhaseID = Phase.ID JOIN
	                    EventType ON Disturbance.EventTypeID = EventType.ID
                    WHERE
	                    Phase.Name != 'WORST' AND  
	                    eventid = {0}"
                        , eventID
                    );

                return table;
            }

        }

        [Route("GetEventSearchFaultSegments"), HttpGet]
        public DataTable GetEventSearchFaultSegments()
        {
            using (AdoDataConnection connection = new AdoDataConnection(SettingsCategory))
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
                        SegmentType.Name != 'Fault'"
                        , eventID
                    );

                return table;
            }

        }

        [Route("GetEventSearchHistory"), HttpGet]
        public DataTable GetEventSearchHistory()
        {
            using (AdoDataConnection connection = new AdoDataConnection(SettingsCategory))
            {
                Dictionary<string, string> query = Request.QueryParameters();
                int eventID = int.Parse(query["EventID"]);

                DataTable table = connection.RetrieveData(@" 
                    SELECT
	                    EventType.Name as EventType,
	                    Event.StartTime,
	                    Event.ID
                    FROM
	                    Event JOIN
	                    EventType ON Event.EventTypeID = EventType.ID JOIN
	                    Event as OrgEvt ON Event.MeterID = OrgEvt.MeterID AND Event.LineID = OrgEvt.LineID AND Event.ID != OrgEvt.ID
                    WHERE 
	                    OrgEvt.ID = {0}"
                    , eventID);

                return table;
            }

        }


        [Route("GetEventSearchMeterMakes"), HttpGet]
        public IHttpActionResult GetEventSearchMeterMakes()
        {
            using (AdoDataConnection connection = new AdoDataConnection(SettingsCategory))
            {

                DataTable table = connection.RetrieveData(@"SELECT DISTINCT Make FROM Meter");

                return Ok(table.Select().Select(x => x["Make"].ToString()));
            }

        }

        [Route("GetEventSearchMeterModels/{make}"), HttpGet]
        public IHttpActionResult GetEventSearchMeterModels(string make)
        {
            using (AdoDataConnection connection = new AdoDataConnection(SettingsCategory))
            {

                DataTable table = connection.RetrieveData(@"SELECT DISTINCT Model FROM Meter WHERE Make = {0}", make);

                return Ok(table.Select().Select(x => x["Model"].ToString()));
            }

        }



        #endregion

    }
}