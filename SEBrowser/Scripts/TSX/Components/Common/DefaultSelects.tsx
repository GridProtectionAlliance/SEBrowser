// ******************************************************************************************************
//  SelectionPopup.tsx - Gbtc
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

import React from 'react';
import { Search } from "@gpa-gemstone/react-interactive";
import { Application, OpenXDA, SystemCenter, Gemstone } from "@gpa-gemstone/application-typings";
import { DefaultSearch } from './DefaultSearch';
import SelectPopup from './StandardSelectPopup';

// Pass columns in via children
interface IProps<T> {
    ControllerAPIPath: string,
    Selection: T[],
    OnClose: (selected: T[], conf: boolean) => void
    Show: boolean,
    Type?: 'single' | 'multiple',
    Title: string,
    GetEnum: (setOptions: (options: Gemstone.TSX.Interfaces.ILabelValue<string>[]) => void, field: Search.IField<T>) => () => void,
    GetAddlFields: (setAddlFields: (cols: Search.IField<T>[]) => void) => () => void,
    AddlFilters?: Search.IFilter<T>[],
    MinSelection?: number,
    children?: React.ReactNode,
    StorageID?: string
}

/** This Implements a few standardized Selection Popups */
export namespace DefaultSelects {

    /** This Implements a standard Meter Selection Modal */
    export function Meter(props: IProps<SystemCenter.Types.DetailedMeter>) {
        return <SelectPopup<SystemCenter.Types.DetailedMeter>
            {...props}
            DefaultSortField="Name"
            Searchbar={(children, setFilter, searchStatus, resultCount) =>
                <DefaultSearch.Meter
                    SetFilter={setFilter}
                    SearchStatus={searchStatus}
                    ResultCount={resultCount}
                    GetAddlFields={props.GetAddlFields}
                    GetEnum={props.GetEnum}
                    StorageID={props.StorageID}
                    AddlFilters={props.AddlFilters}
                >
                    {children}
                </DefaultSearch.Meter>
            }
        >
            {props.children}
        </SelectPopup>
    }

    /** This Implements a standard Substation Selection Modal */
    export function Location(props: IProps<SystemCenter.Types.DetailedLocation>) {
        return <SelectPopup<SystemCenter.Types.DetailedLocation>
            {...props}
            DefaultSortField="Name"
            Searchbar={(children, setFilter, searchStatus, resultCount) =>
                <DefaultSearch.Location
                    SetFilter={setFilter}
                    SearchStatus={searchStatus}
                    ResultCount={resultCount}
                    GetAddlFields={props.GetAddlFields}
                    GetEnum={props.GetEnum}
                    StorageID={props.StorageID}
                    AddlFilters={props.AddlFilters}
                >
                    {children}
                </DefaultSearch.Location>
            }
        >
            {props.children}
        </SelectPopup>
    }

    /** This Implements a standard Transmission Asset Selection Modal */
    export function Asset(props: IProps<SystemCenter.Types.DetailedAsset>) {
        return <SelectPopup<SystemCenter.Types.DetailedAsset>
            {...props}
            DefaultSortField="AssetName"
            Searchbar={(children, setFilter, searchStatus, resultCount) =>
                <DefaultSearch.Asset
                    SetFilter={setFilter}
                    SearchStatus={searchStatus}
                    ResultCount={resultCount}
                    GetAddlFields={props.GetAddlFields}
                    GetEnum={props.GetEnum}
                    StorageID={props.StorageID}
                    AddlFilters={props.AddlFilters}
                >
                    {children}
                </DefaultSearch.Asset>
            }
        >
            {props.children}
        </SelectPopup>
    }

    /** This Implements a standard Asset Group Selection Modal */
    export function AssetGroup(props: IProps<OpenXDA.Types.AssetGroup>) {
        return <SelectPopup<OpenXDA.Types.AssetGroup>
            {...props}
            DefaultSortField="Name"
            Searchbar={(children, setFilter, searchStatus, resultCount) =>
                <DefaultSearch.AssetGroup
                    SetFilter={setFilter}
                    SearchStatus={searchStatus}
                    ResultCount={resultCount}
                    GetAddlFields={props.GetAddlFields}
                    GetEnum={props.GetEnum}
                    StorageID={props.StorageID}
                    AddlFilters={props.AddlFilters}
                >
                    {children}
                </DefaultSearch.AssetGroup>
            }
        >
            {props.children}
        </SelectPopup>
    }

    /** This Implements a standard User Selection Modal */
    export function User(props: IProps<Application.Types.iUserAccount>) {
        return <SelectPopup<Application.Types.iUserAccount>
            {...props}
            DefaultSortField="Name"
            Searchbar={(children, setFilter, searchStatus, resultCount) =>
                <DefaultSearch.User
                    SetFilter={setFilter}
                    SearchStatus={searchStatus}
                    ResultCount={resultCount}
                    GetAddlFields={props.GetAddlFields}
                    GetEnum={props.GetEnum}
                    StorageID={props.StorageID}
                    AddlFilters={props.AddlFilters}
                >
                    {children}
                </DefaultSearch.User>
            }
        >
            {props.children}
        </SelectPopup>
    }
    /** This Implements a standard Customer Selection Modal */
    export function Customer(props: IProps<OpenXDA.Types.Customer>) {
        return <SelectPopup<OpenXDA.Types.Customer>
            {...props}
            DefaultSortField="Name"
            Searchbar={(children, setFilter, searchStatus, resultCount) =>
                <DefaultSearch.Customer
                    SetFilter={setFilter}
                    SearchStatus={searchStatus}
                    ResultCount={resultCount}
                    GetAddlFields={props.GetAddlFields}
                    GetEnum={props.GetEnum}
                    StorageID={props.StorageID}
                    AddlFilters={props.AddlFilters}
                >
                    {children}
                </DefaultSearch.Customer>
            }
        >
            {props.children}
        </SelectPopup>

    }
}
