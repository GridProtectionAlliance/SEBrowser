//******************************************************************************************************
//  TrendDataTutorials.tsx - Gbtc
//
//  Copyright © 2026, Grid Protection Alliance.  All Rights Reserved.
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
//  07/16/26 - Preston Crawford
//       Generated original version of source code.
//
//******************************************************************************************************

import React from 'react';
import { Alert } from '@gpa-gemstone/react-interactive';
import { TutorialKeys } from '../../TutorialKeys';

export const TrendChannelSelectorTutorialAlert = () => {
    const [show, setShow] = React.useState<boolean>(true);

    React.useEffect(() => {
        const dismissed = localStorage.getItem(TutorialKeys.TrendChannelSelector);
        if (dismissed === "true")
            setShow(false);
    }, []);

    const handleOnClick = () => {
        localStorage.setItem(TutorialKeys.TrendChannelSelector, "true");
    };

    return show ?
        <Alert OnClick={handleOnClick} Class="alert-primary">
            <strong>Select channels:</strong> Click a row to select it, Ctrl+click to add or remove individual rows, or Shift+click to select a range.
            <br />
            <strong>Plot channels:</strong> Drag a row into the plot area to plot that channel.
        </Alert>
        : null;
};
