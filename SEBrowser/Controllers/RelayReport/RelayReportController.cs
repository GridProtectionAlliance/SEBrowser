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
using Gemstone.Configuration;
using Gemstone.Data;
using Gemstone.EnumExtensions;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.Runtime.Caching;

namespace SEBrowser.Controllers.RelayReport;

[Route("api/PQDashboard/RelayReport")]
public class RelayReportController : ControllerBase
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
        using AdoDataConnection connection = new(Settings.Default);

        DataTable table = new();

        using IDbCommand sc = connection.Connection.CreateCommand();

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

    [Route("GetBreakerData"), HttpGet]
    public DataTable GetBreakerData(int locationID)
    {
        using AdoDataConnection connection = new(Settings.Default);

        DataTable table = new();

        using IDbCommand sc = connection.Connection.CreateCommand();

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

    [Route("GetCoilData"), HttpGet]
    public DataTable GetCoilData(int lineID)
    {
        using AdoDataConnection connection = new(Settings.Default);

        DataTable table = new();

        using IDbCommand sc = connection.Connection.CreateCommand();

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

    private DataTable RelayHistoryTable(DateTime dateTime, int windowSize, string timeWindowUnits, int relayID, int channelID = -1)
    {
        DataTable dataTable;

        string timeRestriction = $"TripInitiate Between DATEADD({timeWindowUnits}, {(-1 * windowSize)}, '{dateTime}') AND DATEADD({timeWindowUnits}, {(windowSize)},  '{dateTime}')";

        using (AdoDataConnection connection = new(Settings.Default))
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
    public DataTable GetRelayPerformance(int windowSize, int channelID, int lineID, string date, string time, int timeWindowUnits)
    {
        DateTime dateTime = DateTime.ParseExact(date + " " + time, "MM/dd/yyyy HH:mm:ss.fff", new CultureInfo("en-US"));
        string timeWindowUnitsString = ((TimeWindowUnits)timeWindowUnits).GetDescription();

        if(channelID <= 0) channelID = -1;
        if (lineID <= 0) return new DataTable();

        return RelayHistoryTable(dateTime, windowSize, timeWindowUnitsString, lineID, channelID);
    }

    #endregion

}
