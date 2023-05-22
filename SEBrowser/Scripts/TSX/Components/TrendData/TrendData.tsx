//******************************************************************************************************
//  TrendData.tsx - Gbtc
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
import TrendSearchNavbar from './TrendDataNavbar';
import { TrendPlot, ITrendPlot } from './ChartContainer/TrendPlot';
import { OverlayDrawer, VerticalSplit } from '@gpa-gemstone/react-interactive';
import { CreateGuid } from '@gpa-gemstone/helper-functions';
import { SEBrowser } from '../../global';

interface IProps { }

const TrendData = (props: IProps) => {
    const closureHandler = React.useRef<((o: boolean) => void)>(() => { });
    const [showNav, setShowNav] = React.useState<boolean>(getShowNav());
    const [navHeight, setNavHeight] = React.useState<number>(0);
    const [plotList, setPlotList] = React.useState<ITrendPlot[]>([]);
    const overlayPortalID: string = "TrendDataChartPortal";
    const overlayDrawer: string = "TrendDataNavbar";

    function getShowNav(): boolean {
        if (localStorage.hasOwnProperty('SEbrowser.TrendData.ShowNav'))
            return JSON.parse(localStorage.getItem('SEbrowser.TrendData.ShowNav'))
        else
            return true;
    }

    function removePlot(ID: string): void {
        const index = plotList.findIndex(item => item.ID === ID);
        const newList = [...plotList];
        newList.splice(index, 1);
        setPlotList(newList);
    }

    function changePlot(plot: ITrendPlot): void {
        const index = plotList.findIndex(item => item.ID === plot.ID);
        const newList = [...plotList];
        newList.splice(index, 1, plot);
        setPlotList(newList);
    }

    function appendNewContainer(newContainerProps: ITrendPlot): void {
        setPlotList([...plotList, newContainerProps]);
    }

    function closeSettings(open: boolean) {
        closureHandler.current(open);
    }

    return (
        <div style={{ width: '100%', height: '100%' }} data-drawer={overlayDrawer}>
            <TrendSearchNavbar
                ToggleVis={() => setShowNav((c) => !c)}
                ShowNav={showNav}
                SetHeight={setNavHeight}
                AddNewChart={appendNewContainer}
            />
            <div style={{ width: '100%', height: (showNav ? 'calc(100% - ' + navHeight + 'px)' : 'calc( 100% - 52px)'), overflowY: 'scroll' }}>
                {plotList.map(element => <TrendPlot key={element.ID}
                    PlotValues={element} SetPlotValues={changePlot} RemovePlot={removePlot}
                    OverlayPortalID={overlayPortalID} HandleOverlay={closeSettings}/>)}
            </div>
            <OverlayDrawer Title={''} Open={false} Location={'top'} Target={overlayDrawer} GetOverride={(s) => { closureHandler.current = s; }} HideHandle={true}>
                <div id={overlayPortalID} style={{opacity: 0.8, background: undefined, color: 'black' }}>

                </div>
            </OverlayDrawer>
        </div>
    );
}

export default TrendData;
