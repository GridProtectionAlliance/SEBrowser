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
//  03/18/2024 - Gabriel Santos
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
using System.Net.Http.Headers;

namespace SEBrowser.Controllers.OpenXDA
{
    /// <summary>
    /// Helper class that provides openXDA API Calls
    /// </summary>
    public class SEBrowserXDAAPIHelper : XDAAPIHelper
    {
        /// <summary>
        /// API Token used to access OpenXDA
        /// </summary>
        protected override string Token
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
        protected override string Key
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
        protected override string Host
        {
            get
            {
                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                    return new TableOperations<Model.System.Settings>(connection).QueryRecordWhere($"Name = 'XDAInstance' AND Scope='app.setting'")?.Value ?? "";
            }

        }
    }
}