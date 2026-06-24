// ******************************************************************************************************
//  StandardSelectPopup.tsx - Gbtc
//
//  Copyright © 2021, Grid Protection Alliance.  All Rights Reserved.
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
//  12/19/2021 - C. Lackner
//       Generated original version of source code.
// ******************************************************************************************************

import { Table, Column, FilterableColumn, ConfigurableColumn } from "@gpa-gemstone/react-table";
import * as React from 'react';
import { Modal, Search } from "@gpa-gemstone/react-interactive";
import _ from "lodash";
import { ReactIcons } from "@gpa-gemstone/gpa-symbols";
import { Application } from '@gpa-gemstone/application-typings';
import { Gemstone, ReadOnlyControllerFunctions_Gemstone } from '@gpa-gemstone/common-pages';

interface IRecord {
    ID: number | string
}

interface IProps<T extends IRecord> {
    ControllerAPIPath: string,
    DefaultSortField: keyof T,
    Selection: T[],
    OnClose: (selected: T[], conf: boolean) => void
    Show: boolean,
    Searchbar: (children: React.ReactNode, SetFilter: (filters: Search.IFilter<T>[]) => void, SearchStatus: Application.Types.Status, ResultCount: number) => React.ReactNode,
    Type?: 'single' | 'multiple',
    Title: string,
    MinSelection?: number,
    children?: React.ReactNode
}


export default function SelectPopup<T extends IRecord>(props: IProps<T>) {
    const controller = React.useMemo(() => new ReadOnlyControllerFunctions_Gemstone<T>(props.ControllerAPIPath), [props.ControllerAPIPath]);
    const fetchHandle = React.useRef<JQuery.jqXHR<T[]> | null>(null);
    const [filters, setFilters] = React.useState<Search.IFilter<T>[]>([]);
    const [data, setData] = React.useState<T[]>([]);
    const [searchStatus, setSearchStatus] = React.useState<Application.Types.Status>('uninitiated');
    const [sortField, setSortField] = React.useState<keyof T>(props.DefaultSortField);
    const [ascending, setAscending] = React.useState<boolean>(true);

    const [selectedData, setSelectedData] = React.useState<T[]>(props.Selection);

    const [sortKeySelected, setSortKeySelected] = React.useState<string>('');
    const [ascendingSelected, setAscendingSelected] = React.useState<boolean>(false);

    const stringifiedFilter = React.useMemo(() => JSON.stringify(filters), [filters]);
    const memoizedFilters = React.useMemo(() => Gemstone.HelperFunctions.getSearchFilter(JSON.parse(stringifiedFilter) as Search.IFilter<T>[]), [stringifiedFilter]);

    const reFetchData = React.useCallback(() => {
        setSearchStatus('loading');
        //when this was working with slices it would just do a non paged search which just takes the first page
        //we are account for the case where theres more records than can be returned in a single page
        //however the cleaner path would be to implement pagination somehow.. 
        fetchHandle.current = controller.GetAll(sortField, ascending, memoizedFilters).done((records) => {
            setData(records);
            setSearchStatus('idle');
        }).fail(() => setSearchStatus('error'));

        return () => {
            if (fetchHandle.current?.abort != null)
                fetchHandle.current.abort();
        };
    }, [ascending, controller, memoizedFilters, sortField]);

    React.useEffect(() => reFetchData(), [reFetchData]);

    React.useEffect(() => {
        setSelectedData(props.Selection);
    }, [props.Selection])

    function AddCurrentList() {
        const updatedData = selectedData.concat(data);
        setSelectedData(_.uniqBy(updatedData, (d) => d.ID));
    }

    return (<>
        <Modal Show={props.Show} Title={props.Title} ShowX={true} Size={'xlg'} CallBack={(conf) => props.OnClose(selectedData, conf)}
            DisableConfirm={props.MinSelection !== undefined && selectedData.length < props.MinSelection}
            ConfirmShowToolTip={props.MinSelection !== undefined && selectedData.length < props.MinSelection}
            ConfirmToolTipContent={<p><ReactIcons.CrossMark /> At least {props.MinSelection} items must be selected. </p>}
        >
            <div className="row">
                <div className="col">
                    {props.Searchbar(
                        <>
                            {props.Type === 'multiple' ? <li className="nav-item" style={{ width: '20%', paddingRight: 10 }}>
                                <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                                    <legend className="w-auto" style={{ fontSize: 'large' }}>Quick Selects:</legend>
                                    <form>
                                        <div className="form-group">
                                            <div className="btn btn-primary" onClick={(event) => { event.preventDefault(); AddCurrentList(); }}>Add Current List to Selection</div>
                                        </div>
                                        <div className="form-group">
                                            <div className="btn btn-danger" onClick={(event) => { event.preventDefault(); setSelectedData([]) }}>Remove All</div>
                                        </div>
                                    </form>
                                </fieldset>
                            </li> : null}
                            {React.Children.map(props.children, (e) => {
                                if (React.isValidElement(e)) {
                                    if (((e as React.ReactElement).type === FilterableColumn) ||
                                        ((e as React.ReactElement).type === Column) ||
                                        ((e as React.ReactElement).type === ConfigurableColumn)
                                    ) return null;
                                    return e;
                                }
                                return null;
                            })}
                        </>, setFilters, searchStatus, data.length)}
                </div>
            </div>
            <div className="row">
                <div className="col" style={{ width: (props.Type === undefined || props.Type === 'single' ? '100%' : '60%') }}>
                    <Table<T>
                        TableClass="table table-hover"
                        Data={data}
                        SortKey={sortField as string}
                        Ascending={ascending}
                        OnSort={(d) => {
                            if (d.colKey === "Scroll")
                                return;
                            if (d.colKey === sortField)
                                setAscending(!ascending);
                            else {
                                setSortField(d.colField as keyof T);
                                setAscending(true);
                            }
                        }}
                        OnClick={(d) => {
                            if (props.Type === undefined || props.Type === 'single')
                                setSelectedData([d.row])
                            else
                                setSelectedData((s) => [...s.filter(item => item.ID !== d.row.ID), d.row])
                        }}
                        Selected={(item) => selectedData.findIndex(d => d.ID === item.ID) > -1}
                        KeySelector={item => item.ID}
                    >
                        {props.children}
                    </Table>
                </div>
                {props.Type === 'multiple' ? <div className="col" style={{ width: '40%' }}>
                    <div style={{ width: '100%' }}>
                        <h3> Current Selection </h3>
                    </div>
                    <Table<T>
                        TableClass="table table-hover"
                        Data={selectedData}
                        SortKey={sortKeySelected}
                        Ascending={ascendingSelected}
                        OnSort={(d) => {
                            if (d.colKey === sortKeySelected) {
                                const ordered = _.orderBy<T[]>(selectedData, [d.colKey], [(!ascendingSelected ? "asc" : "desc")]) as T[];
                                setAscendingSelected(!ascendingSelected);
                                setSelectedData(ordered);
                            }
                            else {
                                const ordered = _.orderBy(selectedData, [d.colKey], ["asc"]) as T[];
                                setAscendingSelected(!ascendingSelected);
                                setSelectedData(ordered);
                                setSortKeySelected(d.colKey);
                            }
                        }}
                        OnClick={(d) => setSelectedData([...selectedData.filter(item => item.ID !== d.row.ID)])}
                        Selected={() => false}
                        KeySelector={item => item.ID}
                    >
                        {props.children}
                    </Table>
                </div> : null}
            </div>
        </Modal>
    </>)

}
