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

import { Table, Column, FilterableColumn, ConfigurableColumn, Paging } from "@gpa-gemstone/react-table";
import * as React from 'react';
import { Modal, Search, BtnDropdown } from "@gpa-gemstone/react-interactive";
import _ from "lodash";
import { ReactIcons } from "@gpa-gemstone/gpa-symbols";
import { Application } from '@gpa-gemstone/application-typings';
import { Gemstone, ReadOnlyControllerFunctions_Gemstone, useSearchData_Gemstone } from '@gpa-gemstone/common-pages';

interface IProps<T> {
    ControllerAPIPath: string,
    DefaultSortField: keyof T,
    PrimaryKey: keyof T,
    Selection: T[],
    OnClose: (selected: T[], conf: boolean) => void
    Show: boolean,
    Searchbar: (children: React.ReactNode, SetFilter: (filters: Search.IFilter<T>[]) => void, SearchStatus: Application.Types.Status, ResultCount: number) => React.ReactNode,
    Type?: 'single' | 'multiple',
    Title: string,
    MinSelection?: number,
    children?: React.ReactNode
}

const SelectPopup = <T,>(props: IProps<T>) => {
    const controller = React.useMemo(() => new ReadOnlyControllerFunctions_Gemstone<T>(props.ControllerAPIPath), [props.ControllerAPIPath]);
    const bulkHandle = React.useRef<JQuery.jqXHR<T[]> | null>(null);
    const [filters, setFilters] = React.useState<Search.IFilter<T>[]>([]);
    const [sortField, setSortField] = React.useState<keyof T>(props.DefaultSortField);
    const [ascending, setAscending] = React.useState<boolean>(true);

    const [activePage, setActivePage] = React.useState<number>(0);
    const [pageInfo, setPageInfo] = React.useState<Gemstone.Types.IPageInfo>({ TotalCount: 0, PageCount: 0, PageSize: 0 });
    const [bulkLoading, setBulkLoading] = React.useState<boolean>(false);

    const [selectedData, setSelectedData] = React.useState<T[]>(props.Selection);

    const [sortKeySelected, setSortKeySelected] = React.useState<string>('');
    const [ascendingSelected, setAscendingSelected] = React.useState<boolean>(false);

    const { SearchResults: data, SearchStatus: searchStatus } = useSearchData_Gemstone<T>(activePage, sortField, filters, ascending, props.ControllerAPIPath, setPageInfo);

    const searchStatusEffective: Application.Types.Status = bulkLoading || searchStatus === 'loading' ? 'loading' : searchStatus;

    const stringifiedFilter = React.useMemo(() => JSON.stringify(filters), [filters]);
    const memoizedFilters = React.useMemo(() => Gemstone.HelperFunctions.getSearchFilter(JSON.parse(stringifiedFilter) as Search.IFilter<T>[]), [stringifiedFilter]);

    //keep the active page valid when the filtered result set shrinks
    React.useEffect(() => {
        if (pageInfo.PageCount > 0 && activePage >= pageInfo.PageCount)
            setActivePage(pageInfo.PageCount - 1);
    }, [pageInfo.PageCount, activePage]);

    React.useEffect(() => {
        setSelectedData(props.Selection);
    }, [props.Selection])

    //abort any in-flight bulk fetch on unmount
    React.useEffect(() => () => { if (bulkHandle.current?.abort != null) bulkHandle.current.abort(); }, []);

    const addRecords = React.useCallback((records: T[]) => {
        setSelectedData((s) => _.uniqBy([...s, ...records], (d) => d[props.PrimaryKey]));
    }, [props.PrimaryKey]);

    const removeRecords = React.useCallback((records: T[]) => {
        const ids = new Set(records.map((r) => r[props.PrimaryKey]));
        setSelectedData((s) => s.filter((d) => !ids.has(d[props.PrimaryKey])));
    }, [props.PrimaryKey]);

    //fetches every record matching the current filter and applies the bulk action to them
    const handleAddAllPages = React.useCallback(() => {
        if (bulkHandle.current?.abort != null) bulkHandle.current.abort();

        setBulkLoading(true);
        bulkHandle.current = controller.GetAll(sortField, ascending, memoizedFilters)
            .done((records) => addRecords(records))
            .always(() => setBulkLoading(false));
    }, [controller, sortField, ascending, memoizedFilters, addRecords]);

    return (
        <Modal
            Show={props.Show}
            Title={props.Title}
            ShowX={true}
            Size={'xlg'}
            BodyStyle={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 210px)', overflow: 'hidden' }}
            CallBack={(conf) => props.OnClose(selectedData, conf)}
            DisableConfirm={props.MinSelection !== undefined && selectedData.length < props.MinSelection}
            ConfirmShowToolTip={props.MinSelection !== undefined && selectedData.length < props.MinSelection}
            ConfirmToolTipContent={
                <p>
                    <ReactIcons.CrossMark /> At least {props.MinSelection} items must be selected.
                </p>
            }
        >
            <div className="row" style={{ flexShrink: 0 }}>
                <div className="col" style={{ width: (props.Type === undefined || props.Type === 'single' ? '100%' : '60%') }}>
                    {props.Searchbar(
                        <>
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
                        </>, setFilters, searchStatusEffective, pageInfo.TotalCount)}
                </div>
                {props.Type === 'multiple' ? <div className="col" style={{ width: '40%', borderLeft: '1px solid #dee2e6' }}>
                    <h3> Current Selection </h3>
                    <div className="form-group">
                        <BtnDropdown
                            Label={'Add Page'}
                            Callback={() => addRecords(data)}
                            Options={[{
                                Label: 'Add All Pages',
                                Callback: () => handleAddAllPages(),
                                ShowToolTip: true,
                                ToolTipContent: <p className='mb-0'>Adds every matching record to your selection.</p>
                            }]}
                            BtnClass={'btn-primary'}
                            Size="std"
                            ShowToolTip={true}
                            TooltipContent={<p className='mb-0'>Adds the records on this page to your selection.</p>}
                        />
                    </div>
                    <div className="form-group">
                        <BtnDropdown
                            Label={'Remove Page'}
                            Callback={() => removeRecords(data)}
                            Options={[{
                                Label: 'Remove All Pages',
                                Callback: () => setSelectedData([]),
                                ShowToolTip: true,
                                ToolTipContent: <p className='mb-0'>Removes all records from your selection.</p>
                            }]}
                            BtnClass={'btn-danger'}
                            Size="std"
                            ShowToolTip={true}
                            TooltipLocation="bottom"
                            TooltipContent={<p className='mb-0'>Removes the records on this page from your selection.</p>}
                        />
                    </div>
                </div> : null}
            </div>
            <div className="row flex-grow-1" style={{ overflow: 'hidden', minHeight: 0 }}>
                <div className="col h-100" style={{ width: (props.Type === undefined || props.Type === 'single' ? '100%' : '60%') }}>
                    <Table<T>
                        TableClass="table table-hover h-100"
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
                                setSelectedData((s) => [...s.filter(item => item[props.PrimaryKey] !== d.row[props.PrimaryKey]), d.row])
                        }}
                        Selected={(item) => selectedData.findIndex(d => d[props.PrimaryKey] === item[props.PrimaryKey]) > -1}
                        KeySelector={item => item[props.PrimaryKey] as string | number}
                    >
                        {props.children}
                    </Table>
                </div>
                {props.Type === 'multiple' ? <div className="col h-100" style={{ width: '40%', borderLeft: '1px solid #dee2e6' }}>
                    <Table<T>
                        TableClass="table table-hover h-100"
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
                        OnClick={(d) => setSelectedData([...selectedData.filter(item => item[props.PrimaryKey] !== d.row[props.PrimaryKey])])}
                        Selected={() => false}
                        KeySelector={item => item[props.PrimaryKey] as string | number}
                    >
                        {props.children}
                    </Table>
                </div> : null}
            </div>
            <div className="row" style={{ flexShrink: 0 }}>
                <div className="col" style={{ width: (props.Type === undefined || props.Type === 'single' ? '100%' : '60%') }}>
                    <Paging
                        Current={activePage + 1}
                        Total={pageInfo.PageCount}
                        SetPage={(p) => setActivePage(p - 1)}
                    />
                </div>
                {props.Type === 'multiple' ?
                    <div className="col" style={{ width: '40%' }} />
                    : null
                }
            </div>
        </Modal>
    )
}

export default SelectPopup;