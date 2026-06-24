//******************************************************************************************************
//  EventSearchMagDurChart.tsx - Gbtc
//
//  Copyright © 2020, Grid Protection Alliance.  All Rights Reserved.
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
//  06/23/2020 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import * as React from 'react';
import { SelectEventSearchsStatus, FetchEventSearches, SelectEventSearchs, SelectCharacteristicFilter} from '../../../Store/EventSearchSlice';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { Redux } from '../../../global';
import { Line, Plot, Circle, AggregatingCircles } from '@gpa-gemstone/react-graph';
import { SelectEventSearchSettings, SelectGeneralSettings } from '../../../Store/SettingsSlice';
import { OpenXDA, Application } from '@gpa-gemstone/application-typings'
import { useGetContainerPosition } from '@gpa-gemstone/helper-functions';
import EventList from './EventList';
import { FetchMagDurCurves } from '../FetchMagDurCurves';

interface IProps {
    Height: number,
    EventID: number,
    SelectEvent: (id: number) => void,
}

interface IData {
    data: [number, number];
    radius: number;
    color: string;
    onClick: () => void;
}

const MagDurChart = (props: IProps) => {
    const chartRef = React.useRef<HTMLDivElement | null>(null);
    const { width: chartWidth } = useGetContainerPosition(chartRef);
    const countDivRef = React.useRef<HTMLDivElement | null>(null);
    const {height: countHeight} = useGetContainerPosition(countDivRef);
    const empty = React.useCallback(() => {/*Do Nothing*/ }, []);
    const dispatch = useAppDispatch();

    const [magDurStatus, setMagDurStatus] = React.useState<Application.Types.Status>('uninitiated');
    const [magDurCurves, setMagDurCurves] = React.useState<OpenXDA.Types.MagDurCurve[]>([]);

    const [currentCurve, setCurrentCurve] = React.useState<OpenXDA.Types.MagDurCurve | null>(null);
    const numberResults = useAppSelector((state: Redux.StoreState) => SelectEventSearchSettings(state).NumberResults)
    const generalSettings: Redux.IGeneralSettings = useAppSelector(SelectGeneralSettings);

    const settings = useAppSelector(SelectEventSearchSettings);
    const selectedCurve = useAppSelector((state: Redux.StoreState) => SelectCharacteristicFilter(state).curveID);
    const showSelectedCurve = useAppSelector((state: Redux.StoreState) => SelectCharacteristicFilter(state).curveInside != SelectCharacteristicFilter(state).curveOutside);
    const status = useAppSelector(SelectEventSearchsStatus);
    const points: any[] = useAppSelector(SelectEventSearchs);

    const [selectedMag, setSelectedMag] = React.useState<number>(0);
    const [selectedDur, setSelectedDur] = React.useState<number>(0);

    React.useEffect(() => {
        if (status != 'uninitiated' && status != 'changed') return;

        dispatch(FetchEventSearches());
    }, [status]);

    React.useEffect(() => {
        setMagDurStatus('loading');
        const handle = FetchMagDurCurves();

        handle.done((curves: OpenXDA.Types.MagDurCurve[]) => {
            setMagDurCurves(curves);
            setMagDurStatus('idle');
        });

        handle.fail(() => setMagDurStatus('error'));

        return () => {
            if (handle?.abort != null)
                handle.abort();
        };
    }, []);

    React.useEffect(() => {
        if (currentCurve == null && magDurCurves.length > 0)
            setCurrentCurve(magDurCurves[0]);
    }, [magDurCurves]);

    const data: IData[] = React.useMemo(() => {
        return points
            .filter(p => p['EventID'] != props.EventID)
            .map((p) => ({
                data: [p['MagDurDuration'], p['MagDurMagnitude']],
                color: 'red',
                radius: 5,
                onClick: () => {
                    props.SelectEvent(p['EventID'] as number)
                    setSelectedDur(0);
                    setSelectedMag(0);
                }
            }))
    }, [points])

    function AggregateCurves(d, { XTransformation, YTransformation, YInverseTransformation, XInverseTransformation }) {
        const xmax = Math.max(...d.map(c => XTransformation(c.data[0]))) + 5;
        const ymax = Math.max(...d.map(c => YTransformation(c.data[1]))) + 5;
        const xmin = Math.min(...d.map(c => XTransformation(c.data[0]))) - 5;
        const ymin = Math.min(...d.map(c => YTransformation(c.data[1]))) - 5;
        const xcenter = 0.5 * (xmax + xmin);
        const ycenter = 0.5 * (ymax + ymin);
        const r = Math.max(Math.abs(xmax - xcenter), Math.abs(xmin - xcenter), Math.abs(ymax - ycenter), Math.abs(ymin - ycenter))
        let handler = ({ setTDomain, setYDomain }) => {
            setTDomain([XInverseTransformation(xmin), XInverseTransformation(xmax)]);
            setYDomain([YInverseTransformation(ymax), YInverseTransformation(ymin)]);
            setSelectedDur(0);
            setSelectedMag(0);
        };
        if (Math.abs(xmin - xmax) < 11 && Math.abs(ymin - ymax) < 11)
            handler = () => {
                setSelectedDur(d[0].data[0]);
                setSelectedMag(d[0].data[1]);
            }
        return {
            data: [XInverseTransformation(xcenter), YInverseTransformation(ycenter)] as [number, number],
            color: 'rgb(108, 117, 125)',
            borderColor: 'black',
            borderThickness: 2,
            text: d.length.toString(),
            radius: r,
            opacity: 0.5,
            onClick: handler
        };
    }

    const plotContent = React.useMemo(() => {
        return [
            ...magDurCurves.map((s, i) =>
                <Line highlightHover={false}
                    autoShowPoints={generalSettings.ShowDataPoints}
                    lineStyle={'-'}
                    color={s.Color}
                    data={generateCurve(s)}
                    legend={s.Name}
                    key={i}
                    width={showSelectedCurve && selectedCurve == s.ID ? 9 : 3}
                />
            ),
            <AggregatingCircles
                data={data}
                canAggregate={settings.AggregateMagDur ? CanAggregate : IsSame}
                onAggregation={AggregateCurves}
            />,
            ...points
                .filter(e => e['EventID'] == props.EventID)
                .map((p) =>
                    <Circle
                        data={[p['MagDurDuration'], p['MagDurMagnitude']]}
                        color={'blue'}
                        radius={5} />
                )
        ]
    }, [magDurCurves, points, props.EventID, data, settings.AggregateMagDur, showSelectedCurve, selectedCurve])

    return (
        <>
            <div ref={chartRef} style={{ height: props.Height, width: '100%', display: 'inline-block' }}>
                <Plot height={props.Height - countHeight} width={chartWidth} showBorder={false} menuLocation={generalSettings.MoveOptionsLeft ? 'left' : 'right'}
                    defaultTdomain={[0.00001, 1000]}
                    defaultYdomain={[0, 5]}
                    Tmax={1000}
                    Tmin={0.00001}
                    Ymax={9999}
                    Ymin={0}
                    legend={'right'}
                    Tlabel={'Duration (s)'}
                    Ylabel={'Magnitude (pu)'}
                    showMouse={false}
                    showGrid={true}
                    yDomain={'Manual'}
                    zoom={true} pan={true} useMetricFactors={false} XAxisType={'log'} onSelect={empty}>
                    {plotContent}
                </Plot>
                {status == 'loading' || magDurStatus == 'loading' ? null :
                    data.length == numberResults ?
                        <div style={{ padding: 10, backgroundColor: '#458EFF', color: 'white' }} ref={countDivRef}>
                            Only the first {data.length}  chronological results are shown - please narrow your search or increase the number of results in the application settings.
                        </div> :
                        <div style={{ padding: 10, backgroundColor: '#458EFF', color: 'white' }} ref={countDivRef}>
                            {data.length} results
                        </div>}
            </div>
            <EventList
            Height={props.Height}
             Select={props.SelectEvent}
              Magnitude={selectedMag}
               Duration={selectedDur} 
               Width={chartWidth}
                />
        </>
    )
}

function generateCurve(curve: OpenXDA.Types.MagDurCurve) {
    const pt = curve.Area.split(',');
    const cu = pt.map(point => { const s = point.trim().split(" "); return [parseFloat(s[0]), parseFloat(s[1])] as [number, number]; })
    return cu;
}

function CanAggregate(d1, d2, { XTransformation, YTransformation }) {
    const dx = XTransformation(d1.data[0]) - XTransformation(d2.data[0]);
    const dy = YTransformation(d1.data[1]) - YTransformation(d2.data[1]);
    const r = d1.radius + d2.radius;
    return (Math.pow(dx, 2) + Math.pow(dy, 2) < Math.pow(r, 2));
}

function IsSame(d1, d2) {
    return Math.abs(d1.data[0] - d2.data[0]) < 0.0001 && Math.abs(d1.data[1] - d2.data[1]) < 1E-10;
}

export default MagDurChart;
