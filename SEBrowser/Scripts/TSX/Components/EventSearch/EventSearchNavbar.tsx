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
import 'moment';
import _ from 'lodash';
import ReportTimeFilter from '../ReportTimeFilter';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { SelectAssetGroupList, SelectAssetList, SelectCharacteristicFilter, SelectMeterList, SelectReset, SelectStationList, SelectTimeFilter, SelectTypeFilter, SetFilterLists } from './EventSearchSlice';
import { ResetFilters, SetFilters, FetchEventSearches } from './EventSearchSlice';
import { AssetGroupSlice, AssetSlice, LocationSlice, MeterSlice, MagDurCurveSlice } from '../../Store';
import { DefaultSelects } from '@gpa-gemstone/common-pages';
import EventSearchFilterButton from './EventSearchbarFilterButton';
import { SystemCenter, OpenXDA } from '@gpa-gemstone/application-typings';
import { Input, Select, EnumCheckBoxes } from '@gpa-gemstone/react-forms';
import { Search } from '@gpa-gemstone/react-interactive';
import { SEBrowser, Redux } from '../../Global';
import { SetSettingsNumberResults, SelectSearchSettings } from './EventSearchSettingsSlice';


interface IProps {
    toggleVis: () => void,
    showNav: boolean,
}

const momentDateTimeFormat = "MM/DD/YYYY HH:mm:ss.SSS";
const momentDateFormat = "MM/DD/YYYY";
const momentTimeFormat = "HH:mm:ss.SSS";

const EventSearchNavbar = (props: IProps) => {
    const dispatch = useAppDispatch();
    const timeFilter = useAppSelector(SelectTimeFilter);
    const eventTypeFilter = useAppSelector(SelectTypeFilter);
    const eventCharacteristicFilter = useAppSelector(SelectCharacteristicFilter);
    const magDurStatus = useAppSelector(MagDurCurveSlice.Status);
    const magDurCurves = useAppSelector(MagDurCurveSlice.Data);

    const assetGroupList = useAppSelector(SelectAssetGroupList);

    const meterList = useAppSelector(SelectMeterList);
    const assetList = useAppSelector(SelectAssetList);
    const locationList = useAppSelector(SelectStationList);

    const reset = useAppSelector(SelectReset);



    const [showFilter, setFilter] = React.useState<('None' | 'Meter' | 'Asset' | 'AssetGroup' | 'Station')>('None');
    const [newEventCharacteristicFilter, setNewEventCharacteristicFilter] = React.useState<SEBrowser.IEventCharacteristicFilters>(eventCharacteristicFilter);

    const lineNeutralOptions = [{ Value: 'LL', Label: 'LL' }, { Value: 'LN', Label: 'LN' }, { Value: 'both', Label: 'LL/LN' }];

    const eventSearchSettingsState = useAppSelector(SelectSearchSettings)
    const [eventSearchSettings, setEventSearchSettings] = React.useState<Redux.SettingsState>(eventSearchSettingsState)


    React.useEffect(() => {
        if (magDurStatus == 'changed' || magDurStatus == 'unintiated')
            dispatch(MagDurCurveSlice.Fetch());
    }, [magDurStatus]);

    React.useEffect(() => {
        dispatch(SetFilters({
            characteristics: newEventCharacteristicFilter,
            time: timeFilter,
            types: eventTypeFilter
        }));
    }, [newEventCharacteristicFilter]);
    React.useEffect(() => {
        dispatch(SetSettingsNumberResults({
            numberResults: eventSearchSettings.NumberResults
        }));
        dispatch(FetchEventSearches())
    }, [eventSearchSettings]);

    function formatWindowUnit(i: number) {
        if (i == 7)
            return "Years";
        if (i == 6)
            return "Months";
        if (i == 5)
            return "Weeks";
        if (i == 4)
            return "Days";
        if (i == 3)
            return "Hours";
        if (i == 2)
            return "Minutes";
        if (i == 1)
            return "Seconds";
        return "Milliseconds";
    }

    function getEnum(setOptions, field) {
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

        handle.done(d => setOptions(d.map(item => ({ Value: item.Value.toString(), Label: item.Text }))))
        return () => {
            if (handle != null && handle.abort == null) handle.abort();
        }
    }

    function getAdditionalMeterFields(setFields) {
        let handle = $.ajax({
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
            let ordered = _.orderBy(d.filter(item => item.Searchable).map(item => (
                { label: `[AF${item.ExternalDB != undefined ? " " + item.ExternalDB : ''}] ${item.FieldName}`, key: item.FieldName, ...ConvertType(item.Type), isPivotField: true } as Search.IField<SystemCenter.Types.DetailedMeter>
            )), ['label'], ["asc"]);
            setFields(ordered)
        });

        return () => {
            if (handle != null && handle.abort == null) handle.abort();
        };
    }

    function getAdditionalAssetFields(setFields) {
        let handle = $.ajax({
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

            let ordered = _.orderBy(d.filter(item => item.Searchable).map(item => (
                { label: `[AF${item.ExternalDB != undefined ? " " + item.ExternalDB : ''}] ${item.FieldName}`, key: item.FieldName, ...ConvertType(item.Type), isPivotField: true } as Search.IField<SystemCenter.Types.DetailedAsset>
            )), ['label'], ["asc"]);
            setFields(ordered);
        });
        return () => {
            if (handle != null && handle.abort == null) handle.abort();
        };
    }

    if (!props.showNav)
        return (
            <nav className="navbar navbar-expand-xl navbar-light bg-light">
                <div className="collapse navbar-collapse" id="navbarSupportedContent" style={{ width: '100%' }}>
                    <div className="navbar-nav mr-auto">
                        <span className="navbar-text">
                            {timeFilter.date} {timeFilter.time} +/- {timeFilter.windowSize} {formatWindowUnit(timeFilter.timeWindowUnits)}
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
            <nav className="navbar navbar-expand-xl navbar-light bg-light">

                <div className="collapse navbar-collapse" id="navbarSupportedContent" style={{ width: '100%' }}>
                    <ul className="navbar-nav mr-auto" style={{ width: '100%' }}>
                        <li className="nav-item" style={{ width: '30%', paddingRight: 10 }}>
                            <ReportTimeFilter filter={timeFilter} setFilter={(f) =>
                                dispatch(SetFilters({
                                    characteristics: eventCharacteristicFilter,
                                    time: f,
                                    types: eventTypeFilter
                                }))} showQuickSelect={true} />
                        </li>
                        <li className="nav-item" style={{ width: '20%', paddingRight: 10 }}>
                            <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                                <legend className="w-auto" style={{ fontSize: 'large' }}>Event Types:</legend>
                                <form>
                                    <ul style={{ listStyleType: 'none', padding: 0, width: '50%', position: 'relative', float: 'left' }}>

                                        <li><label><input type="checkbox" onChange={() => {
                                            dispatch(SetFilters({
                                                characteristics: eventCharacteristicFilter,
                                                time: timeFilter,
                                                types: {
                                                    ...eventTypeFilter,
                                                    faults: !eventTypeFilter.faults,
                                                }
                                            }));
                                        }} checked={eventTypeFilter.faults} />  Faults </label></li>
                                        <li><label><input type="checkbox" onChange={() => {
                                            dispatch(SetFilters({
                                                characteristics: eventCharacteristicFilter,
                                                time: timeFilter,
                                                types: {
                                                    ...eventTypeFilter,
                                                    sags: !eventTypeFilter.sags,
                                                }
                                            }));
                                        }} checked={eventTypeFilter.sags} />  Sags</label></li>
                                        <li><label><input type="checkbox" onChange={() => {
                                            dispatch(SetFilters({
                                                characteristics: eventCharacteristicFilter,
                                                time: timeFilter,
                                                types: {
                                                    ...eventTypeFilter,
                                                    swells: !eventTypeFilter.swells,
                                                }
                                            }));
                                        }} checked={eventTypeFilter.swells} />  Swells</label></li>
                                        <li><label><input type="checkbox" onChange={() => {
                                            dispatch(SetFilters({
                                                characteristics: eventCharacteristicFilter,
                                                time: timeFilter,
                                                types: {
                                                    ...eventTypeFilter,
                                                    interruptions: !eventTypeFilter.interruptions,
                                                }
                                            }));
                                        }} checked={eventTypeFilter.interruptions} />  Interruptions</label></li>

                                        <li><label><input type="checkbox" onChange={() => {
                                            dispatch(SetFilters({
                                                characteristics: eventCharacteristicFilter,
                                                time: timeFilter,
                                                types: {
                                                    ...eventTypeFilter,
                                                    breakerOps: !eventTypeFilter.breakerOps,
                                                }
                                            }));
                                        }} checked={eventTypeFilter.breakerOps} />  Breaker Ops</label></li>
                                        <li><label><input type="checkbox" onChange={() => {
                                            dispatch(SetFilters({
                                                characteristics: eventCharacteristicFilter,
                                                time: timeFilter,
                                                types: {
                                                    ...eventTypeFilter,
                                                    transients: !eventTypeFilter.transients,
                                                }
                                            }));
                                        }} checked={eventTypeFilter.transients} />  Transients</label></li>
                                        <li><label><input type="checkbox" onChange={() => {
                                            dispatch(SetFilters({
                                                characteristics: eventCharacteristicFilter,
                                                time: timeFilter,
                                                types: {
                                                    ...eventTypeFilter,
                                                    relayTCE: !eventTypeFilter.relayTCE,
                                                }
                                            }));
                                        }} checked={eventTypeFilter.relayTCE} />  Breaker TCE</label></li>

                                        <li><label><input type="checkbox" onChange={() => {
                                            dispatch(SetFilters({
                                                characteristics: eventCharacteristicFilter,
                                                time: timeFilter,
                                                types: {
                                                    ...eventTypeFilter,
                                                    others: !eventTypeFilter.others,
                                                }
                                            }));
                                        }} checked={eventTypeFilter.others} />  Others</label></li>
                                    </ul>
                                    <ul style={{
                                        listStyleType: 'none', padding: 0, width: '50%', position: 'relative', float: 'right'
                                    }}>
                                        <li><label><input type="checkbox" onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            var value = e.target.checked;
                                            dispatch(SetFilters({
                                                characteristics: eventCharacteristicFilter,
                                                time: timeFilter,
                                                types: {
                                                    faults: value,
                                                    sags: value,
                                                    swells: value,
                                                    interruptions: value,
                                                    breakerOps: value,
                                                    transients: value,
                                                    relayTCE: value,
                                                    others: value
                                                }
                                            }))
                                        }} checked={(eventTypeFilter.breakerOps && eventTypeFilter.faults && eventTypeFilter.interruptions && eventTypeFilter.others &&
                                            eventTypeFilter.relayTCE && eventTypeFilter.sags && eventTypeFilter.swells && eventTypeFilter.transients) ||
                                            !(eventTypeFilter.breakerOps || eventTypeFilter.faults || eventTypeFilter.interruptions || eventTypeFilter.others ||
                                                eventTypeFilter.relayTCE || eventTypeFilter.sags || eventTypeFilter.swells || eventTypeFilter.transients)
                                        } disabled={!(eventTypeFilter.breakerOps || eventTypeFilter.faults || eventTypeFilter.interruptions || eventTypeFilter.others ||
                                            eventTypeFilter.relayTCE || eventTypeFilter.sags || eventTypeFilter.swells || eventTypeFilter.transients)} />  Select All </label></li>
                                    </ul>
                                </form>
                            </fieldset>
                        </li>
                        <li className="nav-item" style={{ width: '45%', paddingRight: 10 }}>
                            <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                                <legend className="w-auto" style={{ fontSize: 'large' }}>Event Characteristics:</legend>
                                <div className="row">
                                    <div className={"col-4"}>
                                        <form>
                                            <label style={{ margin: 0 }}>Duration (cycle):</label>
                                            <div className="form-group">
                                                <div className='input-group input-group-sm'>
                                                    <div className='col' style={{ width: '45%' }}>
                                                        <Input<SEBrowser.IEventCharacteristicFilters> Record={newEventCharacteristicFilter} Label='' Field='durationMin' Setter={setNewEventCharacteristicFilter} Valid={() => { return true }} Type='number' />
                                                    </div>
                                                <div className="input-group-append" style={{ height: '37px'}}>
                                                        <span className="input-group-text"> to </span>
                                                    </div>
                                                    <div className='col' style={{ width: '45%' }}>
                                                        <Input<SEBrowser.IEventCharacteristicFilters> Record={newEventCharacteristicFilter} Label='' Field='durationMax' Setter={setNewEventCharacteristicFilter} Valid={() => { return true }} Type='number' />
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                    <div className={"col-4"}>
                                        <form>
                                            <div className="form-group">
                                                <div className='input-group input-group-sm' style={{ width: '100%' }}>
                                                    <Select<SEBrowser.IEventCharacteristicFilters> Record={newEventCharacteristicFilter} Label='Mag-Dur:' Field='curveID' Setter={setNewEventCharacteristicFilter}
                                                        Options={magDurCurves.map((v) => (v.Area != undefined && v.Area.length > 0 ? { Value: v.ID.toString(), Label: v.Name } : null))} />
                                                </div>
                                                <div className='form-check form-check-inline'>
                                                    <input className="form-check-input" disabled={!eventCharacteristicFilter.curveOutside} type="checkbox" onChange={() => {
                                                        dispatch(SetFilters({
                                                            characteristics: {
                                                                ...eventCharacteristicFilter, curveInside: !eventCharacteristicFilter.curveInside
                                                            },
                                                            time: timeFilter,
                                                            types: eventTypeFilter,
                                                        }));
                                                    }} checked={eventCharacteristicFilter.curveInside} />
                                                    <label className="form-check-label">Inside</label>
                                                </div>
                                                <div className='form-check form-check-inline'>
                                                    <input className="form-check-input" disabled={!eventCharacteristicFilter.curveInside} type="checkbox" onChange={() => {
                                                        dispatch(SetFilters({
                                                            characteristics: {
                                                                ...eventCharacteristicFilter, curveOutside: !eventCharacteristicFilter.curveOutside
                                                            },
                                                            time: timeFilter,
                                                            types: eventTypeFilter,
                                                        }));
                                                    }} checked={eventCharacteristicFilter.curveOutside} />
                                                    <label className="form-check-label">Outside</label>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                    <div className={"col-4"}>
                                        <form>
                                            <label style={{ margin: 0 }}>Sags (p.u.):</label>
                                            <div className="form-group">
                                                <div className='input-group input-group-sm'>
                                                    <div className='col' style={{ width: '45%' }}>
                                                        <Input<SEBrowser.IEventCharacteristicFilters> Record={newEventCharacteristicFilter} Label='' Disabled={!eventTypeFilter.sags} Field='sagMin' Setter={setNewEventCharacteristicFilter} Valid={() => { return true }} Type='number' />
                                                    </div>
                                                    <div className="input-group-append" style={{ height: '37px' }}>
                                                        <span className="input-group-text"> to </span>
                                                    </div>
                                                    <div className='col' style={{ width: '45%' }}>
                                                        <Input<SEBrowser.IEventCharacteristicFilters> Record={newEventCharacteristicFilter} Label='' Disabled={!eventTypeFilter.sags} Field='sagMax' Setter={setNewEventCharacteristicFilter} Valid={() => { return true }} Type='number' />
                                                    </div>
                                                </div>
                                                <Select<SEBrowser.IEventCharacteristicFilters> Record={newEventCharacteristicFilter} Label='' Disabled={!eventTypeFilter.swells} Field='sagType' Setter={setNewEventCharacteristicFilter}
                                                    Options={lineNeutralOptions} />
                                            </div>
                                        </form>
                                    </div>
                                    <div className={"col-4"}>
                                        <form>
                                            <label style={{ margin: 0 }}>Phase:</label>
                                            <div className="form-group">
                                                <div className='form-check form-check-inline'>
                                                    <input className="form-check-input" type="checkbox" onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                        var value = e.target.checked;
                                                        dispatch(SetFilters({
                                                            characteristics: {
                                                                ...eventCharacteristicFilter, Phase: { A: value, B: value, C: value }
                                                            },
                                                            time: timeFilter,
                                                            types: eventTypeFilter
                                                        }))
                                                    }} checked={(eventCharacteristicFilter.Phase.A && eventCharacteristicFilter.Phase.B && eventCharacteristicFilter.Phase.C) ||
                                                        !(eventCharacteristicFilter.Phase.A || eventCharacteristicFilter.Phase.B || eventCharacteristicFilter.Phase.C)}
                                                        disabled={!(eventCharacteristicFilter.Phase.A || eventCharacteristicFilter.Phase.B || eventCharacteristicFilter.Phase.C)} />
                                                    <label className="form-check-label">Select All</label>
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <div className='form-check form-check-inline'>
                                                    <input className="form-check-input" type="checkbox" onChange={() => {
                                                        dispatch(SetFilters({
                                                            characteristics: {
                                                                ...eventCharacteristicFilter, Phase: { ...eventCharacteristicFilter.Phase, A: !eventCharacteristicFilter.Phase.A }
                                                            },
                                                            time: timeFilter,
                                                            types: eventTypeFilter,
                                                        }));
                                                    }} checked={eventCharacteristicFilter.Phase.A} />
                                                    <label className="form-check-label">A</label>
                                                </div>
                                                <div className='form-check form-check-inline'>
                                                    <input className="form-check-input" type="checkbox" onChange={() => {
                                                        dispatch(SetFilters({
                                                            characteristics: {
                                                                ...eventCharacteristicFilter, Phase: { ...eventCharacteristicFilter.Phase, B: !eventCharacteristicFilter.Phase.B }
                                                            },
                                                            time: timeFilter,
                                                            types: eventTypeFilter,
                                                        }));
                                                    }} checked={eventCharacteristicFilter.Phase.B} />
                                                    <label className="form-check-label">B</label>
                                                </div>
                                                <div className='form-check form-check-inline'>
                                                    <input className="form-check-input" type="checkbox" onChange={() => {
                                                        dispatch(SetFilters({
                                                            characteristics: {
                                                                ...eventCharacteristicFilter, Phase: { ...eventCharacteristicFilter.Phase, C: !eventCharacteristicFilter.Phase.C }
                                                            },
                                                            time: timeFilter,
                                                            types: eventTypeFilter,
                                                        }));
                                                    }} checked={eventCharacteristicFilter.Phase.C} />
                                                    <label className="form-check-label">C</label>
                                                </div>
                                            </div>
                                        </form>
                                    </div>

                                    <div className={"col-4"}>
                                        <form>
                                            <label style={{ margin: 0 }}>Transients (p.u.):</label>
                                            <div className="form-group">
                                                <div className='input-group input-group-sm'>
                                                    <div className='col' style={{ width: '45%' }}>
                                                        <Input<SEBrowser.IEventCharacteristicFilters> Record={newEventCharacteristicFilter} Label='' Disabled={!eventTypeFilter.transients} Field='transientMin' Setter={setNewEventCharacteristicFilter} Valid={() => { return true }} Type='number' />
                                                    </div>
                                                <div className="input-group-append" style={{ height: '37px'}}>
                                                        <span className="input-group-text"> to </span>
                                                    </div>
                                                    <div className='col' style={{ width: '45%' }}>
                                                        <Input<SEBrowser.IEventCharacteristicFilters> Record={newEventCharacteristicFilter} Label='' Disabled={!eventTypeFilter.transients} Field='transientMax' Setter={setNewEventCharacteristicFilter} Valid={() => { return true }} Type='number' />
                                                    </div>
                                                </div>
                                                <Select<SEBrowser.IEventCharacteristicFilters> Record={newEventCharacteristicFilter} Label='' Disabled={!eventTypeFilter.transients} Field='transientType' Setter={setNewEventCharacteristicFilter}
                                                Options={lineNeutralOptions}/>
                                            </div>
                                        </form>
                                    </div>
                                    <div className="col-4">
                                        <form>
                                            <label style={{ margin: 0 }}>Swells (p.u.):</label>
                                            <div className="form-group">
                                                <div className='input-group input-group-sm'>
                                                    <div className='col' style={{ width: '45%' }}>
                                                        <Input<SEBrowser.IEventCharacteristicFilters> Record={newEventCharacteristicFilter} Label='' Disabled={!eventTypeFilter.swells} Field='swellMin' Setter={setNewEventCharacteristicFilter} Valid={() => { return true }} Type='number' />
                                                    </div>
                                                <div className="input-group-append" style={{ height: '37px'}}>
                                                        <span className="input-group-text"> to </span>
                                                    </div>
                                                    <div className='col' style={{ width: '45%' }}>
                                                        <Input<SEBrowser.IEventCharacteristicFilters> Record={newEventCharacteristicFilter} Label='' Disabled={!eventTypeFilter.swells} Field='swellMax' Setter={setNewEventCharacteristicFilter} Valid={() => { return true }} Type='number' />
                                                    </div>
                                                </div>
                                                <Select<SEBrowser.IEventCharacteristicFilters> Record={newEventCharacteristicFilter} Label='' Disabled={!eventTypeFilter.swells} Field='swellType' Setter={setNewEventCharacteristicFilter}
                                                Options={lineNeutralOptions}/>
                                            </div>
                                        </form>
                                    </div>
                                </div>


                            </fieldset>
                        </li>

                        <li className="nav-item" style={{ width: '15%', paddingRight: 10 }}>
                            <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                                <legend className="w-auto" style={{ fontSize: 'large' }}>Other Filters:</legend>
                                <div className={"row"}>
                                    <div className={'col'}>
                                        <EventSearchFilterButton<SystemCenter.Types.DetailedMeter> Type={'Meter'} OnClick={() => setFilter('Meter')} Data={meterList} />
                                    </div>
                                </div>
                                <div className={"row"}>
                                    <div className={'col'}>
                                        <EventSearchFilterButton<SystemCenter.Types.DetailedAsset> Type={'Asset'} OnClick={() => setFilter('Asset')} Data={assetList} />
                                    </div>
                                </div>
                                <div className={"row"}>
                                    <div className={'col'}>
                                        <EventSearchFilterButton<OpenXDA.Types.AssetGroup> Type={'AssetGroup'} OnClick={() => setFilter('AssetGroup')} Data={assetGroupList} />
                                    </div>
                                </div>
                                <div className={"row"}>
                                    <div className={'col'}>
                                        <EventSearchFilterButton<SystemCenter.Types.DetailedLocation> Type={'Station'} OnClick={() => setFilter('Station')} Data={locationList} />
                                    </div>
                                </div>

                            </fieldset>
                        </li>

                        <li className="nav-item" style={{ width: '15%', paddingRight: 10 }}>
                            <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                                <legend className="w-auto" style={{ fontSize: 'large' }}>Settings:</legend>
                                <div className={"row"}>
                                    <div className={'col'}>
                                        <Input<Redux.SettingsState> Record={eventSearchSettings} Field='NumberResults' Setter={setEventSearchSettings} Valid={() => { return true }} Label='Number of Results:' Type='number' />
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
                Title={"Filter by Location"}
                GetEnum={getEnum}
                GetAddlFields={() => { return () => { } }} />
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
                GetAddlFields={() => { return () => { } }} />
        </>
    );
}

export default EventSearchNavbar;