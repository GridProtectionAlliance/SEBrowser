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

const LineParameters: React.FC<SEBrowser.IWidget<unknown>> = (props) => {
    const [hidden, setHidden] = React.useState<boolean>(true);
    const [lineParameters, setLineParameters] = React.useState<ILineParameters>(null);
    React.useEffect(() => {
        return GetData();
    }, [props.eventID]);

    function GetData() {
        const handle = $.ajax({
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
        const rs = (lineParameters.R1 * 2 + lineParameters.R0) / 3;
        const rsm = rs / lineParameters.Length;
        const xs = (lineParameters.X1 * 2 + lineParameters.X0) / 3;
        const xsm = xs / lineParameters.Length;
        const zs = Math.sqrt(rs ^ 2 + xs ^ 2);
        const zsm = zs / lineParameters.Length;
        const angS = Math.atan(xs / rs) * 180 / Math.PI;
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
                <Table<ILoopImpedance>
                    cols={[
                        { key: 'Length', field: 'Length', label: 'Length (mi)' },
                        { key: 'ZS', field: 'ZS', label: 'ZS (Ohm)' },
                        { key: 'Ang', field: 'Ang', label: 'Ang (Deg)' },
                        { key: 'RS', field: 'RS', label: 'RS (Ohm)' },
                        { key: 'XS', field: 'XS', label: 'XS (Ohm)' },
                        { key: 'PerMileZS', field: 'PerMileZS', label: 'Per Mile ZS' },
                        { key: 'PerMileRS', field: 'PerMileRS', label: 'Per Mile RS' },
                        { key: 'PerMileXS', field: 'PerMileXS', label: 'Per Mile XS' }
                    ]}
                    data={[LoopImp()]} 
                    onClick={() => { }}
                    onSort={() => { }}
                    sortKey={''}
                    ascending={true}
                    tableClass="table"
                    theadStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%', height: 50 }}
                    tbodyStyle={{ display: 'block', overflowY: 'scroll', maxHeight: props.maxHeight ?? 500, width: '100%' }}
                    rowStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                />
            </div>
        </div>
    );
}

export default LineParameters;