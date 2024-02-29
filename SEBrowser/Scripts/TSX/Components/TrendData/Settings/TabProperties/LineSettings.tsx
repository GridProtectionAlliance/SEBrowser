//******************************************************************************************************
//  ChannelTab.tsx - Gbtc
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
//  09/19/23 - Gabriel Santos
//       Generated original version of source code.
//
//******************************************************************************************************
import React from 'react';
import { BlockPicker } from 'react-color';
import { Input, Select } from '@gpa-gemstone/react-forms';
import { LineTypeOptions, AxisOptions } from '../SettingsModal';
import { TrendSearch } from '../../../../Global';

interface ILineProps {
    // Assumption that this doesnt change outside of this overlay
    SeriesSettings: TrendSearch.ILineSeries,
    SetSeriesSettings: (newSettings: TrendSearch.ILineSeries) => void,
    Series: 'Min' | 'Max' | 'Avg'
}

const LineSettings = React.memo((props: ILineProps) => {
    const [series, setSeries] = React.useState<TrendSearch.ILineSettings>(undefined);

    const setter = React.useCallback((record: TrendSearch.ILineSettings) => {
        setSeries(record);
        const newSettings = { ...props.SeriesSettings };
        newSettings[props.Series] = record;
        props.SetSeriesSettings(newSettings);
    }, [setSeries, props]);

    React.useEffect(() => {
        setSeries(props.SeriesSettings[props.Series]);
    }, [props.SeriesSettings, props.Series]);

    // No data = return null
    if (series === undefined || !series.HasData) return null;

    return (
        <div className="col" style={{ width: 'auto' }}>
            <h4>{(props.Series === 'Avg' && !props.SeriesSettings['Min']?.HasData && !props.SeriesSettings['Max']?.HasData) ? 'Values' : props.Series} Settings</h4>
            <BlockPicker onChangeComplete={(color) => setter({ ...series, Color: color.hex })} color={series['Color']} triangle={"hide"} />
            <Input<TrendSearch.ILineSettings> Record={series} Label={'Legend Label'} Field={'Label'} Setter={setter} Valid={() => true} />
            <Input<TrendSearch.ILineSettings> Record={series} Label={'Line Width (pixels)'} Field={'Width'} Setter={setter} Type={'number'}
                Feedback={"Width must be a positive number"} Valid={() => {
                    return series['Width'] > 0;
                }} />
            <Select<TrendSearch.ILineSettings> Record={series} Label={'Line Style'} Field={'Type'} Setter={setter} Options={LineTypeOptions} />
            <Select<TrendSearch.ILineSettings> Record={series} Label={'Axis'} Field={'Axis'} Setter={setter} Options={AxisOptions} />
        </div>
    );
});

export { LineSettings };