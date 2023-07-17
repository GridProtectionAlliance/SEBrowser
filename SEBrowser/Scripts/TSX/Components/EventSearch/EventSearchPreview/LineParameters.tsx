//******************************************************************************************************
//  LineParameters.tsx - Gbtc
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
//  03/18/2020 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import React from 'react';
import { SEBrowser } from '../../../global';
import Table from '@gpa-gemstone/react-table';

interface ILineParameters {
    ID?: number,
    Length?: number,
    X0?: number,
    X1?: number,
    R1?: number,
    R0?: number
}

interface ILoopImpedance {
    Length: number,
    ZS: string,
    Ang: string,
    RS: string,
    XS: string,
    PerMileZS: string,
    PerMileRS: string,
    PerMileXS: string
}

const LineParameters: React.FC<SEBrowser.IWidget<any>> = (props) => {
    const [hidden, setHidden] = React.useState<boolean>(true);
    const [lineParameters, setLineParameters] = React.useState<{ ID?: number, Length?: number,X0?: number, X1?: number, R1?: number, R0?: number}>(null);
    React.useEffect(() => {
        return GetData();
    }, [props.eventID]);

    function GetData() {
        let handle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenXDA/LineParameters/${props.eventID}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        handle.done(data => {
            if (data.length > 0) {
                setHidden(false);
            }
            setLineParameters(data[0]);
        });


        return function () {
            if (handle.abort != undefined) handle.abort();
        }
    }

    function LoopImp() {
        let rs = (lineParameters.R1 * 2 + lineParameters.R0) / 3;
        let rsm = rs / lineParameters.Length;
        let xs = (lineParameters.X1 * 2 + lineParameters.X0) / 3;
        let xsm = xs / lineParameters.Length;
        let zs = Math.sqrt(rs ^ 2 + xs ^ 2);
        let zsm = zs / lineParameters.Length;
        let angS = Math.atan(xs / rs) * 180 / Math.PI;
        return (<tbody>
            <tr><td>{lineParameters.Length}</td><td>{zs.toFixed(3)}</td><td>{angS.toFixed(3)}</td><td>{rs.toFixed(4)}</td><td>{xs.toFixed(4)}</td></tr>
            <tr><td>Per Mile</td><td>{zsm.toFixed(3)}</td><td>-</td><td>{rsm.toFixed(4)}</td><td>{xsm.toFixed(4)}</td></tr>

        </tbody>)

    }
    if (lineParameters == null) return null;
    return (
        <div className="card" hidden={hidden}>
            <div className="card-header">Line Parameters:
                <a className="pull-right" target="_blank" href={`${scInstance}?name=Asset&AssetID=${lineParameters.ID}`}>Line Configuration Via System Center</a>
            </div>
            <div className="card-body">
                <table className='table'>
                    <thead>
                        <tr><th style={{textAlign: 'center'}}colSpan={5}>Pos-Seq Imp (LLL,LLLG,LL,LLG)</th></tr>
                        <tr><th>Length (mi)</th><th>Z1 (Ohm)</th><th>Ang (Deg)</th><th>R1 (Ohm)</th><th>X1 (Ohm)</th></tr>
                    </thead>
                    <tbody>
                        <tr><td>{lineParameters.Length}</td><td>{Math.sqrt(lineParameters.R1 ^ 2 + lineParameters.X1 ^ 2).toFixed(3)}</td><td>{Math.atan((lineParameters.X1/lineParameters.R1)*180/Math.PI).toFixed(3)}</td><td>{lineParameters.R1.toFixed(4)}</td><td>{lineParameters.X1.toFixed(4)}</td></tr>
                        <tr><td>Per Mile</td><td>{(Math.sqrt(lineParameters.R1 ^ 2 + lineParameters.X1 ^ 2)/lineParameters.Length).toFixed(3)}</td><td>-</td><td>{(lineParameters.R1/lineParameters.Length).toFixed(4)}</td><td>{(lineParameters.X1/lineParameters.Length).toFixed(4)}</td></tr>
                    </tbody>
                </table>
                <table className='table'>
                    <thead>
                        <tr><th style={{ textAlign: 'center' }}colSpan={5}>Zero-Seq Imp</th></tr>
                        <tr><th>Length (mi)</th><th>Z0 (Ohm)</th><th>Ang (Deg)</th><th>R0 (Ohm)</th><th>X0 (Ohm)</th></tr>
                    </thead>
                    <tbody>
                        <tr><td>{lineParameters.Length}</td><td>{Math.sqrt(lineParameters.R0 ^ 2 + lineParameters.X0 ^ 2).toFixed(3)}</td><td>{Math.atan((lineParameters.X0 / lineParameters.R0) * 180 / Math.PI).toFixed(3)}</td><td>{lineParameters.R0.toFixed(4)}</td><td>{lineParameters.X0.toFixed(4)}</td></tr>
                        <tr><td>Per Mile</td><td>{(Math.sqrt(lineParameters.R0 ^ 2 + lineParameters.X0 ^ 2) / lineParameters.Length).toFixed(3)}</td><td>-</td><td>{(lineParameters.R0 / lineParameters.Length).toFixed(4)}</td><td>{(lineParameters.X0 / lineParameters.Length).toFixed(4)}</td></tr>
                    </tbody>
                </table>
                <table className='table'>
                    <thead>
                        <tr><th style={{ textAlign: 'center' }}colSpan={5}>Loop Imp (LG)</th></tr>
                        <tr><th>Length (mi)</th><th>ZS (Ohm)</th><th>Ang (Deg)</th><th>RS (Ohm)</th><th>XS (Ohm)</th></tr>
                    </thead>
                    {LoopImp()}
                </table>

            </div>
        </div>
    );
}

export default LineParameters;