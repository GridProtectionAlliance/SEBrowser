//******************************************************************************************************
//  CapBankReportController.cs - Gbtc
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
//  08/06/2020 - Christoph Lackner
//       Generated original version of source code.
//
//******************************************************************************************************
using FaultData.DataAnalysis;
using GSF;
using GSF.Collections;
using GSF.Data;
using GSF.Data.Model;
using GSF.Identity;
using GSF.NumericalAnalysis;
using GSF.Security;
using GSF.Web;
using GSF.Web.Model;
using MathNet.Numerics.IntegralTransforms;
using openXDA.Model;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Numerics;
using System.Runtime.Caching;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;

namespace PQDashboard.Controllers.CapBankReport
{
    [RoutePrefix("api/PQDashboard/CapBankReport")]
    public class CapBankReportController : ApiController
    {
        #region [ Members ]

        // Fields
        private DateTime m_epoch = new(1970, 1, 1);

        public class TrendSeries {
            public string color;
            public string label;
            public List<double[]> data;
            public string lineStyle;
            public bool includeLegend;
        }

        public class TrendingResponse
        {
            public List<TrendSeries> DeltaQ;
            public List<TrendSeries> Irms;
            public List<TrendSeries> DeltaIrms;
            public List<TrendSeries> Vrms;
            public List<TrendSeries> DeltaVrms;
            public List<TrendSeries> Q;
            public List<TrendSeries> Freq;
            public List<TrendSeries> THDV;
            public List<TrendSeries> THDI;
            public List<TrendSeries> DeltaTHDV;
            public List<TrendSeries> DeltaTHDI;
            public List<TrendSeries> SwitchingFreq;
            public List<TrendSeries> PeakV;
            public List<TrendSeries> Xcap;
            public List<TrendSeries> DeltaXcap;

            public List<TrendSeries> RestrikeDuration;
            public List<TrendSeries> RestrikeI;
            public List<TrendSeries> RestrikeV;
            public List<TrendSeries> PISDuration;
            public List<TrendSeries> PISZ;
            public List<TrendSeries> PISI;

            public List<TrendSeries> KFactor;
            public List<TrendSeries> RelaydV;
            public List<TrendSeries> RelayXLV;
            public List<TrendSeries> RelayV;
            public List<TrendSeries> RelayXV;
            public List<TrendSeries> Ineutral;
            public List<TrendSeries> BusZ; 
            public List<TrendSeries> BusV; 
            public List<TrendSeries> Unbalance;

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

        #endregion

        #region [ Constructors ]
        public CapBankReportController() : base() { }
        #endregion

        #region [ Static ]
        private static MemoryCache s_memoryCache;

        static CapBankReportController()
        {
            s_memoryCache = new MemoryCache("CapBankReport");
        }
        #endregion

        #region [ Methods ]

        [Route("GetSubstationData"), HttpGet]
        public DataTable GetSubstationData()
        {
            using (AdoDataConnection connection = new("systemSettings"))
            {
                DataTable table = new();

                using (IDbCommand sc = connection.Connection.CreateCommand())
                {
                    sc.CommandText = @" 
                     SELECT ID AS LocationID,
                        LocationKey,
                        Name AS AssetName 
                    FROM	
	                    Location
                    WHERE
	                    ( SELECT COUNT(Asset.ID) FROM Asset LEFT JOIN
			                    AssetType ON Asset.AssetTypeID = AssetType.ID LEFT JOIN
			                    AssetLocation ON Asset.ID = AssetLocation.AssetID 
		                    WHERE AssetType.Name = 'CapacitorBank' AND AssetLocation.LocationID = Location.ID) > 0
                    ORDER BY AssetName";

                    sc.CommandType = CommandType.Text;

                    IDataReader rdr = sc.ExecuteReader();
                    table.Load(rdr);

                    return table;
                }
            }

        }

        [Route("GetCapBankData"), HttpGet]
        public DataTable GetCapBankData()
        {
            Dictionary<string, string> query = Request.QueryParameters();
            int locationID = int.Parse(query["locationID"]);

            using (AdoDataConnection connection = new("systemSettings"))
            {
                DataTable table = new();

                using (IDbCommand sc = connection.Connection.CreateCommand())
                {
                    sc.CommandText = @" 
                   SELECT DISTINCT CapBank.ID AS Id,
                          CapBank.AssetKey,
                          CapBank.AssetName,  
                          CapBank.NumberOfBanks AS numBanks,
                          CapBank.Fused AS fused,
                          CapBank.Compensated AS compensated
                    FROM	
	                    CapBank LEFT JOIN AssetLocation ON CapBank.ID = AssetLocation.AssetID
                    WHERE
                        AssetLocation.LocationID = " + locationID + @"
                    ORDER BY AssetKey";

                    sc.CommandType = CommandType.Text;

                    IDataReader rdr = sc.ExecuteReader();
                    table.Load(rdr);

                    return table;
                }
            }

        }

        [Route("GetEventTable"), HttpGet]
        public DataTable GetEventTable()
        {
            Dictionary<string, string> query = Request.QueryParameters();
            int capBankId = int.Parse(query["capBankId"]);
            DateTime start = DateTime.ParseExact(query["start"], "MM/dd/yyyy HH:mm:ss.fff", new CultureInfo("en-US"));
            DateTime end = DateTime.ParseExact(query["end"], "MM/dd/yyyy HH:mm:ss.fff", new CultureInfo("en-US"));
            int selectedBank = int.Parse(query["bankNum"]);


            string timeRestriction = $"(CBAnalyticResult.Time BETWEEN DATEADD('{start}') AND DATEADD('{end}'))";
            string capBankRestriction = $"((SELECT AssetID FROM EVENT WHERE Event.ID = CBAnalyticResult.EventID) = {capBankId})";
            string bankNumRestriction = $"(CBAnalyticResult.EnergizedBanks = {selectedBank} OR CBAnalyticResult.DeEnergizedBanks = {selectedBank})";
            string otherFilter = ProcessFilter(query);

            if (string.IsNullOrEmpty(otherFilter))
                otherFilter = "1=1";

            if (selectedBank == -1)
                bankNumRestriction = "(1=1)";

            if (selectedBank == -2)
            {
                bankNumRestriction = "(CBAnalyticResult.EnergizedBanks = -1 AND CBAnalyticResult.DeEnergizedBanks = -1)";
            }

            using (AdoDataConnection connection = new("systemSettings"))
            {
                DataTable table = new();

                using (IDbCommand sc = connection.Connection.CreateCommand())
                {
                    sc.CommandText = $@"SELECT
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
                                        WHERE {capBankRestriction} AND {timeRestriction} AND {bankNumRestriction} AND ({otherFilter})
                                        ORDER BY CBAnalyticResult.Time";

                    sc.CommandType = CommandType.Text;

                    IDataReader rdr = sc.ExecuteReader();
                    table.Load(rdr);

                    return table;
                }
            }

        }

        [HttpGet, Route("SetCapBank/{id:int}/{bank:int}")]
        public IHttpActionResult GetSetCapBank(int id, int bank)
        {
            try
            {
                using (AdoDataConnection connection = new("systemSettings"))
                {
                    connection.ExecuteNonQuery($"UPDATE CBAnalyticResult SET EnergizedBanks = {bank} WHERE ID = {id}");
                }
                return Ok(1);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }

        }
           
        #region [ Trending Data ]

        [Route("GetTrend"), HttpGet]
        public TrendingResponse GetTrendData()
        {
            Dictionary<string, string> query = Request.QueryParameters();
            int capBankId = int.Parse(query["capBankId"]);
            DateTime start = DateTime.ParseExact(query["start"], "MM/dd/yyyy HH:mm:ss.fff", new CultureInfo("en-US"));
            DateTime end = DateTime.ParseExact(query["end"], "MM/dd/yyyy HH:mm:ss.fff", new CultureInfo("en-US"));
            int selectedBank = int.Parse(query["bankNum"]);
            

            string timeRestriction = $"(CBAnalyticResult.Time BETWEEN DATEADD('{start}') AND DATEADD('{end}'))";
            string capBankRestriction = $"((SELECT AssetID FROM EVENT WHERE Event.ID = CBAnalyticResult.EventID) = {capBankId})";
            string bankNumRestriction = $"(CBAnalyticResult.EnergizedBanks = {selectedBank} OR CBAnalyticResult.DeEnergizedBanks = {selectedBank})";
            string bankNumAfterRestriction = $"(CBAnalyticResult.StepPost = {selectedBank})";
            string bankNumBeforeRestriction = $"(CBAnalyticResult.StepPre = {selectedBank})";
            string otherFilter = ProcessFilter(query);


            TrendingResponse result = new()
            {
                DeltaQ = new List<TrendSeries>(),
                Irms = new List<TrendSeries>(),
                DeltaIrms = new List<TrendSeries>(),
                Vrms = new List<TrendSeries>(),
                DeltaVrms = new List<TrendSeries>(),
                Q = new List<TrendSeries>(),
                Freq = new List<TrendSeries>(),
                THDI = new List<TrendSeries>(),
                DeltaTHDI = new List<TrendSeries>(),
                THDV = new List<TrendSeries>(),
                DeltaTHDV = new List<TrendSeries>(),
                SwitchingFreq = new List<TrendSeries>(),
                PeakV = new List<TrendSeries>(),
                Xcap = new List<TrendSeries>(),
                DeltaXcap = new List<TrendSeries>(),

                RestrikeDuration = new List<TrendSeries>(),
                RestrikeI = new List<TrendSeries>(),
                RestrikeV = new List<TrendSeries>(),
                PISDuration = new List<TrendSeries>(),
                PISZ = new List<TrendSeries>(),
                PISI = new List<TrendSeries>(),

                KFactor = new List<TrendSeries>(),
                RelaydV = new List<TrendSeries>(),
                RelayXLV = new List<TrendSeries>(),
                RelayV = new List<TrendSeries>(),
                Ineutral = new List<TrendSeries>(),
                BusZ = new List<TrendSeries>(),
                BusV = new List<TrendSeries>(),
                Unbalance = new List<TrendSeries>(),
                RelayXV = new List<TrendSeries>(),
            };

            //Start with Events matching bankNumRestriction for each Phase....
            Dictionary<string, string> phaseColor = new();
            phaseColor.Add("AN", "#A30000");
            phaseColor.Add("BN", "#0029A3");
            phaseColor.Add("CN", "#007A29");

            using (AdoDataConnection connection = new("systemSettings"))
            {
                
                foreach (KeyValuePair<string, string> phase in phaseColor)
                {
                    string phaseRestriction = $"CBAnalyticResult.PhaseID = (SELECT ID FROM Phase WHERE Name = '{phase.Key}')";

                    if (selectedBank > -1)
                    {
                        DataTable table = GettrendTable(phaseRestriction, otherFilter, capBankRestriction, bankNumRestriction, timeRestriction);

                        // Create Arrays of Data so we can Check if there are any later.
                        List<double[]> DeltaQ = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, Math.Abs(row.Field<double?>("DeltaQ") ?? 0) }).ToList();
                        List<double[]> DeltaI = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("DeltaI") ?? 0 }).ToList();
                        List<double[]> DeltaV = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, (row.Field<double?>("DeltaV") ?? 0) * 100.0D }).ToList();
                        List<double[]> ResFreq = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("DeltaV") ?? 0 }).ToList();
                        List<double[]> DeltaITHD = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("DeltaITHD") ?? 0 }).ToList();
                        List<double[]> DeltaVTHD = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("DeltaVTHD") ?? 0 }).ToList();
                        List<double[]> SwitchingFreq = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("SwitchingFreq") ?? 0 }).ToList();
                        List<double[]> Vpeak = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, (row.Field<double?>("Vpeak") ?? 0)*100.0D }).ToList();

                        List<double[]> RestDur = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("RestrikeDuration") ?? 0 }).ToList();
                        List<double[]> RestI = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("RestrikeI") ?? 0 }).ToList();
                        List<double[]> RestV = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("RestrikeV") ?? 0 }).ToList();

                        List<double[]> PisDur = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("PISduration") ?? 0 }).ToList();
                        List<double[]> PisR = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("PISr") ?? 0 }).ToList();
                        List<double[]> PisX = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("PISx") ?? 0 }).ToList();

                        List<double[]> Kfactor = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("Kfactor") ?? 0 }).ToList();
                        List<double[]> XcapBank = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("XcapBank") ?? 0 }).ToList();
                        List<double[]> RelaydV = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("RelaydV") ?? 0 }).ToList();

                        List<double[]> Xlv = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("Xlv") ?? 0 }).ToList();
                        List<double[]> Xug = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("Xug") ?? 0 }).ToList();
                        List<double[]> Xlg = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("Xlg") ?? 0 }).ToList();

                        List<double[]> XVration = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("XVration") ?? 0 }).ToList();
                        List<double[]> PctIEC = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("PctIEC") ?? 0 }).ToList();
                        List<double[]> PctIEEE = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("PctIEEE") ?? 0 }).ToList();

                        List<double[]> RelayV = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("RelayV") ?? 0 }).ToList();
                        List<double[]> Ineutral = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("Ineutral") ?? 0 }).ToList();
                        List<double[]> BusZ0 = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("BusZ0") ?? 0 }).ToList();
                        List<double[]> BusV0 = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("BusV0") ?? 0 }).ToList();



                        table = GettrendTable(phaseRestriction, otherFilter, capBankRestriction, bankNumBeforeRestriction, timeRestriction);

                        List<double[]> Ipre = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("Ipre") ?? 0 }).ToList();
                        List<double[]> Vpre = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, (row.Field<double?>("Vpre") ?? 0)*100.0D }).ToList();
                        List<double[]> THDpre = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("THDpre") ?? 0 }).ToList();
                        List<double[]> THDVpre = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("THDVpre") ?? 0 }).ToList();
                        List<double[]> Xpre = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("Xpre") ?? 0 }).ToList();

                        table = GettrendTable(phaseRestriction, otherFilter, capBankRestriction, bankNumAfterRestriction, timeRestriction);

                        List<double[]> Ipost = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("Ipost") ?? 0 }).ToList();
                        List<double[]> Vpost = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, (row.Field<double?>("Vpost") ?? 0)*100.0 }).ToList();
                        List<double[]> THDpost = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("THDpost") ?? 0 }).ToList();
                        List<double[]> THDVpost = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("THDVpost") ?? 0 }).ToList();
                        List<double[]> Xpost = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("Xpost") ?? 0 }).ToList();

                        // remove any points that are NULL or 0, Assumption is exaclty 0 means no data was computed by EPRI analytic
                        DeltaQ = DeltaQ.Where(pt => pt[1] != 0).ToList();
                        DeltaI = DeltaI.Where(pt => pt[1] != 0).ToList();
                        DeltaV = DeltaV.Where(pt => pt[1] != 0).ToList();
                        ResFreq = ResFreq.Where(pt => pt[1] != 0).ToList();
                        DeltaVTHD = DeltaVTHD.Where(pt => pt[1] != 0).ToList();
                        DeltaITHD = DeltaITHD.Where(pt => pt[1] != 0).ToList();
                        SwitchingFreq = SwitchingFreq.Where(pt => pt[1] != 0).ToList();
                        Vpeak = Vpeak.Where(pt => pt[1] != 0).ToList();

                        Ipre = Ipre.Where(pt => pt[1] != 0).ToList();
                        Vpre = Vpre.Where(pt => pt[1] != 0).ToList();
                        THDpre = THDpre.Where(pt => pt[1] != 0).ToList();
                        THDVpre = THDVpre.Where(pt => pt[1] != 0).ToList();
                        Xpre = Xpre.Where(pt => pt[1] != 0).ToList();

                        Ipost = Ipost.Where(pt => pt[1] != 0).ToList();
                        Vpost = Vpost.Where(pt => pt[1] != 0).ToList();
                        THDpost = THDpost.Where(pt => pt[1] != 0).ToList();
                        THDVpost = THDVpost.Where(pt => pt[1] != 0).ToList();
                        Xpost = Xpost.Where(pt => pt[1] != 0).ToList();

                        RestDur = RestDur.Where(pt => pt[1] != 0).ToList();
                        RestI = RestI.Where(pt => pt[1] != 0).ToList();
                        RestV = RestV.Where(pt => pt[1] != 0).ToList();

                        PisDur = PisDur.Where(pt => pt[1] != 0).ToList();
                        PisR = PisR.Where(pt => pt[1] != 0).ToList();
                        PisX = PisX.Where(pt => pt[1] != 0).ToList();

                        Kfactor = Kfactor.Where(pt => pt[1] != 0).ToList();
                        XcapBank = XcapBank.Where(pt => pt[1] != 0).ToList();
                        RelaydV = RelaydV.Where(pt => pt[1] != 0).ToList();
                        Xlv = Xlv.Where(pt => pt[1] != 0).ToList();
                        Xug = Xug.Where(pt => pt[1] != 0).ToList();
                        Xlg = Xlg.Where(pt => pt[1] != 0).ToList();
                        XVration = XVration.Where(pt => pt[1] != 0).ToList();
                        PctIEC = PctIEC.Where(pt => pt[1] != 0).ToList();
                        PctIEEE = PctIEEE.Where(pt => pt[1] != 0).ToList();
                        RelayV = RelayV.Where(pt => pt[1] != 0).ToList();
                        Ineutral = Ineutral.Where(pt => pt[1] != 0).ToList();
                        BusZ0 = BusZ0.Where(pt => pt[1] != 0).ToList();
                        BusV0 = BusV0.Where(pt => pt[1] != 0).ToList();

                        if (DeltaQ.Count > 0)
                            result.DeltaQ.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "Change in Q Phase " + (phase.Key),
                                lineStyle = "-",
                                includeLegend = true,
                                data = DeltaQ
                            });

                        if (DeltaI.Count > 0)
                            result.DeltaIrms.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "Phase " + (phase.Key),
                                lineStyle = "-",
                                includeLegend = true,
                                data = DeltaI
                            });

                        if (DeltaV.Count > 0)
                            result.DeltaVrms.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "Phase " + (phase.Key),
                                lineStyle = "-",
                                includeLegend = true,
                                data = DeltaV
                            });

                        if (ResFreq.Count > 0)
                            result.Freq.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "Phase " + (phase.Key),
                                lineStyle = "-",
                                includeLegend = true,
                                data = ResFreq
                            });

                        if (Vpeak.Count > 0)
                            result.PeakV.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "Phase " + (phase.Key),
                                lineStyle = "-",
                                includeLegend = true,
                                data = Vpeak
                            });

                        if (DeltaITHD.Count > 0)
                            result.DeltaTHDV.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "V THD Phase " + (phase.Key),
                                lineStyle = "-",
                                includeLegend = true,
                                data = DeltaITHD
                            });

                        if (DeltaVTHD.Count > 0)
                            result.DeltaTHDI.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "I THD Phase " + (phase.Key),
                                lineStyle = ":",
                                includeLegend = true,
                                data = DeltaVTHD
                            });

                        if (SwitchingFreq.Count > 0)
                            result.SwitchingFreq.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "Phase " + (phase.Key),
                                lineStyle = "-",
                                includeLegend = true,
                                data = SwitchingFreq
                            });

                        if (Xpre.Count > 0)
                            result.Xcap.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "Pre Event Phase " + (phase.Key),
                                lineStyle = "-",
                                includeLegend = true,
                                data = Xpre
                            });

                        if (Ipre.Count > 0)
                            result.Irms.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "Pre Event Phase " + (phase.Key),
                                lineStyle = "-",
                                includeLegend = true,
                                data = Ipre
                            });

                        if (Vpre.Count > 0)
                            result.Vrms.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "Pre Event Phase " + (phase.Key),
                                lineStyle = "-",
                                includeLegend = true,
                                data = Vpre
                            });

                        if (THDpre.Count > 0)
                            result.THDI.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "I THD Pre Event Phase " + (phase.Key),
                                lineStyle = "-",
                                includeLegend = true,
                                data = THDpre
                            });

                        if (THDVpre.Count > 0)
                            result.THDV.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "V THD Pre Event Phase " + (phase.Key),
                                lineStyle = "-",
                                includeLegend = true,
                                data = THDVpre
                            });

                        if (Xpost.Count > 0)
                            result.Xcap.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "Post Event Phase " + (phase.Key),
                                lineStyle = ":",
                                includeLegend = true,
                                data = Xpost
                            });

                        if (Ipost.Count > 0)
                            result.Irms.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "Post Event Phase " + (phase.Key),
                                lineStyle = ":",
                                includeLegend = true,
                                data = Ipost
                            });

                        if (Vpost.Count > 0)
                            result.Vrms.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "Post Event Phase " + (phase.Key),
                                lineStyle = ":",
                                includeLegend = true,
                                data = Vpost
                            });

                        if (THDpost.Count > 0)
                            result.THDI.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "I THD Post Event Phase " + (phase.Key),
                                lineStyle = ":",
                                includeLegend = true,
                                data = THDpost
                            });

                        if (THDVpost.Count > 0)
                            result.THDV.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "V THD Post Event Phase " + (phase.Key),
                                lineStyle = ":",
                                includeLegend = true,
                                data = THDVpost
                            });


                        if (XcapBank.Count > 0)
                            result.DeltaXcap.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "Phase " + (phase.Key),
                                lineStyle = "-",
                                includeLegend = true,
                                data = XcapBank
                            });

                        if (RestDur.Count > 0)
                            result.RestrikeDuration.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "Phase " + (phase.Key),
                                lineStyle = "-",
                                includeLegend = true,
                                data = RestDur
                            });
                        if (RestI.Count > 0)
                            result.RestrikeI.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "Phase " + (phase.Key),
                                lineStyle = "-",
                                includeLegend = true,
                                data = RestI
                            });
                        if (RestV.Count > 0)
                            result.RestrikeV.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "Phase " + (phase.Key),
                                lineStyle = "-",
                                includeLegend = true,
                                data = RestV
                            });

                        if (PisDur.Count > 0)
                            result.PISDuration.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "Phase " + (phase.Key),
                                lineStyle = "-",
                                includeLegend = true,
                                data = PisDur
                            });
                        if (PisR.Count > 0)
                            result.PISZ.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "R Phase " + (phase.Key),
                                lineStyle = "-",
                                includeLegend = true,
                                data = PisR
                            });
                        if (PisX.Count > 0)
                            result.PISZ.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "X Phase " + (phase.Key),
                                lineStyle = ":",
                                includeLegend = true,
                                data = PisX
                            });

                        if (Kfactor.Count > 0)
                            result.KFactor.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "Phase " + (phase.Key),
                                lineStyle = "-",
                                includeLegend = true,
                                data = Kfactor
                            });
                        if (Xlv.Count > 0)
                            result.RelayXLV.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "Phase " + (phase.Key),
                                lineStyle = "-",
                                includeLegend = true,
                                data = Xlv
                            });
                        if (Xug.Count > 0)
                            result.RelayXLV.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "Upper Group Phase " + (phase.Key),
                                lineStyle = ":",
                                includeLegend = true,
                                data = Xug
                            });
                        if (Xlg.Count > 0)
                            result.RelayXLV.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "Lower Group Phase " + (phase.Key),
                                lineStyle = "-",
                                includeLegend = true,
                                data = Xlg
                            });

                        if (PctIEC.Count > 0 && phase.Key == "AN")
                            result.Unbalance.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "IEC",
                                lineStyle = "-",
                                includeLegend = true,
                                data = PctIEC
                            });
                        if (PctIEEE.Count > 0 && phase.Key == "AN")
                            result.Unbalance.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "IEEE",
                                lineStyle = ":",
                                includeLegend = true,
                                data = PctIEEE
                            });

                        if (XVration.Count > 0)
                            result.RelayXV.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "Phase " + (phase.Key),
                                lineStyle = "-",
                                includeLegend = true,
                                data = XVration
                            });

                        if (RelayV.Count > 0)
                            result.RelayV.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "Phase " + (phase.Key),
                                lineStyle = "-",
                                includeLegend = true,
                                data = RelayV
                            });
                        if (RelaydV.Count > 0)
                            result.RelaydV.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "Phase " + (phase.Key),
                                lineStyle = "-",
                                includeLegend = true,
                                data = RelaydV
                            });
                        if (Ineutral.Count > 0 && phase.Key == "AN")
                            result.Ineutral.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "",
                                lineStyle = "-",
                                includeLegend = true,
                                data = Ineutral
                            });
                        if (BusV0.Count > 0 && phase.Key == "AN")
                            result.BusV.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "",
                                lineStyle = "-",
                                includeLegend = true,
                                data = BusV0
                            });
                        if (BusZ0.Count > 0 && phase.Key == "AN")
                            result.BusZ.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "",
                                lineStyle = "-",
                                includeLegend = true,
                                data = BusZ0
                            });



                    }
                    DataTable systable = GettrendTable(phaseRestriction, otherFilter, capBankRestriction, "", timeRestriction);
                    List<double[]> SCmva = systable.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, Math.Abs(row.Field<double?>("Q") ?? 0) }).ToList();
                    if (SCmva.Count > 0)
                        result.Q.Add(new TrendSeries()
                        {
                            color = phase.Value,
                            label = "Phase " + (phase.Key),
                            lineStyle = "-",
                            includeLegend = true,
                            data = SCmva
                        });

                }

                DataTable totalTable = GettrendTable("", otherFilter, capBankRestriction, "", timeRestriction);

                if (totalTable.Rows.Count > 0)
                {
                    result.Q.Add(new TrendSeries()
                    {
                        color = "#ffA500",
                        label = "Total",
                        lineStyle = "-",
                        includeLegend = true,
                        data = totalTable.AsEnumerable().GroupBy(row => row.Field<int>("EventID")).Select(group => new double[2] { group.First().Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, Math.Abs(group.First().Field<double?>("TotalQ") ?? 0) }).ToList()
                    });
                }

                totalTable = GettrendTable("", otherFilter, capBankRestriction, bankNumRestriction, timeRestriction);

                if (totalTable.Rows.Count > 0 && selectedBank > -1)
                {
                    result.DeltaQ.Add(new TrendSeries()
                    {
                        color = "#ffA500",
                        label = "Total",
                        lineStyle = "-",
                        includeLegend = true,
                        data = totalTable.AsEnumerable().GroupBy(row => row.Field<int>("EventID")).Select(group => new double[2] { group.First().Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, Math.Abs(group.First().Field<double?>("TotalDeltaQ") ?? 0) }).ToList()
                    });
                
                }

            }

            return result;
        }

        private string ProcessFilter(Dictionary<string, string> query)
        {
            string filter = "";
            string val;

            if (query.TryGetValue("resFilt", out val))
            {
                if (!val.Contains(","))
                    filter = $"CBAnalyticResult.IsRes = {val}";
            }

            if (query.TryGetValue("statFilt", out val))
            {
                filter = filter + (filter== ""? "" : " AND ") + $" ( (CBAnalyticResult.CBStatusID%100) IN  ({val}) OR ";
                filter = filter + $"((CBAnalyticResult.CBStatusID/100)%100) IN  ({val}) OR (CBAnalyticResult.CBStatusID/10000)  IN  ({val}))";
            }

            if (query.TryGetValue("operationFilt", out val))
            {
                filter = filter + (filter == "" ? "" : " AND ") + $"CBAnalyticResult.CBOperationID IN  ({val})";
            }

            if (query.TryGetValue("restrikeFilt", out val))
            {
                filter = filter + (filter == "" ? "" : " AND ") + $"ISNULL(CBRestrikeResult.CBRestrikeTypeID,0) IN  ({val})";
            }

            if (query.TryGetValue("switchingHealthFilt", out val))
            {
                filter = filter + (filter == "" ? "" : " AND ") + $"ISNULL(CBSwitchHealthAnalytic.CBSwitchingConditionID,0) IN  ({val})";
            }

            if (query.TryGetValue("healthFilt", out val))
            {
                filter = filter + (filter == "" ? "" : " AND ") + $"ISNULL(CBCapBankResult.CBBankHealthID,0) IN  ({val})";
            }
            if (query.TryGetValue("phaseFilt", out val))
            {
                List<string> PhaseName = val.Trim('[').Trim(']').Split(',').Where(s => s == "1" || s == "2" || s == "3").Select(n => { if (n == "1") return "'AN'"; if (n == "2") return "'BN'"; return "'CN'"; }).ToList();
                if (PhaseName.Count == 0)
                    PhaseName = new List<string>() { "'AN'","'BN'","'CN'" };
                filter = filter + (filter == "" ? "" : " AND ") + $"ISNULL(CBAnalyticResult.PhaseID,0) IN  (SELECT ID FROM Phase WHERE Name IN ({String.Join(",", PhaseName)}))";
            }

            return filter;
        }

        private DataTable GettrendTable(string PhaseRestriction, string OtherRestriction, string CapBankRestriction, string NumRestriction, string timeRestriction)
        {
            using (AdoDataConnection connection = new("systemSettings"))
            {
                List<string> restrictions = new();

                if (!string.IsNullOrWhiteSpace(PhaseRestriction))
                    restrictions.Add("(" + PhaseRestriction + ")");
                if (!string.IsNullOrWhiteSpace(OtherRestriction))
                    restrictions.Add("(" + OtherRestriction + ")");
                if (!string.IsNullOrWhiteSpace(CapBankRestriction))
                    restrictions.Add("(" + CapBankRestriction + ")");
                if (!string.IsNullOrWhiteSpace(NumRestriction))
                    restrictions.Add("(" + NumRestriction + ")");
                if (!string.IsNullOrWhiteSpace(timeRestriction))
                    restrictions.Add("(" + timeRestriction + ")");

                bool hasRestriction = restrictions.Count > 0;

                string sqlQuery = $@"SELECT
                        CBAnalyticResult.EventID AS EventID,
                        CBAnalyticResult.Time AS Time,
                        CBAnalyticResult.MVAsc AS Q,
                        CBAnalyticResult.DeltaQ AS DeltaQ,
                        CBAnalyticResult.Ipost - CBAnalyticResult.Ipre AS DeltaI,
                        CBAnalyticResult.Vpost - CBAnalyticResult.Vpre AS DeltaV,
                        CBANalyticResult.ResFreq AS ResFreq,
                        CBAnalyticResult.THDpost - CBAnalyticResult.THDpre AS DeltaITHD,
                        CBAnalyticResult.THDVpost - CBAnalyticResult.THDVpre AS DeltaVTHD,
                        CBAnalyticResult.SwitchingFreq AS SwitchingFreq,
                        CBAnalyticResult.Vpeak AS Vpeak,
                        CBAnalyticResult.Ipre AS Ipre,
                        CBAnalyticResult.Vpre AS Vpre,
                        CBANalyticResult.THDpre AS THDpre,
                        CBAnalyticResult.THDVpre AS THDVpre,
                        CBAnalyticResult.Xpre AS Xpre,
                        CBAnalyticResult.Ipost AS Ipost,
                        CBAnalyticResult.Vpost AS Vpost,
                        CBANalyticResult.THDpost AS THDpost,
                        CBAnalyticResult.THDVpost AS THDVPost,
                        CBAnalyticResult.Xpost AS Xpost,
                        CBRestrikeResult.Drest AS RestrikeDuration,
                        CBRestrikeResult.Imax AS RestrikeI,
                        CBRestrikeResult.Vmax AS RestrikeV,
                        CBSwitchHealthAnalytic.Duration AS PISduration,
                        CBSwitchHealthAnalytic.R AS PISr,
                        CBSwitchHealthAnalytic.X AS PISx,
                        CBCapBankResult.Kfactor AS Kfactor,
						CBCapBankResult.X AS XcapBank,
						CBCapBankResult.dV AS RelaydV,
						CBCapBankResult.XLV AS Xlv,
						CBCapBankResult.XUG AS Xug,
						CBCapBankResult.XLG AS Xlg,
						CBCapBankResult.XVmiss AS XVration,
						CBCapBankResult.VUIEC AS PctIEC,
						CBCapBankResult.VUIEEE AS PctIEEE,
						CBCapBankResult.Vrelay AS RelayV,
						CBCapBankResult.Ineutral AS Ineutral,
						CBCapBankResult.Z0 AS BusZ0,
						CBCapBankResult.V0 AS BusV0,
                        (SELECT SUM(CBR.MVAsc) FROM CBAnalyticResult CBR WHERE CBR.EventID = CBAnalyticResult.EventID) AS TotalQ,
                        (SELECT SUM(CBR.DeltaQ) FROM CBAnalyticResult CBR WHERE CBR.EventID = CBAnalyticResult.EventID) AS TotalDeltaQ
                    FROM CBAnalyticResult LEFT JOIN 
                        CBRestrikeResult ON CBRestrikeResult.CBResultID = CBAnalyticResult.ID LEFT JOIN
                        CBSwitchHealthAnalytic ON CBSwitchHealthAnalytic.CBResultID = CBAnalyticResult.ID LEFT JOIN
						CBCapBankResult ON CBCapBankResult.CBResultID = CBAnalyticResult.ID
                    {(hasRestriction? ("WHERE " + string.Join(" AND ",restrictions)) : "")} 
                    ORDER BY CBAnalyticResult.Time";

                return connection.RetrieveData(sqlQuery);
            }
        }
        #endregion 

        #endregion

    }
}