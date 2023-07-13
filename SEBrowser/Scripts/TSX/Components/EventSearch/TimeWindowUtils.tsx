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
    if (unit === 7) {
        return 'y';
    } else if (unit === 6) {
        return 'M';
    } else if (unit === 5) {
        return 'w';
    } else if (unit === 4) {
        return 'd';
    } else if (unit === 3) {
        return 'h';
    } else if (unit === 2) {
        return 'm';
    } else if (unit === 1) {
        return 's';
    } 
    return 'ms';
}

export function findAppropriateUnit(startTime: moment.Moment, endTime: moment.Moment, unit?: number) {

    if (unit === undefined) 
        unit = 7;

    for (let i = unit; i >= 1; i--) {
        const diff = endTime.diff(startTime, momentUnit(i));

        if (Number.isInteger(diff)) {
            return [i, diff];
        }
    }

    return [0, endTime.diff(startTime, momentUnit(0))];
}

export function getStartEndTime(center: moment.Moment, duration: number, unit: number): [moment.Moment, moment.Moment] {
    const start = center.clone().subtract(duration, momentUnit(unit));
    const end = center.clone().add(duration, momentUnit(unit));
    return [start, end]
}

export function getMoment(date: string, time?: string) {
    if (time === undefined)
        return moment(date, 'MM/DD/YYYY HH:mm:ss.SSS');
    return moment(date + ' ' + time, 'MM/DD/YYYY HH:mm:ss.SSS');
}
