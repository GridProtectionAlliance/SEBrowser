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
import { TrashCan } from '@gpa-gemstone/gpa-symbols';
import { ReactTable } from '@gpa-gemstone/react-table';
import { TrendSearch } from '../../../global';
import moment from 'moment';

interface IProps {
    Markers: TrendSearch.IMarker[],
    RemoveMarker?: (marker: TrendSearch.IMarker) => void,
    Selected: TrendSearch.IMarker,
    SetSelected: (marker: TrendSearch.IMarker) => void,
    Height: number,
    DisplayDescription: boolean
}

const TrendMarkerTable = (props: IProps) => {
    const [trendMarkers, setTrendMarkers] = React.useState<TrendSearch.IMarker[]>([]);
    const [sortField, setSortField] = React.useState<string>('MeterName');
    const [ascending, setAscending] = React.useState<boolean>(true);
    const momentFormat = "DD HH:mm:ss.SSS";

    React.useEffect(() => {
        setTrendMarkers(_.orderBy(props.Markers, sortField, (ascending ? 'asc' : 'desc')));
    }, [props.Markers, sortField, ascending]);

    const removeButton = React.useCallback(
        (marker: TrendSearch.IMarker) => (
            <button type="button"
                className={'btn float-left'}
                onClick={(event) => { event.preventDefault(); event.stopPropagation(); props.RemoveMarker(marker) }}>
                {TrashCan}
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
        <ReactTable.Table<TrendSearch.IMarker>
            Data={trendMarkers}
            SortKey={sortField}
            Ascending={ascending}
            OnSort={sortCallback}
            OnClick={(item, event) => {
                event.preventDefault();
                props.SetSelected(item.row);
            }}
            Selected={(item) => props.Selected?.ID === item.ID}
            KeySelector={(item) => item.ID}
            TheadStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
            TbodyStyle={{ display: 'block', overflowY: 'scroll', height: props.Height - 30, userSelect: 'none' }}
            RowStyle={{ display: 'table', tableLayout: 'fixed', width: 'calc(100%)' }}
        />);
}

export default TrendMarkerTable;