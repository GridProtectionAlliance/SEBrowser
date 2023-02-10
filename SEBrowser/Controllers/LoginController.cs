using System;
using System.Web.Mvc;

namespace SEBrowser.Controllers;

public class LoginController : Controller
{
    [AllowAnonymous]
    public ActionResult Index()
    {
        if (!Startup.OwinLoaded)
            throw new InvalidOperationException("Owin pipeline not loaded. Try running 'update-package Microsoft.Owin.Host.SystemWeb -reinstall' from NuGet Package Manager Console.");

        return View();
    }

    [Route("~/AuthTest")]
    [Authorize]
    public ActionResult AuthTest()
    {
        return View();
    }

    [Route("~/Logout")]
    [AllowAnonymous]
    public ActionResult Logout()
    {
        return View();
    }
}