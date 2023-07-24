//******************************************************************************************************
//  TVAESRIMap.tsx - Gbtc
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
//  02/27/2020 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import React from 'react';
import { SEBrowser } from '../../../../global';

const SIDA: React.FC<SEBrowser.IWidget<unknown>> = (props) => {
    const [sidaInfo, setSIDAInfo] = React.useState < Array<{ ID: number, sidaeventnumber: number, equipmentname: string, Ins: string, kv: string, durationhr: number, durationmin: number, omoffice: string, causedescription: string, subcausedescription:string, eventtype: string, excludedrecord: string, internalexternal:string, eventtime: string}>>([]);
    React.useEffect(() => {
        return GetData();
    }, [props.eventID]);

    function GetData() {
        const handle = $.ajax({
            type: "GET",
            url: `${homePath}api/SIDA/${props.eventID}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        handle.done(data => setSIDAInfo(data));

        return function () {
            if (handle.abort != undefined) handle.abort();
        }
    }

    return (
        <div className="card">
            <div className="card-header">Corresponding SIDA Reports:</div>
            <div className="card-body">
                <table className='table'>
                    <thead>
                        <tr>
                            <th>SIDA #</th>
                            <th>Evt Time</th>
                            <th>Eqp</th>
                            <th>kV</th>
                            <th>Dur (HH:MM)</th>
                            <th>OM Office</th>
                            <th>Cause (SubCause)</th>
                            <th>Type</th>
                            <th>Excluded</th>
                            <th>Int/Ext</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            sidaInfo.map(si => <tr key={si.ID}>
                                <td>{si.sidaeventnumber}</td>
                                <td>{si.eventtime}</td>
                                <td>{si.equipmentname}</td>
                                <td>{si.kv}</td>
                                <td>{`${si.durationhr}:${si.durationmin}`}</td>
                                <td>{si.omoffice}</td>
                                <td>{`${si.causedescription}(${si.subcausedescription})`}</td>
                                <td>{si.eventtype}</td>
                                <td>{si.Ins}</td>
                                <td>{si.internalexternal}</td>
                            </tr>)
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default SIDA;