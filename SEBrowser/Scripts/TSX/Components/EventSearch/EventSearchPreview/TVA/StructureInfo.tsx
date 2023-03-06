//******************************************************************************************************
//  StructureInfo.tsx - Gbtc
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
//  03/20/2020 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import React from 'react';
import { SEBrowser } from '../../../../global';

const StructureInfo: React.FC<SEBrowser.IWidget> = (props) => {
    const [structureInfo, setStructureInfo] = React.useState<Array<{ StrNumber: string, Latitude: number, Longitude: number, Imagepath: string }>>([]);
    const [selectedIndex, setSelectedIndex] = React.useState<number>(-1);

    const getFaultInfo = async (): Promise<Array<{ StationName: string, Inception: number, Latitude: number, Longitude: number, Distance: number, AssetName: string }>> => {
        const res = await $.ajax({
            type: 'GET',
            url: `${homePath}api/OpenXDA/GetFaultInfo/${props.eventID}`,
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            cache: true,
            async: true,
        });
        return res;
    };

    const getNearestStructureInfo = async (station: string, line: string, mileage: number): Promise<Array<{ StrNumber: string, Latitude: number, Longitude: number, Imagepath: string }>> => {
        const res = await $.ajax({
            type: 'GET',
            url: `${homePath}api/ESRIMap/NearestStructure/${station}/${line}?mileage=${mileage}`,
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            cache: true,
            async: true,
        });
        return res;
    };

    React.useEffect(() => {
        const fetchData = async () => {
            const faultInfo = await getFaultInfo();
            const nearestStructure = await getNearestStructureInfo(faultInfo[0].StationName, faultInfo[0].AssetName, faultInfo[0].Distance);
            setStructureInfo(nearestStructure);
            setSelectedIndex(nearestStructure.length > 0 ? 0 : -1);
        };
        fetchData();
    }, []);

    const handleSelectedIndexChanged = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedIndex(parseInt(event.target.value));
    };

    let test = '\\\\Images\\noimage.jpg';

    return (
        <div className="card">
            <div className="card-header">
                Structure Info
                <select style={{ width: 100, position: "absolute", zIndex: 1000, top: 10, right: 10 }} value={selectedIndex} onChange={handleSelectedIndexChanged}>
                    {structureInfo.map((si, index) => <option value={index}>{si.StrNumber}</option>)}
                </select>
            </div>
            <div className="card-body">
                <table className='table'>
                    <thead><tr><th>Number</th><th>Lat</th><th>Lon</th></tr></thead>
                    <tbody>
                        <tr>
                            <td>{selectedIndex === -1 ? '' : structureInfo[selectedIndex]?.StrNumber}</td>
                            <td>{selectedIndex === -1 ? '' : structureInfo[selectedIndex]?.Latitude}</td>
                            <td>{selectedIndex === -1 ? '' : structureInfo[selectedIndex]?.Longitude}</td>
                        </tr>
                    </tbody>
                </table>
                <img src={`${homePath}api/ESRIMap/Image/${selectedIndex === -1 ? btoa(test) : btoa(structureInfo[selectedIndex].Imagepath)}`} style={{ width: '100%' }} />
            </div>
        </div>
    );
};

export default StructureInfo;