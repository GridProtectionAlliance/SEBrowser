//******************************************************************************************************
//  EventSearchNavbar.tsx - Gbtc
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
//  08/22/2019 - Christoph Lackner
//       Added Filter for Events with TCE.
//
//******************************************************************************************************
import React from 'react';
import _ from 'lodash';
import { TimeFilter } from '@gpa-gemstone/common-pages';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { SelectAssetGroupList, SelectAssetList, SelectMeterList, SelectReset, SelectStationList, SelectTimeFilter, SetFilterLists } from '../../../Store/EventSearchSlice';
import { ResetFilters, SetFilters } from '../../../Store/EventSearchSlice';
import { AssetGroupControllerPath, AssetControllerPath, AssetTypeController, LocationControlerPath, MeterControllerPath } from '../../../Store/ControllerFunctions';
import { DefaultSelects } from '../../Common/DefaultSelects';
import NavbarFilterButton from '../../Common/NavbarFilterButton';
import { SystemCenter, OpenXDA, Gemstone } from '@gpa-gemstone/application-typings';
import { PQBrowser } from '../../../global';
import { Search } from '@gpa-gemstone/react-interactive';
import { Column, ConfigurableColumn } from '@gpa-gemstone/react-table';
import EventSearchTypeFilters from '../EventSearchTypeFilter/EventSearchTypeFilter';
import { SelectDateTimeSetting, SelectTimeZone } from '../../../Store/SettingsSlice';
import { getMoment, getStartEndTime, readableUnit, toGemstoneFilter, fromGemstoneFilter } from '../TimeWindowUtils';
import EventCharacteristics from './EventCharacteristics';
import { useGetContainerPosition } from '@gpa-gemstone/helper-functions';

const momentDateTimeFormat = "MM/DD/YYYY HH:mm:ss.SSS";

export type ValueListItemResponse = Omit<SystemCenter.Types.ValueListItem, 'AltValue'> & {
    AltValue: string | null;
};

const EventSearchNavbar = () => {
    const dispatch = useAppDispatch();
    const [showNav, setShowNav] = React.useState<boolean>(getShowNav());

    const navRef = React.useRef(null);
    const { offsetHeight: navHeight } = useGetContainerPosition(navRef);

    const timeFilter = useAppSelector(SelectTimeFilter);
    const timeZone = useAppSelector(SelectTimeZone);
    const assetGroupList = useAppSelector(SelectAssetGroupList);
    const meterList = useAppSelector(SelectMeterList);
    const assetList = useAppSelector(SelectAssetList);
    const locationList = useAppSelector(SelectStationList);
    const dateTimeSetting = useAppSelector(SelectDateTimeSetting)
    const reset = useAppSelector(SelectReset);

    const [showFilter, setFilter] = React.useState<('None' | 'Meter' | 'Asset' | 'AssetGroup' | 'Station')>('None');

    const timeRange = React.useMemo(() => {
        let r = "";
        const center = getMoment(timeFilter.date, timeFilter.time);
        const [start, end] = getStartEndTime(center, timeFilter.windowSize, timeFilter.timeWindowUnits);

        if (dateTimeSetting == 'startEnd')
            r = `${start.format(momentDateTimeFormat)}`;
        if (dateTimeSetting == 'startWindow')
            r = `${start.format(momentDateTimeFormat)} (${timeZone})`;
        else if (dateTimeSetting == 'endWindow')
            r = `${end.format(momentDateTimeFormat)} (${timeZone})`;

        if (dateTimeSetting == 'startEnd')
            r += ` to ${end.format(momentDateTimeFormat)} (${timeZone})`;
        else if (dateTimeSetting == 'startWindow')
            r += ` + ${2 * timeFilter.windowSize} ${readableUnit(timeFilter.timeWindowUnits)}`;
        else if (dateTimeSetting == 'endWindow')
            r += ` - ${2 * timeFilter.windowSize} ${readableUnit(timeFilter.timeWindowUnits)}`;

        return r
    }, [timeFilter, dateTimeSetting, timeZone])

    React.useEffect(() => {
        localStorage.setItem('SEbrowser.EventSearch.ShowNav', showNav.toString())
    }, [showNav])

    if (timeFilter === null) return null;

    if (!showNav)
        return (
            <nav className="navbar navbar-expand-xl navbar-light bg-light">
                <div className="collapse navbar-collapse" id="navbarSupportedContent" style={{ width: '100%' }}>
                    <div className="navbar-nav mr-auto">
                        <span className="navbar-text">
                            {timeRange}
                        </span>
                    </div>
                    <div className="navbar-nav ml-auto" >
                        <button type="button" className={`btn btn-${(!reset ? 'warning' : 'primary')} btn-sm`} onClick={() => setShowNav(true)}>Show Filters</button>
                    </div>
                </div>
            </nav>
        );

    return (
        <>
            <nav className="navbar navbar-expand-xl navbar-light bg-light" ref={navRef}>
                <div className="collapse navbar-collapse" id="navbarSupportedContent" style={{ width: '100%' }}>
                    <ul className="navbar-nav mr-auto" style={{ width: '100%' }}>
                        <li className="nav-item" style={{ width: '30%', paddingRight: 10 }}>
                            <TimeFilter
                                filter={toGemstoneFilter(timeFilter)}
                                setFilter={(start, end, unit, duration) => dispatch(SetFilters({ time: fromGemstoneFilter(start, end, unit, duration) }))}
                                showQuickSelect={true}
                                dateTimeSetting={dateTimeSetting}
                                timeZone={timeZone}
                            />
                        </li>
                        <EventSearchTypeFilters Height={navHeight} />
                        <li className="nav-item" style={{ width: '45%', paddingRight: 10 }}>
                            <EventCharacteristics />
                        </li>

                        <li className="nav-item" style={{ width: '15%', paddingRight: 10 }}>
                            <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                                <legend className="w-auto" style={{ fontSize: 'large' }}>Other Filters:</legend>
                                <div className={"row"}>
                                    <div className={'col'}>
                                        <NavbarFilterButton<SystemCenter.Types.DetailedMeter>
                                            Type={'Meter'}
                                            OnClick={() => setFilter('Meter')}
                                            OnDelete={(meter) => dispatch(SetFilterLists({ Assets: assetList, Groups: assetGroupList, Meters: meterList.filter(item => item.ID !== meter.ID), Stations: locationList }))}
                                            Data={meterList}
                                        />
                                    </div>
                                </div>
                                <div className={"row"}>
                                    <div className={'col'}>
                                        <NavbarFilterButton<SystemCenter.Types.DetailedAsset>
                                            Type={'Asset'}
                                            OnClick={() => setFilter('Asset')}
                                            OnDelete={(asset) => dispatch(SetFilterLists({ Assets: assetList.filter(item => item.ID !== asset.ID), Groups: assetGroupList, Meters: meterList, Stations: locationList }))}
                                            Data={assetList}
                                        />
                                    </div>
                                </div>
                                <div className={"row"}>
                                    <div className={'col'}>
                                        <NavbarFilterButton<OpenXDA.Types.AssetGroup>
                                            Type={'AssetGroup'}
                                            OnClick={() => setFilter('AssetGroup')}
                                            OnDelete={(assetGroup) => dispatch(SetFilterLists({ Assets: assetList, Groups: assetGroupList.filter(item => item.ID !== assetGroup.ID), Meters: meterList, Stations: locationList }))}
                                            Data={assetGroupList}
                                        />
                                    </div>
                                </div>
                                <div className={"row"}>
                                    <div className={'col'}>
                                        <NavbarFilterButton<SystemCenter.Types.DetailedLocation>
                                            Type={'Station'}
                                            OnClick={() => setFilter('Station')}
                                            OnDelete={(location) => dispatch(SetFilterLists({ Assets: assetList, Groups: assetGroupList, Meters: meterList, Stations: locationList.filter(item => item.ID !== location.ID) }))}
                                            Data={locationList}
                                        />
                                    </div>
                                </div>
                            </fieldset>
                        </li>
                    </ul>
                    <div className="btn-group-vertical float-right">
                        <button type="button" style={{ marginBottom: 5 }} className={`btn btn-${(!reset ? 'warning' : 'primary')} btn-sm`} onClick={() => setShowNav(false)}>
                            Hide Filters
                        </button>
                        <button type="button" className="btn btn-danger btn-sm" disabled={reset} onClick={() => dispatch(ResetFilters())}>
                            Reset Filters
                        </button>
                    </div>
                </div>
            </nav>
            <DefaultSelects.Meter
                ControllerAPIPath={MeterControllerPath}
                Selection={meterList}
                OnClose={(selected, conf) => {
                    setFilter('None');
                    if (conf)
                        dispatch(SetFilterLists({ Assets: assetList, Groups: assetGroupList, Meters: selected, Stations: locationList }))
                }
                }
                Show={showFilter == 'Meter'}
                Type={'multiple'}
                Title={"Filter by Meter"}
                GetEnum={getEnum}
                GetAddlFields={getAdditionalMeterFields}
                LocalStorageKey={'SEBrowser.MeterSelectTable'}
            >
                <ConfigurableColumn Key="AssetKey" Label="Key" Default={true}>
                    <Column<SystemCenter.Types.DetailedMeter>
                        Key="AssetKey"
                        Field="AssetKey"
                        HeaderStyle={{ width: 'auto' }}
                        RowStyle={{ width: 'auto' }}
                    >
                        Key
                    </Column>
                </ConfigurableColumn>
                <ConfigurableColumn Key="Name" Label="Name" Default={true}>
                    <Column<SystemCenter.Types.DetailedMeter>
                        Key="Name"
                        Field="Name"
                        HeaderStyle={{ width: 'auto' }}
                        RowStyle={{ width: 'auto' }}
                    >
                        Name
                    </Column>
                </ConfigurableColumn>
                <ConfigurableColumn Key="Location" Label="Substation" Default={true}>
                    <Column<SystemCenter.Types.DetailedMeter>
                        Key="Location"
                        Field="Location"
                        HeaderStyle={{ width: 'auto' }}
                        RowStyle={{ width: 'auto' }}
                    >
                        Substation
                    </Column>
                </ConfigurableColumn>
                <ConfigurableColumn Key="MappedAssets" Label="Assets" Default={true}>
                    <Column<SystemCenter.Types.DetailedMeter>
                        Key="MappedAssets"
                        Field="MappedAssets"
                        HeaderStyle={{ width: 'auto' }}
                        RowStyle={{ width: 'auto' }}
                    >
                        Assets
                    </Column>
                </ConfigurableColumn>
                <ConfigurableColumn Key="Make" Label="Make" Default={true}>
                    <Column<SystemCenter.Types.DetailedMeter>
                        Key="Make"
                        Field="Make"
                        HeaderStyle={{ width: 'auto' }}
                        RowStyle={{ width: 'auto' }}
                    >
                        Make
                    </Column>
                </ConfigurableColumn>
                <ConfigurableColumn Key="Model" Label="Model" Default={true}>
                    <Column<SystemCenter.Types.DetailedMeter>
                        Key="Model"
                        Field="Model"
                        HeaderStyle={{ width: 'auto' }}
                        RowStyle={{ width: 'auto' }}
                    >
                        Model
                    </Column>
                </ConfigurableColumn>
                <ConfigurableColumn Key="Description" Label="Description">
                    <Column<PQBrowser.IDetailedMeter>
                        Key="Description"
                        Field="Description"
                        HeaderStyle={{ width: 'auto' }}
                        RowStyle={{ width: 'auto' }}
                    >
                        Description
                    </Column>
                </ConfigurableColumn>
                <ConfigurableColumn Key="Customers" Label="Customers">
                    <Column<PQBrowser.IDetailedMeter>
                        Key="Customers"
                        Field="Customers"
                        HeaderStyle={{ width: 'auto' }}
                        RowStyle={{ width: 'auto' }}
                    >
                        Customers
                    </Column>
                </ConfigurableColumn>
                <ConfigurableColumn Key="AssetGroups" Label="Asset Groups">
                    <Column<PQBrowser.IDetailedMeter>
                        Key="AssetGroups"
                        Field="AssetGroups"
                        HeaderStyle={{ width: 'auto' }}
                        RowStyle={{ width: 'auto' }}
                    >
                        Asset Groups
                    </Column>
                </ConfigurableColumn>
            </DefaultSelects.Meter>
            <DefaultSelects.Asset
                ControllerAPIPath={AssetControllerPath}
                AddlFilters={[{
                    FieldName: 'AssetType',
                    SearchText: 'LineSegment',
                    Operator: '<>',
                    Type: 'enum',
                    IsPivotColumn: false
                }]}
                Selection={assetList}
                OnClose={(selected, conf) => {
                    setFilter('None');
                    if (conf)
                        dispatch(SetFilterLists({ Assets: selected, Groups: assetGroupList, Meters: meterList, Stations: locationList }))
                }}
                Show={showFilter == 'Asset'}
                Type={'multiple'}
                Title={"Filter by Asset"}
                GetEnum={getEnum}
                GetAddlFields={getAdditionalAssetFields}
                LocalStorageKey={'SEBrowser.AssetSelectTable'}
            >
                <ConfigurableColumn Key="AssetKey" Label="Key" Default={true}>
                    <Column<SystemCenter.Types.DetailedAsset>
                        Key="AssetKey"
                        Field="AssetKey"
                        HeaderStyle={{ width: 'auto' }}
                        RowStyle={{ width: 'auto' }}
                    >
                        Key
                    </Column>
                </ConfigurableColumn>
                <ConfigurableColumn Key="AssetName" Label="Name" Default={true}>
                    <Column<SystemCenter.Types.DetailedAsset>
                        Key="AssetName"
                        Field="AssetName"
                        HeaderStyle={{ width: 'auto' }}
                        RowStyle={{ width: 'auto' }}
                    >
                        Name
                    </Column>
                </ConfigurableColumn>
                <ConfigurableColumn Key="AssetType" Label="Asset Type" Default={true}>
                    <Column<SystemCenter.Types.DetailedAsset>
                        Key="AssetType"
                        Field="AssetType"
                        HeaderStyle={{ width: 'auto' }}
                        RowStyle={{ width: 'auto' }}
                    >
                        Asset Type
                    </Column>
                </ConfigurableColumn>
                <ConfigurableColumn Key="VoltageKV" Label="Voltage (kV)" Default={true}>
                    <Column<SystemCenter.Types.DetailedAsset>
                        Key="VoltageKV"
                        Field="VoltageKV"
                        HeaderStyle={{ width: 'auto' }}
                        RowStyle={{ width: 'auto' }}
                    >
                        Voltage (kV)
                    </Column>
                </ConfigurableColumn>
                <ConfigurableColumn Key="Meters" Label="Meters" Default={true}>
                    <Column<SystemCenter.Types.DetailedAsset>
                        Key="Meters" Field="Meters"
                        HeaderStyle={{ width: 'auto' }}
                        RowStyle={{ width: 'auto' }}
                    >
                        Meters
                    </Column>
                </ConfigurableColumn>
                <ConfigurableColumn Key="Locations" Label="Substations" Default={true}>
                    <Column<SystemCenter.Types.DetailedAsset>
                        Key="Locations"
                        Field="Locations"
                        HeaderStyle={{ width: 'auto' }}
                        RowStyle={{ width: 'auto' }}
                    >
                        Substations
                    </Column>
                </ConfigurableColumn>
                <ConfigurableColumn Key="Description" Label="Description">
                    <Column<PQBrowser.IDetailedAsset>
                        Key="Description"
                        Field="Description"
                        HeaderStyle={{ width: 'auto' }}
                        RowStyle={{ width: 'auto' }}
                    >
                        Description
                    </Column>
                </ConfigurableColumn>
                <ConfigurableColumn Key="Customers" Label="Customers">
                    <Column<PQBrowser.IDetailedAsset>
                        Key="Customers"
                        Field="Customers"
                        HeaderStyle={{ width: 'auto' }}
                        RowStyle={{ width: 'auto' }}
                    >
                        Customers
                    </Column>
                </ConfigurableColumn>
                <ConfigurableColumn Key="AssetGroups" Label="Asset Groups">
                    <Column<PQBrowser.IDetailedAsset>
                        Key="AssetGroups"
                        Field="AssetGroups"
                        HeaderStyle={{ width: 'auto' }}
                        RowStyle={{ width: 'auto' }}
                    >
                        Asset Groups
                    </Column>
                </ConfigurableColumn>
            </DefaultSelects.Asset>
            <DefaultSelects.Location
                ControllerAPIPath={LocationControlerPath}
                Selection={locationList}
                OnClose={(selected, conf) => {
                    setFilter('None');
                    if (conf)
                        dispatch(SetFilterLists({ Assets: assetList, Groups: assetGroupList, Meters: meterList, Stations: selected }))
                }}
                Show={showFilter == 'Station'}
                Type={'multiple'}
                Title={"Filter by Substation"}
                GetEnum={getEnum}
                GetAddlFields={() => { return () => {/*Do Nothing*/ } }}
            >
                <Column<SystemCenter.Types.DetailedLocation>
                    Key="Name"
                    Field="Name"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >
                    Name
                </Column>
                <Column<SystemCenter.Types.DetailedLocation>
                    Key="LocationKey"
                    Field="LocationKey"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >
                    Key
                </Column>
                <Column<SystemCenter.Types.DetailedLocation>
                    Key="Meters"
                    Field="Meters"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >
                    Meters
                </Column>
                <Column<SystemCenter.Types.DetailedLocation>
                    Key="Assets"
                    Field="Assets"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >
                    Assets
                </Column>
            </DefaultSelects.Location>
            <DefaultSelects.AssetGroup
                ControllerAPIPath={AssetGroupControllerPath}
                Selection={assetGroupList}
                OnClose={(selected, conf) => {
                    setFilter('None');
                    if (conf)
                        dispatch(SetFilterLists({ Assets: assetList, Groups: selected, Meters: meterList, Stations: locationList }))
                }}
                Show={showFilter == 'AssetGroup'}
                Type={'multiple'}
                Title={"Filter by Asset Group"}
                GetEnum={getEnum}
                GetAddlFields={() => { return () => {/*Do Nothing*/ } }}
            >
                <Column<OpenXDA.Types.AssetGroup>
                    Key="Name"
                    Field="Name"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >
                    Name
                </Column>
                <Column<OpenXDA.Types.AssetGroup>
                    Key="Assets"
                    Field="Assets"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >
                    Assets
                </Column>
                <Column<OpenXDA.Types.AssetGroup>
                    Key="Meters" Field="Meters"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >
                    Meters
                </Column>
                <Column<OpenXDA.Types.AssetGroup>
                    Key="Users" Field="Users"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >
                    Users
                </Column>
                <Column<OpenXDA.Types.AssetGroup>
                    Key="AssetGroups" Field="AssetGroups"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >
                    Sub Groups
                </Column>
            </DefaultSelects.AssetGroup>
        </>
    );
}

const getAdditionalAssetFields = (setFields: (filters: Search.IField<SystemCenter.Types.DetailedAsset>[]) => void) => {
    const handle = $.ajax({
        type: "GET",
        url: `${homePath}api/openXDA/AdditionalField/ParentTable/Asset/FieldName/0`,
        contentType: "application/json; charset=utf-8",
        cache: false,
        async: true
    });

    handle.done((d: SystemCenter.Types.AdditionalField[]) => {
        setFields(orderAdditionalFields<SystemCenter.Types.DetailedAsset>(d));
    });

    return () => {
        if (handle != null && handle.abort != null) handle.abort();
    };
}

const getAdditionalMeterFields = (setFields: (filters: Search.IField<SystemCenter.Types.DetailedMeter>[]) => void) => {
    const handle = $.ajax({
        type: "GET",
        url: `${homePath}api/openXDA/AdditionalField/ParentTable/Meter/FieldName/0`,
        contentType: "application/json; charset=utf-8",
        cache: false,
        async: true
    });

    handle.done((d: Array<SystemCenter.Types.AdditionalField>) => {
        setFields(orderAdditionalFields<SystemCenter.Types.DetailedMeter>(d));
    });

    return () => {
        if (handle != null && handle.abort != null) handle.abort();
    };
}

const orderAdditionalFields = <T,>(fields: SystemCenter.Types.AdditionalField[]): Search.IField<T>[] => {
    return _.orderBy(
        fields
            .filter(item => item.Searchable)
            .map(item => ({
                label: `[AF${item.ExternalDBTableID != undefined ? " " + item.ExternalDBTableID : ""}] ${item.FieldName}`,
                key: `AdditionalField.${item.FieldName}`,
                ...ConvertType(item.Type),
                isPivotField: false
            } as Search.IField<T>)),
        ["label"],
        ["asc"]
    );
}

export const getEnum = <T,>(setOptions: (options: Gemstone.TSX.Interfaces.ILabelValue<string>[]) => void, field: Search.IField<T>) => {
    if (field.type != 'enum' || field.enum == undefined || field.enum.length != 1)
        return () => {/*Do Nothing*/ };

    if (field.key == 'AssetType') {
        const handle = AssetTypeController.GetAll('Name', true, [{
            FieldName: 'Name',
            SearchParameter: 'LineSegment',
            Operator: '<>'
        }]);

        handle.done(d => setOptions(d.map(item => ({ Value: item.Name, Label: item.Name }))));

        return () => {
            if (handle.abort != null) handle.abort();
        }
    }

    const handle: JQuery.jqXHR<ValueListItemResponse[]> = getValueListGroup(field.enum[0].Value);

    handle.done(d => setOptions(d.map(item => ({ Value: item.Value.toString(), Label: item.AltValue ?? item.Value }))))

    return () => {
        if (handle != null && handle.abort != null) handle.abort();
    }
}

export const getValueListGroup = (groupName: string): JQuery.jqXHR<ValueListItemResponse[]> => $.ajax({
    type: 'GET',
    url: `${homePath}api/ValueList/Group/${groupName}`,
    contentType: 'application/json; charset=utf-8',
    dataType: 'json',
    cache: true,
    async: true
});

const ConvertType = (type: string) => {
    if (type == 'string' || type == 'integer' || type == 'number' || type == 'datetime' || type == 'boolean')
        return { type: type }
    return {
        type: 'enum', enum: [{ Label: type, Value: type }]
    }
}

const getShowNav = (): boolean => {
    if (Object.prototype.hasOwnProperty.call(localStorage, 'SEbrowser.EventSearch.ShowNav')) {
        const value = localStorage.getItem('SEbrowser.EventSearch.ShowNav');
        if (value == null)
            return true;
        return JSON.parse(value);
    }
    else
        return true;
}

export default EventSearchNavbar;
