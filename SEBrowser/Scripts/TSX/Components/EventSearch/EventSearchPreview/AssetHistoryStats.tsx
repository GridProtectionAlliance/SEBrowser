//******************************************************************************************************
//  AssetHistoryStats.tsx - Gbtc
//
//  Copyright © 2023, Grid Protection Alliance.  All Rights Reserved.
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
//  06/19/2023 - Gary Pinkley
//       Generated original version of source code.
//
//******************************************************************************************************

import React from 'react';
import { SEBrowser } from '../../../global';
import Table from '@gpa-gemstone/react-table';

interface IStatsData {
    VPeakMax: number;
    VMax: number;
    VMin: number;
    IMax: number;
    I2tMax: number;
    IPeakMax: number;
    AVGMW: number;
    AssetName: string;
}

const AssetHistoryStats: React.FC<SEBrowser.IWidget<any>> = (props) => {
    const [statsData, setStatsData] = React.useState<IStatsData[]>([]);


    React.useEffect(() => {
        getStatsData();
    }, [props.eventID]);

    function getStatsData() {
        $.ajax({
            url: `${homePath}api/OpenXDA/GetEventSearchHistoryStats/${props.eventID}`,
            method: 'GET',
            dataType: 'json',
            success: (data) => {
                if (data && data.length > 0) {
                    const stats = data[0];
                    setStatsData(stats);
                }
            },
        });
    }

    return (
        <div className="card">
            <div className="card-header">Lifetime Stats for {statsData['AssetName']}:</div>
            <div className="card-body">
                <Table
                    cols={[
                        { key: 'Stat', field: 'Stat', label: 'Stat' },
                        { key: 'Value', field: 'Value', label: 'Value' }
                    ]}
                    data={Object.entries(statsData).map(([key, value]) => ({ Stat: key, Value: value }))}
                    onClick={() => { }}
                    onSort={() => { }}
                    sortKey={''}
                    ascending={true}
                    tableClass="table"
                    theadStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                    tbodyStyle={{ display: 'block', overflowY: 'scroll', width: '100%', maxHeight: props.maxHeight ?? 500}}
                    rowStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                />
            </div>
        </div>
    );
};

export default AssetHistoryStats;