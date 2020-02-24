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
import {  scaleLinear,select, extent,axisBottom} from 'd3';

const EventSearchPreviewD3ChartAxis = (props: { EventID: number }) => {
    let svgWidth = (window.innerWidth - 300) / 2 - 17 - 40;
    let svgHeight = 25;
    let margin = { top: 20, right: 20, bottom: 20, left: 50 };
    let width = svgWidth - margin.left - margin.right;
    const [hidden, setHidden] = React.useState<boolean>(true);

    React.useEffect(() => {
        return GetData();
    }, [props.EventID]);

    function GetData() {
        let handle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenXDA/GetData?eventId=${props.EventID}` +
                `&pixels=${svgWidth}` +
                `&type=Voltage` +
                `&dataType=Time`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        }).done(data => DrawChart(data));


        return function () {
            if (handle.abort != undefined) handle.abort();
        }
    }


    function defaultTickFormatter(value, axis) {

        var factor = axis.tickDecimals ? Math.pow(10, axis.tickDecimals) : 1;
        var formatted = "" + Math.round(value * factor) / factor;

        // If tickDecimals was specified, ensure that we have exactly that
        // much precision; otherwise default to the value's own precision.

        if (axis.tickDecimals != null) {
            var decimal = formatted.indexOf(".");
            var precision = decimal == -1 ? 0 : formatted.length - decimal - 1;
            if (precision < axis.tickDecimals) {
                return (precision ? formatted : formatted + ".") + ("" + factor).substr(1, axis.tickDecimals - precision);
            }
        }

        return formatted;
    };
    // round to nearby lower multiple of base
    function floorInBase(n, base) {
        return base * Math.floor(n / base);
    }



    function DrawChart(data) {
        if (Object.keys(data).length == 0) {
            setHidden(true);
            return;
        }
        setHidden(false); 

        let series = data[Object.keys(data)[0]];
        let x = scaleLinear().rangeRound([0, svgWidth]);

        x.domain([series[0][0], series[series.length-1][0]]);

        select('#xaxis').call(axisBottom(x).ticks(5).tickFormat((domainValue: number, index: number) => {
            return moment('1970-01-01T00:00:00').add(domainValue,'milliseconds').format('ss.SSS');
        })).call(g => g.select(".domain").remove());
    }
    
    return (
        <div style={{ height: svgHeight, width: width /*, margin: '0x', padding: '0px'*/ }} hidden={hidden}>
            <svg width={svgWidth} height={svgHeight} >
                <g id='xaxis'></g>
            </svg>

        </div>
    );
}

export default EventSearchPreviewD3ChartAxis;