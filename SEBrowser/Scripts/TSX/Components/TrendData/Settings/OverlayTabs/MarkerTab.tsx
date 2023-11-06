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
import { LineTypeOptions } from '..//SettingsOverlay';

interface IMarkerTabProps {
    // Manage Markers
    SymbMarkers: TrendSearch.ISymbolic[],
    SetSymbMarkers: (markers: TrendSearch.ISymbolic[]) => void,
    VeHoMarkers: TrendSearch.IVertHori[],
    SetVeHoMarkers: (markers: TrendSearch.IVertHori[]) => void,
    EventSettings: TrendSearch.EventMarkerSettings,
    SetEventSettings: (setting: TrendSearch.EventMarkerSettings) => void,
    DisplayEventSettings: boolean
}

const MarkerTab = React.memo((props: IMarkerTabProps) => {
    // Sizing Variables
    const sideMarkerRef = React.useRef(null);
    const [markersHeight, setMarkersHeight] = React.useState<number>(500);

    // Settings Controls
    const [currentMarker, setCurrentMarker] = React.useState<TrendSearch.IMarker>(undefined);
    const [currentType, setCurrentType] = React.useState<"Symb" | "VeHo" | "Event" | undefined>(undefined);
    const [allMarkers, setAllMarkers] = React.useState<TrendSearch.IMarker[]>([]);

    // Get Heights and Widths
    React.useLayoutEffect(() => {
        const baseMarkerHeight = sideMarkerRef?.current?.offsetHeight ?? 400;
        setMarkersHeight(baseMarkerHeight < 400 ? 400 : baseMarkerHeight);
    });

    React.useEffect(() => {
        if (currentMarker === undefined) return;
        if (props.SymbMarkers.some(mark => mark.ID === currentMarker.ID)) { setCurrentType("Symb"); return; }
        if (props.VeHoMarkers.some(mark => mark.ID === currentMarker.ID)) { setCurrentType("VeHo"); return; }
        setCurrentType("Event");
    }, [currentMarker]);

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
        setCurrentMarker(marker);
    }, []);

    const editFromArray = React.useCallback((marker: TrendSearch.IMarker, markerArray: TrendSearch.IMarker[], setMarkerArray: (markerArray: TrendSearch.IMarker[]) => void) => {
        const index = markerArray.findIndex(mark => mark.ID === marker.ID);
        if (index < 0) return;
        const allMarkers = [...markerArray];
        allMarkers.splice(index, 1, marker);
        setMarkerArray(allMarkers);
        setCurrentMarker(marker);
    }, []);

    const setSettings = React.useCallback((marker: TrendSearch.EventMarkerSettings) => {
        props.SetEventSettings(marker);
        setCurrentMarker(marker);
    }, [props.SetEventSettings, setCurrentMarker]);

    const applyToMarker = React.useCallback((marker: TrendSearch.IMarker, markerFunc: (marker: TrendSearch.IMarker, markerArray: TrendSearch.IMarker[], setMarkerArray: (markerArray: TrendSearch.IMarker[]) => void) => void) => {
        switch (currentType) {
            case "Symb":
                markerFunc(marker, props.SymbMarkers, props.SetSymbMarkers);
                break;
            case "VeHo":
                markerFunc(marker, props.VeHoMarkers, props.SetVeHoMarkers);
                break;
            default:
                console.warn(`Unexpected marker type ${currentType}`);
                break;
        }
    }, [props.SymbMarkers, props.SetSymbMarkers, props.VeHoMarkers, props.SetVeHoMarkers, currentType]);

    const getSettingsList = React.useCallback(() => {
        switch (currentType) {
            case 'Symb':
                return (
                    <div className="row" style={{ height: '100%', width: '100%' }}>
                        <div className="col" style={{ width: 'auto' }}>
                            <h4>Symbol Settings</h4>
                            <BlockPicker onChangeComplete={(color) => applyToMarker({ ...currentMarker, symbolColor: color.hex } as TrendSearch.ISymbolic, editFromArray)}
                                color={currentMarker['symbolColor']} triangle={"hide"} />
                            <StylableSelect<TrendSearch.ISymbolic> Record={currentMarker as TrendSearch.ISymbolic} Label={'Marker Symbol'} Field={'symbol'} Setter={state => applyToMarker(state, editFromArray)} Options={markerSymbolOptions} />
                        </div>
                        <div className="col" style={{ width: 'auto' }}>
                            <h4>Text Settings</h4>
                            <BlockPicker onChangeComplete={(color) => applyToMarker({ ...currentMarker, fontColor: color.hex } as TrendSearch.ISymbolic, editFromArray)}
                                color={currentMarker['fontColor']} triangle={"hide"} />
                            <Input<TrendSearch.ISymbolic> Record={currentMarker as TrendSearch.ISymbolic} Label={'Infobox Opacity'} Field={'opacity'} Setter={state => applyToMarker(state, editFromArray)} Feedback={"Opacity must be between 0 and 1"} Valid={() => {
                                return (currentMarker['opacity'] <= 1 && currentMarker['opacity'] > 0);
                            }} />
                            <Input<TrendSearch.ISymbolic> Record={currentMarker as TrendSearch.ISymbolic} Label={'Timestamp Format'} Field={'format'} Setter={state => applyToMarker(state, editFromArray)} Feedback={"Must be a valid timestamp format"} Valid={() => {
                                // TODO: This must be a valid string, something to check this should be added to helper functions in gemstone soon
                                return true;
                            }} />
                            <Input<TrendSearch.ISymbolic> Record={currentMarker as TrendSearch.ISymbolic} Label={'Note Text Size (em)'} Field={'fontSize'} Setter={state => applyToMarker(state, editFromArray)} Feedback={"Font size must be a positive number"} Valid={() => {
                                return currentMarker['opacity'] > 0;
                            }} />
                            <TextArea<TrendSearch.ISymbolic> Record={currentMarker as TrendSearch.ISymbolic} Label={'Marker Note'} Field={'note'} Setter={state => applyToMarker(state, editFromArray)} Rows={3} Valid={() => true} />
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
                        <CheckBox<TrendSearch.IVertHori> Record={currentMarker as TrendSearch.IVertHori} Label={'Move to Right Axis'} Field={'axis'} Setter={marker => applyToMarker(marker, editFromArray)} />
                    </>
                );
            case 'Event':
                return (
                    <>
                        {props.EventSettings.type === "vertical" ?
                            <>
                                <BlockPicker onChangeComplete={(color) => setSettings({ ...currentMarker, color: color.hex } as TrendSearch.IEventVertSettings)}
                                    color={currentMarker['color']} triangle={"hide"} />
                                <Select<TrendSearch.IEventVertSettings> Record={currentMarker as TrendSearch.IEventVertSettings} Label={'Line Style'} Field={'line'} Setter={setSettings} Options={LineTypeOptions} />
                                <Input<TrendSearch.IEventVertSettings> Record={currentMarker as TrendSearch.IEventVertSettings} Label={'Line Width (pixels)'} Field={'width'} Setter={setSettings} Type={'number'}
                                    Feedback={"Width must be a positive number"} Valid={() => {
                                        return (currentMarker['width'] ?? 0) > 0;
                                    }} />
                            </> 
                            :
                            null //Todo: symbolic case
                        }
                        <CheckBox<TrendSearch.EventMarkerSettings> Record={props.EventSettings} Label={'Move to Right Axis'} Field={'axis'} Setter={setSettings} />
                    </>);
            case undefined:
                return null
            default:
                console.warn(`Unexpected marker type ${currentType}`);
                return null;
        }
    }, [currentType, currentMarker, applyToMarker, editFromArray, LineTypeOptions, props.EventSettings, props.SetEventSettings]);

    // Loading all SVGIcons into the options menue
    const markerSymbolOptions = [];
    Object.keys(SVGIcons).forEach((iconName) => {
        markerSymbolOptions.push({ Value: SVGIcons[iconName], Element: SVGIcons[iconName]})
    });

    return (
        <div className="row" style={{ paddingLeft: 20, paddingRight: 20 }}>
            <div className="col" style={{ width: '40%', height: markersHeight }}>
                <TrendMarkerTable Height={markersHeight} Markers={allMarkers}
                    RemoveMarker={id => applyToMarker({ ID: id, axis: 'left' }, removeFromArray)}
                    Selected={currentMarker} SetSelected={setCurrentMarker} />
            </div>
            <div className="col" style={{ width: '60%' }} ref={sideMarkerRef}>
                {getSettingsList()}
            </div>
        </div>
    );
});

export { MarkerTab };