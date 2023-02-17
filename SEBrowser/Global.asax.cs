//******************************************************************************************************
//  Global.asax.cs - Gbtc
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
//  02/19/2020 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

using GSF;
using GSF.Configuration;
using GSF.Security;
using GSF.Web.Embedded;
using GSF.Web.Model;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Json;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using System.IO;
using SEBrowser.Model;

namespace SEBrowser
{
    public class MvcApplication : HttpApplication
    {
        /// <summary>
        /// Gets the default model used for the application.
        /// </summary>
        public static readonly AppModel DefaultModel = new();

        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);

            // Add additional virtual path provider to allow access to embedded resources
            EmbeddedResourceProvider.Register();

            GlobalSettings global = DefaultModel.Global;

            // Make sure LSCVSReport specific default config file service settings exist
            CategorizedSettingsElementCollection systemSettings = ConfigurationFile.Current.Settings["systemSettings"];
            CategorizedSettingsElementCollection securityProvider = ConfigurationFile.Current.Settings["securityProvider"];

            systemSettings.Add("ConnectionString", "Data Source=localhost; Initial Catalog=SEBrowser; Integrated Security=SSPI", "Configuration connection string.");
            systemSettings.Add("DataProviderString", "AssemblyName={System.Data, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089}; ConnectionType=System.Data.SqlClient.SqlConnection; AdapterType=System.Data.SqlClient.SqlDataAdapter", "Configuration database ADO.NET data provider assembly type creation string used");
            systemSettings.Add("CompanyName", "Grid Protection Alliance", "The name of the company who owns this instance of the openMIC.");
            systemSettings.Add("CompanyAcronym", "GPA", "The acronym representing the company who owns this instance of the openMIC.");
            systemSettings.Add("DateFormat", "MM/dd/yyyy", "The default date format to use when rendering timestamps.");
            systemSettings.Add("TimeFormat", "HH:mm.ss.fff", "The default time format to use when rendering timestamps.");
            systemSettings.Add("DefaultSecurityRoles", "Administrator, Manager, Engineer", "The default security roles that should exist for the application.");
            securityProvider.Add("PasswordRequirementsRegex", AdoSecurityProvider.DefaultPasswordRequirementsRegex, "Regular expression used to validate new passwords for database users.");
            securityProvider.Add("PasswordRequirementsError", AdoSecurityProvider.DefaultPasswordRequirementsError, "Error message to be displayed when new database user password fails regular expression test.");

            // Load default configuration file based model settings
            global.CompanyName = systemSettings["CompanyName"].Value;
            global.CompanyAcronym = systemSettings["CompanyAcronym"].Value;
            global.DateFormat = systemSettings["DateFormat"].Value;
            global.TimeFormat = systemSettings["TimeFormat"].Value;
            global.DateTimeFormat = $"{global.DateFormat} {global.TimeFormat}";
            global.PasswordRequirementsRegex = securityProvider["PasswordRequirementsRegex"].Value;
            global.PasswordRequirementsError = securityProvider["PasswordRequirementsError"].Value;

            // Load database driven model settings
            using (DataContext dataContext = new(exceptionHandler: LogException))
            {
                //EncryptScores(dataContext);
                Dictionary<string, string> appSetting;

                try
                {
                    // Load global web settings
                    appSetting = dataContext.LoadDatabaseSettings("app.setting");
                    global.ApplicationName = appSetting["applicationName"];
                    global.ApplicationDescription = appSetting["applicationDescription"];
                    global.ApplicationKeywords = appSetting["applicationKeywords"];
                    global.BootstrapTheme = appSetting["bootstrapTheme"];
                }
                catch (Exception ex)
                {
                    throw new InvalidOperationException($"Failed to load database connection, check ADO connection string in config file: {ex.Message}", ex);
                }

                // Cache application settings
                foreach (KeyValuePair<string, string> item in appSetting)
                    global.ApplicationSettings.Add(item.Key, item.Value);
            }

            // Modify the JSON serializer to serialize dates as UTC -
            // otherwise, timezone will not be appended to date strings
            // and browsers will select whatever timezone suits them
            JsonSerializerSettings settings = JsonUtility.CreateDefaultSerializerSettings();
            settings.DateTimeZoneHandling = DateTimeZoneHandling.Utc;
            JsonSerializer serializer = JsonSerializer.Create(settings);
            GlobalHost.DependencyResolver.Register(typeof(JsonSerializer), () => serializer);
        }

        private void Page_Error(object sender, EventArgs e)
        {
            Exception exc = Server.GetLastError();
            WriteToErrorLog(exc);

            // Clear the error from the server.
            Server.ClearError();
        }

        void Application_Error(object sender, EventArgs e)
        {
            Exception exc = Server.GetLastError();
            WriteToErrorLog(exc);
        }

        /// <summary>
        /// Logs a status message.
        /// </summary>
        /// <param name="message">Message to log.</param>
        /// <param name="type">Type of message to log.</param>
        public static void LogStatusMessage(string message, UpdateType type = UpdateType.Information)
        {
            // TODO: Write message to log with log4net, etc.
        }

        /// <summary>
        /// Logs an exception.
        /// </summary>
        /// <param name="ex">Exception to log.</param>
        public static void LogException(Exception ex)
        {
            // TODO: Write exception to log with log4net, etc.
#if DEBUG
            ThreadPool.QueueUserWorkItem(state =>
            {
                Thread.Sleep(1500);
            });
#endif
            WriteToErrorLog(ex);
        }


        private static readonly ReaderWriterLockSlim LogFileReadWriteLock = new();

        public static void WriteToErrorLog(Exception ex, bool innerException = false)
        {
            if (ex.InnerException is not null)
                WriteToErrorLog(ex.InnerException, true);

            string path = Path.Combine("C:\\Users\\Public\\Documents", "SEBrowser.ErrorLog.txt");
            
            // Set Status to Locked
            LogFileReadWriteLock.EnterWriteLock();

            try
            {
                // Append text to the file
                using StreamWriter sw = File.AppendText(path);

                sw.WriteLine($"[{DateTime.Now}] ({(innerException ? "Inner Exception" : "Outer Excpetion")})");
                sw.WriteLine($"Exception Source:    {ex.Source}");
                sw.WriteLine($"Exception Message:    {ex.Message}");
                sw.WriteLine();
                sw.WriteLine("---- Stack Trace ----");
                sw.WriteLine();
                sw.WriteLine(ex.StackTrace);
                sw.WriteLine();
                sw.WriteLine();

                sw.Close();
            }
            finally
            {
                // Release lock
                LogFileReadWriteLock.ExitWriteLock();
            }
        }
    }
}
