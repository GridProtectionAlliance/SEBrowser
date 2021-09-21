﻿//******************************************************************************************************
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
import { SEBrowser } from '../../global';
import { useDispatch, useSelector } from 'react-redux';
import { SelectCharacteristicFilter, SelectTimeFilter, SelectTypeFilter, SetFilters } from './EventSearchSlice';


interface IProps {
    toggleVis: () => void,
    showNav: boolean,
}

const momentDateTimeFormat = "MM/DD/YYYY HH:mm:ss.SSS";
const momentDateFormat = "MM/DD/YYYY";
const momentTimeFormat = "HH:mm:ss.SSS";

const EventSearchNavbar = (props: IProps) => {
    const dispatch = useDispatch();
    const timeFilter = useSelector(SelectTimeFilter);
    const eventTypeFilter = useSelector(SelectTypeFilter);
    const eventCharacteristicFilter = useSelector(SelectCharacteristicFilter);

   
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

    if (!props.showNav)
        return (
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="collapse navbar-collapse" id="navbarSupportedContent" style={{ width: '100%' }}>
                    <div className="navbar-nav mr-auto">
                        <span className="navbar-text">
                            {timeFilter.date} {timeFilter.time} +/- {timeFilter.windowSize} {formatWindowUnit(timeFilter.timeWindowUnits)}
                        </span>
                    </div>
                    <div className="navbar-nav ml-auto" >
                        <button type="button" className="btn btn-primary btn-sm" onClick={() => props.toggleVis()}>Show Filters</button>
                    </div>
                </div>
            </nav>
            );

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">

            <div className="collapse navbar-collapse" id="navbarSupportedContent" style={{ width: '100%' }}>
                <ul className="navbar-nav mr-auto" style={{ width: '100%' }}>
                    <li className="nav-item" style={{ width: '35%', paddingRight: 10 }}>
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
                                    }} defaultChecked={true} />  Select All </label></li>
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
                                </ul>
                                <ul style={{
                                    listStyleType: 'none', padding: 0, width: '50%', position: 'relative', float: 'right'
                                }}>
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
                            </form>
                        </fieldset>
                    </li>
                    <li className="nav-item" style={{ width: '40%', paddingRight: 10 }}>
                        <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                            <legend className="w-auto" style={{ fontSize: 'large' }}>Event Characteristics:</legend>
                            <div className="row">
                                <div className={"col-4"}>
                                    <form>
                                        <label style={{ margin: 0 }}>Duration:</label>
                                        <div className="form-group">
                                            <div className='input-group input-group-sm'>
                                                <input className='form-control' value={eventCharacteristicFilter.durationMin} onChange={(e) => {
                                                    dispatch(SetFilters({
                                                        characteristics: { ...eventCharacteristicFilter, durationMin: parseFloat((e.target as any).value) },
                                                        time: timeFilter,
                                                        types: eventTypeFilter,
                                                    }));
                                                }} />
                                                    <div className="input-group-append">
                                                        <span className="input-group-text"> to </span>
                                                    </div>
                                                <input className='form-control' value={eventCharacteristicFilter.durationMax} onChange={(e) => {
                                                    dispatch(SetFilters({
                                                        characteristics: { ...eventCharacteristicFilter, durationMax: parseFloat((e.target as any).value) },
                                                        time: timeFilter,
                                                        types: eventTypeFilter,
                                                    }));
                                                }} />
                                                    <div className="input-group-append">
                                                        <span className="input-group-text">cycles</span>
                                                    </div>
                                            </div>
                                        </div>
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
                                                }} defaultChecked={true} />
                                                <label className="form-check-label">Select All</label>
                                            </div>
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
                                        <label style={{ margin: 0 }}>Mag-Dur:</label>
                                        <div className="form-group">
                                            <div className='input-group input-group-sm'>
                                                <select className="custom-select">
                                                    <option selected>ITIC</option>
                                                    <option value="1">One</option>
                                                    <option value="2">Two</option>
                                                    <option value="3">Three</option>
                                                </select>
                                            </div>
                                            <div className='form-check form-check-inline'>
                                                <input className="form-check-input" type="checkbox" />
                                                <label className="form-check-label">Inside</label>
                                            </div>
                                            <div className='form-check form-check-inline'>
                                                <input className="form-check-input" type="checkbox" />
                                                <label className="form-check-label">Outside</label>
                                            </div>
                                        </div>
                                   
                                        <label style={{ margin: 0 }}>Transients:</label>
                                        <div className="form-group">
                                            <div className='input-group input-group-sm'>
                                                <input className='form-control' value={0} onChange={(e) => { }} />
                                                <div className="input-group-append">
                                                    <span className="input-group-text"> to </span>
                                                </div>
                                                <input className='form-control' value={0} onChange={(e) => { }} />
                                                <div className="input-group-append">
                                                    <span className="input-group-text">p.u.</span>
                                                </div>
                                                <select className="custom-select">
                                                    <option selected>LL</option>
                                                    <option value="1">LN</option>
                                                    <option value="2">LN/LL</option>
                                                </select>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                                <div className="col-4">
                                    <form>
                                        <label style={{ margin: 0 }}>Sags:</label>
                                        <div className="form-group">
                                            <div className='input-group input-group-sm'>
                                                <input className='form-control' value={0} onChange={(e) => { }} />
                                                <div className="input-group-append">
                                                    <span className="input-group-text"> to </span>
                                                </div>
                                                <input className='form-control' value={0} onChange={(e) => { }} />
                                                <div className="input-group-append">
                                                    <span className="input-group-text">p.u.</span>
                                                </div>
                                                <select className="custom-select">
                                                    <option selected>LL</option>
                                                    <option value="1">LN</option>
                                                    <option value="2">LN/LL</option>
                                                </select>
                                            </div>
                                        </div>
                                        <label style={{ margin: 0 }}>Swells:</label>
                                        <div className="form-group">
                                            <div className='input-group input-group-sm'>
                                                <input className='form-control' value={0} onChange={(e) => { }} />
                                                <div className="input-group-append">
                                                    <span className="input-group-text"> to </span>
                                                </div>
                                                <input className='form-control' value={0} onChange={(e) => { }} />
                                                <div className="input-group-append">
                                                    <span className="input-group-text">p.u.</span>
                                                </div>
                                                <select className="custom-select">
                                                    <option selected>LL</option>
                                                    <option value="1">LN</option>
                                                    <option value="2">LN/LL</option>
                                                </select>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                        </div>

                         
                        </fieldset>
                    </li>

                    <li className="nav-item" style={{ width: '15%', paddingRight: 10 }}>
                        <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                            <legend className="w-auto" style={{ fontSize: 'large' }}>Voltage Class:</legend>
                           
                        </fieldset>
                    </li>
                 
                </ul>
                <div className="btn-group float-right" data-toggle="buttons">
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => props.toggleVis()}>Hide Filters</button>
                </div>
            </div>
        </nav>
    );
}

export default EventSearchNavbar;