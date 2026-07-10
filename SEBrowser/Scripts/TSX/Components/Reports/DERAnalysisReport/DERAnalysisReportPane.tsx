//******************************************************************************************************
//  DERAnalysisReportPane.tsx - Gbtc
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
import { Table, Column } from '@gpa-gemstone/react-table';
import moment from 'moment';
import { orderBy } from 'lodash';
import { Line, Plot } from '@gpa-gemstone/react-graph';
import { Modal } from '@gpa-gemstone/react-interactive';
import { findAppropriateUnit, getMoment, getStartEndTime } from '../../EventSearch/TimeWindowUtils';
import { ISelectableOption } from './DERAnalysisReportNavBar';

const momentDateFormat = "MM/DD/YYYY";
const momentTimeFormat = "HH:mm:ss.SSS";

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

export interface DERAnalysisReportPaneProps {
    date: string,
    time: string,
    windowSize: number,
    timeWindowUnits: number,
    regulations: ISelectableOption[],
    ders: ISelectableOption[]
}

const DERAnalysisReportPane = (props: DERAnalysisReportPaneProps) => {
    const [data, setData] = React.useState<DERAnalyticResult[]>([]);
    const [ascending, setAscending] = React.useState<boolean>(true);
    const [sortKey, setSortKey] = React.useState<keyof DERAnalyticResult>('Time');
    const [selectedData, setSelectedData] = React.useState<DERAnalyticResult | null>(null);

    React.useEffect(() => {
        const sorted = orderBy(data, [sortKey], [ascending]);
        setData(sorted);
    }, [sortKey, ascending]);

    React.useEffect(() => {

        const adjustedTime = findAppropriateUnit(getMoment(props.date, props.time),
            getStartEndTime(getMoment(props.date, props.time), props.windowSize, props.timeWindowUnits)[1],
            props.timeWindowUnits);

        const handle1 = $.ajax({
            type: "POST",
            url: `${homePath}api/DERReport`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            data: JSON.stringify({
                DERIDs: props.ders.filter(s => s.Selected).map(s => s.Value),
                Time: props.date + ' ' + props.time,
                Window: adjustedTime[1],
                TimeWindowUnit: adjustedTime[0],
                Regulations: props.regulations.filter(s => s.Selected).map(s => s.Label)
            }),
            cache: false,
            async: true
        }) as JQuery.jqXHR<DERAnalyticResult[]>;

        handle1.done(d => setData(d))

        return () => {
            if (handle1.abort != undefined) handle1.abort();

        };
    }, [props.ders, props.date, props.time, props.windowSize, props.timeWindowUnits, props.regulations]);

    return (
        <>
            <div style={{ width: '100%', height: 'calc( 100% - 250px)' }}>
                <div style={{ width: '100%', height: '100%', maxHeight: '100%', position: 'relative', float: 'right', overflowY: 'hidden' }}>
                    <Table<DERAnalyticResult>
                        TableClass='table table-hover'
                        Ascending={ascending}
                        SortKey={sortKey}
                        OnSort={(data) => {
                            if (data.colField == sortKey)
                                setAscending(!ascending);
                            else
                                setSortKey(data.colField as keyof DERAnalyticResult);
                        }}
                        Data={data}
                        OnClick={(d) => {
                            setSelectedData(d.row);
                        }}
                        TheadStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                        TbodyStyle={{ display: 'block', overflowY: 'scroll', maxHeight: window.innerHeight - 343, width: '100%' }}
                        RowStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                        KeySelector={item => item.ID}
                    >
                        <Column<DERAnalyticResult>
                            Key="Time" Field="Time"
                            Content={row => moment(row.item.Time).format(momentDateFormat + ' ' + momentTimeFormat) }
                        >Time</Column>
                        <Column<DERAnalyticResult>
                            Key="Meter" Field="Meter"
                        >Meter</Column>
                        <Column<DERAnalyticResult>
                            Key="Asset" Field="Asset"
                        >Asset</Column>
                        <Column<DERAnalyticResult>
                            Key="Channel" Field="Channel"
                        >Channel</Column>
                        <Column<DERAnalyticResult>
                            Key="Regulation" Field="Regulation"
                        >Regulation</Column>
                        <Column<DERAnalyticResult>
                            Key="Parameter" Field="Parameter"
                        >Parameter</Column>
                        <Column<DERAnalyticResult>
                            Key="Threshold" Field="Threshold"
                        >Threshold</Column>
                        <Column<DERAnalyticResult>
                            Key="Value" Field="Value"
                            Content={row => row.item.Value.toFixed(2)}
                        >Value</Column>
                    </Table>
                </div>
            </div>

            <Modal
                Show={selectedData != null}
                Title={`Time: ${selectedData?.Time ?? ''}, Meter: ${selectedData?.Meter ?? ''}, Asset: ${selectedData?.Asset ?? ''}, Channel: ${selectedData?.Channel ?? ''}`}
                ShowX={true}
                ShowCancel={false}
                Size={'xlg'}
                ConfirmText={'Close'}
                CallBack={() => setSelectedData(null)}
            >
                <div><h6>Regulation: {selectedData?.Regulation ?? ''}</h6></div>
                <div><h6>Parameter: {selectedData?.Parameter ?? ''}</h6></div>
                <Graph {...selectedData} />
            </Modal>

            <div className="modal" id="epriModal">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">

                        <div className="modal-header">
                            <button type="button" className="close" data-dismiss="modal">&times;</button>
                        </div>
                        <div className="modal-body">
                            <img src={`${homePath}Images/EPRILogo.jpeg` }/>
                            <div>Software Title DER Operation Version #0</div>
                            <div>Electric Power Research Institute (EPRI)</div>
                            <div>3420 Hillview Ave.</div>
                            <div>Palo Alto, CA 94304</div>
                            <br/>
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
        </>
    );
}

const Graph = (props: DERAnalyticResult) => {
    const [data, setData] = React.useState<[number,number][]>([]);

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

export default DERAnalysisReportPane;