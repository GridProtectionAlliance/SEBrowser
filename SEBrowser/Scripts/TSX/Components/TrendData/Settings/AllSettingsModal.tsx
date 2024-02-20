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
import { Modal, TabSelector } from '@gpa-gemstone/react-interactive';
import { PlotSettings } from './PlotSettings';
import { MarkerTab } from './OverlayTabs/MarkerTab';
import { TrendSearch } from '../../../Global';

interface IProps {
    Show: boolean,
    Defaults: TrendSearch.ITrendPlot,
    SetDefaults: (newDefaults: TrendSearch.ITrendPlot) => void,
    SetShow: (value: boolean) => void,
    ApplyFieldToAll: (record: TrendSearch.ITrendPlot, field: keyof (TrendSearch.ITrendPlot)) => void,
    MarkerDefaults: TrendSearch.IMarkerSettingsBundle,
    SetMarkerDefaults: (newDefaults: TrendSearch.IMarkerSettingsBundle) => void
}

const Tabs = [
    { Id: "plot", Label: "Plot" },
    { Id: "marks", Label: "Marker" },
    { Id: "series", Label: "Channel" }
];

const AllSettingsModal = React.memo((props: IProps) => {
    // Settings Controls
    const [tab, setTab] = React.useState<string>("plot");
    const [confirmDisabled, setConfirmDisabled] = React.useState<boolean>(false);

    // Buffers
    const [allPlot, setAllPlot] = React.useState<TrendSearch.ITrendPlot>(props.Defaults);
    const [markers, setMarkers] = React.useState<TrendSearch.IMarkerSettingsBundle>(props.MarkerDefaults);

    // Sufficiently complicated that gains by checking on rerender are small and potential for bugs is high
    function settingsModalCallback(confirmed: boolean, btn: boolean, futureOnly: boolean) {
        // Setting existing plots
        if (confirmed) {
            Object.keys(allPlot).forEach((field: string) => {
                if (!_.isEqual(allPlot[field], props.Defaults[field]))
                    props.ApplyFieldToAll(allPlot, field as keyof (TrendSearch.ITrendPlot));
            });
        } 
        // Settings defaults
        if (confirmed || futureOnly) {
            const newMarkerDefaults = _.cloneDeep(markers);
            Object.keys(markers).forEach(field => {
                newMarkerDefaults[field].ShouldApply = !(futureOnly || _.isEqual(newMarkerDefaults[field].Default, props.MarkerDefaults[field].Default))
            })
            setMarkers(newMarkerDefaults);
            props.SetMarkerDefaults(newMarkerDefaults);
            props.SetDefaults(allPlot);
        }
        // Clear buffers
        else {
            setMarkers(props.MarkerDefaults);
            setAllPlot(props.Defaults);
        }
        // Close modal
        props.SetShow(false);
    }

    const markerBufferSetter = React.useCallback((record: any, field: 'VeHo' | 'Symb' | 'Event') => {
        const newBuffer = _.cloneDeep(markers);
        const isArray = Object.prototype.hasOwnProperty.call(record, 'length');
        newBuffer[field].Default = isArray ? record[0] : record;
        setMarkers(newBuffer);
    }, [markers]);

    return (
        <Modal Title='Change Settings for All Plots' CallBack={settingsModalCallback} Show={props.Show} Size='xlg' BodyStyle={{ maxHeight: 'calc(100vh - 210px)', overflowY: 'hidden' }}
            ConfirmText="Apply to Existing & Future" CancelText="Discard Changes" TertiaryText="Apply to Future" ShowCancel={true} ShowTertiary={true} DisableConfirm={confirmDisabled} DisableTertiary={confirmDisabled}>
            <TabSelector CurrentTab={tab} SetTab={setTab} Tabs={Tabs} />
            <div className="tab-content" style={{ overflow: 'hidden' }}>
                <div className={"tab-pane " + (tab == "plot" ? " active" : "fade")} id="plot">
                    <PlotSettings Plot={allPlot} SetPlot={setAllPlot} SetConfirmDisabled={setConfirmDisabled} />
                </div>
            </div>
            <div className="tab-content" style={{ overflow: 'hidden' }}>
                <div className={"tab-pane " + (tab == "marks" ? " active" : "fade")} id="marks">
                    <MarkerTab VeHoMarkers={[markers.VeHo.Default]} SetVeHoMarkers={r => markerBufferSetter(r, 'VeHo')} SymbMarkers={[markers.Symb.Default]} SetSymbMarkers={r => markerBufferSetter(r, 'Symb')}
                        EventSettings={markers.Event.Default} SetEventSettings={r => markerBufferSetter(r, 'Event')} DisplayEventSettings={true} IsGlobalSettings={true} />
                </div>
            </div>
        </Modal>
    );
});

export default AllSettingsModal;
