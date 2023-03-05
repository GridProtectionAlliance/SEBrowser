//******************************************************************************************************
//  EventSearchOpenSEE.tsx - Gbtc
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
//  03/03/2020 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************
import { Line, Plot } from '@gpa-gemstone/react-graph';
import React from 'react';

interface ISeries { label: string, color: string, data: [number, number][] }
interface IPartialOpenseeSettings {
    Colors: {
        Va: string,
        Vb: string,
        Vc: string,
        Vn: string,
        Vab: string,
        Vbc: string,
        Vca: string,
        Ia: string,
        Ib: string,
        Ic: string,
        Ires: string,
        In: string,
        random: string
    }
}

export default function EventSearchOpenSEE(props: { EventID: number }) {
    const divref = React.useRef(null);

    const [VData, setVData] = React.useState<ISeries[]>([]);
    const [VLim, setVLim] = React.useState<[number, number]>([0, 100]);
    const [IData, setIData] = React.useState<ISeries[]>([]);
    const [ILim, setILim] = React.useState<[number, number]>([0, 100]);
    const [TCEData, setTCEData] = React.useState<ISeries[]>([]);
    const [TCELim, setTCELim] = React.useState<[number, number]>([0, 100]);

    const [Width, SetWidth] = React.useState<number>(0);
    const [openSeeSettings, setOpenSeeSettings] = React.useState<IPartialOpenseeSettings>(null);

    React.useEffect(() => { setOpenSeeSettings(loadSettings()) }, [])
    React.useLayoutEffect(() => { SetWidth(divref?.current?.offsetWidth ?? 0) });

    React.useEffect(() => {
        const Vhandle = GetData('Voltage', setVData);
        const Ihandle = GetData('Current', setIData);
        const TCEhandle = GetData('TripCoilCurrent', setTCEData)

        return () => {
            if (Vhandle != null && Vhandle.abort != null)
                Vhandle.abort();
            if (Ihandle != null && Ihandle.abort != null)
                Ihandle.abort();
            if (TCEhandle != null && TCEhandle.abort != null)
                TCEhandle.abort();
        }
    }, [props.EventID]);

    React.useEffect(() => {
        let min = 0;
        let max = 100;
        if (VData.length > 0) {
            min = Math.min(...VData.map((d) => d.data[0][0]));
            max = Math.max(...VData.map((d) => d.data[d.data.length - 1][0]));
        }
        setVLim([min, max])
    }, [VData]);


    React.useEffect(() => {
        let min = 0;
        let max = 100;
        if (IData.length > 0) {
            min = Math.min(...IData.map((d) => d.data[0][0]));
            max = Math.max(...IData.map((d) => d.data[d.data.length - 1][0]));
        }
        setILim([min, max])
    }, [IData]);

    React.useEffect(() => {
        let min = 0;
        let max = 100;
        if (TCEData.length > 0) {
            min = Math.min(...TCEData.map((d) => d.data[0][0]));
            max = Math.max(...TCEData.map((d) => d.data[d.data.length - 1][0]));
        }
        setTCELim([min, max])
    }, [TCEData])

    function GetData(type: ('Voltage' | 'Current' | 'TripCoilCurrent'), datasetter: (d: ISeries[]) => void) {
        return $.ajax({
            type: "GET",
            url: `${homePath}api/OpenXDA/GetData?eventId=${props.EventID}` +
                `&pixels=${1200}` +
                `&type=${type}` +
                `&dataType=Time`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        }).done(data => {
            datasetter(Object.keys(data).map((key, index, keys) => ({label: key, data: data[key], color: '#ff0000'} as ISeries)))
    })
    }

    function loadSettings(): IPartialOpenseeSettings {

        // ToDO: Move Default OpenSee settigns to gpa-gemstone and use from there.
        const defaultSettings: IPartialOpenseeSettings = {
            Colors: {
                Va: "#A30000",
                Vb: "#0029A3",
                Vc: "#007A29",
                Vn: "#d3d3d3",
                Vab: "#A30000",
                Vbc: "#0029A3",
                Vca: "#007A29",
                Ia: "#FF0000",
                Ib: "#0066CC",
                Ic: "#33CC33",
                Ires: "#d3d3d3",
                In: "#d3d3d3",
                random: "#4287f5"
            }
        }
        try {
            const serializedState = localStorage.getItem('openSee.Settings');
            if (serializedState === null) 
                return defaultSettings;
    

            // overwrite options if new options are available
            let state: IPartialOpenseeSettings = JSON.parse(serializedState);

            Object.keys(defaultSettings.Colors).forEach((key) => {
                if (state.Colors[key] == undefined)
                    state.Colors[key] = defaultSettings.Colors[key];
            });

            return state;
        } catch (err) {
            return defaultSettings;
        }
    }

    function getColor(label) {

        if (label.indexOf('VA') >= 0) return openSeeSettings.Colors.Va;
        if (label.indexOf('VB') >= 0) return openSeeSettings.Colors.Vb;
        if (label.indexOf('VC') >= 0) return openSeeSettings.Colors.Vc;
        if (label.indexOf('VN') >= 0) return openSeeSettings.Colors.Vn;
        if (label.indexOf('IA') >= 0) return openSeeSettings.Colors.Ia;
        if (label.indexOf('IB') >= 0) return openSeeSettings.Colors.Ib;
        if (label.indexOf('IC') >= 0) return openSeeSettings.Colors.Ic;
        if (label.indexOf('IR') >= 0) return openSeeSettings.Colors.Ires;

        return openSeeSettings.Colors.random;
    }

    return (
        <div className="card">
            <div className="card-header"><a href={openSEEInstance + '?eventid=' + props.EventID} target="_blank">View in OpenSEE</a></div>
            <div className="card-body" ref={divref}>
                {VData.length > 0 ? < Plot height={250} width={Width} showBorder={false}
                    legendWidth={150}
                    defaultTdomain={VLim}
                    legend={'right'}
                    Tlabel={'Time'}
                    Ylabel={'Voltage (V)'} showMouse={false} zoom={false} pan={false} useMetricFactors={false}>
                    {VData.map((s, i) => <Line highlightHover={false} showPoints={false} lineStyle={'-'} color={getColor(s.label)} data={s.data} legend={s.label} key={i} />)}
                </Plot> : null}
                {IData.length > 0 ? < Plot height={250} width={Width} showBorder={false}
                    defaultTdomain={ILim}
                    legendWidth={150}
                    legend={'right'}
                    Tlabel={'Time'}
                    Ylabel={'Current (A)'} showMouse={false} zoom={false} pan={false} useMetricFactors={false}>
                    {IData.map((s, i) => <Line highlightHover={false} showPoints={false} lineStyle={'-'} color={getColor(s.label)} data={s.data} legend={s.label} key={i} />)}
                </Plot> : null}
                {TCEData.length > 0 ? < Plot height={250} width={Width} showBorder={false}
                    defaultTdomain={TCELim}
                    legendWidth={150}
                    legend={'right'}
                    Tlabel={'Time'}
                    Ylabel={'Trip Coil Current (A)'} showMouse={false} zoom={false} pan={false} useMetricFactors={false}>
                    {TCEData.map((s, i) => <Line highlightHover={false} showPoints={false} lineStyle={'-'} color={getColor(s.label)} data={s.data} legend={s.label} key={i} />)}
                </Plot> : null}              
            </div>
        </div>
)
}