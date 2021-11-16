//******************************************************************************************************
//  ESRIMapQueryController.cs - Gbtc
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
//  04/01/2020 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

using HtmlAgilityPack;
using System;
using System.Data;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;

namespace SEBrowser.Controllers
{
    [RoutePrefix("api/ESRIMap")]
    public class ESRIMapQueryController : ApiController
    {
        const string SettingsCategory = "systemSettings";

        [Route("NearestStructure/{station}/{line}"), HttpGet]
        public IHttpActionResult GetNearestStructrue(string station, string line, string mileage) {
            bool HandlePreRequest(HttpWebRequest request)
            {
                request.UseDefaultCredentials = true;
                return true;
            }

            try
            {
                string url = $"http://opsptpsnet.cha.tva.gov:8025/TLI/StructureCrawler/FaultFinder.asp?Station={station}&Line={line}&Mileage={mileage}";
                HtmlWeb webClient = new HtmlWeb();
                webClient.PreRequest += HandlePreRequest;
                HtmlDocument doc = webClient.Load(url);
                string csv = doc.DocumentNode.InnerText.Trim();
                
                return Ok(ToDataTable(csv));
            }
            catch (Exception ex) {
                return InternalServerError(ex);
            }
        }

        [HttpGet, Route("Image/{base64Encoded}")]
        public HttpResponseMessage GetImage(string base64Encoded)
        {
            byte[] data = Convert.FromBase64String(base64Encoded);
            string filePath = System.Text.ASCIIEncoding.UTF8.GetString(data);
           
            HttpResponseMessage result = new HttpResponseMessage(HttpStatusCode.OK);
            FileStream fileStream = File.OpenRead(filePath);
            result.Content = new StreamContent(fileStream);
            result.Content.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
            return result;
        }


        private DataTable ToDataTable(string csvInput)
        {
            char[] newLineChars = new[] { '\r', '\n' };

            string[] lines = csvInput.Trim()
                .Split(newLineChars, StringSplitOptions.RemoveEmptyEntries)
                .Select(line => line.Trim())
                .Where(line => !string.IsNullOrEmpty(line))
                .ToArray();

            string[] fields = lines[0].Split(',');

            DataTable table = new DataTable();

            foreach (string field in fields)
                table.Columns.Add(field);

            foreach (string row in lines.Skip(1))
            {
                string[] values = row.Split(',');
                table.Rows.Add(values);
            }

            return table;
        }
    }
}