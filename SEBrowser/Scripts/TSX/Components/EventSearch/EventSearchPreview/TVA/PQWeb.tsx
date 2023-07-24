//******************************************************************************************************
//  PQWeb.tsx - Gbtc
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
//  03/25/2020 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import React from 'react';
import moment from 'moment';
import { SEBrowser } from '../../../../global';

const PQWeb: React.FC<SEBrowser.IWidget<unknown>> = (props) => {
    const [tab, setTab] = React.useState<'LSC' | 'All'>('LSC');

    return (
        <div className="card">
            <div className="card-header">PQWeb Reports:</div>
            <div className="card-body">
                <ul className="nav nav-tabs">
                    <li className="nav-item">
                        <button className={"nav-link" + (tab == 'LSC' ? " active" : "")} onClick={() => setTab('LSC')}>LSC</button>
                    </li>
                    <li className="nav-item">
                        <button className={"nav-link" + (tab == 'All' ? " active" : "")} onClick={() => setTab('All')}>All</button>
                    </li>
                </ul>

                <div className="tab-content">
                    <div style={{ height: 400, maxHeight: props.maxHeight ?? 400, overflowY: 'hidden' }} className={"tab-pane fade" + (tab == 'LSC' ? " show active" : "")}>
                        <iframe style={{ height: 'inherit', width: '100%'}} src={`${faultLocationInstance}/pqwebreport.asp?sitefilter=LSC&t=${moment(props.startTime).format('YYYY-MM-DD HH:mm:ss')}`}/>
                    </div>
                    <div style={{ height: 400, maxHeight: props.maxHeight ?? 400, overflowY: 'hidden' }} className={"tab-pane fade" + (tab == 'All' ? " show active" : "")}>
                        <iframe style={{ height: 'inherit', width: '100%' }} src={`${faultLocationInstance}/pqwebreport.asp?t=${moment(props.startTime).format('YYYY-MM-DD HH:mm:ss')}`}/>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PQWeb;