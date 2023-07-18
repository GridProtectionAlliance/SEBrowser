//******************************************************************************************************
//  TVAESRIMap.tsx - Gbtc
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
//  02/27/2020 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import React from 'react';
import { scaleLinear, line, extent, select, axisLeft } from 'd3';
import moment from 'moment';
import { SEBrowser } from '../../../../global';
import Table from '@gpa-gemstone/react-table';

const TVALightningChart: React.FC<SEBrowser.IWidget<unknown>> = (props) => {
    const svgWidth = (window.innerWidth - 300) / 2 - 17 - 40;
    const svgHeight = 200;
    const margin = { top: 0, right: 0, bottom: 20, left: 40 };
    //const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    const [paths, setPaths] = React.useState<Array<JSX.Element>>([]);
    const [hidden, setHidden] = React.useState<boolean>(true);
    const [tooltipX, setTooltipX] = React.useState<number>(svgWidth + 2);
    const [tableData, setTableData] = React.useState<{ Day: { Data: Array<number> }}>({ Day: { Data: [] } });
    const [xcoord, setXcoord] = React.useState<number>(null);
    const [xaxis, setXaxis] = React.useState<Array<number>>([]);
    React.useEffect(() => {
        setHidden(true);
        setPaths([]);
        return GetData();
    }, [props.eventID]);

    function GetData() {
        const handle = $.ajax({
            type: "GET",
            url: `${homePath}api/Lightning/${props.eventID}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        }).done(data => MakeDict(data));


        return function () {
            if (handle.abort != undefined) handle.abort();
        }
    }

    function MakeDict(data) {
        const dict: { Day: { Data: Array<number> } } = { Day: { Data: [] } };

        data.forEach((d) => {
            Object.keys(d).forEach((key) => {
                if (Object.prototype.hasOwnProperty.call(dict, key))
                    dict[key].Data.push((key == 'Day' ? moment(d[key]).unix() : d[key]))
                else
                    dict[key] = { Data: [(key == 'Day' ? moment(d[key]).unix() : d[key])], Show: true }
            });
        })
        setTableData(dict)

        DrawChart(dict);
    }

    function DrawChart(dict: { Day: { Data: Array<number> } }) {
        const x = scaleLinear().rangeRound([0, props.width]);
        const y = scaleLinear().rangeRound([height, 0]);

        setHidden(Object.keys(dict).length == 0);

        let yextent = null;
        Object.keys(dict).forEach((key) => {
            if (key == 'Day' || !dict[key].Show) return;

            const newExtent = extent(dict[key].Data);

            if (yextent == null) {
                yextent = newExtent;
                return;
            }

            if (yextent[0] > newExtent[0]) yextent[0] = newExtent[0]
            if (yextent[1] < newExtent[1]) yextent[1] = newExtent[1]
        });

        yextent = [0.90 * yextent[0], 1.10 * yextent[1]]
        const xextent = extent(dict.Day.Data);

        y.domain(yextent);
        x.domain(xextent);

        const xax = [xextent[0]];
        let pushVal = xextent[0];
        for (let i = 0; i < 9; i++) {
            pushVal += 86400 * 3
            xax.push(pushVal);
        }

        setXaxis(xax);

        const linefunc = line().x(d => x(d[0])).y(d => y(d[1]));

        const newPaths = [];
        $.each(Object.keys(dict).filter(x => x != 'Day'), (index, key) => {
            if (!dict[key].Show) return;
            const d = dict[key].Data.map((a, i) => [dict["Day"].Data[i], a]);
            newPaths.push(<path key={key} fill='none' strokeLinejoin='round' strokeWidth='1.5' stroke={getColor(key)} d={linefunc(d)} />);
        });
        setPaths(newPaths);

        //select('#xaxis').call(axisBottom(x).ticks(15).tickFormat((domainValue: number, index: number) => {
        //    return moment.unix(domainValue).format('MM/DD');
        //})).call(g => g.select(".domain").remove());
        select('#yaxis').call(axisLeft(y).ticks(5) as any).call(g => g.select(".domain").remove());

    }

    function getColor(label) {
        if (label.indexOf('Vaisala - Stroke') >= 0) return '#A30000';
        if (label.indexOf('Vaisala - Flash') >= 0) return '#0029A3';
        if (label.indexOf('Vaisala Reprocess - Stroke') >= 0) return '#007A29';
        if (label.indexOf('Vaisala Reprocess - Flash') >= 0) return '#8B008B';
        if (label.indexOf('Weatherbug') >= 0) return '#FF0000';

        else {
            const ranNumOne = Math.floor(Math.random() * 256).toString(16);
            const ranNumTwo = Math.floor(Math.random() * 256).toString(16);
            const ranNumThree = Math.floor(Math.random() * 256).toString(16);

            return `#${(ranNumOne.length > 1 ? ranNumOne : "0" + ranNumOne)}${(ranNumTwo.length > 1 ? ranNumTwo : "0" + ranNumTwo)}${(ranNumThree.length > 1 ? ranNumThree : "0" + ranNumThree)}`;
        }
    }

    function handleMouseOver(evt: React.MouseEvent<SVGSVGElement, MouseEvent>) {
        if (evt.nativeEvent.offsetX < margin.left || evt.nativeEvent.offsetX >= svgWidth - 1 || evt.nativeEvent.offsetY > height || evt.nativeEvent.offsetY < margin.top) {
            setTooltipX(svgWidth + 1)
            setXcoord(null);
        }
        else {
            const x = scaleLinear().rangeRound([0, props.width]).domain(extent(tableData.Day.Data));

            const newIndex = tableData.Day.Data.map((a, i) => [Math.abs(a - x.invert(evt.nativeEvent.offsetX)), i]).sort(function (a, b) {
                return a[0] - b[0];
            })[0][1];

            setTooltipX(x(tableData.Day.Data[newIndex]) + margin.left);
            setXcoord(tableData.Day.Data[newIndex]);
        }
    }

    function getValue(key: string) {
        if (xcoord == null) return null;

        const arr = tableData.Day.Data.map((x, i) => [x, tableData[key].Data[i]]).filter(x => x[0] >= xcoord);

        if (arr == undefined || arr.length == 0) return null;
        return arr[0][1];
    }

    return (
        <div className="card" hidden={hidden}>
            <div className="card-header">30 Day Lightning History:</div>
            <div className="card-body">
                <svg width={svgWidth} height={svgHeight} onMouseOver={handleMouseOver} onMouseMove={handleMouseOver} onMouseOut={() => setTooltipX(svgWidth + 1)}>
                    <path stroke='red' d={`M0,0V0,${height}`} transform={`translate(${tooltipX},0)`}></path>

                    <g id='yaxis' transform={`translate(${margin.left},0)`}>
                        <path stroke='#000' d={`M0,0V0,${height}`}></path>
                    </g>
                    <g transform={`translate(${margin.left},0)`}>
                        {paths}
                    </g>
                    <g id='xaxis' transform={`translate(${margin.left},${height})`}>
                        <path stroke='#000' d={`M 0 0 h 0 ${props.width} v -${height} 0 h 0 -${props.width}`} fill='none'></path>
                        {
                            xaxis.map((a, i) => {
                                const x = scaleLinear().rangeRound([0, props.width]).domain(extent(tableData.Day.Data));

                                return (
                                    <g key={i} className='tick' opacity='1' transform={`translate(${x(a)},0)`}>
                                        <line stroke="#000" y2="6"></line>
                                        <text fill="#000" y="9" dy="0.71em" fontFamily='sans-serif' fontSize='10'>{moment.unix(a).format('MM/DD')}</text>
                                    </g>
                            )})
                        }
                    </g>

                </svg>
                <Table
                    cols={[
                        { key: 'service', label: 'Service', field: 'service' },
                        { key: 'date', label: moment.unix(xcoord).format('MM/DD'), field: 'date' },
                        { key: 'totals', label: 'Totals', field: 'totals' }
                    ]}
                    data={Object.keys(tableData).filter(key => key != 'Day').map((key, index) => {
                        return {
                            service: <><span onClick={(evt) => {
                                tableData[key].Show = !tableData[key].Show
                                setTableData(tableData);
                                DrawChart(tableData);
                            }} style={{ display: 'inline-block', marginRight: 10, height: 20, width: 20, backgroundColor: (tableData[key].Show ? getColor(key) : 'darkgray') }}></span>{key}</>,
                            date: getValue(key),
                            totals: tableData[key].Data.reduce((a, b) => a + b)
                        };
                    })}
                    onClick={() => { }}
                    onSort={() => { }}
                    sortKey={''}
                    ascending={true}
                    tableClass="table"
                    theadStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%', height: 50 }}
                    tbodyStyle={{ display: 'block', overflowY: 'scroll', maxHeight: props.maxHeight ?? 500, width: '100%' }}
                    rowStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                />
            </div>
        </div>
    );
}

export default TVALightningChart;