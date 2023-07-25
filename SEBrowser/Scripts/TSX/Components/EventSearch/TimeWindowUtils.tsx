//******************************************************************************************************
//  TimeWindowUtils.tsx - Gbtc
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
//  07/11/2023 - C. Lackner
//       Generated original version of source code.
//******************************************************************************************************
import moment from 'moment';

export function momentUnit(unit: number) {
    if (unit == 7) {
        return 'y';
    } else if (unit == 6) {
        return 'M';
    } else if (unit == 5) {
        return 'w';
    } else if (unit == 4) {
        return 'd';
    } else if (unit == 3) {
        return 'h';
    } else if (unit == 2) {
        return 'm';
    } else if (unit == 1) {
        return 's';
    } 
    return 'ms';
}

export function findAppropriateUnit(startTime: moment.Moment, endTime: moment.Moment, unit?: number) {

    if (unit === undefined) 
        unit = 7;

    let diff = endTime.diff(startTime, momentUnit(unit), true);
    for (let i = unit; i >= 1; i--) {
        if (Number.isInteger(diff)) {
            return [i, diff];
        }
        diff = endTime.diff(startTime, momentUnit(i - 1), true);
        if (diff > 65000)
            return [i, Math.round(endTime.diff(startTime, momentUnit(i), true))];
    }

    return [0, Math.round(diff)];
}

export function getStartEndTime(center: moment.Moment, duration: number, unit: number): [moment.Moment, moment.Moment] {
    const d = moment.duration(duration, momentUnit(unit));
    const start = center.clone().subtract(d.asHours(), 'h');
    const end = center.clone().add(d.asHours(), 'h');
    return [start, end]
}

export function getMoment(date: string, time?: string) {
    if (time === undefined)
        return moment(date, 'MM/DD/YYYY HH:mm:ss.SSS');
    return moment(date + ' ' + time, 'MM/DD/YYYY HH:mm:ss.SSS');
}


export function readableUnit(unit: number) {
    if (unit == 7) {
        return 'Year(s)';
    } else if (unit == 6) {
        return 'Month(s)';
    } else if (unit == 5) {
        return 'Week(s)';
    } else if (unit == 4) {
        return 'Day(s)';
    } else if (unit == 3) {
        return 'Hour(s)';
    } else if (unit == 2) {
        return 'Minute(s)';
    } else if (unit == 1) {
        return 'Second(s)';
    }
    return 'Millisecond(s)';
}