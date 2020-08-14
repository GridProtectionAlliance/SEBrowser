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
                          CapBank.AssetKey
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

            using (AdoDataConnection connection = new AdoDataConnection("dbOpenXDA"))
            {
                DataTable table = new DataTable();

                using (IDbCommand sc = connection.Connection.CreateCommand())
                {
                    sc.CommandText = $@" 
                   SELECT * FROM CBReportEventTable WHERE CapBankID = {capBankId}
                    ORDER BY Time";

                    sc.CommandType = CommandType.Text;

                    IDataReader rdr = sc.ExecuteReader();
                    table.Load(rdr);

                    return table;
                }
            }

        }

        
        #endregion

    }
}