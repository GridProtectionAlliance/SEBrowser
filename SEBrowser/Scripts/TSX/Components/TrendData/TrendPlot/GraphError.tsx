//******************************************************************************************************
//  LineGraph.tsx - Gbtc
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
//  04/18/23 - Gabriel Santos
//       Generated original version of source code.
//
//******************************************************************************************************
import React from 'react';
import { ServerErrorIcon } from '@gpa-gemstone/react-interactive';
import { Button } from '@gpa-gemstone/react-graph';

interface IProps {
    Title: string,
    Height: number,
    children: React.ReactNode
}

const GraphError = React.memo((props: IProps) => {

    return (
        <>
            {props.Title !== undefined ? <h4 style={{ textAlign: "center", width: `100%` }}>{props.Title}</h4> : null}
            <div className="row" style={{ alignItems: "center", justifyContent: "center", width: "100%", height: `calc(50% - ${props.Title !== undefined ? 34 : 0}px` }}>
                <ServerErrorIcon Show={true} Label={'Error Obtaining Data from XDA Instance'} Size={props.Height / 7} />
            </div>
            <div className="row" style={{ width: "100%", height: "50%" }}>
                {React.Children.map(props.children, (element) => {
                    if (!React.isValidElement(element))
                        return null;
                    if ((element as React.ReactElement<unknown>).type === Button)
                        return (
                            <div className="col" style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", height: "100%" }}>
                                <button type="button"
                                    className={'btn btn-primary'}
                                    onClick={() => { element.props.onClick() }}>
                                    {element}
                                </button>
                            </div>);
                    return null;
                })}
            </div>
        </>);
});

export default GraphError;