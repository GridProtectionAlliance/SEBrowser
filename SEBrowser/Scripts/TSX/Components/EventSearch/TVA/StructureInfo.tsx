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

export default class StructureInfo extends React.Component<{ EventID: number }, { Index: number,StructureInfo: Array<{StrNumber: string, Latitude: string, Longitude: string, Imagepath: string, Drawing: string}> }, {}>{
    constructor(props, context) {
        super(props, context);

        this.state = {
            StructureInfo: [],
            Index: -1
        };


    }

    GetFaultInfo(): JQuery.jqXHR<Array<{ StationName: string, Inception: number, Latitude: number, Longitude: number, Distance: number, AssetName: string}>>{
        return $.ajax({
            type: "GET",
            url: `${homePath}api/OpenXDA/GetFaultInfo/${this.props.EventID}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });
    }

    GetNearestStructureInfo(station: string, line: string, mileage: number) {
        return $.ajax({
            type: "GET",
            url: `${homePath}api/ESRIMap/NearestStructure/${station}/${line}?mileage=${mileage}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

    }

    async componentDidMount() {
        const faultInfo = await this.GetFaultInfo();
        const nearestStructure = await this.GetNearestStructureInfo(faultInfo[0].StationName, faultInfo[0].AssetName, faultInfo[0].Distance);
        this.setState({ StructureInfo: nearestStructure, Index: (nearestStructure.length > 0? 0: null) });
    }


    render() {
        let test = '\\\\Images\\noimage.jpg';
        return (
            <div className="card">
                <div className="card-header">
                    Structure Info
                    <select style={{ width: 100, position: "absolute", zIndex: 1000, top: 10, right: 10 }} value={this.state.Index} onChange={(evt) => this.setState({ Index: parseInt(evt.target.value) }, () => this.componentDidMount())}>
                        {this.state.StructureInfo.map((si, index) => <option value={index}>{si.StrNumber}</option>)}
                    </select>

                </div>
                <div className="card-body">
                    <table className='table'>
                        <thead><tr><th>Number</th><th>Lat</th><th>Lon</th></tr></thead>
                        <tbody>
                            <tr>
                                <td>{this.state.StructureInfo[this.state.Index] == undefined ? '' : this.state.StructureInfo[this.state.Index].StrNumber}</td>
                                <td>{this.state.StructureInfo[this.state.Index] == undefined ? '' : this.state.StructureInfo[this.state.Index].Latitude}</td>
                                <td>{this.state.StructureInfo[this.state.Index] == undefined ? '' : this.state.StructureInfo[this.state.Index].Longitude}</td>
                            </tr>
                        </tbody>

                    </table>
                    <img src={`${homePath}api/ESRIMap/Image/${this.state.StructureInfo[this.state.Index] == undefined ? btoa(test) : btoa(this.state.StructureInfo[this.state.Index].Imagepath)}`} style={{ width: '100%' }} />
                </div>
            </div>
        );
    }

}