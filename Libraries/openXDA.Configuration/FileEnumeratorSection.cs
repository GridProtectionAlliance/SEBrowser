//******************************************************************************************************
//  FileEnumeratorSection.cs - Gbtc
//
//  Copyright © 2021, Grid Protection Alliance.  All Rights Reserved.
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
//  01/16/2021 - Stephen C. Wills
//       Generated original version of source code.
//
//******************************************************************************************************

using System.ComponentModel;
using System.Configuration;
using Gemstone.IO;

namespace openXDA.Configuration
{
    //copied from GSF.IO as there was no equivalent in Gemstone.IO
    public enum FileEnumerationStrategy
    {
        //
        // Summary:
        //     Enumerate all files sequentially.
        Sequential,
        //
        // Summary:
        //     Enumerates the watch directories in parallel, but subdirectories are processed
        //     sequentially.
        ParallelWatchDirectories,
        //
        // Summary:
        //     Enumerates every directory, including subdirectories, in parallel.
        ParallelSubdirectories,
        //
        // Summary:
        //     Does not enumerate directories, relying only on the file watcher to handle file
        //     processing events.
        None
    }

    public class FileEnumeratorSection
    {
        public const string CategoryName = "FileEnumerator";

        /// <summary>
        /// Gets or sets the patterns used to determine which
        /// folders to skip when enumerating watch directories.
        /// </summary>
        [Setting]
        [DefaultValue("")]
        public string FolderExclusion { get; set; }

        /// <summary>
        /// Gets or sets the flag that determines whether the file watcher
        /// should raise events for enumerated files in alphabetical order.
        /// </summary>
        [Setting]
        [DefaultValue(false)]
        public bool OrderedEnumeration { get; set; }

        /// <summary>
        /// Gets or sets the strategy used for enumeration of files in the file watcher.
        /// </summary>
        [Setting]
        [DefaultValue(FileEnumerationStrategy.ParallelSubdirectories)]
        public FileEnumerationStrategy Strategy { get; set; }
    }
}
