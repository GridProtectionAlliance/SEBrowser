//******************************************************************************************************
//  MeterActivity.tsx - Gbtc
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
import { VerticalSplit, SplitSection } from '@gpa-gemstone/react-interactive';
import MostActiveMeters from './MostActiveMeters';
import LeastActiveMeters from './LeastActiveMeters';
import FilesProcessed from './FilesProcessed';

const MeterActivity = () => {
    return (
        <VerticalSplit style={{ width: '100%', height: '100%' }}>
            <SplitSection Width={50} MinWidth={25} MaxWidth={75}>
                <div className="container-fluid d-flex flex-column h-100 p-0">
                    <div className="d-flex flex-column p-2" style={{ flex: '1 1 50%', overflow: 'hidden' }}>
                        <MostActiveMeters />
                    </div>
                    <div className="d-flex flex-column p-2" style={{ flex: '1 1 50%', overflow: 'hidden' }}>
                        <LeastActiveMeters />
                    </div>
                </div>
            </SplitSection>
            <SplitSection Width={50} MinWidth={25} MaxWidth={75}>
                <div className="container-fluid d-flex flex-column h-100 p-2" style={{ overflowY: 'auto' }}>
                    <FilesProcessed />
                </div>
            </SplitSection>
        </VerticalSplit>
    );

}

export default MeterActivity;