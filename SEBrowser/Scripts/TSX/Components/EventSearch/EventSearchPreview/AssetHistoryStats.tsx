import React from 'react';
import { SEBrowser } from '../../../global';
import Table from '@gpa-gemstone/react-table';

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

    let tableData = Object.keys(statsData).map((key) => ({ Stat: key, Value: statsData[key] }));

    return (
        <div className="card">
            <div className="card-header">Asset History Stat:</div>
            <div className="card-body">
                <Table
                    cols={[
                        { key: 'Stat', field: 'Stat', label: 'Stat' },
                        { key: 'Value', field: 'Value', label: 'Value' }
                    ]}
                    data={tableData}
                    onClick={() => { }}
                    onSort={() => { }}
                    sortKey={''}
                    ascending={true}
                    tableClass="table"
                    theadStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                    tbodyStyle={{ display: 'block', overflowY: 'scroll', maxHeight: 600, width: '100%' }}
                    rowStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                />
            </div>
        </div>
    );
}

export default AssetHistoryStats;
