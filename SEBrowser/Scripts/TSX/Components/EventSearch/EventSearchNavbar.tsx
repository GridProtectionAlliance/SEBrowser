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
import ReportTimeFilter from '../ReportTimeFilter';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { SelectAssetGroupList, SelectAssetList, SelectCharacteristicFilter, SelectMeterList, SelectReset, SelectStationList, SelectTimeFilter, SelectTypeFilter, SetFilterLists } from './EventSearchSlice';
import { ResetFilters,  SetFilters } from './EventSearchSlice';
import { AssetGroupSlice, AssetSlice, LocationSlice, MeterSlice, MagDurCurveSlice, EventTypeSlice } from '../../Store';
import { DefaultSelects } from '@gpa-gemstone/common-pages';
import NavbarFilterButton from '../Common/NavbarFilterButton';
import { SystemCenter, OpenXDA } from '@gpa-gemstone/application-typings';
import { Input, Select, MultiCheckBoxSelect } from '@gpa-gemstone/react-forms';
import { Search } from '@gpa-gemstone/react-interactive';
import { Column } from '@gpa-gemstone/react-table';
import { SEBrowser } from '../../Global';
import EventSearchTypeFilters from './EventSearchTypeFilter';
import { SelectDateTimeSetting, SelectTimeZone } from '../SettingsSlice';
import { getMoment, getStartEndTime, readableUnit } from './TimeWindowUtils';

interface IProps {
    toggleVis: () => void,
    showNav: boolean,
    setHeight: (h: number) => void
}

const momentDateTimeFormat = "MM/DD/YYYY HH:mm:ss.SSS";

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
    const [newEventCharacteristicFilter, setNewEventCharacteristicFilter] = React.useState<SEBrowser.IEventCharacteristicFilters>(null);
    const [newTypeFilter, setNewTypeFilter] = React.useState<number[]>(null);
    const lineNeutralOptions = [{ Value: 'LL', Label: 'LL' }, { Value: 'LN', Label: 'LN' }, { Value: 'both', Label: 'LL/LN' }];
    const dateTimeSetting = useAppSelector(SelectDateTimeSetting)

    React.useLayoutEffect(() => setHeight(navRef?.current?.offsetHeight ?? 0))
    React.useEffect(() => props.setHeight(height), [height])

    React.useEffect(() => { setNewTypeFilter(eventTypeFilter) }, [eventTypeFilter])
    React.useEffect(() => { setNewEventCharacteristicFilter(eventCharacteristicFilter) }, [eventCharacteristicFilter])

    const [newPhases, setNewPhases] = React.useState<{ Value: number, Text: string, Selected: boolean }[]>([]);

    const [timeRange, setTimeRange] = React.useState<string>('');

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
            r += ` + ${2*timeFilter.windowSize} ${readableUnit(timeFilter.timeWindowUnits)}`;
        else if (dateTimeSetting == 'endWindow')
            r += ` - ${2*timeFilter.windowSize} ${readableUnit(timeFilter.timeWindowUnits)}`;

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
                newEventCharacteristicFilter.swellMin >= 1 && newEventCharacteristicFilter.swellMin < 9999 &&
                (NullOrNaN(newEventCharacteristicFilter.swellMax) ||
                    newEventCharacteristicFilter.swellMax >= newEventCharacteristicFilter.swellMin))
        if (field == 'swellMax')
            return NullOrNaN(newEventCharacteristicFilter.swellMax) || (
                newEventCharacteristicFilter.swellMax >= 1 && newEventCharacteristicFilter.swellMax < 9999 &&
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
                            {timeRange}
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
                                                <div className="row" style={{ width: '100%' }}>
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
                                                </div>
                                                <div className="row justify-content-md-center">
                                                <div className='form-check form-check-inline'>
                                                    <input className="form-check-input" type="radio" onChange={() => {
                                                        setNewEventCharacteristicFilter({ ...newEventCharacteristicFilter, sagType: 'LL' });
                                                    }} checked={newEventCharacteristicFilter.sagType == 'LL'} />
                                                    <label className="form-check-label">LL</label>
                                                </div>
                                                <div className='form-check form-check-inline'>
                                                    <input className="form-check-input" type="radio" onChange={() => {
                                                        setNewEventCharacteristicFilter({ ...newEventCharacteristicFilter, sagType: 'LN' });
                                                    }} checked={newEventCharacteristicFilter.sagType  == 'LN'} />
                                                    <label className="form-check-label">LN</label>
                                                </div>
                                                <div className='form-check form-check-inline'>
                                                    <input className="form-check-input" type="radio" onChange={() => {
                                                        setNewEventCharacteristicFilter({ ...newEventCharacteristicFilter, sagType: 'both' });
                                                    }} checked={newEventCharacteristicFilter.sagType == 'both'} />
                                                    <label className="form-check-label">Both</label>
                                                    </div>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                    <div className={"col-4"}>
                                        <MultiCheckBoxSelect
                                            Options={newPhases}
                                            Label={'Phases'}
                                            ItemTooltip={'dark'}
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
                                                    <div className="row" style={{ width: '100%' }}>
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
                                            </div>
                                                <div className="row justify-content-md-center">
                                                    <div className='form-check form-check-inline'>
                                                        <input className="form-check-input" type="radio" onChange={() => {
                                                            setNewEventCharacteristicFilter({ ...newEventCharacteristicFilter, transientType: 'LL' });
                                                        }} checked={newEventCharacteristicFilter.transientType == 'LL'} />
                                                        <label className="form-check-label">LL</label>
                                                    </div>
                                                    <div className='form-check form-check-inline'>
                                                        <input className="form-check-input" type="radio" onChange={() => {
                                                            setNewEventCharacteristicFilter({ ...newEventCharacteristicFilter, transientType: 'LN' });
                                                        }} checked={newEventCharacteristicFilter.transientType == 'LN'} />
                                                        <label className="form-check-label">LN</label>
                                                    </div>
                                                    <div className='form-check form-check-inline'>
                                                        <input className="form-check-input" type="radio" onChange={() => {
                                                            setNewEventCharacteristicFilter({ ...newEventCharacteristicFilter, transientType: 'both' });
                                                        }} checked={newEventCharacteristicFilter.transientType == 'both'} />
                                                        <label className="form-check-label">Both</label>
                                                    </div>
                                                </div>
                                            </div>
                                    </form>
                                </div>
                                <div className="col-4">
                                        <form>

                                        <label style={{ margin: 0 }}>Swells (p.u.):</label>
                                            <div className="form-group">
                                                <div className="row" style={{ width: '100%' }}>
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
                                            </div>
                                                <div className="row justify-content-md-center">
                                                    <div className='form-check form-check-inline'>
                                                        <input className="form-check-input" type="radio" onChange={() => {
                                                            setNewEventCharacteristicFilter({ ...newEventCharacteristicFilter, swellType: 'LL' });
                                                        }} checked={newEventCharacteristicFilter.swellType == 'LL'} />
                                                        <label className="form-check-label">LL</label>
                                                    </div>
                                                    <div className='form-check form-check-inline'>
                                                        <input className="form-check-input" type="radio" onChange={() => {
                                                            setNewEventCharacteristicFilter({ ...newEventCharacteristicFilter, swellType: 'LN' });
                                                        }} checked={newEventCharacteristicFilter.swellType == 'LN'} />
                                                        <label className="form-check-label">LN</label>
                                                    </div>
                                                    <div className='form-check form-check-inline'>
                                                        <input className="form-check-input" type="radio" onChange={() => {
                                                            setNewEventCharacteristicFilter({ ...newEventCharacteristicFilter, swellType: 'both' });
                                                        }} checked={newEventCharacteristicFilter.swellType == 'both'} />
                                                        <label className="form-check-label">Both</label>
                                                    </div>
                                                </div>
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
                Title={"Filter by Meter"}
                GetEnum={getEnum}
                GetAddlFields={getAdditionalMeterFields}
            >
                <Column<SystemCenter.Types.DetailedMeter>
                    Key="AssetKey" Field="AssetKey"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >Key</Column>
                <Column<SystemCenter.Types.DetailedMeter>
                    Key="Name" Field="Name"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >Name</Column>
                <Column<SystemCenter.Types.DetailedMeter>
                    Key="Location" Field="Location"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >Substation</Column>
                <Column<SystemCenter.Types.DetailedMeter>
                    Key="MappedAssets" Field="MappedAssets"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >Assets</Column>
                <Column<SystemCenter.Types.DetailedMeter>
                    Key="Make" Field="Make"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >Make</Column>
                <Column<SystemCenter.Types.DetailedMeter>
                    Key="Model" Field="Model"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >Model</Column>
            </DefaultSelects.Meter>
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
                Title={"Filter by Asset"}
                GetEnum={getEnum}
                GetAddlFields={getAdditionalAssetFields}
            >
                <Column<SystemCenter.Types.DetailedAsset>
                    Key="AssetKey" Field="AssetKey"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >Key</Column>
                <Column<SystemCenter.Types.DetailedAsset>
                    Key="AssetName" Field="AssetName"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >Name</Column>
                <Column<SystemCenter.Types.DetailedAsset>
                    Key="AssetType" Field="AssetType"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >Asset Type</Column>
                <Column<SystemCenter.Types.DetailedAsset>
                    Key="VoltageKV" Field="VoltageKV"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >Voltage (kV)</Column>
                <Column<SystemCenter.Types.DetailedAsset>
                    Key="Meters" Field="Meters"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >Meters</Column>
                <Column<SystemCenter.Types.DetailedAsset>
                    Key="Locations" Field="Locations"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >Substations</Column>
            </DefaultSelects.Asset>
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
                Title={"Filter by Substation"}
                GetEnum={getEnum}
                GetAddlFields={() => { return () => {/*Do Nothing*/ } }}
            >
                <Column<SystemCenter.Types.DetailedLocation>
                    Key="Name" Field="Name"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >Name</Column>
                <Column<SystemCenter.Types.DetailedLocation>
                    Key="LocationKey" Field="LocationKey"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >Key</Column>
                <Column<SystemCenter.Types.DetailedLocation>
                    Key="Meters" Field="Meters"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >Meters</Column>
                <Column<SystemCenter.Types.DetailedLocation>
                    Key="Assets" Field="Assets"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >Assets</Column>
            </DefaultSelects.Location>
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
                Title={"Filter by Asset Group"}
                GetEnum={getEnum}
                GetAddlFields={() => { return () => {/*Do Nothing*/ } }}
            >
                <Column<OpenXDA.Types.AssetGroup>
                    Key="Name" Field="Name"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >Name</Column>
                <Column<OpenXDA.Types.AssetGroup>
                    Key="Assets" Field="Assets"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >Assets</Column>
                <Column<OpenXDA.Types.AssetGroup>
                    Key="Meters" Field="Meters"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >Meters</Column>
                <Column<OpenXDA.Types.AssetGroup>
                    Key="Users" Field="Users"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >Users</Column>
                <Column<OpenXDA.Types.AssetGroup>
                    Key="AssetGroups" Field="AssetGroups"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >Sub Groups</Column>
            </DefaultSelects.AssetGroup>
        </>
    );
}

export default EventSearchNavbar;