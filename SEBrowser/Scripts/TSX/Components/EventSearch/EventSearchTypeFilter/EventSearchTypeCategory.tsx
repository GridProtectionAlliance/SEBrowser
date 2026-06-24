//******************************************************************************************************
//  EventSearchTypeFilter.tsx - Gbtc
//
//  Copyright © 2023, Grid Protection Alliance.  All Rights Reserved.
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
//  02/02/2023 - C. Lackner
//       Generated original version of source code.
//
//******************************************************************************************************
import React from 'react';
import 'moment';
import _ from 'lodash';
import { OpenXDA } from '@gpa-gemstone/application-typings';
import { useGetContainerPosition } from '@gpa-gemstone/helper-functions';
import { CheckBox } from '@gpa-gemstone/react-forms';

interface IProps {
    Label: string | null,
    SetHeight: (h: number) => void,
    Data: OpenXDA.Types.EventType[],
    SelectedID: number[],
    OnChange: (record: OpenXDA.Types.EventType, selected: boolean) => void
    SelectAll: (selected: boolean) => void
}

const EventSearchTypeCategory = (props: IProps) => {
    const formRef = React.useRef<HTMLDivElement | null>(null);
    const { offsetHeight } = useGetContainerPosition(formRef); //the ref typing for this needs to be more loose to accept a ref like HTMLFieldSetElement

    React.useEffect(() => {
        props.SetHeight(offsetHeight);
    }, [offsetHeight, props.SetHeight]);

    return <fieldset className="border" style={{ padding: '10px' }} ref={formRef as unknown as React.RefObject<HTMLFieldSetElement>}>
        <legend className="w-auto" style={{ fontSize: 'large' }}>{(props.Label != null && props.Label.length > 0 ? props.Label : 'Other Types')}:
            <a style={{ fontSize: 'small', color: '#0056b3', marginLeft: 2, cursor: 'pointer' }}
                onClick={() => {
                    const isSelected = props.Data.filter(item => props.SelectedID.find(i => i == item.ID) == null).length == 0;
                    props.SelectAll(isSelected);
                }}>
                ({props.Data.filter(item => props.SelectedID.find(i => i == item.ID) == null).length == 0 ? 'un' : ''}select all)
            </a>
        </legend>
        <form>
            <ul style={{ listStyleType: 'none', padding: 0, position: 'relative', float: 'left' }}>
                {props.Data.map((item) =>
                    <li key={item.ID}>
                        <CheckBox<{ Selected: boolean }>
                            Record={{ Selected: props.SelectedID.find(i => i == item.ID) != null }}
                            Field='Selected'
                            Label={item.Description}
                            Setter={(record) => props.OnChange(item, record.Selected)}
                        />
                    </li>
                )}
            </ul>
        </form>
    </fieldset>
}

export default EventSearchTypeCategory;