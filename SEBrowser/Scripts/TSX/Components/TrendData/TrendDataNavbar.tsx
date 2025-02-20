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
import { useAppDispatch, useAppSelector } from '../../hooks';
import { useLocation, useNavigate } from 'react-router-dom';
import { AssetSlice, MeterSlice, PhaseSlice, ChannelGroupSlice } from '../../Store';
import { SEBrowser, TrendSearch, IMultiCheckboxOption } from '../../Global';
import { SystemCenter } from '@gpa-gemstone/application-typings';
import { MultiCheckBoxSelect } from '@gpa-gemstone/react-forms';
import { DefaultSelects } from '@gpa-gemstone/common-pages';
import { Search, ToolTip } from '@gpa-gemstone/react-interactive';
import { CrossMark, SVGIcons } from '@gpa-gemstone/gpa-symbols';
import { Column } from '@gpa-gemstone/react-table';
import { CreateGuid } from '@gpa-gemstone/helper-functions';
import ReportTimeFilter from '../ReportTimeFilter';
import NavbarFilterButton from '../Common/NavbarFilterButton';
import TrendChannelTable from './Components/TrendChannelTable';
import html2canvas from 'html2canvas';
import jspdf from 'jspdf';
import queryString from 'querystring';

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

interface IKeyValuePair {
    [key: string]: boolean
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
    const location = useLocation();
    const navigate = useNavigate();

    const phaseStatus = useAppSelector(PhaseSlice.SearchStatus);
    const allPhases = useAppSelector(PhaseSlice.SearchResults);

    const channelGroupStatus = useAppSelector(ChannelGroupSlice.SearchStatus);
    const allChannelGroups = useAppSelector(ChannelGroupSlice.SearchResults);

    const meterStatus = useAppSelector(MeterSlice.Status);
    const allMeters = useAppSelector(MeterSlice.Data);

    const assetStatus = useAppSelector(AssetSlice.Status);
    const allAssets = useAppSelector(AssetSlice.Data);

    const [showFilter, setShowFilter] = React.useState<('None' | 'Meter' | 'Asset')>('None');

    const [timeFilter, setTimeFilter] = React.useState<SEBrowser.IReportTimeFilter>(props.TimeFilter);

    const [trendFilter, setTrendFilter] = React.useState<ITrendDataFilter>(null);
    const [phaseOptions, setPhaseOptions] = React.useState<IMultiCheckboxOption[]>([]);
    const [channelGroupOptions, setChannelGroupOptions] = React.useState<IMultiCheckboxOption[]>([]);
    const [linePlotOptions, setLinePlotOptions] = React.useState<IMultiCheckboxOption[]>(props.LinePlot);

    const [trendChannels, setTrendChannels] = React.useState<TrendSearch.ITrendChannel[]>([]);
    const [selectedSet, setSelectedSet] = React.useState<Set<number>>(new Set<number>());
    const [tableHeight, setTableHeight] = React.useState<number>(100);

    const queryRef = React.useRef<{ phaseIds: Set<number>, groupIds: Set<number>, assetIds: Set<number>, meterIds: Set<number> }>({ phaseIds: undefined, groupIds: undefined, assetIds: undefined, meterIds: undefined})
    const [queryReady, setQueryReady] = React.useState<boolean>(false);

    // Button Consts
    const [hover, setHover] = React.useState < 'None' | 'Show' | 'Hide' | 'Cog' | 'Single-Line' | 'Multi-Line' | 'Group-Line' | 'Cyclic' | 'Move' | 'Trash' | 'Select' | 'Capture' >('None');

    // Page effects
    React.useLayoutEffect(() => {
        const timeHeight = timeRef?.current?.offsetHeight ?? 0;
        const filtHeight = filtRef?.current?.offsetHeight ?? 0;
        setTableHeight(timeHeight > filtRef ? timeHeight : filtHeight);
    });

    // Parsing URL Params
    React.useEffect(() => {
        function parseArrayIntoSet(array: string): Set<number> {
            const returnSet = new Set<number>();
            array.substring(1, array.length - 1).split(',').forEach(strId => {
                const id = parseInt(strId);
                if (!isNaN(id)) returnSet.add(id);
            });
            return returnSet;
        }

        const query = queryString.parse(location.search.replace("?", ""), "&", "=", { decodeURIComponent: queryString.unescape });
        setTimeFilter({
            windowSize: query['windowSize'] !== undefined ? parseInt(query['windowSize'].toString()) : props.TimeFilter.windowSize,
            timeWindowUnits: query['timeWindowUnits'] !== undefined ? parseInt(query['timeWindowUnits'].toString()) : props.TimeFilter.timeWindowUnits,
            time: query['time'] !== undefined ? query['time'].toString() : props.TimeFilter.time,
            date: query['date'] !== undefined ? query['date'].toString() : props.TimeFilter.date
        });
        if (query['phases'] !== undefined) queryRef.current.phaseIds = parseArrayIntoSet(query['phases'].toString());
        if (query['groups'] !== undefined) queryRef.current.groupIds = parseArrayIntoSet(query['groups'].toString());
        if (query['meters'] !== undefined) queryRef.current.meterIds = parseArrayIntoSet(query['meters'].toString());
        if (query['assets'] !== undefined) queryRef.current.assetIds = parseArrayIntoSet(query['assets'].toString());

        setQueryReady(true);
    }, []);

    // Multicheckbox Options Updates
    React.useEffect(() => {
        makeMultiCheckboxOptions(trendFilter?.Phases, setPhaseOptions, allPhases);
    }, [allPhases, trendFilter]);

    React.useEffect(() => {
        makeMultiCheckboxOptions(trendFilter?.ChannelGroups, setChannelGroupOptions, allChannelGroups);
    }, [allChannelGroups, trendFilter]);

    // Update Default Values
    React.useEffect(() => {
        setLinePlotOptions(props.LinePlot);
    }, [props.LinePlot]);

    React.useEffect(() => {
        if (queryReady) setTimeFilter(props.TimeFilter);
    }, [props.TimeFilter]);

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
        if (meterStatus == 'changed' || meterStatus == 'unintiated')
            dispatch(MeterSlice.Fetch());
    }, [meterStatus]);

    React.useEffect(() => {
        if (assetStatus == 'changed' || assetStatus == 'unintiated')
            dispatch(AssetSlice.Fetch());
    }, [assetStatus]);

    React.useEffect(() => {
        if (trendFilter === null) return;
        // Get the data from the filter
        const handle = GetTrendChannels();
        return () => {
            if (handle != null && handle.abort != null) handle.abort();
        };
    }, [trendFilter]);

    React.useEffect(() => {
        const queryParams = {};
        queryParams['time'] = timeFilter.time;
        queryParams['date'] = timeFilter.date;
        queryParams['windowSize'] = timeFilter.windowSize;
        queryParams['timeWindowUnits'] = timeFilter.timeWindowUnits;

        function SetParamArrayKeyVal(field: string, options?: IKeyValuePair[]): string {
            if (options == null) return;
            const optionsSelected = options.filter(opt => opt[Object.keys(opt)[0]]);
            if (optionsSelected.length === 0) return;
            queryParams[field] = `[${optionsSelected.map(opt => Object.keys(opt)[0]).join(',')}]`;
        }
        function SetParamArrayFilter(field: string, selected?: { ID: number }[]): string {
            if (selected == null || selected.length === 0) return;
            queryParams[field] = `[${selected.map(select => select.ID).join(',')}]`;
        }

        SetParamArrayFilter('assets', trendFilter?.AssetList);
        SetParamArrayFilter('meters', trendFilter?.MeterList);
        SetParamArrayKeyVal('phases', trendFilter?.Phases);
        SetParamArrayKeyVal('groups', trendFilter?.ChannelGroups);

        const q = queryString.stringify(queryParams, "&", "=", { encodeURIComponent: queryString.escape });
        const handle = setTimeout(() => navigate(location.pathname + '?' + q), 500);
        return (() => { clearTimeout(handle); })
    }, [trendFilter, timeFilter]);

    React.useEffect(() => {
        // Todo: get filters from memory
        if (trendFilter !== null ||
            channelGroupStatus !== 'idle' || phaseStatus !== 'idle' || meterStatus !== 'idle' || assetStatus !== 'idle' ||
            !queryReady) return;

        // Note: the different arguements of startingArray and fallBack need different types since we don't know Id's at compile time and don't know names at query parse time
        function makeKeyValuePairs(allKeys: { ID: number, Name: string, Description: string }[], startingTrueSet: Set<number> | undefined, fallBackTrueSet: Set<string>): IKeyValuePair[] {
            if (allKeys == null) return [];
            if (startingTrueSet == null) return allKeys.map(key => ({ [key.ID]: fallBackTrueSet.has(key.Name) }));
            return allKeys.map(key => ({ [key.ID]: startingTrueSet.has(key.ID) }));
        }

        setTrendFilter({
            Phases: makeKeyValuePairs(allPhases, queryRef.current.phaseIds, new Set(["AB", "BC", "CA"])),
            ChannelGroups: makeKeyValuePairs(allChannelGroups, queryRef.current.groupIds, new Set(["Voltage"])),
            MeterList: queryRef.current.meterIds == null ? [] : allMeters.filter(meter => queryRef.current.meterIds.has(meter.ID)),
            AssetList: queryRef.current.assetIds == null ? [] : allAssets?.filter(asset => queryRef.current.assetIds.has(asset.ID)) ?? []
        });
    }, [channelGroupStatus, phaseStatus, meterStatus, assetStatus, queryReady]);

    function makeMultiCheckboxOptions(keyValues: IKeyValuePair[], setOptions: (options: IMultiCheckboxOption[]) => void, allKeys: { ID: number, Name: string, Description: string }[]) {
        if (allKeys == null || keyValues == null) return;
        const newOptions: IMultiCheckboxOption[] = [];
        allKeys.forEach((key) => newOptions.push({ Value: key.ID, Text: key.Name, Selected: keyValues.find(e => e[key.ID] !== undefined)[key.ID] ?? false }));
        setOptions(newOptions);
    }

    function multiCheckboxUpdate(filterField: keyof ITrendDataFilter, newOptions: IMultiCheckboxOption[], oldOptions: IMultiCheckboxOption[], setOptions: (options: IMultiCheckboxOption[]) => void) {
        const options: IMultiCheckboxOption[] = [];
        const pairs: IKeyValuePair[] = [];
        oldOptions.forEach(item => {
            const selected: boolean = item.Selected != (newOptions.findIndex(option => item.Value === option.Value) > -1);
            options.push({ ...item, Selected: selected });
            pairs.push({ [item.Value]: selected });
        });
        setOptions(options);
        setTrendFilter({ ...trendFilter, [filterField]: pairs });
    }

    function GetTrendChannels(): JQuery.jqXHR<TrendSearch.ITrendChannel[]> {
        return $.ajax({
            type: "POST",
            url: `${homePath}api/OpenXDA/GetTrendSearchData`,
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(trendFilter),
            dataType: 'json',
            cache: true,
            async: true
        }).done((data: TrendSearch.ITrendChannel[]) => {
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

        handle.done((d: Array<SystemCenter.Types.AdditionalFieldView>) => {
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

        handle.done((d: Array<SystemCenter.Types.AdditionalFieldView>) => {
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
                    <ToolTip Show={hover === 'Show'} Position={'left'} Target={"Show"}>
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
                            <label style={{ width: '100%', position: 'relative', float: "left" }}>Phase: </label>
                            <div className="row">
                                <div className={"col"}>
                                    <MultiCheckBoxSelect
                                        ItemTooltip={'dark'}
                                        Options={phaseOptions}
                                        Label={''}
                                        OnChange={(evt, Options: IMultiCheckboxOption[]) => multiCheckboxUpdate("Phases", Options, phaseOptions, setPhaseOptions)}
                                    />
                                </div>
                            </div>
                            <label style={{ width: '100%', position: 'relative', float: "left" }}>Channel Group: </label>
                            <div className="row">
                                <div className={"col"}>
                                    <MultiCheckBoxSelect
                                        ItemTooltip={'dark'}
                                        Options={channelGroupOptions}
                                        Label={''}
                                        OnChange={(evt, Options: IMultiCheckboxOption[]) => multiCheckboxUpdate("ChannelGroups", Options, channelGroupOptions, setChannelGroupOptions)}
                                    />
                                </div>
                            </div>
                            <label style={{ width: '100%', position: 'relative', float: "left" }}>Series Plotted: </label>
                            <div className="row">
                                <div className={"col"}>
                                    <MultiCheckBoxSelect
                                        ItemTooltip={'dark'}
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
                    <li className="nav-item d-flex" style={{ width: '55%', paddingRight: 10, height: tableHeight }}>
                        <TrendChannelTable Height={tableHeight} SetTrendChannels={setTrendChannels} TrendChannels={trendChannels}
                            Type='multi' SelectedSet={selectedSet} SetSelectedSet={setSelectedSet} EnableDragDrop={!props.Movable} />
                    </li>
                </ul>
                <div className="btn-group-vertical float-right" style={{paddingRight: '6px'}}>
                    <button type="button" style={{ marginBottom: 5 }} className={`btn btn-primary btn-sm`} onClick={() => props.ToggleVis()}
                        data-tooltip='Hide' onMouseEnter={() => setHover('Hide')} onMouseLeave={() => setHover('None')}>
                        <span>{SVGIcons.ArrowDropUp}</span>
                    </button>
                    <ToolTip Show={hover === 'Hide'} Position={'left'} Target={"Hide"}>
                        Hides Navbar
                    </ToolTip>
                    <button type="button" style={{ marginBottom: 5 }} className={`btn btn-primary btn-sm`}
                        onClick={() => { props.SetShowAllSettings(true); } }
                        data-tooltip='Cog' onMouseEnter={() => setHover('Cog')} onMouseLeave={() => setHover('None')}>
                        <span>{SVGIcons.Settings}</span>
                    </button>
                    <ToolTip Show={hover === 'Cog'} Position={'left'} Target={"Cog"}>
                        {<p>Settings for All Current and/or Future Plots</p>}
                    </ToolTip>
                    <button type="button" style={{ marginBottom: 5 }} className={`btn btn-${props.Movable ? 'Warning' : 'primary'} btn-sm${props.PlotIds.length === 0 ? ' disabled' : ''}`}
                        onClick={() => { if (props.PlotIds.length !== 0) props.SetMovable(!props.Movable); }}
                        data-tooltip='Move' onMouseEnter={() => setHover('Move')} onMouseLeave={() => setHover('None')}>
                        <span>{SVGIcons.DataContainer}</span>
                    </button>
                    <ToolTip Show={hover === 'Move'} Position={'left'} Target={"Move"}>
                        {<p>Drag-and-Drop Reorder Plots</p>}
                        {props.PlotIds.length === 0 ? <p>{CrossMark} {'Requires an Active Plot'}</p> : null}
                    </ToolTip>
                    <button type="button" style={{ marginBottom: 5 }} className={`btn btn-primary btn-sm${trendChannels.length === 0 ? ' disabled' : ''}`}
                        onClick={() => {
                            if (trendChannels.length !== 0) {
                                const newSet = new Set<number>();
                                trendChannels.forEach(chan => newSet.add(chan.ID));
                                setSelectedSet(newSet);
                            }
                        }}
                        data-tooltip='Select' onMouseEnter={() => setHover('Select')} onMouseLeave={() => setHover('None')}>
                        <span>{SVGIcons.Alert}</span>
                    </button>
                    <ToolTip Show={hover === 'Select'} Position={'left'} Target={"Select"}>
                        {<p>Select All Channels in Table</p>}
                        {(trendChannels.length === 0) ? <p>{CrossMark} {'Table has no Channels to Select'}</p> : null}
                    </ToolTip>
                    <button type="button" style={{ marginBottom: 5 }} className={`btn btn-${props.Movable ? 'Warning' : 'primary'} btn-sm${props.PlotIds.length === 0 ? ' disabled' : ''}`}
                        onClick={() => {
                            if (props.PlotIds.length !== 0) {
                                const allImgData = Array<string>(props.PlotIds.length);
                                const handles = props.PlotIds.map((plot, index) => {
                                    const element = document.getElementById(plot.ID);
                                    if (element == null) {
                                        console.error(`Could not find document element with id ${plot.ID}`);
                                    } else {
                                        return html2canvas(element).then((canvas) => {
                                            const imgData = canvas.toDataURL("image/png")
                                                .replace("image/png", "image/octet-stream");
                                            allImgData[index] = imgData;
                                            Promise.resolve(imgData);
                                        });
                                    }
                                });
                                Promise.all(handles).then(() => {
                                    const pdf = new jspdf("l", "mm", "a4");
                                    const pdfPageHeight = pdf.internal.pageSize.getHeight();
                                    const pdfPageWidth = pdf.internal.pageSize.getWidth();
                                    let widthLeft = pdfPageWidth;
                                    let heightLeft = pdfPageHeight;
                                    let biggestRowHeight = 0;
                                    allImgData.forEach((imgData, ind) => {
                                        const plot = props.PlotIds[ind];
                                        const imgWidth = pdfPageWidth * plot.Width / 100;
                                        const imgProps = pdf.getImageProperties(imgData);
                                        const imgHeight = imgProps.height * imgWidth / imgProps.width;
                                        if (widthLeft - imgWidth < 0) {
                                            widthLeft = pdfPageWidth;
                                            heightLeft -= biggestRowHeight;
                                            biggestRowHeight = 0;
                                            if (heightLeft - imgHeight < 0) {
                                                pdf.addPage();
                                                heightLeft = pdfPageHeight;
                                            }
                                        }
                                        const currentHeight = pdfPageHeight - heightLeft;
                                        const currentWidth = pdfPageWidth - widthLeft;
                                        pdf.addImage(imgData, "PNG", currentWidth, currentHeight, imgWidth, imgHeight);
                                        widthLeft -= imgWidth;
                                        biggestRowHeight = Math.max(imgHeight, biggestRowHeight);
                                        window.URL.revokeObjectURL(imgData);
                                    });
                                    pdf.save('AllTrendPlots.pdf');
                                });
                            }
                        }}
                        data-tooltip='Capture' onMouseEnter={() => setHover('Capture')} onMouseLeave={() => setHover('None')}>
                        <span>{SVGIcons.Folder}</span>
                    </button>
                    <ToolTip Show={hover === 'Capture'} Position={'left'} Target={"Capture"}>
                        {<p>Save All Plots to PDF</p>}
                        {props.PlotIds.length === 0 ? <p>{CrossMark} {'Requires an Active Plot'}</p> : null}
                    </ToolTip>
                </div>
                <div className="btn-group-vertical float-right">
                    <button type="button" style={{ marginBottom: 5 }} className={`btn btn-primary btn-sm${props.PlotIds.length === 0 ? ' disabled' : ''}`}
                        onClick={() => { if (props.PlotIds.length !== 0) props.RemoveAllCharts(); }}
                        data-tooltip='Trash' onMouseEnter={() => setHover('Trash')} onMouseLeave={() => setHover('None')}>
                        <span>{SVGIcons.TrashCan}</span>
                    </button>
                    <ToolTip Show={hover === 'Trash'} Position={'left'} Target={"Trash"}>
                        {<p>Remove All Plots</p>}
                        {props.PlotIds.length === 0 ? <p>{CrossMark} {'Requires an Active Plot'}</p> : null}
                    </ToolTip>
                    <button type="button" style={{ marginBottom: 5 }} className={`btn btn-primary btn-sm${selectedSet.size === 0 ? ' disabled' : ''}`}
                        data-tooltip='Single-Line' onMouseEnter={() => setHover('Single-Line')} onMouseLeave={() => setHover('None')}
                        onClick={() => {
                            if (selectedSet.size === 0) return;
                            const selectedChannels = trendChannels.filter(chan => selectedSet.has(chan.ID));
                            props.AddNewCharts([{
                                TimeFilter: timeFilter, Type: 'Line', Channels: selectedChannels, ID: CreateGuid(),
                                PlotFilter: linePlotOptions
                            }]);
                        }}>
                        <span>{SVGIcons.Document}</span>
                    </button>
                    <ToolTip Show={hover === 'Single-Line'} Position={'left'} Target={"Single-Line"}>
                        {<p>Add All Selected Channels to Single Plot</p>}
                        {selectedSet.size === 0 ? <p>{CrossMark} {'Requires a Selected Channel'}</p> : null}
                    </ToolTip>
                    <button type="button" style={{ marginBottom: 5 }} className={`btn btn-primary btn-sm${selectedSet.size === 0 ? ' disabled' : ''}`}
                        data-tooltip='Multi-Line' onMouseEnter={() => setHover('Multi-Line')} onMouseLeave={() => setHover('None')}
                        onClick={() => {
                            if (selectedSet.size === 0) return;
                            const selectedChannels: TrendSearch.ITrendChannel[] = trendChannels.filter(chan => selectedSet.has(chan.ID));
                            const meterPlotChannels: TrendSearch.ITrendChannel[][] = [];
                            selectedChannels.forEach(channel => {
                                const listIndex = meterPlotChannels.findIndex(channelList => channelList[0].MeterKey === channel.MeterKey);
                                if (listIndex > -1)
                                    meterPlotChannels[listIndex].push(channel);
                                else
                                    meterPlotChannels.push([channel]);
                            });
                            props.AddNewCharts(
                                meterPlotChannels.map(channelList => {
                                    return ({
                                        TimeFilter: timeFilter, Type: 'Line', Channels: channelList, ID: CreateGuid(),
                                        PlotFilter: linePlotOptions
                                    });
                                })
                            );
                        }}>
                        <span>{SVGIcons.House}</span>
                    </button>
                    <ToolTip Show={hover === 'Multi-Line'} Position={'left'} Target={"Multi-Line"}>
                        {<p>Add Selected Channels to New Plots Separated by Meter</p>}
                        {selectedSet.size === 0 ? <p>{CrossMark} Requires a Selected Channel </p> : null}
                    </ToolTip>
                    <button type="button" style={{ marginBottom: 5 }} className={`btn btn-primary btn-sm${selectedSet.size === 0 ? ' disabled' : ''}`}
                        data-tooltip='Group-Line' onMouseEnter={() => setHover('Group-Line')} onMouseLeave={() => setHover('None')}
                        onClick={() => {
                            if (selectedSet.size === 0) return;
                            const selectedChannels: TrendSearch.ITrendChannel[] = trendChannels.filter(chan => selectedSet.has(chan.ID));
                            const groupPlotChannels: TrendSearch.ITrendChannel[][] = [];
                            selectedChannels.forEach(channel => {
                                const listIndex = groupPlotChannels.findIndex(channelList => channelList[0].ChannelGroup === channel.ChannelGroup);
                                if (listIndex > -1)
                                    groupPlotChannels[listIndex].push(channel);
                                else
                                    groupPlotChannels.push([channel]);
                            });
                            props.AddNewCharts(
                                groupPlotChannels.map(channelList => {
                                    return ({
                                        TimeFilter: timeFilter, Type: 'Line', Channels: channelList, ID: CreateGuid(),
                                        PlotFilter: linePlotOptions
                                    });
                                })
                            );
                        }}>
                        <span>{SVGIcons.Filter}</span>
                    </button>
                    <ToolTip Show={hover === 'Group-Line'} Position={'left'} Target={"Group-Line"}>
                        {<p>Add Selected Channels to New Plots Separated by Channel Group</p>}
                        {selectedSet.size === 0 ? <p>{CrossMark} Requires a Selected Channel</p> : null}
                    </ToolTip>
                    <button type="button" style={{ marginBottom: 5 }} className={`btn btn-primary btn-sm ${selectedSet.size !== 1 ? ' disabled' : ''}`}
                        data-tooltip='Cyclic' onMouseEnter={() => setHover('Cyclic')} onMouseLeave={() => setHover('None')}
                        onClick={() => {
                            if (selectedSet.size !== 1) return;
                            const selectedChannels = trendChannels.filter(chan => selectedSet.has(chan.ID));
                            props.AddNewCharts([{
                                TimeFilter: timeFilter, Type: 'Cyclic', Channels: selectedChannels, ID: CreateGuid(),
                                PlotFilter: linePlotOptions
                            }]);
                        }}>
                        <span>{SVGIcons.Cube}</span>
                    </button>
                    <ToolTip Show={hover === 'Cyclic'} Position={'left'} Target={"Cyclic"}>
                        {<p>Add Selected Channel to New Cyclic Histogram Plot</p>}
                        {selectedSet.size !== 1 ? <p>{CrossMark} Requires a Single Channel Selection</p> : null}
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
                Slice={MeterSlice}
                Selection={trendFilter.MeterList}
                OnClose={(selected, conf) => {
                    setShowFilter('None');
                    if (conf)
                        setTrendFilter({ ...trendFilter, MeterList: selected });
                }}
                Show={showFilter == 'Meter'}
                Type={'multiple'}
                Title={"Select Meters to Display"}
                GetEnum={getEnum}
                GetAddlFields={getAdditionalMeterFields}
            >
                <Column<SystemCenter.Types.DetailedMeter>
                    Key="AssetKey" Field="AssetKey"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >Key</Column>
                <Column<SystemCenter.Types.DetailedMeter>
                    Key="Name" Field="Name"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >Name</Column>
                <Column<SystemCenter.Types.DetailedMeter>
                    Key="Location" Field="Location"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >Substation</Column>
                <Column<SystemCenter.Types.DetailedMeter>
                    Key="MappedAssets" Field="MappedAssets"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >Assets</Column>
                <Column<SystemCenter.Types.DetailedMeter>
                    Key="Make" Field="Make"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >Make</Column>
                <Column<SystemCenter.Types.DetailedMeter>
                    Key="Model" Field="Model"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >Model</Column>
            </DefaultSelects.Meter>
            <DefaultSelects.Asset
                Slice={AssetSlice}
                Selection={trendFilter.AssetList}
                OnClose={(selected, conf) => {
                    setShowFilter('None');
                    if (conf)
                        setTrendFilter({ ...trendFilter, AssetList: selected });
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
                >Key</Column>
                <Column<SystemCenter.Types.DetailedAsset>
                    Key="AssetName" Field="AssetName"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >Name</Column>
                <Column<SystemCenter.Types.DetailedAsset>
                    Key="AssetType" Field="AssetType"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >Asset Type</Column>
                <Column<SystemCenter.Types.DetailedAsset>
                    Key="VoltageKV" Field="VoltageKV"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >Voltage (kV)</Column>
                <Column<SystemCenter.Types.DetailedAsset>
                    Key="Meters" Field="Meters"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >Meters</Column>
                <Column<SystemCenter.Types.DetailedAsset>
                    Key="Locations" Field="Locations"
                    HeaderStyle={{ width: 'auto' }}
                    RowStyle={{ width: 'auto' }}
                >Substations</Column>
            </DefaultSelects.Asset>
        </>
    );
});

export default TrendSearchNavbar;