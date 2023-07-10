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
import moment from 'moment';
import _ from 'lodash';
import ReportTimeFilter from '../ReportTimeFilter';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { SelectAssetGroupList, SelectAssetList, SelectCharacteristicFilter, SelectMeterList, SelectReset, SelectStationList, SelectTimeFilter, SelectTypeFilter, SetFilterLists } from './EventSearchSlice';
import { ResetFilters,  SetFilters } from './EventSearchSlice';
import { AssetGroupSlice, AssetSlice, LocationSlice, MeterSlice, MagDurCurveSlice, EventTypeSlice } from '../../Store';
import { DefaultSelects } from '@gpa-gemstone/common-pages';
import EventSearchFilterButton from './EventSearchbarFilterButton';
import { SystemCenter, OpenXDA } from '@gpa-gemstone/application-typings';
import { Input, Select, MultiCheckBoxSelect } from '@gpa-gemstone/react-forms';
import { Search } from '@gpa-gemstone/react-interactive';
import { SEBrowser } from '../../Global';
import EventSearchTypeFilters from './EventSearchTypeFilter';
import { SelectEventSearchSettings } from '../SettingsSlice';

interface IProps {
    toggleVis: () => void,
    showNav: boolean,
    setHeight: (h: number) => void
}

const momentDateTimeFormat = "MM/DD/YYYY HH:mm:ss.SSS";
const momentDateFormat = "MM/DD/YYYY";
const momentTimeFormat = "HH:mm:ss.SSS";

const EventSearchNavbar = (props: IProps) => {
    const navRef = React.useRef(null);

    const dispatch = useAppDispatch();
    const eventCharacteristicFilter = useAppSelector(SelectCharacteristicFilter);
    const timeFilter = useAppSelector(SelectTimeFilter);
    const eventTypeFilter = useAppSelector(SelectTypeFilter);
    const magDurStatus = useAppSelector(MagDurCurveSlice.Status);
    const magDurCurves = useAppSelector(MagDurCurveSlice.Data);

    const assetGroupList = useAppSelector(SelectAssetGroupList);

    const meterList = useAppSelector(SelectMeterList);
    const assetList = useAppSelector(SelectAssetList);
    const locationList = useAppSelector(SelectStationList);

    const eventTypes = useAppSelector(EventTypeSlice.Data);
    const evtTypeStatus = useAppSelector(EventTypeSlice.Status);

    const reset = useAppSelector(SelectReset);

    const [height, setHeight] = React.useState<number>(0);
    
    const [showFilter, setFilter] = React.useState<('None' | 'Meter' | 'Asset' | 'AssetGroup' | 'Station')>('None');
    const [newEventCharacteristicFilter, setNewEventCharacteristicFilter] = React.useState<SEBrowser.IEventCharacteristicFilters>(null);
    const [newTypeFilter, setNewTypeFilter] = React.useState<number[]>(null);
    const lineNeutralOptions = [{ Value: 'LL', Label: 'LL' }, { Value: 'LN', Label: 'LN' }, { Value: 'both', Label: 'LL/LN' }];
    const dateTimeSetting = useAppSelector((state: Redux.StoreState) => SelectEventSearchSettings(state).DateTimeSetting)

    React.useLayoutEffect(() => setHeight(navRef?.current?.offsetHeight ?? 0))
    React.useEffect(() => props.setHeight(height), [height])

    React.useEffect(() => { setNewTypeFilter(eventTypeFilter) }, [eventTypeFilter])
    React.useEffect(() => { setNewEventCharacteristicFilter(eventCharacteristicFilter) }, [eventCharacteristicFilter])

    const [newPhases, setNewPhases] = React.useState<{ Value: number, Text: string, Selected: boolean }[]>([]);

    React.useEffect(() => {
        setNewEventCharacteristicFilter(eventCharacteristicFilter);
        setNewTypeFilter(eventTypeFilter);
        const setupPhases: { Value: number, Text: string, Selected: boolean }[] = [];
        Object.keys(eventCharacteristicFilter.phases).forEach((key, index) => setupPhases.push({ Value: index, Text: key, Selected: eventCharacteristicFilter.phases[key] }));
        setNewPhases(setupPhases);
    }, []);

    React.useEffect(() => {
        if (magDurStatus == 'changed' || magDurStatus == 'unintiated')
            dispatch(MagDurCurveSlice.Fetch());
    }, [magDurStatus]);

    React.useEffect(() => {
        if (evtTypeStatus == 'changed' || evtTypeStatus == 'unintiated')
            dispatch(EventTypeSlice.Fetch());
    }, [evtTypeStatus]);

    React.useEffect(() => {

        const characteristics = validEventCharacteristicsFilter() ? newEventCharacteristicFilter : undefined;

        dispatch(SetFilters({
            characteristics,
            types: newTypeFilter
        }));
    }, [newEventCharacteristicFilter, newTypeFilter]);   


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

    function formatWindowUnitLC(i: number) {
        if (i == 7)
            return "y";
        if (i == 6)
            return "M";
        if (i == 5)
            return "w";
        if (i == 4)
            return "d";
        if (i == 3)
            return "h";
        if (i == 2)
            return "m";
        if (i == 1)
            return "s";
        return "ms";
    }

    const calculateDateRange = () => {

        let centralDateTime = moment(`${timeFilter.date} ${timeFilter.time}`, momentDateTimeFormat);
        let startDate = moment(centralDateTime)
            .subtract(timeFilter.windowSize, formatWindowUnitLC(timeFilter.timeWindowUnits));
        let endDate = moment(centralDateTime)
            .add(timeFilter.windowSize, formatWindowUnitLC(timeFilter.timeWindowUnits));
        let timeSpan = moment.duration(endDate.diff(startDate, 'milliseconds'));
        let timeWindow = Number(timeSpan) / 2;
        let humanizedTimeWindow = moment.duration(timeWindow).humanize();

        if (dateTimeSetting == 'center') {
            return `${centralDateTime} +/- ${humanizedTimeWindow}`;
        } else if (dateTimeSetting == 'startWindow') {
            return `Start: ${startDate} + ${humanizedTimeWindow}`;
        } else if (dateTimeSetting == 'endWindow') {
            return `End: ${endDate} - ${humanizedTimeWindow}`;
        } else if (dateTimeSetting == 'startEnd') {
            return `${startDate} - ${endDate}`;
        } else return `${centralDateTime} +/- ${humanizedTimeWindow}`;
    };

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
                { label: `[AF${item.ExternalDB != undefined ? " " + item.ExternalDB : ''}] ${item.FieldName}`, key: item.FieldName, ...ConvertType(item.Type), isPivotField: true } as Search.IField<SystemCenter.Types.DetailedMeter>
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
                { label: `[AF${item.ExternalDB != undefined ? " " + item.ExternalDB : ''}] ${item.FieldName}`, key: item.FieldName, ...ConvertType(item.Type), isPivotField: true } as Search.IField<SystemCenter.Types.DetailedAsset>
            )), ['label'], ["asc"]);
            setFields(ordered);
        });
        return () => {
            if (handle != null && handle.abort == null) handle.abort();
        };
    }

    function validEventCharacteristicsFilter() {
        let valid = newEventCharacteristicFilter != null;

        if (!valid)
            return valid;

        valid = valid && validMinMax('durationMin');
        valid = valid && validMinMax('durationMax');

        valid = valid && validMinMax('sagMin');
        valid = valid && validMinMax('sagMax');

        valid = valid && validMinMax('swellMin');
        valid = valid && validMinMax('swellMax');

        valid = valid && validMinMax('transientMin');
        valid = valid && validMinMax('transientMax');

        return valid;
    }

    function NullOrNaN(val) {
        return val == null || isNaN(val);
    }

    function validMinMax(field: keyof SEBrowser.IEventCharacteristicFilters) {
        if (field == 'durationMin')
            return NullOrNaN(newEventCharacteristicFilter.durationMin) || (
                newEventCharacteristicFilter.durationMin >= 0 && newEventCharacteristicFilter.durationMin < 100 &&
                (NullOrNaN(newEventCharacteristicFilter.durationMax) ||
                    newEventCharacteristicFilter.durationMax >= newEventCharacteristicFilter.durationMin))
        if (field == 'durationMax')
            return NullOrNaN(newEventCharacteristicFilter.durationMax) || (
                newEventCharacteristicFilter.durationMax >= 0 && newEventCharacteristicFilter.durationMax < 100 &&
                (NullOrNaN(newEventCharacteristicFilter.durationMin) ||
                    newEventCharacteristicFilter.durationMax >= newEventCharacteristicFilter.durationMin))
        if (field == 'sagMin')
            return NullOrNaN(newEventCharacteristicFilter.sagMin) || (
                newEventCharacteristicFilter.sagMin >= 0 && newEventCharacteristicFilter.sagMin < 1 &&
                (NullOrNaN(newEventCharacteristicFilter.sagMax) ||
                    newEventCharacteristicFilter.sagMax >= newEventCharacteristicFilter.sagMin))
        if (field == 'sagMax')
            return NullOrNaN(newEventCharacteristicFilter.sagMax) || (
                newEventCharacteristicFilter.sagMax >= 0 && newEventCharacteristicFilter.sagMax < 1 &&
                (NullOrNaN(newEventCharacteristicFilter.sagMax) ||
                    newEventCharacteristicFilter.sagMax >= newEventCharacteristicFilter.sagMax))
        if (field == 'swellMin')
            return NullOrNaN(newEventCharacteristicFilter.swellMin) || (
                newEventCharacteristicFilter.swellMin >= 0 && newEventCharacteristicFilter.swellMin < 9999 &&
                (NullOrNaN(newEventCharacteristicFilter.swellMax) ||
                    newEventCharacteristicFilter.swellMax >= newEventCharacteristicFilter.swellMin))
        if (field == 'swellMax')
            return NullOrNaN(newEventCharacteristicFilter.swellMax) || (
                newEventCharacteristicFilter.swellMax >= 0 && newEventCharacteristicFilter.swellMax < 9999 &&
                (NullOrNaN(newEventCharacteristicFilter.swellMin) ||
                    newEventCharacteristicFilter.swellMax >= newEventCharacteristicFilter.swellMin))
        if (field == 'transientMin')
            return NullOrNaN(newEventCharacteristicFilter.transientMin) || (
                newEventCharacteristicFilter.transientMin >= 0 && newEventCharacteristicFilter.transientMin < 9999 &&
                (NullOrNaN(newEventCharacteristicFilter.transientMax) ||
                    newEventCharacteristicFilter.transientMax >= newEventCharacteristicFilter.transientMin))
        if (field == 'transientMax')
            return NullOrNaN(newEventCharacteristicFilter.transientMax) || (
                newEventCharacteristicFilter.transientMax >= 0 && newEventCharacteristicFilter.transientMax < 9999 &&
                (NullOrNaN(newEventCharacteristicFilter.transientMin) ||
                    newEventCharacteristicFilter.transientMax >= newEventCharacteristicFilter.transientMin))


        return true;
    }

    if (newEventCharacteristicFilter === null || timeFilter === null || newTypeFilter === null) return null;

    if (!props.showNav)
        return (
            <nav className="navbar navbar-expand-xl navbar-light bg-light">
                <div className="collapse navbar-collapse" id="navbarSupportedContent" style={{ width: '100%' }}>
                    <div className="navbar-nav mr-auto">
                        <span className="navbar-text">
                            {calculateDateRange()}
                        </span>
                    </div>
                    <div className="navbar-nav ml-auto" >
                        <button type="button" className={`btn btn-${(!reset ? 'warning' : 'primary')} btn-sm`} onClick={() => props.toggleVis()}>Show Filters</button>
                    </div>
                </div>
            </nav>
        );

    const sagsSelected = newTypeFilter.find(i => i == eventTypes.find(item => item.Name == 'Sag')?.ID ?? -1) != null;
    const swellsSelected = newTypeFilter.find(i => i == eventTypes.find(item => item.Name == 'Swell')?.ID ?? -1) != null;
    const transientsSelected = newTypeFilter.find(i => i == eventTypes.find(item => item.Name == 'Transient')?.ID ?? -1) != null;

    return (
        <>
            <nav className="navbar navbar-expand-xl navbar-light bg-light" ref={navRef}>

            <div className="collapse navbar-collapse" id="navbarSupportedContent" style={{ width: '100%' }}>
                <ul className="navbar-nav mr-auto" style={{ width: '100%' }}>
                    <li className="nav-item" style={{ width: '30%', paddingRight: 10 }}>
                            <ReportTimeFilter filter={timeFilter} setFilter={(f) => dispatch(SetFilters({ time: f })) } showQuickSelect={true} />
                        </li>
                        <EventSearchTypeFilters Height={height} />
                    <li className="nav-item" style={{ width: '45%', paddingRight: 10 }}>
                        <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                            <legend className="w-auto" style={{ fontSize: 'large' }}>Event Characteristics:</legend>
                            <div className="row">
                                
                                <div className={"col-4"}>
                                    <form>
                                        <div className="form-group">
                                            <div className='input-group input-group-sm' style={{ width: '100%' }}>
                                                <Select<SEBrowser.IEventCharacteristicFilters> Record={newEventCharacteristicFilter} Label='Mag-Dur:' Field='curveID' Setter={setNewEventCharacteristicFilter}
                                                    Options={magDurCurves.map((v) => (v.Area != undefined && v.Area.length > 0 ? { Value: v.ID.toString(), Label: v.Name } : null))} />
                                            </div>
                                            <div className='form-check form-check-inline'>
                                                    <input className="form-check-input" type="radio" onChange={() => {
                                                        setNewEventCharacteristicFilter({ ...newEventCharacteristicFilter, curveInside: true, curveOutside: false });
                                                    }} checked={newEventCharacteristicFilter.curveInside && !eventCharacteristicFilter.curveOutside} />
                                                <label className="form-check-label">Inside</label>
                                            </div>
                                            <div className='form-check form-check-inline'>
                                                    <input className="form-check-input" type="radio" onChange={() => {
                                                        setNewEventCharacteristicFilter({ ...newEventCharacteristicFilter, curveOutside: true, curveInside: false });
                                                    }} checked={newEventCharacteristicFilter.curveOutside && !newEventCharacteristicFilter.curveInside} />
                                                <label className="form-check-label">Outside</label>
                                                </div>
                                                <div className='form-check form-check-inline'>
                                                    <input className="form-check-input" type="radio" onChange={() => {
                                                        setNewEventCharacteristicFilter({ ...newEventCharacteristicFilter, curveOutside: true, curveInside: true });
                                                    }} checked={newEventCharacteristicFilter.curveOutside && newEventCharacteristicFilter.curveInside} />
                                                    <label className="form-check-label">Both</label>
                                                </div>
                                        </div>
                                        </form>
                                    </div>
                                    <div className={"col-4"}>
                                    <form>
                                        <label style={{ margin: 0 }}>Duration (cycle):</label>
                                        <div className="form-group">
                                                <div className='input-group input-group-sm'>
                                                    <div className='col' style={{ width: '45%', paddingRight: 0, paddingLeft: 0 }}>
                                                        <Input<SEBrowser.IEventCharacteristicFilters>
                                                            Record={newEventCharacteristicFilter}
                                                            Label='' Field='durationMin'
                                                            Setter={setNewEventCharacteristicFilter}
                                                            Valid={validMinMax}
                                                            Feedback={'Invalid Min'}
                                                            Type='number'
                                                            Size={'small'}
                                                            AllowNull={true}
                                                        />
                                                </div>
                                                <div className="input-group-append" style={{ height: '37px'}}>
                                                    <span className="input-group-text"> to </span>
                                                    </div>
                                                    <div className='col' style={{ width: '45%', paddingLeft: 0, paddingRight: 0 }}>
                                                        <Input<SEBrowser.IEventCharacteristicFilters>
                                                            Record={newEventCharacteristicFilter}
                                                            Label='' Field='durationMax'
                                                            Setter={setNewEventCharacteristicFilter}
                                                            Valid={validMinMax}
                                                            Feedback={'Invalid Max'}
                                                            Type='number'
                                                            Size={'small'}
                                                            AllowNull={true}
                                                        />
                                                </div>
                                            </div>
                                            </div>
                                        </form>
                                </div>
                                <div className={"col-4"}>
                                        <form>
                                            <label style={{ margin: 0 }}>Sags (p.u.):</label>
                                            <div className="form-group">
                                                <div className='input-group input-group-sm'>
                                                    <div className='col' style={{ width: '45%', paddingLeft: 0, paddingRight: 0 }}>
                                                        <Input<SEBrowser.IEventCharacteristicFilters>
                                                            Record={newEventCharacteristicFilter}
                                                            Label='' Disabled={!sagsSelected}
                                                            Field='sagMin'
                                                            Setter={setNewEventCharacteristicFilter}
                                                            Valid={validMinMax}
                                                            Feedback={'Invalid Min'}
                                                            Type='number'
                                                            Size={'small'}
                                                            AllowNull={true}
                                                        />
                                                    </div>
                                                    <div className="input-group-append" style={{ height: '37px' }}>
                                                        <span className="input-group-text"> to </span>
                                                    </div>
                                                    <div className='col' style={{ width: '45%', paddingLeft: 0, paddingRight: 0 }}>
                                                        <Input<SEBrowser.IEventCharacteristicFilters>
                                                            Record={newEventCharacteristicFilter}
                                                            Label=''
                                                            Disabled={!sagsSelected}
                                                            Field='sagMax'
                                                            Setter={setNewEventCharacteristicFilter}
                                                            Valid={validMinMax}
                                                            Feedback={'Invalid Max'}
                                                            Type='number'
                                                            Size={'small'}
                                                            AllowNull={true}
                                                        />
                                                    </div>
                                                </div>
                                                <Select<SEBrowser.IEventCharacteristicFilters> Record={newEventCharacteristicFilter} Label='' Disabled={!sagsSelected} Field='sagType' Setter={setNewEventCharacteristicFilter}
                                                    Options={lineNeutralOptions} />
                                            </div>
                                        </form>
                                    </div>
                                    <div className={"col-4"}>
                                            <MultiCheckBoxSelect
                                            Options={newPhases}
                                            Label={'Phases'}
                                                OnChange={
                                                    (evt, Options: { Value: number; Text: string; Selected: boolean; }[]) => { 
                                                        const phaseList = [];
                                                        const phaseFilter: SEBrowser.IPhaseFilters = { ...newEventCharacteristicFilter.phases };
                                                        newPhases.forEach(phase => {
                                                            const phaseSelected: boolean = phase.Selected != (Options.findIndex(option => phase.Value === option.Value) > -1);
                                                            phaseList.push({ ...phase, Selected: phaseSelected });
                                                            phaseFilter[phase.Text] = phaseSelected;
                                                        })
                                                        setNewPhases(phaseList);
                                                        setNewEventCharacteristicFilter({ ...newEventCharacteristicFilter, phases: phaseFilter });
                                                    }
                                                }
                                            /> 
                                    </div>
                                    
                                <div className={"col-4"}>
                                   <form>
                                        <label style={{ margin: 0 }}>Transients (p.u.):</label>
                                        <div className="form-group">
                                            <div className='input-group input-group-sm'>
                                                    <div className='col' style={{ width: '45%', paddingLeft: 0, paddingRight: 0 }}>
                                                        <Input<SEBrowser.IEventCharacteristicFilters>
                                                            Record={newEventCharacteristicFilter} Label=''
                                                            Disabled={!transientsSelected} Field='transientMin'
                                                            Setter={setNewEventCharacteristicFilter}
                                                            Valid={validMinMax}
                                                            Feedback={'Invalid Min'}
                                                            Type='number'
                                                            Size={'small'}
                                                            AllowNull={true}
                                                        />
                                                </div>
                                                <div className="input-group-append" style={{ height: '37px'}}>
                                                    <span className="input-group-text"> to </span>
                                                </div>
                                                    <div className='col' style={{ width: '45%', paddingLeft: 0, paddingRight: 0 }}>
                                                        <Input<SEBrowser.IEventCharacteristicFilters>
                                                            Record={newEventCharacteristicFilter}
                                                            Label=''
                                                            Disabled={!transientsSelected}
                                                            Field='transientMax'
                                                            Setter={setNewEventCharacteristicFilter}
                                                            Valid={validMinMax}
                                                            Feedback={'Invalid Max'}
                                                            Size={'small'}
                                                            AllowNull={true}
                                                            Type='number' />
                                                </div>
                                            </div>
                                            <Select<SEBrowser.IEventCharacteristicFilters> Record={newEventCharacteristicFilter} Label='' Disabled={!transientsSelected} Field='transientType' Setter={setNewEventCharacteristicFilter}
                                                Options={lineNeutralOptions}/>
                                        </div>
                                    </form>
                                </div>
                                <div className="col-4">
                                    <form>
                                        <label style={{ margin: 0 }}>Swells (p.u.):</label>
                                        <div className="form-group">
                                            <div className='input-group input-group-sm'>
                                                    <div className='col' style={{ width: '45%', paddingLeft: 0, paddingRight: 0 }}>
                                                        <Input<SEBrowser.IEventCharacteristicFilters>
                                                            Record={newEventCharacteristicFilter}
                                                            Label='' Disabled={!swellsSelected}
                                                            Field='swellMin'
                                                            Setter={setNewEventCharacteristicFilter}
                                                            Valid={validMinMax}
                                                            Feedback={'Invalid Min'}
                                                            Type='number'
                                                            Size={'small'}
                                                            AllowNull={true}
                                                        />
                                                </div>
                                                <div className="input-group-append" style={{ height: '37px'}}>
                                                    <span className="input-group-text"> to </span>
                                                </div>
                                                    <div className='col' style={{ width: '45%', paddingLeft: 0, paddingRight: 0 }}>
                                                        <Input<SEBrowser.IEventCharacteristicFilters>
                                                            Record={newEventCharacteristicFilter}
                                                            Label='' Disabled={!swellsSelected}
                                                            Field='swellMax'
                                                            Setter={setNewEventCharacteristicFilter}
                                                            Valid={validMinMax}
                                                            Feedback={'Invalid Max'}
                                                            Type='number'
                                                            Size={'small'}
                                                            AllowNull={true}
                                                        />
                                                </div>
                                            </div>
                                                <Select<SEBrowser.IEventCharacteristicFilters>
                                                    Record={newEventCharacteristicFilter}
                                                    Label='' Disabled={!swellsSelected}
                                                    Field='swellType' Setter={setNewEventCharacteristicFilter}
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
                                        <EventSearchFilterButton<OpenXDA.Types.AssetGroup> Type={'AssetGroup'}  OnClick={() => setFilter('AssetGroup')} Data={assetGroupList} />
                                    </div>
                                </div>
                                <div className={"row"}>
                                    <div className={'col'}>
                                        <EventSearchFilterButton<SystemCenter.Types.DetailedLocation> Type={'Station'} OnClick={() => setFilter('Station')} Data={locationList} />
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
                    GetAddlFields={() => { return () => {/*Do Nothing*/} }} />
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