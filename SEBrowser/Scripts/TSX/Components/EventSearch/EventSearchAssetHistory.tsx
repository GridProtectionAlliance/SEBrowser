//******************************************************************************************************
//  EventSearchAssetVoltageDisturbances.tsx - Gbtc
//
//  Copyright © 2019, Grid Protection Alliance.  All Rights Reserved.
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
//  04/25/2019 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import React from 'react';

const EventSearchHistory = (props: { EventID: number }) => {
    const [historyData, setHistoryData] = React.useState<Array<any>>([]);
    const [statsData, setStatsData] = React.useState<any>({});

    const [count, setCount] = React.useState<number>(10);

    React.useEffect(() => {
        let handle1 = getHistoryData();
        handle1.done((data) => setHistoryData(data));
        let handle2 = getStatsData();
        handle2.done((data) => setStatsData(data[0]));

        return () => {
            if (handle1.abort != undefined) handle1.abort();
            if (handle2.abort != undefined) handle2.abort();

        }
    }, [props.EventID, count]);


    function getHistoryData() {
        return  $.ajax({
            type: "GET",
            url: `${homePath}api/OpenXDA/GetEventSearchHistory/${props.EventID}/${count}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });
    }

    function getStatsData() {
        return $.ajax({
            type: "GET",
            url: `${homePath}api/OpenXDA/GetEventSearchHistoryStats/${props.EventID}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });
    }

    return (
        <div className="card">
            <div className="card-header">Asset History:
                <select className='pull-right' value={count} onChange={(evt) => setCount(parseInt(evt.target.value))}>
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="75">75</option>
                    <option value="100">100</option>
                </select>
            </div>
            <div className="card-body">
                <table className="table">
                    <thead>
                        <tr><th>Stat</th><th>Value</th></tr>
                    </thead>
                    <tbody>
                        {Object.keys(statsData).map((key, i) =>
                            <tr key={i}>
                                <td>{key}</td>
                                <td>{statsData[key]}</td>
                            </tr>)}
                    </tbody>

                </table>


                <table className="table">
                    <thead>
                        <tr><th>Event Type</th><th>Date</th><th></th></tr>
                    </thead>
                    <tbody>
                        {historyData.map((d, i) =>
                            <tr key={i}>
                                <td>{d.EventType}</td>
                                <td>{moment(d.StartTime).format('MM/DD/YYYY HH:mm:ss.SSS')}</td>
                                <td><a href={homePath + 'Main/OpenSEE?eventid=' + d.ID} target="_blank">View in OpenSEE</a></td>
                            </tr>)}
                    </tbody>

                </table>

            </div>
        </div>
    );
}

export default EventSearchHistory;
