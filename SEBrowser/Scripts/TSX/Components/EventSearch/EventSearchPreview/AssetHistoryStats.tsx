import React from 'react';
import { SEBrowser } from '../../../global';

const AssetHistoryStats: React.FC<SEBrowser.IWidget<any>> = (props) => {
    const [statsData, setStatsData] = React.useState<any>({});

    React.useEffect(() => {
        let handle = getStatsData();
        handle.done((data) => setStatsData(data[0]));

        return () => {
            if (handle.abort != undefined) handle.abort();
        }
    }, [props.eventID]);

    function getStatsData() {
        return $.ajax({
            type: "GET",
            url: `${homePath}api/OpenXDA/GetEventSearchHistoryStats/${props.eventID}`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });
    }

    return (
        <div className="card">
            <div className="card-header">Asset History Stat:</div>
                <div className="card-body">
                    <table className="table">
                        <thead>
                            <tr><th>Stat</th><th>Value</th></tr>
                        </thead>
                        <tbody>
                            {Object.keys(statsData).map((key, i) =>
                                <tr key={i}>
                                    <td>{key}</td>
                                    <td>{statsData[key]}</td>
                                </tr>)}
                        </tbody>
                    </table>
                </div>
        </div>
    );
}

export default AssetHistoryStats;
