//******************************************************************************************************
//  LineGraphCsv.ts - Gbtc
//
//  Copyright © 2026, Grid Protection Alliance.  All Rights Reserved.
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
//******************************************************************************************************

import _ from 'lodash';
import { CsvRow } from './TrendCsv';

export interface IExportSeries {
    Label: string,
    Data: [number, number][]
}

/** Builds CSV rows from the line series currently displayed by the plot. */
export function buildLineGraphCsvRows(series: IExportSeries[]): CsvRow[] {
    const valueMaps = series.map(item => {
        const values = new Map<number, number>();
        item.Data.forEach(([timestamp, value]) => {
            if (Number.isFinite(timestamp))
                values.set(timestamp, value);
        });
        return values;
    });
    const timestamps = _.sortBy(Array.from(new Set(valueMaps.flatMap(values => Array.from(values.keys())))));
    return [
        ['Timestamp', ...series.map(item => item.Label)],
        ...timestamps.map(timestamp => [
            new Date(timestamp).toISOString(),
            ...valueMaps.map(values => {
                const value = values.get(timestamp);
                return value != null && Number.isFinite(value) ? value.toString() : '';
            })
        ])
    ];
}
