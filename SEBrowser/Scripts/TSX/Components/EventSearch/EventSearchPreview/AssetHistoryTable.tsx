import React from 'react';
import moment from 'moment';
import { SEBrowser } from '../../../global';

const AssetHistoryTable: React.FC<SEBrowser.IWidget<any>> = (props) => {
    const [historyData, setHistoryData] = React.useState<Array<any>>([]);
    const [count, setCount] = React.useState<number>(10);

    React.useEffect(() => {
        let handle = getHistoryData();
        handle.done((data) => setHistoryData(data));

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
            <div className="card-header">Asset History Table:
                <select className='pull-right' value={count} onChange={(evt) => setCount(parseInt(evt.target.value))}>
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="75">75</option>
                    <option value="100">100</option>
                </select>
            </div>
            <div className="card-body">
                <table className="table">
                    <thead>
                        <tr><th>Event Type</th><th>Date</th><th></th></tr>
                    </thead>
                    <tbody>
                        {historyData.map((d, i) =>
                            <tr key={i}>
                                <td>{d.EventType}</td>
                                <td>{moment(d.StartTime).format('MM/DD/YYYY HH:mm:ss.SSS')}</td>
                                <td><a href={openSEEInstance + '?eventid=' + d.ID} target="_blank">View in OpenSEE</a></td>
                            </tr>)}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AssetHistoryTable;
