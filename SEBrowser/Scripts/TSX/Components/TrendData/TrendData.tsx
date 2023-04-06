//******************************************************************************************************
//  TrendData.tsx - Gbtc
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
//  03/30/23 - Gabriel Santos
//       Generated original version of source code.
//
//******************************************************************************************************

import React from 'react';
import TrendSearchNavbar from './TrendDataNavbar';
import { VerticalSplit } from '@gpa-gemstone/react-interactive';

interface IProps { }

const TrendData = (props: IProps) => {
    const [showNav, setShowNav] = React.useState<boolean>(getShowNav());
    const [navHeight, setNavHeight] = React.useState<number>(0);


    function getShowNav(): boolean {
        if (localStorage.hasOwnProperty('SEbrowser.TrendData.ShowNav'))
            return JSON.parse(localStorage.getItem('SEbrowser.TrendData.ShowNav'))
        else
            return true;
    }

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <TrendSearchNavbar
                ToggleVis={() => setShowNav((c) => !c)}
                ShowNav={showNav}
                SetHeight={setNavHeight}
            />
            <VerticalSplit style={{ width: '100%', height: (showNav ? 'calc(100% - ' + navHeight + 'px)' : 'calc( 100% - 52px)') }}>
            </VerticalSplit>
        </div>
    );
}

export default TrendData;
