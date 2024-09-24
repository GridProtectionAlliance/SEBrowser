//******************************************************************************************************
//  MeterActivity.tsx - Gbtc
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
//  04/08/2019 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import React from 'react';
import { ReactTable } from '@gpa-gemstone/react-table';
import SEBrowserService from './../../TS/Services/SEBrowser';
import moment from 'moment';

declare let xdaInstance: string;
declare let homePath: string;

//const autoUpdate = setInterval(
//    function () {
//        //buildMeterActivityTables();
//    }, updateInterval);

const momentFormat = "YYYY/MM/DD HH:mm:ss";
const MeterActivity: React.FunctionComponent = () => {

    return (
        <div id="meterActivityContainer" style={{ width: '100%', height: '100%', textAlign: 'center', backgroundColor: '#064e1b', padding: 20 }}>
            <div style={{ width: 'calc(50% - 10px)', height: 'calc(100% - 57px)', position: 'relative', float: 'left' }}>
                <div style={{ backgroundColor: 'white', borderColor: 'black', color: 'black', textAlign: 'left', marginBottom: 0, height: 'calc(50% - 15px)', padding: 15 }} className="well well-sm">
                    <MostActiveMeters />
                </div>
                <div style={{ marginTop: 20, backgroundColor: 'white', borderColor: 'black', color: 'black', textAlign: 'left', marginBottom: 0, height: 'calc(50% - 10px)', padding: 15 }} className="well well-sm">
                    <LeastActiveMeters />
                </div>
            </div>
            <div style={{  backgroundColor: 'white', borderColor: 'black', color: 'black', textAlign: 'left', marginBottom: 0, height: 'calc(100% - 57px)', width: 'calc(50% - 11px)', position: 'relative', float: 'right', padding: 15 }} className="well well-sm">
                <FilesProcessed />
            </div>
        </div>
    );

}

export default MeterActivity;

interface MostActiveMeterActivityRow {
    AssetKey: string,
    sortField: string,
    '24Hours': number,
    '7Days': number,
    '30Days': number
}

class MostActiveMeters extends React.Component<unknown, {
    meterTable: Array<MostActiveMeterActivityRow>,
    sortField: string,
    rowsPerPage: number
}>{
    seBrowserService: SEBrowserService;
    constructor(props) {
        super(props);

        this.seBrowserService = new SEBrowserService();

        this.state = {
            meterTable: [],
            sortField: '24Hours',
            rowsPerPage: 7
        }
    }

    componentDidMount() {
        $(window).on('resize', () => this.resize());

        this.resize();
    }

    componentWillUnmount() {
        $(window).off('resize');
    }

    createTableRows() {
        this.seBrowserService.getMostActiveMeterActivityData(5000, this.state.sortField).done(data => {
            this.setState({ meterTable: data });
        });
    }

    resize() {
        const headerHeight = $(this.refs.divElement).find('th').innerHeight();
        const height = $(this.refs.divElement).height() - headerHeight;
        let rowHeight = $(this.refs.divElement).find('td').innerHeight();

        if (headerHeight == headerHeight) rowHeight = 43;
        if (rowHeight == undefined) rowHeight = 48;

        this.setState({ rowsPerPage: Math.floor(height / rowHeight) }, () => this.createTableRows());
    }

    createContent(item, key: keyof (MostActiveMeterActivityRow)) {
        let context = '';
        if (key == '24Hours') {
            context = '24h';
        }
        else if (key == '7Days') {
            context = '7d';
        }
        else if (key == '30Days') {
            context = '30d';
        }
        else {
            context = '24h';
        }

        if (item[key] != '0 ( 0 )') {
            return <a onClick={() => this.openWindowToMeterEventsByLine(item.FirstEventID, context, moment().format(momentFormat))} style={{ color: 'blue' }}>{item[key]}</a>
        }
        else {
            return <span>{item[key]}</span>;
        }
    }

    openWindowToMeterEventsByLine(id, context, sourcedate) {
        window.open(homePath + "Main/MeterEventsByLine?eventid=" + id + "&context=" + context + "&posteddate=" + sourcedate, id + "MeterEventsByLine");
        return false;
    }

    render() {
        return (
            <div style={{ height: '100%' }}>
                <h3 style={{ display: 'inline' }}>Most Active Meters</h3>
                <span style={{ float: 'right', color: 'silver' }}>{/*Click on event count to view events*/}</span>
                <div style={{ height: '2px', width: '100%', display: 'inline-block', backgroundColor: 'black' }}></div>
                <div style={{ backgroundColor: 'white', borderColor: 'black', height: 'calc(100% - 60px)', overflowY: 'auto'}} ref='divElement'>
                    <ReactTable.Table<MostActiveMeterActivityRow>
                        TableClass="table"
                        KeySelector={item => item.AssetKey}
                        Data={this.state.meterTable}
                        SortKey={this.state.sortField }
                        Ascending={true}
                        Selected={() => false}
                        OnSort={(col) => { this.setState({ sortField: col.colKey }, this.createTableRows) }}
                        OnClick={() => {/*Do Nothing*/}}
                        TheadStyle={{ fontSize: 'smaller' }}
                    >
                        <ReactTable.Column<MostActiveMeterActivityRow>
                            Key={'AssetKey'}
                            AllowSort={true}
                            Field={'AssetKey'}
                            HeaderStyle={{ width: 'auto' }}
                            RowStyle={{ width: 'auto' }}
                        > Name
                        </ReactTable.Column>
                        <ReactTable.Column<MostActiveMeterActivityRow>
                            Key={'24Hours'}
                            AllowSort={true}
                            Field={'24Hours'}
                            HeaderStyle={{ width: '20%' }}
                            RowStyle={{ width: '20%' }}
                            Content={row => this.createContent(row.item, row.field)}
                        > Files(Evts) 24H
                        </ReactTable.Column>
                        <ReactTable.Column<MostActiveMeterActivityRow>
                            Key={'7Days'}
                            AllowSort={true}
                            Field={'7Days'}
                            HeaderStyle={{ width: '20%' }}
                            RowStyle={{ width: '20%' }}
                            Content={row => this.createContent(row.item, row.field)}
                        > Files(Evts) 7D
                        </ReactTable.Column>
                        <ReactTable.Column<MostActiveMeterActivityRow>
                            Key={'30Days'}
                            AllowSort={true}
                            Field={'30Days'}
                            HeaderStyle={{ width: '20%' }}
                            RowStyle={{ width: '20%' }}
                            Content={row => this.createContent(row.item, row.field)}
                        > Files(Evts) 30D
                        </ReactTable.Column>
                    </ReactTable.Table>
                </div>
            </div>
        );
    }
        
}
    
interface LeastActiveMeterActivityRow {
    AssetKey: string,
    '180Days': number,
    '90Days': number,
    '30Days': number,
    FirstEventID: number
}
        
class LeastActiveMeters extends React.Component<unknown, {
    meterTable: Array<LeastActiveMeterActivityRow>,
    sortField: string,
    rowsPerPage: number
}>{
    seBrowserService: SEBrowserService;
    constructor(props) {
        super(props);

        this.seBrowserService = new SEBrowserService();

        this.state = {
            meterTable: [],
            sortField: '30Days',
            rowsPerPage: 7
        }
    }

    componentDidMount() {
        $(window).on('resize', () => this.resize());

        this.resize();

    }

    componentWillUnmount() {
        $(window).off('resize');
    }


    resize() {
        const headerHeight = $(this.refs.divElement).find('th').innerHeight();

        const height = $(this.refs.divElement).height() - headerHeight;

        let rowHeight = $(this.refs.divElement).find('td').innerHeight();
        if (headerHeight == headerHeight) rowHeight = 43;
        if (rowHeight == undefined) rowHeight = 48;

        this.setState({ rowsPerPage: Math.floor(height / rowHeight) }, () => this.createTableRows());
    }


    createTableRows() {
        this.seBrowserService.getLeastActiveMeterActivityData(5000, this.state.sortField).done(data => {
            this.setState({ meterTable: data });
        });
    }

    createContent(item: LeastActiveMeterActivityRow, key: keyof(LeastActiveMeterActivityRow)) {
        let context = '';
        if (key == '180Days') {
            context = '180d';
        }
        else if (key == '90Days') {
            context = '90d';
        }
        else {
            context = '30d';
        }

        if (item[key] != '0 ( 0 )') {
            return <a onClick={() => this.openWindowToMeterEventsByLine(item.FirstEventID, context, moment().format(momentFormat))} style={{ color: 'blue' }}>{item[key]}</a>
        }
        else {
            return <span>{item[key]}</span>;
        }
    }

    openWindowToMeterEventsByLine(id, context, sourcedate) {
        window.open(homePath + "Main/MeterEventsByLine?eventid=" + id + "&context=" + context + "&posteddate=" + sourcedate, id + "MeterEventsByLine");
        return false;
    }

    render() {
        return (
            <div style={{ height: '100%' }}>
                <h3 style={{ display: 'inline' }}>Least Active Meters</h3>
                <span style={{ float: 'right', color: 'silver' }}>{/*Click on event count to view events*/}</span>
                <div style={{ height: '2px', width: '100%', display: 'inline-block', backgroundColor: 'black' }}></div>
                <div style={{ backgroundColor: 'white', borderColor: 'black', height: 'calc(100% - 60px)', overflowY: 'auto' }} ref='divElement'>
                    <ReactTable.Table<LeastActiveMeterActivityRow>
                        TableClass="table"
                        Data={this.state.meterTable}
                        SortKey={this.state.sortField}
                        Selected={() => false}
                        Ascending={true}
                        KeySelector={item => item.AssetKey}
                        OnSort={(col) => { this.setState({ sortField: col.colKey }, this.createTableRows) }}
                        OnClick={() => { /*Do Nothing*/ }}
                        TheadStyle={{ fontSize: 'smaller' }}
                    >
                        <ReactTable.Column<LeastActiveMeterActivityRow>
                            Key={'AssetKey'}
                            AllowSort={true}
                            Field={'AssetKey'}
                            HeaderStyle={{ width: 'auto' }}
                            RowStyle={{ width: 'auto' }}
                        > Name
                        </ReactTable.Column>
                        <ReactTable.Column<LeastActiveMeterActivityRow>
                            Key={'30Days'}
                            AllowSort={true}
                            Field={'30Days'}
                            HeaderStyle={{ width: '20%' }}
                            RowStyle={{ width: '20%' }}
                            Content={row => this.createContent(row.item, row.field)}
                        > Files(Evts) 30D
                        </ReactTable.Column>
                        <ReactTable.Column<LeastActiveMeterActivityRow>
                            Key={'90Days'}
                            AllowSort={true}
                            Field={'90Days'}
                            HeaderStyle={{ width: '20%' }}
                            RowStyle={{ width: '20%' }}
                            Content={row => this.createContent(row.item, row.field)}
                        > Files(Evts) 90D
                        </ReactTable.Column>
                        <ReactTable.Column<LeastActiveMeterActivityRow>
                            Key={'180Days'}
                            AllowSort={true}
                            Field={'180Days'}
                            HeaderStyle={{ width: '20%' }}
                            RowStyle={{ width: '20%' }}
                            Content={row => this.createContent(row.item, row.field)}
                        > Files(Evts) 180D
                        </ReactTable.Column>
                    </ReactTable.Table>
                </div>
            </div>
        );
    }
}

class FilesProcessed extends React.Component<unknown, { meterTable: Array<JSX.Element>, sortField: string}>{
    seBrowserService: SEBrowserService;
    constructor(props) {
        super(props);

        this.seBrowserService = new SEBrowserService();

        this.state = {
            meterTable: [],
            sortField: 'CreationTime',
        }
    }

    componentDidMount() {
        this.createTableRows()
    }


    createTableRows() {
        this.seBrowserService.getFilesProcessedMeterActivityData(this.state.sortField).done(data => {
            this.setState({
                meterTable: data.map((x) => <ListItem key={x.FilePath} CreationTime={x.CreationTime} FilePath={x.FilePath} FileGroupID={x.FileGroupID}/>) });
        });
    }


    render() {
        return (
            <div style={{ height: '100%', maxHeight: 'calc(100%)', overflowY: 'auto', overflowX: 'hidden' }}>
                <h3 style={{ display: 'inline' }}>FILES PROCESSED LAST 24 HOURS</h3>
                <span style={{ float: 'right', color: 'silver' }} id="files-hint">Expand row to view events</span>
                <div style={{ height: 2, width: '100%', display: 'inline-block', backgroundColor: 'black' }}></div>
                <div id="meter-activity-files" style={{ backgroundColor: 'white', borderColor: 'black' }}></div>
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    <li key='header' style={{ width: '100%', borderTop: '1px solid #dee2e6'}}><div style={{ display: 'table-cell', verticalAlign: 'inherit', fontWeight: 'bold', textAlign: 'inherit', padding: '.75em', width: 50, fontSize: 'smaller' }}></div><div style={{ display: 'table-cell', verticalAlign: 'inherit', fontWeight: 'bold', textAlign: 'inherit', padding: '.75em', width: 'calc(30% - 50px)', fontSize: 'smaller' }}>Time Processed</div><div style={{ display: 'table-cell', verticalAlign: 'inherit', fontWeight: 'bold', textAlign: 'inherit', padding: '.75em', width: 'calc(70%)', fontSize: 'smaller'  }}>File</div></li>
                    {this.state.meterTable}
                </ul>
            </div>
        );
    }

}

const ListItem = (props: { CreationTime: string, FilePath: string, FileGroupID: number }) => {
    const [isOpen, setOpen] = React.useState<boolean>(false);
    const [eventTable, setEventTable] = React.useState<Array<JSX.Element>>([]);

    const seBrowserService = new SEBrowserService();

    React.useEffect(() => {
        seBrowserService.getFileGroupEvents(props.FileGroupID).done(data => {
            const arr = data.map(x => <tr key={x.ID} ><td><a style={{ color: 'blue' }} href={homePath + 'Main/OpenSEE?eventid=' + x.ID} target="_blank">{x.LineName}</a></td><td>{moment.utc(x.StartTime).format('MM/DD/YY HH:mm:ss')}</td><td>{x.EventTypeName}</td></tr>);
            setEventTable(arr);
        });
    }, []);

    function buildFileGroupContent(row) {
        const filepathParts = row.FilePath.split('\\');
        const fullFilename = filepathParts[filepathParts.length - 1];
        let filenameParts = fullFilename.split('.');
        const filenameWithoutExtension = filenameParts.splice(0, filenameParts.length - 1).join('.');
        filenameParts = filenameWithoutExtension.split(',');
        let shortFilename = "";

        // This is to eliminate the timestamp in the fullFilename for the shortFilename
        let inTimestamp = true;
        for (let i = 0; i < filenameParts.length; i++) {
            if (inTimestamp) {
                if (!(/^-?\d/.test(filenameParts[i]))) {
                    inTimestamp = false;
                    shortFilename += filenameParts[i];
                }
            }
            else {
                shortFilename += ',' + filenameParts[i];
            }
        }

        if (shortFilename == "") {
            shortFilename = filenameWithoutExtension;
        }

        const html = <a href={xdaInstance + '/Workbench/DataFiles.cshtml'} title={fullFilename} style={{ color: 'blue' }} target="_blank">{shortFilename}</a>;

        return html;
    }

    return (
        <li style={{ width: '100%', borderTop: '1px solid #dee2e6' }}>
            <div className="row">
            <div style={{ display: 'table-cell', verticalAlign: 'inherit', textAlign: 'inherit', padding: '.75em', width: 50 }}>
                    <button className="btn" onClick={() => setOpen(!isOpen)}><span className={'fa fa-arrow-circle-' + (isOpen? 'down':'right')}></span></button>
            </div>
            <div style={{ display: 'table-cell', verticalAlign: 'inherit', fontWeight: 'bold', textAlign: 'inherit', padding: '.75em', width: 'calc(30% - 50px)', fontSize: 'smaller' }}>
                <span>{moment(props.CreationTime).format('MM/DD/YYYY')}<br />{moment(props.CreationTime).format('HH:mm:ss.SSSSSSS')}</span>
            </div>
            <div style={{ display: 'table-cell', verticalAlign: 'inherit', textAlign: 'inherit', padding: '.75em', width: 'calc(70%)' }}>
                {buildFileGroupContent(props)}
                </div>
            </div>
            <div className="row" style={{display: (isOpen ? 'block' : 'none'), padding: '5px 20px'}}>
                <table className='table'>
                    <thead>
                        <tr><th>Line</th><th>Start Time</th><th>Type</th></tr>
                    </thead>
                    <tbody>
                        {eventTable}
                    </tbody>
                </table>
            </div>
        </li>
    );
}
