//******************************************************************************************************
//  TrendDataNavbarButtons.tsx - Gbtc
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
//******************************************************************************************************
import React from 'react';
import { SEBrowser, TrendSearch, IMultiCheckboxOption } from '../../../global';
import { ToolTip } from '@gpa-gemstone/react-forms';
import { CrossMark, SVGIcons } from '@gpa-gemstone/gpa-symbols';
import { CreateGuid } from '@gpa-gemstone/helper-functions';
import html2canvas from 'html2canvas';
import jspdf from 'jspdf';

interface IProps {
    ToggleVis: () => void,
    ShowNav: boolean,
    SetShowAllSettings: (show: boolean) => void,
    AddNewCharts: (chartData: TrendSearch.ITrendPlot[]) => void,
    RemoveAllCharts: () => void,
    SetMovable: (toggle: boolean) => void,
    Movable: boolean,
    PlotIds: { ID: string, Height: number, Width: number }[],
    TimeFilter: SEBrowser.IReportTimeFilter,
    LinePlot: IMultiCheckboxOption[],
    TrendChannels: TrendSearch.ITrendChannel[],
    SelectedSet: Set<string>,
    SetSelectedSet: React.Dispatch<React.SetStateAction<Set<string>>>
}

const TrendDataNavbarButtons = (props: IProps) => {
    const [hover, setHover] = React.useState<'None' | 'Show' | 'Hide' | 'Cog' | 'Single-Line' | 'Multi-Line' | 'Group-Line' | 'Cyclic' | 'Move' | 'Trash' | 'Select' | 'Capture'>('None');

    if (!props.ShowNav)
        return (
            <div className="navbar-nav ml-auto" >
                <button type="button" className={`btn btn-primary btn-sm`} onClick={() => props.ToggleVis()}
                    data-tooltip='Show' onMouseEnter={() => setHover('Show')} onMouseLeave={() => setHover('None')}>
                    <span>{SVGIcons.ArrowDropDown}</span>
                </button>
                <ToolTip Show={hover === 'Show'} Position={'left'} Target={"Show"}>
                    Shows Navbar
                </ToolTip>
            </div>
        );

    return (
        <>
            <div className="btn-group-vertical float-right" style={{ paddingRight: '6px' }}>
                <button type="button" style={{ marginBottom: 5 }} className={`btn btn-primary btn-sm`}
                    onClick={() => props.ToggleVis()}
                    data-tooltip='Hide'
                    onMouseEnter={() => setHover('Hide')}
                    onMouseLeave={() => setHover('None')}
                >
                    <span>{SVGIcons.ArrowDropUp}</span>
                </button>
                <ToolTip Show={hover === 'Hide'} Position={'left'} Target={"Hide"}>
                    Hides Navbar
                </ToolTip>
                <button type="button" style={{ marginBottom: 5 }} className={`btn btn-primary btn-sm`}
                    onClick={() => { props.SetShowAllSettings(true); }}
                    data-tooltip='Cog'
                    onMouseEnter={() => setHover('Cog')}
                    onMouseLeave={() => setHover('None')}>
                    <span>{SVGIcons.Settings}</span>
                </button>
                <ToolTip Show={hover === 'Cog'} Position={'left'} Target={"Cog"}>
                    {<p>Settings for All Current and/or Future Plots</p>}
                </ToolTip>
                <button type="button" style={{ marginBottom: 5 }} className={`btn btn-${props.Movable ? 'Warning' : 'primary'} btn-sm${props.PlotIds.length === 0 ? ' disabled' : ''}`}
                    onClick={() => {
                        if (props.PlotIds.length !== 0)
                            props.SetMovable(!props.Movable);
                    }}
                    data-tooltip='Move'
                    onMouseEnter={() => setHover('Move')}
                    onMouseLeave={() => setHover('None')}>
                    <span>{SVGIcons.DataContainer}</span>
                </button>
                <ToolTip Show={hover === 'Move'} Position={'left'} Target={"Move"}>
                    {<p>Drag-and-Drop Reorder Plots</p>}
                    {props.PlotIds.length === 0 ? <p>{CrossMark} {'Requires an Active Plot'}</p> : null}
                </ToolTip>
                <button type="button" style={{ marginBottom: 5 }} className={`btn btn-primary btn-sm${props.TrendChannels.length === 0 ? ' disabled' : ''}`}
                    onClick={() => {
                        if (props.TrendChannels.length !== 0) {
                            const newSet = new Set<string>();
                            props.TrendChannels.forEach(chan => newSet.add(chan.ID));
                            props.SetSelectedSet(newSet);
                        }
                    }}
                    data-tooltip='Select'
                    onMouseEnter={() => setHover('Select')}
                    onMouseLeave={() => setHover('None')}
                >
                    <span>{SVGIcons.Alert}</span>
                </button>
                <ToolTip Show={hover === 'Select'} Position={'left'} Target={"Select"}>
                    <p>Select All Channels in Table</p>
                    {(props.TrendChannels.length === 0) ? <p>{CrossMark} {'Table has no Channels to Select'}</p> : null}
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
                    onClick={() => {
                        if (props.PlotIds.length !== 0)
                            props.RemoveAllCharts();
                    }}
                    data-tooltip='Trash'
                    onMouseEnter={() => setHover('Trash')}
                    onMouseLeave={() => setHover('None')}
                >
                    <span>{SVGIcons.TrashCan}</span>
                </button>
                <ToolTip Show={hover === 'Trash'} Position={'left'} Target={"Trash"}>
                    {<p>Remove All Plots</p>}
                    {props.PlotIds.length === 0 ? <p>{CrossMark} {'Requires an Active Plot'}</p> : null}
                </ToolTip>
                <button type="button" style={{ marginBottom: 5 }} className={`btn btn-primary btn-sm${props.SelectedSet.size === 0 ? ' disabled' : ''}`}
                    data-tooltip='Single-Line'
                    onMouseEnter={() => setHover('Single-Line')}
                    onMouseLeave={() => setHover('None')}
                    onClick={() => {
                        if (props.SelectedSet.size === 0) return;
                        const selectedChannels = props.TrendChannels.filter(chan => props.SelectedSet.has(chan.ID));
                        props.AddNewCharts([{
                            TimeFilter: props.TimeFilter, Type: 'Line', Channels: selectedChannels, ID: CreateGuid(),
                            PlotFilter: props.LinePlot
                        }]);
                    }}>
                    <span>{SVGIcons.Document}</span>
                </button>
                <ToolTip Show={hover === 'Single-Line'} Position={'left'} Target={"Single-Line"}>
                    {<p>Add All Selected Channels to Single Plot</p>}
                    {props.SelectedSet.size === 0 ? <p>{CrossMark} {'Requires a Selected Channel'}</p> : null}
                </ToolTip>
                <button type="button" style={{ marginBottom: 5 }} className={`btn btn-primary btn-sm${props.SelectedSet.size === 0 ? ' disabled' : ''}`}
                    data-tooltip='Multi-Line'
                    onMouseEnter={() => setHover('Multi-Line')}
                    onMouseLeave={() => setHover('None')}
                    onClick={() => {
                        if (props.SelectedSet.size === 0) return;
                        const selectedChannels: TrendSearch.ITrendChannel[] = props.TrendChannels.filter(chan => props.SelectedSet.has(chan.ID));
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
                                    TimeFilter: props.TimeFilter, Type: 'Line', Channels: channelList, ID: CreateGuid(),
                                    PlotFilter: props.LinePlot
                                });
                            })
                        );
                    }}>
                    <span>{SVGIcons.House}</span>
                </button>
                <ToolTip Show={hover === 'Multi-Line'} Position={'left'} Target={"Multi-Line"}>
                    {<p>Add Selected Channels to New Plots Separated by Meter</p>}
                    {props.SelectedSet.size === 0 ? <p>{CrossMark} Requires a Selected Channel </p> : null}
                </ToolTip>
                <button type="button" style={{ marginBottom: 5 }} className={`btn btn-primary btn-sm${props.SelectedSet.size === 0 ? ' disabled' : ''}`}
                    data-tooltip='Group-Line'
                    onMouseEnter={() => setHover('Group-Line')}
                    onMouseLeave={() => setHover('None')}
                    onClick={() => {
                        if (props.SelectedSet.size === 0) return;
                        const selectedChannels: TrendSearch.ITrendChannel[] = props.TrendChannels.filter(chan => props.SelectedSet.has(chan.ID));
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
                                    TimeFilter: props.TimeFilter, Type: 'Line', Channels: channelList, ID: CreateGuid(),
                                    PlotFilter: props.LinePlot
                                });
                            })
                        );
                    }}>
                    <span>{SVGIcons.Filter}</span>
                </button>
                <ToolTip Show={hover === 'Group-Line'} Position={'left'} Target={"Group-Line"}>
                    {<p>Add Selected Channels to New Plots Separated by Channel Group</p>}
                    {props.SelectedSet.size === 0 ? <p>{CrossMark} Requires a Selected Channel</p> : null}
                </ToolTip>
                <button type="button" style={{ marginBottom: 5 }} className={`btn btn-primary btn-sm ${props.SelectedSet.size !== 1 ? ' disabled' : ''}`}
                    data-tooltip='Cyclic'
                    onMouseEnter={() => setHover('Cyclic')}
                    onMouseLeave={() => setHover('None')}
                    onClick={() => {
                        if (props.SelectedSet.size !== 1) return;
                        const selectedChannels = props.TrendChannels.filter(chan => props.SelectedSet.has(chan.ID));
                        props.AddNewCharts([{
                            TimeFilter: props.TimeFilter, Type: 'Cyclic', Channels: selectedChannels, ID: CreateGuid(),
                            PlotFilter: props.LinePlot
                        }]);
                    }}>
                    <span>{SVGIcons.Cube}</span>
                </button>
                <ToolTip Show={hover === 'Cyclic'} Position={'left'} Target={"Cyclic"}>
                    {<p>Add Selected Channel to New Cyclic Histogram Plot</p>}
                    {props.SelectedSet.size !== 1 ? <p>{CrossMark} Requires a Single Channel Selection</p> : null}
                </ToolTip>
            </div>
        </>
    );
};

export default TrendDataNavbarButtons;