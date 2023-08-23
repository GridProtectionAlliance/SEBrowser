//******************************************************************************************************
//  FaultInfoController.cs - Gbtc
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
//  03/17/2020 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

using FaultData.DataAnalysis;
using GSF;
using GSF.Data;
using GSF.Data.Model;
using GSF.Web;
using openXDA.Model;
using SEBrowser.Model.System;
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

namespace SEBrowser.Controllers.OpenXDA
{
    [RoutePrefix("api/OpenXDA/FaultInfo")]
    public class FaultInfoController : ApiController
    {
        const string SettingsCategory = "systemSettings";

		[Route("TreeProbability/{eventID:int}"), HttpGet]
		public IHttpActionResult GetTreeProbability(int eventID)
		{
			try
			{
				using (AdoDataConnection connection = new(SettingsCategory))
				{

					string query = @"
					SELECT 
						Event.ID,
						FaultSummary.Inception as FaultTime,
						Event.AssetID,
						Meter.Name as StationName, 
						Location.LocationKey as StationID, 
						LineView.AssetKey as LineAssetKey, 
						LineView.AssetName as LineName, 
						LineView.Length,
						ROUND(FaultSummary.Distance,2) as FaultDistance, 
						FaultSummary.FaultType, 
						ROUND(FaultSummary.DurationCycles,2) as FaultDuration, 
						FaultSummary.CurrentMagnitude,
						FaultSummary.ID as FaultID, 
						DoubleEndedFaultDistance.Distance as DblDist,
						FaultCauseMetrics.TreeFaultResistance as TreeFaultResistance

					FROM
						Event inner join 
						Meter on Event.MeterID = Meter.ID inner join 
						Location on Meter.LocationID = Location.ID inner join 
						LineView on Event.AssetID = LineView.ID inner join 
						FaultSummary on Event.ID = FaultSummary.EventID and [IsSelectedAlgorithm] = 1 AND IsSuppressed = 0 AND IsValid <> 0 left join 
						FaultCauseMetrics ON Event.ID = FaultCauseMetrics.EventID AND FaultCauseMetrics.FaultNumber = 1 left join 
						DoubleEndedFaultDistance on FaultSummary.ID = DoubleEndedFaultDistance.LocalFaultSummaryID
					WHERE 
						Event.ID = {0}
                    ";
					return Ok(connection.RetrieveData(query, eventID));
				}
			}
			catch (Exception ex)
			{
				return InternalServerError(ex);
			}
		}


	}
}