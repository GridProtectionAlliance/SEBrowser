//******************************************************************************************************
//  EventSearchFilterButton.tsx - Gbtc
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
//  10/05/2021 - C. Lackner
//       Generated original version of source code.
//
//******************************************************************************************************
import React from 'react';
import 'moment';
import _ from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { SelectCharacteristicFilter, SelectTimeFilter, SelectTypeFilter, SetFilters } from './EventSearchSlice';
import { Modal } from '@gpa-gemstone/react-interactive';


interface IProps<T> {
    Data: T[],
    Type: ('Meter' | 'Asset' | 'AssetGroup' | 'Station'),
    OnClick: () => void
}


function EventSearchFilterButton<T>(props: IProps<T>) {
    const [hover, setHover] = React.useState<boolean>(false);
    const [rows, setRows] = React.useState<JSX.Element[]>([]);
    const [header, setHeader] = React.useState<JSX.Element>(null);

    React.useEffect(() => {
        switch (props.Type) {
            case ('Meter'):
                setHeader(< tr ><th>Name</th><th>Key</th><th>Substation</th><th>Assets</th><th>Make</th><th>Model</th></tr >);
            case ('Asset'):
                setHeader(<tr><th>Column</th><th>Operator</th><th>Search Text</th><th>Edit</th><th>Remove</th></tr>);
            case ('AssetGroup'):
                setHeader(<tr><th>Column</th><th>Operator</th><th>Search Text</th><th>Edit</th><th>Remove</th></tr>);
            default:
                setHeader(<tr><th>Column</th><th>Operator</th><th>Search Text</th><th>Edit</th><th>Remove</th></tr>);
        }
    }, [props.Type]);

    React.useEffect(() => {
        setRows(props.Data.filter((v, i) => i < 40).map(d => <tr> </tr>));
    }, [props.Data, props.Type])
    
    return (
        <>
            <button className={"btn btn-block btn-" + (props.Data.length > 0 ? "warning" : "primary")} style={{ marginBottom: 5 }} onClick={(evt) => { evt.preventDefault(); props.OnClick(); }} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
                {props.Type} {props.Data.length > 0 ? ('(' + props.Data.length + ')') : ''}
            </button>
            <div style={{ width: window.innerWidth / 3, display: hover ? 'block' : 'none', position: 'absolute', backgroundColor: '#f1f1f1', boxShadow: '0px 8px 16px 0px rgba(0,0,0,0.2)', zIndex: 1, right: 0 }} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
                <table className='table'>
                    <thead>
                        {header}
                    </thead>
                    <tbody>
                        {rows}
                    </tbody>

                </table>
            </div>
        </>
    );
}

export default EventSearchFilterButton;