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
import { select, scaleLinear, scaleLog, axisBottom, format as d3format, line, zoom as d3zoom, axisLeft} from 'd3';
import * as _ from 'lodash';
import { SelectEventSearchsStatus, FetchEventSearches, SelectEventSearchs } from './EventSearchSlice';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { OpenXDA, SEBrowser } from '../../global';
import { MagDurCurveSlice } from '../../Store';

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

interface IProps {
    Width: number,
    Height: number,
    EventID: number,
    OnSelect: (evt: any, point: any) => void
}
const MagDurChart = (props: IProps) => {

    const margin = { top: 15, right: 20, bottom: 60, left: 40 };
    const svgWidth = props.Width - margin.left - margin.right;
    const svgHeight = props.Height - margin.top - margin.bottom;
    const chart = React.useRef(null);

    const magDurStatus = useAppSelector(MagDurCurveSlice.Status);
    const magDurCurves = useAppSelector(MagDurCurveSlice.Data) as SEBrowser.MagDurCurve[];

    const [currentCurve, setCurrentCurve] = React.useState<SEBrowser.MagDurCurve>(null)

    const dispatch = useAppDispatch();
    const status = useAppSelector(SelectEventSearchsStatus);
    const points: any[] = useAppSelector(SelectEventSearchs);

    React.useEffect(() => {
        if (status != 'unitiated' && status != 'changed') return;
        dispatch(FetchEventSearches());

        return function () {
        }
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
        Initialize();
    }, [currentCurve, points])

    function resetZoom(evt: any) {
        Initialize();
    }

    function Initialize() {

        if (currentCurve == null)
            return; 
        const margin = { top: 15, right: 20, bottom: 60, left: 40 };
        const svgWidth = props.Width - margin.left - margin.right;
        const svgHeight = props.Height - margin.top - margin.bottom;
       
     
        select(chart.current).selectAll('svg').remove();
        const svg = select(chart.current)
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

        let y = scaleLinear().rangeRound([svgHeight, margin.top]).domain([currentCurve?.YLow ?? 0, currentCurve?.YHigh ?? 5]);
        let x = scaleLog().rangeRound([margin.left, svgWidth + margin.left]).domain([currentCurve?.XLow ?? 0.000001, currentCurve?.XHigh ?? 100]);

        svg.selectAll("g.xaxis").remove();
        const xg = svg.append("g")
            .classed("xaxis", true)
            .attr("transform", "translate(0," + (props.Height - margin.bottom - margin.top) + ")");

        const xAxis = xg.call(axisBottom(x).tickSize(-(svgHeight - margin.top)).tickFormat((value) => {
            if (Math.log10(value as number) === Math.floor(Math.log10(value as number)))
                return d3format(".0s")(value)
            else return '';
        }))
        xg.append('text').text('Duration(s)').attr('x', (svgWidth - margin.right) / 2 + margin.left).attr('y', margin.bottom / 2).attr('fill', 'black').style('font-size', 'small');

        svg.selectAll("g.yaxis").remove();
        const yg = svg.append("g")
            .classed("yaxis", true)
            .attr("transform", `translate(${margin.left},0)`)

        let ticks = 10;
        let format = '.1f';
        if (currentCurve.Name === 'NERC PRC-024-2') {
            ticks = 20
            format = '.2f';
        }

        const yAxis = yg.call(axisLeft(y).ticks(ticks, format).tickSize(-(svgWidth)));

        yg.append('text').text('Per Unit Voltage').attr('transform', 'rotate(-90 0,0)').attr('x', -(svgHeight - margin.bottom) / 2 + margin.top).attr('y', -margin.left * 3 / 4).attr('fill', 'black').style('font-size', 'small');

        svg.selectAll('line').style("stroke", "lightgrey").style("stroke-opacity", 0.8).style("shape-rendering", "crispEdges").style("z-index", "0")

        const data = [];

        if (currentCurve.LowerCurve == null && currentCurve.UpperCurve == null) {
            let pt = currentCurve.Area.split(',');
            let cu = pt.map(point => { let s = point.trim().split(" "); return [parseFloat(s[0]), parseFloat(s[1])];})
            data.push(cu);

        }

        const lineFunc = line<[number,number]>().x(xd => x(xd[0])).y(yd => y(yd[1]));
        const lines = scatter.selectAll('g.lines')
            .data(data)
            .enter()
            .append('g')
            .attr('class', 'lines')
            .append('path')
            .attr('stroke', 'red')
            .attr('fill', 'none')
            .attr('d', (d) => lineFunc(d));

        // Define the div for the tooltip
        select(chart.current).selectAll('.tooltip').remove()
        var tooltip = select(chart.current).append("div")
            .attr("class", "tooltip")
            .style('background-color', 'darkgray')
            .style("opacity", .9)
            .attr('hidden', 'hidden');

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
            .attr('fill', d=> d.EventID === props.EventID ? 'green': 'blue')
            .attr('cx', d => x(d.MagDurDuration))
            .attr('cy', d => y(d.MagDurMagnitude))
            .on('click', d => {
                tooltip.transition()
                    .duration(500)
                    .attr('hidden', 'hidden');
                props.OnSelect(event, d)
            })
            .on("mouseover", function (event, d) {
                //d3.select(this).attr('stroke', 'black');
                tooltip.transition()
                    .duration(200)               
                    .attr('hidden', null);

                tooltip.style("left", (event.offsetX - 150 ) + "px")
                    .style("top", (event.offsetY - 75) + "px")
                    .html(`
                    <table class=''>
                    <tr><td>Meter</td><td>${d['Meter']}</td></tr>
                    <tr><td>Asset</td><td>${d['Asset']}</td></tr>
                    <tr><td>Start Time</td><td>${d['Time']}</td></tr>
                    <tr><td>Event Type</td><td>${d['Event Type']}</td></tr>
                    <tr><td>Magnitude</td><td>${d['MagDurMagnitude'].toFixed(2)}</td></tr>
                    <tr><td>Duration</td><td>${d['MagDurDuration'].toFixed(2)}</td></tr>
                    </table>   
                `)
                    ;
            })
            .on("mouseout", function (d) {
                //d3.select(this).attr('stroke', null);
                //if (timeout) clearTimeout(timeout);
                //setTimeout(() => {
                    tooltip.transition()
                        .duration(500)
                        .attr('hidden', 'hidden');
                //}, 500);
            })
            ;

        let zoom = d3zoom().on('zoom', function (event: any) {
            let transform = event.transform;
            let updatedX = transform.rescaleX(x);
            let updatedY = transform.rescaleY(y);
            xAxis.call(axisBottom(updatedX).tickSize(-(svgHeight - margin.top)).tickFormat((value) => {
                if (Math.log10(value as number) === Math.floor(Math.log10(value as number)))
                    return d3format(".0s")(value as number)
                else return '';
            }));
            yAxis.call(axisLeft(updatedY).tickSize(-(svgWidth)));
            svg.selectAll('line').style("stroke", "lightgrey").style("stroke-opacity", 0.8).style("shape-rendering", "crispEdges").style("z-index", "0")

            circles.attr('cx', d => updatedX(d.DurationSeconds)).attr('cy', d => updatedY(d.PerUnitMagnitude));
            const upLineFunc = line<[number, number]>().x(xd => updatedX(xd[0])).y(yd => updatedY(yd[1]));
            lines.attr('d', d => upLineFunc(d));
        })

        svg.call(zoom)

        svg.append('use').attr('xlink:href', '#chartdata');
    }

    return (
        <div ref={chart} style={{ height: props.Height, width: props.Width }}>
            <div style={{ textAlign: 'center' }}>
                {currentCurve == null ? null : magDurCurves.map(curve => <div key={curve.ID} className="form-check form-check-inline">
                    <input className="form-check-input" type="radio" value={curve.ID} checked={curve.ID == currentCurve.ID} onChange={(evt) => setCurrentCurve(curve)} />
                    <label className="form-check-label">{curve.Name}</label>
                </div> )}             
            </div>
            <button style={{ position: 'absolute', top: 95, left: svgWidth - margin.right }} onClick={resetZoom}>Reset</button>
        </div>
    )
}

export default MagDurChart;