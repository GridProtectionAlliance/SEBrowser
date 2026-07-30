//******************************************************************************************************
// CapBankReportPane.tsx - Gbtc
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
//  08/06/2020 - Christoph Lackner
//       Generated original version of source code.
//
//******************************************************************************************************
import * as React from 'react';
import moment from 'moment';
import _ from 'lodash';

import { CapBankReportNavBarProps } from './CapBankReportNavBar';
import { Warning, Modal, Alert } from '@gpa-gemstone/react-interactive';
import { ReactIcons } from '@gpa-gemstone/gpa-symbols';
import { Select } from '@gpa-gemstone/react-forms';
import { Table, ConfigurableTable, Column, GetConfigurableColumnsFromTypeEntries } from '@gpa-gemstone/react-table';
import { Application, Gemstone } from '@gpa-gemstone/application-typings';
import { Plot, Line } from '@gpa-gemstone/react-graph'
import { findAppropriateUnit, getMoment, getStartEndTime } from '../../EventSearch/TimeWindowUtils';

interface ITrendSeries {

    data: Array<[number, number]>,
    color: string,
    label: string,
    lineStyle: ('-' | ':'),
    includeLegend: boolean,
}


interface ITrendDataSet {
    DeltaQ: Array<ITrendSeries>,
    Irms: Array<ITrendSeries>,
    DeltaIrms: Array<ITrendSeries>,
    Vrms: Array<ITrendSeries>,
    DeltaVrms: Array<ITrendSeries>,
    Q: Array<ITrendSeries>,
    Freq: Array<ITrendSeries>,
    THDI: Array<ITrendSeries>,
    DeltaTHDI: Array<ITrendSeries>,
    THDV: Array<ITrendSeries>,
    DeltaTHDV: Array<ITrendSeries>,
    SwitchingFreq: Array<ITrendSeries>,
    PeakV: Array<ITrendSeries>,
    Xcap: Array<ITrendSeries>,
    DeltaXcap: Array<ITrendSeries>,
    RestrikeDuration: Array<ITrendSeries>,
    RestrikeI: Array<ITrendSeries>,
    RestrikeV: Array<ITrendSeries>,
    PISDuration: Array<ITrendSeries>,
    PISZ: Array<ITrendSeries>,
    PISI: Array<ITrendSeries>,
    KFactor: Array<ITrendSeries>,
    RelaydV: Array<ITrendSeries>,
    RelayXLV: Array<ITrendSeries>,
    RelayV: Array<ITrendSeries>,
    RelayXV: Array<ITrendSeries>,
    Ineutral: Array<ITrendSeries>,
    BusZ: Array<ITrendSeries>,
    BusV: Array<ITrendSeries>,
    Unbalance: Array<ITrendSeries>,
}

interface ICBEvent {
    ID: number,
    Time: string
    Status: string,
    EventId: number,
    Operation: string,
    Resonance: boolean,
    Phase: string,
    CapBankHealth: string,
    Restrike: string,
    PreInsertionSwitch: string
}

interface IPointRow {
    Time: number,
    Values: Array<number | null>
}

const emptyTrendData: ITrendDataSet = {
    DeltaQ: [],
    Irms: [],
    DeltaIrms: [],
    Vrms: [],
    DeltaVrms: [],
    Q: [],
    Freq: [],
    THDI: [],
    DeltaTHDI: [],
    THDV: [],
    DeltaTHDV: [],
    SwitchingFreq: [],
    PeakV: [],
    Xcap: [],
    DeltaXcap: [],
    RestrikeDuration: [],
    RestrikeI: [],
    RestrikeV: [],
    PISDuration: [],
    PISZ: [],
    PISI: [],
    KFactor: [],
    RelaydV: [],
    RelayXLV: [],
    RelayV: [],
    RelayXV: [],
    Ineutral: [],
    BusZ: [],
    BusV: [],
    Unbalance: []
};

const recordFields: Gemstone.TSX.Interfaces.IRecordFields<ICBEvent> = {
    Time: {
        AllowSort: true, IsDefaultColumn: true, Label: 'Time', Content: (item) => <a target="_blank"
            href={'./eventsearch?line=true&date=' + moment.utc(item.Time).format('MM/DD/YYYY') + '&time=' + moment.utc(item.Time).format('HH:mm:ss.SSS') + '&windowSize=10&timeWindowUnits=2&tab=All&eventid=' + item.EventId}
        > {moment.utc(item.Time).format('MM/DD/YY HH:mm:ss.SSS')}</a>
    },
    Phase: { AllowSort: true, IsDefaultColumn: true, Label: 'Phase' },
    Status: { AllowSort: true, IsDefaultColumn: true, Label: 'Analysis Status' },
    Operation: { AllowSort: true, IsDefaultColumn: true, Label: 'Capacitor Bank Operation' },
    Resonance: { AllowSort: true, IsDefaultColumn: true, Label: 'Resonance', Content: (item) => <>{item.Resonance ? 'Yes' : 'No'}</> },
    CapBankHealth: { AllowSort: true, IsDefaultColumn: true, Label: 'Capacitor Bank Health' },
    Restrike: { AllowSort: true, IsDefaultColumn: true, Label: 'Restrike', Content: (item) => <>{item.Restrike == undefined ? 'N/A' : item.Restrike}</> },
    PreInsertionSwitch: { AllowSort: true, IsDefaultColumn: true, Label: 'PreInsertionSwitching Condition', Content: (item) => <>{item.PreInsertionSwitch == undefined ? 'N/A' : item.PreInsertionSwitch}</> },
};

interface IPlotConfig {
    field: keyof ITrendDataSet;
    title: string;
    ylabel: string;
    unit: string;
    useMetricFactors?: boolean;
}

const plotConfigs: IPlotConfig[] = [
    { field: 'Q', title: 'Short Circuit Power', ylabel: 'Short Circuit Power (MVA)', unit: '(MVA)' },
    { field: 'DeltaQ', title: 'Change in Q', ylabel: 'Delta Q (kVAR)', unit: '(MVA)' },
    { field: 'Irms', title: 'RMS Current', ylabel: 'I RMS (A)', unit: '(A)' },
    { field: 'DeltaIrms', title: 'Change in RMS Current', ylabel: 'Delta I RMS (A)', unit: '(A)' },
    { field: 'Vrms', title: 'RMS Voltage', ylabel: 'V RMS (%)', unit: '(%)', useMetricFactors: false },
    { field: 'DeltaVrms', title: 'Change in RMS Voltage', ylabel: 'Delta V RMS (%)', unit: '(%)', useMetricFactors: false },
    { field: 'Freq', title: 'Resonance Frequency', ylabel: 'Res. Freq. (Hz)', unit: '(Hz)' },
    { field: 'PeakV', title: 'Peak Voltage', ylabel: 'Voltage peak (%)', unit: '(%)', useMetricFactors: false },
    { field: 'THDV', title: 'Voltage THD', ylabel: 'THD (%)', unit: '(%)', useMetricFactors: false },
    { field: 'DeltaTHDV', title: 'Change in Voltage THD', ylabel: 'Delta THD (%)', unit: '(%)', useMetricFactors: false },
    { field: 'THDI', title: 'Current THD', ylabel: 'THD (%)', unit: '(%)', useMetricFactors: false },
    { field: 'DeltaTHDI', title: 'Change in Current THD', ylabel: 'Delta THD (%)', unit: '(%)', useMetricFactors: false },
    { field: 'SwitchingFreq', title: 'Switching Frequency', ylabel: 'Switching Freq. (Hz)', unit: '(Hz)' },
    { field: 'Xcap', title: 'Capacitor Bank Impedance', ylabel: 'Impedance (Ohm)', unit: '(Ohm)' },
    { field: 'DeltaXcap', title: 'Capacitor Bank Impedance Change', ylabel: 'Impedance (Ohm)', unit: '(Ohm)' },
    { field: 'RestrikeDuration', title: 'Capacitor Bank Restrike Duration', ylabel: 'Duration (cycles)', unit: '(cycles)' },
    { field: 'RestrikeI', title: 'Capacitor Bank Restrike Current Peak', ylabel: 'Current Peak (kA)', unit: '(kA)' },
    { field: 'RestrikeV', title: 'Capacitor Bank Restrike Voltage Peak', ylabel: 'Voltage Peak (kV)', unit: '(kV)' },
    { field: 'PISDuration', title: 'Capacitor Bank Pre-Insertion Switching Duration', ylabel: 'Duration (cycles)', unit: '(cycles)' },
    { field: 'PISZ', title: 'Capacitor Bank Pre-Insertion Switching Impedance', ylabel: 'Impedance (Ohm)', unit: '(Ohm)' },
    { field: 'PISI', title: 'Capacitor Bank Pre-Insertion Switching Current', ylabel: 'Current (kA)', unit: '(kA)' },
    { field: 'KFactor', title: 'Capacitor Bank K Factor', ylabel: 'K Factor', unit: '', useMetricFactors: false },
    { field: 'RelaydV', title: 'Capacitor Bank Relay Differential Voltage', ylabel: 'Diff. Voltage (V)', unit: '(V)' },
    { field: 'RelayV', title: 'Capacitor Bank Relay Voltage', ylabel: 'Voltage (V)', unit: '(V)' },
    { field: 'RelayXV', title: 'Capacitor Bank Voltage-Impedance Ratio Missmatch', ylabel: 'ratio missmatch (%)', unit: '(%)', useMetricFactors: false },
    { field: 'RelayXLV', title: 'Capacitor Bank LV Cap Reactance or Midstack Reactances', ylabel: 'Reactance (Ohm)', unit: '(Ohm)' },
    { field: 'Ineutral', title: 'Capacitor Bank Neutral Current', ylabel: 'Current (A)', unit: '(A)' },
    { field: 'Unbalance', title: 'Capacitor Bank Unbalance Factors', ylabel: 'Unbalance (%)', unit: '(%)', useMetricFactors: false },
    { field: 'BusV', title: 'Capacitor Bank Zero Sequence Voltage', ylabel: 'Voltage (V)', unit: '(V)' },
    { field: 'BusZ', title: 'Capacitor Bank Zero Sequence Impedance', ylabel: 'Impedance (Ohm)', unit: '(Ohm)' },
];

const CapBankReportPane = (props: CapBankReportNavBarProps) => {
    const [eventData, setEventData] = React.useState<ICBEvent[]>([]);
    const [trendData, setTrendData] = React.useState<ITrendDataSet>(emptyTrendData);
    const [showWarning, setShowWarning] = React.useState<boolean>(false);
    const [showCapBankEdit, setShowCapBankEdit] = React.useState<boolean>(false);
    const [selectedCapBank, setSelectedCapBank] = React.useState<number>(1);
    const [selectedEvent, setSelectedEvent] = React.useState<number>(0);
    const [pointTable, setPointTable] = React.useState<{ title: string, unit: string, labels: string[], rows: IPointRow[] } | null>(null);
    const [refreshKey, setRefreshKey] = React.useState<number>(0);
    const [eventTableStatus, setEventTableStatus] = React.useState<Application.Types.Status>('uninitiated');
    const [trendStatus, setTrendStatus] = React.useState<Application.Types.Status>('uninitiated');
    const [updateCapBankStatus, setUpdateCapBankStatus] = React.useState<Application.Types.Status>('uninitiated');
    const [sortKey, setSortKey] = React.useState<string>('');
    const [ascending, setAscending] = React.useState<boolean>(true);

    const { date, time, windowSize, timeWindowUnits } = props.TimeFilter;
    const filterString = getFilterString(props);
    const [Tstart, Tend] = React.useMemo(() => {
        const [start, end] = getStartEndTime(getMoment(date, time), windowSize, timeWindowUnits);
        return [start.valueOf(), end.valueOf()];
    }, [date, time, windowSize, timeWindowUnits]);

    const sortedEventData = React.useMemo(() => {
        if (sortKey === '')
            return eventData;
        return _.orderBy(eventData, [sortKey], [ascending ? 'asc' : 'desc']);
    }, [eventData, sortKey, ascending]);

    const sortCallback = React.useCallback((d: { colKey: string, colField?: keyof ICBEvent, ascending: boolean }) => {
        if (d.colField == null)
            return;
        if (d.colField === sortKey)
            setAscending(!ascending);
        else {
            setSortKey(d.colField);
            setAscending(true);
        }
    }, [sortKey, ascending]);

    React.useEffect(() => {
        if (props.CapBankID < 0)
            return;

        const eventTimeFrame = findAppropriateUnit(getMoment(date), getStartEndTime(getMoment(date, time), windowSize, timeWindowUnits)[1], timeWindowUnits);
        const trendTimeFrame = findAppropriateUnit(getMoment(date, time), getStartEndTime(getMoment(date, time), windowSize, timeWindowUnits)[0], timeWindowUnits);

        setEventTableStatus('loading');
        const eventRequest = getEventTable(props.CapBankID, date, time, eventTimeFrame[0], eventTimeFrame[1], props.selectedBank, filterString);
        eventRequest.done((data: ICBEvent[]) => {
            setEventData(data == null ? [] : data);
            setEventTableStatus('idle');
        });
        eventRequest.fail(() => {
            setEventTableStatus('error');
        });

        setTrendStatus('loading');
        const trendRequest = getTrend(props.CapBankID, date, time, trendTimeFrame[0], trendTimeFrame[1], props.selectedBank, filterString);
        trendRequest.done((data: ITrendDataSet) => {
            if (data != null)
                setTrendData(data);
            setTrendStatus('idle');
        });

        trendRequest.fail(() => {
            setTrendStatus('error');
        });

        return () => {
            eventRequest?.abort();
            trendRequest?.abort();
        };
    }, [props.CapBankID, props.selectedBank, date, time, windowSize, timeWindowUnits, filterString, refreshKey]);

    const updateCapBank = React.useCallback(() => {
        setUpdateCapBankStatus('loading');
        const request = setCapBank(selectedEvent, selectedCapBank);
        request.done(() => {
            setUpdateCapBankStatus('idle');
            setRefreshKey(key => key + 1);
        });
        request.fail(() => setUpdateCapBankStatus('error'));
    }, [selectedEvent, selectedCapBank]);

    const createPointTable = (d: ITrendSeries[], title: string, unit: string) => {

        let indices = d.map(() => 0);
        const rows: IPointRow[] = [];

        while (indices.some((item, index) => item < d[index].data.length)) {
            const T = Math.min(...indices.map((item, index) => item < d[index].data.length ? d[index].data[item][0] : NaN).filter(n => !isNaN(n)));
            rows.push({
                Time: T,
                Values: d.map((item, index) => indices[index] < item.data.length && item.data[indices[index]][0] == T ? item.data[indices[index]][1] : null)
            });
            indices = indices.map((item, index) => item < d[index].data.length && d[index].data[item][0] == T ? item + 1 : item);
        }

        setPointTable({ title, unit, labels: d.map(item => item.label), rows });
    };

    if (props.CapBankID == -1)
        return null;

    const bankOptions = Array.from({ length: props.numBanks }, (_, i) => ({ Value: i + 1, Label: `${i + 1}` }));
    const noTrendData = trendStatus === 'idle' && plotConfigs.every(cfg => trendData[cfg.field].length === 0);
    const noEventData = eventTableStatus === 'idle' && eventData.length === 0;

    return (
        <>
            <Modal
                Title='Assign Event to a Capacitor Bank'
                ShowX={true}
                CallBack={(confirmed) => {
                    setShowCapBankEdit(false);
                    if (confirmed)
                        setShowWarning(true);
                }}
                Show={showCapBankEdit}
                Size={'sm'}
                ShowCancel={false}
                ConfirmText={'Update'}
            >
                <Select<{ selectedCapBank: number }>
                    Record={{ selectedCapBank }}
                    Field='selectedCapBank'
                    Label='Capacitor Bank:'
                    Setter={(record) => setSelectedCapBank(record.selectedCapBank)}
                    Options={bankOptions}
                />
            </Modal>
            <Modal
                Title={pointTable == null ? '' : pointTable.title}
                Show={pointTable != null}
                ShowX={true}
                CallBack={() => setPointTable(null)}
                ShowCancel={false}
                ConfirmText={'Close'}
                Size={'xlg'}
            >
                {pointTable == null ? null :
                    <Table<IPointRow>
                        Data={pointTable.rows}
                        SortKey={''}
                        Ascending={true}
                        OnSort={() => { /* sorting not supported */ }}
                        KeySelector={(row) => row.Time}
                        TableClass="table table-bordered table-hover"
                        TableStyle={{ marginBottom: 0 }}
                        TbodyStyle={{ maxHeight: innerHeight - 250, overflowY: 'scroll' }}
                        OnClick={({ row }) => window.open('./eventsearch?line=true&date=' + moment.utc(row.Time).format('MM/DD/YYYY') + '&time=' + moment.utc(row.Time).format('HH:mm:ss.SSS') + '&windowSize=1&timeWindowUnits=1&tab=All&eventid=-1', "_blank")}
                    >
                        <Column<IPointRow>
                            Key={'Time'}
                            AllowSort={false}
                            Field={'Time'}
                            Content={({ item }) => moment.utc(item.Time).format('MM/DD/YY HH:mm:ss.SSS')}
                        >
                            Time
                        </Column>
                        {pointTable.labels.map((label, i) =>
                            <Column<IPointRow>
                                Key={label + i}
                                AllowSort={false}
                                Content={({ item }) => item.Values[i] == null ? 'N/A' : item.Values[i].toPrecision(6)}
                            >
                                <span>{label} {pointTable.unit}</span>
                            </Column>
                        )}
                    </Table>}
            </Modal>
            <Warning
                Show={showWarning}
                Title={'Confirm Capacitor Bank Assignment'}
                Message={'The Capacitor Bank manually assigned to this event can not be changed in the future. Are you sure you want to continue?'}
                CallBack={(confirmed) => { setShowWarning(false); if (confirmed) updateCapBank(); else setShowCapBankEdit(true); }}
            />
            <div className="d-flex flex-column flex-grow-1" style={{ overflowY: 'auto', minHeight: 0 }}>
                {eventTableStatus === 'error' ?
                    <Alert Class="alert-danger">
                        An error occurred while fetching capacitor bank event data.
                    </Alert>
                    : null}
                {trendStatus === 'error' ?
                    <Alert Class="alert-danger">
                        An error occurred while fetching capacitor bank trend data.
                    </Alert>
                    : null}
                {updateCapBankStatus === 'error' ?
                    <Alert Class="alert-danger">
                        An error occurred while assigning the event to a capacitor bank.
                    </Alert>
                    : null}
                {noTrendData && noEventData ?
                    <Alert Class="alert-info" Style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        No trend data or capacitor bank events found.
                    </Alert>
                    : <>
                        {trendStatus === 'loading' ?
                            <div className="d-flex align-items-center justify-content-center" style={{ height: 250 }}>
                                <ReactIcons.SpiningIcon Size={'25%'} />
                            </div>
                            : noTrendData ?
                                <Alert Class="alert-info">
                                    No capacitor bank trend data.
                                </Alert>
                                : null}
                        {plotConfigs.map(cfg =>
                            trendData[cfg.field].length > 0 ?
                                <div className="card" key={cfg.field}>
                                    <div className="card-header">{cfg.title}</div>
                                    <div className="card-body">
                                        <Plot
                                            height={250}
                                            width={innerWidth - 345}
                                            showBorder={false}
                                            defaultTdomain={[Tstart, Tend]}
                                            legend={'bottom'}
                                            Tlabel={'Time'}
                                            Ylabel={cfg.ylabel}
                                            showMouse={true}
                                            useMetricFactors={cfg.useMetricFactors}
                                            onDataInspect={() => createPointTable(trendData[cfg.field], cfg.title, cfg.unit)}
                                        >
                                            {trendData[cfg.field].map((s, i) => <Line
                                                highlightHover={true}
                                                showPoints={true}
                                                lineStyle={s.lineStyle}
                                                color={s.color}
                                                data={s.data}
                                                legend={s.label}
                                                key={i}
                                            />)}
                                        </Plot>
                                    </div>
                                </div> : null
                        )}

                        <div className="card">
                            <div className="card-header">Capacitor Bank Analytic Event Overview</div>
                            <div className="card-body">
                                {eventTableStatus === 'loading' ?
                                    <div className="d-flex align-items-center justify-content-center" style={{ height: 250 }}>
                                        <ReactIcons.SpiningIcon Size={'25%'} />
                                    </div>
                                    : noEventData ?
                                        <Alert Class="alert-info">
                                            No capacitor bank events found.
                                        </Alert>
                                        :
                                        <ConfigurableTable<ICBEvent>
                                            Data={sortedEventData}
                                            SortKey={sortKey}
                                            Ascending={ascending}
                                            OnSort={sortCallback}
                                            KeySelector={(item) => item.ID}
                                            TableClass="table"
                                            LocalStorageKey="SEBrowser.CapBankReportPane"
                                        >
                                            {props.selectedBank == -2 ?
                                                <Column<ICBEvent>
                                                    Key={'Edit'}
                                                    AllowSort={false}
                                                    Content={({ item }) =>
                                                        <button className='btn'
                                                            onClick={() => {
                                                                setShowCapBankEdit(true);
                                                                setSelectedEvent(item.ID);
                                                                setSelectedCapBank(1);
                                                            }}
                                                        >
                                                            <ReactIcons.Pencil />
                                                        </button>}
                                                >
                                                    {' '}
                                                </Column> : null}
                                            {GetConfigurableColumnsFromTypeEntries<ICBEvent>(recordFields, 'MM/DD/YY HH:mm:ss.SSS')}
                                        </ConfigurableTable>}
                            </div>
                        </div>
                    </>}
            </div>
        </>
    );
};

export default CapBankReportPane;

//Helper Functions
const getFilterString = (props: CapBankReportNavBarProps) => {
    let filter = "";

    //First Filter is Resonance
    if (props.ResFilt.length > 0)
        filter = `&resFilt=${props.ResFilt.join(',')}`

    //Next Filter is CapBankStatus
    if ((props.StatFilt.length > 0) && (!props.StatFilt.includes(999)))
        filter = filter + `&statFilt=${props.StatFilt.join(',')}`

    //Next Filter is Operation
    if ((props.OpFilt.length > 0) && (!props.OpFilt.includes(999)))
        filter = filter + `&operationFilt=${props.OpFilt.join(',')}`

    //Next Filter is Restrike Filter
    if ((props.RestFilt.length > 0) && (!props.RestFilt.includes(999)))
        filter = filter + `&restrikeFilt=${props.RestFilt.join(',')}`

    //Next Filter is Switching Health Filter
    if ((props.PISFilt.length > 0) && (!props.PISFilt.includes(999)))
        filter = filter + `&switchingHealthFilt=${props.PISFilt.join(',')}`

    //Next Filter is CB Health Filter
    if ((props.HealthFilt.length > 0) && (!props.HealthFilt.includes(999)))
        filter = filter + `&healthFilt=${props.HealthFilt.join(',')}`

    //Next Filter is Phase Filter
    if ((props.PhaseFilter.length > 0) && (!props.PhaseFilter.includes(999)))
        filter = filter + `&phaseFilt=${props.PhaseFilter.join(',')}`

    return filter;
};

const getEventTable = (capBankId: number, date: string, time: string, timeWindowUnits: number, windowSize: number, bankNum: number, filterString: string): JQuery.jqXHR<ICBEvent[]> =>
    $.ajax({
        type: "GET",
        url: `${homePath}api/PQDashboard/CapBankReport/GetEventTable?capBankId=${capBankId}&date=${date}` +
            `&time=${time}&timeWindowunits=${timeWindowUnits}&windowSize=${windowSize}` +
            `&bankNum=${bankNum}` + filterString,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: false,
        async: true
    });

const getTrend = (capBankId: number, date: string, time: string, timeWindowUnits: number, windowSize: number, bankNum: number, filterString: string): JQuery.jqXHR<ITrendDataSet> =>
    $.ajax({
        type: "GET",
        url: `${homePath}api/PQDashboard/CapBankReport/GetTrend?capBankId=${capBankId}&date=${date}` +
            `&time=${time}&timeWindowunits=${timeWindowUnits}&windowSize=${windowSize}` +
            `&bankNum=${bankNum}` + filterString,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: false,
        async: true
    });

const setCapBank = (eventId: number, capBankId: number): JQuery.jqXHR =>
    $.ajax({
        type: "GET",
        url: `${homePath}api/PQDashboard/CapBankReport/SetCapBank/${eventId}/${capBankId}`,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: false,
        async: true
    });
