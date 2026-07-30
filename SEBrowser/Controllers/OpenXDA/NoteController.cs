//******************************************************************************************************
//  NoteController.cs - Gbtc
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
//  03/26/2020 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

using Gemstone.Data.Model;
using Microsoft.AspNetCore.Mvc;
using openXDA.Model;

namespace SEBrowser.Controllers.OpenXDA;

[RootQueryRestriction("[NoteTypeID] = (SELECT TOP 1 ID FROM NoteType WHERE ReferenceTableName = 'Meter')")]
public class MeterNote : Notes
{
    [ParentKey(typeof(Meter))]
    public new int ReferenceTableID { get; set; }
}

[RootQueryRestriction("[NoteTypeID] = (SELECT TOP 1 ID FROM NoteType WHERE ReferenceTableName = 'Asset')")]
public class AssetNote : Notes
{
    [ParentKey(typeof(Asset))]
    public new int ReferenceTableID { get; set; }
}

[RootQueryRestriction("[NoteTypeID] = (SELECT TOP 1 ID FROM NoteType WHERE ReferenceTableName = 'Location')")]
public class LocationNote : Notes
{
    [ParentKey(typeof(Location))]
    public new int ReferenceTableID { get; set; }
}

[RootQueryRestriction("[NoteTypeID] = (SELECT TOP 1 ID FROM NoteType WHERE ReferenceTableName = 'Event')")]
public class EventNote : Notes
{
    [ParentKey(typeof(Event))]
    public new int ReferenceTableID { get; set; }
}

[Route("api/OpenXDA/Note/Meter")]
public class OpenXDAMeterNoteController : NotesController<MeterNote> { }

[Route("api/OpenXDA/Note/Asset")]
public class OpenXDAAssetNoteController : NotesController<AssetNote> { }

[Route("api/OpenXDA/Note/Location")]
public class OpenXDALocationNoteController : NotesController<LocationNote> { }

[Route("api/OpenXDA/Note/Event")]
public class OpenXDAEventNoteController : NotesController<EventNote> { }
