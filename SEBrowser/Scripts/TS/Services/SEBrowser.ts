﻿//******************************************************************************************************
//  SEBrowser.ts - Gbtc
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
//  02/19/2020 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

declare let homePath: string;

export default class SEBrowserdService {
    mostActiveMeterHandle: JQuery.jqXHR;
    leastActiveMeterHandle: JQuery.jqXHR;
    filesProcessedMeterHandle: JQuery.jqXHR;
    fileGroupEventsHandle: JQuery.jqXHR;
    eventSearchHandle: JQuery.jqXHR;
    eventSearchAssetVoltageDisturbancesHandle: JQuery.jqXHR;
    eventSearchAssetFaultSegmentsHandle: JQuery.jqXHR;
    subStationRelayReportHandle: JQuery.jqXHR;
    BreakerRelayReportHandle: JQuery.jqXHR;
    channelRelayReportHandle: JQuery.jqXHR;
    subStationCapBankReportHandle: JQuery.jqXHR;
    capBankCapBankReportHandle: JQuery.jqXHR;

    constructor() {
        this.getMostActiveMeterActivityData = this.getMostActiveMeterActivityData.bind(this);
        this.getLeastActiveMeterActivityData = this.getLeastActiveMeterActivityData.bind(this);


        this.GetCapBankSubstationData = this.GetCapBankSubstationData.bind(this);
        this.GetCapBankData = this.GetCapBankData.bind(this);
    }

    getMostActiveMeterActivityData(numresults: number, column: string): JQuery.jqXHR {
        if (this.mostActiveMeterHandle !== undefined)
            this.mostActiveMeterHandle.abort();

        this.mostActiveMeterHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenXDA/MeterActivity/GetMostActiveMeterActivityData?numresults=${numresults}` +
                `&column=${column}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.mostActiveMeterHandle;
    }

    GetCapBankSubstationData(): JQuery.jqXHR {
        if (this.subStationCapBankReportHandle !== undefined)
            this.subStationCapBankReportHandle.abort();

        this.subStationCapBankReportHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/PQDashboard/CapBankReport/GetSubstationData`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });
        return this.subStationCapBankReportHandle;
    }

    GetCapBankData(substationID: number): JQuery.jqXHR {
        if (this.capBankCapBankReportHandle !== undefined)
            this.capBankCapBankReportHandle.abort();

        this.capBankCapBankReportHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/PQDashboard/CapBankReport/GetCapBankData?locationID=${substationID}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });
        return this.capBankCapBankReportHandle;
    }


    getLeastActiveMeterActivityData(numresults: number, column: string): JQuery.jqXHR {
        if (this.leastActiveMeterHandle !== undefined)
            this.leastActiveMeterHandle.abort();

        this.leastActiveMeterHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenXDA/MeterActivity/GetLeastActiveMeterActivityData?numresults=${numresults}` +
                `&column=${column}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.leastActiveMeterHandle;
    }

    getFilesProcessedMeterActivityData(column: string): JQuery.jqXHR {
        if (this.filesProcessedMeterHandle !== undefined)
            this.filesProcessedMeterHandle.abort();

        this.filesProcessedMeterHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenXDA/MeterActivity/GetFilesProcessedLast24Hrs?column=${column}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.filesProcessedMeterHandle;
    }

    getFileGroupEvents(fileGroupID: number): JQuery.jqXHR {
        if (this.fileGroupEventsHandle !== undefined)
            this.fileGroupEventsHandle.abort();

        this.fileGroupEventsHandle = $.ajax({
            type: "GET",
            url: `${homePath}api/OpenXDA/MeterActivity/QueryFileGroupEvents?FileGroupID=${fileGroupID}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        return this.fileGroupEventsHandle;
    }

}
