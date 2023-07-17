//******************************************************************************************************
//  TrendChannelTable.tsx - Gbtc
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
//  05/30/23 - Gabriel Santos
//       Generated original version of source code.
//
//******************************************************************************************************
import React from 'react';
import _ from 'lodash';
import { SEBrowser } from '../../Global';
import { ConfigurableTable } from '@gpa-gemstone/react-interactive';
import { TrashCan } from '@gpa-gemstone/gpa-symbols';
import { Column } from '@gpa-gemstone/react-table';

type IProps = ICommon & (IMultiProps | ISingleProps);

interface ICommon {
    TrendChannels: SEBrowser.ITrendChannel[],
    RemoveChannel?: (id: number) => void,
    EnableDragDrop?: boolean,
    Height: number
}

interface IMultiProps {
    Type: 'multi',
    SelectedSet: Set<number>,
    SetSelectedSet: (set: Set<number>) => void
}

interface ISingleProps {
    Type: 'single',
    Selected: number,
    SetSelected: (id: number) => void
}

const TrendChannelTable = (props: IProps) => {
    const [trendChannels, setTrendChannels] = React.useState<SEBrowser.ITrendChannel[]>([]);
    const [sortField, setSortField] = React.useState<string>('MeterName');
    const [ascending, setAscending] = React.useState<boolean>(true);

    const [allCols, setAllCols] =  React.useState<Column<SEBrowser.ITrendChannel>[]>([
        { key: "Name", field: "Name", label: "Name" },
        { key: "Description", field: "Description", label: "Description" },
        { key: "AssetKey", field: "AssetKey", label: "Asset Key" },
        { key: "AssetName", field: "AssetName", label: "Asset Name" },
        { key: "MeterKey", field: "MeterKey", label: "Meter Key" },
        { key: "MeterName", field: "MeterName", label: "Meter Name" },
        { key: "Phase", field: "Phase", label: "Phase" },
        { key: "ChannelGroup", field: "ChannelGroup", label: "Channel Group" },
        { key: "ChannelGroupType", field: "ChannelGroupType", label: "Channel Group Type" },
    ]);

    const removeButton = React.useCallback(
        (channel: SEBrowser.ITrendChannel) => (
            <button type="button"
                className={'btn float-left'}
                onClick={(event) => { event.preventDefault(); event.stopPropagation(); props.RemoveChannel(channel.ID) }}>
                {TrashCan}
            </button>
        ), [props.RemoveChannel]);

    React.useEffect(() => {
        const newCols: Column<SEBrowser.ITrendChannel>[] = [...allCols];
        const index: number = newCols.findIndex((col) => col.key === "RemoveChannel");
        if (props.RemoveChannel !== undefined && index === -1) {
            newCols.push({ key: "RemoveChannel", field: "ID", label: "", rowStyle: { width: "50px" }, headerStyle: { width: "50px" }, content: removeButton });
            setAllCols(newCols);
        }
        else if (props.RemoveChannel === undefined && index > -1) {
            newCols.splice(index, 1);
            setAllCols(newCols);
        }
    }, [props.RemoveChannel]);

    React.useEffect(() => {
        setTrendChannels(_.orderBy(props.TrendChannels, sortField, (ascending ? 'asc' : 'desc')));
    }, [props.TrendChannels, sortField, ascending]);

    const sortCallback = React.useCallback(
        (data: { colKey: string, colField?: string, ascending: boolean }, event: any) => {
            if (data.colKey === 'undefined')
                return
            if (data.colField === sortField)
                setAscending(!ascending);
            else
                setSortField(data.colField);
        }, [ascending]);

    let onDragStartFunc = undefined;
    if (props.EnableDragDrop ?? false)
        onDragStartFunc = (item: any, event: any) => {
            let allKeys = "";
            if (props.Type === 'single')
                allKeys = item.row.ID;
            else {
                if (props.SelectedSet.size === 0) {
                    allKeys = item.row.ID;
                } else {
                    props.SelectedSet.forEach((key) => allKeys += `,${key}`);
                    if (!props.SelectedSet.has(item.row.ID))
                        allKeys = item.row.ID + allKeys;
                    else
                        allKeys = allKeys.slice(1);
                }
            }
            const channelsTransfered = props.TrendChannels.filter((channel) => props.Type === 'single' ? (channel.ID === props.Selected) : props.SelectedSet.has(channel.ID));
            event.dataTransfer.setData("text/plain", JSON.stringify(channelsTransfered));
        };

    return (
        <ConfigurableTable<SEBrowser.ITrendChannel>
            defaultColumns={["Name", "MeterName", "Description", "Phase", (props.RemoveChannel !== undefined ? "RemoveChannel" : "ChannelGroup")]}
            requiredColumns={["Name", "Phase", (props.RemoveChannel !== undefined ? "RemoveChannel" : "ChannelGroup")]}
            cols={allCols}
            data={trendChannels}
            sortKey={sortField}
            ascending={ascending}
            onSort={sortCallback}
            onDragStart={onDragStartFunc}
            onClick={(item, event) => {
                event.preventDefault();
                // Handling on single selected case
                if (props.Type === "single") props.SetSelected(item.row.ID);
                // Handling the multi case
                else {
                    const newIds: Set<number> = new Set();
                    if (event.shiftKey) {
                        const clickIndex: number = trendChannels.findIndex(chan => chan.ID === item.row.ID);
                        const firstSelectedIndex: number = trendChannels.findIndex(chan => props.SelectedSet.has(chan.ID));
                        if (firstSelectedIndex >= 0) {
                            const lowerIndex: number = clickIndex < firstSelectedIndex ? clickIndex : firstSelectedIndex;
                            const upperIndex: number = clickIndex > firstSelectedIndex ? clickIndex : firstSelectedIndex;
                            for (let index: number = lowerIndex; index <= upperIndex; index++) {
                                newIds.add(trendChannels[index].ID);
                            }
                        }
                    } else
                        newIds.add(item.row.ID);

                    // Changing the added values based on held ctrl key
                    if (event.ctrlKey) {
                        props.SelectedSet.forEach(id => newIds.add(id));
                    }
                    props.SetSelectedSet(newIds);
                }
            }}
            selected={(item) => props.Type === 'multi' ? props.SelectedSet.has(item.ID) : props.Selected === item.ID}
            theadStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
            tbodyStyle={{ display: 'block', overflowY: 'scroll', height: props.Height - 30, userSelect: 'none'}}
            rowStyle={{ display: 'table', tableLayout: 'fixed', width: 'calc(100%)' }}
        />);
}

export default TrendChannelTable;