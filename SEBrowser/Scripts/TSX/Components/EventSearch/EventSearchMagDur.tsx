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
import { SelectEventSearchsStatus, FetchEventSearches, SelectEventSearchs, SelectCharacteristicFilter, SelectEventSearchsSortField, SelectEventSearchsAscending, Sort } from './EventSearchSlice';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { Redux } from '../../global';
import { MagDurCurveSlice } from '../../Store';
import { Line, Plot, Circle, AggregatingCircles } from '@gpa-gemstone/react-graph';
import { SelectEventSearchSettings, SelectGeneralSettings } from '../SettingsSlice';
import { OverlayDrawer } from '@gpa-gemstone/react-interactive';
import { ReactTable } from '@gpa-gemstone/react-table';
import { ConfigTable } from '@gpa-gemstone/react-interactive';
import { OpenXDA } from '@gpa-gemstone/application-typings'

interface IProps {
    Height: number,
    EventID: number,
    SelectEvent: (id: number) => void,
}

const MagDurChart = (props: IProps) => {
    const chart = React.useRef(null);
    const count = React.useRef(null);
    const empty = React.useCallback(() => {/*Do Nothing*/ }, []);
    const magDurStatus = useAppSelector(MagDurCurveSlice.Status);
    const magDurCurves = useAppSelector(MagDurCurveSlice.Data) as OpenXDA.Types.MagDurCurve[];
    const [currentCurve, setCurrentCurve] = React.useState<OpenXDA.Types.MagDurCurve>(null)
    const numberResults = useAppSelector((state: Redux.StoreState) => SelectEventSearchSettings(state).NumberResults)
    const generalSettings: Redux.IGeneralSettings = useAppSelector(SelectGeneralSettings);
    const [width, setWidth] = React.useState<number>(0);
    const [x, setX] = React.useState<boolean>(false);
    const [hCounter, setHCounter] = React.useState<number>(0);
    const dispatch = useAppDispatch();
    const status = useAppSelector(SelectEventSearchsStatus);
    const points: any[] = useAppSelector(SelectEventSearchs);
    const [data, setData] = React.useState<any[]>([]);
    const [selectedMag, setSelectedMag] = React.useState<number>(0);
    const [selectedDur, setSelectedDur] = React.useState<number>(0);
    const settings = useAppSelector(SelectEventSearchSettings);
    const selectedCurve = useAppSelector((state: Redux.StoreState) => SelectCharacteristicFilter(state).curveID);
    const showSelectedCurve = useAppSelector((state: Redux.StoreState) => SelectCharacteristicFilter(state).curveInside != SelectCharacteristicFilter(state).curveOutside);

    // This needs to be used instead of a Layout effect since a Layout Effect would not get triggered since nothing is redrawn when
    // size of the parent div changes.
    React.useEffect(() => {
        setWidth(chart?.current?.offsetWidth ?? 0)

        const h = setTimeout(() => {
            setX((a) => !a)
        }, 500);

        return () => { if (h !== null) clearTimeout(h); };

    }, [x])

    React.useLayoutEffect(() => {
        setHCounter(count?.current?.offsetHeight ?? 0)
    });

    React.useEffect(() => {
        if (status != 'unitiated' && status != 'changed') return;
        dispatch(FetchEventSearches());

    }, [status]);

    React.useEffect(() => {
        if (magDurStatus == 'changed' || magDurStatus == 'unintiated')
            dispatch(MagDurCurveSlice.Fetch());
    }, [magDurStatus]);

    React.useEffect(() => {
        if (currentCurve == null && magDurCurves.length > 0)
            setCurrentCurve(magDurCurves[0]);

    }, [magDurCurves]);

    React.useEffect(() => {
        setData(points.filter(p => p['EventID'] != props.EventID).map((p) => ({
            data: [p['MagDurDuration'], p['MagDurMagnitude']],
            color: 'red',
            radius: 5,
            onClick: () => {
                props.SelectEvent(p['EventID'] as number)
                setSelectedDur(0);
                setSelectedMag(0);
            }
        })))
    }, [points])


    function generateCurve(curve: OpenXDA.Types.MagDurCurve) {
        const pt = curve.Area.split(',');
        const cu = pt.map(point => { const s = point.trim().split(" "); return [parseFloat(s[0]), parseFloat(s[1])] as [number, number]; })
        return cu;
    }

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

    function CanAggregate(d1, d2, { XTransformation, YTransformation }) {
        const dx = XTransformation(d1.data[0]) - XTransformation(d2.data[0]);
        const dy = YTransformation(d1.data[1]) - YTransformation(d2.data[1]);
        const r = d1.radius + d2.radius;
        return (Math.pow(dx, 2) + Math.pow(dy, 2) < Math.pow(r, 2));
    }

    function IsSame(d1, d2) {
        return Math.abs(d1.data[0] - d2.data[0]) < 0.0001 && Math.abs(d1.data[1] - d2.data[1]) < 1E-10;
    }

    const plotContent = React.useMemo(() => {
        return [
            ...magDurCurves.map((s, i) => <Line highlightHover={false}
                autoShowPoints={generalSettings.ShowDataPoints}
                lineStyle={'-'}
                color={s.Color}
                data={generateCurve(s)}
                legend={s.Name} key={i}
                width={showSelectedCurve && selectedCurve == s.ID ? 9 : 3}
            />),
            <AggregatingCircles data={data}
                canAggregate={settings.AggregateMagDur ? CanAggregate : IsSame}
                onAggregation={AggregateCurves}
            />,
            ...points.filter(e => e['EventID'] == props.EventID).map((p) => <Circle
                data={[p['MagDurDuration'], p['MagDurMagnitude']]}
                color={'blue'}
                radius={5} />)
        ]
    }, [magDurCurves, points, props.EventID, data, settings.AggregateMagDur, showSelectedCurve, selectedCurve])

    return (
        <>
            <div ref={chart} style={{ height: props.Height, width: '100%', display: 'inline-block' }}>
                <Plot height={props.Height - hCounter} width={width} showBorder={false} menuLocation={generalSettings.MoveOptionsLeft ? 'left' : 'right'}
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
                {status == 'loading' ? null :
                    data.length == numberResults ?
                        <div style={{ padding: 10, backgroundColor: '#458EFF', color: 'white' }} ref={count}>
                            Only the first {data.length}  chronological results are shown - please narrow your search or increase the number of results in the application settings.
                        </div> :
                        <div style={{ padding: 10, backgroundColor: '#458EFF', color: 'white' }} ref={count}>
                            {data.length} results
                        </div>}
            </div>
            <EventList
                Height={props.Height}
                Select={props.SelectEvent}
                Magnitude={selectedMag}
                Duration={selectedDur}
                Width={width}
            />
        </>
    )
}

export default MagDurChart;

interface IEventListProps {
    Select: (evt: number) => void;
    Magnitude: number;
    Duration: number;
    Height: number;
    Width: number;
}

interface IColumn {
    key: string,
    label: string,
    field: keyof any,
}

const EventList = (props: IEventListProps) => {
    const closureHandler = React.useRef<((o: boolean) => void)>(() => {/*Do Nothing*/ });

    const dataFilter = React.useCallback((state: Redux.StoreState) => SelectEventSearchs(state).filter(p =>
        Math.abs(p['MagDurDuration'] - props.Duration) < 1E-10 && Math.abs(p['MagDurMagnitude'] - props.Magnitude) < 0.0001),
        [props.Magnitude, props.Duration])

    const dispatch = useAppDispatch();
    const sortField = useAppSelector(SelectEventSearchsSortField);
    const ascending = useAppSelector(SelectEventSearchsAscending);
    const data = useAppSelector(dataFilter);
    const [columns, setColumns] = React.useState<IColumn[]>([]);

    React.useEffect(() => {
        if (props.Magnitude !== 0 && props.Duration !== 0) {
            closureHandler.current(true);
            LoadColumns();
        }
        else {
            closureHandler.current(false);
        }
    }, [props.Magnitude, props.Duration])

    function ProcessWhitespace(txt: string | number): React.ReactNode {
        if (txt == null)
            return <>N/A</>
        const lines = txt.toString().split("<br>");
        return lines.map((item, index) => {
            if (index == 0)
                return <> {item} </>
            return <> <br /> {item} </>
        })
    }

    function LoadColumns() {
        let c = [{ field: "Time", key: "Time", label: "Time" }];
        const flds = Object.keys(data[0]).filter(item => item != "Time" && item != "DisturbanceID" && item != "EventID" && item != "EventID1" && item != 'MagDurDuration' && item != 'MagDurMagnitude').sort();
        let keys = [];
        const currentState = localStorage.getItem('SEbrowser.EventSearch.TableCols');
        if (currentState !== null)
            keys = currentState.split(",");

        c = c.concat(flds.filter(f => keys.includes(f)).map(f => ({ field: f, key: f, label: f })));

        setColumns(c);
    }
    return <OverlayDrawer Title={''} Open={false} Location={'right'} Target={'eventPreviewPane'} GetOverride={(s) => { closureHandler.current = s; }} HideHandle={true}>

        <div style={{ width: props.Width, height: props.Height }} className={'magDurChartSelection'}>
            <div style={{ width: 160, float: 'right', padding: 10 }}>
                <button className='btn btn-primary' onClick={() => closureHandler.current(false)} >
                    Close
                </button>
            </div>
            {columns.length > 0 ?
                <ConfigTable.Table<any>
                    TableClass="table table-hover"
                    Data={data}
                    SortKey={sortField as string}
                    KeySelector={(item) => (item.EventID.toString() + '-' + item.DisturbanceID)}
                    Ascending={ascending}
                    OnSort={(d) => {
                        if (d.colKey == sortField) dispatch(Sort({ Ascending: ascending, SortField: sortField }));
                        else dispatch(Sort({ Ascending: true, SortField: d.colKey }));
                    }}
                    OnClick={(item) => { closureHandler.current(false); props.Select(item.row.EventID) }}
                    TheadStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '250px', height: 60 }}
                    TbodyStyle={{ display: 'block', overflowY: 'scroll', maxHeight: props.Height - 60 - 160 }}
                    RowStyle={{ display: 'table', tableLayout: 'fixed', width: 'calc(100%)' }}
                    TableStyle={{ marginBottom: 0 }}
                    Selected={() => false}
                >
                    <ReactTable.AdjustableColumn<any>
                        Key={'Time'}
                        AllowSort={true}
                        Content={({ item, field }) => ProcessWhitespace(item[field])}
                        RowStyle={{ minWidth: '100px' }}
                        Field={'Time'}
                    >
                        Time
                    </ReactTable.AdjustableColumn>
                    {...columns.map(c => (
                        <ConfigTable.Configurable Key={c.label} Label={c.label} Default={c.key === 'Event Type'}>
                            <ReactTable.AdjustableColumn<any>
                                Key={c.key}
                                AllowSort={true}
                                Field={c.label}
                                RowStyle={{ minWidth: '100px' }}
                                Content={({ item, field }) => ProcessWhitespace(item[field])}
                            >
                                {c.label}
                            </ReactTable.AdjustableColumn>
                        </ConfigTable.Configurable>
                    ))}
                </ConfigTable.Table> :
                <></>
            }
        </div>
    </OverlayDrawer>
}