//******************************************************************************************************
//  LSC.tsx - Gbtc
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
//  03/24/2020 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import React from 'react';
import { SEBrowser } from '../../../../global';
import Table from '@gpa-gemstone/react-table';

interface ILSC {
    Facility: string,
    Area: string,
    SectionTitle: string,
    ComponentModel: string,
    ManufacturerName: string,
    SeriesName: string,
    ComponentTypeName: string,
    Magnitude: number,
    Duration: number,
    EventID: number
}

const LSC: React.FC<SEBrowser.IWidget<any>> = (props) => {
    const [lscInfo, setLSCInfo] = React.useState<ILSC[]>([]);
    React.useEffect(() => {
        return GetData();
    }, [props.eventID, ]);

    function GetData() {
        const handle = $.ajax({
            type: "GET",
            url: `${homePath}api/LSC/${props.eventID}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        handle.done(data => {
            setLSCInfo(data);
        });

        return function () {
            if (handle.abort != undefined) handle.abort();
        }
    }

    return (
        <div className="card">
            <div className="card-header">Impacted LSCs:</div>
            <div className="card-body">
                <div style={{maxHeight: 200, overflowY:'auto'}}>
                    <table className='table'>
                        <thead>
                            <tr>
                                <th>Facility</th>
                                <th>Area</th>
                                <th>Section</th>
                                <th>Component</th>
                                <th>Magnitude</th>
                                <th>Duration</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lscInfo.map((si, index) => <tr key={index}>
                                <td><a target="_blank" href={openSEEInstance + '?eventid=' + si.EventID}>{si.Facility}</a></td>
                                <td>{si.Area}</td>
                                <td>{si.SectionTitle}</td>
                                <td>{si.ComponentModel}</td>
                                <td>{si.Magnitude}</td>
                                <td>{si.Duration}</td>

                            </tr>) }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default LSC;