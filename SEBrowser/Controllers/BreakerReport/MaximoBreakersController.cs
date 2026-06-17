//******************************************************************************************************
//  OpenSEEController.cs - Gbtc
//
//  Copyright © 2018, Grid Protection Alliance.  All Rights Reserved.
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
//  04/17/2018 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************
using Gemstone.Configuration;
using Gemstone.Data;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Data;
using System.Runtime.Caching;

namespace SEBrowser.Controllers.BreakerReport;

public class MaximoBreakersController : ControllerBase
{
    #region [ Members ]

    // Fields
    private DateTime m_epoch = new(1970, 1, 1);

    #endregion

    #region [ Constructors ]
    public MaximoBreakersController() : base() { }
    #endregion

    #region [ Static ]
    private static MemoryCache s_memoryCache;

    static MaximoBreakersController()
    {
        s_memoryCache = new MemoryCache("MaximoBreakers");
    }
    #endregion

    #region [ Methods ]

    [Route("api/BreakerReport/MaximoBreakers"), HttpGet]
    public DataTable Get()
    {
        using AdoDataConnection connection = new(Settings.Default);

        DataTable table = new();

        using IDbCommand sc = connection.Connection.CreateCommand();

        sc.CommandText = @" 
                        SELECT DISTINCT
                            StationName + ' - ' + BreakerNum as BreakerName, 
                            SUBSTRING(BreakerNum, PATINDEX('%[^0]%', BreakerNum + '.'), LEN(BreakerNum)) as AssetKey 
                        FROM 
                            MaximoBreaker
                        ORDER BY BreakerName
                    ";

        sc.CommandType = CommandType.Text;

        IDataReader rdr = sc.ExecuteReader();
        table.Load(rdr);

        return table;

    }
    #endregion

}
