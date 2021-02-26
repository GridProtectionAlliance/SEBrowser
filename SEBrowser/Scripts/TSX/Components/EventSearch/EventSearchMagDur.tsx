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
import * as d3 from 'd3';
import * as _ from 'lodash';
import { EventSearchNavbarProps } from './EventSearchNavbar';
import { SelectEventSearchBySearchText, SelectEventSearchsAscending, SelectEventSearchsSortField, Sort, SelectEventSearchsStatus, FetchEventSearches } from './EventSearchSlice';
import { useSelector, useDispatch } from 'react-redux';
import { OpenXDA } from '../../global';

export interface iPoint {
    EventID: number,
    Magnitude: number,
    Duration: number
}

interface MagDurCurve {
    Name: string,
    Visible: boolean,
    Color: string,
    Path: string
}

interface iCurve {
    ID: number,
    Name: string,
    Visible: boolean,
    Color: string,
    XHigh: number,
    XLow: number,
    YLow: number,
    YHigh: number,
    PerUnitMagnitude: number,
    DurationSeconds: number,
    LoadOrder: number
}


const MagDurChart = (props: { Width: number, Height: number, EventID: number, SearchText: string, SearchBarProps: EventSearchNavbarProps, OnSelect: (evt: any, point: OpenXDA.Event) => void }) => {

    const margin = { top: 15, right: 20, bottom: 60, left: 40 };
    const svgWidth = props.Width - margin.left - margin.right;
    const svgHeight = props.Height - margin.top - margin.bottom;
    const chart = React.useRef(null);
    const [magDurCurveData, setMagDurCurveData] = React.useState<iCurve[]>([]);
    const [curve, setCurve] = React.useState<'ITIC' | 'SEMI' | 'I & II' | 'III' | 'NERC'>('ITIC');
    const dispatch = useDispatch();
    const status = useSelector(SelectEventSearchsStatus);
    const points: OpenXDA.Event[] = useSelector((state: any) => SelectEventSearchBySearchText(state, props.SearchText));

    React.useEffect(() => {
        if (status != 'unitiated' && status != 'changed') return;
        dispatch(FetchEventSearches(props.SearchBarProps));

        return function () {
        }
    }, [status]);


    React.useEffect(() => {
        Promise.all([GetMagDurCurves()]).then(data => {
            setMagDurCurveData(data[0]);
            Initialize(data[0])
        });

    }, []);

    React.useEffect(() => {
        Initialize(magDurCurveData);
    }, [curve, points])

    function GetMagDurCurves(): Promise<iCurve[]> {
        return new Promise((res, rej) => $.ajax({
            type: "GET",
            url: `${homePath}api/SEBrowser/MagDurCurves`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        }).done(d => res(d)));
    }

    function resetZoom(evt: any) {
        Initialize(magDurCurveData);
    }

    function Initialize(curves: iCurve[]) {
        const margin = { top: 15, right: 20, bottom: 60, left: 40 };
        const svgWidth = props.Width - margin.left - margin.right;
        const svgHeight = props.Height - margin.top - margin.bottom;
        let data = _.groupBy(curves.filter(d => d.Name.includes(curve)), 'Name');

        const XHigh = [...new Set(data[Object.keys(data)[0]]?.map(d => d.XHigh) ?? [100])][0];
        const XLow = [...new Set(data[Object.keys(data)[0]]?.map(d => d.XLow) ?? [0.000001])][0];
        const YHigh = [...new Set(data[Object.keys(data)[0]]?.map(d => d.YHigh) ?? [5])][0];
        const YLow = [...new Set(data[Object.keys(data)[0]]?.map(d => d.YLow) ?? [0])][0];

        d3.select(chart.current).selectAll('svg').remove();
        const svg = d3.select(chart.current)
            .append('svg').attr('width', props.Width).attr('height', props.Height);

        let clip = svg.append("defs").append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("width", svgWidth)
            .attr("height", svgHeight - margin.top)
            .attr("x", margin.left)
            .attr("y", margin.top);

        let scatter = svg.append('g')
            .attr("clip-path", "url(#clip)")
            .attr('id', 'chartdata');

        let y = d3.scaleLinear().rangeRound([svgHeight, margin.top]).domain([YLow, YHigh]);
        let x = d3.scaleLog().rangeRound([margin.left, svgWidth + margin.left]).domain([XLow, XHigh]);

        svg.selectAll("g.xaxis").remove();
        const xg = svg.append("g")
            .classed("xaxis", true)
            .attr("transform", "translate(0," + (props.Height - margin.bottom - margin.top) + ")");

        const xAxis = xg.call(d3.axisBottom(x).tickSize(-(svgHeight - margin.top)).tickFormat((value) => {
            if (Math.log10(value as number) === Math.floor(Math.log10(value as number)))
                return d3.format(".0s")(value)
            else return '';
        }))
        xg.append('text').text('Duration(s)').attr('x', (svgWidth - margin.right) / 2 + margin.left).attr('y', margin.bottom / 2).attr('fill', 'black').style('font-size', 'small');

        svg.selectAll("g.yaxis").remove();
        const yg = svg.append("g")
            .classed("yaxis", true)
            .attr("transform", `translate(${margin.left},0)`)

        const yAxis = yg.call(d3.axisLeft(y).ticks(8).tickSize(-(svgWidth)));
        yg.append('text').text('Per Unit Voltage').attr('transform', 'rotate(-90 0,0)').attr('x', -(svgHeight - margin.bottom) / 2 + margin.top).attr('y', -margin.left * 3 / 4).attr('fill', 'black').style('font-size', 'small');

        svg.selectAll('line').style("stroke", "lightgrey").style("stroke-opacity", 0.8).style("shape-rendering", "crispEdges").style("z-index", "0")



        const lineFunc = d3.line<iCurve>().x(xd => x(xd.DurationSeconds)).y(yd => y(yd.PerUnitMagnitude));
        const lines = scatter.selectAll('g.lines')
            .data([data])
            .enter()
            .append('g')
            .attr('class', 'lines')
            .selectAll('path')
            .data(d => Object.keys(d) as string[])
            .enter()
            .append('path')
            .attr('stroke', 'red')
            .attr('fill', 'none')
            .attr('d', (d) => lineFunc(data[d]));

        const circles = scatter.selectAll('g.points')
            .data([points])
            .enter()
            .append('g').attr('class', 'points')
            .selectAll('circle')
            .data(d => d)
            .enter()
            .append('circle')
            .attr('r', 5)
            .style('cursor', 'pointer')
            .attr('fill', 'blue')
            .attr('cx', d => x(d.DurationSeconds))
            .attr('cy', d => y(d.PerUnitMagnitude))
            .on('click', d => props.OnSelect(d3.event, d));

        let zoom = d3.zoom().on('zoom', function () {
            let transform = d3.event.transform;
            let updatedX = transform.rescaleX(x);
            let updatedY = transform.rescaleY(y);
            xAxis.call(d3.axisBottom(updatedX).tickSize(-(svgHeight - margin.top)).tickFormat((value) => {
                if (Math.log10(value as number) === Math.floor(Math.log10(value as number)))
                    return d3.format(".0s")(value as number)
                else return '';
            }));
            yAxis.call(d3.axisLeft(updatedY).tickSize(-(svgWidth)));
            svg.selectAll('line').style("stroke", "lightgrey").style("stroke-opacity", 0.8).style("shape-rendering", "crispEdges").style("z-index", "0")

            circles.attr('cx', d => updatedX(d.DurationSeconds)).attr('cy', d => updatedY(d.PerUnitMagnitude));
            const upLineFunc = d3.line<iCurve>().x(xd => updatedX(xd.DurationSeconds)).y(yd => updatedY(yd.PerUnitMagnitude))
            lines.attr('d', d => upLineFunc(data[d]));
        })

        svg.call(zoom)

        svg.append('use').attr('xlink:href', '#chartdata');
    }

    return (
        <div ref={chart} style={{ height: props.Height, width: props.Width }}>
            <div style={{ textAlign: 'center' }}>
                <div className="form-check form-check-inline">
                    <input className="form-check-input" type="radio" value={curve} checked={curve === 'ITIC'} onChange={(evt) => setCurve('ITIC')} />
                    <label className="form-check-label">ITIC</label>
                </div>
                <div className="form-check form-check-inline">
                    <input className="form-check-input" type="radio" value={curve} checked={curve === 'SEMI'} onChange={(evt) => setCurve('SEMI')} />
                    <label className="form-check-label" >SEMI F47</label>
                </div>
                <div className="form-check form-check-inline">
                    <input className="form-check-input" type="radio" value={curve} checked={curve === 'I & II'} onChange={(evt) => setCurve('I & II')} />
                    <label className="form-check-label">IEEE 1668 Recommended Type I & II</label>
                </div>
                <div className="form-check form-check-inline">
                    <input className="form-check-input" type="radio" value={curve} checked={curve === 'III'} onChange={(evt) => setCurve('III')} />
                    <label className="form-check-label">IEEE 1668 Recommended Type III</label>
                </div>
                <div className="form-check form-check-inline">
                    <input className="form-check-input" type="radio" value={curve} checked={curve === 'NERC'} onChange={(evt) => setCurve('NERC')} />
                    <label className="form-check-label">NERC PRC-024-2</label>
                </div>
            </div>
            <button style={{ position: 'absolute', top: 95, left: svgWidth - margin.right }} onClick={resetZoom}>Reset</button>
        </div>
    )
}

export default MagDurChart;