//******************************************************************************************************
//  TrendMarkerTable.tsx - Gbtc
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
import { CrossMark } from '@gpa-gemstone/gpa-symbols';
import Table from '@gpa-gemstone/react-table';
import { TrendSearch } from '../../../global';
import moment from 'moment';

interface IProps {
    Markers: TrendSearch.IMarker[],
    RemoveMarker?: (id: string) => void,
    Selected: TrendSearch.IMarker,
    SetSelected: (id: TrendSearch.IMarker) => void,
    Height: number
}

const TrendMarkerTable = (props: IProps) => {
    const [trendMarkers, setTrendMarkers] = React.useState<TrendSearch.IMarker[]>([]);
    const [sortField, setSortField] = React.useState<string>('MeterName');
    const [ascending, setAscending] = React.useState<boolean>(true);

    React.useEffect(() => {
        setTrendMarkers(_.orderBy(props.Markers, sortField, (ascending ? 'asc' : 'desc')));
    }, [props.Markers, sortField, ascending]);

    const removeButton = React.useCallback(
        (marker: TrendSearch.IMarker) => (
            <button type="button"
                className={'btn float-left'}
                onClick={(event) => { event.preventDefault(); event.stopPropagation(); props.RemoveMarker(marker.ID) }}>
                {CrossMark}
            </button>
        ), [props.RemoveMarker]);

    const sortCallback = React.useCallback(
        (data: { colKey: string, colField?: string, ascending: boolean }) => {
            if (data.colKey === 'undefined')
                return
            if (data.colField === sortField)
                setAscending(!ascending);
            else
                setSortField(data.colField);
        }, [ascending]);

    return (
        <Table<TrendSearch.IMarker>
            cols={[
                { key: "symbol", field: "symbol", label: "" },
                { key: "xPos", field: "xPos", label: "Time", content: (item) => moment(item.xPos).format("MM/DD/YYYY hh:mm:ss.SSS") },
                { key: "yPos", field: "yPos", label: "Value" },
                { key: "note", field: "note", label: "Note" },
                { key: "RemoveChannel", field: "ID", label: "", rowStyle: { width: "50px" }, headerStyle: { width: "50px" }, content: removeButton }
            ]}
            data={trendMarkers}
            sortKey={sortField}
            ascending={ascending}
            onSort={sortCallback}
            onClick={(item, event) => {
                event.preventDefault();
                props.SetSelected(item.row);
            }}
            selected={(item) => props.Selected?.ID === item.ID}
            theadStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
            tbodyStyle={{ display: 'block', overflowY: 'scroll', height: props.Height - 30, userSelect: 'none' }}
            rowStyle={{ display: 'table', tableLayout: 'fixed', width: 'calc(100%)' }}
        />);
}

export default TrendMarkerTable;