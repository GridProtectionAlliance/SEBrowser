﻿//******************************************************************************************************
//  EventSearchPreviewPane.tsx - Gbtc
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
//  04/24/2019 - Billy Ernest
//       Generated original version of source code.
//  08/22/2019 - Christoph Lackner
//       Added Carde for Relay Performance and plot of TCE.
//
//******************************************************************************************************
import React from 'react';
import { Redux, SEBrowser } from '../../../global'
import { useAppSelector } from '../../../hooks';
import { SelectEventSearchByID } from './../EventSearchSlice';
import { SelectWidgetCategories } from '../../SettingsSlice';
import { TabSelector } from '@gpa-gemstone/react-interactive';
import WidgetRouter from '../../../../../EventWidgets/TSX/WidgetWrapper';
import { EventWidget } from '../../../../../EventWidgets/TSX/global';
import { EventNoteSlice, MeterNoteSlice, AssetNoteSlice, LocationNoteSlice } from '../../../Store';
interface IProps {
    EventID: number,
    InitialTab?: string,
    Height: number,
    Date?: string,
    Time?: string,
    TimeWindowUnits?: number,
    WindowSize?: number
}

const widgetStore = {
    EventNoteSlice,
    MeterNoteSlice,
    AssetNoteSlice,
    LocationNoteSlice
}

export default function EventPreviewPane(props: IProps) {
    const categories = useAppSelector(SelectWidgetCategories);
    const [tab, setTab] = React.useState<string>(props.InitialTab == null || props.InitialTab == undefined ? '' : props.InitialTab);
    const [widgets, setWidgets] = React.useState<EventWidget.IWidgetView[]>([]);
    const event: any = useAppSelector((state: Redux.StoreState) => SelectEventSearchByID(state, props.EventID));
    const [roles, setRoles] = React.useState<string[]>([]);

    React.useEffect(() => {
        const h = getRoles();
        return () => { if (h != null && h.abort != null) h.abort(); }
    }, [])

    React.useEffect(() => {
        const h = loadWidgetCategories();
        return () => { if (h != null && h.abort != null) h.abort(); }
    }, [tab])

    React.useEffect(() => {
        if (categories.length > 0 && categories.findIndex(s => s.ID.toString() == tab) == -1)
            setTab(categories[0].ID.toString());
    }, [tab, categories])


    function loadWidgetCategories() {
        if (tab == '') return null;

        return $.ajax({
            type: "GET",
            url: `${homePath}api/openXDA/Widget/${tab}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        }).done((d) => { setWidgets(d) });
    }

    function getRoles() {
        return $.ajax({
            type: "GET",
            url: `${homePath}api/SEBrowser/SecurityRoles`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        }).done((d) => { setRoles(d) });
    }

    if (event == undefined || categories.length == 0) return <div></div>;

    return (
        <>
            <TabSelector CurrentTab={tab} SetTab={setTab} Tabs={categories.map(t => {
                return { Id: t.ID.toString(), Label: t.Name }
            })} />
            <div style={{ height: props.Height - 37.5, maxHeight: props.Height - 37.5, overflowY: 'scroll', overflowX: 'hidden' }}>
                {widgets.filter(widget => widget.Enabled).map((widget) => {
                    return <WidgetRouter
                        Widget={widget}
                        DisturbanceID={0}
                        StartTime={event.FileStartTime}
                        EventID={props.EventID}
                        FaultID={0}
                        Height={props.Height}
                        HomePath={`${homePath}api`}
                        Roles={roles}
                        key={widget.ID}
                        Store={widgetStore}
                    />
                })}
            </div>
        </>)
}

