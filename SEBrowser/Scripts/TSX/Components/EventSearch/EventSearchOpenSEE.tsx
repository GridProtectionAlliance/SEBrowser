//******************************************************************************************************
//  EventSearchOpenSEE.tsx - Gbtc
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
//  03/03/2020 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************
import React from 'react';
import EventSearchPreviewD3Chart from './EventSearchPreviewD3Chart';
import EventSearchPreviewD3ChartAxis from './EventSearchPreviewD3ChartAxis';

export default function EventSearchOpenSEE(props: { EventID: number }) {
    return (
        <div className="card">
            <div className="card-header"><a href={openSEEInstance + '?eventid=' + props.EventID} target="_blank">View in OpenSEE</a></div>
            <div className="card-body">
                <EventSearchPreviewD3Chart EventID={props.EventID} MeasurementType='Voltage' DataType='Time' />
                <EventSearchPreviewD3Chart EventID={props.EventID} MeasurementType='Current' DataType='Time' />
                <EventSearchPreviewD3Chart EventID={props.EventID} MeasurementType='TripCoilCurrent' DataType='Time' />
                <EventSearchPreviewD3ChartAxis EventID={props.EventID} />
            </div>
        </div>
)
}