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
using System.Threading.Tasks;
using System.Net.Http;
using openXDA.APIAuthentication;
using Newtonsoft.Json;
using System.Text;
using System.IO;

namespace SEBrowser.Controllers.OpenXDA
{
    [RoutePrefix("api/OpenXDA")]
    public class TrendChannelController : ApiController
    {
        #region [ Nested Types ]
        private class HIDSPoint
        {
            public string Tag { get; set; }
            public double Minimum { get; set; }
            public double Maximum { get; set; }
            public double Average { get; set; }
            public uint QualityFlags { get; set; }
            public DateTime Timestamp { get; set; }
        }
        private class ChannelDataSet
        {
            public List<HIDSPoint> Points { get; set; }
            public string ChannelID { get; set; }
        }

        #endregion

        #region [ Members ]
        const string SettingsCategory = "systemSettings";
        #endregion

        #region [ Http Methods ]
        [Route("GetTrendSearchData"), HttpPost]
        public DataTable GetEventSearchData([FromBody] JObject postData)
        {
            using (AdoDataConnection connection = new(SettingsCategory))
            {
                string phaseFilter = GetKeyValueFilter(postData["Phases"], "Phase.Name");
                string channelGroupFilter = GetKeyValueFilter(postData["ChannelGroups"], "ChannelGroup.Name");
                string meterFilter = GetIDFilter(postData["MeterList"], "Meter.ID");
                string assetFilter = GetIDFilter(postData["AssetList"], "Asset.ID");

                //TODO: IMPORTANT: DONT FORGET: Change first line to the following before pushing
                //Channel.Trend = 1
                string filters =
                    $@"1 = 1
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
	                    Meter.AssetKey AS MeterKey,
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

        [Route("GetLineChartData"), HttpPost]
        public IHttpActionResult GetLineChartData([FromBody] JObject postData)
        {
            using (AdoDataConnection connection = new(SettingsCategory))
            {
                // TODO: specifing a time filter within a day seems to pull the entire day
                Task<Stream> streamTask = XDAAPIHelper.Post("api/HIDS/QueryPoints", new StringContent(postData.ToString(), Encoding.UTF8, "application/json"));
                IEnumerable<int> channelIds = postData["Channels"].ToObject<IEnumerable<int>>();
                List<ChannelDataSet> channelList = channelIds.Select(id => new ChannelDataSet()
                {
                    Points = new List<HIDSPoint>(),
                    ChannelID = id.ToString("x8")
                }).ToList();
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

                        HIDSPoint point = JObject
                            .Parse(line)
                            .ToObject<HIDSPoint>();

                        //TODO: Perform downsampling to get to something reasonable for a webpage here (maybe 100 or so points per channel?). This would ignore a point before insertion
                        int index = channelList.FindIndex(chan => chan.ChannelID == point.Tag);
                        if (index < 0) continue; // should be impossible, but never discount unexpected weirdness
                        channelList[index].Points.Add(point);
                    }
                }
                return Ok(channelList);
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