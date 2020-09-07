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
        private DateTime m_epoch = new DateTime(1970, 1, 1);

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
            public List<TrendSeries> THD;
            public List<TrendSeries> DeltaTHD;
            public List<TrendSeries> SwitchingFreq;
            public List<TrendSeries> PeakV;
            public List<TrendSeries> Xcap;
            public List<TrendSeries> DeltaXcap;

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
            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
            {


                DataTable table = new DataTable();

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
                    ORDER BY LocationKey";

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

            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
            {
                DataTable table = new DataTable();

                using (IDbCommand sc = connection.Connection.CreateCommand())
                {
                    sc.CommandText = @" 
                   SELECT CapBank.ID AS Id,
                          CapBank.AssetKey,
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
            DateTime dateTime = DateTime.ParseExact(query["date"] + " " + query["time"], "MM/dd/yyyy HH:mm:ss.fff", new CultureInfo("en-US"));
            string timeWindowUnits = ((TimeWindowUnits)int.Parse(query["timeWindowUnits"])).GetDescription();
            int windowSize = int.Parse(query["windowSize"]);

            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
            {
                DataTable table = new DataTable();

                using (IDbCommand sc = connection.Connection.CreateCommand())
                {
                    sc.CommandText = $@" 
                    SELECT * FROM CBReportEventTable WHERE CapBankID = {capBankId} AND
                        Time BETWEEN DATEADD({timeWindowUnits}, {(-1 * windowSize)}, '{dateTime}') AND
                                                DATEADD({timeWindowUnits}, {(windowSize)},  '{dateTime}') 
                    ORDER BY Time";

                    sc.CommandType = CommandType.Text;

                    IDataReader rdr = sc.ExecuteReader();
                    table.Load(rdr);

                    return table;
                }
            }

        }

        [Route("GetSwitchingTable"), HttpGet]
        public DataTable GetSwitchingTable()
        {
            Dictionary<string, string> query = Request.QueryParameters();
            int capBankId = int.Parse(query["capBankId"]);
            DateTime dateTime = DateTime.ParseExact(query["date"] + " " + query["time"], "MM/dd/yyyy HH:mm:ss.fff", new CultureInfo("en-US"));
            string timeWindowUnits = ((TimeWindowUnits)int.Parse(query["timeWindowUnits"])).GetDescription();
            int windowSize = int.Parse(query["windowSize"]);


            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
            {
                DataTable table = new DataTable();

                using (IDbCommand sc = connection.Connection.CreateCommand())
                {
                    sc.CommandText = $@" 
                    SELECT 
                        CBSwitchHealthAnalytic.ID AS ID,
	                    CBSwitchHealthAnalytic.R AS R,
	                    CBSwitchHealthAnalytic.X AS X,
	                    CBSwitchHealthAnalytic.Duration AS Duration,
	                    CBAnalyticResult.EventID AS EventID,
	                    CBAnalyticResult.Time AS Time,
	                    Phase.Name AS Phase,
	                    CBSwitchingCondition.Description AS SwitchingCondition
                    FROM CBSwitchHealthAnalytic LEFT JOIN 
	                    CBAnalyticResult ON CBAnalyticResult.ID = CBSwitchHealthAnalytic.CBResultID LEFT JOIN 
	                    CBSwitchingCondition ON CBSwitchingCondition.ID = CBSwitchHealthAnalytic.CBSwitchingConditionID LEFT JOIN
	                    Phase ON Phase.ID = CBAnalyticResult.PhaseID 
                    WHERE (SELECT AssetID FROM EVENT WHERE Event.ID = CBAnalyticResult.EventID) = {capBankId} AND
                        CBAnalyticResult.Time BETWEEN DATEADD({timeWindowUnits}, {(-1 * windowSize)}, '{dateTime}') AND
                                                DATEADD({timeWindowUnits}, {(windowSize)},  '{dateTime}') 
                    ORDER BY CBAnalyticResult.Time";

                    sc.CommandType = CommandType.Text;

                    IDataReader rdr = sc.ExecuteReader();
                    table.Load(rdr);

                    return table;
                }
            }

        }

        #region [ Trending Data ]

        [Route("GetTrend"), HttpGet]
        public TrendingResponse GetTrendData()
        {
            Dictionary<string, string> query = Request.QueryParameters();
            int capBankId = int.Parse(query["capBankId"]);
            DateTime dateTime = DateTime.ParseExact(query["date"] + " " + query["time"], "MM/dd/yyyy HH:mm:ss.fff", new CultureInfo("en-US"));
            string timeWindowUnits = ((TimeWindowUnits)int.Parse(query["timeWindowUnits"])).GetDescription();
            int windowSize = int.Parse(query["windowSize"]);
            int selectedBank = int.Parse(query["bankNum"]);


            string timeRestriction = $"CBAnalyticResult.Time BETWEEN DATEADD({ timeWindowUnits}, { (-1 * windowSize)}, '{dateTime}') AND DATEADD({ timeWindowUnits}, { (windowSize)},  '{dateTime}')";
            string capBankRestriction = $"(SELECT AssetID FROM EVENT WHERE Event.ID = CBAnalyticResult.EventID) = {capBankId}";
            string bankNumRestriction = $"CBAnalyticResult.EnergizedBanks = {selectedBank} OR CBAnalyticResult.DeEnergizedBanks = {selectedBank}";
            string bankNumAfterRestriction = $"CBAnalyticResult.StepPost = {selectedBank}";
            string bankNumBeforeRestriction = $"CBAnalyticResult.StepPre = {selectedBank}";

            TrendingResponse result = new TrendingResponse()
            {
                DeltaQ = new List<TrendSeries>(),
                Irms = new List<TrendSeries>(),
                DeltaIrms = new List<TrendSeries>(),
                Vrms = new List<TrendSeries>(),
                DeltaVrms = new List<TrendSeries>(),
                Q = new List<TrendSeries>(),
                Freq = new List<TrendSeries>(),
                THD = new List<TrendSeries>(),
                DeltaTHD = new List<TrendSeries>(),
                SwitchingFreq = new List<TrendSeries>(),
                PeakV = new List<TrendSeries>(),
                Xcap = new List<TrendSeries>(),
                DeltaXcap = new List<TrendSeries>()
            };

            //Start with Events matching bankNumRestriction for each Phase....
            Dictionary<string, string> phaseColor = new Dictionary<string, string>();
            phaseColor.Add("AN", "#A30000");
            phaseColor.Add("BN", "#0029A3");
            phaseColor.Add("CN", "#007A29");

            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
            {
                
                foreach (KeyValuePair<string, string> phase in phaseColor)
                {
                    string phaseRestriction = $"CBAnalyticResult.PhaseID = (SELECT ID FROM Phase WHERE Name = '{phase.Key}')";

                    if (selectedBank > -1)
                    {
                        
                        string sqlQuery = $@"SELECT
                        CBAnalyticResult.EventID AS EventID,
                        CBAnalyticResult.Time AS Time,
                        CBAnalyticResult.DeltaQ AS DeltaQ,
                        CBAnalyticResult.Ipost - CBAnalyticResult.Ipre AS DeltaI,
                        CBAnalyticResult.Vpost - CBAnalyticResult.Vpre AS DeltaV,
                        CBANalyticResult.ResFreq AS ResFreq,
                        CBAnalyticResult.THDpost - CBAnalyticResult.THDpre AS DeltaITHD,
                        CBAnalyticResult.THDVpost - CBAnalyticResult.THDVpre AS DeltaVTHD,
                        CBAnalyticResult.SwitchingFreq AS SwitchingFreq,
                        CBAnalyticResult.Vpeak AS Vpeak

                        FROM CBAnalyticResult WHERE 
                            {capBankRestriction} AND {timeRestriction} AND {phaseRestriction} AND {bankNumRestriction}
                        ORDER BY CBAnalyticResult.Time";

                        DataTable table = connection.RetrieveData(sqlQuery);

                        // Create Arrays of Data so we can Check if there are any later.
                        List<double[]> DeltaQ = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("DeltaQ") ?? 0 }).ToList();
                        List<double[]> DeltaI = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("DeltaI") ?? 0 }).ToList();
                        List<double[]> DeltaV = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("DeltaV") ?? 0 }).ToList();
                        List<double[]> ResFreq = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("DeltaV") ?? 0 }).ToList();
                        List<double[]> DeltaITHD = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("DeltaITHD") ?? 0 }).ToList();
                        List<double[]> DeltaVTHD = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("DeltaVTHD") ?? 0 }).ToList();
                        List<double[]> SwitchingFreq = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("SwitchingFreq") ?? 0 }).ToList();
                        List<double[]> Vpeak = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("Vpeak") ?? 0 }).ToList();

                        sqlQuery = $@"SELECT
                        CBAnalyticResult.EventID AS EventID,
                        CBAnalyticResult.Time AS Time,
                        CBAnalyticResult.Ipre AS Ipre,
                        CBAnalyticResult.Vpre AS Vpre,
                        CBANalyticResult.THDpre AS THDpre,
                        CBAnalyticResult.THDVpre AS THDVpre,
                        CBAnalyticResult.Xpre AS Xpre

                        FROM CBAnalyticResult WHERE 
                            {capBankRestriction} AND {timeRestriction} AND {phaseRestriction} AND {bankNumBeforeRestriction}
                        ORDER BY CBAnalyticResult.Time";

                        table = connection.RetrieveData(sqlQuery);

                        List<double[]> Ipre = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("Ipre") ?? 0 }).ToList();
                        List<double[]> Vpre = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("Vpre") ?? 0 }).ToList();
                        List<double[]> THDpre = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("THDpre") ?? 0 }).ToList();
                        List<double[]> THDVpre = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("THDVpre") ?? 0 }).ToList();
                        List<double[]> Xpre = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("Xpre") ?? 0 }).ToList();

                        sqlQuery = $@"SELECT
                        CBAnalyticResult.EventID AS EventID,
                        CBAnalyticResult.Time AS Time,
                        CBAnalyticResult.Ipost AS Ipost,
                        CBAnalyticResult.Vpost AS Vpost,
                        CBANalyticResult.THDpost AS THDpost,
                        CBAnalyticResult.THDVpost AS THDVPost,
                        CBAnalyticResult.Xpost AS Xpost

                        FROM CBAnalyticResult WHERE 
                            {capBankRestriction} AND {timeRestriction} AND {phaseRestriction} AND {bankNumAfterRestriction}
                        ORDER BY CBAnalyticResult.Time";

                        table = connection.RetrieveData(sqlQuery);

                        List<double[]> Ipost = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("Ipost") ?? 0 }).ToList();
                        List<double[]> Vpost = table.AsEnumerable().Select(row => new double[2] { row.Field<DateTime>("Time").Subtract(m_epoch).TotalMilliseconds, row.Field<double?>("Vpost") ?? 0 }).ToList();
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
                                label = "Change in Irms Phase " + (phase.Key),
                                lineStyle = "-",
                                includeLegend = true,
                                data = DeltaI
                            });

                        if (DeltaV.Count > 0)
                            result.DeltaVrms.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "Change in Vrms Phase " + (phase.Key),
                                lineStyle = "-",
                                includeLegend = true,
                                data = DeltaV
                            });

                        if (ResFreq.Count > 0)
                            result.Freq.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "Resonance Frequency Phase " + (phase.Key),
                                lineStyle = "-",
                                includeLegend = true,
                                data = ResFreq
                            });

                        if (Vpeak.Count > 0)
                            result.PeakV.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "Peak Voltage Phase " + (phase.Key),
                                lineStyle = "-",
                                includeLegend = true,
                                data = Vpeak
                            });

                        if (DeltaITHD.Count > 0)
                            result.DeltaTHD.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "Change Voltage THD Phase " + (phase.Key),
                                lineStyle = "-",
                                includeLegend = true,
                                data = DeltaITHD
                            });

                        if (DeltaVTHD.Count > 0)
                            result.DeltaTHD.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "Change in Current THD Phase " + (phase.Key),
                                lineStyle = "-",
                                includeLegend = true,
                                data = DeltaVTHD
                            });

                        if (SwitchingFreq.Count > 0)
                            result.SwitchingFreq.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "Switching Freq. Phase " + (phase.Key),
                                lineStyle = "-",
                                includeLegend = true,
                                data = SwitchingFreq
                            });

                        if (Xpre.Count > 0)
                            result.Xcap.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "Impedance Before Phase " + (phase.Key),
                                lineStyle = "-",
                                includeLegend = true,
                                data = Xpre
                            });

                        if (Ipre.Count > 0)
                            result.Irms.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "Current RMS Before Phase " + (phase.Key),
                                lineStyle = "-",
                                includeLegend = true,
                                data = Ipre
                            });

                        if (Vpre.Count > 0)
                            result.Vrms.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "Voltage RMS Before Phase " + (phase.Key),
                                lineStyle = "-",
                                includeLegend = true,
                                data = Vpre
                            });

                        if (THDpre.Count > 0)
                            result.THD.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "Current THD Before Phase " + (phase.Key),
                                lineStyle = "-",
                                includeLegend = true,
                                data = THDpre
                            });

                        if (THDVpre.Count > 0)
                            result.THD.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "Voltage THD Before Phase " + (phase.Key),
                                lineStyle = "-",
                                includeLegend = true,
                                data = THDVpre
                            });

                        if (Xpost.Count > 0)
                            result.Xcap.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "Impedance After Phase " + (phase.Key),
                                lineStyle = ":",
                                includeLegend = true,
                                data = Xpost
                            });

                        if (Ipost.Count > 0)
                            result.Irms.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "Current RMS After Phase " + (phase.Key),
                                lineStyle = ":",
                                includeLegend = true,
                                data = Ipost
                            });

                        if (Vpost.Count > 0)
                            result.Vrms.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "Voltage RMS After Phase " + (phase.Key),
                                lineStyle = ":",
                                includeLegend = true,
                                data = Vpost
                            });

                        if (THDpost.Count > 0)
                            result.THD.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "Current THD After Phase " + (phase.Key),
                                lineStyle = ":",
                                includeLegend = true,
                                data = THDpost
                            });

                        if (THDVpost.Count > 0)
                            result.THD.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "Voltage THD After Phase " + (phase.Key),
                                lineStyle = ":",
                                includeLegend = true,
                                data = THDVpost
                            });


                        if (Vpeak.Count > 0)
                            result.DeltaXcap.Add(new TrendSeries()
                            {
                                color = phase.Value,
                                label = "Change in CapBank Impedance Phase " + (phase.Key),
                                lineStyle = "-",
                                includeLegend = true,
                                data = Vpeak
                            });

                    }
                }
            }

            return result;
        }
        #endregion 

        #endregion

    }
}