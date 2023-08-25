using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;

namespace SEBrowser.Controllers
{
    [RoutePrefix("api/SEBrowser/SecurityRoles")]
    public class SecurityRoleController : ApiController
    {
        [Route(), HttpGet]
        public IHttpActionResult GetRoles()
        {
            List<string> roles = new List<string>();

            if (User.IsInRole("Engineer")) roles.Add("Engineer");
            if (User.IsInRole("Viewer")) roles.Add("Viewer");

            return Ok(roles);
        }
    }
}