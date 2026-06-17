using Gemstone.Data;
using Gemstone.Data.Model;
using Microsoft.AspNetCore.Mvc;
using SEBrowser.Model.System;

namespace SEBrowser.Controllers;

[Route("api/SEBrowser")]
public class SEBrowserController : ControllerBase
{
    #region [ Members ]
    const string SettingsCategory = "systemSettings";
    #endregion

    #region [ Event Search ]
    [Route("GetEventPreviewPaneSettings"), HttpGet]
    public IActionResult GetEventPreviewPaneSettings()
    {
        using AdoDataConnection connection = new(Gemstone.Configuration.Settings.Default);

        return Ok(new TableOperations<EventPreviewPaneSetting>(connection).QueryRecords("OrderBy ASC"));
    }

    [Route("GetTimeZone"), HttpGet]
    public IActionResult GetTimeZoneOffset()
    {
        using AdoDataConnection connection = new AdoDataConnection(Gemstone.Configuration.Settings.Default);

        // Seperate setting from system setting due to UNIX/Windows differences, since Windows does not use the IANA timezones, and js requires them
        string systemTime = connection.ExecuteScalar<string>("SELECT TOP 1 [Value] FROM [SEBrowser.Setting] WHERE Name = 'System.IANATimeZone'");

        if (string.IsNullOrEmpty(systemTime))
            return Ok(0);

        return Ok(systemTime);
    }
    #endregion

}
