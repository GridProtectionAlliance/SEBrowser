//******************************************************************************************************
//  AllSettingsModal.tsx - Gbtc
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
//  06/14/23 - Gabriel Santos
//       Generated original version of source code.
//
//******************************************************************************************************

import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import { Modal } from '@gpa-gemstone/react-interactive';
import { PlotSettings } from './TrendPlot/PlotSettings';
import { TrendSearch } from '../../Global';

const momentDateFormat = "MM/DD/YYYY";
const defaultPlot: TrendSearch.ITrendPlot = {
    TimeFilter: { date: moment.utc().format(momentDateFormat), time: '12:00:00.000', windowSize: 12, timeWindowUnits: 3 },
    Type: 'Line',
    Channels: [],
    PlotFilter: [{ Value: 0, Text: "Minimum", Selected: true }, { Value: 1, Text: "Maximum", Selected: true }, { Value: 2, Text: "Average", Selected: true }],
    ID: "blank",
    Width: 50,
    Height: 33,
    Title: "",
    XAxisLabel: ""
}

interface IProps {
    Show: boolean,
    SetShow: (value: boolean) => void,
    ApplyFieldToAll: (record: TrendSearch.ITrendPlot, field: keyof (TrendSearch.ITrendPlot)) => void
}

const AllSettingsModal = React.memo((props: IProps) => {
    const [confirmDisabled, setConfirmDisabled] = React.useState<boolean>(false);
    const [allPlot, setAllPlot] = React.useState<TrendSearch.ITrendPlot>(defaultPlot);

    const settingsModalCallback = React.useCallback((
        (confirmed: boolean) => {
            if (confirmed)
                Object.keys(allPlot).forEach((field: string) => {
                    if (!_.isEqual(allPlot[field], defaultPlot[field]))
                        props.ApplyFieldToAll(allPlot, field as keyof (TrendSearch.ITrendPlot))
            });
            setAllPlot(defaultPlot);
            props.SetShow(false);
        }), [props.SetShow, props.ApplyFieldToAll, allPlot, setAllPlot, defaultPlot])

    return (
        <Modal Title='Change Settings for All Plots' CallBack={settingsModalCallback} Show={props.Show} Size='xlg'
            ConfirmText="Apply Changes to All" CancelText="Discard Changes" ShowCancel={true} DisableConfirm={confirmDisabled}>
            <PlotSettings Plot={allPlot} SetPlot={setAllPlot} SetConfirmDisabled={setConfirmDisabled} />
        </Modal>
    );
});

export default AllSettingsModal;
