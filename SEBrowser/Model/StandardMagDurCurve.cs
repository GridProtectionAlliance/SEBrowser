//******************************************************************************************************
//  OpenXDAController.cs - Gbtc
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
//  03/04/2020 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

using FaultData.DataAnalysis;
using GSF;
using GSF.Data;
using GSF.Data.Model;
using GSF.Web;
using GSF.Web.Model;
using openXDA.Model;
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

namespace SEBrowser.Controllers
{
    [CustomView(@"SELECT
                    ID, Name, XHigh, XLow, YHigh, YLow, NULL AS UpperCurve, NULL AS LowerCurve,
                    REPLACE(REPLACE(RIGHT(Area.STAsText(), len(Area.STAsText()) - charindex('(', Area.STAsText())),')',''),'(','') AS Area
                    FROM StandardMagDurCurve")]
    [SettingsCategory("systemSettings")]
    public class StandardMagDurCurve
    {
        [PrimaryKey]
        public int ID { get; set; }
        public string Name { get; set; }
        public double XHigh { get; set; }
        public double XLow { get; set; }
        public double YHigh { get; set; }
        public double YLow { get; set; }
        public string UpperCurve { get; set; }
        public string LowerCurve { get; set; }
        public string Area { get; set; }
    }

    [RoutePrefix("api/StandardMagDurCurve")]
    public class StandardMagDurCurveController : ModelController<StandardMagDurCurve>
    { }

}