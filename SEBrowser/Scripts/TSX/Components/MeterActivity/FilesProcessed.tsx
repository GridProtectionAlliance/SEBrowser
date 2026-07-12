//******************************************************************************************************
//  FilesProcessed.tsx - Gbtc
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
import SEBrowserService, { IFileProcessed } from './../../../TS/Services/SEBrowser';
import ListItem from './ListItem';
import { ReactIcons } from '@gpa-gemstone/gpa-symbols';
import { Application } from '@gpa-gemstone/application-typings';
import { Paging } from '@gpa-gemstone/react-table';

const pageSize = 50;

const FilesProcessed = () => {
    const [meterTable, setMeterTable] = React.useState<IFileProcessed[]>([]);
    const [sortField] = React.useState<string>('CreationTime');
    const [status, setStatus] = React.useState<Application.Types.Status>('loading');
    const [page, setPage] = React.useState<number>(0);

    const [seBrowserService] = React.useState(() => new SEBrowserService());

    const pageCount = Math.ceil(meterTable.length / pageSize);

    const pagedData = React.useMemo(() => meterTable.slice(page * pageSize, (page + 1) * pageSize), [meterTable, page]);

    //effect to set page to a valid page number if its greater than pagecount
    React.useEffect(() => {
        if (pageCount > 0 && page >= pageCount)
            setPage(pageCount - 1);
    }, [pageCount, page]);

    React.useEffect(() => {
        setStatus('loading');
        const handle = seBrowserService.getFilesProcessedMeterActivityData(sortField).done(data => {
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
    }, [seBrowserService, sortField]);

    return (
        <div className="d-flex flex-column h-100" style={{ overflow: 'hidden' }}>
            <h3 className="mb-0">
                Files Processed Last 24 Hours
            </h3>
            <div style={{ height: 2, width: '100%', backgroundColor: 'black' }}></div>
            <div style={{ backgroundColor: 'white', borderColor: 'black' }}></div>
            <div className="flex-grow-1" style={{ overflowY: 'auto', overflowX: 'hidden' }}>
                {status === 'loading' ?
                    <div className='d-flex align-items-center justify-content-center' style={{ height: '100%' }}>
                        <ReactIcons.SpiningIcon Size={'50%'} />
                    </div>
                    :
                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                        <li key='header'
                            className="d-flex"
                            style={{ width: '100%', borderTop: '1px solid #dee2e6' }}>
                            <div style={{ fontWeight: 'bold', padding: '.75em', flex: '0 0 50px', fontSize: 'smaller' }} />
                            <div style={{ fontWeight: 'bold', padding: '.75em', flex: '0 0 calc(30% - 50px)', fontSize: 'smaller' }}>Time Processed</div>
                            <div style={{ fontWeight: 'bold', padding: '.75em', flex: '1 1 70%', fontSize: 'smaller' }}>File</div>
                        </li>
                        {pagedData.map((x) => <ListItem key={x.FilePath} CreationTime={x.CreationTime} FilePath={x.FilePath} FileGroupID={x.FileGroupID} />)}
                    </ul>}
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

export default FilesProcessed;
