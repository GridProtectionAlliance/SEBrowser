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
/* eslint-disable @typescript-eslint/no-empty-function */
import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { AssetSlice, MeterSlice, PhaseSlice, ChannelGroupSlice } from '../../Store';
import { SEBrowser, IMultiCheckboxOption } from '../../Global';
import { SystemCenter } from '@gpa-gemstone/application-typings';
import { MultiCheckBoxSelect } from '@gpa-gemstone/react-forms';
import { DefaultSelects } from '@gpa-gemstone/common-pages';
import { Search, ToolTip } from '@gpa-gemstone/react-interactive';
import { CrossMark, SVGIcons } from '@gpa-gemstone/gpa-symbols';
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
    DisableAllSettings: boolean
    AddNewCharts: (chartData: ITrendPlot[]) => void
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

    const phaseStatus = useAppSelector(PhaseSlice.SearchStatus);
    const allPhases = useAppSelector(PhaseSlice.SearchResults);

    const channelGroupStatus = useAppSelector(ChannelGroupSlice.SearchStatus);
    const allChannelGroups = useAppSelector(ChannelGroupSlice.SearchResults);

    const [showFilter, setShowFilter] = React.useState<('None' | 'Meter' | 'Asset')>('None');

    const [timeFilter, setTimeFilter] = React.useState<SEBrowser.IReportTimeFilter>(null);

    const [trendFilter, setTrendFilter] = React.useState<ITrendDataFilter>(null);
    const [phaseOptions, setPhaseOptions] = React.useState<IMultiCheckboxOption[]>([]);
    const [channelGroupOptions, setChannelGroupOptions] = React.useState<IMultiCheckboxOption[]>([]);
    const [linePlotOptions, setLinePlotOptions] = React.useState<IMultiCheckboxOption[]>([{ Value: 0, Text: "Minimum", Selected: true }, { Value: 1, Text: "Maximum", Selected: true }, { Value: 2, Text: "Average/Values", Selected: true }]);

    const [trendChannels, setTrendChannels] = React.useState<SEBrowser.ITrendChannel[]>([]);
    const [selectedSet, setSelectedSet] = React.useState<Set<number>>(new Set<number>());
    const [tableHeight, setTableHeight] = React.useState<number>(100);

    // Button Consts
    const [hover, setHover] = React.useState<'None'|'Show'|'Hide'|'Cog'|'Single-Line'|'Multi-Line'>('None');

    const momentDateFormat = "MM/DD/YYYY";
    const baseTimeFilter = { date: moment.utc().format(momentDateFormat), time: '12:00:00.000', windowSize: 12, timeWindowUnits: 3 }

    // Page effects
    React.useLayoutEffect(() => {
        props.SetHeight(navRef?.current?.offsetHeight ?? 0);
        const timeHeight = timeRef?.current?.offsetHeight ?? 0;
        const filtHeight = filtRef?.current?.offsetHeight ?? 0;
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
            dispatch(PhaseSlice.DBSearch({ filter: [], sortField: "Name", ascending: true }));
    }, [phaseStatus]);

    React.useEffect(() => {
        if (channelGroupStatus == 'changed' || channelGroupStatus == 'unintiated')
            dispatch(ChannelGroupSlice.DBSearch({ filter: [], sortField: "Name", ascending: true }));
    }, [channelGroupStatus]);

    React.useEffect(() => {
        if (trendFilter === null) return;
        // Get the data from the filter
        const handle = GetTrendChannels();
        return () => {
            if (handle != null && handle.abort != null) handle.abort();
        };
    }, [trendFilter]);

    React.useEffect(() => {
        // Todo: get filters from memory
        if (trendFilter !== null || channelGroupStatus !== 'idle' || phaseStatus !== 'idle') return;
        setTrendFilter({
            Phases: makeKeyValuePairs(allPhases, new Set(["AB", "BC", "CA"])),
            ChannelGroups: makeKeyValuePairs(allChannelGroups, new Set(["Voltage"])),
            MeterList: [],
            AssetList: []
        });
        setTimeFilter(baseTimeFilter);
    }, [channelGroupStatus, phaseStatus]);

    function makeKeyValuePairs(allKeys: { ID: number, Name: string, Description: string }[], defaultTrueSet?: Set<string>): IKeyValuePair[] {
        if (allKeys == null) return [];
        return allKeys.map(key => ({ Key: key.Name, Value: defaultTrueSet?.has(key.Name) ?? false }));
    }

    function makeMultiCheckboxOptions(keyValues: IKeyValuePair[], setOptions: (options: IMultiCheckboxOption[]) => void, allKeys: { ID: number, Name: string, Description: string }[]) {
        if (allKeys == null || keyValues == null) return;
        const newOptions: IMultiCheckboxOption[] = [];
        allKeys.forEach((key, index) => newOptions.push({ Value: index, Text: key.Name, Selected: keyValues.find(e => e.Key === key.Name)?.Value ?? false }));
        setOptions(newOptions);
    }

    function multiCheckboxUpdate(filterField: keyof ITrendDataFilter, newOptions: IMultiCheckboxOption[], oldOptions: IMultiCheckboxOption[], setOptions: (options: IMultiCheckboxOption[]) => void) {
        const options: IMultiCheckboxOption[] = [];
        const pairs: IKeyValuePair[] = [];
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
        const handle = $.ajax({
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
            const ordered = _.orderBy(d.filter(item => item.Searchable).map(item => (
                { label: `[AF${item.ExternalDB != undefined ? " " + item.ExternalDB : ''}] ${item.FieldName}`, key: item.FieldName, ...ConvertType(item.Type), isPivotField: true } as Search.IField<SystemCenter.Types.DetailedMeter>
            )), ['label'], ["asc"]);
            setFields(ordered)
        });

        return () => {
            if (handle != null && handle.abort == null) handle.abort();
        };
    }

    function getAdditionalAssetFields(setFields) {
        const handle = $.ajax({
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
            const ordered = _.orderBy(d.filter(item => item.Searchable).map(item => (
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
                    <button type="button" className={`btn btn-primary btn-sm`} onClick={() => props.ToggleVis()}
                        data-tooltip='Show' onMouseEnter={() => setHover('Show')} onMouseLeave={() => setHover('None')}>
                        <span>{SVGIcons.ArrowDropDown}</span>
                    </button>
                    <ToolTip Show={hover === 'Show'} Position={'left'} Theme={'dark'} Target={"Show"}>
                        Shows Navbar
                    </ToolTip>
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
                        <fieldset className="border" style={{ padding: '10px' }}>
                            <legend className="w-auto" style={{ fontSize: 'large' }}>Channel Filters:</legend>
                            <div className={"row"}>
                                <div className={'col'}>
                                    <NavbarFilterButton<SystemCenter.Types.DetailedMeter> Type={'Meter'} OnClick={() => setShowFilter('Meter')} Data={trendFilter.MeterList} AlternateColors={{ normal: "#3840B5", selected: "#FF9B4B" }} />
                                </div>
                            </div>
                            <div className={"row"}>
                                <div className={'col'}>
                                    <NavbarFilterButton<SystemCenter.Types.DetailedAsset> Type={'Asset'} OnClick={() => setShowFilter('Asset')} Data={trendFilter.AssetList} />
                                </div>
                            </div>
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
                                            const options: IMultiCheckboxOption[] = [];
                                            linePlotOptions.forEach(item => {
                                                const selected: boolean = item.Selected != (newOptions.findIndex(option => item.Value === option.Value) > -1);
                                                options.push({ ...item, Selected: selected });
                                            })
                                            setLinePlotOptions(options);
                                        }}
                                    />
                                </div>
                            </div>
                        </fieldset>
                    </li>
                    <li className="nav-item" style={{ width: '55%', paddingRight: 10, height: tableHeight }}>
                        <TrendChannelTable Height={tableHeight} TrendChannels={trendChannels} Type='multi' SelectedSet={selectedSet} SetSelectedSet={setSelectedSet} EnableDragDrop={true} />
                    </li>
                </ul>
                <div className="btn-group-vertical float-right">
                    <button type="button" style={{ marginBottom: 5 }} className={`btn btn-primary btn-sm`} onClick={() => props.ToggleVis()}
                        data-tooltip='Hide' onMouseEnter={() => setHover('Hide')} onMouseLeave={() => setHover('None')}>
                        <span>{SVGIcons.ArrowDropUp}</span>
                    </button>
                    <ToolTip Show={hover === 'Hide'} Position={'left'} Theme={'dark'} Target={"Hide"}>
                        Hides Navbar
                    </ToolTip>
                    <button type="button" style={{ marginBottom: 5 }} className={`btn btn-primary btn-sm  ${props.DisableAllSettings ? ' disabled' : ''}`}
                        onClick={() => { if (!props.DisableAllSettings) props.SetShowAllSettings(true); } }
                        data-tooltip='Cog' onMouseEnter={() => setHover('Cog')} onMouseLeave={() => setHover('None')}>
                        <span>{SVGIcons.Settings}</span>
                    </button>
                    <ToolTip Show={hover === 'Cog'} Position={'left'} Theme={'dark'} Target={"Cog"}>
                        {<p>Changes Settings for All Plots</p>}
                        {props.DisableAllSettings ? <p>{CrossMark} {'Action Requires Plots to Exist'}</p> : null}
                    </ToolTip>
                    <button type="button" style={{ marginBottom: 5 }} className={`btn btn-primary btn-sm ${selectedSet.size === 0 ? ' disabled' : ''}`}
                        data-tooltip='Single-Line' onMouseEnter={() => setHover('Single-Line')} onMouseLeave={() => setHover('None')}
                        onClick={() => {
                            if (selectedSet.size === 0) return;
                            const selectedChannels = trendChannels.filter(chan => selectedSet.has(chan.ID));
                            props.AddNewCharts([{
                                TimeFilter: timeFilter, Type: 'Line', Channels: selectedChannels, ID: CreateGuid(), Height: 50, Width: 50,
                                PlotFilter: linePlotOptions, Title: `${selectedChannels.length} Channel Line Plot`
                            }]);
                        }}>
                        <span>{SVGIcons.Document}</span>
                    </button>
                    <ToolTip Show={hover === 'Single-Line'} Position={'left'} Theme={'dark'} Target={"Single-Line"}>
                        {<p>Add All Selected Channels to Line Plot</p>}
                        {selectedSet.size === 0 ? <p>{CrossMark} {'Action Requires Channels to be Selected'}</p> : null}
                    </ToolTip>
                    <button type="button" style={{ marginBottom: 5 }} className={`btn btn-primary btn-sm ${selectedSet.size === 0 ? ' disabled' : ''}`}
                        data-tooltip='Multi-Line' onMouseEnter={() => setHover('Multi-Line')} onMouseLeave={() => setHover('None')}
                        onClick={() => {
                            if (selectedSet.size === 0) return;
                            const selectedChannels: SEBrowser.ITrendChannel[] = trendChannels.filter(chan => selectedSet.has(chan.ID));
                            const meterPlotChannels: SEBrowser.ITrendChannel[][] = [];
                            selectedChannels.forEach(channel => {
                                const listIndex = meterPlotChannels.findIndex(channelList => channelList[0].MeterKey === channel.MeterKey);
                                let newList: SEBrowser.ITrendChannel[];
                                if (listIndex > -1) {
                                    newList = meterPlotChannels[listIndex];
                                    newList.push(channel);
                                    meterPlotChannels[listIndex] = newList;
                                } else {
                                    newList = [channel];
                                    meterPlotChannels.push(newList);
                                }
                            });
                            props.AddNewCharts(
                                meterPlotChannels.map(channelList => {
                                    return ({
                                        TimeFilter: timeFilter, Type: 'Line', Channels: channelList, ID: CreateGuid(), Height: 50, Width: 50,
                                        PlotFilter: linePlotOptions, Title: `${channelList.length} Channel Line Plot`
                                    });
                                })
                            );
                        }}>
                        <span>{SVGIcons.Folder}</span>
                    </button>
                    <ToolTip Show={hover === 'Multi-Line'} Position={'left'} Theme={'dark'} Target={"Multi-Line"}>
                        {<p>Add All Selected Channels to Line Plots</p>}
                        {<p>Channels will be Seperated into Plots Based on Meter</p>}
                        {selectedSet.size === 0 ? <p>{CrossMark} {'Action Requires Channels to be Selected'}</p> : null}
                    </ToolTip>
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
                }}
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
                Title={"Select Meters to Display"}
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