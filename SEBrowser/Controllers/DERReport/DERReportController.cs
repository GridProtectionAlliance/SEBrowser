//******************************************************************************************************
//  DERReportController.cs - Gbtc
//
//  Copyright © 2021, Grid Protection Alliance.  All Rights Reserved.
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
//  11/15/2021 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

using FaultData.DataAnalysis;
using GSF;
using GSF.Collections;
using GSF.Data;
using GSF.Data.Model;
using GSF.Web;
using openXDA.Model;
using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Net.Security;
using System.Runtime.Caching;
using System.Security.Cryptography.X509Certificates;
using System.Text.RegularExpressions;
using System.Web.Http;

namespace SEBrowser.Controllers
{
    [RoutePrefix("api/DERReport")]
    public class DERReportController : ApiController
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

        public enum TimeWindowUnits
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
        public DERReportController() : base() { }
        #endregion

        #region [ Static ]
        private static MemoryCache s_memoryCache;

        static DERReportController()
        {
            s_memoryCache = new MemoryCache("DERReport");
        }
        #endregion

        #region [ Methods ]

        [Route("Substation"), HttpGet]
        public IHttpActionResult GetSubstations()
        {
            try {
                using (AdoDataConnection connection = new("systemSettings"))
                {
                    DataTable table = new();

                    using (IDbCommand sc = connection.Connection.CreateCommand())
                    {
                        sc.CommandText = @" 
                    SELECT
	                    Distinct
	                    Location.ID as LocationID,
	                    Location.LocationKey,
	                    Location.Name
                    FROM
	                    Location JOIN
	                    Meter ON Location.ID = Meter.LocationID JOIN
	                    MeterAsset ON Meter.ID = MeterAsset.MeterID JOIN
	                    Asset ON MeterAsset.AssetID = Asset.ID AND Asset.AssetTypeID = (SELECT ID FROM AssetType WHERE Name = 'DER')
                    ORDER BY Name";

                        sc.CommandType = CommandType.Text;

                        IDataReader rdr = sc.ExecuteReader();
                        table.Load(rdr);

                        return Ok(table);
                    }
                }
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        public class DERPostRequest
        {
            public List<int> SubstationIDs { get; set; }
        }

        [Route("DER"), HttpPost]
        public IHttpActionResult GetDER([FromBody] DERPostRequest content)
        {
            try
            {
                using (AdoDataConnection connection = new("systemSettings"))
                {
                    DataTable table = new();

                    using (IDbCommand sc = connection.Connection.CreateCommand())
                    {
                        sc.CommandText = $@" 
                        SELECT
	                        Asset.*
                        FROM
	                        Location JOIN
	                        Meter ON Location.ID = Meter.LocationID JOIN
	                        MeterAsset ON Meter.ID = MeterAsset.MeterID JOIN
	                        Asset ON MeterAsset.AssetID = Asset.ID AND Asset.AssetTypeID = (SELECT ID FROM AssetType WHERE Name = 'DER')
                        WHERE
	                        Location.ID IN ({(content.SubstationIDs.Any() ? string.Join(",", content.SubstationIDs) : "-1")})
                    ORDER BY AssetName";

                        sc.CommandType = CommandType.Text;

                        IDataReader rdr = sc.ExecuteReader();
                        table.Load(rdr);

                        return Ok(table);
                    }
                }
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }


        }

        [Route("Regulation"), HttpGet]
        public IHttpActionResult GetRegulations()
        {
            try
            {
                List<string> regulations = new() {
                "7.1 Limitation of dc injection",
                "7.2.2 Rapid Voltage Change (RVC)",
                "7.2.3 Flicker",
                "7.3 Limitation of current distoriation",
                "7.4.1 Limitation of overvoltage over one fundametnal frequency",
                "7.4.2 Limitation of cumulative instantaneous overvoltage"
            };

                return Ok(regulations);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }

        }

        public class DERReportPostRequest
        {
            public List<int> DERIDs { get; set; }
            public DateTime StartTime { get; set; }
            public DateTime EndTime { get; set; }
            public List<string> Regulations { get; set; }

        }

        [Route(""), HttpPost]
        public IHttpActionResult Get([FromBody]DERReportPostRequest content)
        {
            using (AdoDataConnection connection = new("systemSettings"))
            {
                DataTable table = new();

                using (IDbCommand sc = connection.Connection.CreateCommand())
                {
                    string sql = $@"
                        SELECT
	                        Meter.Name as Meter,
	                        Asset.AssetName as Asset,
	                        ChannelDetail.MeasurementType + ' ' +ChannelDetail.MeasurementCharacteristic + ' ' +ChannelDetail.Phase + ' HG: ' + CAST(ChannelDetail.HarmonicGroup as VARCHAR(MAX)) as Channel,
	                        DERAnalyticResult.*  
                        FROM
	                        DERAnalyticResult JOIN
	                        Meter ON DERAnalyticResult.MeterID = Meter.ID JOIN
	                        Asset ON DERAnalyticResult.AssetID = Asset.ID JOIN
	                        ChannelDetail ON DERAnalyticResult.ChannelID = ChannelDetail.ID 
                        WHERE 
                            Asset.ID IN ({(content.DERIDs.Any() ? string.Join(",", content.DERIDs) : "-1")}) AND 
                            (DERAnalyticResult.Time BETWEEN DATEADD('{content.StartTime}') AND DATEADD('{content.EndTime}')) AND
                            DERAnalyticResult.Regulation IN ({(content.Regulations.Any() ? string.Join(",", content.Regulations.Select(s => "'" +s + "'")) : "-1")})

                        ORDER BY DERAnalyticResult.Time";

                    sc.CommandText = sql;
                    sc.CommandType = CommandType.Text;

                    IDataReader rdr = sc.ExecuteReader();
                    table.Load(rdr);

                    return Ok(table);
                }
            }

        }

        [Route("Data/{id:int}"), HttpGet]
        public IHttpActionResult Get(int id)
        {
            try
            {
                DERAnalyticResult result;

                using (AdoDataConnection connection = new("systemSettings"))
                {
                    result = new TableOperations<DERAnalyticResult>(connection).QueryRecordWhere("ID = {0}", id);
                };

                if (result.EventID != null)
                    return GetWaveformData(result);
                else if (result.Regulation == "7.3 Limitation of current distoriation")
                    return GetDistortionTrendData(result);
                else
                    return GetTrendData(result);

            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }

        }


        #region [ Trending Data ]

        private IHttpActionResult GetTrendData(DERAnalyticResult result) {
            using (HttpClientHandler handler = new())
            using (HttpClient client = new(handler))
            {
                DER der;

                string host = "";
                string pointBucket = "";
                string org = "";
                string token = "";
                ChannelDetail channel;
                using(AdoDataConnection connection = new("systemSettings"))
                {
                    host = connection.ExecuteScalar<string>("SELECT Value FROM Setting WHERE Name = 'HIDS.Host'");
                    pointBucket = connection.ExecuteScalar<string>("SELECT Value FROM Setting WHERE Name = 'HIDS.PointBucket'");
                    org = connection.ExecuteScalar<string>("SELECT Value FROM Setting WHERE Name = 'HIDS.OrganizationID'");
                    token = connection.ExecuteScalar<string>("SELECT Value FROM Setting WHERE Name = 'HIDS.TokenID'");
                    der = new TableOperations<DER>(connection).QueryRecordWhere("ID = {0}", result.AssetID);
                    channel = new TableOperations<ChannelDetail>(connection).QueryRecordWhere("ID = {0}", result.ChannelID);

                }

                double nominalVoltage = der.VoltageKV * 1000;

                if (new List<string>() { "AN", "BN", "CN" }.IndexOf(channel.Phase) >= 0)
                    nominalVoltage = nominalVoltage / Math.Sqrt(3);

                client.BaseAddress = new Uri(host);
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Token",token);
                DateTime start = new(result.Time.Year, result.Time.Month, result.Time.Day);
                DateTime end = start.AddDays(1).AddSeconds(-1);
                try
                {
                    //handler.ServerCertificateCustomValidationCallback = ServerCertificateCustomValidation;
                    string query = $"from(bucket: \"{ pointBucket}\")\n" +
                            $"|> range(start: {start.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")}, stop: {end.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")})\n" +
                             "|> filter(fn: (r) => r._field == \"avg\")\n" +
                            $"|> filter(fn: (r) => r.tag == \"{result.ChannelID.ToString("X").PadLeft(8, '0')}\")";

                    var json = new { 
                        query = query,
                        type = "flux"
                    };
                    var response = client.PostAsync($"api/v2/query?org={org}", JsonContent.Create(json)).Result;
                    if (!response.IsSuccessStatusCode)
                        throw new Exception(response.ReasonPhrase);

                    string data = response.Content.ReadAsStringAsync().Result;
                    List<InfluxQueryTable> list = ParseCSV(data);
                    var points = list.Where(l => l.tag == result.ChannelID).GroupBy(d => d._time).Select(d => new { Time = d.Key, Value = d.Sum(x => x._value) });
                    var dataPoints = points.Select((dp,i) => {
                        if(result.Regulation.Contains("7.1"))
                            return new double[2] { dp.Time.Subtract(m_epoch).TotalMilliseconds, dp.Value*100/der.FullRatedOutputCurrent };
                        else if (result.Regulation.Contains("7.4.1"))
                            return new double[2] { dp.Time.Subtract(m_epoch).TotalMilliseconds, dp.Value / nominalVoltage };
                        else
                            return new double[2] { dp.Time.Subtract(m_epoch).TotalMilliseconds, dp.Value };
                    });

                    return Ok(dataPoints);
                }
                catch (Exception ex)
                {
                    return InternalServerError(ex);
                }

            }

        }

        private IHttpActionResult GetDistortionTrendData(DERAnalyticResult result)
        {
            Regex expression = new(@"^(?<lower>\d+)\s*<=\s*h\s*<\s*(?<upper>\d+)|Even,\s*h\s*>=\s*(?<threshold>\d+)$");
            Match match = expression.Match(result.Parameter);

            if (match.Success)
            {
                int lower = int.Parse(match.Groups["lower"].Value == string.Empty ? "-1" : match.Groups["lower"].Value);
                int upper = int.Parse(match.Groups["upper"].Value == string.Empty ? "-1" : match.Groups["upper"].Value);
                int threshold = int.Parse(match.Groups["threshold"].Value == string.Empty ? "-1" : match.Groups["threshold"].Value);

                if (threshold >= 0)
                    return GetDistortionTrendData(result, threshold);
                else
                    return GetDistortionTrendData(result, lower, upper);
            }
            else
                return InternalServerError(new Exception("Result paramater not constructed correctly"));

        }

        private IHttpActionResult GetDistortionTrendData(DERAnalyticResult result, int lower, int upper)
        {
            using (HttpClientHandler handler = new())
            using (HttpClient client = new(handler))
            {
                string host = "";
                string pointBucket = "";
                string org = "";
                string token = "";
                DER der;

                List<Channel> harmonicChannels;
                Channel rmsChannel;
                using (AdoDataConnection connection = new("systemSettings"))
                {
                    host = connection.ExecuteScalar<string>("SELECT Value FROM Setting WHERE Name = 'HIDS.Host'");
                    pointBucket = connection.ExecuteScalar<string>("SELECT Value FROM Setting WHERE Name = 'HIDS.PointBucket'");
                    org = connection.ExecuteScalar<string>("SELECT Value FROM Setting WHERE Name = 'HIDS.OrganizationID'");
                    token = connection.ExecuteScalar<string>("SELECT Value FROM Setting WHERE Name = 'HIDS.TokenID'");
                    rmsChannel = new TableOperations<Channel>(connection).QueryRecordWhere("ID = {0}", result.ChannelID);
                    der = new TableOperations<DER>(connection).QueryRecordWhere("ID = {0}", result.AssetID);
                    harmonicChannels = new TableOperations<Channel>(connection).QueryRecordsWhere(@"
                        MeterID = {0} AND 
                        AssetID = {1} AND 
                        MeasurementTypeID = (SELECT ID FROM MeasurementType WHERE Name = 'Current') AND 
                        MeasurementCharacteristicID = (SELECT ID FROM MeasurementCharacteristic WHERE Name = 'SpectraHGroup') AND
                        PhaseID = (SELECT PhaseID FROM Channel WHERE ID = {2}) AND
                        HarmonicGroup > {3} AND
                        HarmonicGroup < {4}
                    ", result.MeterID, result.AssetID, result.ChannelID, lower, upper).ToList();

                }

                client.BaseAddress = new Uri(host);
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Token", token);
                DateTime start = new(result.Time.Year, result.Time.Month, result.Time.Day);
                DateTime end = start.AddDays(1).AddSeconds(-1);
                try
                {
                    string query = $"from(bucket: \"{ pointBucket}\")\n" +
                            $"|> range(start: {start.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")}, stop: {end.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")})\n" +
                             "|> filter(fn: (r) => r._field == \"avg\")\n" +
                            $"|> filter(fn: (r) => r.tag == \"{result.ChannelID.ToString("X").ToLower().PadLeft(8, '0')}\" or {string.Join(" or ", harmonicChannels.Select(ch => $"r.tag == \"{ch.ID.ToString("X").ToLower().PadLeft(8, '0')}\""))})";

                    var json = new
                    {
                        query = query,
                        type = "flux"
                    };
                    var response = client.PostAsync($"api/v2/query?org={org}", JsonContent.Create(json)).Result;
                    if (!response.IsSuccessStatusCode)
                        throw new Exception(response.ReasonPhrase);

                    string data = response.Content.ReadAsStringAsync().Result;
                    List<InfluxQueryTable> list = ParseCSV(data);
                    var groupedHarmonics = list.Where(l => harmonicChannels.Select(x => x.ID).Contains(l.tag)).GroupBy(d => d._time).Select(d => new { Time = d.Key, Value = d.Sum(x => x._value) });
                    var rms = list.Where(l => l.tag == result.ChannelID).GroupBy(d => d._time).Select(d => new { Time = d.Key, Value = d.Sum(x => x._value) });
                    var dataPoints = groupedHarmonics.Join(rms, harmonicDP => harmonicDP.Time, rmsDP => rmsDP.Time, (dp, rmsDp) => {
                        return new double[2]{ dp.Time.Subtract(m_epoch).TotalMilliseconds, Math.Sqrt(Math.Abs(Math.Pow(dp.Value, 2) - Math.Pow(rmsDp.Value, 2))) / der.FullRatedOutputCurrent * 100 };
                    });

                    return Ok(dataPoints);
                }
                catch (Exception ex)
                {
                    return InternalServerError(ex);
                }

            }

        }

        private IHttpActionResult GetDistortionTrendData(DERAnalyticResult result, int threshold)
        {
            using (HttpClientHandler handler = new())
            using (HttpClient client = new(handler))
            {
                string host = "";
                string pointBucket = "";
                string org = "";
                string token = "";

                List<Channel> harmonicChannels;
                Channel rmsChannel;
                DER der;
                using (AdoDataConnection connection = new("systemSettings"))
                {
                    host = connection.ExecuteScalar<string>("SELECT Value FROM Setting WHERE Name = 'HIDS.Host'");
                    pointBucket = connection.ExecuteScalar<string>("SELECT Value FROM Setting WHERE Name = 'HIDS.PointBucket'");
                    org = connection.ExecuteScalar<string>("SELECT Value FROM Setting WHERE Name = 'HIDS.OrganizationID'");
                    token = connection.ExecuteScalar<string>("SELECT Value FROM Setting WHERE Name = 'HIDS.TokenID'");
                    rmsChannel = new TableOperations<Channel>(connection).QueryRecordWhere("ID = {0}", result.ChannelID);
                    der = new TableOperations<DER>(connection).QueryRecordWhere("ID = {0}", result.AssetID);

                    harmonicChannels = new TableOperations<Channel>(connection).QueryRecordsWhere(@"
                        MeterID = {0} AND 
                        AssetID = {1} AND 
                        MeasurementTypeID = (SELECT ID FROM MeasurementType WHERE Name = 'Current') AND 
                        MeasurementCharacteristicID = (SELECT ID FROM MeasurementCharacteristic WHERE Name = 'SpectraHGroup') AND
                        PhaseID = (SELECT PhaseID FROM Channel WHERE ID = {2}) AND
                        HarmonicGroup >= {3} AND
                        HarmonicGroup % 2 = 0
                    ", result.MeterID, result.AssetID, result.ChannelID, threshold).ToList();

                }

                client.BaseAddress = new Uri(host);
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Token", token);
                DateTime start = new(result.Time.Year, result.Time.Month, result.Time.Day);
                DateTime end = start.AddDays(1).AddSeconds(-1);
                try
                {
                    //handler.ServerCertificateCustomValidationCallback = ServerCertificateCustomValidation;
                    string query = $"from(bucket: \"{ pointBucket}\")\n" +
                            $"|> range(start: {start.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")}, stop: {end.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")})\n" +
                             "|> filter(fn: (r) => r._field == \"avg\")\n" +
                            $"|> filter(fn: (r) => r.tag == \"{result.ChannelID.ToString("X").ToLower().PadLeft(8, '0')}\" or {string.Join(" or ", harmonicChannels.Select(ch => $"r.tag == \"{ch.ID.ToString("X").ToLower().PadLeft(8, '0')}\""))})";

                    var json = new
                    {
                        query = query,
                        type = "flux"
                    };
                    var response = client.PostAsync($"api/v2/query?org={org}", JsonContent.Create(json)).Result;
                    if (!response.IsSuccessStatusCode)
                        throw new Exception(response.ReasonPhrase);

                    string data = response.Content.ReadAsStringAsync().Result;
                    List<InfluxQueryTable> list = ParseCSV(data);
                    var groupedHarmonics = list.Where(l => harmonicChannels.Select(x => x.ID).Contains(l.tag)).GroupBy(d => d._time).Select(d => new { Time = d.Key, Value = d.Sum(x => x._value) });
                    var rms =  list.Where(l => l.tag == result.ChannelID).GroupBy(d => d._time).Select(d => new { Time = d.Key, Value = d.Sum(x => x._value) });
                    var dataPoints = groupedHarmonics.Join(rms, harmonicDP => harmonicDP.Time, rmsDP => rmsDP.Time, (dp, rmsDp) => {
                        return new double[2] { dp.Time.Subtract(m_epoch).TotalMilliseconds, Math.Sqrt(Math.Abs(Math.Pow(dp.Value, 2) - Math.Pow(rmsDp.Value, 2))) / der.FullRatedOutputCurrent * 100 };
                    });

                    return Ok(dataPoints);
                }
                catch (Exception ex)
                {
                    return InternalServerError(ex);
                }

            }

        }

        private IHttpActionResult GetWaveformData(DERAnalyticResult result) {
            try
            {
                using(AdoDataConnection connection = new("systemSettings"))
                {
                    Meter meter = new TableOperations<Meter>(connection).QueryRecordWhere("ID = {0}", result.MeterID);
                    meter.ConnectionFactory = () => new AdoDataConnection("systemSettings");
                    byte[] data = ChannelData.DataFromEvent((int)result.EventID, result.ChannelID, () => new AdoDataConnection("systemSettings"));
                    DataSeries dataSeries = DataSeries.FromData(meter, data);
                    DataSeries rms = Transform.ToRMS(dataSeries, 60);
                    rms.Downsample(500);

                    List<DataPoint> dataPoints = rms.DataPoints;
                    var list = dataPoints.Select((dp, index) => {
                        if(result.Regulation.Contains("7.4.2"))
                            return new double[2] { dp.Time.Subtract(m_epoch).TotalMilliseconds, dp.Value };

                        double current = dp.Value;
                        double previous = dp.Value;
                        if (index > 0) previous = dataPoints[index - 1].Value;
                        double rvc = Math.Abs(current / previous - 1) * 100;
                        return new double[2] { dp.Time.Subtract(m_epoch).TotalMilliseconds, rvc };


                    }).ToList();
                    return Ok(list);
                }
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        public class InfluxQueryTable {
            public DateTime _time { get; set; }
            public double _value { get; set; }
            public int tag { get; set; }
            public string _field {get;set;}

            public InfluxQueryTable(DataRow row) {
                _time = (DateTime)row["_time"];
                _value = (double)row["_value"];
                tag = (int)row["tag"];
                _field = row["_field"].ToString();
            }
        }

        private List<InfluxQueryTable> ParseCSV(string data)
        {
            DataTable table = new();

            string[] tableData = data.Split("\r\n".ToCharArray(), StringSplitOptions.RemoveEmptyEntries);
            string[] cols = tableData[0].Split(",".ToCharArray(), StringSplitOptions.RemoveEmptyEntries);

            table.Columns.AddRange(cols.Select(x => {
                if (x == "_time")
                    return new DataColumn(x, typeof(DateTime));
                else if (x == "_value")
                    return new DataColumn(x, typeof(double));
                else if (x == "tag")
                    return new DataColumn(x, typeof(int));
                else
                    return new DataColumn(x, typeof(string));
            }).ToArray());

            foreach (string row in tableData.Skip(1))
            {
                var dd = row.Split(",".ToCharArray(), StringSplitOptions.RemoveEmptyEntries);
                DataRow dataRow = table.NewRow();

                for (int i = 0; i < cols.Length; i++)
                {

                    if (cols[i] == "_time")
                        dataRow[cols[i]] = DateTime.ParseExact(dd[i], "yyyy-MM-ddTHH:mm:ssZ", CultureInfo.InvariantCulture);
                    else if (cols[i] == "_value")
                        dataRow[cols[i]] = double.Parse(dd[i]);
                    else if (cols[i] == "tag")
                        dataRow[cols[i]] = int.Parse(dd[i], System.Globalization.NumberStyles.HexNumber);
                    else
                        dataRow[cols[i]] = dd[i];

                }
                table.Rows.Add(dataRow);
            }
            table.Columns.Remove("result");
            table.Columns.Remove("table");
            table.Columns.Remove("_start");
            table.Columns.Remove("_stop");
            table.Columns.Remove("_measurement");

            return table.Select().Select(row => new InfluxQueryTable(row)).ToList();
        }

        [Route("GetTrend"), HttpGet]
        public TrendingResponse GetTrendData()
        {
            Dictionary<string, string> query = Request.QueryParameters();
            int capBankId = int.Parse(query["capBankId"]);
            DateTime dateTime = DateTime.ParseExact(query["date"] + " " + query["time"], "MM/dd/yyyy HH:mm:ss.fff", new CultureInfo("en-US"));
            string timeWindowUnits = ((TimeWindowUnits)int.Parse(query["timeWindowUnits"])).GetDescription();
            int windowSize = int.Parse(query["windowSize"]);
            int selectedBank = int.Parse(query["bankNum"]);
            

            string timeRestriction = $"(CBAnalyticResult.Time BETWEEN DATEADD({ timeWindowUnits}, { (-1 * windowSize)}, '{dateTime}') AND DATEADD({ timeWindowUnits}, { (windowSize)},  '{dateTime}'))";
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

        private static bool ServerCertificateCustomValidation(HttpRequestMessage requestMessage, X509Certificate2 certificate, X509Chain chain, SslPolicyErrors sslErrors)
        {
            // It is possible inpect the certificate provided by server
            Console.WriteLine($"Requested URI: {requestMessage.RequestUri}");
            Console.WriteLine($"Effective date: {certificate.GetEffectiveDateString()}");
            Console.WriteLine($"Exp date: {certificate.GetExpirationDateString()}");
            Console.WriteLine($"Issuer: {certificate.Issuer}");
            Console.WriteLine($"Subject: {certificate.Subject}");

            // Based on the custom logic it is possible to decide whether the client considers certificate valid or not
            Console.WriteLine($"Errors: {sslErrors}");
            return sslErrors == SslPolicyErrors.None;
        }

        #endregion 

        #endregion

    }
}