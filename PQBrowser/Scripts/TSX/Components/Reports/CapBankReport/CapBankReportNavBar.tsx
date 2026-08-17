//******************************************************************************************************
//  CapBankReportNavBar.tsx - Gbtc
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
//  09/21/2019 - Christoph Lackner
//       Generated original version of source code.
//
//******************************************************************************************************
import * as React from 'react';

import PQBrowserService from '../../../../TS/Services/PQBrowser';
import { Modal } from '@gpa-gemstone/react-interactive';
import { Select } from '@gpa-gemstone/react-forms';
import { TimeFilter } from '@gpa-gemstone/common-pages';
import { Application } from '@gpa-gemstone/application-typings';
import { ReactIcons } from '@gpa-gemstone/gpa-symbols';
import { toGemstoneFilter, fromGemstoneFilter } from '../../EventSearch/TimeWindowUtils';
import { useAppSelector } from '../../../hooks';
import { SelectDateTimeSetting, SelectTimeZone } from '../../../Store/SettingsSlice';
import { PQBrowser } from '../../../global';


export interface Substation {
    LocationID: number, LocationKey: string, AssetName: string
}

export interface EventFilter {
    ResFilt: number[],
    StatFilt: number[],
    OpFilt: number[],
    RestFilt: number[],
    PISFilt: number[],
    HealthFilt: number[],
    PhaseFilter: number[]
}

export interface CapBankReportNavBarProps extends EventFilter {
    stateSetter(state): void,
    CapBankID: number,
    TimeFilter: PQBrowser.IReportTimeFilter,
    selectedBank: number,
    StationId: number,
    numBanks: number,

}

interface CapBank {
    Id: number,
    AssetKey: string,
    AssetName: string,
    numBanks: number,
    fused: boolean,
    compensated: boolean
}

interface IFilter {
    Label: string,
    Values: number[]
}

interface IEventFilterConfig {
    Field: keyof EventFilter,
    Label: string,
    ShowAll: boolean,
    Width: string,
    Filters: IFilter[]
}

const eventFilterConfigs: IEventFilterConfig[] = [
    {
        Field: 'PhaseFilter', Label: 'Phase', ShowAll: true, Width: '10%',
        Filters: [
            { Label: 'AN', Values: [1] },
            { Label: 'BN', Values: [2] },
            { Label: 'CN', Values: [3] },
        ]
    },
    {
        Field: 'StatFilt', Label: 'Status', ShowAll: true, Width: '15%',
        Filters: [
            { Label: 'Error', Values: [-1] },
            { Label: 'Normal', Values: [0] },
            { Label: '>2 cyc Between Poles', Values: [12] },
            { Label: 'Abnormal Health', Values: [2] },
            { Label: 'Failed Opening', Values: [3, 4] },
            { Label: 'Failed Closing', Values: [10, 5] },
            { Label: 'Restrike/Reignition', Values: [4, 5] },
            { Label: 'Abnormal PreInsertion Switching', Values: [8] },
            { Label: 'Missing Pole', Values: [11] },
            { Label: 'Shorted Units', Values: [20] },
            { Label: 'Blown Fuse', Values: [21] },
            { Label: 'Other', Values: [6, 22, 7] }
        ]
    },
    {
        Field: 'OpFilt', Label: 'Operation', ShowAll: true, Width: '15%',
        Filters: [
            { Label: 'Sag/Swell', Values: [-200] },
            { Label: 'No Switching', Values: [-103, -102, -101] },
            { Label: 'Not Determined', Values: [-1] },
            { Label: 'Opening', Values: [101, 102] },
            { Label: 'Closing', Values: [201, 202] }
        ]
    },
    {
        Field: 'ResFilt', Label: 'Resonance', ShowAll: false, Width: '15%',
        Filters: [
            { Label: 'Resonance', Values: [1] },
            { Label: 'No Resonance', Values: [0] }
        ]
    },
    {
        Field: 'HealthFilt', Label: 'Capacitor Bank Health', ShowAll: true, Width: '15%',
        Filters: [
            { Label: 'Normal', Values: [0] },
            { Label: 'Shorted Units', Values: [1] },
            { Label: 'Blown Fuses', Values: [2] },
            { Label: 'Tap Voltages Missing', Values: [3] },
        ]
    },
    {
        Field: 'RestFilt', Label: 'Restrike', ShowAll: true, Width: '15%',
        Filters: [
            { Label: 'No Restrike', Values: [0, 20] },
            { Label: 'Possible Restrike', Values: [10] },
            { Label: 'Restrike', Values: [32, 42] },
            { Label: 'Reignition', Values: [31, 41] },
            { Label: 'Reversed Polarity', Values: [41, 42] }
        ]
    },
    {
        Field: 'PISFilt', Label: 'Switching Health', ShowAll: true, Width: '15%',
        Filters: [
            { Label: 'Normal', Values: [0] },
            { Label: 'Transient', Values: [1] },
            { Label: 'Too Short', Values: [2] },
            { Label: 'Unknown', Values: [3] },
        ]
    }
];

const CapBankReportNavBar = (props: CapBankReportNavBarProps) => {
    const dateTimeSetting = useAppSelector(SelectDateTimeSetting);
    const timeZone = useAppSelector(SelectTimeZone);
    const [pqBrowserService] = React.useState(() => new PQBrowserService());
    const [capBanks, setCapBanks] = React.useState<CapBank[]>([]);
    const [subStations, setSubStations] = React.useState<Substation[]>([]);
    const [showFilter, setShowFilter] = React.useState<boolean>(false);
    const [subStationStatus, setSubStationStatus] = React.useState<Application.Types.Status>('uninitiated');
    const [capBankStatus, setCapBankStatus] = React.useState<Application.Types.Status>('uninitiated');

    React.useEffect(() => {
        setSubStationStatus('loading');
        const handle = pqBrowserService.GetCapBankSubstationData().done(results => {
            if (results != null)
                setSubStations(results);
            setSubStationStatus('idle');
        }).fail(() => setSubStationStatus('error'));

        return () => {
            if (handle?.abort != null)
                handle.abort();
        };
    }, []);

    React.useEffect(() => {
        if (props.StationId < 0)
            return;
        setCapBankStatus('loading');
        const handle = pqBrowserService.GetCapBankData(props.StationId).done(results => {
            if (results != null)
                setCapBanks(results);
            setCapBankStatus('idle');
        }).fail(() => setCapBankStatus('error'));

        return () => {
            if (handle?.abort != null)
                handle.abort();
        };
    }, [props.StationId]);

    // Keep the numBanks prop in sync with the selected capacitor bank group
    React.useEffect(() => {
        const bank = capBanks.find(cB => cB.Id == props.CapBankID);
        if (bank != null && bank.numBanks != props.numBanks)
            updateProps({ ...props, numBanks: bank.numBanks });
    }, [capBanks, props.CapBankID]);

    const updateProps = (record: CapBankReportNavBarProps) => {
        props.stateSetter({ searchBarProps: record });
    }

    const selectedCapBank = capBanks.find(cB => cB.Id == props.CapBankID);
    const numBanks = selectedCapBank == null ? 1 : selectedCapBank.numBanks;
    const bankOptions: { Value: number, Label: string }[] = [{ Value: -1, Label: 'System' }];
    for (let i = 0; i < numBanks; i++)
        bankOptions.push({ Value: i + 1, Label: `${i + 1}` });
    bankOptions.push({ Value: -2, Label: 'Unknown' });

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="collapse navbar-collapse" id="navbarSupportedContent" style={{ width: '100%' }}>
                    <ul className="navbar-nav mr-auto" style={{ width: '100%' }}>
                        <li className="nav-item" style={{ width: '40%', paddingRight: 10 }}>
                            <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                                <legend className="w-auto" style={{ fontSize: 'large' }}>Capacitor Bank:</legend>
                                <div className="row">
                                    <div className="col-12">
                                        {subStationStatus === 'loading' ?
                                            <div className='d-flex align-items-center justify-content-center'>
                                                <ReactIcons.SpiningIcon />
                                            </div>
                                            :
                                            <Select<CapBankReportNavBarProps>
                                                Record={props}
                                                Field='StationId'
                                                Label='Substation:'
                                                Setter={updateProps}
                                                Options={subStations.map(item => ({ Value: item.LocationID, Label: item.AssetName }))}
                                            />
                                        }
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-6">
                                        {capBankStatus === 'loading' ?
                                            <div className='d-flex align-items-center justify-content-center'>
                                                <ReactIcons.SpiningIcon />
                                            </div>
                                            :
                                            <Select<CapBankReportNavBarProps>
                                                Record={props}
                                                Field='CapBankID'
                                                Label='Capacitor Bank Group:'
                                                Setter={(record) => updateProps({ ...record, selectedBank: -1 })}
                                                Options={capBanks.map(item => ({ Value: item.Id, Label: item.AssetName }))}
                                            />
                                        }
                                    </div>
                                    <div className="col-6">
                                        <Select<CapBankReportNavBarProps>
                                            Record={props}
                                            Field='selectedBank'
                                            Label='Bank:'
                                            Setter={updateProps}
                                            Options={bankOptions}
                                        />
                                    </div>
                                </div>
                            </fieldset>
                        </li>
                        <li className="nav-item" style={{ width: '40%', paddingRight: 10 }}>
                            <TimeFilter
                                filter={toGemstoneFilter(props.TimeFilter)}
                                setFilter={(start, end, unit, duration) => updateProps({ ...props, TimeFilter: fromGemstoneFilter(start, end, unit, duration) })}
                                showQuickSelect={true}
                                dateTimeSetting={dateTimeSetting}
                                timeZone={timeZone}
                            />
                        </li>
                        <li className="nav-item" style={{ width: '20%', paddingRight: 10 }}>
                            <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                                <legend className="w-auto" style={{ fontSize: 'large' }}>Additional Filter:</legend>
                                <button className="btn btn-primary" onClick={() => setShowFilter(true)} >Edit Filter</button>
                            </fieldset>
                        </li>
                    </ul>
                </div>
            </nav>

            <Modal
                Show={showFilter}
                ShowX={true}
                ShowCancel={false}
                Size={'xlg'}
                Title={'Filter Capacitor Bank Events'}
                ConfirmText={'Close'}
                CallBack={() => setShowFilter(false)}
            >
                <div style={{ width: '100%', display: 'inline-flex' }}>
                    {eventFilterConfigs.map(config =>
                        <div key={config.Field} style={{ width: config.Width, paddingRight: 10 }}>
                            <CBEventFilter
                                activeFilter={props[config.Field]}
                                showAll={config.ShowAll}
                                Label={config.Label}
                                setter={(result) => updateProps({ ...props, [config.Field]: result })}
                                filters={config.Filters}
                            />
                        </div>
                    )}
                </div>
            </Modal>
        </>
    );
}

export default CapBankReportNavBar;

const CBEventFilter = (props: { filters: IFilter[], Label: string, showAll: boolean, setter: (filter: number[]) => void, activeFilter: number[] }) => {

    const allSelected: boolean = props.activeFilter.includes(999);
    const mapState = (filter: IFilter) => {
        let state = true;

        filter.Values.forEach(item => {
            if (!props.activeFilter.includes(item))
                state = false;
        })

        return state;
    }
    const isSelected: boolean[] = props.filters.map(item => mapState(item));

    const FilterChanged = (index: number) => {

        let updatedStat = isSelected.map((item, i) => (i === index ? !item : item));

        if (index !== -1 && allSelected)
            updatedStat = isSelected.map((item, i) => (i === index ? false : true));

        let result = [];
        updatedStat.forEach((item, i) => {
            if (item)
                result = result.concat(props.filters[i].Values)
        })

        if (index === -1 && !allSelected)
            result.push(999);

        props.setter(result)
    }

    return (
        <div>
            <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
                <legend className="w-auto" style={{ fontSize: 'large' }}>{props.Label}:</legend>
                <form>
                    <ul style={{ listStyleType: 'none', padding: 0, width: '100%', position: 'relative', float: 'left' }}>
                        {props.showAll ?
                            <li><label><input type="checkbox" onChange={() => { FilterChanged(-1) }} checked={allSelected} /> All </label></li>
                            : null}
                        {props.filters.map((filt, index) =>
                            <li key={index}><label><input type="checkbox" onChange={() => FilterChanged(index)} checked={isSelected[index] || (allSelected && props.showAll)} /> {filt.Label} </label></li>
                        )}
                    </ul>
                </form>
            </fieldset>
        </div>
    );
}
