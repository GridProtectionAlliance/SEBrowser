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

export default class TVAESRIMap extends React.Component<{ EventID: number }, { LtgSource: '0' | '1', Results: any, LineNumber: string, Latitude: string, Longitude: string, Inception: Date, Window: number }, {}>{
    graphicsUtils: any;
    Point: any;
    Query: any;
    QueryTask: any;
    Graphic: any;
    GeometryService: any;
    BufferParameters: any;
    map: any;
    faultSymbol: any;
    ltgSymbol: any;
    lineSymbol: any;

    constructor(props, context) {
        super(props, context);

        this.state = {
            Results: null,
            LineNumber: null,
            Latitude: '0',
            Longitude: '0',
            Inception: null,
            LtgSource: '0',
            Window: 2
        };

        this.execute = this.execute.bind(this);
        this.reset = this.reset.bind(this);
        this.executeltg = this.executeltg.bind(this);
        this.showResults = this.showResults.bind(this);
        this.zoomLine = this.zoomLine.bind(this);
    }

    GetFaultInfo() {
        return $.ajax({
            type: "GET",
            url: `${homePath}api/OpenXDA/GetFaultInfo/${this.props.EventID}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        }).done(data => this.setState({LineNumber: data.LineNumber, Inception: new Date(data.Inception), Latitude: data.Latitude, Longitude: data.Longitude }));
    }
    async componentDidMount() {
        await this.GetFaultInfo();

        let esri = (window as any).esri;
        esri.require([
            "esri/map", "esri/graphicsUtils", "esri/layers/ArcGISDynamicMapServiceLayer", "esri/layers/ImageParameters", "esri/geometry/Point",
            "esri/tasks/query", "esri/tasks/QueryTask", "esri/graphic", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol",
            "esri/tasks/GeometryService", "esri/tasks/BufferParameters", "esri/urlUtils"
        ], (Map, graphicsUtils, ArcGISDynamicServiceLayer, ImageParameters, Point, Query, QueryTask, Graphic, SimpleMarkerSymbol,
            SimpleLineSymbol, SimpleFillSymbol, GeometryService, BufferParameters, urlUtils) => {
            this.graphicsUtils = graphicsUtils;
            this.Point = Point;
            this.Query = Query;
            this.QueryTask = QueryTask;
            this.Graphic = Graphic;
            this.GeometryService = GeometryService;
            this.BufferParameters = BufferParameters;

            urlUtils.addProxyRule({
                proxyUrl: "http://pq/arcgisproxynew/proxy.ashx",
                urlPrefix: "https://gis.tva.gov/arcgis/rest/services/"
            });

            let fltLine = new SimpleLineSymbol();
            fltLine.setWidth(3);
            fltLine.setColor({ r: 26, g: 26, b: 26, a: 1 });

            this.faultSymbol = new SimpleMarkerSymbol();
            this.faultSymbol.setStyle(SimpleMarkerSymbol.STYLE_X);
            this.faultSymbol.setColor({ r: 255, g: 0, b: 0, a: 0 });

            this.faultSymbol.setOutline(fltLine);

            let ltgLine = new SimpleLineSymbol();
            ltgLine.setWidth(3);
            ltgLine.setColor({ r: 230, g: 230, b: 0, a: 1 });

            this.ltgSymbol = new SimpleMarkerSymbol();
            this.ltgSymbol.setStyle(SimpleMarkerSymbol.STYLE_DIAMOND);
            this.ltgSymbol.setColor({ r: 230, g: 230, b: 0, a: 1 });
            this.ltgSymbol.setOutline(ltgLine);

            this.lineSymbol = new SimpleFillSymbol();
            this.lineSymbol.setColor({ r: 100, g: 100, b: 100, a: 0.25 });
            this.lineSymbol.setOutline(null);

            this.map = new Map("map", { basemap: "gray", center: [-86, 35], zoom: 7 });


            var txLayer = new ArcGISDynamicServiceLayer("https://gis.tva.gov/arcgis/rest/services/EGIS_Transmission/Transmission_Grid_Restricted_2/MapServer", { "id": "txlines", "opacity": 0.5, "visible": true });
            this.map.addLayer(txLayer);


            var imageParms = new ImageParameters();
            imageParms.layerIds = [8];
            imageParms.layerOption = ImageParameters.LAYER_OPTION_SHOW;
            var lscLayer = new ArcGISDynamicServiceLayer("https://gis.tva.gov/arcgis/rest/services/EGIS_Transmission/Transmission_Station_Assets/MapServer", { "id": "LSC", "visible": true, "imageParameters": imageParms });
            this.map.addLayer(lscLayer);


            var lineHazardsLayer = new ArcGISDynamicServiceLayer("https://gis.tva.gov/arcgis/rest/services/EGIS_Transmission/Property_Hazards/MapServer", { "id": "lineHazards", "opacity": 0.5, "visible": true });
            this.map.addLayer(lineHazardsLayer);

            this.map.on("load", this.execute);

        });

    }

    execute() {
        this.map.graphics.clear();
        this.map.centerAndZoom([-86, 35], 7);

        let lnqueryTask = new this.QueryTask("https://gis.tva.gov/arcgis/rest/services/EGIS_Transmission/Transmission_Grid_Restricted_2/MapServer/6");
        let lnQuery = new this.Query();
        lnQuery.returnGeometry = true;
        lnQuery.outFields = ["LINENAME"];


        lnQuery.where = "UPPER(LINENAME) like '%" + this.state.LineNumber.toUpperCase() + "%'";
        lnqueryTask.execute(lnQuery, this.executeltg);
    }

    reset() {
        this.execute();
    }

    getOffset(t: Date) { //t is the date object to check, returns CDT daylight saving time is in effect.
        return t.toTimeString().indexOf("ST") > 0 ? 'CST' : 'CDT';
    }

    executeltg(results) {
        let esri = (window as any).esri;

        let query = new this.Query();
        query.returnGeometry = true;
        query.outFields = [
            "DISPLAYTIME", "LATITUDE", "LONGITUDE", "AMPLITUDE"
        ];

        let gsvc = new this.GeometryService("https://gis.tva.gov/arcgis/rest/services/Utilities/Geometry/GeometryServer");
        let ltgqturl = "https://gis.tva.gov/arcgis/rest/services/EGIS/LightningQuery/MapServer/" + this.state.LtgSource;
        let ltgqueryTask = new this.QueryTask(ltgqturl);

   
        let starttime = new Date(this.state.Inception)
        starttime.setSeconds(this.state.Inception.getSeconds() - this.state.Window);
        let endtime = new Date(this.state.Inception)
        endtime.setSeconds(this.state.Inception.getSeconds() + this.state.Window)

        let startoffset = this.getOffset(starttime);
        let endoffset = this.getOffset(endtime);


        starttime = new Date(`${starttime} ${startoffset}`);
        endtime = new Date(`${endtime} ${endoffset}`);

        query.timeExtent = { startTime: starttime, endTime: endtime, toJson: () => [starttime.getTime(), endtime.getTime()] };


        //combine line search results into a single feature
        let totalLine = [];

        for (let i = 0, il = results.features.length; i < il; i++) {
            totalLine.push(results.features[i].geometry);
        }

        let params = new this.BufferParameters();
        params.geometries = totalLine;
        params.unionResults = true;
        params.distances = [0.5];
        params.unit = esri.tasks.GeometryService.UNIT_STATUTE_MILE;
        gsvc.buffer(params, geometries => {
            let graphic = new this.Graphic(geometries[0], this.lineSymbol);
            this.map.graphics.add(graphic);
            query.geometry = geometries[0];
            query.spatialrealationship = esri.tasks.Query.SPATIAL_REL_INTERSECTS;
            //zoom
            this.zoomLine();
            ltgqueryTask.execute(query, this.showResults);

        });


    }


    zoomLine() {
        this.map.setExtent(this.graphicsUtils.graphicsExtent(this.map.graphics.graphics), true);
        //add fault location to map
        if (this.state.Latitude.length > 0) {
            if (this.state.Longitude.length > 0) {
                var faultpoint = new this.Point(this.state.Longitude, this.state.Latitude);
                let graphic = new this.Graphic(faultpoint, this.faultSymbol);
                this.map.graphics.add(graphic);
            }
        }

    }


    showResults(results) {
        this.setState({ Results: results });

        for (let i = 0; i < results.features.length; i++) {
            let graphic = new this.Graphic(results.features[i].geometry, this.ltgSymbol);
            this.map.graphics.add(graphic);
        }
    }

    render() {
        return (
            <div className="card">
                <div className="card-header">ESRI Map</div>
                <div className="card-body">

                    <div id="map" style={{ height: 400, padding: 5, border: 'solid 1px gray' }}>
                        <select className="form-control" style={{ width: 100, position: "absolute", zIndex: 1, top: 80, right: 30 }} value={this.state.LtgSource} onChange={(evt) => this.setState({ LtgSource: evt.target.value as '0' | '1' })}><option value="0">Vaisala</option><option value="1">Weatherbug</option></select>
                    </div>

                <div className="form-inline">
                    <div className="form-group" >
                        <label className="" style={{ margin: '0 10px 0 10px' }}>Time Window:</label>
                        <input className="form-control" type="text" value={this.state.Window} onChange={(evt) => this.setState({ Window: parseInt(evt.target.value, 10) })} />

                    </div>
                    <div className="form-group" style={{ width: 150 }}>
                        <label className="" style={{ margin: '0 10px 0 10px' }}>Line No:</label>
                        <input className="form-control" type="text" id="lno" value={this.state.LineNumber} onChange={(evt) => this.setState({ LineNumber: evt.target.value })} />
                    </div>
                    <div className="form-group">
                        <button onClick={(evt) => this.execute()}>Get Details</button>
                        <button onClick={(evt) => this.reset()}>Reset</button>
                    </div>

                </div>
                <div style={{ maxHeight: window.innerHeight * 0.3 - 45, overflowY: "auto" }}>
                    {(this.state.Results == null ? <span>Searching...</span> : null)}
                    {(this.state.Results != null && this.state.Results.features.length == 0 ? <span>No Lightning Records Found</span> : null)}
                    {(this.state.Results != null && this.state.Results.features.length > 0 ?
                        <table className="table" style={{ maxHeight: 'calc(30% - 50px)', height: 'calc(30% - 50px)' }}>
                            <thead>
                                <tr>{Object.keys(this.state.Results.features[0].attributes).map((attr, index) => <th key={index}>{attr}</th>)}</tr>
                            </thead>
                            <tbody>
                                {this.state.Results.features.map((feature, index) => <tr key={index}>{Object.keys(feature.attributes).map((attribute, i) => <td key={i}>{feature.attributes[attribute]}</td>)}</tr>)}
                            </tbody>
                        </table>
                        : null)}
                </div>
                </div>
            </div>
        );
    }

}

let queryString = {
    StartTime: '',
    EndTime: '',
    LineNumber: '',
    FaultLatitude: '',
    FaultLongitude: ''
};

decodeURI(location.search).replace(new RegExp("([^?=&]+)(=([^&]*))?", "g"), ($0, $1, $2, $3) => queryString[$1] = $3);
