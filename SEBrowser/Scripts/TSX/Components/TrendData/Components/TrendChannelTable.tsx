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
import { ReactIcons } from '@gpa-gemstone/gpa-symbols';
import { ConfigurableTable, Column, ConfigurableColumn } from '@gpa-gemstone/react-table';

type IProps = ICommon & (IMultiProps | ISingleProps);

interface ICommon {
    TrendChannels: TrendSearch.ITrendChannel[],
    SetTrendChannels: (channelList: TrendSearch.ITrendChannel[]) => void,
    // If this is not set, the delete buttons should not appear
    OnChannelRemoval?: (chan: TrendSearch.ITrendChannel) => void,
    EnableDragDrop?: boolean,
    Height: number
}

interface IMultiProps {
    Type: 'multi',
    SelectedSet: Set<string>,
    SetSelectedSet: (set: Set<string>) => void
}

interface ISingleProps {
    Type: 'single',
    Selected: string,
    SetSelected: (id: string) => void
}

const colList = ["Description", "Asset Key", "Asset Name", "Meter Key", "Meter Name", "Channel Group", "Channel Group Type"];
const defaultCols = new Set(["Meter Name", "Description"]);

const TrendChannelTable = (props: IProps) => {
    const [sortField, setSortField] = React.useState<string>('MeterName');
    const [ascending, setAscending] = React.useState<boolean>(true);

    const removeButton = React.useCallback(
        (data: { item: TrendSearch.ITrendChannel }) => (
            <button type="button"
                className={'btn float-left'}
                onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    // Remove Channel
                    const allChannels = [...props.TrendChannels];
                    const indexChannel = allChannels.findIndex(chan => chan.ID === data.item.ID);
                    allChannels.splice(indexChannel, 1);
                    props.SetTrendChannels(allChannels);
                    props.OnChannelRemoval(data.item);
                }}>
                <ReactIcons.TrashCan Color="var(--danger)"/>
            </button>
        ), [props.OnChannelRemoval, props.TrendChannels, props.SetTrendChannels]);

    const sortCallback = React.useCallback(
        (data: { colKey: string, colField?: string, ascending: boolean }, _event) => {
            if (data.colKey === 'undefined')
                return
            if (data.colField === sortField)
                setAscending(!ascending);
            else
                setSortField(data.colField);
        }, [ascending, sortField, setAscending, setSortField]);

    const dragFuncCallback = React.useCallback(
        (item: { row: TrendSearch.ITrendChannel }, event: React.DragEvent<Element>) => {
            let channelsTransfered = [];
            if (props.Type === 'single' || !props.SelectedSet.has(item.row.ID)) channelsTransfered.push(props.TrendChannels.find(channel => channel.ID === item.row.ID));
            // These should be sorted same as props.TrendChannels as per filter specs
            else channelsTransfered = props.TrendChannels.filter(channel => props.SelectedSet.has(channel.ID));
            event.dataTransfer.setData("text/plain", JSON.stringify(channelsTransfered));
        }, [props.Type, props.Type === 'single' ? props.Selected : props.SelectedSet, props.TrendChannels]);

    React.useEffect(() => {
        props.SetTrendChannels(_.orderBy(props.TrendChannels, sortField, (ascending ? 'asc' : 'desc')));
    }, [sortField, ascending]);

    return (
        <ConfigurableTable<TrendSearch.ITrendChannel>
            Data={props.TrendChannels}
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
                    const newIds: Set<string> = new Set();
                    if (event.shiftKey) {
                        const clickIndex: number = props.TrendChannels.findIndex(chan => chan.ID === item.row.ID);
                        const firstSelectedIndex: number = props.TrendChannels.findIndex(chan => props.SelectedSet.has(chan.ID));
                        if (firstSelectedIndex >= 0) {
                            const lowerIndex: number = clickIndex < firstSelectedIndex ? clickIndex : firstSelectedIndex;
                            const upperIndex: number = clickIndex > firstSelectedIndex ? clickIndex : firstSelectedIndex;
                            for (let index: number = lowerIndex; index <= upperIndex; index++) {
                                newIds.add(props.TrendChannels[index].ID);
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
            TheadStyle={{ fontSize: 'smaller' }}
            TbodyStyle={{ display: 'block', overflowY: 'scroll', height: props.Height - 45, userSelect: 'none'}}
            TableClass="table table-hover"
            TableStyle={{ marginBottom: 0 }}>
            <Column<TrendSearch.ITrendChannel>
                Key={'Name'}
                AllowSort={true}
                Adjustable={true}
                Field={'Name'}
            >Channel Name</Column>
            <Column<TrendSearch.ITrendChannel>
                Key={'Phase'}
                AllowSort={true}
                Adjustable={true}
                Field={'Phase'}
            />
            {colList.map(name =>
                <ConfigurableColumn key={name.replace(/\s/, "")} Key={name.replace(/\s/, "")} Label={name} Default={defaultCols.has(name)}>
                    <Column<TrendSearch.ITrendChannel>
                        Key={name.replace(/\s/, "")}
                        AllowSort={true}
                        Adjustable={true}
                        Field={name.replace(/\s/, "") as keyof TrendSearch.ITrendChannel}
                    >{name}</Column>
                </ConfigurableColumn>)
            }
            {props.OnChannelRemoval !== undefined ?
                <Column<TrendSearch.ITrendChannel>
                    Key={'ID'}
                    AllowSort={false}
                    Adjustable={false}
                    Field={'ID'}
                    RowStyle={{ width: "50px" }}
                    HeaderStyle={{ width: "50px" }}
                    Content={removeButton}
                > </Column>: null}
        </ConfigurableTable>);
}

export default TrendChannelTable;