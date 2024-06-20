//******************************************************************************************************
//  MarkerTab.tsx - Gbtc
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
//  09/19/23 - Gabriel Santos
//       Generated original version of source code.
//
//******************************************************************************************************
import React from 'react';
import { TrendSearch } from '../../../../global';
import { BlockPicker } from 'react-color';
import { Input, TextArea, StylableSelect, CheckBox, Select } from '@gpa-gemstone/react-forms';
import { SVGIcons } from '@gpa-gemstone/gpa-symbols';
import TrendMarkerTable from '../../Components/TrendMarkerTable';
import { LineTypeOptions, AxisOptions } from '../SettingsModal';

interface IMarkerTabProps {
    // Manage Markers
    SymbMarkers: TrendSearch.ISymbolic[],
    SetSymbMarkers: (markers: TrendSearch.ISymbolic[]) => void,
    VeHoMarkers: TrendSearch.IVertHori[],
    SetVeHoMarkers: (markers: TrendSearch.IVertHori[]) => void,
    EventSettings: TrendSearch.EventMarkerSettings,
    SetEventSettings: (setting: TrendSearch.EventMarkerSettings) => void,
    DisplayEventSettings: boolean,
    IsGlobalSettings: boolean
}
const EventOptions = [{ Label: "Vertical Lines", Value: "Event-Vert" }, { Label: "Custom Symbols", Value: "Event-Symb" }];
// Loading all SVGIcons into the options menue
const markerSymbolOptions = [];
Object.keys(SVGIcons).forEach((iconName) => {
    markerSymbolOptions.push({ Value: SVGIcons[iconName], Element: SVGIcons[iconName] })
});

const MarkerTab = React.memo((props: IMarkerTabProps) => {
    // Sizing Variables
    const sideMarkerRef = React.useRef(null);
    const [markersHeight, setMarkersHeight] = React.useState<number>(500);

    // Settings Controls
    const [currentMarker, setCurrentMarker] = React.useState<TrendSearch.IMarker>(undefined);
    const [allMarkers, setAllMarkers] = React.useState<TrendSearch.IMarker[]>([]);

    // Get Heights and Widths
    React.useLayoutEffect(() => {
        const baseMarkerHeight = sideMarkerRef?.current?.offsetHeight ?? 400;
        setMarkersHeight(baseMarkerHeight < 400 ? 400 : baseMarkerHeight);
    });

    React.useEffect(() => {
        const markerArray: TrendSearch.IMarker[] = [...props.SymbMarkers, ...props.VeHoMarkers];
        if (props.DisplayEventSettings) markerArray.push(props.EventSettings);
        setAllMarkers(markerArray);
    }, [props.SymbMarkers, props.VeHoMarkers, props.EventSettings, props.DisplayEventSettings]);

    // Functions to handle removing/changing markers
    const removeFromArray = React.useCallback((marker: TrendSearch.IMarker, markerArray: TrendSearch.IMarker[], setMarkerArray: (markerArray: TrendSearch.IMarker[]) => void) => {
        const index = markerArray.findIndex(mark => mark.ID === marker.ID);
        if (index < 0) return;
        const allMarkers = [...markerArray];
        allMarkers.splice(index, 1);
        setMarkerArray(allMarkers);
        setCurrentMarker(undefined);
    }, []);

    const editFromArray = React.useCallback((marker: TrendSearch.IMarker, markerArray: TrendSearch.IMarker[], setMarkerArray: (markerArray: TrendSearch.IMarker[]) => void) => {
        const index = markerArray.findIndex(mark => mark.ID === marker.ID);
        if (index < 0) return;
        const allMarkers = [...markerArray];
        allMarkers.splice(index, 1, marker);
        setMarkerArray(allMarkers);
        setCurrentMarker(marker);
    }, []);

    const applyToMarker = React.useCallback((marker: TrendSearch.IMarker, markerFunc: (marker: TrendSearch.IMarker, markerArray: TrendSearch.IMarker[], setMarkerArray: (markerArray: TrendSearch.IMarker[]) => void) => void) => {
        switch (marker.type) {
            case "Symb":
                markerFunc(marker, props.SymbMarkers, props.SetSymbMarkers);
                break;
            case "VeHo":
                markerFunc(marker, props.VeHoMarkers, props.SetVeHoMarkers);
                break;
            default:
                console.warn(`Unexpected marker type ${marker.type}`);
                break;
        }
    }, [props.SymbMarkers, props.SetSymbMarkers, props.VeHoMarkers, props.SetVeHoMarkers]);

    const getSettingsList = React.useCallback(() => {
        switch (currentMarker?.type) {
            case 'Symb':
                return (
                    <div className="row" style={{ height: '100%', width: '100%' }}>
                        <div className="col" style={{ width: 'auto' }}>
                            <h4>Symbol Settings</h4>
                            <BlockPicker onChangeComplete={(color) => applyToMarker({ ...currentMarker, color: color.hex } as TrendSearch.ISymbolic, editFromArray)}
                                color={currentMarker['color']} triangle={"hide"} />
                            <StylableSelect<TrendSearch.ISymbolic> Record={currentMarker as TrendSearch.ISymbolic} Label={'Marker Symbol'} Field={'symbol'} Setter={state => applyToMarker(state, editFromArray)} Options={markerSymbolOptions} />
                            {
                                props.IsGlobalSettings ? <></> :
                                    <Select<TrendSearch.ISymbolic> Record={currentMarker as TrendSearch.ISymbolic} Label={'Axis'} Field={'axis'} Setter={state => applyToMarker(state, editFromArray)} Options={AxisOptions} />
                            }
                        </div>
                        <div className="col" style={{ width: 'auto' }}>
                            <h4>Text Settings</h4>
                            <BlockPicker onChangeComplete={(color) => applyToMarker({ ...currentMarker, fontColor: color.hex } as TrendSearch.ISymbolic, editFromArray)}
                                color={currentMarker['fontColor']} triangle={"hide"} />
                            <Input<TrendSearch.ISymbolic> Record={currentMarker as TrendSearch.ISymbolic} Label={'Infobox Opacity'} Field={'opacity'} Setter={state => applyToMarker(state, editFromArray)} Feedback={"Opacity must be between 0 and 1"} Valid={() => {
                                return (currentMarker['opacity'] <= 1 && currentMarker['opacity'] >= 0);
                            }} />
                            <Input<TrendSearch.ISymbolic> Record={currentMarker as TrendSearch.ISymbolic} Label={'Timestamp Format'} Field={'format'} Setter={state => applyToMarker(state, editFromArray)} Feedback={"Must be a valid timestamp format"} Valid={() => {
                                // TODO: This must be a valid string, something to check this should be added to helper functions in gemstone soon
                                return true;
                            }} />
                            <Input<TrendSearch.ISymbolic> Record={currentMarker as TrendSearch.ISymbolic} Label={'Note Text Size (em)'} Field={'fontSize'} Setter={state => applyToMarker(state, editFromArray)} Feedback={"Font size must be a positive number"} Valid={() => {
                                return currentMarker['fontSize'] > 0;
                            }} />
                            {
                                props.IsGlobalSettings ? <></> :
                                    <TextArea<TrendSearch.ISymbolic> Record={currentMarker as TrendSearch.ISymbolic} Label={'Marker Note'} Field={'note'} Setter={state => applyToMarker(state, editFromArray)} Rows={3} Valid={() => true} />
                            }
                        </div>
                    </div>
                );
            case 'VeHo':
                return (
                    <>
                        <BlockPicker onChangeComplete={(color) => applyToMarker({ ...currentMarker, color: color.hex } as TrendSearch.IVertHori, editFromArray)}
                            color={currentMarker['color']} triangle={"hide"} />
                        <Select<TrendSearch.IVertHori> Record={currentMarker as TrendSearch.IVertHori} Label={'Line Style'} Field={'line'} Setter={marker => applyToMarker(marker, editFromArray)} Options={LineTypeOptions} />
                        <Input<TrendSearch.IVertHori> Record={currentMarker as TrendSearch.IVertHori} Label={'Line Width (pixels)'} Field={'width'} Setter={marker => applyToMarker(marker, editFromArray)} Type={'number'}
                            Feedback={"Width must be a positive number"} Valid={() => {
                                return (currentMarker['width'] ?? 0) > 0;
                            }} />
                        {
                            props.IsGlobalSettings ? <></> :
                                <Select<TrendSearch.IVertHori> Record={currentMarker as TrendSearch.IVertHori} Label={'Axis'} Field={'axis'} Setter={marker => applyToMarker(marker, editFromArray)} Options={AxisOptions} />
                        }
                    </>
                );
            case 'Event-Vert': case 'Event-Symb':
                return (
                    <>
                        <BlockPicker onChangeComplete={(color) => props.SetEventSettings({ ...props.EventSettings, color: color.hex })}
                            color={props.EventSettings.color} triangle={"hide"} />
                        {props.EventSettings.type === "Event-Vert" ?
                            <>
                                <Select<TrendSearch.IEventVertSettings> Record={props.EventSettings} Label={'Line Style'} Field={'line'} Setter={props.SetEventSettings} Options={LineTypeOptions} />
                                <Input<TrendSearch.IEventVertSettings> Record={props.EventSettings} Label={'Line Width (pixels)'} Field={'width'} Setter={props.SetEventSettings} Type={'number'}
                                    Feedback={"Width must be a positive number"} Valid={() => {
                                        return (props.EventSettings['width'] ?? 0) > 0;
                                    }} />
                            </> 
                            :
                            <>
                                <StylableSelect<TrendSearch.IEventSymbolicSettings> Record={props.EventSettings}
                                    Label={'Event Symbol'} Field={'symbol'} Setter={props.SetEventSettings} Options={markerSymbolOptions} />
                                <CheckBox<TrendSearch.IEventSymbolicSettings> Record={props.EventSettings} Label={'Move to Top'} Field={'alignTop'} Setter={props.SetEventSettings} />
                            </>
                        }
                        {
                            props.IsGlobalSettings ? <></> :
                                <Select<TrendSearch.EventMarkerSettings> Record={props.EventSettings} Label={'Axis'} Field={'axis'} Setter={props.SetEventSettings} Options={AxisOptions} />
                        }
                        <Select<TrendSearch.EventMarkerSettings> Record={props.EventSettings} Label={'Event Marker Type'} Field={'type'} Setter={props.SetEventSettings} Options={EventOptions} />
                    </>);
            case undefined:
                return null
            default:
                console.warn(`Unexpected marker type ${currentMarker.type}`);
                return null;
        }
    }, [currentMarker, applyToMarker, editFromArray, LineTypeOptions, props.EventSettings, props.SetEventSettings]);

    return (
        <div className="row" style={{ paddingLeft: 20, paddingRight: 20 }}>
            <div className="col" style={{ width: '40%'}}>
                <TrendMarkerTable
                    Height={markersHeight}
                    Markers={allMarkers}
                    DisplayDescription={props.IsGlobalSettings}
                    RemoveMarker={(marker) => applyToMarker(marker, removeFromArray)}
                    Selected={currentMarker}
                    SetSelected={setCurrentMarker} />
            </div>
            <div className="col" style={{ width: '60%', overflowY: 'scroll', maxHeight: 'calc(100vh - 264px)' }} ref={sideMarkerRef}>
                {getSettingsList()}
            </div>
        </div>
    );
});

export { MarkerTab };