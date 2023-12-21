﻿//******************************************************************************************************
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
using System;
using System.Collections.Generic;
using System.Data;
using System.Web.Http;
using System.Linq;
using Newtonsoft.Json.Linq;
using System.Threading.Tasks;
using System.Net.Http;
using openXDA.APIAuthentication;
using System.Text;
using System.IO;

namespace SEBrowser.Controllers.OpenXDA
{
    [RoutePrefix("api/OpenXDA")]
    public class TrendChannelController : ApiController
    {
        #region [ Nested Types ]

        // ToDo: These next two are defined in the HIDS controller for xda, do we want to make that an import?
        private class HistogramMetadata
        {
            public int ChannelID { get; set; }
            public int FundamentalFrequency { get; set; }
            public int SamplingRate { get; set; }
            public DateTime StartTime { get; set; }
            public DateTime EndTime { get; set; }
            public int TotalCapturedCycles { get; set; }
            public double CyclesMax { get; set; }
            public double CyclesMin { get; set; }
            public double ResidualMax { get; set; }
            public double ResidualMin { get; set; }
            public double FrequencyMax { get; set; }
            public double FrequencyMin { get; set; }
            public double RMSMax { get; set; }
            public double RMSMin { get; set; }
            public int CyclicHistogramBins { get; set; }
            public int ResidualHistogramBins { get; set; }
            public int FrequencyHistogramBins { get; set; }
            public int RMSHistogramBins { get; set; }
        }
        private class HistogramPoint
        {
            public int Bin { get; set; }

            public int Sample { get; set; }

            public float Value { get; set; }
        }
        private class ChannelDataSet
        {
            public List<object> Points { get; set; }
            public string ChannelID { get; set; }
            public double? BinSize { get; set; }
            public double? TimeSpanMs { get; set; }
        }

        #endregion

        #region [ Members ]
        const string SettingsCategory = "systemSettings";
        #endregion

        #region [ Http Methods ]
        [Route("GetTrendSearchData"), HttpPost]
        public DataTable GetTrendSearchData([FromBody] JObject postData)
        {
            using (AdoDataConnection connection = new(SettingsCategory))
            {
                string phaseFilter = GetKeyValueFilter(postData["Phases"], "Phase.Name");
                string channelGroupFilter = GetKeyValueFilter(postData["ChannelGroups"], "ChannelGroup.Name");
                string assetFilter = GetIDFilter(postData["AssetList"], "Asset.ID");
                string meterFilter = GetIDFilter(postData["MeterList"], "Meter.ID");
                // Meters must be selected
                if (string.IsNullOrEmpty(meterFilter)) return new DataTable();

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
	                    ChannelGroup ON ChannelGroup.ID = ChannelGroupType.ChannelGroupID
                    WHERE
	                    {filters}";

                DataTable table = connection.RetrieveData(query);

                return table;
            }
        }

        [Route("GetLineChartData"), HttpPost]
        public IHttpActionResult GetLineChartData([FromBody] JObject postData)
        {
            Task<Stream> streamTask = XDAAPIHelper.Post("api/HIDS/QueryPoints", new StringContent(postData.ToString(), Encoding.UTF8, "application/json"));
            IEnumerable<int> channelIds = postData["Channels"].ToObject<IEnumerable<int>>();
            Dictionary<string, List<object>> channelData = Enumerable.ToDictionary(channelIds, id => id.ToString("x8"), id => new List<object>());
            using (Stream stream = streamTask.Result)
            using (TextReader reader = new StreamReader(stream))
            {
                while (true)
                {
                    string line = reader.ReadLine();

                    if (line == null)
                        break;

                    if (line == string.Empty)
                        continue;

                    JObject point = JObject.Parse(line);

                    //TODO: Perform downsampling to get to something reasonable for a webpage here (maybe 100 or so points per channel?). This would ignore a point before insertion
                    if (channelData.TryGetValue(point["Tag"].Value<string>(), out List<object> channelList))
                    {
                        channelList.Add(point);
                    }

                }
            }
            return Ok(channelData);
        }

        [Route("GetCyclicChartData"), HttpPost]
        public IHttpActionResult GetCyclicChartData([FromBody] JObject postData)
        {
            // Read metadata into list
            Task<Stream> metaTask = XDAAPIHelper.Post("api/HIDS/QueryHistogramMetadata", new StringContent(postData.ToString(), Encoding.UTF8, "application/json"));
            HashSet<HistogramMetadata> metaList = new HashSet<HistogramMetadata>();
            using (Stream stream = metaTask.Result)
            using (TextReader reader = new StreamReader(stream))
            {
                while (true)
                {
                    string line = reader.ReadLine();

                    if (line == null)
                        break;

                    foreach(JObject metaData in JArray.Parse(line)) 
                        metaList.Add(metaData.ToObject<HistogramMetadata>());
                }
            }

            // Read Cyclic Data into chart graphable format
            IEnumerable<int> channelIds = postData["Channels"].ToObject<IEnumerable<int>>();
            return Ok(channelIds.Select(id => 
            {
                JObject channelPostData = new JObject
                {
                    { "Channel", id }
                };
                ChannelDataSet dataSet = new ChannelDataSet()
                {
                    Points = new List<object>(),
                    ChannelID = id.ToString("x8")
                };
                IEnumerable<HistogramMetadata> channelMeta = metaList.Where(metadata => metadata.ChannelID == id);
                foreach(HistogramMetadata partialMeta in channelMeta)
                {
                    channelPostData.Add("Timestamp", partialMeta.StartTime);
                    long ticksPerIndex = partialMeta.EndTime.Subtract(partialMeta.StartTime).Ticks / ((partialMeta.SamplingRate / partialMeta.FundamentalFrequency) + 1);
                    double binSize = (partialMeta.CyclesMax - partialMeta.CyclesMin) / partialMeta.CyclicHistogramBins;
                    Task<Stream> cyclicTask = XDAAPIHelper.Post("api/HIDS/QueryCyclicHistogramData", new StringContent(channelPostData.ToString(), Encoding.UTF8, "application/json"));
                    using (Stream stream = cyclicTask.Result)
                    using (TextReader reader = new StreamReader(stream))
                    {
                        while (true)
                        {
                            string line = reader.ReadLine();

                            if (line == null)
                                break;

                            if (line == string.Empty)
                                continue;

                            //Todo: add sample rate culling
                            foreach (JObject jPoint in JArray.Parse(line))
                            {
                                HistogramPoint histPoint = jPoint.ToObject<HistogramPoint>();
                                object[] point = new object[] { partialMeta.StartTime.AddTicks(histPoint.Sample * ticksPerIndex), partialMeta.CyclesMin + binSize * histPoint.Bin, histPoint.Value };
                                dataSet.Points.Add(point);
                            }
                        }
                    }
                    // This will only capture the last, but we have an assumption here that its always the same
                    dataSet.BinSize = binSize;
                    dataSet.TimeSpanMs = new TimeSpan(ticksPerIndex).TotalMilliseconds;
                }
                return dataSet;
            }));

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

        // TODO: This code was basically copied from LSCVS, do we want to simply move it to be something in APIAuth?
        #region [ XDA Helper ]
        /// <summary>
        /// Static Helper class that provides openXDA API Calls
        /// </summary>
        public static class XDAAPIHelper
        {
            #region [Static]

            /// <summary>
            /// API Token used to access OpenXDA
            /// </summary>
            private static string Token
            {
                get
                {
                    using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                        return new TableOperations<Model.System.Settings>(connection).QueryRecordWhere($"Name = 'XDAApiToken' AND Scope='app.setting'")?.Value ?? "localhost:8989/";
                }

            }

            /// <summary>
            /// API Key used to access OpenXDA
            /// </summary>
            private static string Key
            {
                get
                {
                    using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                        return new TableOperations<Model.System.Settings>(connection).QueryRecordWhere($"Name = 'XDAApiKey' AND Scope='app.setting'")?.Value ?? "";
                }

            }

            /// <summary>
            /// API Key used to access OpenXDA
            /// </summary>
            private static string Host
            {
                get
                {
                    using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                        return new TableOperations<Model.System.Settings>(connection).QueryRecordWhere($"Name = 'XDAInstance' AND Scope='app.setting'")?.Value ?? "";
                }

            }

            /// <summary>
            /// Makes Post request on OpenXDA
            /// </summary>
            /// <param name="requestURI">Path to specific API request</param>
            /// <param name="content"> The <see cref="HttpContent"/> of the request </param>
            /// <returns> response as a <see cref="Stream"/></returns>
            public static async Task<Stream> Post(string requestURI, HttpContent content)
            {
                APIQuery query = new APIQuery(Key, Token, Host.Split(';'));

                void ConfigureRequest(HttpRequestMessage request)
                {
                    request.Method = HttpMethod.Post;
                    request.Content = content;
                }

                HttpResponseMessage responseMessage = await query.SendWebRequestAsync(ConfigureRequest, requestURI).ConfigureAwait(false);
                return await responseMessage.Content.ReadAsStreamAsync().ConfigureAwait(false);
            }
            #endregion

        }

        #endregion
    }
}