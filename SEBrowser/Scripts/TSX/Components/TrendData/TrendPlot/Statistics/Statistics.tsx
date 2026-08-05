//******************************************************************************************************
//  Statistics.tsx - Gbtc
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
import React from 'react';
import { Application } from '@gpa-gemstone/application-typings';
import { ReactIcons } from '@gpa-gemstone/gpa-symbols';
import { Button } from '@gpa-gemstone/react-graph';
import { ToolTip } from '@gpa-gemstone/react-forms';
import { LoadingIcon } from '@gpa-gemstone/react-interactive';
import { Column, Table } from '@gpa-gemstone/react-table';
import { orderBy } from 'lodash';
import { TrendSearch } from '../../../../global';
import GraphError from '../GraphError';
import { ITrendWidgetProps } from '../TrendWidgetRegistry';
import { parseTrendDataResponse, requestTrendData } from '../../Utils/TrendDataRequest';
import { buildStatisticsRows, getChannelTag, IStatisticsRow, statisticSeriesTypes } from './StatisticsData';

type StatisticsSortKey = Exclude<keyof IStatisticsRow, 'Key'>;

const numericColumns: { Field: Exclude<StatisticsSortKey, 'Statistic'>, Label: string }[] = [
    { Field: 'Min', Label: 'Min' },
    { Field: 'CP005', Label: 'CP00.5' },
    { Field: 'CP01', Label: 'CP01' },
    { Field: 'CP05', Label: 'CP05' },
    { Field: 'CP25', Label: 'CP25' },
    { Field: 'Avg', Label: 'Avg' },
    { Field: 'CP50', Label: 'CP50' },
    { Field: 'CP75', Label: 'CP75' },
    { Field: 'CP95', Label: 'CP95' },
    { Field: 'CP99', Label: 'CP99' },
    { Field: 'CP995', Label: 'CP99.5' },
    { Field: 'Max', Label: 'Max' },
    { Field: 'Count', Label: 'Count' },
    { Field: 'StdDev', Label: 'Std Dev' }
];

const statisticColumnWidth = 150;
const numericColumnWidth = 100;

const tableMinimumWidth = statisticColumnWidth + numericColumnWidth * numericColumns.length;

/** Displays summary statistics for each selected minimum, average, and maximum channel series. */
const Statistics = React.memo((props: ITrendWidgetProps) => {
    const [points, setPoints] = React.useState<TrendSearch.IPQData[]>([]);
    const [status, setStatus] = React.useState<Application.Types.Status>('uninitiated');
    const [sortKey, setSortKey] = React.useState<StatisticsSortKey>('Statistic');
    const [ascending, setAscending] = React.useState<boolean>(true);
    const [hover, setHover] = React.useState<boolean>(false);
    const channelIDs = Array.from(new Set((props.ChannelInfo ?? []).map(info => info?.Channel?.ChannelID).filter(isChannelID))).sort((left, right) => left - right);
    const channelKey = channelIDs.join(',');
    const rows = React.useMemo(() => buildStatisticsRows(points, props.ChannelInfo, props.PlotFilter), [points, props.ChannelInfo, props.PlotFilter]);
    const sortedRows = React.useMemo(() => sortRows(rows, sortKey, ascending), [rows, sortKey, ascending]);
    const hasMissingData = status === 'idle' && rows.some(row => row.Count === 0);

    React.useEffect(() => {
        if (props.TimeFilter == null || channelKey.length === 0) {
            setPoints([]);
            setStatus('idle');
            return;
        }

        setPoints([]);
        setStatus('loading');
        const handle = requestTrendData(channelIDs, props.TimeFilter).done((response: string) => {
            const responsePoints = parseTrendDataResponse(response);
            setPoints(responsePoints);
            props.SetChannelInfo((props.ChannelInfo ?? []).map(channel => {
                const tag = getChannelTag(channel?.Channel?.ChannelID);
                const channelPoints = tag == null ? [] : responsePoints.filter(point => typeof point?.Tag === 'string' && point.Tag.toLowerCase() === tag);
                const settings = { ...(channel.Settings ?? {}) } as TrendSearch.ILineSeriesSettings;
                statisticSeriesTypes.forEach(type => {
                    if (settings[type] != null)
                        settings[type] = { ...settings[type], HasData: channelPoints.some(point => Number.isFinite(point[type])) };
                });
                return { ...channel, Settings: settings };
            }));
            setStatus('idle');
        }).fail((_request, requestStatus) => {
            if (requestStatus !== 'abort') setStatus('error');
        });
        return () => handle.abort();
    }, [channelKey, props.TimeFilter]);

    if (status === 'error')
        return <GraphError Height={props.Height} Title={props.Title}>{props.Controls}</GraphError>;

    return (
        <div className="row d-flex flex-column flex-nowrap position-relative" style={{ height: props.Height, minHeight: 0 }}>
            <LoadingIcon Show={status === 'loading' || status === 'uninitiated'} Size={29} />
            <div className="row no-gutters align-items-center flex-nowrap" style={{ flex: '0 0 auto' }}>
                <div className="col-3" />
                <h4 className="col-6 text-center mb-0" style={{ marginTop: 0 }}>
                    {props.Title ?? ''}
                    {hasMissingData ?
                        <span data-tooltip={props.ID} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
                            <ReactIcons.Warning Color="var(--warning)" />
                        </span>
                        : null}
                </h4>
                <div className="col-3 d-flex justify-content-end" style={{ marginRight: 5 }} data-html2canvas-ignore="true">
                    {React.Children.map(props.Controls, element => {
                        if (!React.isValidElement(element) || (element as React.ReactElement<unknown>).type !== Button) return null;
                        return (
                            <button type="button" className="btn"
                                onClick={() => element.props?.onClick?.()}>
                                {element}
                            </button>
                        );
                    })}
                </div>
            </div>
            <div className="d-flex flex-column" style={{ flex: 1, width: '100%', minHeight: 0, overflow: 'auto' }}>
                <Table<IStatisticsRow>
                    Data={sortedRows}
                    SortKey={sortKey}
                    Ascending={ascending}
                    OnSort={({ colField }) => {
                        if (colField == null || colField === 'Key') return;
                        if (colField === sortKey)
                            setAscending(current => !current);
                        else {
                            setSortKey(colField);
                            setAscending(true);
                        }
                    }}
                    KeySelector={row => row.Key}
                    TableClass="table table-hover"
                    TableStyle={{ flex: 'none', height: 'auto', width: tableMinimumWidth, overflow: 'visible' }}
                    TheadStyle={{ position: 'sticky', top: 0, zIndex: 1, backgroundColor: 'Canvas' }}
                    TbodyStyle={{ flex: 'none', overflow: 'visible' }}
                >
                    <Column<IStatisticsRow>
                        Key="Statistic"
                        Field="Statistic"
                    >
                        Statistic
                    </Column>
                    {numericColumns.map(column =>
                        <Column<IStatisticsRow>
                            key={column.Field}
                            Key={column.Field}
                            Field={column.Field}
                            Content={({ item }) => formatValue(item[column.Field])}
                        >
                            {column.Label}
                        </Column>
                    )}
                </Table>
            </div>
            <ToolTip Show={hover} Position="bottom" Target={props.ID}>Some selected Statistics have no finite data for the selected Time Window.</ToolTip>
        </div>
    );
});

const isChannelID = (channelID?: number): channelID is number => channelID != null && Number.isFinite(channelID);

const formatValue = (value: number | null): string => value == null ? '—' : value.toLocaleString(undefined, { maximumFractionDigits: 3 });

const sortRows = (rows: IStatisticsRow[], sortKey: StatisticsSortKey, ascending: boolean): IStatisticsRow[] =>
    orderBy(rows, [row => row[sortKey] == null, sortKey], ['asc', ascending ? 'asc' : 'desc']);

export { Statistics };
