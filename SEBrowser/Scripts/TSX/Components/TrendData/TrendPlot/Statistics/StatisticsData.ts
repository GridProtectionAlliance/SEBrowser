//******************************************************************************************************
//  StatisticsData.ts - Gbtc
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
//  07/31/26 - Preston Crawford
//       Generated original version of source code.
//
//******************************************************************************************************
import type { IMultiCheckboxOption, TrendSearch } from '../../../../global';

export const statisticSeriesTypes = ['Minimum', 'Average', 'Maximum'] as const;

export interface IStatisticsRow {
    Key: string,
    Statistic: string,
    Min: number | null,
    CP005: number | null,
    CP01: number | null,
    CP05: number | null,
    CP25: number | null,
    Avg: number | null,
    CP50: number | null,
    CP75: number | null,
    CP95: number | null,
    CP99: number | null,
    CP995: number | null,
    Max: number | null,
    Count: number,
    StdDev: number | null
}

type StatisticsValues = Omit<IStatisticsRow, 'Key' | 'Statistic'>;

/** Calculates summary statistics from finite values only. */
export const calculateStatistics = (values: number[]): StatisticsValues => {
    const sortedValues = values.filter(Number.isFinite).sort((left, right) => left - right);
    const count = sortedValues.length;
    if (count === 0)
        return emptyStatistics;

    const average = sortedValues.reduce((sum, value) => sum + value, 0) / count;
    const standardDeviation = count === 1 ? null : Math.sqrt(
        sortedValues.reduce((sum, value) => sum + Math.pow(value - average, 2), 0) / (count - 1)
    );

    return {
        Min: sortedValues[0],
        CP005: percentile(sortedValues, 0.005),
        CP01: percentile(sortedValues, 0.01),
        CP05: percentile(sortedValues, 0.05),
        CP25: percentile(sortedValues, 0.25),
        Avg: average,
        CP50: percentile(sortedValues, 0.5),
        CP75: percentile(sortedValues, 0.75),
        CP95: percentile(sortedValues, 0.95),
        CP99: percentile(sortedValues, 0.99),
        CP995: percentile(sortedValues, 0.995),
        Max: sortedValues[count - 1],
        Count: count,
        StdDev: standardDeviation
    };
};

/** Builds one isolated row for every selected channel and minimum/average/maximum series. */
export const buildStatisticsRows = (points?: TrendSearch.IPQData[] | null, channelInfo?: TrendSearch.ISeriesSettings[] | null,
    plotFilter?: IMultiCheckboxOption[] | null): IStatisticsRow[] => {
    const pointsByTag = new Map<string, TrendSearch.IPQData[]>();
    (points ?? []).forEach(point => {
        if (typeof point?.Tag !== 'string') return;
        const tag = point.Tag.toLowerCase();
        const tagPoints = pointsByTag.get(tag);
        if (tagPoints == null)
            pointsByTag.set(tag, [point]);
        else
            tagPoints.push(point);
    });

    const selectedSeries = statisticSeriesTypes.filter(type => plotFilter?.find(option => option?.Value === type)?.Selected ?? true);
    return (channelInfo ?? []).flatMap(channel => {
        if (channel?.Channel == null) return [];
        const tag = getChannelTag(channel.Channel.ChannelID);
        const channelPoints = tag == null ? [] : pointsByTag.get(tag) ?? [];
        const settings = channel.Settings as TrendSearch.ILineSeriesSettings | null | undefined;
        return selectedSeries.map(type => ({
            Key: `${channel.Channel.ID}_${type}`,
            Statistic: settings?.[type]?.Label ?? type,
            ...calculateStatistics(channelPoints.map(point => point[type]))
        }));
    });
};

/** Returns the lower-case, eight-character HIDS tag for a channel ID. */
export const getChannelTag = (channelID?: number): string | null => {
    if (channelID == null || !Number.isFinite(channelID)) return null;
    return channelID.toString(16).padStart(8, '0').toLowerCase();
};

const percentile = (sortedValues: number[], probability: number): number => {
    const index = (sortedValues.length - 1) * probability;
    const lowerIndex = Math.floor(index);
    const upperIndex = Math.ceil(index);
    if (lowerIndex === upperIndex) return sortedValues[lowerIndex];
    return sortedValues[lowerIndex] + (sortedValues[upperIndex] - sortedValues[lowerIndex]) * (index - lowerIndex);
};

const emptyStatistics: StatisticsValues = {
    Min: null,
    CP005: null,
    CP01: null,
    CP05: null,
    CP25: null,
    Avg: null,
    CP50: null,
    CP75: null,
    CP95: null,
    CP99: null,
    CP995: null,
    Max: null,
    Count: 0,
    StdDev: null
};
