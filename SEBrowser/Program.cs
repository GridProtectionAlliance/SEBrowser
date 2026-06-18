//******************************************************************************************************
//  Program.cs - Gbtc
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
//  01/23/2026 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

using Gemstone.Configuration;
using Gemstone.Data;
using Gemstone.Diagnostics;
using Gemstone.Security.AuthenticationProviders;
using Gemstone.Threading;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Debug;
using System;
using System.Collections.Generic;
#if RELEASE
using Microsoft.Extensions.Logging.EventLog;
#endif

namespace SEBrowser;

public class Program
{
    public const string DefaultWebHostingCategory = "WebHosting";
    public const string SecurityProviderCategory = "SecurityProvider";

    public static void Main(string[] args)
    {
        try
        {
            ShutdownHandler.Initialize();

            Settings settings = new()
            {
                INIFile = ConfigurationOperation.ReadWrite,
                SQLite = ConfigurationOperation.Disabled
            };

            DefineSettings(settings);

            // Bind settings to configuration sources
            settings.Bind(new ConfigurationBuilder()
                .ConfigureGemstoneDefaults(settings)
                .AddCommandLine(args, settings.SwitchMappings));

            ApplyDatabaseSettings(settings);

            HostApplicationBuilderSettings appSettings = new()
            {
                Args = args,
                ApplicationName = nameof(SEBrowser),
                DisableDefaults = true,
            };

            CreateHostBuilder(args).Build().Run();

#if DEBUG
            Settings.Save(forceSave: true);
#else
            Settings.Save();
#endif
        }
        finally
        {
            ShutdownHandler.InitiateSafeShutdown();
        }
    }

    /// <summary>
    /// Establishes default settings for the config file.
    /// </summary>
    public static void DefineSettings(Settings settings)
    {
        using (Logger.SuppressFirstChanceExceptionLogMessages())
        {
            DiagnosticsLogger.DefineSettings(settings);
            AdoDataConnection.DefineSettings(settings);
            OAuthAuthenticationProvider.DefineSettings(settings);
            WindowsAuthenticationProvider.DefineSettings(settings);
            DefineWebHotSettings(settings);
            DefineSecurityProviderSettings(settings);
            DefineAdditionalSystemSettings(settings);
        }
    }

    public static IHostBuilder CreateHostBuilder(string[] args) =>
        Host.CreateDefaultBuilder(args)
            .ConfigureWebHostDefaults(webBuilder =>
            {
                webBuilder.UseStartup<Startup>();
            })
            .ConfigureServices((hostContext, services) =>
            {
                services.Configure<Model.System.Settings>(hostContext.Configuration.GetSection(Settings.SystemSettingsCategory));
            })
            .ConfigureLogging(builder =>
            {
                builder.ClearProviders();
                builder.SetMinimumLevel(LogLevel.Information);

                builder.AddFilter("Microsoft", LogLevel.Warning);
                builder.AddFilter("Microsoft.Hosting.Lifetime", LogLevel.Error);
                builder.AddFilter<DebugLoggerProvider>("", LogLevel.Debug);
                builder.AddFilter<DiagnosticsLoggerProvider>("", LogLevel.Trace);

                builder.AddConsole(options => options.LogToStandardErrorThreshold = LogLevel.Error);
                builder.AddDebug();

                // Add Gemstone diagnostics logging
                builder.AddGemstoneDiagnostics();

#if RELEASE
                if (System.OperatingSystem.IsWindows())
                {
                    builder.AddFilter<EventLogLoggerProvider>("Application", LogLevel.Warning);
                    builder.AddEventLog();
                }
#endif
            });

    private static void DefineWebHotSettings(Settings settings)
    {
        dynamic section = settings[DefaultWebHostingCategory];

        section.AuthenticationTicketTimeout = (24.0D, "Expiration of the authentication ticket relative to its creation time, in hours");
        section.AuthenticationSessionTimeout = (15.0D, "Expiration of the user's session relative to the last time it was accessed, in minutes");
    }

    private static void DefineAdditionalSystemSettings(Settings settings, string settingsCatergory = Settings.SystemSettingsCategory)
    {
        dynamic section = settings[settingsCatergory];

        section.NodeID = ("00000000-0000-0000-0000-000000000000", "The applications instance identifier");
        section.CompanyName = ("Grid Protection Alliance", "The name of the company that owns this instance of SEBrowser");
        section.CompanyAcronym = ("GPA", "The acronym representing the company that owns this instance of SEBrowser");
        section.ApplicationName = ("SEBrowser", "The application name");
        section.ApplicationDescription = ("System Event Browser", "The application description");
        section.ApplicationKeywords = ("open source, utility, browser, power quality, management", "The application keywords");
        section.BootstrapTheme = ("~/Content/bootstrap-theme.css", "The application bootstrap theme");
        section.DateFormat = ("MM/dd/yyyy", "The default date format to use when rendering timestamps");
        section.TimeFormat = ("HH:mm.ss.fff", "The default time format to use when rendering timestamps");
        section.DefaultSecurityRoles = ("Administrator, Manager, Engineer", "The default security roles that should exist for the application");

        dynamic oauthSection = settings[OAuthAuthenticationProvider.SettingsSection];
        oauthSection.UserIdClaim = ("http://schemas.microsoft.com/identity/claims/objectidentifier", "Defines the claim used to identify the user.");
    }

    private static void ApplyDatabaseSettings(Settings settings)
    {
        try
        {
            using AdoDataConnection connection = new(settings);
            Dictionary<string, string> appSettings = connection.LoadDatabaseSettings("app.setting");
            SettingsSection systemSettings = settings[Settings.SystemSettingsCategory];

            ApplyDatabaseSetting(systemSettings, appSettings, "applicationName", "ApplicationName");
            ApplyDatabaseSetting(systemSettings, appSettings, "applicationDescription", "ApplicationDescription");
            ApplyDatabaseSetting(systemSettings, appSettings, "applicationKeywords", "ApplicationKeywords");
            ApplyDatabaseSetting(systemSettings, appSettings, "bootstrapTheme", "BootstrapTheme");
        }
        catch (Exception ex)
        {
            Logger.SwallowException(ex, "Failed to load database application settings.");
        }
    }

    private static void ApplyDatabaseSetting(SettingsSection settings, Dictionary<string, string> databaseSettings, string databaseKey, string settingKey)
    {
        if (databaseSettings.TryGetValue(databaseKey, out string value) && !string.IsNullOrWhiteSpace(value))
            settings[settingKey] = value;
    }

    private static void DefineSecurityProviderSettings(Settings settings)
    {
        dynamic section = settings[SecurityProviderCategory];

        section.PasswordRequirementsRegex = (@"^.*(?=.{8,})(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*$", "Regular expression used to validate new passwords for database users");
        section.PasswordRequirementsError = ("Invalid Password: Password must be at least 8 characters; must contain at least 1 number, 1 upper case letter, and 1 lower case letter", "Error message to display when a new database user password fails validation");
    }
}
