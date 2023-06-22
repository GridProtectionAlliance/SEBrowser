import React from 'react';
import { SEBrowser } from '../../../global';
import Table from '@gpa-gemstone/react-table';


const AssetHistoryStats: React.FC<SEBrowser.IWidget<any>> = (props) => {
    const [statsData, setStatsData] = React.useState<Number[]>([]);
    const [assetName, setAssetName] = React.useState<string>('');

    React.useEffect(() => {
        getStatsData();
    }, [props.eventID]);

    function getStatsData() {
        fetch(`${homePath}api/OpenXDA/GetEventSearchHistoryStats/${props.eventID}`)
            .then((response) => response.json())
            .then((data) => {
                if (data && data.length > 0) {
                    const stats = data[0];
                    setStatsData(stats);
                    setAssetName(stats.AssetName);
                }
            })
            .catch((error) => {
                console.error('Error retrieving stats data:', error);
            });
    }

    return (
        <div className="card">
            <div className="card-header">Lifetime Stats for {assetName}:</div>
            <div className="card-body">
                <Table
                    cols={[
                        { key: 'Stat', field: 'Stat', label: 'Stat' },
                        { key: 'Value', field: 'Value', label: 'Value' }
                    ]}
                    data={Object.entries(statsData).map(([key, value]) => ({ Stat: key, Value: value }))}
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
};

export default AssetHistoryStats;