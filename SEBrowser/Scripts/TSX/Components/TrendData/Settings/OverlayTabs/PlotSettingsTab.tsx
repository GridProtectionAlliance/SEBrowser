//******************************************************************************************************
//  PlotSettingsTab.tsx - Gbtc
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
import { IMultiCheckboxOption, TrendSearch } from '../../../../global';
import { TimeFilter } from '@gpa-gemstone/common-pages'
import { CheckBox, Input, MultiCheckBoxSelect, Select } from '@gpa-gemstone/react-forms';
import { useSelector } from 'react-redux';
import { SelectTimeZone, SelectDateTimeSetting } from '../../../SettingsSlice';

interface IProps {
    Plot: TrendSearch.ITrendPlot,
    SetPlot: (record: TrendSearch.ITrendPlot) => void,
    SetConfirmDisabled: (record: boolean) => void
}

interface AxisLimits { LeftUpper: number, LeftLower: number, RightUpper: number, RightLower: number }

const limitFeedback = "Lower limits must be lower than upper.";

const axisOptions: { Value: string, Label: string }[] = [
    { Value: 'AutoValue', Label: 'Automatic' },
    { Value: 'HalfAutoValue', Label: 'Zero to Auto' },
    { Value: 'Manual', Label: 'Manual' }
]

const PlotSettingsTab = React.memo((props: IProps) => {
    const [limits, setLimits] = React.useState<AxisLimits>({ LeftUpper: 1, LeftLower: 0, RightUpper: 1, RightLower: 0 });
    const timeZone = useSelector(SelectTimeZone);
    const dateTimeSetting = useSelector(SelectDateTimeSetting);

    const setPlotLimits = React.useCallback((limits: AxisLimits) => {
        const newPlot = { ...props.Plot };
        newPlot.DefaultZoom = [[limits.LeftLower, limits.LeftUpper], [limits.RightLower, limits.RightUpper]];
        props.SetPlot(newPlot);
    }, [props.Plot, props.SetPlot]);

    const validateLimit = React.useCallback((field: keyof AxisLimits) => {
        if (field === "LeftUpper" || field === "LeftLower")
            return limits.LeftUpper > limits.LeftLower;
        else
            return limits.LeftUpper > limits.LeftLower;
    }, [limits]);

    React.useEffect(() => {
        props.SetConfirmDisabled(!isValid());
    }, [props.Plot]);

    React.useEffect(() => {
        if (props.Plot.DefaultZoom === undefined) return;
        setLimits({
            LeftLower: props.Plot.DefaultZoom[0][0],
            LeftUpper: props.Plot.DefaultZoom[0][1],
            RightLower: props.Plot.DefaultZoom[1][0],
            RightUpper: props.Plot.DefaultZoom[1][1]
        });
    }, [props.Plot.DefaultZoom]);

    function validateTrendPlot(field: keyof TrendSearch.ITrendPlot): boolean {
        if (field === 'Height' || field === 'Width') {
            const checkValue = props.Plot[field];
            return checkValue <= 100 && checkValue >= 0;
        }
        return true;
    }
        
    function isValid(): boolean {
        return validateTrendPlot('Height') && validateTrendPlot('Width') && validateLimit("LeftUpper") && validateLimit("RightUpper");
    }

    type TimeUnit = 'y' | 'M' | 'w' | 'd' | 'h' | 'm' | 's' | 'ms'
    const units = ['ms', 's', 'm', 'h', 'd', 'w', 'M', 'y'] as TimeUnit[]

    // converts the SEBrowser filter to ICenterDuration filter
    const convertTimeFilter = (flt) => ({
        center: flt.date + ' ' + flt.time,
        halfDuration: flt.windowSize,
        unit: units[flt.timeWindowUnits]
    });

    // Wrapper function to match the expected type for setFilter
    const handleSetFilter = (center: string, start: string, end: string, unit: TimeUnit, duration: number) => {
        const newFilter = {
            time: center.split(' ')[1],
            date: center.split(' ')[0],
            windowSize: duration / 2.0,
            timeWindowUnits: units.findIndex(u => u == unit)
        }
        props.SetPlot({ ...props.Plot, TimeFilter: newFilter })
    };

    return (
        <div className="row" style={{ paddingLeft: 20, paddingRight: 20, paddingTop: 20, overflowY: 'scroll', maxHeight: 'calc(100vh - 284px)' }}>
            <div className="col" style={{ width: '50%', height: "100%" }}>
                <legend className="w-auto" style={{ fontSize: 'large' }}>Plot Settings:</legend>
                <div className="row">
                    <div className="col" style={{ width: '50%'}}>
                        <Input<TrendSearch.ITrendPlot> Record={props.Plot} Label={'Plot Title'} Field={'Title'} Setter={props.SetPlot} Valid={() => true} />
                    </div>
                    <div className="col" style={{ width: '50%' }}>
                        <Input<TrendSearch.ITrendPlot> Record={props.Plot} Label={'X-Axis Label'} Field={'XAxisLabel'} Setter={props.SetPlot} Valid={() => true} />
                    </div>
                </div>
                <div className="row">
                    <div className="col" style={{ width: '50%' }}>
                        <Input<TrendSearch.ITrendPlot> Record={props.Plot} Label={'Left Axis Label'} Field={'YLeftLabel'} Setter={props.SetPlot} Valid={() => true} />
                    </div>
                    <div className="col" style={{ width: '50%' }}>
                        <Input<TrendSearch.ITrendPlot> Record={props.Plot} Label={'Right Axis Label'} Field={'YRightLabel'} Setter={props.SetPlot} Valid={() => true} />
                    </div>
                </div>
                <div className="row">
                    <div className="col" style={{ width: '50%' }}>
                        <Input<TrendSearch.ITrendPlot> Record={props.Plot} Label={'Height (%)'} Field={'Height'} Setter={props.SetPlot} Valid={validateTrendPlot} Feedback="Must be a percentage value" />
                    </div>
                    <div className="col" style={{ width: '50%' }}>
                        <Input<TrendSearch.ITrendPlot> Record={props.Plot} Label={'Width (%)'} Field={'Width'} Setter={props.SetPlot} Valid={validateTrendPlot} Feedback="Must be a percentage value" />
                    </div>
                </div>
                <div className="row">
                    <CheckBox<TrendSearch.ITrendPlot> Record={props.Plot} Label='Use Metric Abbreviation' Field='Metric' Setter={props.SetPlot} />
                </div>
                <div className="row">
                    <CheckBox<TrendSearch.ITrendPlot> Record={props.Plot} Label='Display Events' Field='ShowEvents' Setter={props.SetPlot} />
                </div>
            </div>
            <div className="col" style={{ width: '50%', height: "100%" }}>
                <legend className="w-auto" style={{ fontSize: 'large' }}>Series Plotted:</legend>
                <MultiCheckBoxSelect
                    Options={props.Plot.PlotFilter}
                    Label={''}
                    ItemTooltip={'dark'}
                    OnChange={(evt, newOptions: IMultiCheckboxOption[]) => {
                        const options: IMultiCheckboxOption[] = [];
                        props.Plot.PlotFilter.forEach(item => {
                            const selected: boolean = item.Selected != (newOptions.findIndex(option => item.Value === option.Value) > -1);
                            options.push({ ...item, Selected: selected });
                        });
                        props.SetPlot({ ...props.Plot, PlotFilter: options });
                    }}
                />
                <TimeFilter filter={convertTimeFilter(props.Plot.TimeFilter)} showQuickSelect={false}
                    setFilter={handleSetFilter} timeZone={timeZone}
                    dateTimeSetting={dateTimeSetting} isHorizontal={false} />
                <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                    <legend className="w-auto" style={{ fontSize: 'large' }}>Axis Limits:</legend>
                    <div className="row">
                        <div className="col">
                            <Select<TrendSearch.ITrendPlot> Record={props.Plot} Setter={props.SetPlot} Field='AxisZoom' Options={axisOptions} Label=''
                                EmptyOption={false} Help={"Selects range of plot."}
                            />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col" style={{ width: '50%' }}>
                            <Input<AxisLimits> Record={limits} Setter={setPlotLimits} Valid={validateLimit} Feedback={limitFeedback}
                                Label='Left Axis Lower' Field='LeftLower' Type='integer' Disabled={props.Plot.AxisZoom !== 'Manual'} />
                        </div>
                        <div className="col" style={{ width: '50%' }}>
                            <Input<AxisLimits> Record={limits} Setter={setPlotLimits} Valid={validateLimit} Feedback={limitFeedback}
                                Label='Left Axis Upper' Field='LeftUpper' Type='integer' Disabled={props.Plot.AxisZoom !== 'Manual'}/>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col" style={{ width: '50%' }}>
                            <Input<AxisLimits> Record={limits} Setter={setPlotLimits} Valid={validateLimit} Feedback={limitFeedback}
                                Label='Right Axis Lower' Field='RightLower' Type='integer' Disabled={props.Plot.AxisZoom !== 'Manual'}/>
                        </div>
                        <div className="col" style={{ width: '50%' }}>
                            <Input<AxisLimits> Record={limits} Setter={setPlotLimits} Valid={validateLimit} Feedback={limitFeedback}
                                Label='Right Axis Upper' Field='RightUpper' Type='integer' Disabled={props.Plot.AxisZoom !== 'Manual'}/>
                        </div>
                    </div>
                </fieldset>
            </div>
        </div>
    );
});

export { PlotSettingsTab };