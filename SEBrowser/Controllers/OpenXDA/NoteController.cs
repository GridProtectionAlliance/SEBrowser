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

using GSF.Data;
using GSF.Data.Model;
using GSF.Identity;
using openXDA.Model;
using System;
using System.Collections.Generic;
using System.Data;
using System.Net;
using System.Web.Http;

namespace SEBrowser.Controllers.OpenXDA
{
    [RoutePrefix("api/OpenXDA/Note")]
    public class OpenXDANoteController : ApiController
    {
        const string SettingsCategory = "systemSettings";

        [Route("{eventID:int}"), HttpGet]
        public DataTable Get(int eventID)
        {
            using (AdoDataConnection connection = new AdoDataConnection(SettingsCategory))
            {
                const string SQL = "SELECT * FROM EventNote WHERE EventID = {0}";

                DataTable dataTable = connection.RetrieveData(SQL, eventID);
                return dataTable;
            }


        }

        public class FormData
        {
            public int? ID { get; set; }
            public int EventID { get; set; }
            public string Note { get; set; }
        }

        public class FormDataMultiNote
        {
            public int? ID { get; set; }
            public int[] EventIDs { get; set; }
            public string Note { get; set; }
            public string UserAccount { get; set; }
            public DateTime Timestamp { get; set; }
        }


        [Route(""), HttpPost]
        public IHttpActionResult Post(FormData note)
        {
            IHttpActionResult result = ValidateAdminRequest();
            if (result != null) return result;

            try
            {
                using (AdoDataConnection connection = new AdoDataConnection(SettingsCategory))
                {
                    EventNote record = new EventNote()
                    {
                        EventID = note.EventID,
                        Note = note.Note,
                        UserAccount = User.Identity.Name,
                        Timestamp = DateTime.Now
                    };

                    new TableOperations<EventNote>(connection).AddNewRecord(record);

                    result = Ok(record);

                }
            }
            catch (Exception ex)
            {
                result = InternalServerError(ex);
            }

            return result;
        }

        [Route("Multi"), HttpPost]
        public IHttpActionResult Post(FormDataMultiNote note)
        {
            IHttpActionResult result = ValidateAdminRequest();
            if (result != null) return result;

            try
            {
                using (AdoDataConnection connection = new AdoDataConnection(SettingsCategory))
                {
                    DateTime now = DateTime.Now;
                    List<EventNote> records = new List<EventNote>();
                    foreach (int eventId in note.EventIDs)
                    {
                        EventNote record = new EventNote()
                        {
                            EventID = eventId,
                            Note = note.Note,
                            UserAccount = User.Identity.Name,
                            Timestamp = now
                        };

                        new TableOperations<EventNote>(connection).AddNewRecord(record);
                        records.Add(record);
                    }

                    result = Ok(records);

                }
            }
            catch (Exception ex)
            {
                result = InternalServerError(ex);
            }

            return result;
        }


        [Route(""), HttpDelete]
        public IHttpActionResult Delete(FormData note)
        {
            try
            {
                IHttpActionResult result = ValidateAdminRequest();

                if (result != null) return result;

                using (AdoDataConnection connection = new AdoDataConnection(SettingsCategory))
                {
                    EventNote record = new TableOperations<EventNote>(connection).QueryRecordWhere("ID = {0}", note.ID);
                    new TableOperations<EventNote>(connection).DeleteRecord(record);
                    result = Ok(record);

                }
                return result;

            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }


        }

        [Route("Multi"), HttpDelete]
        public IHttpActionResult Delete(FormDataMultiNote note)
        {
            try
            {
                IHttpActionResult result = ValidateAdminRequest();

                if (result != null) return result;

                using (AdoDataConnection connection = new AdoDataConnection(SettingsCategory))
                {
                    connection.ExecuteNonQuery(@"
                        DELETE FROM EventNote WHERE Note = {0} AND UserAccount = {1} AND Timestamp = {2}
                    ", note.Note, note.UserAccount, note.Timestamp);

                }
                return Ok();

            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }


        }


        [Route(""), HttpPatch]
        public IHttpActionResult Patch(FormData note)
        {
            IHttpActionResult result = ValidateAdminRequest();
            if (result != null) return result;
            try
            {
                using (AdoDataConnection connection = new AdoDataConnection(SettingsCategory))
                {
                    EventNote record = new TableOperations<EventNote>(connection).QueryRecordWhere("ID = {0}", note.ID);

                    record.Note = note.Note;
                    record.UserAccount = User.Identity.Name;
                    record.Timestamp = DateTime.Now;


                    new TableOperations<EventNote>(connection).UpdateRecord(record);

                    result = Ok(record);

                }
            }
            catch (Exception ex)
            {
                result = InternalServerError(ex);
            }

            return result;
        }

        private IHttpActionResult ValidateAdminRequest()
        {
            string username = User.Identity.Name;
            string userid = UserInfo.UserNameToSID(username);

            using (AdoDataConnection connection = new AdoDataConnection(SettingsCategory))
            {
                bool isAdmin = connection.ExecuteScalar<int>(@"
					select 
						COUNT(*) 
					from 
						UserAccount JOIN 
						ApplicationRoleUserAccount ON ApplicationRoleUserAccount.UserAccountID = UserAccount.ID JOIN
						ApplicationRole ON ApplicationRoleUserAccount.ApplicationRoleID = ApplicationRole.ID
					WHERE 
						ApplicationRole.Name = 'Administrator' AND UserAccount.Name = {0}
                ", userid) > 0;

                if (isAdmin) return null;
                else return StatusCode(HttpStatusCode.Forbidden);
            }
        }


    }
}