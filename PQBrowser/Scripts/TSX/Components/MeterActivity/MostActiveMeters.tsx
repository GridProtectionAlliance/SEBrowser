//******************************************************************************************************
//  MostActiveMeters.tsx - Gbtc
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
//  04/08/2019 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import React from 'react';
import { Table, Column, Paging } from '@gpa-gemstone/react-table';
import PQBrowserService from './../../../TS/Services/PQBrowser';
import moment from 'moment';
import { ReactIcons } from '@gpa-gemstone/gpa-symbols';
import { Application } from '@gpa-gemstone/application-typings';

const momentFormat = "YYYY/MM/DD HH:mm:ss";
const pageSize = 50;

interface MostActiveMeterActivityRow {
    AssetKey: string,
    '24Hours': number,
    '7Days': number,
    '30Days': number,
    FirstEventID: number
}

const MostActiveMeters = () => {
    const [meterTable, setMeterTable] = React.useState<MostActiveMeterActivityRow[]>([]);
    const [sortField, setSortField] = React.useState<keyof MostActiveMeterActivityRow>('24Hours');
    const [status, setStatus] = React.useState<Application.Types.Status>('loading');
    const [page, setPage] = React.useState<number>(0);

    const divElement = React.useRef<HTMLDivElement>(null);

    const [pqBrowserService] = React.useState(() => new PQBrowserService());

    const pageCount = Math.ceil(meterTable.length / pageSize);

    const pagedData = React.useMemo(() => meterTable.slice(page * pageSize, (page + 1) * pageSize), [meterTable, page]);

    //effect to set page to a valid page number if its greater than pagecount
    React.useEffect(() => {
        if (pageCount > 0 && page >= pageCount)
            setPage(pageCount - 1);
    }, [pageCount, page]);

    React.useEffect(() => {
        setStatus('loading');
        const handle = pqBrowserService.getMostActiveMeterActivityData(5000, sortField)
            .done(data => {
                setMeterTable(data);
                setStatus('idle');
            })
            .fail(() => {
                setStatus('error');
            });

        return () => {
            if (handle?.abort != null)
                handle.abort();
        };
    }, [pqBrowserService, sortField]);

    const createContent = (item: MostActiveMeterActivityRow, key: keyof (MostActiveMeterActivityRow)) => {
        let context = '';
        if (key == '24Hours')
            context = '24h';
        else if (key == '7Days')
            context = '7d';
        else if (key == '30Days')
            context = '30d';
        else
            context = '24h';

        if (item[key] != '0 ( 0 )')
            return <a onClick={() => openWindowToMeterEventsByLine(item.FirstEventID, context, moment().format(momentFormat))} style={{ color: 'blue' }}>
                {item[key]}
            </a>

        else
            return <span>{item[key]}</span>;

    }

    return (
        <div className="d-flex flex-column h-100">
            <h3 className="mb-0">
                Most Active Meters
            </h3>
            <div style={{ height: 2, width: '100%', backgroundColor: 'black' }}></div>
            <div className="flex-grow-1" style={{ backgroundColor: 'white', borderColor: 'black', overflowY: 'auto' }} ref={divElement}>
                {status === 'loading' ?
                    <div className='d-flex align-items-center justify-content-center' style={{ height: '100%' }}>
                        <ReactIcons.SpiningIcon Size={'50%'} />
                    </div>
                    :
                    <Table<MostActiveMeterActivityRow>
                        TableClass="table"
                        Data={pagedData}
                        SortKey={sortField}
                        Ascending={true}
                        Selected={() => false}
                        OnSort={(row) => setSortField(row.colField!)}
                        OnClick={() => {/*Do Nothing*/ }}
                        TheadStyle={{ fontSize: 'smaller' }}
                        KeySelector={item => item.AssetKey}
                    >
                        <Column<MostActiveMeterActivityRow>
                            Key="AssetKey"
                            Field="AssetKey"
                            HeaderStyle={{ width: '40%' }}
                            RowStyle={{ width: '40%' }}
                        >
                            Name
                        </Column>
                        <Column<MostActiveMeterActivityRow>
                            Key="24Hours"
                            Field="24Hours"
                            HeaderStyle={{ width: '20%' }}
                            RowStyle={{ width: '20%' }}
                            Content={row => createContent(row.item, row.field!)}
                        >
                            Files(Evts) 24H'
                        </Column>
                        <Column<MostActiveMeterActivityRow>
                            Key="7Days"
                            Field="7Days"
                            HeaderStyle={{ width: '20%' }}
                            RowStyle={{ width: '20%' }}
                            Content={row => createContent(row.item, row.field!)}
                        >
                            Files(Evts) 7D
                        </Column>
                        <Column<MostActiveMeterActivityRow>
                            Key="30Days"
                            Field="30Days"
                            HeaderStyle={{ width: '20%' }}
                            RowStyle={{ width: '20%' }}
                            Content={row => createContent(row.item, row.field!)}
                        >
                            Files(Evts) 30D
                        </Column>
                    </Table>
                }
            </div>
            <div className='row m-0'>
                <div className='col-12 p-0'>
                    <Paging
                        Current={page + 1}
                        Total={pageCount}
                        SetPage={(p) => setPage(p - 1)}
                    />
                </div>
            </div>
        </div>
    );
}

const openWindowToMeterEventsByLine = (id: number, context: string, sourcedate: string) => window.open(homePath + "Main/MeterEventsByLine?eventid=" + id + "&context=" + context + "&posteddate=" + sourcedate, id + "MeterEventsByLine");

export default MostActiveMeters;
