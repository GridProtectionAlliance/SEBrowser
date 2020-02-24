//******************************************************************************************************
//  EventSearchPreviewD3Chart.tsx - Gbtc
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
//  02/20/2020 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import React from 'react';
import {  scaleLinear,line, extent} from 'd3';

const EventSearchPreviewD3Chart = (props: { EventID: number, MeasurementType: 'Current' | 'Voltage' | 'TripCoilCurrent', DataType: 'Time' | 'Statistic' }) => {
    let svgWidth = (window.innerWidth - 300) / 2 - 17 - 40;
    let svgHeight = 200;
    let margin = { top: 20, right: 20, bottom: 20, left: 50 };
    let width = svgWidth - margin.left - margin.right;
    let height = svgHeight - margin.top - margin.bottom;
    const [paths, setPaths] = React.useState <Array<JSX.Element>>([]);
    const [hidden, setHidden] = React.useState<boolean>(true);

    React.useEffect(() => {
        setHidden(true);
        setPaths([]);
        return GetData();
    }, [props.EventID]);

    function GetData() {
        let handle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenXDA/GetData?eventId=${props.EventID}` +
                `&pixels=${svgWidth}` +
                `&type=${props.MeasurementType}` +
                `&dataType=${props.DataType}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        }).done(data => DrawChart(data));


        return function () {
            if (handle.abort != undefined) handle.abort();
        }
    }

    
    function DrawChart(data) {
        setHidden(Object.keys(data).length == 0);

        let x = scaleLinear().rangeRound([0, svgWidth]);
        let y = scaleLinear().rangeRound([svgHeight, 0]);

        let yextent = [0,0];
        let xextent = [9007199254740991, -9007199254740990];
        Object.keys(data).forEach((key, index, keys) => {
            let newyexent = extent(data[key], d => d[1]);
            let newxexent = extent(data[key], d => d[0]);

            if (parseFloat(newyexent[0].toString()) < yextent[0]) yextent[0] = parseFloat(newyexent[0].toString())
            if (parseFloat(newyexent[1].toString()) > yextent[1]) yextent[1] = parseFloat(newyexent[1].toString())
            if (parseFloat(newxexent[0].toString()) < xextent[0]) xextent[0] = parseFloat(newxexent[0].toString())
            if (parseFloat(newxexent[1].toString()) > xextent[1]) xextent[1] = parseFloat(newxexent[1].toString())
        });

        yextent = [1.20 * yextent[0], 1.20 * yextent[1]]
        y.domain(yextent);
        x.domain(xextent);

        let linefunc = line<[number, number]>().x(d => x(d[0])).y(d => y(d[1]));

        let newPaths = [];
        $.each(Object.keys(data), (index, key) => {
            newPaths.push(<path key={key} fill='none' strokeLinejoin='round' strokeWidth='1.5' stroke={getColor(key)} d={linefunc(data[key])} />);
        });
        setPaths(newPaths);
    }

    function getColor(label) {
        if (label.indexOf('VA') >= 0) return '#A30000';
        if (label.indexOf('VB') >= 0) return '#0029A3';
        if (label.indexOf('VC') >= 0) return '#007A29';
        if (label.indexOf('VN') >= 0) return '#c3c3c3';
        if (label.indexOf('IA') >= 0) return '#FF0000';
        if (label.indexOf('IB') >= 0) return '#0066CC';
        if (label.indexOf('IC') >= 0) return '#33CC33';
        if (label.indexOf('IR') >= 0) return '#c3c3c3';

        else {
            var ranNumOne = Math.floor(Math.random() * 256).toString(16);
            var ranNumTwo = Math.floor(Math.random() * 256).toString(16);
            var ranNumThree = Math.floor(Math.random() * 256).toString(16);

            return `#${(ranNumOne.length > 1 ? ranNumOne : "0" + ranNumOne)}${(ranNumTwo.length > 1 ? ranNumTwo : "0" + ranNumTwo)}${(ranNumThree.length > 1 ? ranNumThree : "0" + ranNumThree)}`;
        }
    }

    
    return (
        <div style={{ height: svgHeight, width: width /*, margin: '0x', padding: '0px'*/ }} hidden={hidden}>
            <svg width={svgWidth} height={svgHeight} style={{ border: '2px solid lightgray'/*, position: "absolute", left: 20*/ }}>
                <g>
                    {paths}
                </g>
            </svg>

        </div>
    );
}

export default EventSearchPreviewD3Chart;