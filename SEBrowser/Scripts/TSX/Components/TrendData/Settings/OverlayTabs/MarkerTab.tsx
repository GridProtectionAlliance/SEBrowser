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
import { ILineSeries } from '../../TrendPlot/LineGraph';
import { ICyclicSeries } from '../../TrendPlot/CyclicHistogram';
import { TrendSearch } from '../../../../global';
import { Input, TextArea, StylableSelect } from '@gpa-gemstone/react-forms';
import { SVGIcons } from '@gpa-gemstone/gpa-symbols';
import TrendMarkerTable from '../../Components/TrendMarkerTable';

interface IMarkerTabProps {
    // Manage Markers
    Markers: TrendSearch.IMarker[],
    SetMarkers: (markers: TrendSearch.IMarker[]) => void
}

export type SeriesSettings = ILineSeries | ICyclicSeries;

const MarkerTab = React.memo((props: IMarkerTabProps) => {
    // Sizing Variables
    const sideMarkerRef = React.useRef(null);
    const [markersHeight, setMarkersHeight] = React.useState<number>(500);

    // Settings Controls
    const [currentMarker, setCurrentMarker] = React.useState<TrendSearch.IMarker>(undefined);

    // Get Heights and Widths
    React.useLayoutEffect(() => {
        const baseMarkerHeight = sideMarkerRef?.current?.offsetHeight ?? 400;
        setMarkersHeight(baseMarkerHeight < 400 ? 400 : baseMarkerHeight);
    });

    // Functions to handle removing/changing markers
    const removeMarker = React.useCallback((id: string) => {
        const allMarkers = [...props.Markers];
        const index = allMarkers.findIndex(marker => marker.ID === id);
        allMarkers.splice(index, 1);
        props.SetMarkers(allMarkers);
    }, [props.Markers, props.SetMarkers]);

    const editMarker = React.useCallback((marker: TrendSearch.IMarker) => {
        const allMarkers = [...props.Markers];
        const index = allMarkers.findIndex(mark => mark.ID === marker.ID);
        allMarkers.splice(index, 1, marker);
        // Handle updating list
        props.SetMarkers(allMarkers);
        // Handle updating current
        setCurrentMarker(marker);
    }, [props.Markers, props.SetMarkers]);

    // Loading all SVGIcons into the options menue
    const markerSymbolOptions = [];
    Object.keys(SVGIcons).forEach((iconName) => {
        markerSymbolOptions.push({ Value: SVGIcons[iconName], Element: SVGIcons[iconName]})
    });

    return (
        <div className="row" style={{ paddingLeft: 20, paddingRight: 20 }}>
            <div className="col" style={{ width: '40%', height: markersHeight }}>
                <TrendMarkerTable Height={markersHeight} Markers={props.Markers} RemoveMarker={removeMarker}
                    Selected={currentMarker} SetSelected={setCurrentMarker} />
            </div>
            <div className="col" style={{ width: '60%' }} ref={sideMarkerRef}>
                {currentMarker === undefined ? null :
                    <>
                        <StylableSelect<TrendSearch.IMarker> Record={currentMarker} Label={'Marker Symbol'} Field={'symbol'} Setter={editMarker} Options={markerSymbolOptions} />
                        <Input<TrendSearch.IMarker> Record={currentMarker} Label={'Infobox Opacity'} Field={'opacity'} Setter={editMarker} Feedback={"Opacity must be between 0 and 1"} Valid={() => {
                            return (currentMarker['opacity'] <= 1 && currentMarker['opacity'] > 0);
                        }} />
                        <Input<TrendSearch.IMarker> Record={currentMarker} Label={'Timestamp Format'} Field={'format'} Setter={editMarker} Feedback={"Must be a valid timestamp format"} Valid={() => {
                            // TODO: This must be a valid string, something to check this should be added to helper functions in gemstone soon
                            return true;
                        }} />
                        <TextArea<TrendSearch.IMarker> Record={currentMarker} Label={'Marker Note'} Field={'note'} Setter={editMarker} Rows={3} Valid={() => true } />
                    </>
                }
            </div>
        </div>
    );
});

export { MarkerTab };