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
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { SelectCharacteristicFilter, SelectTimeFilter, SelectTypeFilter } from '../../../Store/EventSearchSlice';
import { SetFilters } from '../../../Store/EventSearchSlice';
import { EventTypeSlice } from '../../../Store/Store';
import { OpenXDA, Application } from '@gpa-gemstone/application-typings';
import { Input, Select, MultiCheckBoxSelect, RadioButtons } from '@gpa-gemstone/react-forms';
import { SEBrowser } from '../../../global';
import { SelectDateTimeSetting, SelectTimeZone } from '../../../Store/SettingsSlice';
import { getMoment, getStartEndTime, readableUnit } from '../TimeWindowUtils';
import { FetchMagDurCurves } from '../FetchMagDurCurves';

const momentDateTimeFormat = "MM/DD/YYYY HH:mm:ss.SSS";

const EventSearchNavbar = () => {

    const dispatch = useAppDispatch();
    const eventCharacteristicFilter = useAppSelector(SelectCharacteristicFilter);
    const timeFilter = useAppSelector(SelectTimeFilter);
    const eventTypeFilter = useAppSelector(SelectTypeFilter);

    const eventTypes = useAppSelector(EventTypeSlice.Data);

    const [newEventCharacteristicFilter, setNewEventCharacteristicFilter] = React.useState<SEBrowser.IEventCharacteristicFilters | null>(null);
    const [newTypeFilter, setNewTypeFilter] = React.useState<number[] | undefined>(undefined);
    const [magDurStatus, setMagDurStatus] = React.useState<Application.Types.Status>('uninitiated');
    const [magDurCurves, setMagDurCurves] = React.useState<OpenXDA.Types.MagDurCurve[]>([]);

    React.useEffect(() => { setNewTypeFilter(eventTypeFilter) }, [eventTypeFilter])
    React.useEffect(() => { setNewEventCharacteristicFilter(eventCharacteristicFilter) }, [eventCharacteristicFilter])

    const [newPhases, setNewPhases] = React.useState<{ Value: number, Label: string, Selected: boolean }[]>([]);

    React.useEffect(() => {
        setNewEventCharacteristicFilter(eventCharacteristicFilter);
        setNewTypeFilter(eventTypeFilter);
        const setupPhases = Object
            .keys(eventCharacteristicFilter.phases)
            .map((key, index) => ({ Value: index, Label: key, Selected: eventCharacteristicFilter.phases[key] }));
        setNewPhases(setupPhases);
    }, []);

    React.useEffect(() => {
        setMagDurStatus('loading');
        const handle = FetchMagDurCurves();

        handle.done((curves: OpenXDA.Types.MagDurCurve[]) => {
            setMagDurCurves(curves);
            setMagDurStatus('idle');
        });

        handle.fail(() => {
            setMagDurCurves([]);
            setMagDurStatus('error')
        });

        return () => {
            if (handle?.abort != null)
                handle.abort();
        };
    }, []);

    React.useEffect(() => {
        const characteristics = validEventCharacteristicsFilter() ? newEventCharacteristicFilter : null;

        dispatch(SetFilters({
            characteristics: characteristics ?? undefined,
            types: newTypeFilter
        }));
    }, [newEventCharacteristicFilter, newTypeFilter]);

    function validEventCharacteristicsFilter() {
        let valid = newEventCharacteristicFilter != null;

        if (!valid)
            return valid;

        valid = valid && validMinMax('durationMin', newEventCharacteristicFilter);
        valid = valid && validMinMax('durationMax', newEventCharacteristicFilter);

        valid = valid && validMinMax('sagMin', newEventCharacteristicFilter);
        valid = valid && validMinMax('sagMax', newEventCharacteristicFilter);

        valid = valid && validMinMax('swellMin', newEventCharacteristicFilter);
        valid = valid && validMinMax('swellMax', newEventCharacteristicFilter);

        valid = valid && validMinMax('transientMin', newEventCharacteristicFilter);
        valid = valid && validMinMax('transientMax', newEventCharacteristicFilter);

        return valid;
    }

    const isValidMinMax = React.useCallback((field: keyof SEBrowser.IEventCharacteristicFilters) => {
        return validMinMax(field, newEventCharacteristicFilter);
    }, [newEventCharacteristicFilter])

    const MagDurOptions = React.useMemo(() => {
        return magDurCurves
            .map((v) => (v.Area != undefined && v.Area.length > 0 ? { Value: v.ID.toString(), Label: v.Name } : null))
            .filter(v => v != null);
    }, [magDurCurves])

    if (newEventCharacteristicFilter === null || timeFilter === null || newTypeFilter == null) return null;

    const sagsSelected = newTypeFilter.find(i => i == (eventTypes.find(item => item.Name == 'Sag')?.ID ?? -1)) != null;
    const swellsSelected = newTypeFilter.find(i => i == (eventTypes.find(item => item.Name == 'Swell')?.ID ?? -1)) != null;
    const transientsSelected = newTypeFilter.find(i => i == (eventTypes.find(item => item.Name == 'Transient')?.ID ?? -1)) != null;

    return (
        <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
            <legend className="w-auto" style={{ fontSize: 'large' }}>
                Event Characteristics:
            </legend>
            <div className="row">
                <div className={"col-4"}>
                    <form>
                        <div className="form-group">
                            <Select<SEBrowser.IEventCharacteristicFilters>
                                Record={newEventCharacteristicFilter}
                                Label='Mag-Dur:'
                                Field='curveID'
                                Setter={setNewEventCharacteristicFilter}
                                Options={MagDurOptions}
                            />
                            <RadioButtons<{ curveType: string }>
                                Record={{
                                    curveType: newEventCharacteristicFilter.curveInside
                                        ? (newEventCharacteristicFilter.curveOutside ? 'both' : 'inside')
                                        : 'outside'
                                }}
                                Label=''
                                Field='curveType'
                                Setter={({ curveType }) => setNewEventCharacteristicFilter({
                                    ...newEventCharacteristicFilter,
                                    curveInside: curveType != 'outside',
                                    curveOutside: curveType != 'inside'
                                })}
                                Options={[
                                    { Label: 'Inside', Value: 'inside' },
                                    { Label: 'Outside', Value: 'outside' },
                                    { Label: 'Both', Value: 'both' }
                                ]}
                                Style={{ marginBottom: 0 }}
                            />
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
                                        Valid={isValidMinMax}
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
                                        Label='' Field='durationMax'
                                        Setter={setNewEventCharacteristicFilter}
                                        Valid={isValidMinMax}
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
                                            Valid={isValidMinMax}
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
                                            Valid={isValidMinMax}
                                            Feedback={'Invalid Max'}
                                            Type='number'
                                            Size={'small'}
                                            AllowNull={true}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="row justify-content-md-center">
                                <RadioButtons<SEBrowser.IEventCharacteristicFilters>
                                    Record={newEventCharacteristicFilter}
                                    Label=''
                                    Field='sagType'
                                    Setter={setNewEventCharacteristicFilter}
                                    Options={[
                                        { Label: 'LL', Value: 'LL' },
                                        { Label: 'LN', Value: 'LN' },
                                        { Label: 'Both', Value: 'both' }
                                    ]}
                                    Style={{ marginBottom: 0 }}
                                />
                            </div>
                        </div>
                    </form>
                </div>
                <div className={"col-4"}>
                    <MultiCheckBoxSelect
                        Options={newPhases}
                        Label={'Phases'}
                        OnChange={
                            (_evt, Options: { Value: number | string; Label: string | JSX.Element; Selected: boolean; }[]) => {
                                const phaseList: { Value: number; Label: string; Selected: boolean; }[] = [];
                                const phaseFilter: SEBrowser.IPhaseFilters = { ...newEventCharacteristicFilter.phases };
                                newPhases.forEach(phase => {
                                    const phaseSelected: boolean = phase.Selected != (Options.findIndex(option => phase.Value === option.Value) > -1);
                                    phaseList.push({ ...phase, Selected: phaseSelected });
                                    phaseFilter[phase.Label] = phaseSelected;
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
                                            Valid={isValidMinMax}
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
                                            Disabled={!transientsSelected}
                                            Field='transientMax'
                                            Setter={setNewEventCharacteristicFilter}
                                            Valid={isValidMinMax}
                                            Feedback={'Invalid Max'}
                                            Size={'small'}
                                            AllowNull={true}
                                            Type='number' />
                                    </div>
                                </div>
                            </div>
                            <div className="row justify-content-md-center">
                                <RadioButtons<SEBrowser.IEventCharacteristicFilters>
                                    Record={newEventCharacteristicFilter}
                                    Label=''
                                    Field='transientType'
                                    Setter={setNewEventCharacteristicFilter}
                                    Options={[
                                        { Label: 'LL', Value: 'LL' },
                                        { Label: 'LN', Value: 'LN' },
                                        { Label: 'Both', Value: 'both' }
                                    ]}
                                    Style={{ marginBottom: 0 }}
                                />
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
                                            Valid={isValidMinMax}
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
                                            Label='' Disabled={!swellsSelected}
                                            Field='swellMax'
                                            Setter={setNewEventCharacteristicFilter}
                                            Valid={isValidMinMax}
                                            Feedback={'Invalid Max'}
                                            Type='number'
                                            Size={'small'}
                                            AllowNull={true}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="row justify-content-md-center">
                                <RadioButtons<SEBrowser.IEventCharacteristicFilters>
                                    Record={newEventCharacteristicFilter}
                                    Label=''
                                    Field='swellType'
                                    Setter={setNewEventCharacteristicFilter}
                                    Options={[
                                        { Label: 'LL', Value: 'LL' },
                                        { Label: 'LN', Value: 'LN' },
                                        { Label: 'Both', Value: 'both' }
                                    ]}
                                    Style={{ marginBottom: 0 }}
                                />
                            </div>
                        </div>
                    </form>
                </div>
            </div>


        </fieldset>
    );
}

const NullOrNaN = (val: number | null | undefined) => val == null || isNaN(val);


function validMinMax(field: keyof SEBrowser.IEventCharacteristicFilters, newEventCharacteristicFilter: SEBrowser.IEventCharacteristicFilters | null) {
    if (newEventCharacteristicFilter == null) return false;

    if (field == 'durationMin')
        return NullOrNaN(newEventCharacteristicFilter.durationMin) || (
            newEventCharacteristicFilter.durationMin != null && newEventCharacteristicFilter.durationMin >= 0 && newEventCharacteristicFilter.durationMin < 100 &&
            (NullOrNaN(newEventCharacteristicFilter.durationMax) ||
                (newEventCharacteristicFilter.durationMax != null && newEventCharacteristicFilter.durationMax >= newEventCharacteristicFilter.durationMin)))

    if (field == 'durationMax')
        return NullOrNaN(newEventCharacteristicFilter.durationMax) || (
            newEventCharacteristicFilter.durationMax != null && newEventCharacteristicFilter.durationMax >= 0 && newEventCharacteristicFilter.durationMax < 100 &&
            (NullOrNaN(newEventCharacteristicFilter.durationMin) ||
                (newEventCharacteristicFilter.durationMin != null && newEventCharacteristicFilter.durationMax >= newEventCharacteristicFilter.durationMin)))

    if (field == 'sagMin')
        return NullOrNaN(newEventCharacteristicFilter.sagMin) || (
            newEventCharacteristicFilter.sagMin != null && newEventCharacteristicFilter.sagMin >= 0 && newEventCharacteristicFilter.sagMin < 1 &&
            (NullOrNaN(newEventCharacteristicFilter.sagMax) ||
                (newEventCharacteristicFilter.sagMax != null && newEventCharacteristicFilter.sagMax >= newEventCharacteristicFilter.sagMin)))

    if (field == 'sagMax')
        return NullOrNaN(newEventCharacteristicFilter.sagMax) || (
            newEventCharacteristicFilter.sagMax != null && newEventCharacteristicFilter.sagMax >= 0 && newEventCharacteristicFilter.sagMax < 1 &&
            (NullOrNaN(newEventCharacteristicFilter.sagMax) ||
                (newEventCharacteristicFilter.sagMax != null && newEventCharacteristicFilter.sagMax >= newEventCharacteristicFilter.sagMax)))

    if (field == 'swellMin')
        return NullOrNaN(newEventCharacteristicFilter.swellMin) || (
            newEventCharacteristicFilter.swellMin != null && newEventCharacteristicFilter.swellMin >= 1 && newEventCharacteristicFilter.swellMin < 9999 &&
            (NullOrNaN(newEventCharacteristicFilter.swellMax) ||
                (newEventCharacteristicFilter.swellMax != null && newEventCharacteristicFilter.swellMax >= newEventCharacteristicFilter.swellMin)))

    if (field == 'swellMax')
        return NullOrNaN(newEventCharacteristicFilter.swellMax) || (
            newEventCharacteristicFilter.swellMax != null && newEventCharacteristicFilter.swellMax >= 1 && newEventCharacteristicFilter.swellMax < 9999 &&
            (NullOrNaN(newEventCharacteristicFilter.swellMin) ||
                (newEventCharacteristicFilter.swellMin != null && newEventCharacteristicFilter.swellMax >= newEventCharacteristicFilter.swellMin)))

    if (field == 'transientMin')
        return NullOrNaN(newEventCharacteristicFilter.transientMin) || (
            newEventCharacteristicFilter.transientMin != null && newEventCharacteristicFilter.transientMin >= 0 && newEventCharacteristicFilter.transientMin < 9999 &&
            (NullOrNaN(newEventCharacteristicFilter.transientMax) ||
                (newEventCharacteristicFilter.transientMax != null && newEventCharacteristicFilter.transientMax >= newEventCharacteristicFilter.transientMin)))

    if (field == 'transientMax')
        return NullOrNaN(newEventCharacteristicFilter.transientMax) || (
            newEventCharacteristicFilter.transientMax != null && newEventCharacteristicFilter.transientMax >= 0 && newEventCharacteristicFilter.transientMax < 9999 &&
            (NullOrNaN(newEventCharacteristicFilter.transientMin) ||
                (newEventCharacteristicFilter.transientMin != null && newEventCharacteristicFilter.transientMax >= newEventCharacteristicFilter.transientMin)))

    return true;
}

export default EventSearchNavbar;
