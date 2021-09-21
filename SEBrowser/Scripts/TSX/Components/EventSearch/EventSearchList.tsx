//******************************************************************************************************
//  EventSearchList.tsx - Gbtc
//
//  Copyright © 2019, Grid Protection Alliance.  All Rights Reserved.
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
//  04/24/2019 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import { ConfigurableTable } from '@gpa-gemstone/react-interactive';
import { useSelector, useDispatch } from 'react-redux';
import { OpenXDA, Redux, SEBrowser } from '../../global';
import { SelectEventSearchBySearchText, SelectEventSearchsAscending, SelectEventSearchsSortField, Sort, SelectEventSearchsStatus, FetchEventSearches } from './EventSearchSlice';

interface IProps {
    eventid: number,
    searchText: string,
    selectEvent: (id: number) => void,

}

export default function EventSearchList(props: IProps) {
    const ref = React.useRef();
    const dispatch = useDispatch();

    const status = useSelector(SelectEventSearchsStatus);
    const sortField = useSelector(SelectEventSearchsSortField);
    const ascending = useSelector(SelectEventSearchsAscending);
    const data = useSelector((state: Redux.StoreState) => SelectEventSearchBySearchText(state, props.searchText));

    React.useEffect(() => {
        document.addEventListener("keydown", handleKeyPress, false);

        return () => {
            document.removeEventListener("keydown", handleKeyPress, false);
        }
    })

    React.useEffect(() => {
        if (status != 'unitiated' && status != 'changed') return;
        dispatch(FetchEventSearches());

        return function () {
        }
    }, [status]);

    function handleKeyPress(event) {
        if (data.length == 0) return;

        var index = data.map(a => a.EventID.toString()).indexOf(props.eventid.toString());

        if (event.keyCode == 40) // arrow down key
        {
            event.preventDefault();

            if (props.eventid == -1)
                props.selectEvent(data[0].EventID);
            else if (index == data.length - 1)
                props.selectEvent(data[0].EventID);
            else
                props.selectEvent( data[index + 1].EventID);

        }
        else if (event.keyCode == 38)  // arrow up key
        {
            event.preventDefault();

            if (props.eventid == -1)
                props.selectEvent(data[data.length - 1].EventID);
            else if (index == 0)
                props.selectEvent(data[data.length - 1].EventID);
            else
                props.selectEvent(data[index - 1].EventID);
        }

        setScrollBar();
    }

    function setScrollBar() {
      
        var rowHeight = $(ReactDOM.findDOMNode(ref.current)).find('tbody').children()[0].clientHeight;
        var index = data.map(a => a.EventID.toString()).indexOf(props.eventid.toString());
        var tableHeight = data.length * rowHeight;
        var windowHeight = window.innerHeight - 314;
        var tableSectionCount = Math.ceil(tableHeight / windowHeight);
        var tableSectionHeight = Math.ceil(tableHeight / tableSectionCount);
        var rowsPerSection = tableSectionHeight / rowHeight;
        var sectionIndex = Math.floor(index / rowsPerSection);
        var scrollTop = $(ReactDOM.findDOMNode(ref.current)).find('tbody').scrollTop();

        if(scrollTop <= sectionIndex * tableSectionHeight || scrollTop >= (sectionIndex + 1) * tableSectionHeight - tableSectionHeight/2)
            $(ReactDOM.findDOMNode(ref.current)).find('tbody').scrollTop(sectionIndex * tableSectionHeight);

    }

    return (
        <div ref={ref} style={{width: '100%', maxHeight: window.innerHeight - 314, overflowY: "hidden"}}>
            <ConfigurableTable<OpenXDA.Event>
                cols={[
                    { key: "FileStartTime", label: 'Time', headerStyle: { width: 'calc(20%)' }, rowStyle: { width: 'calc(20%)' }, content: (item, key) => <span>{moment(item.FileStartTime).format('MM/DD/YYYY')}<br />{moment(item.FileStartTime).format('HH:mm:ss.SSSSSSS')}</span> },
                    { key: "AssetName", field: 'AssetName', label: 'Asset', headerStyle: { width: '20%' }, rowStyle: { width: '20%' } },
                    { key: "AssetType", field: 'AssetType', label: 'Asset Tp', headerStyle: { width: '15%' }, rowStyle: { width: '15%' } },
                    { key: "VoltageClass", field: 'VoltageClass', label: 'kV', headerStyle: { width: '15%' }, rowStyle: { width: '15%' }, content: (item, key, style) => item[key].toString().split('.')[1] != undefined && item[key].toString().split('.')[1].length > 3 ? (item[key] as number).toFixed(3) : item[key] },
                    { key: "EventType", field: 'EventType', label: 'Evt Cl', headerStyle: { width: '15%' }, rowStyle: { width: '15%' } },
                    { key: "BreakerOperation", label: 'Brkr Op', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' }, content: (item, key, style) => <span><i className={(item.BreakerOperation == true ? "fa fa-check" : '')}></i></span> },
                ]}
                tableClass="table table-hover"
                data={data}
                sortKey={sortField}
                ascending={ascending}
                onSort={(d) => {
                    if (d.colKey == sortField) dispatch(Sort({ Ascending: ascending, SortField: sortField }));
                    else dispatch(Sort({ Ascending: true, SortField: d.colKey }));
                }}
                onClick={(item) => props.selectEvent(item.row.EventID)}
                theadStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                tbodyStyle={{ display: 'block', overflowY: 'scroll', maxHeight: window.innerHeight - 314 }}
                rowStyle={{ display: 'table', tableLayout: 'fixed', width: 'calc(100%)' }}
                selected={(item) => {
                    if (item.EventID == props.eventid) return true;
                    else return false;
                }}
                requiredColumns={["FileStartTime"]}
                defaultColumns={["EventType", "AssetName"]}
            />
        </div>
    );
}
