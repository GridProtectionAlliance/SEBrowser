//******************************************************************************************************
//  OpenSEEController.cs - Gbtc
//
//  Copyright © 2018, Grid Protection Alliance.  All Rights Reserved.
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
//  04/17/2018 - Billy Ernest
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

namespace PQDashboard.Controllers.BreakerReport
{
    [RoutePrefix("api/PQDashboard/RelayReport")]
    public class RelayReportController : ApiController
    {
        #region [ Members ]

        // Fields
        private DateTime m_epoch = new(1970, 1, 1);

        public class FlotSeries
        {
            public int ChannelID;
            public string ChannelName;
            public string ChannelDescription;
            public string MeasurementType;
            public string MeasurementCharacteristic;
            public string Phase;
            public string SeriesType;
            public string ChartLabel;
            public List<double[]> DataPoints = new();
        }
        public class JsonReturn
        {
            public DateTime StartDate;
            public DateTime EndDate;
            public double CalculationTime;
            public double CalculationEnd;
            public List<FlotSeries> Data;
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
        public RelayReportController() : base() { }
        #endregion

        #region [ Static ]
        private static MemoryCache s_memoryCache;

        static RelayReportController()
        {
            s_memoryCache = new MemoryCache("RelayReport");
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
		                    WHERE AssetType.Name = 'Breaker' AND AssetLocation.LocationID = Location.ID) > 0
                    ORDER BY LocationKey";

                    sc.CommandType = CommandType.Text;

                    IDataReader rdr = sc.ExecuteReader();
                    table.Load(rdr);

                    return table;
                }
            }

        }

        [Route("GetBreakerData"), HttpGet]
        public DataTable GetBreakerData()
        {
            Dictionary<string, string> query = Request.QueryParameters();
            int locationID = int.Parse(query["locationID"]);

            using (AdoDataConnection connection = new("systemSettings"))
            {
                DataTable table = new();

                using (IDbCommand sc = connection.Connection.CreateCommand())
                {
                    sc.CommandText = @" SELECT
                        Breaker.ID AS AssetId,
                        Breaker.AssetKey,
                        Breaker.AssetName
                    FROM	
	                    Breaker LEFT JOIN AssetLocation ON Breaker.ID = AssetLocation.AssetID
                    WHERE
                        AssetLocation.LocationID = " + locationID + @"
                        AND (SELECT COUNT(RP.ID) FROM RelayPerformance RP LEFT JOIN Event E ON RP.EventID = E.ID 
							WHERE E.AssetID = Breaker.ID ) > 0
                    ORDER BY Breaker.AssetName";

                    sc.CommandType = CommandType.Text;

                    IDataReader rdr = sc.ExecuteReader();
                    table.Load(rdr);

                    return table;
                }
            }

        }

        [Route("GetCoilData"), HttpGet]
        public DataTable GetCoilData()
        {
            Dictionary<string, string> query = Request.QueryParameters();
            int lineID = int.Parse(query["lineID"]);

            using (AdoDataConnection connection = new("systemSettings"))
            {
                DataTable table = new();

                using (IDbCommand sc = connection.Connection.CreateCommand())
                {
                    sc.CommandText = @" 
                   SELECT ID AS ChannelID,
                        Name
                    FROM Channel
                    WHERE
                        Channel.AssetId = " + lineID + @"
						AND (SELECT COUNT(RP.ID) FROM RelayPerformance RP 
							WHERE RP.ChannelID = Channel.ID ) > 0
                    ORDER BY Name";

                    sc.CommandType = CommandType.Text;

                    IDataReader rdr = sc.ExecuteReader();
                    table.Load(rdr);

                    return table;
                }
            }

        }

        private DataTable RelayHistoryTable( DateTime dateTime, int windowSize, string timeWindowUnits, int relayID, int channelID = -1)
        {
            DataTable dataTable;

            string timeRestriction = $"TripInitiate Between DATEADD({timeWindowUnits}, { (-1 * windowSize)}, '{dateTime}') AND DATEADD({ timeWindowUnits}, { (windowSize)},  '{dateTime}')";

            using (AdoDataConnection connection = new("systemSettings"))
            {
                if (channelID > 0)
                {
                    dataTable = connection.RetrieveData($"SELECT * FROM BreakerHistory WHERE BreakerId = {{0}} AND TripCoilChannelID = {{1}} AND {timeRestriction}", relayID, channelID);
                }
                else
                {
                    dataTable = connection.RetrieveData($"SELECT * FROM BreakerHistory WHERE BreakerId = {{0}} AND {timeRestriction}", relayID);
                }
            }
            return dataTable;
        }

        [Route("GetRelayPerformance"), HttpGet]
        public DataTable GetRelayPerformance()
        {
            Dictionary<string, string> query = Request.QueryParameters();
            int lineID;
            int channelID;

            DateTime dateTime = DateTime.ParseExact(query["date"] + " " + query["time"], "MM/dd/yyyy HH:mm:ss.fff", new CultureInfo("en-US"));
            string timeWindowUnits = ((TimeWindowUnits)int.Parse(query["timeWindowUnits"])).GetDescription();
            int windowSize = int.Parse(query["windowSize"]);


            try { channelID = int.Parse(query["channelID"]); }
            catch { channelID = -1; }

            try { lineID = int.Parse(query["lineID"]); }
            catch { lineID = -1; }
            
            if (lineID <= 0) return new DataTable();
            
            return RelayHistoryTable(dateTime,windowSize,timeWindowUnits,lineID, channelID);
            
        }

        #endregion

    }
}