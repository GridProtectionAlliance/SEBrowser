// ******************************************************************************************************
//  SearchBar.tsx - Gbtc
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
//  12/17/2021 - Samuel Robinson
//       Generated original version of source code.
//  12/19/2021 - C. Lackner
//       Cleaned up code.
// ******************************************************************************************************

import * as React from 'react';
import { SearchBar as GenericSearchBar, Search } from '@gpa-gemstone/react-interactive';
import { OpenXDA, SystemCenter, Application, Gemstone } from '@gpa-gemstone/application-typings';
import { useStringMemonization } from '@gpa-gemstone/helper-functions';


interface IProps<T> {
    SetFilter: (filters: Search.IFilter<T>[]) => void,
    SearchStatus: Application.Types.Status,
    ResultCount: number,
    /** Functions that gets available values for any ENUM Types */
    GetEnum: (setOptions: (options: Gemstone.TSX.Interfaces.ILabelValue<string>[]) => void, field: Search.IField<T>) => () => void,
    /** Function that Grabs any additional Filters that shoudl be available (such as Addl Fields) */
    GetAddlFields: (setAddlFields: (cols: Search.IField<T>[]) => void) => () => void,
    AddlFilters?: Search.IFilter<T>[],
    StorageID?: string
}

const useSetFilters = <T,>(setFilter: (filters: Search.IFilter<T>[]) => void, addlFilters: Search.IFilter<T>[] | undefined | null) => {
    return React.useCallback((filters: Search.IFilter<T>[]) =>
        setFilter(addlFilters == null ? filters : [...filters, ...addlFilters]),
        [addlFilters, setFilter]);
}

/** This Implements a few standardized SearchBars */
export namespace DefaultSearch {

    /** This Implements a standard Meter Search */
    export const Meter = (props: React.PropsWithChildren<IProps<SystemCenter.Types.DetailedMeter>>) => {
        const [addlFieldCols, setAddlFieldCols] = React.useState<Search.IField<SystemCenter.Types.DetailedMeter>[]>([]);
        const addlFilters = useStringMemonization<Search.IFilter<SystemCenter.Types.DetailedMeter>[] | undefined>(props.AddlFilters);
        const setFilters = useSetFilters(props.SetFilter, addlFilters);

        React.useEffect(() => {
            return props.GetAddlFields(setAddlFieldCols);
        }, []);

        return <GenericSearchBar<SystemCenter.Types.DetailedMeter>
            CollumnList={[...defaultMeterSearchCols, ...addlFieldCols]}
            SetFilter={setFilters}
            Direction={'left'}
            defaultCollumn={defaultMeterSearch}
            Width={'50%'}
            ShowLoading={props.SearchStatus === 'loading'}
            ResultNote={props.SearchStatus === 'error' ? 'Could not complete Search' : 'Found ' + props.ResultCount + ' Meter(s)'}
            GetEnum={props.GetEnum}
            StorageID={props.StorageID}
        >
            {props.children}
        </GenericSearchBar>
    }

    /** This Implements a standard Substation Search */
    export const Location = (props: React.PropsWithChildren<IProps<SystemCenter.Types.DetailedLocation>>) => {
        const [addlFieldCols, setAddlFieldCols] = React.useState<Search.IField<SystemCenter.Types.DetailedLocation>[]>([]);
        const addlFilters = useStringMemonization<Search.IFilter<SystemCenter.Types.DetailedLocation>[] | undefined>(props.AddlFilters);
        const setFilters = useSetFilters(props.SetFilter, addlFilters);

        React.useEffect(() => {
            return props.GetAddlFields(setAddlFieldCols);
        }, []);

        return <GenericSearchBar<SystemCenter.Types.DetailedLocation>
            CollumnList={[...defaultLocationSearchCols, ...addlFieldCols]}
            SetFilter={setFilters}
            Direction={'left'}
            defaultCollumn={defaultLocationSearch}
            Width={'50%'}
            ShowLoading={props.SearchStatus === 'loading'}
            ResultNote={props.SearchStatus === 'error' ? 'Could not complete Search' : 'Found ' + props.ResultCount + '  Substation(s)'}
            GetEnum={props.GetEnum}
            StorageID={props.StorageID}
        >
            {props.children}
        </GenericSearchBar>
    }

    /** This Implements a standard Transmission Asset Search */
    export const Asset = (props: React.PropsWithChildren<IProps<SystemCenter.Types.DetailedAsset>>) => {
        const [addlFieldCols, setAddlFieldCols] = React.useState<Search.IField<SystemCenter.Types.DetailedAsset>[]>([]);
        const addlFilters = useStringMemonization<Search.IFilter<SystemCenter.Types.DetailedAsset>[] | undefined>(props.AddlFilters);
        const setFilters = useSetFilters(props.SetFilter, addlFilters);

        React.useEffect(() => {
            return props.GetAddlFields(setAddlFieldCols);
        }, []);

        return <GenericSearchBar<SystemCenter.Types.DetailedAsset>
            CollumnList={[...defaultAssetSearchCols, ...addlFieldCols]}
            SetFilter={setFilters}
            Direction={'left'}
            defaultCollumn={defaultAssetSearch}
            Width={'50%'}
            ShowLoading={props.SearchStatus === 'loading'}
            ResultNote={props.SearchStatus === 'error' ? 'Could not complete Search' : 'Found ' + props.ResultCount + ' Transmission Asset(s)'}
            GetEnum={props.GetEnum}
            StorageID={props.StorageID}
        >
            {props.children}
        </GenericSearchBar>
    }

    /** This Implements a standard AssetGroup Search */
    export const AssetGroup = (props: React.PropsWithChildren<IProps<OpenXDA.Types.AssetGroup>>) => {
        const [addlFieldCols, setAddlFieldCols] = React.useState<Search.IField<OpenXDA.Types.AssetGroup>[]>([]);
        const addlFilters = useStringMemonization<Search.IFilter<OpenXDA.Types.AssetGroup>[] | undefined>(props.AddlFilters);
        const setFilters = useSetFilters(props.SetFilter, addlFilters);

        React.useEffect(() => {
            return props.GetAddlFields(setAddlFieldCols);
        }, []);

        return <GenericSearchBar<OpenXDA.Types.AssetGroup>
            CollumnList={[...defaultAssetGroupSearchCols, ...addlFieldCols]}
            SetFilter={setFilters}
            Direction={'left'}
            defaultCollumn={defaultAssetGroupSearch}
            Width={'50%'}
            ShowLoading={props.SearchStatus === 'loading'}
            ResultNote={props.SearchStatus === 'error' ? 'Could not complete Search' : 'Found ' + props.ResultCount + ' Asset Group(s)'}
            GetEnum={props.GetEnum}
            StorageID={props.StorageID}
        >
            {props.children}
        </GenericSearchBar>
    }

    /** This Implements a standard User Search */
    export const User = (props: React.PropsWithChildren<IProps<Application.Types.iUserAccount>>) => {
        const [addlFieldCols, setAddlFieldCols] = React.useState<Search.IField<Application.Types.iUserAccount>[]>([]);
        const addlFilters = useStringMemonization<Search.IFilter<Application.Types.iUserAccount>[] | undefined>(props.AddlFilters);
        const setFilters = useSetFilters(props.SetFilter, addlFilters);

        React.useEffect(() => {
            return props.GetAddlFields(setAddlFieldCols);
        }, []);

        return <GenericSearchBar<Application.Types.iUserAccount>
            CollumnList={[...defaultUserSearchCols, ...addlFieldCols]}
            SetFilter={setFilters}
            Direction={'left'}
            defaultCollumn={defaultUserSearch}
            Width={'50%'}
            ShowLoading={props.SearchStatus === 'loading'}
            ResultNote={props.SearchStatus === 'error' ? 'Could not complete Search' : 'Found ' + props.ResultCount + ' User(s)'}
            GetEnum={props.GetEnum}
            StorageID={props.StorageID}
        >
            {props.children}
        </GenericSearchBar>
    }


    /** This Implements a standard Customer Search */
    export const Customer = (props: React.PropsWithChildren<IProps<OpenXDA.Types.Customer>>) => {
        const [addlFieldCols, setAddlFieldCols] = React.useState<Search.IField<OpenXDA.Types.Customer>[]>([]);
        const addlFilters = useStringMemonization<Search.IFilter<OpenXDA.Types.Customer>[] | undefined>(props.AddlFilters);
        const setFilters = useSetFilters(props.SetFilter, addlFilters);

        React.useEffect(() => {
            return props.GetAddlFields(setAddlFieldCols);
        }, []);

        return <GenericSearchBar<OpenXDA.Types.Customer>
            CollumnList={[...defaultCustomerSearchCols, ...addlFieldCols]}
            SetFilter={setFilters}
            Direction={'left'}
            defaultCollumn={defaultCustomerSearch}
            Width={'50%'}
            ShowLoading={props.SearchStatus === 'loading'}
            ResultNote={props.SearchStatus === 'error' ? 'Could not complete Search' : 'Found ' + props.ResultCount + ' Customer(s)'}
            GetEnum={props.GetEnum}
            StorageID={props.StorageID}
        >
            {props.children}
        </GenericSearchBar>
    }
}

const defaultMeterSearchCols: Search.IField<SystemCenter.Types.DetailedMeter>[] = [
    { label: 'Key', key: 'AssetKey', type: 'string', isPivotField: false },
    { label: 'Name', key: 'Name', type: 'string', isPivotField: false },
    { label: 'Substation Name', key: 'Location', type: 'string', isPivotField: false },
    { label: 'Make', key: 'Make', type: 'string', isPivotField: false },
    { label: 'Model', key: 'Model', type: 'string', isPivotField: false },
    { label: 'Number of Assets', key: 'MappedAssets', type: 'number', isPivotField: false },
    { label: 'Description', key: 'Description', type: 'string', isPivotField: false },
];

const defaultMeterSearch: Search.IField<SystemCenter.Types.DetailedMeter> = { label: 'Name', key: 'Name', type: 'string', isPivotField: false };

const defaultLocationSearchCols: Search.IField<SystemCenter.Types.DetailedLocation>[] = [
    { label: 'Name', key: 'Name', type: 'string', isPivotField: false },
    { label: 'Key', key: 'LocationKey', type: 'string', isPivotField: false },
    { label: 'Asset Key', key: 'Asset', type: 'string', isPivotField: false },
    { label: 'Meter Key', key: 'Meter', type: 'string', isPivotField: false },
    { label: 'Number of Assets', key: 'Assets', type: 'integer', isPivotField: false },
    { label: 'Number of Meters', key: 'Meters', type: 'integer', isPivotField: false },
    { label: 'Description', key: 'Description', type: 'string', isPivotField: false },
];

const defaultLocationSearch: Search.IField<SystemCenter.Types.DetailedLocation> = { label: 'Name', key: 'Name', type: 'string', isPivotField: false };

const defaultAssetSearchCols: Search.IField<SystemCenter.Types.DetailedAsset>[] = [
    { label: 'Key', key: 'AssetKey', type: 'string', isPivotField: false },
    { label: 'Name', key: 'AssetName', type: 'string', isPivotField: false },
    { label: 'Nominal Voltage (L-L kV)', key: 'VoltageKV', type: 'number', isPivotField: false },
    { label: 'Type', key: 'AssetType', type: 'enum', isPivotField: false },
    { label: 'Meter Key', key: 'Meter', type: 'string', isPivotField: false },
    { label: 'Substation Key', key: 'Location', type: 'string', isPivotField: false },
    { label: 'Number of Meters', key: 'Meters', type: 'integer', isPivotField: false },
    { label: 'Number of Substations', key: 'Locations', type: 'integer', isPivotField: false },
    { label: 'Description', key: 'Description', type: 'string', isPivotField: false },
];

const defaultAssetSearch: Search.IField<SystemCenter.Types.DetailedAsset> = { label: 'Name', key: 'AssetName', type: 'string', isPivotField: false };

const defaultAssetGroupSearchCols: Search.IField<OpenXDA.Types.AssetGroup>[] = [
    { label: 'Name', key: 'Name', type: 'string', isPivotField: false },
    { label: 'Number of Meters', key: 'Meters', type: 'integer', isPivotField: false },
    { label: 'Number of Transmission Assets', key: 'Assets', type: 'integer', isPivotField: false },
    { label: 'Number of Asset Groups', key: 'AssetGroups', type: 'integer', isPivotField: false },
    { label: 'Show in PQ Dashboard', key: 'DisplayDashboard', type: 'boolean', isPivotField: false },
    { label: 'Show in Email Subscription', key: 'DisplayEmail', type: 'boolean', isPivotField: false },
];

const defaultAssetGroupSearch: Search.IField<OpenXDA.Types.AssetGroup> = { label: 'Name', key: 'Name', type: 'string', isPivotField: false };

const defaultUserSearchCols: Search.IField<Application.Types.iUserAccount>[] = [
    { label: 'First Name', key: 'FirstName', type: 'string', isPivotField: false },
    { label: 'Last Name', key: 'LastName', type: 'string', isPivotField: false },
    { label: 'Email', key: 'Email', type: 'string', isPivotField: false },
];

const defaultUserSearch: Search.IField<Application.Types.iUserAccount> = { label: 'Username', key: 'Name', type: 'string', isPivotField: false };

const defaultCustomerSearchCols: Search.IField<OpenXDA.Types.Customer>[] = [
    { label: 'Name', key: 'Name', type: 'string', isPivotField: false },
    { label: 'Account Name', key: 'CustomerKey', type: 'string', isPivotField: false },
    { label: 'Phone', key: 'Phone', type: 'string', isPivotField: false },
    { label: 'Description', key: 'Description', type: 'string', isPivotField: false },
];

const defaultCustomerSearch: Search.IField<OpenXDA.Types.Customer> = { label: 'Name', key: 'Name', type: 'string', isPivotField: false };
