using FaultData.DataAnalysis;
using GSF;
using GSF.Data;
using GSF.Data.Model;
using GSF.Web;
using openXDA.Model;
using SEBrowser.Model.System;
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
    [RoutePrefix("api/SEBrowser")]
    public class SEBrowserController : ApiController
    {
        #region [ Members ]
        const string SettingsCategory = "systemSettings";
        #endregion

        #region [ Event Search ]
        [Route("GetEventPreviewPaneSettings"), HttpGet]
        public IHttpActionResult GetEventPreviewPaneSettings() {
            try
            {
                using (AdoDataConnection connection = new AdoDataConnection(SettingsCategory))
                {
                    return Ok(new TableOperations<EventPreviewPaneSetting>(connection).QueryRecords("OrderBy ASC"));
                }
            }
            catch (Exception ex) {
                return InternalServerError(ex);
            }
        }

        [Route("GetLinks/{category}"), HttpGet]
        public IHttpActionResult GetLinks(string category)
        {
            try
            {
                using (AdoDataConnection connection = new AdoDataConnection(SettingsCategory))
                {
                    return Ok(connection.RetrieveData("SELECT * FROM Links WHERE Name LIKE {0} + '%'", category));
                }
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        [Route("MagDurCurves"), HttpGet]
        public IHttpActionResult GetMagDurCurves()
        {
            try
            {
                using (AdoDataConnection connection = new AdoDataConnection("systemSettings"))
                {

                    return Ok(connection.RetrieveData(@"
                    SELECT
	                    MagDurCurve.ID,
	                    MagDurCurve.Name,
	                    MagDurCurve.Visible,
	                    MagDurCurve.Color,
                        MagDurCurve.XHigh,
                        MagDurCurve.XLow,
                        MagDurCurve.YHigh,
                        MagDurcurve.YLow,
	                    MagDurCurvePoint.PerUnitMagnitude,
	                    MagDurCurvePoint.DurationSeconds,
	                    MagDurCurvePoint.LoadOrder
                    FROM
	                    MagDurCurve JOIN
	                    MagDurCurvePoint ON MagDurCurve.ID = MagDurCurvePoint.VoltageCurveID       
                    ORDER BY
	                    MagDurCurve.ID, MagDurCurvePoint.LoadOrder

                "));
                }
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }


        #endregion

    }
}