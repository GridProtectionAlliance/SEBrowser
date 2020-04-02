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

const FaultInfo = (props: { EventID: number }) => {
    const [hidden, setHidden] = React.useState<boolean>(true);
    const [faultInfo, setFaultInfo] = React.useState<{ FaultTime?: string, FaultDuration?: number, FaultType?: string, FaultDistance?: number, StationID?: string, StationName?: string, LineName?: string, LineAssetKey?: string, DblDist?: number, TreeFaultResistance?: number}>({});
    const [links, setLinks] = React.useState<Array<{ID: number, Name:string, Display: string, Value: string}>>([])
    React.useEffect(() => {
        return GetData();
    }, [props.EventID]);

    function GetData() {
        let handle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenXDA/FaultInfo/${props.EventID}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        let handle2 = $.ajax({
            type: "GET",
            url: `${homePath}api/SEBrowser/GetLinks/FaultInfo`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        handle.done(data => {
            if (data.length > 0) {
                setHidden(false);
            }
            setFaultInfo(data[0]);
        });

        handle2.done(data => setLinks(data));

        return function () {
            if (handle.abort != undefined) handle.abort();
            if (handle2.abort != undefined) handle2.abort();

        }
    }

    function TreeProbability(value: number): string {
        if (value == null) return 'Undetermined';
        else if (value > 20) return `High (Rf=${value.toFixed(2)})`;
        else if (value > 10) return `Medium (Rf=${value.toFixed(2)})`;
        else return `Low (Rf=${value.toFixed(2)})`;
    }
    return (
        <div className="card" hidden={hidden}>
            <div className="card-header">Fault Information:</div>
            <div className="card-body">
                <table className='table'>
                    <tbody>
                        <tr><td>Fault Inception Time: </td><td>{moment(faultInfo.FaultTime).format('YYYY-MM-DD HH:mm:ss.SSS')} (Central Time)</td></tr>
                        <tr><td>Fault Duration: </td><td>{faultInfo.FaultDuration} cycles / {(faultInfo.FaultDuration == undefined ? '': (faultInfo.FaultDuration * 16.6).toFixed(2))} ms</td></tr>
                        <tr><td>Fault Type: </td><td>{faultInfo.FaultType}</td></tr>
                        <tr><td>Location: </td><td>{faultInfo.FaultDistance}  miles from {faultInfo.StationName}({faultInfo.StationID}) on {faultInfo.LineName}({faultInfo.LineAssetKey})</td></tr>
                        <tr hidden={faultInfo.DblDist == undefined}><td>Double Ended Location: </td><td>{faultInfo.DblDist}  miles from {faultInfo.StationName}</td></tr>
                        <tr><td>Tree Probability: </td><td>{TreeProbability(faultInfo.TreeFaultResistance)}</td></tr>
                        <tr><td>View:</td><td>{links.map(a => {
                            if (a.Name == 'FaultInfo.Miles')
                                return <a style={{ paddingRight: 5 }} key={a.Name} href={a.Value + `?Station=${faultInfo.StationID}&Line=${faultInfo.LineAssetKey}&Mileage=${faultInfo.FaultDistance}`} target='_blank'>{a.Display}</a>
                            else
                                return <a style={{ paddingRight: 5 }} key={a.Name} href={a.Value} target='_blank'>{a.Display}</a>
                        })}</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default FaultInfo;