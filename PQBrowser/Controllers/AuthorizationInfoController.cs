//******************************************************************************************************
//  AuthorizationInfoController.cs - Gbtc
//
//  Copyright © 2026, Grid Protection Alliance.  All Rights Reserved.
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
//  07/02/2026 - Preston Crawford
//       Generated original version of source code.
//
//******************************************************************************************************

using System.Collections.Generic;
using Gemstone.Web.APIController;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace PQBrowser.Controllers;

/// <summary>
/// Exposes resource access checks so the frontend can determine what the user is authorized to do.
/// </summary>
[Route("api/authorization")]
[ApiController]
public class AuthorizationInfoController : AuthorizationInfoControllerBase
{
    [Authorize(Startup.Policies.Authenticated)]
    public override IEnumerable<bool> CheckAccess([FromBody] ResourceAccessEntry[] accessList)
    {
        return base.CheckAccess(accessList);
    }
}
