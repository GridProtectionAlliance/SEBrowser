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
import { SEBrowser } from '../../../../global';
import Table from '@gpa-gemstone/react-table';

interface ISida {
    ID: number, 
    sidaeventnumber: number,
    equipmentname: string,
    Ins: string,
    kv: string,
    durationhr: number,
    durationmin: number,
    omoffice: string,
    causedescription: string,
    subcausedescription: string,
    eventtype: string,
    excludedrecord: string,
    internalexternal: string,
    eventtime: string
}

const SIDA: React.FC<SEBrowser.IWidget<any>> = (props) => {
    const [sidaInfo, setSIDAInfo] = React.useState <ISida[]> ([]);
    
    React.useEffect(() => {
        return GetData();
    }, [props.eventID]);

    function GetData() {
        let handle = $.ajax({
            type: "GET",
            url: `${homePath}api/SIDA/${props.eventID}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        handle.done(data => setSIDAInfo(data));

        return function () {
            if (handle.abort != undefined) handle.abort();
        }
    }

    return (
        <div className="card">
            <div className="card-header">Corresponding SIDA Reports:</div>
            <div className="card-body">
                <Table
                    cols={[
                        { key: 'sidaeventnumber', field: 'sidaeventnumber', label: 'SIDA #' },
                        { key: 'eventtime', field: 'eventtime', label: 'Evt Time' },
                        { key: 'equipmentname', field: 'equipmentname', label: 'Eqp' },
                        { key: 'kv', field: 'kv', label: 'kV' },
                        { key: 'duration', label: 'Dur (HH:MM)', content: (d: ISida) => `${d.durationhr}:${d.durationmin}` },
                        { key: 'omoffice', field: 'omoffice', label: 'OM Office' },
                        { key: 'cause', label: 'Cause (SubCause)', content: (d: ISida) => `${d.causedescription}(${d.subcausedescription})` },
                        { key: 'eventtype', field: 'eventtype', label: 'Type' },
                        { key: 'Ins', field: 'Ins', label: 'Excluded' },
                        { key: 'internalexternal', field: 'internalexternal', label: 'Int/Ext' },
                    ]}
                    data={sidaInfo}
                    onClick={() => { }}
                    onSort={() => { }}
                    sortKey=''
                    ascending={true}
                    tableClass="table"
                    theadStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%', height: '50px' }}
                    tbodyStyle={{ display: 'block', overflowY: 'scroll', width: '100%' }}
                    rowStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                />
            </div>
        </div>
    );
}

export default SIDA;