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
import moment from 'moment';
import { SEBrowser } from '../../../../global';
import Table from '@gpa-gemstone/react-table';

interface IFaultInfo {
    FaultTime?: string,
    FaultDuration?: number,
    FaultType?: string,
    FaultDistance?: number,
    StationID?: string,
    StationName?: string,
    LineName?: string,
    LineAssetKey?: string,
    DblDist?: number,
    TreeFaultResistance?: number
}

interface ILinks {
    ID: number,
    Name: string,
    Display: string,
    Value: string
}

const FaultInfo: React.FC<SEBrowser.IWidget<any>> = (props) => {
    const [hidden, setHidden] = React.useState<boolean>(true);
    const [faultInfo, setFaultInfo] = React.useState<IFaultInfo[]>([]);
    const [links, setLinks] = React.useState<ILinks[]>([]);

    React.useEffect(() => {
        return GetData();
    }, [props.eventID]);

    function GetData() {
        const handle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenXDA/FaultInfo/${props.eventID}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        const handle2 = $.ajax({
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
            setFaultInfo(data);
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
                <Table
                    cols={[
                        {
                            key: 'FaultTime', label: 'Fault Inception Time: ',
                            content: (d: IFaultInfo) => d.FaultTime ? `${moment(d.FaultTime).format('YYYY-MM-DD HH:mm:ss.SSS')} (Central Time)` : ''
                        },
                        {
                            key: 'FaultDuration', label: 'Fault Duration: ',
                            content: (d: IFaultInfo) => d.FaultDuration != null ? `${d.FaultDuration} cycles / ${(d.FaultDuration * 16.6).toFixed(2)} ms` : ''
                        },
                        {
                            key: 'FaultType', label: 'Fault Type: ',
                            content: (d: IFaultInfo) => d.FaultType || ''
                        },
                        {
                            key: 'Location', label: 'Location: ',
                            content: (d: IFaultInfo) => d.FaultDistance != null && d.StationName != null && d.StationID != null && d.LineName != null && d.LineAssetKey != null
                                ? `${d.FaultDistance} miles from ${d.StationName} (${d.StationID}) on ${d.LineName} (${d.LineAssetKey})` : ''
                        },
                        {
                            key: 'DoubleEndedLocation', label: 'Double Ended Location: ',
                            content: (d: IFaultInfo) => d.DblDist != null && d.StationName != null ? `${d.DblDist} miles from ${d.StationName}` : ''
                        },
                        {
                            key: 'TreeProbability', label: 'Tree Probability: ',
                            content: (d: IFaultInfo) => d.TreeFaultResistance != null ? TreeProbability(d.TreeFaultResistance) : ''
                        },
                        {
                            key: 'View', label: 'View:',
                            content: (d: IFaultInfo) => links.map(a => {
                                if (a.Name == 'FaultInfo.Miles') {
                                    return (
                                        <a style={{ paddingRight: 5 }} key={a.Name} href={a.Value + `?Station=${d.StationID}&Line=${d.LineAssetKey}&Mileage=${d.FaultDistance}`} target='_blank'>{a.Display}</a>
                                    );
                                } else {
                                    return (
                                        <a style={{ paddingRight: 5 }} key={a.Name} href={a.Value} target='_blank'>{a.Display}</a>);
                                }
                            })
                        }

                    ]}
                    data={faultInfo}
                    onClick={() => { }}
                    onSort={() => { }}
                    sortKey={''}
                    ascending={true}
                    tableClass="table"
                    theadStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                    tbodyStyle={{ display: 'block', overflowY: 'scroll', width: '100%', maxHeight: props.maxHeight ?? 500 }}
                    rowStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                />
            </div>
        </div>
    );
}

export default FaultInfo;