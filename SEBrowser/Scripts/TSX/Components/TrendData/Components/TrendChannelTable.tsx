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
import { ConfigTable } from '@gpa-gemstone/react-interactive';
import { TrashCan } from '@gpa-gemstone/gpa-symbols';
import { ReactTable } from '@gpa-gemstone/react-table';

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


const colList = ["Description", "Asset Key", "Asset Name", "Meter Key", "Meter Name", "Channel Group", "Channel Group Type"];
const defaultCols = new Set(["Meter Name", "Description"]);

const TrendChannelTable = (props: IProps) => {
    const [trendChannels, setTrendChannels] = React.useState<TrendSearch.ITrendChannel[]>([]);
    const [sortField, setSortField] = React.useState<string>('MeterName');
    const [ascending, setAscending] = React.useState<boolean>(true);

    const removeButton = React.useCallback(
        (data: { item: TrendSearch.ITrendChannel }) => (
            <button type="button"
                className={'btn float-left'}
                onClick={(event) => { event.preventDefault(); event.stopPropagation(); props.RemoveChannel(data.item.ID) }}>
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
        setTrendChannels(_.orderBy(props.TrendChannels, sortField, (ascending ? 'asc' : 'desc')));
    }, [props.TrendChannels, sortField, ascending]);

    return (
        <ConfigTable.Table<TrendSearch.ITrendChannel>
            Data={trendChannels}
            SortKey={sortField}
            Ascending={ascending}
            OnSort={sortCallback}
            OnDragStart={props.EnableDragDrop ? dragFuncCallback : undefined}
            KeySelector={(item) => item.ID}
            OnClick={(item, event) => {
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
            Selected={(item) => props.Type === 'multi' ? props.SelectedSet.has(item.ID) : props.Selected === item.ID}
            TheadStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
            TbodyStyle={{ display: 'block', overflowY: 'scroll', height: props.Height - 45, userSelect: 'none'}}
            RowStyle={{ display: 'table', tableLayout: 'fixed', width: 'calc(100%)' }}
            TableClass="table table-hover"
            TableStyle={{ marginBottom: 0 }}>
            <ReactTable.AdjustableCol<TrendSearch.ITrendChannel>
                Key={'Name'}
                AllowSort={true}
                Field={'Name'}
            >Channel Name</ReactTable.AdjustableCol>
            <ReactTable.AdjustableCol<TrendSearch.ITrendChannel>
                Key={'Phase'}
                AllowSort={true}
                Field={'Phase'}
            />
            {colList.map(name =>
                <ConfigTable.Configurable Key={name} Label={name} Default={defaultCols.has(name)}>
                    <ReactTable.AdjustableCol<TrendSearch.ITrendChannel>
                        Key={name}
                        AllowSort={true}
                        Field={name.replace(/\s/, "") as keyof TrendSearch.ITrendChannel}
                    >{name}</ReactTable.AdjustableCol>
                </ConfigTable.Configurable>)
            }
            {props.RemoveChannel !== undefined ?
                <ReactTable.Column<TrendSearch.ITrendChannel>
                    Key={'RemoveChannel'}
                    AllowSort={false}
                    Field={'ID'}
                    RowStyle={{ width: "50px" }}
                    HeaderStyle={{ width: "50px" }}
                    Content={removeButton}
                > </ReactTable.Column>: null}
        </ConfigTable.Table>);
}

export default TrendChannelTable;