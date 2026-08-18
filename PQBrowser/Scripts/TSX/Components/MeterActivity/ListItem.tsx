//******************************************************************************************************
//  ListItem.tsx - Gbtc
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
import PQBrowserService from './../../../TS/Services/PQBrowser';
import moment from 'moment';
import { ReactIcons } from '@gpa-gemstone/gpa-symbols';
import { Application } from '@gpa-gemstone/application-typings';

interface IProps {
    CreationTime: string,
    FilePath: string,
    FileGroupID: number
}

//matches EventView in openXDA.Model
export interface IEventView {
    ID: number,
    FileGroupID: number,
    MeterID: number,
    AssetID: number,
    EventTypeID: number,
    EventDataID: number | null,
    Name: string,
    Alias: string,
    ShortName: string,
    StartTime: string,
    EndTime: string,
    Samples: number,
    TimeZoneOffset: number,
    SamplesPerSecond: number,
    SamplesPerCycle: number,
    Description: string,
    FileVersion: number,
    UpdatedBy: string,
    AssetName: string,
    MeterName: string,
    StationName: string,
    EventTypeName: string
}

const ListItem = (props: IProps) => {
    const [isOpen, setOpen] = React.useState<boolean>(false);
    const [fileGroupEvents, setFileGroupEvents] = React.useState<IEventView[]>([]);
    const [status, setStatus] = React.useState<Application.Types.Status>('uninitiated');

    const [pqBrowserService] = React.useState(() => new PQBrowserService());

    React.useEffect(() => {
        setStatus('loading');
        const handle = pqBrowserService.getFileGroupEvents(props.FileGroupID).done(data => {
            setFileGroupEvents(data);
            setStatus('idle');
        }).fail(() => {
            setStatus('error');
        });

        return () => {
            if (handle?.abort != null)
                handle.abort();
        };
    }, [props.FileGroupID, pqBrowserService]);

    return (
        <li style={{ width: '100%', borderTop: '1px solid #dee2e6' }}>
            <div className="d-flex align-items-center">
                <div style={{ padding: '.75em 0', flex: '0 0 50px' }}>
                    <button className="btn" onClick={() => setOpen(!isOpen)}>
                        {isOpen ? <ReactIcons.ChevronDown /> : <ReactIcons.ChevronUp />}
                    </button>
                </div>
                <div style={{ fontWeight: 'bold', padding: '.75em', flex: '0 0 calc(30% - 50px)', fontSize: 'smaller' }}>
                    <span>
                        {moment(props.CreationTime).format('MM/DD/YYYY')}
                        <br />
                        {moment(props.CreationTime).format('HH:mm:ss.SSSSSSS')}
                    </span>
                </div>
                <div style={{ padding: '.75em', flex: '1 1 70%' }}>
                    <a href={xdaInstance + '/Workbench/DataFiles.cshtml'} title={getFullFileName(props.FilePath)} target="_blank">
                        {getShortFileName(props.FilePath)}
                    </a>
                </div>
            </div>
            <div style={{ display: (isOpen ? 'block' : 'none'), padding: '5px 20px' }}>
                {status === 'loading' ?
                    <div className='d-flex align-items-center justify-content-center'>
                        <ReactIcons.SpiningIcon />
                    </div>
                    : status === 'error' ?
                        <div className='alert alert-danger'>An error occurred while fetching file group events.</div>
                        : <table className='table'>
                            <thead>
                                <tr>
                                    <th>Line</th>
                                    <th>Start Time</th>
                                    <th>Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fileGroupEvents.map(x =>
                                    <tr key={x.ID}>
                                        <td>
                                            <a href={openSEEInstance + '?eventid=' + x.ID} target="_blank">
                                                {x.MeterName} - {x.AssetName}
                                            </a>
                                        </td>
                                        <td>
                                            {moment.utc(x.StartTime).format('MM/DD/YY HH:mm:ss')}
                                        </td>
                                        <td>
                                            {x.EventTypeName}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>}
            </div>
        </li>
    );
}

const getFullFileName = (filepath: string) => {
    const filepathParts = filepath.split('\\');
    return filepathParts[filepathParts.length - 1];
}

const getShortFileName = (filepath: string) => {
    const fullFilename = getFullFileName(filepath);
    let filenameParts = fullFilename.split('.');
    const filenameWithoutExtension = filenameParts.splice(0, filenameParts.length - 1).join('.');
    filenameParts = filenameWithoutExtension.split(',');
    let shortFilename = "";

    // This is to eliminate the timestamp in the fullFilename for the shortFilename
    let inTimestamp = true;
    for (let i = 0; i < filenameParts.length; i++) {
        if (inTimestamp) {
            if (!(/^-?\d/.test(filenameParts[i]))) {
                inTimestamp = false;
                shortFilename += filenameParts[i];
            }
        }
        else {
            shortFilename += ',' + filenameParts[i];
        }
    }

    if (shortFilename == "")
        shortFilename = filenameWithoutExtension;

    return shortFilename;
}

export default ListItem;
