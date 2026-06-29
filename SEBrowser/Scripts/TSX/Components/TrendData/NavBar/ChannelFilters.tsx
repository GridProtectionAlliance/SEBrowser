//******************************************************************************************************
//  TrendDataNavbar.tsx - Gbtc
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
import _ from 'lodash';
import { IMultiCheckboxOption } from '../../../global';
import { Application, SystemCenter } from '@gpa-gemstone/application-typings';
import { MultiCheckBoxSelect } from '@gpa-gemstone/react-forms';
import NavbarFilterButton from '../../Common/NavbarFilterButton';
import { FilterType, IKeyValuePair, ITrendDataFilter } from './Types';
import { ReactIcons } from '@gpa-gemstone/gpa-symbols';

interface IProps {
    LinePlot: IMultiCheckboxOption[],
    SetLinePlotOptions: (options: IMultiCheckboxOption[]) => void,
    SetShowFilter: (filterType: FilterType) => void,
    SetTrendFilter: React.Dispatch<React.SetStateAction<ITrendDataFilter | null>>,
    TrendFilter: ITrendDataFilter | null,
    PhaseStatus: Application.Types.Status,
    PhaseOptions: IMultiCheckboxOption[],
    SetPhaseOptions: (options: IMultiCheckboxOption[]) => void,
    ChannelGroupStatus: Application.Types.Status,
    ChannelGroupOptions: IMultiCheckboxOption[],
    SetChannelGroupOptions: (options: IMultiCheckboxOption[]) => void
}

const TrendChannelFilters = (props: IProps) => {
    const { MeterList, AssetList } = props.TrendFilter ?? { MeterList: [], AssetList: [] };

    function multiCheckboxUpdate(filterField: keyof ITrendDataFilter, newOptions: IMultiCheckboxOption[], oldOptions: IMultiCheckboxOption[], setOptions: (options: IMultiCheckboxOption[]) => void) {
        const options: IMultiCheckboxOption[] = [];
        const pairs: IKeyValuePair[] = [];
        oldOptions.forEach(item => {
            const selected: boolean = item.Selected != (newOptions.findIndex(option => item.Value === option.Value) > -1);
            options.push({ ...item, Selected: selected });
            pairs.push({ [item.Value]: selected });
        });
        setOptions(options);
        props.SetTrendFilter(prev => prev != null ? ({ ...prev, [filterField]: pairs }) : null);
    }

    return (
        <fieldset className="border" style={{ padding: '10px' }}>
            <legend className="w-auto" style={{ fontSize: 'large' }}>
                Channel Filters:
            </legend>
            <div className="row">
                <div className='col'>
                    <NavbarFilterButton<SystemCenter.Types.DetailedMeter>
                        Type={'Meter'}
                        OnClick={() => props.SetShowFilter('Meter')}
                        Data={MeterList}
                        AlternateColors={{ normal: "#3840B5", selected: "#FF9B4B" }}
                    />
                </div>
            </div>
            <div className="row">
                <div className='col'>
                    <NavbarFilterButton<SystemCenter.Types.DetailedAsset>
                        Type={'Asset'}
                        OnClick={() => props.SetShowFilter('Asset')}
                        Data={AssetList}
                    />
                </div>
            </div>
            <label style={{ width: '100%', position: 'relative', float: "left" }}>
                Phase:
            </label>
            <div className="row">
                <div className="col">
                    {props.PhaseStatus === 'loading' ?
                        <div className='d-flex align-items-center flex-column justify-content-center'>
                            <ReactIcons.SpiningIcon />
                        </div>
                        :
                        <MultiCheckBoxSelect
                            Options={props.PhaseOptions}
                            Label={''}
                            OnChange={(evt, Options: IMultiCheckboxOption[]) => multiCheckboxUpdate("Phases", Options, props.PhaseOptions, props.SetPhaseOptions)}
                        />
                    }
                </div>
            </div>
            <label style={{ width: '100%', position: 'relative', float: "left" }}>
                Channel Group:
            </label>
            <div className="row">
                <div className="col">
                    {props.ChannelGroupStatus === 'loading' ?
                        <div className='d-flex align-items-center flex-column justify-content-center'>
                            <ReactIcons.SpiningIcon />
                        </div>
                        :
                        <MultiCheckBoxSelect
                            Options={props.ChannelGroupOptions}
                            Label={''}
                            OnChange={(evt, Options: IMultiCheckboxOption[]) => multiCheckboxUpdate("ChannelGroups", Options, props.ChannelGroupOptions, props.SetChannelGroupOptions)}
                        />
                    }
                </div>
            </div>
            <label style={{ width: '100%', position: 'relative', float: "left" }}>
                Series Plotted:
            </label>
            <div className="row">
                <div className="col">
                    <MultiCheckBoxSelect
                        Options={props.LinePlot}
                        Label={''}
                        OnChange={(evt, newOptions: IMultiCheckboxOption[]) => {
                            const options: IMultiCheckboxOption[] = [];
                            props.LinePlot.forEach(item => {
                                const selected: boolean = item.Selected != (newOptions.findIndex(option => item.Value === option.Value) > -1);
                                options.push({ ...item, Selected: selected });
                            })
                            props.SetLinePlotOptions(options);
                        }}
                    />
                </div>
            </div>
        </fieldset>
    );
};

export default TrendChannelFilters;
