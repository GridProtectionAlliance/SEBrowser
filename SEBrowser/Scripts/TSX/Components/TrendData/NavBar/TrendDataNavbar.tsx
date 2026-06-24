//******************************************************************************************************
//  TrendDataNavbar.tsx - Gbtc
//
//  Copyright © 2023, Grid Protection Alliance.  All Rights Reserved.
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
//  03/30/23 - Gabriel Santos
//       Generated original version of source code.
//
//******************************************************************************************************

import React from 'react';
import _ from 'lodash';
import { AssetControllerPath, MeterControllerPath } from '../../../Store/ControllerFunctions';
import { SEBrowser, TrendSearch, IMultiCheckboxOption } from '../../../global';
import { SystemCenter } from '@gpa-gemstone/application-typings';
import { DefaultSelects } from '../../Common/DefaultSelects';
import { Search } from '@gpa-gemstone/react-interactive';
import { ReactIcons } from '@gpa-gemstone/gpa-symbols';
import { Column } from '@gpa-gemstone/react-table';
import { useGetContainerPosition } from '@gpa-gemstone/helper-functions';
import ReportTimeFilter from '../../ReportTimeFilter';
import TrendChannelTable from '../Components/TrendChannelTable';
import { FilterType } from './Types';
import TrendChannelFilters from './ChannelFilters';
import TrendDataNavbarButtons from './TrendDataNavbarButtons';
import { useTrendDataNavbar } from './useTrendDataNavbar';

interface IProps {
    ToggleVis: () => void,
    ShowNav: boolean,
    SetShowAllSettings: (show: boolean) => void,
    AddNewCharts: (chartData: TrendSearch.ITrendPlot[]) => void,
    RemoveAllCharts: () => void,
    SetMovable: (toggle: boolean) => void,
    Movable: boolean,
    PlotIds: { ID: string, Height: number, Width: number }[],
    // Set for defaults
    TimeFilter: SEBrowser.IReportTimeFilter,
    LinePlot: IMultiCheckboxOption[],
}

const TrendSearchNavbar = React.memo((props: IProps) => {
    const timeRef = React.useRef<HTMLDivElement | null>(null);
    const filtRef = React.useRef<HTMLDivElement | null>(null);

    const { offsetHeight: timeOffsetHeight } = useGetContainerPosition(timeRef);
    const { offsetHeight: filtOffsetHeight } = useGetContainerPosition(filtRef);

    const [showFilter, setShowFilter] = React.useState<FilterType>('None');

    const {
        trendFilter,
        setTrendFilter,
        timeFilter,
        setTimeFilter,
        phaseStatus,
        channelGroupStatus,
        trendChannels,
        setTrendChannels,
        trendChannelStatus,
        selectedSet,
        setSelectedSet,
        phaseOptions,
        setPhaseOptions,
        channelGroupOptions,
        setChannelGroupOptions,
        linePlotOptions
    } = useTrendDataNavbar({ TimeFilter: props.TimeFilter, LinePlot: props.LinePlot });

    const tableHeight = timeOffsetHeight > filtOffsetHeight ? timeOffsetHeight : filtOffsetHeight;

    function getEnum(setOptions, field) {
        if (field.type != 'enum' || field.enum == undefined || field.enum.length != 1)
            return () => { };

        const handle = getValueListGroup(field.enum[0].Value);

        handle.done(d => setOptions(d.map(item => ({ Value: item.Value.toString(), Label: item.Text }))))
        return () => {
            if (handle != null && handle.abort == null) handle.abort();
        }
    }

    function getAdditionalMeterFields(setFields) {
        const handle = getAdditionalMeterFieldNames();

        handle.done((d: Array<SystemCenter.Types.AdditionalFieldView>) => {
            const ordered = _.orderBy(d.filter(item => item.Searchable).map(item => (
                {
                    label: `[AF${item.ExternalDB != undefined ? " " + item.ExternalDB : ''}] ${item.FieldName}`,
                    key: `AdditionalField.${item.FieldName}`,
                    ...ConvertFieldType(item.Type),
                    isPivotField: false
                } as Search.IField<SystemCenter.Types.DetailedMeter>
            )), ['label'], ["asc"]);
            setFields(ordered)
        });

        return () => {
            if (handle != null && handle.abort == null) handle.abort();
        };
    }

    function getAdditionalAssetFields(setFields) {
        const handle = getAdditionalAssetFieldNames();

        handle.done((d: Array<SystemCenter.Types.AdditionalFieldView>) => {
            const ordered = _.orderBy(d.filter(item => item.Searchable).map(item => (
                {
                    label: `[AF${item.ExternalDB != undefined ? " " + item.ExternalDB : ''}] ${item.FieldName}`,
                    key: `AdditionalField.${item.FieldName}`,
                    ...ConvertFieldType(item.Type),
                    isPivotField: false
                } as Search.IField<SystemCenter.Types.DetailedAsset>
            )), ['label'], ["asc"]);
            setFields(ordered);
        });
        return () => {
            if (handle != null && handle.abort == null) handle.abort();
        };
    }

    let navBody;
    if (!props.ShowNav)
        navBody = (
            <>
                <div className="navbar-nav mr-auto">
                    <span className="navbar-text">
                        {timeFilter.date} {timeFilter.time} +/- {timeFilter.windowSize} {formatWindowUnit(timeFilter.timeWindowUnits)}
                    </span>
                </div>
                <TrendDataNavbarButtons
                    ToggleVis={props.ToggleVis}
                    ShowNav={props.ShowNav}
                    SetShowAllSettings={props.SetShowAllSettings}
                    AddNewCharts={props.AddNewCharts}
                    RemoveAllCharts={props.RemoveAllCharts}
                    SetMovable={props.SetMovable}
                    Movable={props.Movable}
                    PlotIds={props.PlotIds}
                    TimeFilter={timeFilter}
                    LinePlot={linePlotOptions}
                    TrendChannels={trendChannels}
                    SelectedSet={selectedSet}
                    SetSelectedSet={setSelectedSet}
                />
            </>
        );
    else
        navBody = (
            <>
                <ul className="navbar-nav mr-auto" style={{ width: '100%' }}>
                    <li className="nav-item" style={{ width: '30%', paddingRight: 10 }} ref={timeRef as unknown as React.RefObject<HTMLLIElement>}>
                        <ReportTimeFilter
                            filter={timeFilter}
                            setFilter={setTimeFilter}
                            showQuickSelect={true}
                        />
                    </li>
                    <li className="nav-item" style={{ width: '15%', paddingRight: 10 }} ref={filtRef as unknown as React.RefObject<HTMLLIElement>}>
                        <TrendChannelFilters
                            TrendFilter={trendFilter}
                            SetTrendFilter={setTrendFilter}
                            LinePlot={linePlotOptions}
                            PhaseStatus={phaseStatus}
                            PhaseOptions={phaseOptions}
                            SetPhaseOptions={setPhaseOptions}
                            ChannelGroupStatus={channelGroupStatus}
                            ChannelGroupOptions={channelGroupOptions}
                            SetChannelGroupOptions={setChannelGroupOptions}
                            SetShowFilter={setShowFilter}
                        />
                    </li>
                    <li className="nav-item d-flex" style={{ width: '55%', paddingRight: 10, height: tableHeight }}>
                        {trendChannelStatus === 'loading' ?
                            <div className='d-flex align-items-center flex-column justify-content-center' style={{ width: '100%', height: tableHeight }}>
                                <ReactIcons.SpiningIcon Style={{ height: '50%' }} />
                            </div>
                            :
                            <TrendChannelTable
                                Height={tableHeight}
                                SetTrendChannels={setTrendChannels}
                                TrendChannels={trendChannels}
                                Type='multi'
                                SelectedSet={selectedSet}
                                SetSelectedSet={setSelectedSet}
                                EnableDragDrop={!props.Movable}
                            />
                        }
                    </li>
                </ul>
                <TrendDataNavbarButtons
                    ToggleVis={props.ToggleVis}
                    ShowNav={props.ShowNav}
                    SetShowAllSettings={props.SetShowAllSettings}
                    AddNewCharts={props.AddNewCharts}
                    RemoveAllCharts={props.RemoveAllCharts}
                    SetMovable={props.SetMovable}
                    Movable={props.Movable}
                    PlotIds={props.PlotIds}
                    TimeFilter={timeFilter}
                    LinePlot={linePlotOptions}
                    TrendChannels={trendChannels}
                    SelectedSet={selectedSet}
                    SetSelectedSet={setSelectedSet}
                />
            </>
        );

    return (
        <>
            <nav className="navbar navbar-expand-xl navbar-light bg-light" id={"TrendDataNavbar"}>
                <div className="collapse navbar-collapse" id="navbarSupportedContent" style={{ width: '100%' }}>
                    {navBody}
                </div>
            </nav>
            <DefaultSelects.Meter
                ControllerAPIPath={MeterControllerPath}
                Selection={trendFilter?.MeterList ?? []}
                OnClose={(selected, conf) => {
                    setShowFilter('None');
                    if (conf)
                        setTrendFilter(prev => prev != null ? ({ ...prev, MeterList: selected }) : null);
                }}
                Show={showFilter == 'Meter'}
                Type={'multiple'}
                Title={"Select Meters to Display"}
                GetEnum={getEnum}
                GetAddlFields={getAdditionalMeterFields}
            >
                <Column<SystemCenter.Types.DetailedMeter>
                    Key="AssetKey"
                    Field="AssetKey"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >
                    Key
                </Column>
                <Column<SystemCenter.Types.DetailedMeter>
                    Key="Name"
                    Field="Name"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >
                    Name
                </Column>
                <Column<SystemCenter.Types.DetailedMeter>
                    Key="Location"
                    Field="Location"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >
                    Substation
                </Column>
                <Column<SystemCenter.Types.DetailedMeter>
                    Key="MappedAssets"
                    Field="MappedAssets"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >
                    Assets
                </Column>
                <Column<SystemCenter.Types.DetailedMeter>
                    Key="Make"
                    Field="Make"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >
                    Make
                </Column>
                <Column<SystemCenter.Types.DetailedMeter>
                    Key="Model" Field="Model"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >
                    Model
                </Column>
            </DefaultSelects.Meter>
            <DefaultSelects.Asset
                ControllerAPIPath={AssetControllerPath}
                Selection={trendFilter?.AssetList ?? []}
                OnClose={(selected, conf) => {
                    setShowFilter('None');
                    if (conf)
                        setTrendFilter(prev => prev != null ? ({ ...prev, AssetList: selected }) : null);
                }}
                Show={showFilter == 'Asset'}
                Type={'multiple'}
                Title={"Filter by Asset"}
                GetEnum={getEnum}
                GetAddlFields={getAdditionalAssetFields}
            >
                <Column<SystemCenter.Types.DetailedAsset>
                    Key="AssetKey" Field="AssetKey"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >
                    Key
                </Column>
                <Column<SystemCenter.Types.DetailedAsset>
                    Key="AssetName"
                    Field="AssetName"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >
                    Name
                </Column>
                <Column<SystemCenter.Types.DetailedAsset>
                    Key="AssetType"
                    Field="AssetType"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >
                    Asset Type
                </Column>
                <Column<SystemCenter.Types.DetailedAsset>
                    Key="VoltageKV"
                    Field="VoltageKV"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >
                    Voltage (kV)
                </Column>
                <Column<SystemCenter.Types.DetailedAsset>
                    Key="Meters"
                    Field="Meters"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >
                    Meters
                </Column>
                <Column<SystemCenter.Types.DetailedAsset>
                    Key="Locations"
                    Field="Locations"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >
                    Substations
                </Column>
            </DefaultSelects.Asset>
        </>
    );
});

const getAdditionalAssetFieldNames = () => {
    return $.ajax({
        type: "GET",
        url: `${homePath}api/openXDA/AdditionalField/ParentTable/Asset/FieldName/0`,
        contentType: "application/json; charset=utf-8",
        cache: false,
        async: true
    });
}

const getAdditionalMeterFieldNames = () => {
    return $.ajax({
        type: "GET",
        url: `${homePath}api/openXDA/AdditionalField/ParentTable/Meter/FieldName/0`,
        contentType: "application/json; charset=utf-8",
        cache: false,
        async: true
    });
}

const getValueListGroup = (value) => {
    return $.ajax({
        type: "GET",
        url: `${homePath}api/ValueList/Group/${value}`,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        async: true
    });
}

const ConvertFieldType = (type: string) => {
    if (type == 'string' || type == 'integer' || type == 'number' || type == 'datetime' || type == 'boolean')
        return { type: type }
    return {
        type: 'enum', enum: [{ Label: type, Value: type }]
    }
}

// TODO: These can be in a shared place with eventSearchBar
const formatWindowUnit = (i: number) => {
    if (i == 7)
        return "Years";
    if (i == 6)
        return "Months";
    if (i == 5)
        return "Weeks";
    if (i == 4)
        return "Days";
    if (i == 3)
        return "Hours";
    if (i == 2)
        return "Minutes";
    if (i == 1)
        return "Seconds";
    return "Milliseconds";
}

export default TrendSearchNavbar;
