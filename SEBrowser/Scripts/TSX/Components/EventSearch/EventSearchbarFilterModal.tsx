﻿//******************************************************************************************************
//  EventSearchbarFitlerModal.tsx - Gbtc
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
//  10/05/2021 - C. Lackner
//       Generated original version of source code.
//
//******************************************************************************************************
import React from 'react';
import 'moment';
import _ from 'lodash';
import { OpenXDA, SEBrowser } from '../../global';
import { useDispatch, useSelector } from 'react-redux';
import { SelectCharacteristicFilter, SelectTimeFilter, SelectTypeFilter, SetFilters } from './EventSearchSlice';
import { AssetGroupSlice, AssetSlice, LocationSlice, MagDurCurveSlice, MeterSlice } from '../../Store';
import { Modal, Search, SearchBar } from '@gpa-gemstone/react-interactive';
import { SystemCenter } from '@gpa-gemstone/application-typings';
import Table, { Column } from '@gpa-gemstone/react-table';
import { ascending } from 'd3';

interface S {ID: number}

interface IProps<T extends S> {
    Data: T[],
    Type: ('Meter' | 'Asset' | 'AssetGroup' | 'Station'),
    SetData: (d: T[]) => void
}

const momentDateTimeFormat = "MM/DD/YYYY HH:mm:ss.SSS";
const momentDateFormat = "MM/DD/YYYY";
const momentTimeFormat = "HH:mm:ss.SSS";

function EventSearchbarFilterModal<T extends S>(props: IProps<T>) {
    const dispatch = useDispatch();
    const meterStatus = useSelector(MeterSlice.Status);
    const assetStatus = useSelector(AssetSlice.Status);
    const assetGroupStatus = useSelector(AssetGroupSlice.Status);
    const locationStatus = useSelector(LocationSlice.Status);
    const [filterableList, setFilterableList] = React.useState<Search.IField<T>[]>(getDefaultFilterList() as Search.IField<T>[]);
    const [standardSearch, setStandardSearch] = React.useState<Search.IField<T>>({ label: 'Name', key: 'Name', type: 'string', isPivotField: false });
    const [tableColumns, settableColumns] = React.useState<Column<T>[]>([{ key: 'Scroll', label: '', headerStyle: { width: 17, padding: 0 }, rowStyle: { width: 0, padding: 0 } }]);
    const meterList = useSelector(MeterSlice.SearchResults) as any[];
    const assetList = useSelector(AssetSlice.SearchResults) as any[];
    const assetGroupList = useSelector(AssetGroupSlice.SearchResults) as any[];
    const locationList = useSelector(LocationSlice.SearchResults) as any[];

    const meterFilters = useSelector(MeterSlice.SearchFilters) as Search.IFilter<any>[];
    const assetFilters = useSelector(AssetSlice.SearchFilters) as Search.IFilter<any>[];
    const assetGroupFilters = useSelector(AssetGroupSlice.SearchFilters) as Search.IFilter<any>[];
    const locationFilters = useSelector(LocationSlice.SearchFilters) as Search.IFilter<any>[];

    const [asc, setAsc] = React.useState<boolean>(false);
    const [sortKey, setSortKey] = React.useState<keyof T>(null);

    React.useEffect(() => {
        if (meterStatus == 'changed' || meterStatus == 'unintiated')
            dispatch(MeterSlice.Fetch());
    }, [meterStatus]);

    React.useEffect(() => {
        if (assetStatus == 'changed' || assetStatus == 'unintiated')
            dispatch(AssetSlice.Fetch());
    }, [assetStatus]);

    React.useEffect(() => {
        if (assetGroupStatus == 'changed' || assetGroupStatus == 'unintiated')
            dispatch(AssetGroupSlice.Fetch());
    }, [assetGroupStatus]);

    React.useEffect(() => {
        if (locationStatus == 'changed' || locationStatus == 'unintiated')
            dispatch(LocationSlice.Fetch());
    }, [locationStatus]);

    // #ToDo: Move default Fields into gpa-gemstone to match SystemCenter and SEBrowser
    React.useEffect(() => {
        let handle = null;
        let handleLine = null;
        let handleBreaker = null;
        let handleCapBank = null;
        let handleTransformer = null;
        let handleBus = null;

        if (props.Type == 'Meter')
            handle = getAdditionalFields('Meter');
        if (props.Type == 'Station')
            handle = getAdditionalFields('Location');
        if (props.Type == 'Asset') {
            handleLine = getAdditionalFields('Line');
            handleBreaker = getAdditionalFields('Breaker');
            handleCapBank = getAdditionalFields('CapBank');
            handleTransformer = getAdditionalFields('Transformer');
            handleBus = getAdditionalFields('Bus');
        }

        setFilterableList(getDefaultFilterList() as Search.IField<T>[]);

        if (props.Type == 'Asset') {
            return () => {
                if (handleLine.abort != null) handleLine.abort();
                if (handleBreaker.abort != null) handleBreaker.abort();
                if (handleCapBank.abort != null) handleCapBank.abort();
                if (handleTransformer.abort != null) handleTransformer.abort();
                if (handleBus.abort != null) handleBus.abort();
            }
        }

        return () => { if (handle != null && handle.abort != null) handle.abort(); }

    }, [props.Type]);


    function getDefaultFilterList() {
        if (props.Type == 'Meter')
            return [
                { label: 'AssetKey', key: 'AssetKey', type: 'string', isPivotField: false },
                { label: 'Name', key: 'Name', type: 'string', isPivotField: false },
                { label: 'Location', key: 'Location', type: 'string', isPivotField: false },
                { label: 'Make', key: 'Make', type: 'string', isPivotField: false },
                { label: 'Model', key: 'Model', type: 'string', isPivotField: false },
                { label: 'Number of Assets', key: 'MappedAssets', type: 'number', isPivotField: false },
            ];
        if (props.Type == 'Asset')
            return [
                { label: 'Key', key: 'AssetKey', type: 'string', isPivotField: false },
                { label: 'Name', key: 'AssetName', type: 'string', isPivotField: false },
                { label: 'Voltage (kV)', key: 'VoltageKV', type: 'number', isPivotField: false },
                { label: 'Type', key: 'AssetType', type: 'enum', isPivotField: false },
                { label: 'Meters', key: 'Meters', type: 'integer', isPivotField: false },
                { label: 'Substations', key: 'Locations', type: 'integer', isPivotField: false },
            ];
        if (props.Type == 'AssetGroup')
            return [
                { label: 'Name', key: 'Name', type: 'string', isPivotField: false },
                { label: 'Number of Meter', key: 'Meters', type: 'integer', isPivotField: false },
                { label: 'Number of Transmission Assets', key: 'Assets', type: 'integer', isPivotField: false },
                { label: 'Number of Users', key: 'Users', type: 'integer', isPivotField: false },
                { label: 'Show in PQ Dashboard', key: 'DisplayDashboard', type: 'boolean', isPivotField: false },
            ];
        if (props.Type == 'Station')
            return [
                { label: 'Name', key: 'Name', type: 'string', isPivotField: false },
                { label: 'Key', key: 'LocationKey', type: 'string', isPivotField: false },
                { label: 'Asset', key: 'Asset', type: 'string', isPivotField: false },
                { label: 'Meter', key: 'Meter', type: 'string', isPivotField: false },
                { label: 'Number of Assets', key: 'Assets', type: 'integer', isPivotField: false },
                { label: 'Number of Meters', key: 'Meters', type: 'integer', isPivotField: false },
            ];
    }

    function getAdditionalFields(table: string): JQuery.jqXHR<SystemCenter.Types.AdditionalField[]> {
        function ConvertType(type: string) {
            if (type == 'string' || type == 'integer' || type == 'number' || type == 'datetime' || type == 'boolean')
                return { type: type }
            return {
                type: 'enum', enum: [{ Label: type, Value: type }]
            }
        };
        let handle = $.ajax({
            type: "GET",
            url: `${homePath}api/openXDA/AdditionalField/ParentTable/${table}/FieldName/0`,
            contentType: "application/json; charset=utf-8",
            cache: false,
            async: true
        });
            
            handle.done((d: Array<SystemCenter.Types.AdditionalField>) => {
                setFilterableList(defaults => {
                    return _.orderBy(defaults.concat(d.filter(item => item.Searchable).map(item => (
                        { label: `[AF${item.ExternalDB != undefined ? " " + item.ExternalDB : ''}] ${item.FieldName}`, key: item.FieldName, ...ConvertType(item.Type) } as Search.IField<OpenXDA.Meter>
                    ))), ['label'], ["asc"]);
                })
            });
        return handle;
    }

    React.useEffect(() => {
       
        if (props.Type == 'Meter')
            setStandardSearch({ label: 'Name', key: 'Name', type: 'string', isPivotField: false });
        if (props.Type == 'Asset')
            setStandardSearch({ label: 'Name', key: 'AssetName', type: 'string', isPivotField: false });
        if (props.Type == 'AssetGroup')
            setStandardSearch({ label: 'Name', key: 'Name', type: 'string', isPivotField: false });
        if (props.Type == 'Station')
            setStandardSearch({ label: 'Name', key: 'Name', type: 'string', isPivotField: false });

    }, [props.Type]);


    React.useEffect(() => {

        if (props.Type == 'Meter')
            setSortKey('Name' as keyof T)
        if (props.Type == 'Asset')
            setSortKey('AssetName' as keyof T);
        if (props.Type == 'AssetGroup')
            setSortKey('Name' as keyof T)
        if (props.Type == 'Station')
            setSortKey('Name' as keyof T)

    }, [props.Type]);

    React.useEffect(() => {
        if (props.Type == 'Meter')
            Search(meterFilters)
        if (props.Type == 'Asset')
            Search(assetFilters);
        if (props.Type == 'AssetGroup')
            Search(assetGroupFilters);
        if (props.Type == 'Station')
            Search(locationFilters);

        props.SetData(props.Data);

    }, [sortKey, ascending]);

    React.useEffect(() => {
      
        if (props.Type == 'Meter')
            settableColumns([
                { key: 'Name', field: 'Name' as keyof T, label: 'Name', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' } },
                { key: 'AssetKey', field: 'AssetKey' as keyof T, label: 'Key', headerStyle: { width: '15%' }, rowStyle: { width: '15%' } },
                { key: 'Location', field: 'Location' as keyof T, label: 'Substation', headerStyle: { width: '10%' }, rowStyle: { width: '10%' } },
                { key: 'MappedAssets', field: 'MappedAssets' as keyof T, label: 'Assets', headerStyle: { width: '10%' }, rowStyle: { width: '10%' } },
                { key: 'Make', field: 'Make' as keyof T, label: 'Make', headerStyle: { width: '10%' }, rowStyle: { width: '10%' } },
                { key: 'Model', field: 'Model' as keyof T, label: 'Model', headerStyle: { width: '10%' }, rowStyle: { width: '10%' } },
                { key: 'Scroll', label: '', headerStyle: { width: 17, padding: 0 }, rowStyle: { width: 0, padding: 0 } }
            ]);
        if (props.Type == 'Asset')
            settableColumns([
                { key: 'AssetKey', field: 'AssetKey' as keyof T, label: 'Key', headerStyle: { width: '15%' }, rowStyle: { width: '15%' } },
                { key: 'AssetName', field: 'AssetName' as keyof T, label: 'Name', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' } },
                { key: 'AssetType', field: 'AssetType' as keyof T, label: 'Asset Type', headerStyle: { width: '10%' }, rowStyle: { width: '10%' } },
                { key: 'VoltageKV', field: 'VoltageKV' as keyof T, label: 'Voltage (kV)', headerStyle: { width: '10%' }, rowStyle: { width: '10%' } },
                { key: 'Meters', field: 'Meters' as keyof T, label: 'Meters', headerStyle: { width: '10%' }, rowStyle: { width: '10%' } },
                { key: 'Locations', field: 'Locations' as keyof T, label: 'Substations', headerStyle: { width: '10%' }, rowStyle: { width: '10%' } },
                { key: 'Scroll', label: '', headerStyle: { width: 17, padding: 0 }, rowStyle: { width: 0, padding: 0 } },
            ]);
        if (props.Type == 'AssetGroup')
            settableColumns([
                { key: 'Name', field: 'Name' as keyof T, label: 'Name', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' } },
                { key: 'Assets', field: 'Assets' as keyof T, label: 'Num. of Assets', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' } },
                { key: 'Meters', field: 'Meters' as keyof T, label: 'Num. of Meters', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' } },
                { key: 'Users', field: 'Users' as keyof T, label: 'Num. of Users', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' } },
                { key: 'AssetGroups', field: 'AssetGroups' as keyof T, label: 'Num. of Asset Groups', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' } },
                { key: 'Scroll', label: '', headerStyle: { width: 17, padding: 0 }, rowStyle: { width: 0, padding: 0 } }
            ]);
        if (props.Type == 'Station')
            settableColumns([
                { key: 'Name', field: 'Name' as keyof T, label: 'Name', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' } },
                { key: 'LocationKey', field: 'LocationKey' as keyof T, label: 'Key', headerStyle: { width: '30%' }, rowStyle: { width: '30%' } },
                { key: 'Meters', field: 'Meters' as keyof T, label: 'Meters', headerStyle: { width: '10%' }, rowStyle: { width: '10%' } },
                { key: 'Assets', field: 'Assets' as keyof T, label: 'Assets', headerStyle: { width: '10%' }, rowStyle: { width: '10%' } },
                { key: 'Scroll', label: '', headerStyle: { width: 17, padding: 0 }, rowStyle: { width: 0, padding: 0 } }
            ]);
    }, [props.Type]);

    function Search(flds: Search.IFilter<T>[]) {
        if (props.Type == 'Meter')
            dispatch(MeterSlice.DBSearch({ filter: flds, sortField: sortKey as keyof OpenXDA.Meter, ascending: asc }));
        if (props.Type == 'Asset')
            dispatch(AssetSlice.DBSearch({ filter: flds, sortField: sortKey as keyof OpenXDA.Asset, ascending: asc }));
        if (props.Type == 'AssetGroup')
            dispatch(AssetGroupSlice.DBSearch({ filter: flds, sortField: sortKey as keyof OpenXDA.AssetGroup, ascending: asc }));
        if (props.Type == 'Station')
            dispatch(LocationSlice.DBSearch({ filter: flds, sortField: sortKey as keyof OpenXDA.Location, ascending: asc }));

    }

    function GetCount(): number {
        switch (props.Type) {
            case ('Meter'):
                return meterList.length;
            case ('Asset'):
                return assetList.length;
            case ('AssetGroup'):
                return assetGroupList.length;
            default:
                return locationList.length;

        }
    }

    function AddCurrentList() {
        let updatedData: any[];

        if (props.Type == 'Meter')
            updatedData = (props.Data as any[]).concat(meterList);
        if (props.Type == 'Asset')
            updatedData = (props.Data as any[]).concat(assetList);
        if (props.Type == 'AssetGroup')
            updatedData = (props.Data as any[]).concat(assetGroupList);
        if (props.Type == 'Station')
            updatedData = (props.Data as any[]).concat(locationList);

        props.SetData(_.uniqBy((updatedData as T[]), (d) => d.ID));
    }

    return (
        <>
            <div className='row'>
                <div className='col-12'>
                    <SearchBar<T>
                        CollumnList={filterableList}
                        SetFilter={Search}
                        Direction={'left'}
                        defaultCollumn={standardSearch}
                        Width={'50%'}
                        Label={'Search'}
                        ShowLoading={meterStatus == 'loading' || assetStatus == 'loading' || assetGroupStatus == 'loading' || locationStatus == 'loading'}
                        ResultNote={meterStatus == 'error' || assetStatus == 'error' || assetGroupStatus == 'error' || locationStatus == 'error'?
                            'Could not complete Search' : 'Found ' + GetCount() + ' ' + props.Type}
                        GetEnum={(setOptions, field) => {
                            let handle = null;
                            if (field.type != 'enum' || field.enum == undefined || field.enum.length != 1)
                                return () => { };

                            handle = $.ajax({
                                type: "GET",
                                url: `${homePath}api/ValueList/Group/${field.enum[0].Value}`,
                                contentType: "application/json; charset=utf-8",
                                dataType: 'json',
                                cache: true,
                                async: true
                            });

                            handle.done(d => setOptions(d.map(item => ({ Value: item.ID, Label: item.Value }))))
                            return () => { if (handle != null && handle.abort == null) handle.abort(); }
                        }}

                    >
                        <li className="nav-item" style={{ width: '20%', paddingRight: 10 }}>
                            <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                                <legend className="w-auto" style={{ fontSize: 'large' }}>Quick Selects:</legend>
                                <form>
                                    <div className="form-group">
                                        <div className="btn btn-primary" onClick={(event) => { event.preventDefault(); AddCurrentList(); }}>Add Current List to Filter</div>
                                    </div>
                                </form>
                            </fieldset>
                        </li>
                    </SearchBar>
                </div>
                <div className='row'>
                    <div className='col-6'>
                        <Table<T>
                            cols={tableColumns}
                            tableClass="table table-hover"
                            data={(props.Type == 'Meter' ? meterList : (props.Type == 'Asset' ? assetList : (props.Type == 'AssetGroup' ? assetGroupList : locationList))) as any[]}
                            sortKey={sortKey as string}
                            ascending={asc}
                            onSort={(d) => {
                                if (d.colKey === "Scroll")
                                    return;
                                if (d.colKey === sortKey)
                                    setAsc(!asc);
                                else {
                                    setAsc(true);
                                    setSortKey(d.colField);
                                }
                            }}
                            onClick={(d) => props.SetData([...props.Data.filter(item => item.ID != d.row.ID), d.row])}
                            theadStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                            tbodyStyle={{ display: 'block', overflowY: 'scroll', maxHeight: window.innerHeight - 450, width: '100%' }}
                            rowStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                            selected={(item) => false}
                        />
                    </div>
                    <div className='col-6'>
                        <Table<T>
                            cols={tableColumns}
                            tableClass="table table-hover"
                            data={props.Data}
                            sortKey={sortKey as string}
                            ascending={asc}
                            onSort={(d) => {
                                if (d.colKey === "Scroll")
                                    return;
                                if (d.colKey === sortKey)
                                    setAsc(!asc);
                                else {
                                    setAsc(true);
                                    setSortKey(d.colField);
                                }
                            }}
                            onClick={(d) => props.SetData(props.Data.filter(item => item.ID != d.row.ID))}
                            theadStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                            tbodyStyle={{ display: 'block', overflowY: 'scroll', maxHeight: window.innerHeight - 450, width: '100%' }}
                            rowStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                            selected={(item) => false}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

export default EventSearchbarFilterModal;