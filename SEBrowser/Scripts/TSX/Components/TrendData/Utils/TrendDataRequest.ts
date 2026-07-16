//******************************************************************************************************
//  TrendDataRequest.ts - Gbtc
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
//  Unless agreed to in writing, software distributed under the License is distributed on an "AS-IS"
//  BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. Refer to the License
//  for the specific language governing permissions and limitations.
//
//  Code Modification History:
//  ----------------------------------------------------------------------------------------------------
//  07/16/26 - Preston Crawford
//       Generated original version of source code.
//
//******************************************************************************************************
import moment from 'moment';
import { SEBrowser, TrendSearch } from '../../../global';
import { formatWindowUnit } from './HelperFunctions';
import { serverFormat, timeFilterFormat } from './Constants';

/** Requests raw HIDS points for the selected channels and report time window. */
export const requestTrendData = (channels: number[], timeFilter: SEBrowser.IReportTimeFilter): JQuery.jqXHR<string> => {
    const centerTime = moment(timeFilter.date + timeFilter.time, timeFilterFormat);
    const unit = formatWindowUnit(timeFilter.timeWindowUnits);
    const startTime = centerTime.clone().add(-timeFilter.windowSize, unit).format(serverFormat);
    const endTime = centerTime.clone().add(timeFilter.windowSize, unit).format(serverFormat);

    return $.ajax({
        type: "POST",
        url: `${homePath}api/OpenXDA/GetLineChartData`,
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({ Channels: channels, StartTime: startTime, StopTime: endTime }),
        dataType: 'text',
        cache: false,
        async: true
    });
};

/** Parses the newline-delimited JSON returned by the HIDS line-chart endpoint. */
export const parseTrendDataResponse = (response?: string | null): TrendSearch.IPQData[] => {
    if (typeof response !== 'string' || response.length === 0) return [];
    const points: TrendSearch.IPQData[] = [];
    response.split("\n").forEach(jsonPoint => {
        if (jsonPoint.trim().length === 0) return;
        try {
            const point = JSON.parse(jsonPoint);
            if (point != null && typeof point === 'object') points.push(point);
        } catch {
            console.error("Failed to parse point: " + jsonPoint);
        }
    });
    return points;
};
