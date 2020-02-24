//******************************************************************************************************
//  EventSearchFileInfo.tsx - Gbtc
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
//  02/21/2020 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import React from 'react';

function EventSearchFileInfo(props: { EventID: number }) {
    const [fileName, setFileName] = React.useState<string>('');
    const [mappedChannels, setMappedChannels] = React.useState<Array<{ Channel: string, Mapping: string }>>([]);
    const [meterKey, setMeterKey] = React.useState<string>('');
    const [meterConfigurationID, setMeterConfigurationID] = React.useState<number>(0);

    React.useEffect(() => {
        return GetData();
    }, [props.EventID]);

    function GetData() {
        let handle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenXDA/GetFileName/${props.EventID}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        })

       handle.done(data => setFileName(data));

        let handle2 = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenXDA/GetMappedChannels/${props.EventID}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        })

        handle2.done(data => setMappedChannels(data));

        let handle3 = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenXDA/GetMeterConfiguration/${props.EventID}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        })

        handle3.done(data => {
            setMeterKey(data[0])
            setMeterConfigurationID(data[1]);
        });


        return function () {
            if (handle.abort != undefined) handle.abort();
            if (handle2.abort != undefined) handle2.abort();
            if (handle3.abort != undefined) handle3.abort();

        }
    }

    return (
        <div className="card">
            <div className="card-header">File Info:</div>

            <div className="card-body">
                <table className="table"><thead><tr><td style={{ borderBottom: '2px solid #dee2e6' }}><a href={scInstance + `?name=ConfigurationHistory&MeterKey=${meterKey}&MeterConfigurationID=${meterConfigurationID}`}>Meter Configuration Via System Center</a></td></tr></thead></table>

                <table className="table"><thead><tr><th>File:</th><td style={{borderBottom: '2px solid #dee2e6'}}>{fileName}</td></tr></thead></table>
                <h6>Mapped Channels</h6>
                <table className="table">
                    <thead><tr><th>Channel</th><th>Mapping</th></tr></thead>
                    <tbody>{mappedChannels.map((mc, index) => <tr key={index}><td>{mc.Channel}</td><td>{mc.Mapping}</td></tr>)}</tbody>
                </table>

            </div>
        </div>
    );
}

export default EventSearchFileInfo;

