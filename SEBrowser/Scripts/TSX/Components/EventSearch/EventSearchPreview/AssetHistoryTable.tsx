import React from 'react';
import moment from 'moment';
import { SEBrowser } from '../../../global';
import Table from '@gpa-gemstone/react-table';

const AssetHistoryTable: React.FC<SEBrowser.IWidget<any>> = (props) => {
    const [historyData, setHistoryData] = React.useState<Array<any>>([]);
    const [count, setCount] = React.useState<number>(10);
    const [assetName, setAssetName] = React.useState<string>('');

    React.useEffect(() => {
        let handle = getHistoryData();
        handle.done((data) => {
            console.log(data);
            setHistoryData(data);

            if (data.length > 0) setAssetName(data[0].AssetName);
        });

        return () => {
            if (handle.abort != undefined) handle.abort();
        }
    }, [props.eventID, count]);

    function getHistoryData() {
        return $.ajax({
            type: "GET",
            url: `${homePath}api/OpenXDA/GetEventSearchHistory/${props.eventID}/${count}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });
    }

    return (
        <div className="card">
            <div className="card-header">Event History for {assetName}:
                <div className='pull-right'>Number of events: 
                    <select className='pull-right' value={count} onChange={(evt) => setCount(parseInt(evt.target.value))}>
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="75">75</option>
                        <option value="100">100</option>
                    </select>
                </div>
            </div>
            <div className="card-body">
                <Table
                    cols={[
                        { key: 'EventType', field: 'EventType', label: 'Event Type' },
                        { key: 'Date', field: 'StartTime', label: 'Date', content: (d) => moment(d.StartTime).format('MM/DD/YYYY HH:mm:ss.SSS') },
                        { key: 'Link', field: 'ID', label: '', content: (d) => <a href={openSEEInstance + '?eventid=' + d.ID} target="_blank">View in OpenSEE</a> },
                    ]}
                    data={historyData}
                    onClick={() => { }}
                    onSort={() => { }}
                    sortKey={''}
                    ascending={true}
                    tableClass="table"
                    theadStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%', height: 50 }}
                    tbodyStyle={{ display: 'block', overflowY: 'scroll', width: '100%' }}
                    rowStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                />
            </div>
        </div>
    );
}

export default AssetHistoryTable;