//******************************************************************************************************
//  ReportTimeFilter.tsx - Gbtc
//
//  Copyright © 2020, Grid Protection Alliance.  All Rights Reserved.
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
//  09/16/2021 - Christoph Lackner
//       Generated original version of source code.Co
//******************************************************************************************************
/*
import * as React from 'react';
import { SEBrowser } from '../global';
import { useSelector } from 'react-redux';
import { SelectTimeZone, SelectDateTimeSetting } from './SettingsSlice';
import { TimeFilter } from '@gpa-gemstone/common-pages'


interface IProps {
    filter: SEBrowser.IReportTimeFilter;
    setFilter: (filter: SEBrowser.IReportTimeFilter) => void,
    showQuickSelect: boolean;
    isHorizontal: boolean;
}

export type TimeUnit = 'y' | 'M' | 'w' | 'd' | 'h' | 'm' | 's' | 'ms'
export const units = ['ms', 's', 'm', 'h', 'd', 'w', 'M', 'y'] as TimeUnit[]

export const momentDateFormat = "MM/DD/YYYY";
export const momentTimeFormat = "HH:mm:ss.SSS"; // Also is the gemstone format


const SETimeFilter = (props: IProps) => {
    const timeZone = useSelector(SelectTimeZone);
    const dateTimeSetting = useSelector(SelectDateTimeSetting);


    // converts the SEBrowser filter to ICenterDuration filter
    const convertTimeFilter = (flt: SEBrowser.IReportTimeFilter) => ({
        center: flt.date + ' ' + flt.time,
        halfDuration: flt.windowSize,
        unit: units[flt.timeWindowUnits]
    });

    // Wrapper function to match the expected type for setFilter
    const handleSetFilter = (center: string, start: string, end: string, unit: TimeUnit, duration: number) => {
        props.setFilter({
            time: center.split(' ')[1],
            date: center.split(' ')[0],
            windowSize: duration / 2.0,
            timeWindowUnits: units.findIndex(u => u == unit)
        });
    };

    return (
        <TimeFilter filter={convertTimeFilter(props.filter)} setFilter={handleSetFilter} showQuickSelect={true} dateTimeSetting={dateTimeSetting} timeZone={timeZone} isHorizontal={false} />
    );

}
export default SETimeFilter;*/