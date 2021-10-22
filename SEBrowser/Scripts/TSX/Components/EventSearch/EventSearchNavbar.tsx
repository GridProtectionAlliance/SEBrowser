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
import { OpenXDA } from '../../global';
import { useDispatch, useSelector } from 'react-redux';
import { SelectAssetGroupList, SelectAssetList, SelectCharacteristicFilter, SelectMeterList, SelectReset, SelectStationList, SelectTimeFilter, SelectTypeFilter, SetFilterLists } from './EventSearchSlice';
import { ResetFilters,  SetFilters } from './EventSearchSlice';
import { MagDurCurveSlice } from '../../Store';
import { Modal } from '@gpa-gemstone/react-interactive';
import EventSearchFilterButton from './EventSearchbarFilterButton';
import EventSearchbarFilterModal from './EventSearchbarFilterModal';


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
    const magDurStatus = useSelector(MagDurCurveSlice.Status);
    const magDurCurves = useSelector(MagDurCurveSlice.Data);

    const meterList = useSelector(SelectMeterList);
    const assetList = useSelector(SelectAssetList);
    const assetGroupList = useSelector(SelectAssetGroupList);
    const stationList = useSelector(SelectStationList)

    const reset = useSelector(SelectReset);



    const [showFilter, setFilter] = React.useState<('None' | 'Meter' | 'Asset' | 'AssetGroup' | 'Station')>('None');

    React.useEffect(() => {
        if (magDurStatus == 'changed' || magDurStatus == 'unintiated')
            dispatch(MagDurCurveSlice.Fetch());
    }, [magDurStatus]);

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
            <nav className="navbar navbar-expand-xl navbar-light bg-light">
                <div className="collapse navbar-collapse" id="navbarSupportedContent" style={{ width: '100%' }}>
                    <div className="navbar-nav mr-auto">
                        <span className="navbar-text">
                            {timeFilter.date} {timeFilter.time} +/- {timeFilter.windowSize} {formatWindowUnit(timeFilter.timeWindowUnits)}
                        </span>
                    </div>
                    <div className="navbar-nav ml-auto" >
                        <button type="button" className={`btn btn-${(!reset ? 'primary' : 'info')} btn-sm`} onClick={() => props.toggleVis()}>Show Filters</button>
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
                                        }} checked={eventTypeFilter.breakerOps && eventTypeFilter.faults && eventTypeFilter.interruptions && eventTypeFilter.others &&
                                            eventTypeFilter.relayTCE && eventTypeFilter.sags && eventTypeFilter.swells && eventTypeFilter.transients
                                            } />  Select All </label></li>
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
                                            </div>
                                            </div>
                                        </form>
                                </div>
                                <div className={"col-4"}>
                                    <form>
                                        <label style={{ margin: 0 }}>Mag-Dur:</label>
                                        <div className="form-group">
                                            <div className='input-group input-group-sm'>
                                                    <select className="form-control form-control-sm" value={eventCharacteristicFilter.curveID} onChange={(e) => dispatch(SetFilters({
                                                        characteristics: { ...eventCharacteristicFilter, curveID: parseInt((e.target as any).value) },
                                                        time: timeFilter,
                                                        types: eventTypeFilter,
                                                    }))}>
                                                    {magDurCurves.map((v) => (v.Area != undefined && v.Area.length > 0 ? <option key={v.ID} value={v.ID}> {v.Name}</option> : null))}
                                                </select>
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
                                                    <input className='form-control' value={eventTypeFilter.sags ? eventCharacteristicFilter.sagMin : ''} onChange={(e) => {
                                                        dispatch(SetFilters({
                                                            characteristics: { ...eventCharacteristicFilter, sagMin: parseFloat((e.target as any).value) },
                                                            time: timeFilter,
                                                            types: eventTypeFilter,
                                                        }));
                                                    }} disabled={!eventTypeFilter.sags} />
                                                    <div className="input-group-append">
                                                        <span className="input-group-text"> to </span>
                                                    </div>
                                                    <input className='form-control' value={eventTypeFilter.sags ? eventCharacteristicFilter.sagMax : ''} onChange={(e) => {
                                                        dispatch(SetFilters({
                                                            characteristics: { ...eventCharacteristicFilter, sagMax: parseFloat((e.target as any).value) },
                                                            time: timeFilter,
                                                            types: eventTypeFilter,
                                                        }));
                                                    }} disabled={!eventTypeFilter.sags} />
                                                </div>
                                                <div className="form-group">
                                                    <select className="form-control form-control-sm" disabled={!eventTypeFilter.sags}
                                                        value={eventCharacteristicFilter.sagType} onChange={(e) => {
                                                            dispatch(SetFilters({
                                                                characteristics: { ...eventCharacteristicFilter, sagType: (e.target as any).value },
                                                                time: timeFilter,
                                                                types: eventTypeFilter,
                                                            }));
                                                        }}>
                                                        <option value='LL'>LL</option>
                                                        <option value="LN">LN</option>
                                                        <option value="both">LN/LL</option>
                                                    </select>
                                                </div>
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
                                                }} checked={eventCharacteristicFilter.Phase.A && eventCharacteristicFilter.Phase.B && eventCharacteristicFilter.Phase.C} />
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
                                                    <input className='form-control form-control-sm' value={eventTypeFilter.transients? eventCharacteristicFilter.transientMin : ''} onChange={(e) => {
                                                    dispatch(SetFilters({
                                                        characteristics: { ...eventCharacteristicFilter, transientMin: parseFloat((e.target as any).value) },
                                                        time: timeFilter,
                                                        types: eventTypeFilter,
                                                    }));
                                                }} disabled={!eventTypeFilter.transients} />
                                                <div className="input-group-append">
                                                    <span className="input-group-text"> to </span>
                                                </div>
                                                    <input className='form-control form-control-sm' value={eventTypeFilter.transients? eventCharacteristicFilter.transientMax : ''} onChange={(e) => {
                                                    dispatch(SetFilters({
                                                        characteristics: { ...eventCharacteristicFilter, transientMax: parseFloat((e.target as any).value) },
                                                        time: timeFilter,
                                                        types: eventTypeFilter,
                                                    }));
                                                }} disabled={!eventTypeFilter.transients} />
                                                </div>
                                                <div className="form-group">
                                                    <select className={'form-control form-control-sm'} disabled={!eventTypeFilter.transients}
                                                    value={eventCharacteristicFilter.transientType} onChange={(e) => {
                                                        dispatch(SetFilters({
                                                            characteristics: { ...eventCharacteristicFilter, transientType: (e.target as any).value },
                                                            time: timeFilter,
                                                            types: eventTypeFilter,
                                                        }));
                                                    }}>
                                                    <option value='LL'>LL</option>
                                                    <option value="LN">LN</option>
                                                    <option value="both">LN/LL</option>
                                                </select>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                                <div className="col-4">
                                    <form>
                                        
                                        <label style={{ margin: 0 }}>Swells (p.u.):</label>
                                        <div className="form-group">
                                            <div className='input-group input-group-sm'>
                                                <input className='form-control' value={eventTypeFilter.swells ? eventCharacteristicFilter.swellMin : ''} onChange={(e) => {
                                                    dispatch(SetFilters({
                                                        characteristics: { ...eventCharacteristicFilter, swellMin: parseFloat((e.target as any).value) },
                                                        time: timeFilter,
                                                        types: eventTypeFilter,
                                                    }));
                                                }} disabled={!eventTypeFilter.swells}/>
                                                <div className="input-group-append">
                                                    <span className="input-group-text"> to </span>
                                                </div>
                                                <input className='form-control' value={eventCharacteristicFilter.swellMax} onChange={(e) => {
                                                    dispatch(SetFilters({
                                                        characteristics: { ...eventCharacteristicFilter, swellMax: parseFloat((e.target as any).value) },
                                                        time: timeFilter,
                                                        types: eventTypeFilter,
                                                    }));
                                                    }} disabled={!eventTypeFilter.swells} />
                                                </div>
                                                <div className="form-group">
                                                    <select className="form-control form-control-sm" disabled={!eventTypeFilter.swells}
                                                    value={eventCharacteristicFilter.swellType} onChange={(e) => {
                                                        dispatch(SetFilters({
                                                            characteristics: { ...eventCharacteristicFilter, swellType: (e.target as any).value },
                                                            time: timeFilter,
                                                            types: eventTypeFilter,
                                                        }));
                                                    }}>
                                                    <option value='LL'>LL</option>
                                                    <option value="LN">LN</option>
                                                    <option value="both">LN/LL</option>
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
                            <legend className="w-auto" style={{ fontSize: 'large' }}>Other Filters:</legend>
                                <div className={"row"}>
                                    <div className={'col'}>
                                        <EventSearchFilterButton<OpenXDA.Meter> Type={'Meter'} OnClick={() => setFilter('Meter')} Data={meterList} />
                                    </div>
                                </div>
                                <div className={"row"}>
                                    <div className={'col'}>
                                        <EventSearchFilterButton<OpenXDA.Asset> Type={'Asset'} OnClick={() => setFilter('Asset')} Data={assetList} />
                                    </div>
                                </div>
                                <div className={"row"}>
                                    <div className={'col'}>
                                        <EventSearchFilterButton<OpenXDA.AssetGroup> Type={'AssetGroup'} OnClick={() => setFilter('AssetGroup')} Data={assetGroupList} />
                                    </div>
                                </div>
                                <div className={"row"}>
                                    <div className={'col'}>
                                        <EventSearchFilterButton<OpenXDA.Location> Type={'Station'} OnClick={() => setFilter('Station')} Data={stationList} />
                                    </div>
                                </div>

                        </fieldset>
                    </li>
                 
                </ul>
                    <div className="btn-group-vertical float-right" data-toggle="buttons">
                        <button type="button" style={{ marginBottom: 5 }} className={`btn btn-${(!reset ? 'primary' : 'info')} btn-sm`} onClick={() => props.toggleVis()}>Hide Filters</button>
                        <button type="button" className="btn btn-danger btn-sm" disabled={reset} onClick={() => dispatch(ResetFilters())}>Reset Filters</button>
                </div>
            </div>
            </nav>
            <Modal Show={showFilter != 'None'} Size={'xlg'} ShowX={true} ShowCancel={false} ConfirmBtnClass={'btn-danger'} ConfirmText={'Remove all ' + showFilter + ' filters'} Title={"Filter By " + showFilter} CallBack={(conf,btn) => {

                if (btn && showFilter == 'Meter')
                    dispatch(SetFilterLists({ Assets: assetList, Groups: assetGroupList, Meters: [], Stations: stationList }));
                if (btn && showFilter == 'Asset')
                    dispatch(SetFilterLists({ Assets: [], Groups: assetGroupList, Meters: meterList, Stations: stationList }));
                if (btn && showFilter == 'AssetGroup')
                    dispatch(SetFilterLists({ Assets: assetList, Groups: [], Meters: meterList, Stations: stationList }));
                if (btn && showFilter == 'Station')
                    dispatch(SetFilterLists({ Assets: assetList, Groups: assetGroupList, Meters: meterList, Stations: [] }));
            
                setFilter('None');
            }}>
                {showFilter == 'Meter' ? <EventSearchbarFilterModal< OpenXDA.Meter> Type={'Meter'} Data={meterList} SetData={(d) => dispatch(SetFilterLists({ Assets: assetList, Groups: assetGroupList, Meters: d, Stations: stationList }))} /> : null}
                {showFilter == 'Asset' ? <EventSearchbarFilterModal< OpenXDA.Asset> Type={'Asset'} Data={assetList} SetData={(d) => dispatch(SetFilterLists({ Assets: d, Groups: assetGroupList, Meters: meterList, Stations: stationList }))} /> : null}
                {showFilter == 'AssetGroup' ? <EventSearchbarFilterModal< OpenXDA.AssetGroup> Type={'AssetGroup'} Data={assetGroupList} SetData={(d) => dispatch(SetFilterLists({ Assets: assetList, Groups: d, Meters: meterList, Stations: stationList }))} /> : null}
                {showFilter == 'Station' ? <EventSearchbarFilterModal< OpenXDA.Location> Type={'Station'} Data={stationList} SetData={(d) => dispatch(SetFilterLists({ Assets: assetList, Groups: assetGroupList, Meters: meterList, Stations: d }))} /> : null}
            </Modal>
            </>
    );
}

export default EventSearchNavbar;