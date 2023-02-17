//******************************************************************************************************
//  Program.cs - Gbtc
//
//  Copyright © 2023, Grid Protection Alliance.  All Rights Reserved.
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
//  02/16/2023 - J.Ritchie Carroll
//       Generated original version of source code.
//
//******************************************************************************************************

using System;
using GSF.Security.Cryptography;
using GSF.IO;
using System.IO;
using System.Xml;

// ReSharper disable PossibleNullReferenceException
namespace UpdateDebugConfig
{
    internal class Program
    {
        private const CipherStrength CryptoStrength = CipherStrength.Aes256;
        private const string DefaultCipherKeyName = "0679d9ae-aca5-4702-a3f5-604415096987";
        private const string AzureADSecretKeyName = "AzureADSecret";
        private const string AzureADSecretDescription = "Defines the Azure AD secret value to be used for user info and group lookups, post authentication.";

        private static void Main(string[] args)
        {
            if (args.Length < 2)
            {
                Console.WriteLine($"Usage: {nameof(UpdateDebugConfig)} <EnvUserVarName> <ConfigFilePath>");
                return;
            }

            string envUserVarName = args[0];
            string azureADSecret = Environment.GetEnvironmentVariable(envUserVarName, EnvironmentVariableTarget.User);

            if (string.IsNullOrEmpty(azureADSecret))
                throw new InvalidOperationException($"Environment variable \"{envUserVarName}\" is not defined.");

            string configFilePath = FilePath.GetAbsolutePath(args[1]);

            if (!File.Exists(configFilePath))
                throw new FileNotFoundException($"Application configuration file name \"{configFilePath}\" not found.");

            Console.WriteLine($"Updating encrypted AzureAD Secret Key for \"{envUserVarName}\" in \"{configFilePath}\"...");

            XmlDocument configFile = new XmlDocument();
            configFile.Load(configFilePath);

            XmlNode securityProviderGroup = configFile.SelectSingleNode("configuration/categorizedSettings/securityProvider");

            if (securityProviderGroup == null)
                throw new InvalidOperationException($"Security provider group not found in \"{configFilePath}\".");

            XmlNode azureADSecretNode = securityProviderGroup.SelectSingleNode($"add[@name='{AzureADSecretKeyName}']");

            if (azureADSecretNode == null)
            {
                azureADSecretNode = configFile.CreateElement("add");
                azureADSecretNode.Attributes.Append(configFile.CreateAttribute("name"));
                azureADSecretNode.Attributes.Append(configFile.CreateAttribute("value"));
                azureADSecretNode.Attributes.Append(configFile.CreateAttribute("description"));
                azureADSecretNode.Attributes.Append(configFile.CreateAttribute("encrypted"));
                securityProviderGroup.AppendChild(azureADSecretNode);

                azureADSecretNode.Attributes["name"].Value = AzureADSecretKeyName;
                azureADSecretNode.Attributes["description"].Value = AzureADSecretDescription;
            }

            azureADSecretNode.Attributes["value"].Value = azureADSecret.Encrypt(DefaultCipherKeyName, CryptoStrength);
            azureADSecretNode.Attributes["encrypted"].Value = "true";
            
            configFile.Save(configFilePath);
        }
    }
}
