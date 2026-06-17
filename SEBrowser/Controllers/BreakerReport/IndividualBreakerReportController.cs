//******************************************************************************************************
//  IndividualBreakerReportController.cs - Gbtc
//
//  Copyright © 2019, Grid Protection Alliance.  All Rights Reserved.
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
//  07/02/2019 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

using Microsoft.AspNetCore.Mvc;
//using openXDA.Reports;
using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Runtime.Caching;

namespace SEBrowser.Controllers.BreakerReport;

public class IndividualBreakerReportController : ControllerBase
{
    #region [ Members ]

    // Fields
    private DateTime m_epoch = new(1970, 1, 1);

    #endregion

    #region [ Constructors ]
    public IndividualBreakerReportController() : base() { }
    #endregion

    #region [ Static ]
    private static MemoryCache s_memoryCache;

    static IndividualBreakerReportController()
    {
        s_memoryCache = new MemoryCache("IndividualBreakerReportController");
    }
    #endregion

    #region [ Methods ]

    [Route("api/BreakerReport/IndividualBreakerReport"), HttpGet]
    public IActionResult Get(string breakerId, string startDate, string endDate)
    {
        throw new Exception("This report is currently unavailable.");

        /*
        DateTime startTime = DateTime.Parse(startDate);
        DateTime endTime = DateTime.Parse(endDate);
        IndividualBreakerReport report = new(breakerId, startTime, endTime);
        byte[] pdf = report.createPDF();
        using MemoryStream stream = new();

        if (pdf == null) return BadRequest();

        stream.WriteAsync(pdf, 0, pdf.Length);

        HttpResponseMessage result = new(HttpStatusCode.OK)
        {
            Content = new ByteArrayContent(stream.ToArray()),
        };

        result.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue($"inline")
        {
            FileName = "IndividualBreakerReport_" + breakerId + "_" + startTime.ToString("MM_dd_yyyy") + "_" + endTime.ToString("MM_dd_yyyy") + ".pdf"
        };

        result.Content.Headers.ContentType = new MediaTypeHeaderValue("application/pdf");

        return Ok(result);*/
    }
    #endregion

}
