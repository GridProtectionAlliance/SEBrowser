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
import ReportTimeFilter from '../../ReportTimeFilter';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { SelectAssetGroupList, SelectAssetList, SelectMeterList, SelectReset, SelectStationList, SelectTimeFilter, SetFilterLists } from '../../../Store/EventSearchSlice';
import { ResetFilters, SetFilters } from '../../../Store/EventSearchSlice';
import { AssetGroupControllerPath, AssetControllerPath, LocationControlerPath, MeterControllerPath } from '../../../Store/ControllerFunctions';
import { DefaultSelects } from '../../Common/DefaultSelects';
import NavbarFilterButton from '../../Common/NavbarFilterButton';
import { SystemCenter, OpenXDA } from '@gpa-gemstone/application-typings';
import { Search } from '@gpa-gemstone/react-interactive';
import { Column } from '@gpa-gemstone/react-table';
import EventSearchTypeFilters from '../EventSearchTypeFilter/EventSearchTypeFilter';
import { SelectDateTimeSetting, SelectTimeZone } from '../../../Store/SettingsSlice';
import { getMoment, getStartEndTime, readableUnit } from '../TimeWindowUtils';
import EventCharacteristics from './EventCharacteristics';
import { useGetContainerPosition } from '@gpa-gemstone/helper-functions';

interface IProps {
    toggleVis: () => void,
    showNav: boolean,
    setHeight: (h: number) => void
}

const momentDateTimeFormat = "MM/DD/YYYY HH:mm:ss.SSS";

const EventSearchNavbar = (props: IProps) => {
    const dispatch = useAppDispatch();

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

    const [timeRange, setTimeRange] = React.useState<string>('');
    const [showFilter, setFilter] = React.useState<('None' | 'Meter' | 'Asset' | 'AssetGroup' | 'Station')>('None');

    React.useEffect(() => props.setHeight(navHeight), [navHeight])

    React.useEffect(() => {
        let r = "";
        const center = getMoment(timeFilter.date, timeFilter.time);
        const [start, end] = getStartEndTime(center, timeFilter.windowSize, timeFilter.timeWindowUnits);

        if (dateTimeSetting == 'startEnd')
            r = `${start.format(momentDateTimeFormat)}`;
        if (dateTimeSetting == 'startWindow')
            r = `${start.format(momentDateTimeFormat)} (${timeZone})`;
        else if (dateTimeSetting == 'endWindow')
            r = `${end.format(momentDateTimeFormat)} (${timeZone})`;
        else if (dateTimeSetting == 'center')
            r = `${center.format(momentDateTimeFormat)} (${timeZone})`;

        if (dateTimeSetting == 'startEnd')
            r += ` to ${end.format(momentDateTimeFormat)} (${timeZone})`;
        else if (dateTimeSetting == 'center')
            r += ` +/- ${timeFilter.windowSize} ${readableUnit(timeFilter.timeWindowUnits)}`;
        else if (dateTimeSetting == 'startWindow')
            r += ` + ${2 * timeFilter.windowSize} ${readableUnit(timeFilter.timeWindowUnits)}`;
        else if (dateTimeSetting == 'endWindow')
            r += ` - ${2 * timeFilter.windowSize} ${readableUnit(timeFilter.timeWindowUnits)}`;

        setTimeRange(r);
    }, [timeFilter, dateTimeSetting, timeZone])

    function getEnum(setOptions, field) {
        if (field.type != 'enum' || field.enum == undefined || field.enum.length != 1)
            return () => {/*Do Nothing*/ };

        const handle = $.ajax({
            type: "GET",
            url: `${homePath}api/ValueList/Group/${field.enum[0].Value}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        handle.done(d => setOptions(d.map(item => ({ Value: item.Value.toString(), Label: item.Text }))))
        return () => {
            if (handle != null && handle.abort == null) handle.abort();
        }
    }

    function getAdditionalMeterFields(setFields) {
        const handle = $.ajax({
            type: "GET",
            url: `${homePath}api/openXDA/AdditionalField/ParentTable/Meter/FieldName/0`,
            contentType: "application/json; charset=utf-8",
            cache: false,
            async: true
        });

        function ConvertType(type: string) {
            if (type == 'string' || type == 'integer' || type == 'number' || type == 'datetime' || type == 'boolean')
                return { type: type }
            return {
                type: 'enum', enum: [{ Label: type, Value: type }]
            }
        }

        handle.done((d: Array<SystemCenter.Types.AdditionalField>) => {
            const ordered = _.orderBy(d.filter(item => item.Searchable).map(item => (
                { label: `[AF${item.ExternalDBTableID != undefined ? " " + item.ExternalDBTableID : ''}] ${item.FieldName}`, key: `AdditionalField.${item.FieldName}`, ...ConvertType(item.Type), isPivotField: false } as Search.IField<SystemCenter.Types.DetailedMeter>
            )), ['label'], ["asc"]);
            setFields(ordered)
        });

        return () => {
            if (handle != null && handle.abort == null) handle.abort();
        };
    }

    function getAdditionalAssetFields(setFields) {
        const handle = $.ajax({
            type: "GET",
            url: `${homePath}api/openXDA/AdditionalField/ParentTable/Asset/FieldName/0`,
            contentType: "application/json; charset=utf-8",
            cache: false,
            async: true
        });

        function ConvertType(type: string) {
            if (type == 'string' || type == 'integer' || type == 'number' || type == 'datetime' || type == 'boolean')
                return { type: type }
            return {
                type: 'enum', enum: [{ Label: type, Value: type }]
            }
        }

        handle.done((d: Array<SystemCenter.Types.AdditionalField>) => {

            const ordered = _.orderBy(d.filter(item => item.Searchable).map(item => (
                { label: `[AF${item.ExternalDBTableID != undefined ? " " + item.ExternalDBTableID : ''}] ${item.FieldName}`, key: `AdditionalField.${item.FieldName}`, ...ConvertType(item.Type), isPivotField: false } as Search.IField<SystemCenter.Types.DetailedAsset>
            )), ['label'], ["asc"]);
            setFields(ordered);
        });
        return () => {
            if (handle != null && handle.abort == null) handle.abort();
        };
    }

    if (timeFilter === null) return null;

    if (!props.showNav)
        return (
            <nav className="navbar navbar-expand-xl navbar-light bg-light">
                <div className="collapse navbar-collapse" id="navbarSupportedContent" style={{ width: '100%' }}>
                    <div className="navbar-nav mr-auto">
                        <span className="navbar-text">
                            {timeRange}
                        </span>
                    </div>
                    <div className="navbar-nav ml-auto" >
                        <button type="button" className={`btn btn-${(!reset ? 'warning' : 'primary')} btn-sm`} onClick={() => props.toggleVis()}>Show Filters</button>
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
                            <ReportTimeFilter
                                filter={timeFilter}
                                setFilter={(f) => dispatch(SetFilters({ time: f }))}
                                showQuickSelect={true}
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
                                            Data={meterList}
                                        />
                                    </div>
                                </div>
                                <div className={"row"}>
                                    <div className={'col'}>
                                        <NavbarFilterButton<SystemCenter.Types.DetailedAsset>
                                            Type={'Asset'}
                                            OnClick={() => setFilter('Asset')}
                                            Data={assetList}
                                        />
                                    </div>
                                </div>
                                <div className={"row"}>
                                    <div className={'col'}>
                                        <NavbarFilterButton<OpenXDA.Types.AssetGroup>
                                            Type={'AssetGroup'}
                                            OnClick={() => setFilter('AssetGroup')}
                                            Data={assetGroupList}
                                        />
                                    </div>
                                </div>
                                <div className={"row"}>
                                    <div className={'col'}>
                                        <NavbarFilterButton<SystemCenter.Types.DetailedLocation>
                                            Type={'Station'}
                                            OnClick={() => setFilter('Station')}
                                            Data={locationList}
                                        />
                                    </div>
                                </div>
                            </fieldset>
                        </li>
                    </ul>
                    <div className="btn-group-vertical float-right">
                        <button type="button" style={{ marginBottom: 5 }} className={`btn btn-${(!reset ? 'warning' : 'primary')} btn-sm`} onClick={() => props.toggleVis()}>
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
            >
                <Column<SystemCenter.Types.DetailedMeter>
                    Key="AssetKey"
                    Field="AssetKey"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >
                    Key
                </Column>
                <Column<SystemCenter.Types.DetailedMeter>
                    Key="Name"
                    Field="Name"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >
                    Name
                </Column>
                <Column<SystemCenter.Types.DetailedMeter>
                    Key="Location"
                    Field="Location"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >
                    Substation
                </Column>
                <Column<SystemCenter.Types.DetailedMeter>
                    Key="MappedAssets"
                    Field="MappedAssets"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >
                    Assets
                </Column>
                <Column<SystemCenter.Types.DetailedMeter>
                    Key="Make"
                    Field="Make"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >
                    Make
                </Column>
                <Column<SystemCenter.Types.DetailedMeter>
                    Key="Model"
                    Field="Model"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >
                    Model
                </Column>
            </DefaultSelects.Meter>
            <DefaultSelects.Asset
                ControllerAPIPath={AssetControllerPath}
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
            >
                <Column<SystemCenter.Types.DetailedAsset>
                    Key="AssetKey"
                    Field="AssetKey"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >
                    Key
                </Column>
                <Column<SystemCenter.Types.DetailedAsset>
                    Key="AssetName"
                    Field="AssetName"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >
                    Name
                </Column>
                <Column<SystemCenter.Types.DetailedAsset>
                    Key="AssetType"
                    Field="AssetType"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >
                    Asset Type
                </Column>
                <Column<SystemCenter.Types.DetailedAsset>
                    Key="VoltageKV"
                    Field="VoltageKV"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >
                    Voltage (kV)
                </Column>
                <Column<SystemCenter.Types.DetailedAsset>
                    Key="Meters" Field="Meters"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >
                    Meters
                </Column>
                <Column<SystemCenter.Types.DetailedAsset>
                    Key="Locations"
                    Field="Locations"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >
                    Substations
                </Column>
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

export default EventSearchNavbar;
