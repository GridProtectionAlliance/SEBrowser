//******************************************************************************************************
//  TrendChannelController.cs - Gbtc
//
//  Copyright © 2023, Grid Protection Alliance.  All Rights Reserved.
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
//  04/05/2023 - Gabriel Santos
//       Generated original version of source code.
//
//******************************************************************************************************

using GSF.Data;
using GSF.Data.Model;
using GSF.Identity;
using GSF.Web.Model;
using openXDA.Model;
using SystemCenter.Model;
using System;
using System.Collections.Generic;
using System.Data;
using System.Net;
using System.Web.Http;
using System.Linq;
using Newtonsoft.Json.Linq;

namespace SEBrowser.Controllers.OpenXDA
{
    [RoutePrefix("api/OpenXDA")]
    public class TrendChannelController : ApiController
    {
        #region [ Members ]
        const string SettingsCategory = "systemSettings";
        #endregion

        #region [ Http Methods ]
        [Route("GetTrendSearchData"), HttpPost]
        public DataTable GetEventSearchData([FromBody] JObject postData)
        {
            using (AdoDataConnection connection = new(SettingsCategory))
            {
                // TODO: how time filter?
                string phaseFilter = GetKeyValueFilter(postData["Phases"], "Phase.Name");
                string channelGroupFilter = GetKeyValueFilter(postData["ChannelGroups"], "ChannelGroup.Name");
                string meterFilter = GetIDFilter(postData["MeterList"], "Meter.ID");
                string assetFilter = GetIDFilter(postData["AssetList"], "Asset.ID");

                string filters =
                    $@"Channel.Trend = 1
                    {(string.IsNullOrEmpty(phaseFilter) ? "" : $"AND ({phaseFilter})")}
                    {(string.IsNullOrEmpty(channelGroupFilter) ? "" : $"AND ({channelGroupFilter})")}
                    {(string.IsNullOrEmpty(meterFilter) ? "" : $"AND {meterFilter}")}
                    {(string.IsNullOrEmpty(assetFilter) ? "" : $"AND {assetFilter}")}";

                string query =
                    $@"SELECT
	                    Channel.ID,
	                    Channel.Name,
	                    Channel.Description,
	                    Asset.AssetKey,
	                    Asset.AssetName,
	                    Meter.AssetKey AS MeterAssetKey,
	                    Meter.Name AS MeterName,
	                    Phase.Name AS Phase,
	                    ChannelGroup.Name AS ChannelGroup,
	                    ChannelGroupType.DisplayName AS ChannelGroupType
                    FROM 
	                    Channel LEFT JOIN
	                    Phase ON Channel.PhaseID = Phase.ID LEFT JOIN
	                    Asset ON Asset.ID = Channel.AssetID LEFT JOIN
	                    Meter ON Meter.ID = Channel.MeterID LEFT JOIN
	                    ChannelGroupType ON Channel.MeasurementCharacteristicID = ChannelGroupType.MeasurementCharacteristicID AND Channel.MeasurementTypeID = ChannelGroupType.MeasurementTypeID LEFT JOIN
	                    ChannelGroup ON ChannelGroup.ID = ChannelGroupType.ChannelGroupID
                    WHERE
	                    {filters}";

                DataTable table = connection.RetrieveData(query);

                return table;
            }

        }
        #endregion

        #region [ Private Methods ]
        private string GetKeyValueFilter(JToken keyValuePairs, string fieldName)
        {
            //Note: we're only gonna filter out ones that have been explicitly exluded
            IEnumerable<JToken> validPairs = keyValuePairs.Where(pair => !pair["Value"].ToObject<bool>());
            if (validPairs.Count() == 0) return null;
            return $"{fieldName} NOT IN ({string.Join(", ", validPairs.Select(pair => "\'" + pair["Key"].ToObject<string>() + "\'"))})";
        }
        private string GetIDFilter(JToken idObjectList, string fieldName)
        {
            if (idObjectList.Count() == 0) return null;
            return $"{fieldName} IN ({string.Join(", ", idObjectList.Select(idObject => idObject["ID"].ToObject<int>()))})";
        }
        #endregion
    }
}