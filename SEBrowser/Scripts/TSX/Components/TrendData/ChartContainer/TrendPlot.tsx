//******************************************************************************************************
//  ChartContainer.tsx - Gbtc
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
//  04/14/23 - Gabriel Santos
//       Generated original version of source code.
//
//******************************************************************************************************
import React from 'react';
import _ from 'lodash';
import { Portal } from 'react-portal';
import { CrossMark, Pencil } from '@gpa-gemstone/gpa-symbols';
import { Button } from '@gpa-gemstone/react-graph';
import { LineGraph } from './LineGraph';
import { IMultiCheckboxOption, SEBrowser } from '../../../global';
import ReportTimeFilter from '../../ReportTimeFilter';
import { MultiCheckBoxSelect } from '@gpa-gemstone/react-forms';

interface ITrendPlot {
    TimeFilter: SEBrowser.IReportTimeFilter,
    Type: 'Line',
    Channels: SEBrowser.ITrendChannel[],
    PlotFilter: IMultiCheckboxOption[],
    ID: string
}

interface IContainerProps {
    PlotValues: ITrendPlot,
    SetPlotValues: (newValues: ITrendPlot) => void,
    RemovePlot: (ID: string) => void,
    HandleOverlay: (open: boolean) => void,
    OverlayPortalID: string
}

const TrendPlot = (props: IContainerProps) => {
    const chartRef = React.useRef(null);
    const [showSettings, setShowSettings] = React.useState<boolean>(false);
    const [settingsBuffer, setSettingsBuffer] = React.useState<ITrendPlot>(null);
    const [chartWidth, setChartWidth] = React.useState<number>(100);
    const chartHeight = 500;

    // Page effects
    React.useLayoutEffect(() => {
        setChartWidth(chartRef?.current?.offsetWidth ?? 100);
    });

    React.useEffect(() => {
        props.HandleOverlay(showSettings);
    }, [showSettings]);

    React.useEffect(() => {
        setSettingsBuffer(props.PlotValues);
    }, [props.PlotValues]);

    // Buttons added to the plots
    const closeButton = (
        <Button onClick={() => {
            props.RemovePlot(props.PlotValues.ID);
            setShowSettings(false);
        }}>
            {CrossMark}
        </Button>);

    const overlayButton = (
        <Button onClick={() => setShowSettings(!showSettings)}>
            {Pencil}
        </Button>);

    return (
        <div className="col" style={{ width: '49%', float: 'left' }} ref={chartRef}>
            <div className="row">
                {props.PlotValues.Type === 'Line' ?
                    <LineGraph Channels={props.PlotValues.Channels} TimeFilter={props.PlotValues.TimeFilter} PlotFilter={props.PlotValues.PlotFilter} Height={chartHeight} Width={chartWidth}> {overlayButton} {closeButton} </LineGraph> : null}
            </div>
            {showSettings ? <Portal node={document && document.getElementById(props.OverlayPortalID)}>
                <div className="card">
                    <div className="card-header">
                        <h4 className="modal-title">Change Plot Settings</h4>
                    </div>
                    <div className="card-body" style={{ maxHeight: 'calc(100% - 210px)', overflowY: 'auto' }}>
                        <div className="col" style={{ width: '30%', paddingRight: 10 }}>
                            <ReportTimeFilter filter={settingsBuffer.TimeFilter} setFilter={newFilter => setSettingsBuffer({ ...settingsBuffer, TimeFilter: newFilter })} showQuickSelect={false} />
                        </div>
                        <div className="col" style={{ width: '20%', paddingRight: 10 }}>
                            <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                                <legend className="w-auto" style={{ fontSize: 'large' }}>Channel Filters:</legend>
                                    <MultiCheckBoxSelect
                                        Options={settingsBuffer.PlotFilter}
                                        Label={''}
                                        OnChange={(evt, newOptions: IMultiCheckboxOption[]) => {
                                            let options: IMultiCheckboxOption[] = [];
                                            settingsBuffer.PlotFilter.forEach(item => {
                                                const selected: boolean = item.Selected != (newOptions.findIndex(option => item.Value === option.Value) > -1);
                                                options.push({ ...item, Selected: selected });
                                            });
                                            setSettingsBuffer({ ...settingsBuffer, PlotFilter: options });
                                        }}
                                />
                            </fieldset>
                        </div>
                    </div>
                    <div className="card-footer">
                        <button type="button"
                            className={'btn btn-primary float-left'}
                            onClick={() => {
                                setShowSettings(false);
                                props.SetPlotValues(settingsBuffer);
                            }}>Save Changes</button>
                        <button type="button"
                            className={'btn btn-cancel float-right'}
                            onClick={() => {
                                setShowSettings(false);
                            }}>Discard Changes</button>
                    </div>
                </div>
            </Portal> : null}
        </div>
    );
}

export { TrendPlot, ITrendPlot };