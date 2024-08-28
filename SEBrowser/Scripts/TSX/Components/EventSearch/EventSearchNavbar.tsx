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
import { useAppDispatch, useAppSelector } from '../../hooks';
import { SelectAssetGroupList, SelectAssetList, SelectCharacteristicFilter, SelectMeterList, SelectReset, SelectStationList, SelectTimeFilter, SelectTypeFilter, SetFilterLists } from './EventSearchSlice';
import { ResetFilters, SetFilters } from './EventSearchSlice';
import { AssetGroupSlice, AssetSlice, LocationSlice, MeterSlice, MagDurCurveSlice, EventTypeSlice } from '../../Store';
import { DefaultSelects, TimeFilter, EventTypeFilter, EventCharacteristicFilter } from '@gpa-gemstone/common-pages';
import NavbarFilterButton from '../Common/NavbarFilterButton';
import { SystemCenter, OpenXDA } from '@gpa-gemstone/application-typings';
import { Search } from '@gpa-gemstone/react-interactive';
import { SelectDateTimeSetting, SelectTimeZone } from '../SettingsSlice';
import { getMoment, getStartEndTime, readableUnit } from './TimeWindowUtils';

interface IProps {
    toggleVis: () => void,
    showNav: boolean,
    setHeight: (h: number) => void
}

const momentDateTimeFormat = "MM/DD/YYYY HH:mm:ss.SSS";
type TimeUnit = 'y' | 'M' | 'w' | 'd' | 'h' | 'm' | 's' | 'ms'
const units = ['ms', 's', 'm', 'h', 'd', 'w', 'M', 'y'] as TimeUnit[]

const EventSearchNavbar = (props: IProps) => {
    const navRef = React.useRef(null);

    const dispatch = useAppDispatch();
    const eventCharacteristicFilter = useAppSelector(SelectCharacteristicFilter);
    const timeFilter = useAppSelector(SelectTimeFilter);
    const eventTypeFilter = useAppSelector(SelectTypeFilter);
    const magDurStatus = useAppSelector(MagDurCurveSlice.Status);
    const magDurCurves = useAppSelector(MagDurCurveSlice.Data);
    const timeZone = useAppSelector(SelectTimeZone);

    const assetGroupList = useAppSelector(SelectAssetGroupList);

    const meterList = useAppSelector(SelectMeterList);
    const assetList = useAppSelector(SelectAssetList);
    const locationList = useAppSelector(SelectStationList);

    const eventTypes = useAppSelector(EventTypeSlice.Data);
    const evtTypeStatus = useAppSelector(EventTypeSlice.Status);

    const reset = useAppSelector(SelectReset);

    const [height, setHeight] = React.useState<number>(0);

    const [showFilter, setFilter] = React.useState<('None' | 'Meter' | 'Asset' | 'AssetGroup' | 'Station')>('None');
    const dateTimeSetting = useAppSelector(SelectDateTimeSetting)

    React.useLayoutEffect(() => setHeight(navRef?.current?.offsetHeight ?? 0))
    React.useEffect(() => props.setHeight(height), [height])

    const [timeRange, setTimeRange] = React.useState<string>('');

    React.useEffect(() => {
        if (magDurStatus == 'changed' || magDurStatus == 'unintiated')
            dispatch(MagDurCurveSlice.Fetch());
    }, [magDurStatus]);

    React.useEffect(() => {
        if (evtTypeStatus == 'changed' || evtTypeStatus == 'unintiated')
            dispatch(EventTypeSlice.Fetch());
    }, [evtTypeStatus]);

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
        let handle = null;
        if (field.type != 'enum' || field.enum == undefined || field.enum.length != 1)
            return () => {/*Do Nothing*/ };

        handle = $.ajax({
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
                { label: `[AF${item.ExternalDBTableID != undefined ? " " + item.ExternalDBTableID : ''}] ${item.FieldName}`, key: item.FieldName, ...ConvertType(item.Type), isPivotField: true } as Search.IField<SystemCenter.Types.DetailedMeter>
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
            url: `${homePath}api/SystemCenter/AdditionalField/ParentTable/Asset/FieldName/0`,
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
                { label: `[AF${item.ExternalDBTableID != undefined ? " " + item.ExternalDBTableID : ''}] ${item.FieldName}`, key: item.FieldName, ...ConvertType(item.Type), isPivotField: true } as Search.IField<SystemCenter.Types.DetailedAsset>
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

    // Wrapper function to match the expected type for setFilter
    const handleSetFilter = (center: string, start: string, end: string, unit: TimeUnit, duration: number) => {
        dispatch(SetFilters({
            time: {
                time: center.split(' ')[1],
                date: center.split(' ')[0],
                windowSize: duration / 2.0,
                timeWindowUnits: units.findIndex(u => u == unit)
            }
        }))
    };

    return (
        <>
            <nav className="navbar navbar-expand-xl navbar-light bg-light" ref={navRef}>
                <div className="collapse navbar-collapse" id="navbarSupportedContent" style={{ width: '100%' }}>
                    <ul className="navbar-nav mr-auto" style={{ width: '100%' }}>
                        <li className="nav-item" style={{ width: '30%', paddingRight: 10 }}>
                            <TimeFilter filter={{ center: timeFilter.date + ' ' + timeFilter.time, halfDuration: timeFilter.windowSize, unit: units[timeFilter.timeWindowUnits] }}
                                setFilter={handleSetFilter} showQuickSelect={true} timeZone={timeZone}
                                dateTimeSetting={dateTimeSetting} isHorizontal={false} />
                        </li>
                        <li className="nav-item" style={{ width: '20%', paddingRight: 10 }}>
                            <EventTypeFilter SetSelectedTypeIDs={(types: number[]) => { dispatch(SetFilters({ types })) }} EventTypes={eventTypes} SelectedTypeID={eventTypeFilter} Height={height} />
                        </li>
                        <li className="nav-item" style={{ width: '45%', paddingRight: 10 }}>
                            <EventCharacteristicFilter eventTypes={eventTypes} eventCharacteristicFilter={eventCharacteristicFilter} magDurCurves={magDurCurves}
                                eventTypeFilter={eventTypeFilter} setEventFilters={ (characteristics, types) => { dispatch(SetFilters( {characteristics, types} ))} } />
                        </li>
                        <li className="nav-item" style={{ width: '15%', paddingRight: 10 }}>
                            <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                                <legend className="w-auto" style={{ fontSize: 'large' }}>Other Filters:</legend>
                                <div className={"row"}>
                                    <div className={'col'}>
                                        <NavbarFilterButton<SystemCenter.Types.DetailedMeter> Type={'Meter'} OnClick={() => setFilter('Meter')} Data={meterList} />
                                    </div>
                                </div>
                                <div className={"row"}>
                                    <div className={'col'}>
                                        <NavbarFilterButton<SystemCenter.Types.DetailedAsset> Type={'Asset'} OnClick={() => setFilter('Asset')} Data={assetList} />
                                    </div>
                                </div>
                                <div className={"row"}>
                                    <div className={'col'}>
                                        <NavbarFilterButton<OpenXDA.Types.AssetGroup> Type={'AssetGroup'} OnClick={() => setFilter('AssetGroup')} Data={assetGroupList} />
                                    </div>
                                </div>
                                <div className={"row"}>
                                    <div className={'col'}>
                                        <NavbarFilterButton<SystemCenter.Types.DetailedLocation> Type={'Station'} OnClick={() => setFilter('Station')} Data={locationList} />
                                    </div>
                                </div>

                            </fieldset>
                        </li>
                    </ul>
                    <div className="btn-group-vertical float-right">
                        <button type="button" style={{ marginBottom: 5 }} className={`btn btn-${(!reset ? 'warning' : 'primary')} btn-sm`} onClick={() => props.toggleVis()}>Hide Filters</button>
                        <button type="button" className="btn btn-danger btn-sm" disabled={reset} onClick={() => dispatch(ResetFilters())}>Reset Filters</button>
                    </div>
                </div>
            </nav>

            <DefaultSelects.Meter
                Slice={MeterSlice}
                Selection={meterList}
                OnClose={(selected, conf) => {
                    setFilter('None');
                    if (conf)
                        dispatch(SetFilterLists({ Assets: assetList, Groups: assetGroupList, Meters: selected, Stations: locationList }))
                }
                }
                Show={showFilter == 'Meter'}
                Type={'multiple'}
                Columns={[
                    { key: 'AssetKey', field: 'AssetKey', label: 'Key', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' } },
                    { key: 'Name', field: 'Name', label: 'Name', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' } },
                    { key: 'Location', field: 'Location', label: 'Substation', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' } },
                    { key: 'MappedAssets', field: 'MappedAssets', label: 'Assets', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' } },
                    { key: 'Make', field: 'Make', label: 'Make', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' } },
                    { key: 'Model', field: 'Model', label: 'Model', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' } },
                    { key: 'Scroll', label: '', headerStyle: { width: 17, padding: 0 }, rowStyle: { width: 0, padding: 0 } },
                ]}
                Title={"Filter by Meter"}
                GetEnum={getEnum}
                GetAddlFields={getAdditionalMeterFields} />
            <DefaultSelects.Asset
                Slice={AssetSlice}
                Selection={assetList}
                OnClose={(selected, conf) => {
                    setFilter('None');
                    if (conf)
                        dispatch(SetFilterLists({ Assets: selected, Groups: assetGroupList, Meters: meterList, Stations: locationList }))
                }}
                Show={showFilter == 'Asset'}
                Type={'multiple'}
                Columns={[
                    { key: 'AssetKey', field: 'AssetKey', label: 'Key', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' } },
                    { key: 'AssetName', field: 'AssetName', label: 'Name', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' } },
                    { key: 'AssetType', field: 'AssetType', label: 'Asset Type', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' } },
                    { key: 'VoltageKV', field: 'VoltageKV', label: 'Voltage (kV)', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' } },
                    { key: 'Meters', field: 'Meters', label: 'Meters', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' } },
                    { key: 'Locations', field: 'Locations', label: 'Substations', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' } }
                ]}
                Title={"Filter by Asset"}
                GetEnum={getEnum}
                GetAddlFields={getAdditionalAssetFields} />
            <DefaultSelects.Location
                Slice={LocationSlice}
                Selection={locationList}
                OnClose={(selected, conf) => {
                    setFilter('None');
                    if (conf)
                        dispatch(SetFilterLists({ Assets: assetList, Groups: assetGroupList, Meters: meterList, Stations: selected }))
                }}
                Show={showFilter == 'Station'}
                Type={'multiple'}
                Columns={[
                    { key: 'Name', field: 'Name', label: 'Name', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' } },
                    { key: 'LocationKey', field: 'LocationKey', label: 'Key', headerStyle: { width: '30%' }, rowStyle: { width: '30%' } },
                    //{ key: 'Type', field: 'Type', label: 'Type', headerStyle: { width: '10%' }, rowStyle: { width: '10%' } },
                    { key: 'Meters', field: 'Meters', label: 'Meters', headerStyle: { width: '10%' }, rowStyle: { width: '10%' } },
                    { key: 'Assets', field: 'Assets', label: 'Assets', headerStyle: { width: '10%' }, rowStyle: { width: '10%' } },
                    { key: 'Scroll', label: '', headerStyle: { width: 17, padding: 0 }, rowStyle: { width: 0, padding: 0 } },
                ]}
                Title={"Filter by Substation"}
                GetEnum={getEnum}
                GetAddlFields={() => { return () => {/*Do Nothing*/ } }} />
            <DefaultSelects.AssetGroup
                Slice={AssetGroupSlice}
                Selection={assetGroupList}
                OnClose={(selected, conf) => {
                    setFilter('None');
                    if (conf)
                        dispatch(SetFilterLists({ Assets: assetList, Groups: selected, Meters: meterList, Stations: locationList }))
                }}
                Show={showFilter == 'AssetGroup'}
                Type={'multiple'}
                Columns={[
                    { key: 'Name', field: 'Name', label: 'Name', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' } },
                    { key: 'Assets', field: 'Assets', label: 'Assets', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' } },
                    { key: 'Meters', field: 'Meters', label: 'Meters', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' } },
                    { key: 'Users', field: 'Users', label: 'Users', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' } },
                    { key: 'AssetGroups', field: 'AssetGroups', label: 'SubGroups', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' } },
                    { key: 'Scroll', label: '', headerStyle: { width: 17, padding: 0 }, rowStyle: { width: 0, padding: 0 } },
                ]}
                Title={"Filter by Asset Group"}
                GetEnum={getEnum}
                GetAddlFields={() => { return () => {/*Do Nothing*/ } }} />
        </>
    );
}

export default EventSearchNavbar;