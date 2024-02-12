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
import _ from 'lodash';
import { Modal } from '@gpa-gemstone/react-interactive';
import { PlotSettings } from './PlotSettings';
import { TrendSearch } from '../../../Global';

interface IProps {
    Show: boolean,
    Defaults: TrendSearch.ITrendPlot,
    SetDefaults: (newDefaults: TrendSearch.ITrendPlot) => void,
    SetShow: (value: boolean) => void,
    ApplyFieldToAll: (record: TrendSearch.ITrendPlot, field: keyof (TrendSearch.ITrendPlot)) => void
}

const AllSettingsModal = React.memo((props: IProps) => {
    const [confirmDisabled, setConfirmDisabled] = React.useState<boolean>(false);
    const [allPlot, setAllPlot] = React.useState<TrendSearch.ITrendPlot>(props.Defaults);

    const settingsModalCallback = React.useCallback((
        (confirmed: boolean, btn: boolean, futureOnly: boolean) => {
            // Setting existing plots
            if (confirmed) {
                Object.keys(allPlot).forEach((field: string) => {
                    if (!_.isEqual(allPlot[field], props.Defaults[field]))
                        props.ApplyFieldToAll(allPlot, field as keyof (TrendSearch.ITrendPlot));
                });
            } 
            // Settings defaults
            if (confirmed || futureOnly) props.SetDefaults(allPlot);
            else setAllPlot(props.Defaults);
            // Close modal
            props.SetShow(false);
        }), [props.SetShow, props.ApplyFieldToAll, allPlot, setAllPlot, props.SetDefaults, props.Defaults])

    return (
        <Modal Title='Change Settings for All Plots' CallBack={settingsModalCallback} Show={props.Show} Size='xlg'
            ConfirmText="Apply to Existing & Future" CancelText="Discard Changes" TertiaryText="Apply to Future" ShowCancel={true} ShowTertiary={true} DisableConfirm={confirmDisabled} DisableTertiary={confirmDisabled}>
            <PlotSettings Plot={allPlot} SetPlot={setAllPlot} SetConfirmDisabled={setConfirmDisabled} />
        </Modal>
    );
});

export default AllSettingsModal;
