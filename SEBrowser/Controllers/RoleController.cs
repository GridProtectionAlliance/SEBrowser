using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace SEBrowser.Controllers;

public class SecurityRoleController : ControllerBase
{
    [Route("api/SEBrowser/SecurityRoles"), HttpGet]
    public IActionResult GetRoles()
    {
        List<string> roles = new List<string>();

        //this wont work anymore
        if (User.IsInRole("Engineer")) roles.Add("Engineer");
        if (User.IsInRole("Viewer")) roles.Add("Viewer");

        return Ok(roles);
    }
}