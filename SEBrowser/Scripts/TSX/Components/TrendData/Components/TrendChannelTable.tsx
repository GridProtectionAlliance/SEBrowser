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
import { TrendSearch } from '../../../Global';
import { ConfigurableTable } from '@gpa-gemstone/react-interactive';
import { TrashCan } from '@gpa-gemstone/gpa-symbols';
import { Column } from '@gpa-gemstone/react-table';

type IProps = ICommon & (IMultiProps | ISingleProps);

interface ICommon {
    TrendChannels: TrendSearch.ITrendChannel[],
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
    const [trendChannels, setTrendChannels] = React.useState<TrendSearch.ITrendChannel[]>([]);
    const [sortField, setSortField] = React.useState<string>('MeterName');
    const [ascending, setAscending] = React.useState<boolean>(true);

    const [allCols, setAllCols] = React.useState<Column<TrendSearch.ITrendChannel>[]>([
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
        (channel: TrendSearch.ITrendChannel) => (
            <button type="button"
                className={'btn float-left'}
                onClick={(event) => { event.preventDefault(); event.stopPropagation(); props.RemoveChannel(channel.ID) }}>
                {TrashCan}
            </button>
        ), [props.RemoveChannel]);

    const sortCallback = React.useCallback(
        (data: { colKey: string, colField?: string, ascending: boolean }, event: any) => {
            if (data.colKey === 'undefined')
                return
            if (data.colField === sortField)
                setAscending(!ascending);
            else
                setSortField(data.colField);
        }, [ascending, sortField, setAscending, setSortField]);

    const dragFuncCallback = React.useCallback(
        (item: any, event: any) => {
            let channelsTransfered = [];
            if (props.Type === 'single' || !props.SelectedSet.has(item.row.ID)) channelsTransfered.push(props.TrendChannels.find(channel => channel.ID === item.row.ID));
            else channelsTransfered = props.TrendChannels.filter(channel => props.SelectedSet.has(channel.ID));
            event.dataTransfer.setData("text/plain", JSON.stringify(channelsTransfered));
        }, [props.Type, props.Type === 'single' ? props.Selected : props.SelectedSet, props.TrendChannels]);

    React.useEffect(() => {
        const newCols: Column<TrendSearch.ITrendChannel>[] = [...allCols];
        const index: number = newCols.findIndex((col) => col.key === "RemoveChannel");
        if (props.RemoveChannel !== undefined) {
            const newCol: Column<TrendSearch.ITrendChannel> = { key: "RemoveChannel", field: "ID", label: "", rowStyle: { width: "50px" }, headerStyle: { width: "50px" }, content: removeButton };
            if (index > -1)
                newCols.splice(index, 1, newCol);
            else
                newCols.push(newCol);
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

    return (
        <ConfigurableTable<TrendSearch.ITrendChannel>
            defaultColumns={["Name", "MeterName", "Description", "Phase", (props.RemoveChannel !== undefined ? "RemoveChannel" : "ChannelGroup")]}
            requiredColumns={["Name", "Phase", (props.RemoveChannel !== undefined ? "RemoveChannel" : "ChannelGroup")]}
            cols={allCols}
            data={trendChannels}
            sortKey={sortField}
            ascending={ascending}
            onSort={sortCallback}
            onDragStart={props.EnableDragDrop ? dragFuncCallback : undefined}
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
                        // Handle the unselect case
                        if (!event.shiftKey && props.SelectedSet.has(item.row.ID)) newIds.delete(item.row.ID);
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