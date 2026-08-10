//******************************************************************************************************
//  OpenSEE.ts - Gbtc
//
//  Copyright © 2018, Grid Protection Alliance.  All Rights Reserved.
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
//  04/17/2018 - Billy Ernest
//       Generated original version of source code.
//  08/20/2019 - Christoph Lackner
//       Added Relay Performance.
//
//******************************************************************************************************
export type StandardAnalyticServiceFunction = (eventid: number, pixels: number, startDate?: string, endDate?: string) => JQuery.jqXHR
export type BarChartAnalyticServiceFunction = (eventid: number, startDate?: string, endDate?: string) => JQuery.jqXHR

export default class OpenSEEService{
    waveformVoltageDataHandle: JQuery.jqXHR;
    waveformCurrentDataHandle: JQuery.jqXHR;
    waveformTCEDataHandle: JQuery.jqXHR;
    relaystatisticsDataHandle: JQuery.jqXHR;
    frequencyDataHandle: JQuery.jqXHR ;
    faultDistanceDataHandle: JQuery.jqXHR ;
    breakerDigitalsDataHandle: JQuery.jqXHR ;
    headerDataHandle: JQuery.jqXHR ;
    scalarStatHandle: JQuery.jqXHR ;
    harmonicStatHandle: JQuery.jqXHR ;
    correlatedSagsHandle: JQuery.jqXHR ;
    noteHandle: JQuery.jqXHR ;
    lighteningDataHandle: JQuery.jqXHR;
    RelayPerformanceHandle: JQuery.jqXHR;
    relayTrendHandle: JQuery.jqXHR;
    RelayTrendPerformanceHandle: JQuery.jqXHR;
    CapBankAnlayticHandle: JQuery.jqXHR;

    constructor() {
        this.getFaultDistanceData = this.getFaultDistanceData.bind(this);
        this.getDigitalsData = this.getDigitalsData.bind(this);
        this.getStatisticData = this.getStatisticData.bind(this);
        this.getRelayTrendData = this.getRelayTrendData.bind(this);
        this.getRelayTrendPerformance = this.getRelayTrendPerformance.bind(this);
        this.getCapBankAnalytic = this.getCapBankAnalytic.bind(this);
    }
    

    getWaveformTCEData(eventid: number, pixels: number, startDate?: string, endDate?: string): JQuery.jqXHR {
        if (this.waveformTCEDataHandle !== undefined)
            this.waveformTCEDataHandle.abort();

        this.waveformTCEDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetData?eventId=${eventid}` +
                `${startDate != undefined ? `&startDate=${startDate}` : ``}` +
                `${endDate != undefined ? `&endDate=${endDate}` : ``}` +
                `&pixels=${pixels}` +
                `&type=TripCoilCurrent` +
                `&dataType=Time`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.waveformTCEDataHandle;
    }

    getStatisticData(eventid: number, pixels: number, type: string, startDate?: string, endDate?: string): JQuery.jqXHR {
        if (this.relaystatisticsDataHandle !== undefined)
            this.relaystatisticsDataHandle.abort();

        this.relaystatisticsDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetData?eventid=${eventid}` +
                `${startDate != undefined ? `&startDate=${startDate}` : ``}` +
                `${endDate != undefined ? `&endDate=${endDate}` : ``}` +
                `&pixels=${pixels}` +
                `&type=${type}` +
                `&dataType=Statistics`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.relaystatisticsDataHandle;
    }

    getRelayTrendData(lineID: number, channelID: number): JQuery.jqXHR {
        if (this.relayTrendHandle !== undefined)
            this.relayTrendHandle.abort();

        this.relayTrendHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenXDA/RelayReport/GetTrend?breakerid=${lineID}&channelid=${channelID}`,                
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                cache: true,
                async: true
            });

        return this.relayTrendHandle;
    }


    getFrequencyData(eventid: number, pixels: number, type: string, startDate?: string, endDate?: string): JQuery.jqXHR{
        if (this.frequencyDataHandle !== undefined)
            this.frequencyDataHandle.abort();

        this.frequencyDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenSEE/GetData?eventId=${eventid}` +
                `${startDate != undefined ? `&startDate=${startDate}` : ``}` +
                `${endDate != undefined ? `&endDate=${endDate}` : ``}` +
                `&pixels=${pixels}` +
                `&type=${type}` +
                `&dataType=Freq`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.frequencyDataHandle;
    }

    getFaultDistanceData(eventid: number, pixels: number, startDate?: string, endDate?: string): JQuery.jqXHR{
        if (this.faultDistanceDataHandle !== undefined)
            this.faultDistanceDataHandle.abort();

        this.faultDistanceDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenXDA/GetFaultDistanceData?eventId=${eventid}` +
                `${startDate != undefined ? `&startDate=${startDate}` : ``}` +
                `${endDate != undefined ? `&endDate=${endDate}` : ``}` +
                `&pixels=${pixels}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.faultDistanceDataHandle;
    }

    getDigitalsData(eventid: number, pixels: number, startDate?: string, endDate?: string): JQuery.jqXHR{
        if (this.breakerDigitalsDataHandle !== undefined)
            this.breakerDigitalsDataHandle.abort();

        this.breakerDigitalsDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenXDA/GetBreakerData?eventId=${eventid}` +
                 `${startDate != undefined ? `&startDate=${startDate}` : ``}` + 
                 `${endDate != undefined ? `&endDate=${endDate}` : ``}`+
                 `&pixels=${pixels}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.breakerDigitalsDataHandle;
    }

    getHeaderData(filters): JQuery.jqXHR {
        if (this.headerDataHandle !== undefined)
            this.headerDataHandle.abort();

        this.headerDataHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenXDA/GetHeaderData?eventId=${filters.eventid}` +
                `${filters.breakeroperation != undefined ? `&breakeroperation=${filters.breakeroperation}` : ``}` ,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.headerDataHandle;
    }

    getScalarStats(eventid): JQuery.jqXHR {
        if (this.scalarStatHandle !== undefined)
            this.scalarStatHandle.abort();

        this.scalarStatHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenXDA/GetScalarStats?eventId=${eventid}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.scalarStatHandle;
    }

    getHarmonicStats(eventid): JQuery.jqXHR {
        if (this.harmonicStatHandle !== undefined)
            this.harmonicStatHandle.abort();

        this.harmonicStatHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenXDA/GetHarmonics?eventId=${eventid}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.harmonicStatHandle;
    }

    getRelayPerformance(breakerid): JQuery.jqXHR {
        if (this.RelayPerformanceHandle !== undefined)
            this.RelayPerformanceHandle.abort();

        this.RelayPerformanceHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenXDA/getRelayPerformance?eventId=${breakerid}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.RelayPerformanceHandle;
    }

    getCapBankAnalytic(eventId): JQuery.jqXHR {
        if (this.CapBankAnlayticHandle !== undefined)
            this.CapBankAnlayticHandle.abort();

        this.CapBankAnlayticHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenXDA/getCapBankAnalytic?eventId=${eventId}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.CapBankAnlayticHandle;
    }


    getRelayTrendPerformance(breakerid, channelId): JQuery.jqXHR {
        if (this.RelayTrendPerformanceHandle !== undefined)
            this.RelayTrendPerformanceHandle.abort();

        this.RelayTrendPerformanceHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenXDA/RelayReport/getRelayPerformance?lineID=${breakerid}&channelID=${channelId}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.RelayTrendPerformanceHandle;
    }


}