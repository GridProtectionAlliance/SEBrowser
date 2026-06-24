//******************************************************************************************************
//  EventSearchMagDurChart.tsx - Gbtc
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
//  06/23/2020 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************
import * as React from 'react';
import { SelectEventSearchs, SelectEventSearchsSortField, SelectEventSearchsAscending, Sort } from '../../../Store/EventSearchSlice';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { Redux } from '../../../global';
import { OverlayDrawer } from '@gpa-gemstone/react-interactive';
import { ConfigurableTable, ConfigurableColumn, Column } from '@gpa-gemstone/react-table';

interface IProps {
    Select: (evt: number) => void;
    Magnitude: number;
    Duration: number;
    Height: number;
    Width: number;
}

const EventList = (props: IProps) => {
    const closureHandler = React.useRef<((o: boolean) => void)>(() => {/*Do Nothing*/ });

    const dataFilter = React.useCallback((state: Redux.StoreState) => SelectEventSearchs(state).filter(p =>
        Math.abs(p['MagDurDuration'] - props.Duration) < 1E-10 && Math.abs(p['MagDurMagnitude'] - props.Magnitude) < 0.0001),
        [props.Magnitude, props.Duration])

    const dispatch = useAppDispatch();
    const sortField = useAppSelector(SelectEventSearchsSortField);
    const ascending = useAppSelector(SelectEventSearchsAscending);
    const data = useAppSelector(dataFilter);
    const [cols, setCols] = React.useState<string[]>([]);

    React.useEffect(() => {
        if (props.Magnitude !== 0 && props.Duration !== 0) {
            closureHandler.current(true);
            LoadColumns();
        }
        else {
            closureHandler.current(false);
        }
    }, [props.Magnitude, props.Duration])

    const LoadColumns = () => {
        const flds = Object.keys(data[0]).filter(item => item != "Time" && item != "DisturbanceID" && item != "EventID" && item != "EventID1" && item != 'MagDurDuration' && item != 'MagDurMagnitude').sort();
        let keys: string[] = [];
        const currentState = localStorage.getItem('SEbrowser.EventSearch.TableCols');
        if (currentState !== null)
            keys = currentState.split(",");

        setCols(flds.filter(f => keys.includes(f)));
    }

    return <OverlayDrawer
        Title={''}
        Open={false}
        Location={'right'}
        Target={'eventPreviewPane'}
        GetOverride={(s) => { closureHandler.current = s; }}
        HideHandle={true}
    >
        <div style={{ width: props.Width, height: props.Height }} className={'magDurChartSelection'}>
            <div style={{ width: 160, float: 'right', padding: 10 }}>
                <button className='btn btn-primary' onClick={() => closureHandler.current(false)} >
                    Close
                </button>
            </div>
            <ConfigurableTable<any>
                TableClass="table table-hover"
                Data={data}
                SortKey={sortField as string}
                Ascending={ascending}
                OnSort={(d) => {
                    if (d.colKey == sortField) dispatch(Sort({ Ascending: ascending, SortField: sortField }));
                    else dispatch(Sort({ Ascending: true, SortField: d.colKey }));
                }}
                OnClick={(item) => { closureHandler.current(false); props.Select(item.row.EventID) }}
                TheadStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '250px', height: 60 }}
                TbodyStyle={{ display: 'block', overflowY: 'scroll', maxHeight: props.Height - 60 - 160 }}
                RowStyle={{ display: 'table', tableLayout: 'fixed', width: 'calc(100%)' }}
                TableStyle={{ marginBottom: 0 }}
                Selected={() => false}
                KeySelector={(item) => (item.EventID.toString() + '-' + item.DisturbanceID)}
            >
                <Column<any>
                    Key={'Time'}
                    AllowSort={true}
                    Content={row => ProcessWhitespace(row.item[row.field as string])}
                    Field={'Time'}
                >
                    Time
                </Column>
                {...cols.map(c => (
                    <ConfigurableColumn Key={c} Label={c} Default={c === 'Event Type'}>
                        <Column<any>
                            Key={c}
                            AllowSort={true}
                            Field={c}
                            Content={row => ProcessWhitespace(row.item[row.field as string])}
                        >
                            {c}
                        </Column>
                    </ConfigurableColumn>
                ))}
            </ConfigurableTable>
        </div>
    </OverlayDrawer>
}

const ProcessWhitespace = (txt: string | number): React.ReactNode => {
    if (txt == null)
        return <>N/A</>

    const lines = txt.toString().split("<br>");

    return lines.map((item, index) => {
        if (index == 0)
            return <> {item} </>
        return <> <br /> {item} </>
    })
}

export default EventList;