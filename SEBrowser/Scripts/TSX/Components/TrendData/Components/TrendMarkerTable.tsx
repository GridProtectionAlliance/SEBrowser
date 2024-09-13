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
import Table from '@gpa-gemstone/react-table';
import { TrendSearch } from '../../../global';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { SelectDateTimeSetting } from '../../SettingsSlice';

interface IProps {
    Markers: TrendSearch.IMarker[],
    RemoveMarker?: (marker: TrendSearch.IMarker) => void,
    Selected: TrendSearch.IMarker,
    SetSelected: (marker: TrendSearch.IMarker) => void,
    Height: number,
    DisplayDescription: boolean
}

const TrendMarkerTable = (props: IProps) => {
    const dateTimeSetting = useSelector(SelectDateTimeSetting);

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
        <Table<TrendSearch.IMarker>
            cols={[
                {
                    key: "symbol", field: "ID", label: "", content: (item) => {
                        switch (item.type) {
                            case "VeHo":
                                if (props.DisplayDescription ?? false) return "+"
                                return item["isHori"] ? "-" : "|"
                            case "Symb": return item["symbol"];
                            default:
                                return "Event";
                        }
                    }
                },
                {
                    key: "type", field: "type", label: (props.DisplayDescription ?? false) ? "" : "Value", content: (item) => {
                        if (props.DisplayDescription ?? false) {
                            switch (item.type) {
                                case "VeHo":
                                    return "Vertical and Horizontal Line Marker(s)";
                                case "Symb":
                                    return "Icon Marker(s) and Infobox(es)";
                                default:
                                    return "Event Marker(s)";
                            }
                        } else {
                            switch (item.type) {
                                case "VeHo":
                                    return (item["isHori"] ?? true) ? item["value"].toFixed(2) : moment.utc(item["value"]).format(dateTimeSetting.DateTimeFormat);
                                case "Symb":
                                    return `${moment.utc(item["xPos"]).format(dateTimeSetting.DateTimeFormat)} | ${item["yPos"].toFixed(2)}`;
                                default:
                                    return "All Events";
                            }
                        }
                    }
                },
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