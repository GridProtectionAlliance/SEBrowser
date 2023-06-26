//******************************************************************************************************
//  PlotSettings.tsx - Gbtc
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
//  06/13/23 - Gabriel Santos
//       Generated original version of source code.
//
//******************************************************************************************************
import React from 'react';
import _ from 'lodash';
import { IMultiCheckboxOption } from '../../../global';
import ReportTimeFilter from '../../ReportTimeFilter';
import { CheckBox, Input, MultiCheckBoxSelect } from '@gpa-gemstone/react-forms';
import { ITrendPlot } from './TrendPlot';

interface IProps {
    Plot: ITrendPlot,
    SetPlot: (record: ITrendPlot) => void,
    SetConfirmDisabled: (record: boolean) => void
}

const PlotSettings = React.memo((props: IProps) => {
    React.useEffect(() => {
        props.SetConfirmDisabled(!isValid());
    }, [props.Plot]);

    function validateTrendPlot(field: keyof ITrendPlot): boolean {
        if (field === 'Height' || field === 'Width') {
            const checkValue = props.Plot[field];
            return checkValue <= 100 && checkValue >= 0;
        }
        return true;
    }

    function isValid(): boolean {
        return validateTrendPlot('Height') && validateTrendPlot('Width');
    }

    return (
        <div className="row" style={{ paddingLeft: 20, paddingRight: 20}}>
            <div className="col" style={{ width: '50%' }}>
                <legend className="w-auto" style={{ fontSize: 'large' }}>Plot Settings:</legend>
                <div className="row">
                    <div className="col" style={{ width: '50%'}}>
                        <Input<ITrendPlot> Record={props.Plot} Label={'Plot Title'} Field={'Title'} Setter={props.SetPlot} Valid={() => true} />
                    </div>
                    <div className="col" style={{ width: '50%' }}>
                        <Input<ITrendPlot> Record={props.Plot} Label={'X-Axis Label'} Field={'XAxisLabel'} Setter={props.SetPlot} Valid={() => true} />
                    </div>
                </div>
                <div className="row">
                    <div className="col" style={{ width: '50%' }}>
                        <Input<ITrendPlot> Record={props.Plot} Label={'Height (%)'} Field={'Height'} Setter={props.SetPlot} Valid={validateTrendPlot} Feedback="Must be a percentage value" />
                    </div>
                    <div className="col" style={{ width: '50%' }}>
                        <Input<ITrendPlot> Record={props.Plot} Label={'Width (%)'} Field={'Width'} Setter={props.SetPlot} Valid={validateTrendPlot} Feedback="Must be a percentage value" />
                    </div>
                </div>
                <div className="row">
                    <CheckBox<ITrendPlot> Record={props.Plot} Label='Use Metric Abbreviation' Field='Metric' Setter={props.SetPlot} />
                </div>
            </div>
            <div className="col" style={{ width: '50%' }}>
                <legend className="w-auto" style={{ fontSize: 'large' }}>Series Plotted:</legend>
                <MultiCheckBoxSelect
                    Options={props.Plot.PlotFilter}
                    Label={''}
                    OnChange={(evt, newOptions: IMultiCheckboxOption[]) => {
                        let options: IMultiCheckboxOption[] = [];
                        props.Plot.PlotFilter.forEach(item => {
                            const selected: boolean = item.Selected != (newOptions.findIndex(option => item.Value === option.Value) > -1);
                            options.push({ ...item, Selected: selected });
                        });
                        props.SetPlot({ ...props.Plot, PlotFilter: options });
                    }}
                />
                <ReportTimeFilter filter={props.Plot.TimeFilter} showQuickSelect={false} removeFieldset={true} 
                    setFilter={newFilter => props.SetPlot({ ...props.Plot, TimeFilter: newFilter })} />
            </div>
        </div>
    );
});

export { PlotSettings };