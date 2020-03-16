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
    [RoutePrefix("api/Lightning")]
    public class LightningQueryController : ApiController
    {
        const string SettingsCategory = "dbLightning";

        [Route("{eventID:int}"), HttpGet]
        public IHttpActionResult Get(int eventID) {
            try
            {
                using (AdoDataConnection xdaConnection = new AdoDataConnection("dbOpenXDA"))
                using (AdoDataConnection connection = new AdoDataConnection(SettingsCategory))
                {

                    DateTime dateTime = xdaConnection.ExecuteScalar<DateTime>("SELECT StartTime FROM Event WHERE ID = {0}", eventID);

#if DEBUG
                    return Ok(connection.RetrieveData("SELECT * FROM Data",""));
#else
                    string query = @"
                        DECLARE @EndOfPeriodUTC DATETIME2 = DATEADD(HOUR,30, CAST(CAST({0} as DATE) as DATETIME2))
                        DECLARE @BeginningOfPeriodUTC DATETIME2 = DATEADD(DAY,-30, @EndOfPeriodUTC)

                        SELECT *
                        FROM (
                            SELECT CAST(eventtime as Date) as Day , Count(*) as cnt, 'Vaisala - Stroke' as Service
                            FROM TX_Lightning.VAISALAREALTIMEPOINT
                            WHERE eventutctime >= @BeginningOfPeriodUTC and eventtime < @EndOfPeriodUTC
                            GROUP BY CAST(eventtime as Date)
                            UNION
                            SELECT CAST(eventtime as Date) as Day , Count(*) as cnt, 'Vaisala - Flash' as Service
                            FROM (select distinct eventutctime, eventtime from TX_Lightning.VAISALAREALTIMEPOINT) t
                            WHERE eventutctime >= @BeginningOfPeriodUTC and eventtime < @EndOfPeriodUTC
                            GROUP BY CAST(eventtime as Date)
                            UNION
                            SELECT CAST(DATEADD(HOUR, -6, eventutctime)as Date) as Day , Count(*) as cnt, 'Vaisala Reprocess - Stroke' as Service
                            FROM TX_Lightning.VAISALAREPROCESSEDELLIPSE
                            WHERE eventutctime >= @BeginningOfPeriodUTC and eventutctime < @EndOfPeriodUTC
                            GROUP BY CAST(DATEADD(HOUR, -6, eventutctime)as Date)
                            UNION
                            SELECT CAST(DATEADD(HOUR, -6, eventutctime)as Date) as Day , Count(*) as cnt, 'Vaisala Reprocess - Flash' as Service
                            FROM (select distinct eventutctime from TX_Lightning.VAISALAREPROCESSEDELLIPSE)t
                            WHERE eventutctime >= @BeginningOfPeriodUTC and eventutctime < @EndOfPeriodUTC
                            GROUP BY CAST(DATEADD(HOUR, -6, eventutctime)as Date)
                            UNION
                            SELECT CAST(eventtime as Date) as Day , Count(*) as cnt, 'Weatherbug' as Service
                            FROM TX_Lightning.LIGHTNING_WEATHERBUG
                            WHERE eventutctime >= @BeginningOfPeriodUTC and eventtime < @EndOfPeriodUTC
                            GROUP BY CAST(eventtime as Date)
                        ) as tbl
                        PIVOT
                        (
	                        SUM(cnt)
	                        FOR Service IN ([Vaisala - Stroke], [Vaisala - Flash], [Vaisala Reprocess - Stroke], [Vaisala Reprocess - Flash], [Weatherbug])
                        )as pvt
                        Order BY Day
                    ";
                    return Ok(connection.RetrieveData(query, dateTime.ToUniversalTime()));
#endif
                }
            }
            catch (Exception ex) {
                return InternalServerError(ex);
            }
        }

    }
}