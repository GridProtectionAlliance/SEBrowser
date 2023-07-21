//******************************************************************************************************
//  AssetHistoryTable.tsx - Gbtc
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
import moment from 'moment';
import { SEBrowser } from '../../../global';
import Table from '@gpa-gemstone/react-table';
import { Select } from '@gpa-gemstone/react-forms';

const AssetHistoryTable: React.FC<SEBrowser.IWidget<unknown>> = (props) => {
    const [historyData, setHistoryData] = React.useState<Array<any>>([]);
    const [count, setCount] = React.useState<number>(10);
    const [assetName, setAssetName] = React.useState<string>('');

    React.useEffect(() => {
        const handle = getHistoryData();
        handle.done((data) => {
            setHistoryData(data);

            if (data.length > 0) setAssetName(data[0].AssetName);
        });

        return () => {
            if (handle.abort != undefined) handle.abort();
        }
    }, [props.eventID, count]);

    function getHistoryData() {
        return $.ajax({
            type: "GET",
            url: `${homePath}api/OpenXDA/GetEventSearchHistory/${props.eventID}/${count}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });
    }

    return (
        <div className="card">
            <div className="card-header">Event History for {assetName}:
                <div className='pull-right'>
                    <div className="form-inline">
                        <Select
                            Record={{ count }}
                            Field='count'
                            Options={[
                                { Value: "10", Label: "10" },
                                { Value: "25", Label: "25" },
                                { Value: "50", Label: "50" },
                                { Value: "75", Label: "75" },
                                { Value: "100", Label: "100" }
                            ]}
                            Setter={(record) => setCount(record.count)}
                            Label="Number of events: "
                        />
                    </div>
                </div>
            </div>
            <div className="card-body">
                <Table
                    cols={[
                        { key: 'EventType', field: 'EventType', label: 'Event Type' },
                        { key: 'Date', field: 'StartTime', label: 'Date', content: (d) => moment(d.StartTime).format('MM/DD/YYYY HH:mm:ss.SSS') },
                        { key: 'Link', field: 'ID', label: '', content: (d) => <a href={openSEEInstance + '?eventid=' + d.ID} target="_blank">View in OpenSEE</a> },
                    ]}
                    data={historyData}
                    onSort={() => {/*Do Nothing*/}}
                    sortKey={''}
                    ascending={true}
                    tableClass="table"
                    theadStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%', height: 50 }}
                    tbodyStyle={{ display: 'block', overflowY: 'scroll', width: '100%', maxHeight: props.maxHeight ?? 500 }}
                    rowStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                />
            </div>
        </div>
    );
}

export default AssetHistoryTable; 