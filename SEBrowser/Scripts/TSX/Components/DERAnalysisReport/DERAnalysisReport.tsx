//******************************************************************************************************
//  DERAnalysisReport.tsx - Gbtc
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
import Table from '@gpa-gemstone/react-table';

import { OpenXDA } from '@gpa-gemstone/application-typings';
import queryString from 'querystring';
import moment from 'moment';
import { orderBy } from 'lodash';
import { Line, Plot } from '@gpa-gemstone/react-graph';
import { useNavigate, useLocation } from 'react-router-dom';
import { TimeFilter } from '@gpa-gemstone/common-pages'
import { useSelector } from 'react-redux';
import { SelectTimeZone, SelectDateTimeSetting } from '../SettingsSlice';
import { SEBrowser } from 'Scripts/TSX/global';

interface DERAnalyticResult {
    ID: number,
    EventID: number,
    Meter: string,
    Asset: string,
    Channel: string,
    Regulation: string,
    Parameter: string,
    Threshold: number,
    Value: number,
    Time: string,
    DataType: string
}

function DERAnalysisReport() {
    const history = useLocation();
    const navigate = useNavigate();

    const timeZone = useSelector(SelectTimeZone);
    const dateTimeSetting = useSelector(SelectDateTimeSetting);
    const [start, setStart] = React.useState<string>(moment().format(dateTimeSetting.DateTimeFormat));
    const [end, setEnd] = React.useState<string>(moment().format(dateTimeSetting.DateTimeFormat));
    const [regulations, setRegulations] = React.useState<{ Value: number, Text: string, Selected: boolean }[]>([])
    const [stations, setStations] = React.useState<{ Value: number, Text: string, Selected: boolean }[]>([]);
    const [ders, setDERs] = React.useState<{ Value: number, Text: string, Selected: boolean }[]>([]);
    const [data, setData] = React.useState<DERAnalyticResult[]>([]);
    const [ascending, setAscending] = React.useState<boolean>(true);
    const [sortKey, setSortKey] = React.useState<keyof DERAnalyticResult>('Time');
    const [selectedData, setSelectedData] = React.useState<DERAnalyticResult>(null);

    React.useEffect(() => {
        const query = queryString.parse(history.search.replace("?", ""), "&", "=", { decodeURIComponent: queryString.unescape });
        setStart(query['start'] != undefined ? query['start'] as string : moment().format(dateTimeSetting.DateTimeFormat))
        setEnd(query['end'] != undefined ? query['end'] as string : moment().format(dateTimeSetting.DateTimeFormat))
    }, []);


    React.useEffect(() => {
        const queryParam = { start, end };
        const q = queryString.stringify(queryParam, "&", "=", { encodeURIComponent: queryString.escape });
        const handle = setTimeout(() => navigate(history.pathname + '?' + q), 500);
        return (() => { clearTimeout(handle); })
    }, [start, end])

    React.useEffect(() => {
        const handle1 = $.ajax({
            type: "GET",
            url: `${homePath}api/DERReport/Regulation`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: false,
            async: true
        }) as JQuery.jqXHR<string[]>;

        handle1.done(d => setRegulations(d.map((reg, i) => ({ Value: i, Text: reg, Selected: true }))))

        const handle2 = $.ajax({
            type: "GET",
            url: `${homePath}api/DERReport/Substation`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: false,
            async: true
        }) as JQuery.jqXHR<{ LocationID: number, LocationKey: string, Name: string }[]>;

        handle2.done(d => setStations(d.map((reg) => ({ Value: reg.LocationID, Text: reg.Name, Selected: true }))))

        return () => {
            if (handle1.abort != undefined) handle1.abort();
            if (handle2.abort != undefined) handle2.abort();
        };
    }, []);

    React.useEffect(() => {
        const sorted = orderBy(data, [sortKey], [ascending]);
        setData(sorted);
    }, [sortKey, ascending]);

    React.useEffect(() => {
        if (selectedData == null) return;

        ($('#dataModal') as any).modal({ show: true })
    }, [selectedData]);

    React.useEffect(() => {
        const handle1 = $.ajax({
            type: "POST",
            url: `${homePath}api/DERReport/DER`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            data: JSON.stringify({ SubstationIDs: stations.filter(s => s.Selected).map(s => s.Value) }),
            cache: false,
            async: true
        }) as JQuery.jqXHR<OpenXDA.Types.Asset[]>;

        handle1.done(d => setDERs(d.map((reg) => ({ Value: reg.ID, Text: reg.AssetName, Selected: true }))))

        return () => {
            if (handle1.abort != undefined) handle1.abort();

        };
    }, [stations]);


    React.useEffect(() => {
        const handle1 = $.ajax({
            type: "POST",
            url: `${homePath}api/DERReport`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            data: JSON.stringify({
                DERIDs: ders.filter(s => s.Selected).map(s => s.Value),
                StartTime: start,
                EndTime: end,
                Regulations: regulations.filter(s => s.Selected).map(s => s.Text)
            }),
            cache: false,
            async: true
        }) as JQuery.jqXHR<DERAnalyticResult[]>;

        handle1.done(d => setData(d))

        return () => {
            if (handle1.abort != undefined) handle1.abort();

        };
    }, [ders, start, end, regulations]);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <div className="navbar navbar-expand-lg navbar-light bg-light">

                <div className="collapse navbar-collapse" id="navbarSupportedContent" style={{ width: '100%' }}>
                    <ul className="navbar-nav mr-auto" style={{ width: '100%' }}>
                        <li className="nav-item" style={{ width: '50%', paddingRight: 10 }}>
                            <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                                <legend className="w-auto" style={{ fontSize: 'large' }}>DER:</legend>
                                <form>
                                    <div className="form-group" style={{ height: 60, width: '100%' }}>
                                        <MultiCheckBoxSelect Label={'Substation:'} Options={stations} ItemTooltip={'dark'} OnChange={(evt, options) => {
                                            const records = [...stations]
                                            for (const option of options) {
                                                const index = records.findIndex(r => r.Value == option.Value)
                                                records[index].Selected = !records[index].Selected
                                            }
                                            setStations(records)
                                        }} />

                                    </div>
                                    <div className="form-group" style={{ height: 60, width: '100%' }}>
                                        <MultiCheckBoxSelect Label={'DER:'} Options={ders} ItemTooltip={'dark'} OnChange={(evt, options) => {
                                            const records = [...ders]
                                            for (const option of options) {
                                                const index = records.findIndex(r => r.Value == option.Value)
                                                records[index].Selected = !records[index].Selected
                                            }
                                            setDERs(records)
                                        }} />
                                    </div>
                                    <div className="form-group" style={{ height: 60, width: '100%' }}>
                                        <MultiCheckBoxSelect Label={'Regulations:'} Options={regulations} ItemTooltip={'dark'} OnChange={(evt, options) => {
                                            const records = [...regulations]
                                            for (const option of options) {
                                                const index = records.findIndex(r => r.Value == option.Value)
                                                records[index].Selected = !records[index].Selected
                                            }
                                            setRegulations(records)
                                        }} />
                                    </div>
                                </form>
                            </fieldset>
                        </li>

                        <li className="nav-item" style={{ width: '50%', paddingRight: 10 }}>
                            <TimeFilter filter={{ start: start, end: end }}
                                setFilter={(start: string, end: string) => {
                                    setStart(start);
                                    setEnd(end);
                                }}
                                showQuickSelect={false} timeZone={timeZone}
                                dateTimeSetting={dateTimeSetting.Mode} isHorizontal={false} />
                            <button style={{ position: 'absolute', top: 30, right: 30 }} data-toggle="modal" data-target="#epriModal">⚠</button>
                        </li>


                    </ul>
                </div>
            </div>
            <div style={{ width: '100%', height: 'calc( 100% - 250px)' }}>
                <div style={{ width: '100%', height: '100%', maxHeight: '100%', position: 'relative', float: 'right', overflowY: 'hidden' }}>
                    <Table<DERAnalyticResult>
                        cols={[
                            { key: 'Time', label: 'Time', field: 'Time', content: (item) => moment(item.Time).format(dateTimeSetting.DateTimeFormat) },
                            { key: 'Meter', label: 'Meter', field: 'Meter' },
                            { key: 'Asset', label: 'Asset', field: 'Asset' },
                            { key: 'Channel', label: 'Channel', field: 'Channel' },
                            { key: 'Regulation', label: 'Regulation', field: 'Regulation' },
                            { key: 'Parameter', label: 'Parameter', field: 'Parameter' },
                            { key: 'Threshold', label: 'Threshold', field: 'Threshold' },
                            { key: 'Value', label: 'Value', field: 'Value', content: (item) => item.Value.toFixed(2) },
                            { key: 'Scroll', label: '', headerStyle: { width: 19, padding: 0 }, rowStyle: { width: 0, padding: 0 } },

                        ]}
                        tableClass='table table-hover'
                        ascending={ascending}
                        sortKey={sortKey}
                        onSort={(data) => {
                            if (data.colField == sortKey)
                                setAscending(!ascending);
                            else
                                setSortKey(data.colField);
                        }}
                        data={data}
                        onClick={(d) => {
                            setSelectedData(d.row);
                        }}
                        theadStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                        tbodyStyle={{ display: 'block', overflowY: 'scroll', maxHeight: window.innerHeight - 343, width: '100%' }}
                        rowStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                    />
                </div>

            </div>

            <div className="modal" id="dataModal">
                <div className="modal-dialog modal-lg" style={{ maxWidth: '75%' }}>
                    <div className="modal-content">

                        <div className="modal-header">
                            <h4 className="modal-title">Time: {selectedData?.Time ?? ''}, Meter: {selectedData?.Meter ?? ''}, Asset: {selectedData?.Asset ?? ''}, Channel: {selectedData?.Channel ?? ''}</h4>
                            <button type="button" className="close" data-dismiss="modal">&times;</button>
                        </div>
                        <div className="modal-body">
                            <div><h6>Regulation: {selectedData?.Regulation ?? ''}</h6></div>
                            <div><h6>Parameter: {selectedData?.Parameter ?? ''}</h6></div>
                            <Graph {...selectedData} />
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-danger" data-dismiss="modal">Close</button>
                        </div>

                    </div>
                </div>
            </div>

            <div className="modal" id="epriModal">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">

                        <div className="modal-header">
                            <button type="button" className="close" data-dismiss="modal">&times;</button>
                        </div>
                        <div className="modal-body">
                            <img src={`${homePath}Images/EPRILogo.jpeg`} />
                            <div>Software Title DER Operation Version #0</div>
                            <div>Electric Power Research Institute (EPRI)</div>
                            <div>3420 Hillview Ave.</div>
                            <div>Palo Alto, CA 94304</div>
                            <br />
                            <div>Copyright © 2021 Electric Power Research Institute, Inc. All rights reserved.</div>
                            <br />
                            <div>As a user of this EPRI preproduction software, you accept and acknowledge that:</div>
                            <ul>
                                <li>This software is a preproduction version which may have problems that could potentially harm your system</li>
                                <li>To satisfy the terms and conditions of the Master License Agreement or Preproduction License Agreement between EPRI and your company, you understand what to do with this preproduction product after the preproduction review period has expired</li>
                                <li>Reproduction or distribution of this preproduction software is in violation of the terms and conditions of the Master License Agreement or Preproduction License Agreement currently in place between EPRI and your company</li>
                                <li>Your company's funding will determine if you have the rights to the final production release of this product</li>
                                <li>EPRI will evaluate all tester suggestions and recommendations, but does not guarantee they will be incorporated into the final production product</li>
                                <li>As a preproduction tester, you agree to provide feedback as a condition of obtaining the preproduction software</li>
                            </ul>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-danger" data-dismiss="modal">Close</button>
                        </div>

                    </div>
                </div>
            </div>

        </div>

    );
}

const Graph = (props: DERAnalyticResult) => {
    const [data, setData] = React.useState<[number, number][]>([]);

    React.useEffect(() => {
        if (props.ID == undefined) return;

        const handle = $.ajax({
            type: "GET",
            url: `${homePath}api/DERReport/Data/${props.ID}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: false,
            async: true
        }) as JQuery.jqXHR<[number, number][]>;

        handle.done(d => {
            setData(d);
        })

        return () => {
            if (handle.abort != undefined) handle.abort();

        };

    }, [props.ID]);

    function GetAxis(regulation: string) {
        if (regulation.startsWith("7.1"))
            return "Idc %"
        else if (regulation.startsWith("7.2.2"))
            return "Vrms %"
        else if (regulation.startsWith("7.2.3"))
            return "PST or PLT"
        else if (regulation.startsWith("7.3"))
            return "TRD"
        else if (regulation.startsWith("7.4.1"))
            return "1 Cycle RMS Voltage (pu)"
        else if (regulation.startsWith("7.4.2"))
            return "Instantaneous VPk(pu)"

    }
    if (data.length == 0)
        return null;
    else
        return (
            <Plot
                height={500}
                width={innerWidth * 0.75 - 32}
                showBorder={false}
                defaultTdomain={[data[0][0], data[data.length - 1][0]]}
                legend={'bottom'}
                Tlabel={'Time'}
                Ylabel={GetAxis(props.Regulation)}
                showMouse={true}
                useMetricFactors={false}
                onDataInspect={() => ''}>
                <Line highlightHover={false} showPoints={false} color={'red'} data={[[data[0][0], props.Threshold], [data[data.length - 1][0], props.Threshold]]} legend={'Threshold'} lineStyle='-' />
                <Line highlightHover={true} showPoints={false} color={'darkblue'} data={data} legend={'data'} lineStyle='-' />
            </Plot>
        )

}

export default DERAnalysisReport;