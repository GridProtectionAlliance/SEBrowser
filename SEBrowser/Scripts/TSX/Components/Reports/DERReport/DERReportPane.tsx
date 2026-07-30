//******************************************************************************************************
//  DERReportPane.tsx - Gbtc
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
import { Modal, Alert } from '@gpa-gemstone/react-interactive';
import { Application } from '@gpa-gemstone/application-typings';
import { ReactIcons } from '@gpa-gemstone/gpa-symbols';
import { findAppropriateUnit, getMoment, getStartEndTime } from '../../EventSearch/TimeWindowUtils';
import { ISelectableOption } from './DERReportNavBar';

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

export interface DERReportPaneProps {
    date: string,
    time: string,
    windowSize: number,
    timeWindowUnits: number,
    regulations: ISelectableOption[],
    ders: ISelectableOption[]
}

const DERReportPane = (props: DERReportPaneProps) => {
    const [data, setData] = React.useState<DERAnalyticResult[]>([]);
    const [ascending, setAscending] = React.useState<boolean>(true);
    const [sortKey, setSortKey] = React.useState<keyof DERAnalyticResult>('Time');
    const [selectedData, setSelectedData] = React.useState<DERAnalyticResult | null>(null);
    const [status, setStatus] = React.useState<Application.Types.Status>('uninitiated');

    const sortedData = React.useMemo(() => orderBy(data, [sortKey], [ascending ? 'asc' : 'desc']), [data, sortKey, ascending]);

    React.useEffect(() => {
        setStatus('loading');
        const handle = getDERAnalyticData(props);
        handle.done(d => {
            if (d != null)
                setData(d);
            setStatus('idle');
        }).fail(() => setStatus('error'));

        return () => {
            if (handle.abort != undefined) handle.abort();
        };
    }, [props.ders, props.date, props.time, props.windowSize, props.timeWindowUnits, props.regulations]);

    return (
        <>
            <div className="d-flex flex-column flex-grow-1" style={{ overflowY: 'auto', minHeight: 0 }}>
                {status === 'error' ?
                    <Alert Class="alert-danger">
                        An error occurred while fetching DER analytic data.
                    </Alert>
                : null}
                <div className="card flex-grow-1">
                    <div className="card-header">DER Analytics:</div>
                    <div className="card-body d-flex flex-column">
                    {status === 'loading' ?
                        <div className="d-flex align-items-center justify-content-center flex-grow-1">
                            <ReactIcons.SpiningIcon Size={'25%'} />
                        </div>
                    : data.length === 0 ?
                        <Alert Class="alert-info" Style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            No DER analytic data.
                        </Alert>
                    :
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
                        Data={sortedData}
                        OnClick={(d) => {
                            setSelectedData(d.row);
                        }}
                        KeySelector={item => item.ID}
                    >
                        <Column<DERAnalyticResult>
                            Key="Time" Field="Time"
                            Content={row => moment(row.item.Time).format(momentDateFormat + ' ' + momentTimeFormat)}
                        >
                            Time
                        </Column>
                        <Column<DERAnalyticResult>
                            Key="Meter" Field="Meter"
                        >
                            Meter
                        </Column>
                        <Column<DERAnalyticResult>
                            Key="Asset" Field="Asset"
                        >
                            Asset
                        </Column>
                        <Column<DERAnalyticResult>
                            Key="Channel" Field="Channel"
                        >
                            Channel
                        </Column>
                        <Column<DERAnalyticResult>
                            Key="Regulation" Field="Regulation"
                        >
                            Regulation
                        </Column>
                        <Column<DERAnalyticResult>
                            Key="Parameter" Field="Parameter"
                        >
                            Parameter
                        </Column>
                        <Column<DERAnalyticResult>
                            Key="Threshold" Field="Threshold"
                        >
                            Threshold
                        </Column>
                        <Column<DERAnalyticResult>
                            Key="Value" Field="Value"
                            Content={row => row.item.Value.toFixed(2)}
                        >
                            Value
                        </Column>
                    </Table>}
                    </div>
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
                {selectedData != null ? <Graph {...selectedData} /> : null}
            </Modal>
        </>
    );
}

const Graph = (props: DERAnalyticResult) => {
    const [data, setData] = React.useState<[number, number][]>([]);

    React.useEffect(() => {
        if (props.ID == undefined) return;

        const handle = getGraphData(props.ID);
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

function getDERAnalyticData(props: DERReportPaneProps): JQuery.jqXHR<DERAnalyticResult[]> {
    const adjustedTime = findAppropriateUnit(getMoment(props.date, props.time),
        getStartEndTime(getMoment(props.date, props.time), props.windowSize, props.timeWindowUnits)[1],
        props.timeWindowUnits);

    return $.ajax({
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
    });
}

function getGraphData(id: number): JQuery.jqXHR<[number, number][]> {
    return $.ajax({
        type: "GET",
        url: `${homePath}api/DERReport/Data/${id}`,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: false,
        async: true
    });
}

export default DERReportPane;