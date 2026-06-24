//******************************************************************************************************
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
import { TabSelector } from '@gpa-gemstone/react-interactive';
import React from 'react';
import { EventWidget } from '../../../../EventWidgets/TSX/global';
import WidgetRouter from '../../../../EventWidgets/TSX/WidgetWrapper';
import { Redux } from '../../global';
import { useAppSelector } from '../../hooks';
import { SelectEventSearchByID } from '../../Store/EventSearchSlice';
import { SelectWidgetCategories } from '../../Store/SettingsSlice';
import { EventTypeSlice } from '../../Store/Store';
import { Application } from '@gpa-gemstone/application-typings';
import { ReactIcons } from '@gpa-gemstone/gpa-symbols';

interface IProps {
    EventID: number,
    InitialTab?: string,
    Height: number
}

const widgetStore = {
    EventTypeSlice
}

export default function EventPreviewPane(props: IProps) {
    const categories = useAppSelector(SelectWidgetCategories);
    const event: any = useAppSelector((state: Redux.StoreState) => SelectEventSearchByID(state, props.EventID));
    const eventTypes = useAppSelector(EventTypeSlice.Data);

    const [tab, setTab] = React.useState<string>(props.InitialTab == null || props.InitialTab == undefined ? '' : props.InitialTab);
    const [widgets, setWidgets] = React.useState<EventWidget.IWidgetView[]>([]);
    const [widgetStatus, setWidgetsStatus] = React.useState<Application.Types.Status>('uninitiated');
    const [roles, setRoles] = React.useState<string[]>([]);
    const [rolesStatus, setRolesStatus] = React.useState<Application.Types.Status>('uninitiated');

    React.useEffect(() => {
        setRolesStatus('loading');
        const handle = getRoles();

        handle.done(d => {
            setRoles(d);
            setRolesStatus('idle');
        });

        handle.fail(() => setRolesStatus('error'));

        return () => {
            if (handle?.abort != null)
                handle.abort();
        }
    }, [])

    React.useEffect(() => {
        if (tab == null) return;

        setWidgetsStatus('loading');
        const handle = loadWidgets(tab);
        handle.done(d => {
            setWidgets(d);
            setWidgetsStatus('idle');
        }).fail(() => {
            setWidgetsStatus('error')
        });

        return () => {
            if (handle?.abort != null)
                handle.abort();
        }
    }, [tab])

    //effect to set tab to first category if current tab is not in the current categories
    React.useEffect(() => {
        if (categories.length > 0 && categories.findIndex(s => s.ID.toString() == tab) == -1)
            setTab(categories[0].ID.toString());
    }, [tab, categories])


    if (event == undefined || categories.length == 0)
        return <></>;

    return (
        <>
            <TabSelector
                CurrentTab={tab}
                SetTab={setTab}
                Tabs={categories.map(t => ({ Id: t.ID.toString(), Label: t.Name }))}
            />
            <div style={{ height: props.Height - 37.5, maxHeight: props.Height - 37.5, overflowY: 'scroll', overflowX: 'hidden' }}>
                {widgetStatus === 'loading' ?
                    <div className='d-flex align-items-center justify-content-center' style={{ height: props.Height - 37.5 }}>
                        <ReactIcons.SpiningIcon Size={'50%'} />
                    </div>
                    :
                    widgets.map((widget) => {
                        return <WidgetRouter
                            Widget={widget}
                            DisturbanceID={0}
                            EventID={props.EventID}
                            FaultID={0}
                            Height={props.Height}
                            HomePath={`${homePath}`}
                            Roles={roles}
                            key={widget.ID}
                            EventTypes={eventTypes}
                        />
                    })}
            </div>
        </>
    )
}

const loadWidgets = (tab: string) => {
    return $.ajax({
        type: "GET",
        url: `${homePath}api/openXDA/Widget/${tab}`,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        async: true
    });
}

const getRoles = () => {
    return $.ajax({
        type: "GET",
        url: `${homePath}api/SEBrowser/SecurityRoles`,
        contentType: "application/json; charset=utf-8",
        dataType: 'json',
        cache: true,
        async: true
    });
}