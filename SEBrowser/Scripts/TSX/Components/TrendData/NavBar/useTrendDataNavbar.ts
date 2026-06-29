//******************************************************************************************************
//  useTrendDataNavbar.tsx - Gbtc
//
//  Copyright © 2026, Grid Protection Alliance.  All Rights Reserved.
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
//  06/23/26 - Preston Crawford
//       Generated original version of source code.
//
//******************************************************************************************************
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AssetController, MeterController, PhaseController, ChannelGroupController } from '../../../Store/ControllerFunctions';
import { SEBrowser, TrendSearch, IMultiCheckboxOption } from '../../../global';
import { Application, OpenXDA, SystemCenter } from '@gpa-gemstone/application-typings';
import queryString from 'querystring';
import { IKeyValuePair, ITrendDataFilter } from './Types';

interface IProps {
    TimeFilter: SEBrowser.IReportTimeFilter,
    LinePlot: IMultiCheckboxOption[],
}

interface IQuery {
    phaseIds?: Set<number>,
    groupIds?: Set<number>,
    assetIds?: Set<number>,
    meterIds?: Set<number>
}

/**
 * Manages Trend Data navbar filters, channel data, URL synchronization, and multi-checkbox options.
 */
export const useTrendDataNavbar = (props: IProps) => {
    const location = useLocation();
    const navigate = useNavigate();

    const [phaseStatus, setPhaseStatus] = React.useState<Application.Types.Status>('uninitiated');
    const [allPhases, setAllPhases] = React.useState<OpenXDA.Types.Phase[]>([]);

    const [channelGroupStatus, setChannelGroupStatus] = React.useState<Application.Types.Status>('uninitiated');
    const [allChannelGroups, setAllChannelGroups] = React.useState<TrendSearch.ChannelGroup[]>([]);

    const [meterStatus, setMeterStatus] = React.useState<Application.Types.Status>('uninitiated');
    const [allMeters, setAllMeters] = React.useState<SystemCenter.Types.DetailedMeter[]>([]);

    const [assetStatus, setAssetStatus] = React.useState<Application.Types.Status>('uninitiated');
    const [allAssets, setAllAssets] = React.useState<SystemCenter.Types.DetailedAsset[]>([]);

    const [timeFilter, setTimeFilter] = React.useState<SEBrowser.IReportTimeFilter>(props.TimeFilter);

    const [trendFilter, setTrendFilter] = React.useState<ITrendDataFilter | null>(null);
    const [phaseOptions, setPhaseOptions] = React.useState<IMultiCheckboxOption[]>([]);
    const [channelGroupOptions, setChannelGroupOptions] = React.useState<IMultiCheckboxOption[]>([]);
    const [linePlotOptions, setLinePlotOptions] = React.useState<IMultiCheckboxOption[]>(props.LinePlot);

    const [trendChannels, setTrendChannels] = React.useState<TrendSearch.ITrendChannel[]>([]);
    const [trendChannelStatus, setTrendChannelStatus] = React.useState<Application.Types.Status>('uninitiated');
    const [selectedSet, setSelectedSet] = React.useState<Set<string>>(new Set<string>());

    const queryRef = React.useRef<IQuery>({});
    const [queryReady, setQueryReady] = React.useState<boolean>(false);

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

        const query = queryString.parse(location.search.replace("?", ""), "&", "=");
        setTimeFilter({
            windowSize: query['windowSize'] != null ? parseInt(query['windowSize'].toString()) : props.TimeFilter.windowSize,
            timeWindowUnits: query['timeWindowUnits'] != null ? parseInt(query['timeWindowUnits'].toString()) : props.TimeFilter.timeWindowUnits,
            time: query['time'] != null ? query['time'].toString() : props.TimeFilter.time,
            date: query['date'] != null ? query['date'].toString() : props.TimeFilter.date
        });

        if (query['phases'] != null) queryRef.current.phaseIds = parseArrayIntoSet(query['phases'].toString());
        if (query['groups'] != null) queryRef.current.groupIds = parseArrayIntoSet(query['groups'].toString());
        if (query['meters'] != null) queryRef.current.meterIds = parseArrayIntoSet(query['meters'].toString());
        if (query['assets'] != null) queryRef.current.assetIds = parseArrayIntoSet(query['assets'].toString());

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

    // Manual fetches using the shared read-only controllers
    React.useEffect(() => {
        setPhaseStatus('loading');
        const handle = PhaseController.GetAll('Name', true)
            .done((data) => { setAllPhases(data); setPhaseStatus('idle'); })
            .fail(() => setPhaseStatus('error'));
        return () => { if (handle?.abort != null) handle.abort(); };
    }, []);

    React.useEffect(() => {
        setChannelGroupStatus('loading');
        const handle = ChannelGroupController.GetAll('Name', true)
            .done((data) => { setAllChannelGroups(data); setChannelGroupStatus('idle'); })
            .fail(() => setChannelGroupStatus('error'));
        return () => { if (handle?.abort != null) handle.abort(); };
    }, []);

    React.useEffect(() => {
        setMeterStatus('loading');
        const handle = MeterController.GetAll('Name', true)
            .done((data) => { setAllMeters(data); setMeterStatus('idle'); })
            .fail(() => setMeterStatus('error'));
        return () => { if (handle?.abort != null) handle.abort(); };
    }, []);

    React.useEffect(() => {
        setAssetStatus('loading');
        const handle = AssetController.GetAll('AssetName', true)
            .done((data) => { setAllAssets(data); setAssetStatus('idle'); })
            .fail(() => setAssetStatus('error'));
        return () => { if (handle?.abort != null) handle.abort(); };
    }, []);

    React.useEffect(() => {
        if (trendFilter === null) return;
        // Get the data from the filter
        setTrendChannelStatus('loading');
        const handle = getTrendSearchData(trendFilter)
            .done((data: TrendSearch.ITrendChannel[]) => {
                setTrendChannels(data);
                setSelectedSet(new Set<string>());
                setTrendChannelStatus('idle');
            })
            .fail(() => setTrendChannelStatus('error'));
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

        function SetParamArrayKeyVal(field: string, options?: IKeyValuePair[]): string | undefined {
            if (options == null) return;
            const optionsSelected = options.filter(opt => opt[Object.keys(opt)[0]]);
            if (optionsSelected.length === 0) return;
            queryParams[field] = `[${optionsSelected.map(opt => Object.keys(opt)[0]).join(',')}]`;
        }

        function SetParamArrayFilter(field: string, selected?: { ID: number }[]): string | undefined {
            if (selected == null || selected.length === 0) return;
            queryParams[field] = `[${selected.map(select => select.ID).join(',')}]`;
        }

        SetParamArrayFilter('assets', trendFilter?.AssetList);
        SetParamArrayFilter('meters', trendFilter?.MeterList);
        SetParamArrayKeyVal('phases', trendFilter?.Phases);
        SetParamArrayKeyVal('groups', trendFilter?.ChannelGroups);

        const q = queryString.stringify(queryParams, "&", "=");
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
            if (allKeys == null)
                return [];

            if (startingTrueSet == null)
                return allKeys.map(key => ({ [key.ID]: fallBackTrueSet.has(key.Name) }));

            return allKeys.map(key => ({ [key.ID]: startingTrueSet.has(key.ID) }));
        }

        setTrendFilter({
            Phases: makeKeyValuePairs(allPhases, queryRef.current.phaseIds, new Set(["AB", "BC", "CA"])),
            ChannelGroups: makeKeyValuePairs(allChannelGroups, queryRef.current.groupIds, new Set(["Voltage"])),
            MeterList: queryRef.current.meterIds == null ? [] : allMeters.filter(meter => queryRef.current.meterIds?.has(meter.ID)),
            AssetList: queryRef.current.assetIds == null ? [] : allAssets.filter(asset => queryRef.current.assetIds?.has(asset.ID))
        });
    }, [channelGroupStatus, phaseStatus, meterStatus, assetStatus, queryReady]);

    function makeMultiCheckboxOptions(keyValues: IKeyValuePair[] | undefined, setOptions: (options: IMultiCheckboxOption[]) => void, allKeys: { ID: number, Name: string, Description: string }[]) {
        if (allKeys == null || keyValues == null) return;
        const newOptions: IMultiCheckboxOption[] = [];
        allKeys.forEach((key) => newOptions.push({ Value: key.ID, Label: key.Name, Selected: keyValues?.find(e => e[key.ID] != null)?.[key.ID] ?? false }));
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
        setTrendFilter(prev => prev != null ? { ...prev, [filterField]: pairs } : null);
    }

    return {
        trendFilter,
        setTrendFilter,
        timeFilter,
        setTimeFilter,
        phaseStatus,
        channelGroupStatus,
        trendChannels,
        trendChannelStatus,
        setTrendChannels,
        selectedSet,
        setSelectedSet,
        phaseOptions,
        setPhaseOptions,
        channelGroupOptions,
        setChannelGroupOptions,
        linePlotOptions,
        setLinePlotOptions,
        multiCheckboxUpdate
    };
}

const getTrendSearchData = (trendFilter): JQuery.jqXHR<TrendSearch.ITrendChannel[]> => {
    return $.ajax({
        type: "POST",
        url: `${homePath}api/OpenXDA/GetTrendSearchData`,
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(trendFilter),
        dataType: 'json',
        cache: true,
        async: true
    });
}
