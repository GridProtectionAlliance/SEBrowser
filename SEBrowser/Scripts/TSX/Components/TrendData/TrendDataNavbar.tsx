﻿//******************************************************************************************************
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
import moment from 'moment';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { AssetSlice, MeterSlice, PhaseSlice, ChannelGroupSlice } from '../../Store';
import { SEBrowser, IMultiCheckboxOption } from '../../Global';
import { SystemCenter } from '@gpa-gemstone/application-typings';
import { MultiCheckBoxSelect } from '@gpa-gemstone/react-forms';
import { DefaultSelects } from '@gpa-gemstone/common-pages';
import { Search } from '@gpa-gemstone/react-interactive';
import { SVGIcons } from '@gpa-gemstone/gpa-symbols';
import { CreateGuid } from '@gpa-gemstone/helper-functions';
import ReportTimeFilter from '../ReportTimeFilter';
import NavbarFilterButton from '../Common/NavbarFilterButton';
import { ITrendPlot } from './TrendPlot/TrendPlot';
import TrendChannelTable from './TrendChannelTable';

interface IProps {
    ToggleVis: () => void,
    ShowNav: boolean,
    SetHeight: (h: number) => void,
    SetShowAllSettings: (show: boolean) => void,
    AddNewChart: (chartData: ITrendPlot) => void
}

interface IKeyValuePair {
    Key: string,
    Value: boolean
}

interface ITrendDataFilter {
    Phases: IKeyValuePair[],
    ChannelGroups: IKeyValuePair[],
    MeterList: SystemCenter.Types.DetailedMeter[],
    AssetList: SystemCenter.Types.DetailedAsset[]
}

const TrendSearchNavbar = React.memo((props: IProps) => {
    const navRef = React.useRef(null);
    const timeRef = React.useRef(null);
    const filtRef = React.useRef(null);
    const dispatch = useAppDispatch();

    const phaseStatus = useAppSelector(PhaseSlice.Status);
    const allPhases = useAppSelector(PhaseSlice.Data);

    const channelGroupStatus = useAppSelector(ChannelGroupSlice.Status);
    const allChannelGroups = useAppSelector(ChannelGroupSlice.Data);

    const [showFilter, setShowFilter] = React.useState<('None' | 'Meter' | 'Asset')>('None');

    const [timeFilter, setTimeFilter] = React.useState<SEBrowser.IReportTimeFilter>(null);

    const [trendFilter, setTrendFilter] = React.useState<ITrendDataFilter>(null);
    const [phaseOptions, setPhaseOptions] = React.useState<IMultiCheckboxOption[]>([]);
    const [channelGroupOptions, setChannelGroupOptions] = React.useState<IMultiCheckboxOption[]>([]);
    const [linePlotOptions, setLinePlotOptions] = React.useState<IMultiCheckboxOption[]>([{ Value: 0, Text: "Minimum", Selected: true }, { Value: 1, Text: "Maximum", Selected: true }, { Value: 2, Text: "Average", Selected: true }]);

    const [trendChannels, setTrendChannels] = React.useState<SEBrowser.ITrendChannel[]>([]);
    const [selectedSet, setSelectedSet] = React.useState<Set<number>>(new Set<number>());
    const [tableHeight, setTableHeight] = React.useState<number>(100);

    const momentDateFormat = "MM/DD/YYYY";

    const baseTimeFilter = { date: moment.utc().format(momentDateFormat), time: '12:00:00.000', windowSize: 12, timeWindowUnits: 3 }

    // Page effects
    React.useLayoutEffect(() => {
        props.SetHeight(navRef?.current?.offsetHeight ?? 0);
        let timeHeight = timeRef?.current?.offsetHeight ?? 0;
        let filtHeight = filtRef?.current?.offsetHeight ?? 0;
        setTableHeight(timeHeight > filtRef ? timeHeight : filtHeight);
    });

    // Multicheckbox Options Updates
    React.useEffect(() => {
        makeMultiCheckboxOptions(trendFilter?.Phases, setPhaseOptions, allPhases);
    }, [allPhases, trendFilter]);

    React.useEffect(() => {
        makeMultiCheckboxOptions(trendFilter?.ChannelGroups, setChannelGroupOptions, allChannelGroups);
    }, [allChannelGroups, trendFilter]);

    // Slice dispatches
    React.useEffect(() => {
        if (phaseStatus == 'changed' || phaseStatus == 'unintiated')
            dispatch(PhaseSlice.Fetch());
    }, [phaseStatus]);

    React.useEffect(() => {
        if (channelGroupStatus == 'changed' || channelGroupStatus == 'unintiated')
            dispatch(ChannelGroupSlice.Fetch());
    }, [channelGroupStatus]);

    React.useEffect(() => {
        if (trendFilter === null) return;
        // Get the data from the filter
        let handle = GetTrendChannels();
        return () => {
            if (handle != null && handle.abort != null) handle.abort();
        };
    }, [trendFilter]);

    React.useEffect(() => {
        // Todo: get filters from memory
        setTrendFilter({
            Phases: makeKeyValuePairs(allPhases),
            ChannelGroups: makeKeyValuePairs(allChannelGroups),
            MeterList: [],
            AssetList: []
        });
        setTimeFilter(baseTimeFilter);
    }, []);

    function makeKeyValuePairs(allKeys: { ID: number, Name: string, Description: string }[]): IKeyValuePair[] {
        if (allKeys == null) return [];
        return allKeys.map(key => ({ Key: key.Name, Value: true }));
    }

    function makeMultiCheckboxOptions(keyValues: IKeyValuePair[], setOptions: (options: IMultiCheckboxOption[]) => void, allKeys: { ID: number, Name: string, Description: string }[]) {
        if (allKeys == null || keyValues == null) return;
        let newOptions: IMultiCheckboxOption[] = [];
        allKeys.forEach((key, index) => newOptions.push({ Value: index, Text: key.Name, Selected: keyValues.find(e => e.Key === key.Name)?.Value ?? true }));
        setOptions(newOptions);
    }

    function multiCheckboxUpdate(filterField: keyof ITrendDataFilter, newOptions: IMultiCheckboxOption[], oldOptions: IMultiCheckboxOption[], setOptions: (options: IMultiCheckboxOption[]) => void) {
        let options: IMultiCheckboxOption[] = [];
        let pairs: IKeyValuePair[] = [];
        oldOptions.forEach(item => {
            const selected: boolean = item.Selected != (newOptions.findIndex(option => item.Value === option.Value) > -1);
            options.push({ ...item, Selected: selected });
            pairs.push({ Key: item.Text, Value: selected });
        })
        setOptions(options);
        setTrendFilter({ ...trendFilter, [filterField]: pairs });
    }

    function GetTrendChannels(): JQuery.jqXHR<any[]> {
        return $.ajax({
            type: "POST",
            url: `${homePath}api/OpenXDA/GetTrendSearchData`,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(trendFilter),
            dataType: 'json',
            cache: true,
            async: true
        }).done((data: SEBrowser.ITrendChannel[]) => {
            setTrendChannels(data);
            setSelectedSet(new Set<number>());
        });
    }

    // TODO: These can be in a shared place with eventSearchBar

    function formatWindowUnit(i: number) {
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

    function getEnum(setOptions, field) {
        let handle = null;
        if (field.type != 'enum' || field.enum == undefined || field.enum.length != 1)
            return () => { };

        handle = $.ajax({
            type: "GET",
            url: `${homePath}api/ValueList/Group/${field.enum[0].Value}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        handle.done(d => setOptions(d.map(item => ({ Value: item.Value.toString(), Label: item.Text }))))
        return () => {
            if (handle != null && handle.abort == null) handle.abort();
        }
    }

    function getAdditionalMeterFields(setFields) {
        let handle = $.ajax({
            type: "GET",
            url: `${homePath}api/openXDA/AdditionalField/ParentTable/Meter/FieldName/0`,
            contentType: "application/json; charset=utf-8",
            cache: false,
            async: true
        });

        function ConvertType(type: string) {
            if (type == 'string' || type == 'integer' || type == 'number' || type == 'datetime' || type == 'boolean')
                return { type: type }
            return {
                type: 'enum', enum: [{ Label: type, Value: type }]
            }
        }

        handle.done((d: Array<SystemCenter.Types.AdditionalField>) => {
            let ordered = _.orderBy(d.filter(item => item.Searchable).map(item => (
                { label: `[AF${item.ExternalDB != undefined ? " " + item.ExternalDB : ''}] ${item.FieldName}`, key: item.FieldName, ...ConvertType(item.Type), isPivotField: true } as Search.IField<SystemCenter.Types.DetailedMeter>
            )), ['label'], ["asc"]);
            setFields(ordered)
        });

        return () => {
            if (handle != null && handle.abort == null) handle.abort();
        };
    }

    function getAdditionalAssetFields(setFields) {
        let handle = $.ajax({
            type: "GET",
            url: `${homePath}api/SystemCenter/AdditionalField/ParentTable/Asset/FieldName/0`,
            contentType: "application/json; charset=utf-8",
            cache: false,
            async: true
        });

        function ConvertType(type: string) {
            if (type == 'string' || type == 'integer' || type == 'number' || type == 'datetime' || type == 'boolean')
                return { type: type }
            return {
                type: 'enum', enum: [{ Label: type, Value: type }]
            }
        }

        handle.done((d: Array<SystemCenter.Types.AdditionalField>) => {

            let ordered = _.orderBy(d.filter(item => item.Searchable).map(item => (
                { label: `[AF${item.ExternalDB != undefined ? " " + item.ExternalDB : ''}] ${item.FieldName}`, key: item.FieldName, ...ConvertType(item.Type), isPivotField: true } as Search.IField<SystemCenter.Types.DetailedAsset>
            )), ['label'], ["asc"]);
            setFields(ordered);
        });
        return () => {
            if (handle != null && handle.abort == null) handle.abort();
        };
    }

    if (trendFilter === null || timeFilter === null) return null;

    let navBody;
    if (!props.ShowNav)
        navBody = (
            <>
                <div className="navbar-nav mr-auto">
                    <span className="navbar-text">
                        {timeFilter.date} {timeFilter.time} +/- {timeFilter.windowSize} {formatWindowUnit(timeFilter.timeWindowUnits)}
                    </span>
                </div>
                <div className="navbar-nav ml-auto" >
                    <button type="button" className={`btn btn-primary btn-sm`} onClick={() => props.ToggleVis()}>
                        <span>{SVGIcons.ArrowDropDown}</span>
                    </button>
                </div>
            </>);
    else
        navBody = (
            <>
                <ul className="navbar-nav mr-auto" style={{ width: '100%' }}>
                    <li className="nav-item" style={{ width: '30%', paddingRight: 10 }} ref={timeRef}>
                        <ReportTimeFilter filter={timeFilter} setFilter={setTimeFilter} showQuickSelect={true} />
                    </li>
                    <li className="nav-item" style={{ width: '15%', paddingRight: 10 }} ref={filtRef}>
                        <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                            <legend className="w-auto" style={{ fontSize: 'large' }}>Channel Filters:</legend>
                            <label style={{ width: '100%', position: 'relative', float: "left" }}>Phase Filter: </label>
                            <div className="row">
                                <div className={"col"}>
                                    <MultiCheckBoxSelect
                                        Options={phaseOptions}
                                        Label={''}
                                        OnChange={(evt, Options: IMultiCheckboxOption[]) => multiCheckboxUpdate("Phases", Options, phaseOptions, setPhaseOptions)}
                                    />
                                </div>
                            </div>
                            <label style={{ width: '100%', position: 'relative', float: "left" }}>Channel Group Filter: </label>
                            <div className="row">
                                <div className={"col"}>
                                    <MultiCheckBoxSelect
                                        Options={channelGroupOptions}
                                        Label={''}
                                        OnChange={(evt, Options: IMultiCheckboxOption[]) => multiCheckboxUpdate("ChannelGroups", Options, channelGroupOptions, setChannelGroupOptions)}
                                    />
                                </div>
                            </div>
                            <label style={{ width: '100%', position: 'relative', float: "left" }}>Lines Plotted: </label>
                            <div className="row">
                                <div className={"col"}>
                                    <MultiCheckBoxSelect
                                        Options={linePlotOptions}
                                        Label={''}
                                        OnChange={(evt, newOptions: IMultiCheckboxOption[]) => {
                                            let options: IMultiCheckboxOption[] = [];
                                            linePlotOptions.forEach(item => {
                                                const selected: boolean = item.Selected != (newOptions.findIndex(option => item.Value === option.Value) > -1);
                                                options.push({ ...item, Selected: selected });
                                            })
                                            setLinePlotOptions(options);
                                        }}
                                    />
                                </div>
                            </div>
                            <div className={"row"}>
                                <div className={'col'}>
                                    <NavbarFilterButton<SystemCenter.Types.DetailedMeter> Type={'Meter'} OnClick={() => setShowFilter('Meter')} Data={trendFilter.MeterList} />
                                </div>
                            </div>
                            <div className={"row"}>
                                <div className={'col'}>
                                    <NavbarFilterButton<SystemCenter.Types.DetailedAsset> Type={'Asset'} OnClick={() => setShowFilter('Asset')} Data={trendFilter.AssetList} />
                                </div>
                            </div>
                        </fieldset>
                    </li>
                    <li className="nav-item" style={{ width: '55%', paddingRight: 10, height: tableHeight }}>
                        <TrendChannelTable Height={tableHeight} TrendChannels={trendChannels} Type='multi' SelectedSet={selectedSet} SetSelectedSet={setSelectedSet} EnableDragDrop={true} />
                    </li>
                </ul>
                <div className="btn-group-vertical float-right">
                    <button type="button" style={{ marginBottom: 5 }} className={`btn btn-primary btn-sm`} onClick={() => props.ToggleVis()}>
                        <span>{SVGIcons.ArrowDropUp}</span>
                    </button>
                    <button type="button" style={{ marginBottom: 5 }} className={`btn btn-primary btn-sm`} onClick={() => props.SetShowAllSettings(true)}>
                        <span>{SVGIcons.Settings}</span>
                    </button>
                    <button type="button" style={{ marginBottom: 5 }} className={`btn btn-primary btn-sm`} onClick={() => {
                        let selectedChannels = trendChannels.filter(chan => selectedSet.has(chan.ID));
                        props.AddNewChart({
                            TimeFilter: timeFilter, Type: 'Line', Channels: selectedChannels, ID: CreateGuid(), Height: 33, Width: 50,
                            PlotFilter: linePlotOptions, Title: `${selectedChannels.length} Channel Line Plot`
                        })
                    }}>
                        <span>{SVGIcons.DataContainer}</span>
                    </button>
                </div>
            </>);

    return (
        <>
            <nav className="navbar navbar-expand-xl navbar-light bg-light" ref={navRef} id={"TrendDataNavbar"}>
                <div className="collapse navbar-collapse" id="navbarSupportedContent" style={{ width: '100%' }}>
                    {navBody}
                </div>
            </nav>
            <DefaultSelects.Meter
                Slice={MeterSlice as any}
                Selection={trendFilter.MeterList}
                OnClose={(selected, conf) => {
                    setShowFilter('None');
                    if (conf)
                        setTrendFilter({ ...trendFilter, MeterList: selected });
                }
                }
                Show={showFilter == 'Meter'}
                Type={'multiple'}
                Columns={[
                    { key: 'AssetKey', field: 'AssetKey', label: 'Key', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' } },
                    { key: 'Name', field: 'Name', label: 'Name', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' } },
                    { key: 'Location', field: 'Location', label: 'Substation', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' } },
                    { key: 'MappedAssets', field: 'MappedAssets', label: 'Assets', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' } },
                    { key: 'Make', field: 'Make', label: 'Make', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' } },
                    { key: 'Model', field: 'Model', label: 'Model', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' } },
                    { key: 'Scroll', label: '', headerStyle: { width: 17, padding: 0 }, rowStyle: { width: 0, padding: 0 } },
                ]}
                Title={"Filter by Meter"}
                GetEnum={getEnum}
                GetAddlFields={getAdditionalMeterFields} />
            <DefaultSelects.Asset
                Slice={AssetSlice as any}
                Selection={trendFilter.AssetList}
                OnClose={(selected, conf) => {
                    setShowFilter('None');
                    if (conf)
                        setTrendFilter({ ...trendFilter, AssetList: selected });
                }}
                Show={showFilter == 'Asset'}
                Type={'multiple'}
                Columns={[
                    { key: 'AssetKey', field: 'AssetKey', label: 'Key', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' } },
                    { key: 'AssetName', field: 'AssetName', label: 'Name', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' } },
                    { key: 'AssetType', field: 'AssetType', label: 'Asset Type', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' } },
                    { key: 'VoltageKV', field: 'VoltageKV', label: 'Voltage (kV)', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' } },
                    { key: 'Meters', field: 'Meters', label: 'Meters', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' } },
                    { key: 'Locations', field: 'Locations', label: 'Substations', headerStyle: { width: 'auto' }, rowStyle: { width: 'auto' } }
                ]}
                Title={"Filter by Asset"}
                GetEnum={getEnum}
                GetAddlFields={getAdditionalAssetFields} />
        </>
    );
});

export default TrendSearchNavbar;