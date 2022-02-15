//******************************************************************************************************
//  SOE.tsx - Gbtc
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
//  03/23/2020 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import Table from '@gpa-gemstone/react-table';
import React from 'react';

interface IInterruption {
    TimeOut: string,
    TimeIn?: string,
    Class?: string,
    Area: string,
    ReportNumber: number,
    Explanation?: string,
    CircuitInfo: string
}

const InterruptionReport = (props: { EventID: number }) => {

    const Data: IInterruption[] = [
        {
            TimeOut: '1/1/2020  4:51:00 PM',
            TimeIn: null,
            Class: 'C-2',
            Area: '478 KEOLU DR  V-3650, 1284 AKELE ST  V-3651, 1256 AKELE ST  V-3652, 1263 AKIAHALA ST  V-3653',
            ReportNumber: 7,
            Explanation: 'FUSE A PHASE #SW V3703 100 AMPS BLEW IN SW V3703 ENCHANTED LAKES SW VLT B DUE TO A CABLE FAULT BETWEEN V3653 AKIAHALA ST AND V3654 AKIAHALA ST.  E#296131 RO#133187 REQ#44 - UG REPAIRED PRIMARY CABLE 01/02/20.',
            CircuitInfo: 'POHAKUPU 2 SUB POHAKUPU 4 12.5KV CKT  CB- 2123 FUSE SW V3703'
        },
        {
            TimeOut: '1/1/2020  4:51:00 PM',
            TimeIn: '1/1/2020 18:16',
            Class: null,
            Area: '478 KEOLU DR  V-3650, 1284 AKELE ST  V-3651, 1256 AKELE ST  V-3652, 1263 AKIAHALA ST  V-3653',
            ReportNumber: 7,
            Explanation: null,
            CircuitInfo: 'FUSE SW V3703'
        },
        {
            TimeOut: '1/2/2020  12:19:00 AM',
            TimeIn: null,
            Class: 'C-2',
            Area: '1875 KIHI ST  V-4008C, 1773 HANAHANAI PL  V-4008B, 1915 KIHI ST  V-4008A, 1810 ALAWEO ST  V-4008M, 1842 LAUKAHI ST  V-4008L, 1887 LALEA PL  V-4008K',
            ReportNumber: 8,
            Explanation: 'FUSE A PHASE #V4008D 100 AMPS BLEW IN V4008D KIHI ST DUE TO A CABLE FAULT BETWEEN SAME AND V4008C KIHI ST.  E#296135 RO#133188 REQ#45 - UG REPLACED FAULTED CABLE 01/02/20',
            CircuitInfo: 'WAILUPE SUB WAILUPE 12.5KV CKT  CB- 1607 FUSE V4008D'
        },
        {
            TimeOut: null,
            TimeIn: '1/2/2020  1:19:00 AM',
            Class: null,
            Area: '1875 KIHI ST  V-4008C, 1773 HANAHANAI PL  V-4008B, 1915 KIHI ST  V-4008A, 1810 ALAWEO ST  V-4008M, 1842 LAUKAHI ST  V-4008L, 1887 LALEA PL  V-4008K',
            ReportNumber: 8,
            Explanation: null,
            CircuitInfo: 'ELBOW V4008J'
        },
    ]

    return (
        <div className="card">
            <div className="card-header">Interruption Report:</div>
            <div className="card-body">
                <Table<IInterruption>
                    cols={[
                        { key: 'CircuitInfo', field: 'CircuitInfo', label: 'Substation Ckt' },
                        { key: 'TimeOut', field: 'TimeOut', label: 'Time Out' },
                        { key: 'TimeIn', field: 'TimeIn', label: 'Time In' },
                        { key: 'TotalTime', field: 'TimeIn', label: 'Total Time', content: (record) => { return null; }},
                        { key: 'Class', field: 'Class', label: 'Class Type' },
                        { key: 'Area', field: 'Area', label: 'Affected Area/District' },
                        { key: 'ReportNumber', field: 'ReportNumber', label: 'Report' },
                        { key: 'Explanation', field: 'Explanation', label: 'Explanation' }
                    ]}
                    data={Data}
                    onClick={() => { }}
                    onSort={() => { }}
                    sortKey={'TimeOut'}
                    ascending={true}
                    tableClass="table"
                    theadStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%', height: 50 }}
                    tbodyStyle={{ display: 'block', overflowY: 'scroll', maxHeight: 200, height: 200, width: '100%' }}
                    rowStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                />
            </div>
        </div>
    );
}

export default InterruptionReport;