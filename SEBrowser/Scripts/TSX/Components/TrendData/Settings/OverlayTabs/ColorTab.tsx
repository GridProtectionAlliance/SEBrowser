//******************************************************************************************************
//  ChannelTab.tsx - Gbtc
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
//  09/19/23 - Gabriel Santos
//       Generated original version of source code.
//
//******************************************************************************************************
import { Input, Select } from '@gpa-gemstone/react-forms';
import { ReactTable } from '@gpa-gemstone/react-table';
import { Column } from '@gpa-gemstone/react-table';
import React from 'react';
import { TrendSearch } from '../../../../Global';
import { LineStyles } from '../TabProperties/LineStyles';
import { TrashCan, UpArrow, DownArrow } from '@gpa-gemstone/gpa-symbols';
import { BlockPicker } from 'react-color';
import _ from 'lodash';

interface IColorTabProps {
    Colors: TrendSearch.IColorSettings,
    SetColors: (newSettings: TrendSearch.IColorSettings) => void
}

const ColorOptions = [
    { Label: "Random Colors", Value: "Random" },
    { Label: "By Individual Channels", Value: "Individual" },
    { Label: "By Phase and Measurement Type", Value: "PhaseType" },
    { Label: "By Asset", Value: "Asset" }
];

const ColorTab = React.memo((props: IColorTabProps) => {
    const [currentIndex, setCurrentIndex] = React.useState<number>(-1);

    function setColors(record: TrendSearch.IColor) {
        const newColors = _.cloneDeep(props.Colors);
        newColors.Colors[currentIndex] = record;
        props.SetColors(newColors);
    }

    function setOrder(evt: React.MouseEvent<HTMLButtonElement, MouseEvent>, index: number, option: 'remove' | 'up' | 'down') {
        evt.preventDefault();
        const newColors = _.cloneDeep(props.Colors);
        if (option === 'remove') {
            newColors.Colors.splice(index, 1);
            props.SetColors(newColors);
            return;
        }
        if (option === 'up' && index === 0) return;
        if (option === 'down' && index === props.Colors.Colors.length - 1) return;
        const dir = option === 'up' ? -1 : 1;
        const movedColor = newColors.Colors.splice(index, 1, newColors.Colors[index + dir]);
        newColors.Colors[index + dir] = movedColor[0];
        props.SetColors(newColors);
    }

    return (
        <div className="row" style={{ paddingLeft: 20, paddingRight: 20 }}>
            <div className="col" style={{ width: '40%', height: 'calc(100vh - 264px)'}}>
                <br/>
                <div className="row">
                    <div style={{
                        border: "thin black solid", color: "white", backgroundColor: "#1064da"
                        }}>These settings will only apply to line plots.</div>
                </div>
                <div className="row">
                    <Select<TrendSearch.IColorSettings> Record={props.Colors} Label={'Grouping'} Field={'ApplyType'} Setter={props.SetColors} Options={ColorOptions} />
                </div>
                <div className="row">
                    {props.Colors.ApplyType === "Random" ? <></> :
                        <ReactTable.Table<TrendSearch.IColor>
                            Data={props.Colors.Colors}
                            SortKey={""}
                            Ascending={false}
                            OnSort={() => undefined}
                            KeySelector={(_item, index) => index}
                            OnClick={(data) => setCurrentIndex(data.index)}
                            Selected={(_item, index) => currentIndex === index}
                            TheadStyle={{ fontSize: 'smaller', display: 'table', tableLayout: 'fixed', width: '100%' }}
                            TbodyStyle={{ display: 'block', overflowY: 'scroll', userSelect: 'none' }}
                            RowStyle={{ display: 'table', tableLayout: 'fixed', width: 'calc(100%)' }}
                            TableClass="table table-hover"
                            TableStyle={{ marginBottom: 0 }}>
                            <ReactTable.Column<TrendSearch.IColor>
                                Key={'Label'}
                                AllowSort={false}
                                Field={'Label'}
                            >Label</ReactTable.Column>
                            <ReactTable.Column<TrendSearch.IColor>
                                Key={'Order'}
                                AllowSort={false}
                                HeaderStyle={{ width: 'auto' }}
                                RowStyle={{ width: 'auto' }}
                                Content={({ index }) => <>
                                    <button className="btn btn-sm" onClick={(evt) => setOrder(evt, index, "remove")}>
                                        <span>{TrashCan}</span>
                                    </button>
                                    <button className="btn btn-sm" onClick={(evt) => setOrder(evt, index, "up")} disabled={index === 0}>
                                        <span>{UpArrow}</span>
                                    </button>
                                    <button className="btn btn-sm" onClick={(evt) => setOrder(evt, index, "down")} disabled={index === props.Colors.Colors.length - 1} >
                                        <span>{DownArrow}</span>
                                    </button>
                                </>}
                            > <p></p>
                            </ReactTable.Column>
                        </ReactTable.Table>
                    }
                </div>
            </div>
            <div className="col" style={{ width: '60%', overflowY: 'scroll' }}>
                {(currentIndex === -1 || props.Colors.ApplyType === "Random") ? <></> :
                    <>
                        <div className="row">
                            <Input<TrendSearch.IColor> Record={props.Colors.Colors[currentIndex]} Field="Label" Setter={setColors} Valid={() => true}
                                Help="Only used for identification on this screen" Type="text" />
                        </div>
                        <div className="row">
                            <div className="col" style={{ width: 'auto' }}>
                                <h4>Min Color</h4>
                                <BlockPicker onChangeComplete={(color) => setColors({ ...props.Colors.Colors[currentIndex], MinColor: color.hex })}
                                    color={props.Colors.Colors[currentIndex].MinColor} triangle={"hide"} />
                            </div>
                            <div className="col" style={{ width: 'auto' }}>
                                <h4>Avg Color</h4>
                                <BlockPicker onChangeComplete={(color) => setColors({ ...props.Colors.Colors[currentIndex], AvgColor: color.hex })}
                                    color={props.Colors.Colors[currentIndex].AvgColor} triangle={"hide"} />
                            </div>
                            <div className="col" style={{ width: 'auto' }}>
                                <h4>Max Color</h4>
                                <BlockPicker onChangeComplete={(color) => setColors({ ...props.Colors.Colors[currentIndex], MaxColor: color.hex })}
                                    color={props.Colors.Colors[currentIndex].MaxColor} triangle={"hide"} />
                            </div>
                        </div>
                    </>}
            </div>
        </div>
    );
});

export { ColorTab };