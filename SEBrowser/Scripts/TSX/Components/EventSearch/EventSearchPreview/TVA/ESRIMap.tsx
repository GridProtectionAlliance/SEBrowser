//******************************************************************************************************
//  TVAESRIMap.tsx - Gbtc
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
//  02/27/2020 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import React from 'react';
import leaflet from 'leaflet';
import { basemapLayer, dynamicMapLayer } from 'esri-leaflet';
import proj4 from 'proj4';
import 'proj4leaflet';
import moment from 'moment';

export default class ESRIMap extends React.Component<{ EventID: number }, { Results: any, FaultInfo: Array<{ StationName: string, Inception: number, Latitude: number, Longitude: number, Distance: number, AssetName: string }>, Window: number }, {}>{
    map: leaflet.Map;
    constructor(props, context) {
        super(props, context);

        this.state = {
            Results: null,
            FaultInfo: [],
            Window: 2, 
        };

        proj4.defs('EPSG:3857', "+title=WGS 84 / Pseudo-Mercator +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs");

    }

    GetFaultInfo(): JQuery.jqXHR<Array<{ StationName: string, Inception: number, Latitude: number, Longitude: number, Distance: number, AssetName: string}>>{
        return $.ajax({
            type: "GET",
            url: `${homePath}api/OpenXDA/GetFaultInfo/${this.props.EventID}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });
    }

    GetLightningInfo() {
        return $.ajax({
            type: "GET",
            url: `${homePath}api/OpenXDA/GetLightningInfo/${this.props.EventID}/${this.state.Window}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });
    }

    async componentDidMount() {
        const faultInfo = await this.GetFaultInfo();
        this.setState({ FaultInfo: faultInfo });
        const lightningInfo = await this.GetLightningInfo();
        this.setState({ Results: lightningInfo });
        this.map = leaflet.map('map', { center: [35, -85], zoom: 7 });
        basemapLayer('Gray').addTo(this.map);

        let transmissionLayer = dynamicMapLayer({ url:'', opacity: 0.3, f: 'image' });
        transmissionLayer.options['url'] = `http://pq/arcgisproxynew/proxy.ashx?https://gis.tva.gov/arcgis/rest/services/EGIS_Transmission/Transmission_Grid_Restricted_2/MapServer/`;
        transmissionLayer.options['f'] = 'image';
        transmissionLayer.bindPopup((err, featureCollection, response) => console.log(featureCollection)).addTo(this.map);
            
        let safetyLayer = dynamicMapLayer({ url: ``, opacity: 1, f: 'image' });
        safetyLayer.options['url'] = `http://pq/arcgisproxynew/proxy.ashx?https://gis.tva.gov/arcgis/rest/services/EGIS_Edit/safetyHazards/MapServer/`;
        safetyLayer.options['f'] = 'image';
        safetyLayer.addTo(this.map);

        let lscLayer = dynamicMapLayer({ url: ``, opacity: 0.3, f: 'image' });
        lscLayer.options['url'] = `http://pq/arcgisproxynew/proxy.ashx?https://gis.tva.gov/arcgis/rest/services/EGIS_Transmission/Transmission_Station_Assets/MapServer/`;
        lscLayer.options['f'] = 'image';
        lscLayer.addTo(this.map);

        let time = moment(faultInfo[0]?.Inception);
        let timestring = time.utc().format('YYYY-MM-DDTHH') + ':' + (time.minutes() - time.minutes() % 5).toString();

        var radar_current = leaflet.tileLayer.wms("https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r-t.cgi?time=" + timestring + '&', {
            layers: 'nexrad-n0r-wmst',
            format: 'image/png',
            transparent: true,
            opacity: 0.5,
            attribution: "Weather data © 2016 IEM Nexrad",
        });

        this.map.addLayer(radar_current);

        if (lightningInfo.length > 0) {
            let lightningIcon = leaflet.icon({
                iconUrl: homePath + 'Images/lightning.png',
                iconSize:[20,25]
            });

            for (let i = 0; i < lightningInfo.length; i++) {
                leaflet.marker([lightningInfo[i].Latitude, lightningInfo[i].Longitude], {icon: lightningIcon}).addTo(this.map);
            }
        }


        if (faultInfo.length > 0) {
            leaflet.marker([faultInfo[0]?.Latitude, faultInfo[0]?.Longitude]).addTo(this.map);
        }

        $.ajax({
            type: 'GET',
            url: `http://pq/arcgisproxynew/proxy.ashx?https://gis.tva.gov/arcgis/rest/services/EGIS_Transmission/Transmission_Grid_Restricted_2/MapServer/6/query?`+ encodeURI(`f=json&where=UPPER(LINENAME) like '%${this.state.FaultInfo[0]?.AssetName.toUpperCase()}%'&returnGeometry=true&outfiels=LINENAME`),
            contentType: "application/json; charset=utf-8",
            cache: false,
            async: true


        }).done(lineGeometeries => {
            let params = {
                f: 'json',
                unionResults: true,
                geodesic: false,
                distances: 0.5,
                geometries: JSON.stringify({ geometryType: "esriGeometryPolyline",geometries: JSON.parse(lineGeometeries).features.map(a => a.geometry) }),
                inSR: 102100,
                unit: 9093
            }

            $.ajax({
                type: 'POST',
                url: 'http://pq/arcgisproxynew/proxy.ashx?https://gis.tva.gov/arcgis/rest/services/Utilities/Geometry/GeometryServer/buffer',
                data: params,
                dataType: 'application/json',
                cache: false,
                async: true
            }).always(rsp => {
                let buffer = leaflet.Proj.geoJson(this.poly(JSON.parse(rsp.responseText).geometries[0]), {
                    style: function (feature) {
                        return { color: feature.properties.color, opacity: feature.properties.opacity };
                    }
                });

                buffer.addTo(this.map);
                this.map.fitBounds(buffer.getBounds());
            });

        })
    }


    poly(geometry): any {
        var outPut = {
            "type": "FeatureCollection",
            "features": []
        };
        //first we check for some easy cases, like if their is only one ring
        if (geometry.rings.length === 1) {
            outPut.features.push({ type: 'Feature', properties: { color: 'black', opacity: 1 }, geometry: { "type": "Polygon", "coordinates": geometry.rings }, crs: { type: "name", properties: { name: "EPSG:3857" } } });
        } else {
            /*if it isn't that easy then we have to start checking ring direction, basically the ring goes clockwise its part of the polygon, if it goes counterclockwise it is a hole in the polygon, but geojson does it by haveing an array with the first element be the polygons and the next elements being holes in it*/
            var ccc = this.dP(geometry.rings);
            var d = ccc[0];
            var dd = ccc[1];
            var r = [];
            if (dd.length === 0) {
                /*if their are no holes we don't need to worry about this, but do need to stuck each ring inside its own array*/
                var l2 = d.length;
                var i3 = 0;
                while (l2 > i3) {
                    r.push([d[i3]]);
                    i3++;
                }
                outPut.features.push({ type: 'Feature', properties: { color: 'black', opacity: 1 }, geometry: { "type": "MultiPolygon", "coordinates": r }, crs: { type: "name", properties: { name: "EPSG:3857" } } });
            } else if (d.length === 1) {
                /*if their is only one clockwise ring then we know all holes are in that poly*/
                dd.unshift(d[0]);
                outPut.features.push({ type: 'Feature', properties: { color: 'black', opacity: 1 }, geometry: { "type": "Polygon", "coordinates": dd }, crs: { type: "name", properties: { name: "EPSG:3857" } } });

            } else {
                /*if their are multiple rings and holes we have no way of knowing which belong to which without looking at it specially, so just dump the coordinates and add  a hole field, this may cause errors*/
                outPut.features.push({ type: 'Feature', properties: { color: 'black', opacity: 1 }, geometry: { "type": "MultiPolygon", "coordinates": d, "holes": dd }, crs: { type: "name", properties: { name: "EPSG:3857" } }});
            }

        }

        return outPut
    }

    dP(a) {
        //returns an array of 2 arrays, the first being all the clockwise ones, the second counter clockwise
        var d = [];
        var dd = [];
        var l = a.length;
        var ii = 0;
        while (l > ii) {
            if (this.c(a[ii])) {
                d.push(a[ii]);
            } else {
                dd.push(a[ii]);
            }
            ii++;
        }
        return [d, dd];
    }

    c(a) {
        //return true if clockwise
        var l = a.length - 1;
        var i = 0;
        var o = 0;

        while (l > i) {
            o += (a[i][0] * a[i + 1][1] - a[i + 1][0] * a[i][1]);

            i++;
        }
        return o <= 0;
    }

    epsg3857ToLatLong(a:[number,number]): [number,number]
    {
        let e = 2.7182818284;
        let x = 20037508.34;

        let lon = a[1] * 180 / x;
        let lat = a[0] * x / 180;
        lat = Math.atan(Math.E^(Math.PI*lat/180))/(Math.PI/360) - 90;

        return [lat,lon];

    }

    render() {
        return (
            <div className="card">
                <div className="card-header">ESRI Map</div>
                <div className="card-body">

                    <div id="map" style={{ height: 400, padding: 5, border: 'solid 1px gray' }}>
                        <select className="form-control" style={{ width: 100, position: "absolute", zIndex: 1000, top: 10, right: 10 }} value={this.state.Window} onChange={(evt) => this.setState({ Window: parseInt(evt.target.value) },() => this.componentDidMount())}>
                            <option value="2">+/- 2 sec</option>
                            <option value="5">+/- 5 sec</option>
                            <option value="10">+/- 10 sec</option>
                            <option value="20">+/- 20 sec</option>
                            <option value="30">+/- 30 sec</option>
                            <option value="60">+/- 60 sec</option>
                        </select>
                    </div>
                <div style={{ maxHeight: window.innerHeight * 0.3 - 45, overflowY: "auto" }}>
                    {(this.state.Results == null ? <span>Searching...</span> : null)}
                    {(this.state.Results != null && this.state.Results.length == 0 ? <span>No Lightning Records Found</span> : null)}
                    {(this.state.Results != null && this.state.Results.length > 0 ?
                        <table className="table" style={{ maxHeight: 'calc(30% - 50px)', height: 'calc(30% - 50px)' }}>
                            <thead>
                                <tr>{Object.keys(this.state.Results[0]).map((attr, index) => <th key={index}>{attr}</th>)}</tr>
                            </thead>
                            <tbody>
                                    {this.state.Results.map((result, index) => <tr key={index}>{Object.keys(result).map((attribute, i) => <td key={i}>{result[attribute]}</td>)}</tr>)}
                            </tbody>
                        </table>
                        : null)}
                </div>
                </div>
            </div>
        );
    }

}