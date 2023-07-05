import React from 'react';
import { SEBrowser } from '../../../global';
import Table from '@gpa-gemstone/react-table';

interface IStatsData {
    VPeakMax: number;
    VMax: number;
    VMin: number;
    IMax: number;
    I2tMax: number;
    IPeakMax: number;
    AVGMW: number;
    AssetName: string;
}

const AssetHistoryStats: React.FC<SEBrowser.IWidget<any>> = (props) => {
    const [statsData, setStatsData] = React.useState<IStatsData[]>([]);


    React.useEffect(() => {
        getStatsData();
    }, [props.eventID]);

    function getStatsData() {
        $.ajax({
            url: `${homePath}api/OpenXDA/GetEventSearchHistoryStats/${props.eventID}`,
            method: 'GET',
            dataType: 'json',
            success: (data) => {
                if (data && data.length > 0) {
                    const stats = data[0];
                    setStatsData(stats);
                }
            },
        });
    }

    return (
        <div className="card">
            <div className="card-header">Lifetime Stats for {statsData['AssetName']}:</div>
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