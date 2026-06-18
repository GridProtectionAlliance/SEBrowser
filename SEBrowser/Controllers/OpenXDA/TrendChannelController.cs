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

using Gemstone.Configuration;
using Gemstone.Data;
using Gemstone.Data.Model;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using openXDA.APIAuthentication;
using SEBrowser.Model;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace SEBrowser.Controllers.OpenXDA
{
    [Route("api/OpenXDA")]
    public class TrendChannelController : ControllerBase
    {
        private const string TrendChannelSql = @"
        SELECT DISTINCT
            CONCAT(Channel.ID, '_', ChannelGroupType.ID) as ID,
            Channel.ID as ChannelID,
	        Channel.Name,
	        Channel.Description,
            Asset.ID as AssetID,
	        Asset.AssetKey,
	        Asset.AssetName,
            Meter.ID as MeterID,
	        Meter.AssetKey AS MeterKey,
	        Meter.Name AS MeterName,
            Meter.ShortName AS MeterShortName,
	        Phase.Name AS Phase,
	        ChannelGroup.Name AS ChannelGroup,
	        ChannelGroupType.DisplayName AS ChannelGroupType,
	        ChannelGroupType.Unit
        FROM
	        Channel LEFT JOIN
	        Phase ON Channel.PhaseID = Phase.ID LEFT JOIN
	        Asset ON Asset.ID = Channel.AssetID LEFT JOIN
	        Meter ON Meter.ID = Channel.MeterID LEFT JOIN
	        ChannelGroupType ON Channel.MeasurementCharacteristicID = ChannelGroupType.MeasurementCharacteristicID AND Channel.MeasurementTypeID = ChannelGroupType.MeasurementTypeID LEFT JOIN
	        ChannelGroup ON ChannelGroup.ID = ChannelGroupType.ChannelGroupID";

        private const string DetailedSeriesSql = @"
        SELECT
	        Series.ID,
	        Series.ChannelID,
	        SeriesType.Name as TypeName,
	        SeriesType.Description as TypeDescription
        FROM
	        Series LEFT JOIN
	        SeriesType ON Series.SeriesTypeID = SeriesType.ID";

        class TrendChannelSeries : TrendChannel
        {
            [NonRecordField]
            public List<DetailedSeries> Series { get; set; } = new List<DetailedSeries>();
        }

        #region [ Http Methods ]
        [Route("GetTrendSearchData"), HttpPost]
        public IActionResult GetTrendSearchData([FromBody] JObject postData)
        {
            using (AdoDataConnection connection = new(Settings.Default))
            {
                string phaseFilter = GetKeyValueFilter((JArray) postData["Phases"], "Phase.ID");
                string channelGroupFilter = GetKeyValueFilter((JArray) postData["ChannelGroups"], "ChannelGroup.ID");
                string assetFilter = GetIDFilter(postData["AssetList"], "Asset.ID");
                string meterFilter = GetIDFilter(postData["MeterList"], "Meter.ID");
                // Meters must be selected
                if (string.IsNullOrEmpty(meterFilter)) return Ok(new List<TrendChannelSeries>());

                string filters =
                    $@"Channel.Trend = 1
                    {(string.IsNullOrEmpty(phaseFilter) ? "" : $"AND ({phaseFilter})")}
                    {(string.IsNullOrEmpty(channelGroupFilter) ? "" : $"AND ({channelGroupFilter})")}
                    {(string.IsNullOrEmpty(meterFilter) ? "" : $"AND {meterFilter}")}
                    {(string.IsNullOrEmpty(assetFilter) ? "" : $"AND {assetFilter}")}";

                string sql = $"{TrendChannelSql} WHERE {filters}";
                DataTable table = connection.RetrieveData(sql);

                List<TrendChannelSeries> result = new List<TrendChannelSeries>();
                TableOperations<TrendChannelSeries> tblOperations = new TableOperations<TrendChannelSeries>(connection);
                foreach (DataRow row in table.Rows)
                    result.Add(tblOperations.LoadRecord(row));

                if (result.Count == 0)
                    return Ok(result);

                string channelIDs = string.Join(", ", result.Select(record => record.ChannelID).Distinct());
                string seriesSql = $"{DetailedSeriesSql} WHERE Series.ChannelID IN ({channelIDs}) ORDER BY Series.ChannelID, Series.ID";
                DataTable seriesTable = connection.RetrieveData(seriesSql);
                TableOperations<DetailedSeries> seriesTblOperations = new TableOperations<DetailedSeries>(connection);
                Dictionary<int, List<DetailedSeries>> seriesLookup = seriesTable
                    .Select()
                    .Select(seriesTblOperations.LoadRecord)
                    .GroupBy(series => series.ChannelID)
                    .ToDictionary(group => group.Key, group => group.ToList());

                foreach (TrendChannelSeries record in result)
                {
                    if (seriesLookup.TryGetValue(record.ChannelID, out List<DetailedSeries> series))
                        record.Series.AddRange(series);
                }

                return Ok(result);
            }
        }

        [Route("GetLineChartData"), HttpPost]
        public Task<HttpResponseMessage> GetLineChartData([FromBody] JObject postData)
        {
            XDAAPIHelper.TryRefreshSettings();
            return XDAAPIHelper.GetResponseTask("api/HIDS/QueryPoints", new StringContent(postData.ToString(), Encoding.UTF8, "application/json"));
        }

        [Route("GetMetaData"), HttpPost]
        public Task<HttpResponseMessage> GetCyclicMetaData([FromBody] JObject postData)
        {
            XDAAPIHelper.TryRefreshSettings();
            return XDAAPIHelper.GetResponseTask("api/HIDS/QueryHistogramMetadata", new StringContent(postData.ToString(), Encoding.UTF8, "application/json"));
        }

        [Route("GetChartData/{type}"), HttpPost]
        public Task<HttpResponseMessage> GetCyclicChartData([FromBody] JObject postData, string type)
        {
            string typeUncased = type.ToLower();
            string route;
            switch (typeUncased)
            {
                case "cyclic":
                    route = "QueryCyclicHistogramData";
                    break;
                case "residual":
                    route = "QueryResidualHistogramData";
                    break;
                case "frequency":
                    route = "QueryFrequencyHistogramData";
                    break;
                case "rms":
                    route = "QueryRMSHistogramData";
                    break;
                default:
                    throw new InvalidOperationException($"Unknown type parameter: {type}");
            }
            // Read metadata into list
            return XDAAPIHelper.GetResponseTask($"api/HIDS/{route}", new StringContent(postData.ToString(), Encoding.UTF8, "application/json"));
        }
        #endregion

        #region [ Private Methods ]
        private string GetKeyValueFilter(JArray keyValuePairs, string fieldName)
        {
            //Note: we're only gonna filter out ones that have been explicitly exluded
            List<int> validIds = keyValuePairs
                .SelectMany(pair => ((JObject) pair).Properties())
                .Where(pair => !pair.Value.ToObject<bool>())
                .Select(pair => int.Parse(pair.Name))
                .ToList();

            if (validIds.Count == 0) return null;
            return $"{fieldName} NOT IN ({string.Join(", ", validIds)})";
        }

        private string GetIDFilter(JToken idObjectList, string fieldName)
        {
            List<int> ids = idObjectList.Select(idObject => idObject["ID"].ToObject<int>()).ToList();
            if (ids.Count == 0) return null;
            return $"{fieldName} IN ({string.Join(", ", ids)})";
        }
        #endregion
    }
}
