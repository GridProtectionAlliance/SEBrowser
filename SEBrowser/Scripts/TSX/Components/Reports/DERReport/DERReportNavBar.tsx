//******************************************************************************************************
//  DERAnalysisReportNavBar.tsx - Gbtc
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
//  09/11/2019 - Christoph Lackner
//       Generated original version of source code.
//******************************************************************************************************

import * as React from 'react';
import { MultiCheckBoxSelect } from '@gpa-gemstone/react-forms';
import { Application, OpenXDA } from '@gpa-gemstone/application-typings';
import { ReactIcons } from '@gpa-gemstone/gpa-symbols';
import { TimeFilter } from '@gpa-gemstone/common-pages';
import { toGemstoneFilter, fromGemstoneFilter } from '../../EventSearch/TimeWindowUtils';
import { useAppSelector } from '../../../hooks';
import { SelectDateTimeSetting, SelectTimeZone } from '../../../Store/SettingsSlice';

export interface ISelectableOption {
    Value: number,
    Label: string,
    Selected: boolean
}

export interface DERAnalysisReportNavBarProps {
    date: string,
    time: string,
    windowSize: number,
    timeWindowUnits: number,
    setDate: (date: string) => void,
    setTime: (time: string) => void,
    setWindowSize: (windowSize: number) => void,
    setTimeWindowUnits: (timeWindowUnits: number) => void,
    setRegulations: (regulations: ISelectableOption[]) => void,
    setDERs: (ders: ISelectableOption[]) => void
}

const DERAnalysisReportNavBar = (props: DERAnalysisReportNavBarProps) => {
    const dateTimeSetting = useAppSelector(SelectDateTimeSetting);
    const timeZone = useAppSelector(SelectTimeZone);

    const [regulations, setRegulations] = React.useState<ISelectableOption[]>([]);
    const [stations, setStations] = React.useState<ISelectableOption[]>([]);
    const [ders, setDERs] = React.useState<ISelectableOption[]>([]);
    const [regulationStatus, setRegulationStatus] = React.useState<Application.Types.Status>('uninitiated');
    const [stationStatus, setStationStatus] = React.useState<Application.Types.Status>('uninitiated');
    const [derStatus, setDERStatus] = React.useState<Application.Types.Status>('uninitiated');

    React.useEffect(() => {
        setRegulationStatus('loading');
        const regulationHandle = getRegulationData();
        regulationHandle.done(d => {
            const options = d.map((reg, i) => ({ Value: i, Label: reg, Selected: true }));
            setRegulations(options);
            props.setRegulations(options);
            setRegulationStatus('idle');
        }).fail(() => setRegulationStatus('error'));

        setStationStatus('loading');
        const stationHandle = getSubstationData();
        stationHandle.done(d => {
            setStations(d.map(reg => ({ Value: reg.LocationID, Label: reg.Name, Selected: true })));
            setStationStatus('idle');
        }).fail(() => setStationStatus('error'));

        return () => {
            if (regulationHandle.abort != undefined) regulationHandle.abort();
            if (stationHandle.abort != undefined) stationHandle.abort();
        };
    }, []);

    React.useEffect(() => {
        setDERStatus('loading');
        const handle = getDERData(stations.filter(s => s.Selected).map(s => s.Value));
        handle.done(d => {
            const options = d.map(reg => ({ Value: reg.ID, Label: reg.AssetName, Selected: true }));
            setDERs(options);
            props.setDERs(options);
            setDERStatus('idle');
        }).fail(() => setDERStatus('error'));

        return () => {
            if (handle.abort != undefined) handle.abort();
        };
    }, [stations]);

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">

            <div className="collapse navbar-collapse" id="navbarSupportedContent" style={{ width: '100%' }}>
                <ul className="navbar-nav mr-auto" style={{ width: '100%' }}>
                    <li className="nav-item" style={{ width: '50%', paddingRight: 10 }}>
                        <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                            <legend className="w-auto" style={{ fontSize: 'large' }}>DER:</legend>
                            <form>
                                <div className="form-group" style={{ height: 60, width: '100%' }}>
                                    {stationStatus === 'loading' ?
                                        <div className='d-flex align-items-center justify-content-center'>
                                            <ReactIcons.SpiningIcon />
                                        </div>
                                        : <MultiCheckBoxSelect Label={'Substation:'} Options={stations} OnChange={(evt, options) => {
                                        const records = [...stations]
                                        for (const option of options) {
                                            const index = records.findIndex(r => r.Value == option.Value)
                                            records[index].Selected = !records[index].Selected
                                        }
                                        setStations(records)
                                    }} />}

                                </div>
                                <div className="form-group" style={{ height: 60, width: '100%' }}>
                                    {derStatus === 'loading' ?
                                        <div className='d-flex align-items-center justify-content-center'>
                                            <ReactIcons.SpiningIcon />
                                        </div>
                                        : <MultiCheckBoxSelect Label={'DER:'} Options={ders} OnChange={(evt, options) => {
                                        const records = [...ders]
                                        for (const option of options) {
                                            const index = records.findIndex(r => r.Value == option.Value)
                                            records[index].Selected = !records[index].Selected
                                        }
                                        setDERs(records)
                                        props.setDERs(records)
                                    }} />}
                                </div>
                                <div className="form-group" style={{ height: 60, width: '100%' }}>
                                    {regulationStatus === 'loading' ?
                                        <div className='d-flex align-items-center justify-content-center'>
                                            <ReactIcons.SpiningIcon />
                                        </div>
                                        : <MultiCheckBoxSelect Label={'Regulations:'} Options={regulations} OnChange={(evt, options) => {
                                        const records = [...regulations]
                                        for (const option of options) {
                                            const index = records.findIndex(r => r.Value == option.Value)
                                            records[index].Selected = !records[index].Selected
                                        }
                                        setRegulations(records)
                                        props.setRegulations(records)
                                    }} />}
                                </div>
                            </form>
                        </fieldset>
                    </li>

                    <li className="nav-item" style={{ width: '50%', paddingRight: 10 }}>
                        <TimeFilter filter={toGemstoneFilter({ date: props.date, time: props.time, windowSize: props.windowSize, timeWindowUnits: props.timeWindowUnits })} setFilter={(start, end, unit, duration) => {
                            const f = fromGemstoneFilter(start, end, unit, duration);
                            props.setDate(f.date);
                            props.setTime(f.time);
                            props.setTimeWindowUnits(f.timeWindowUnits);
                            props.setWindowSize(f.windowSize);
                        }}
                        showQuickSelect={true}
                         dateTimeSetting={dateTimeSetting}
                          timeZone={timeZone}
                          />
                    </li>


                </ul>
            </div>
        </nav>
    );
}

function getRegulationData(): JQuery.jqXHR<string[]> {
    return $.ajax({
        type: "GET",
        url: `${homePath}api/DERReport/Regulation`,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: false,
        async: true
    });
}

function getSubstationData(): JQuery.jqXHR<{ LocationID: number, LocationKey: string, Name: string }[]> {
    return $.ajax({
        type: "GET",
        url: `${homePath}api/DERReport/Substation`,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: false,
        async: true
    });
}

function getDERData(substationIDs: number[]): JQuery.jqXHR<OpenXDA.Types.Asset[]> {
    return $.ajax({
        type: "POST",
        url: `${homePath}api/DERReport/DER`,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        data: JSON.stringify({ SubstationIDs: substationIDs }),
        cache: false,
        async: true
    });
}

export default DERAnalysisReportNavBar;
