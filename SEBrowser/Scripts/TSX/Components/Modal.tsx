//******************************************************************************************************
//  Modal.tsx - Gbtc
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
//  12/29/2020 - Christoph Lackner
//       Generated original version of source code.
//******************************************************************************************************

import * as React from 'react';
import { clone, isEqual } from 'lodash';

interface IProps {
    Title: string,
    ShowX?: boolean,
    CallBack: ((confirmed: boolean) => void),
    Show: boolean,
    Size?: ('lg' | 'sm'),
    ShowCancel?: boolean,
    DisableConfirm?: boolean,
    CancelText?: string,
    ConfirmText?: string,
    ConfirmBtnClass?: string,
    CancelBtnClass?: string
}

// Usage:
// <Modal Title='Title of Modal' ShowX={false} Callback={(canceled) => setShow(false)} Show={show} Size={'lg'} ShowCancel={true} CancelText={'Cancel'} ConfirmText={'Ok'} >
// <p> Content of the Modal should go here </p>
// </Modal >
//

// Props Description:
// Title => Title of The Modal
// ShowX => show or hide the X button (default true)
// CallBack => Function to be called when closing the Modal either through Cancel (confirmed=false) or Accept Button (confirmed=true)
// Show => Whether to show the modal
// Size => Size of the modal
// ShowCancel => Whether to show the cancel button
// DisableConfirm => Disables the Confirm button
// CancelText => Text on Cancel Button
// Confirm text => Text on Confirm button
// ConfirmBtnClass => Class of the Confirm Button
// CancelBtnClass =>> Class of the Cancel Button
const Modal: React.FunctionComponent<IProps> = (props) => {


    const confirmBtn = (props.ConfirmText == undefined ? 'Save' : props.ConfirmText);
    const cxnBtn = (props.CancelText == undefined ? 'Cancel' : props.CancelText);

    const cxnbtnCls = 'btn ' + (props.CancelBtnClass == undefined ? 'btn-danger' : props.CancelBtnClass);
    const confirmbtnCls = 'btn ' + (props.ConfirmBtnClass == undefined ? 'btn-primary' : props.ConfirmBtnClass)

    return (
        <>
            <div className={"modal" + (props.Show ? " show" : '')} style={props.Show ? { display: 'block', zIndex: 9990 } : {}} id="Test" >
                <div className={"modal-dialog" + (props.Size == undefined ? '' : (" modal-" + props.Size))}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h4 className="modal-title">{props.Title}</h4>
                        </div>
                        <div className="modal-body">
                            {props.children}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className={confirmbtnCls} disabled={!(props.DisableConfirm == undefined || !props.DisableConfirm)} onClick={() => props.CallBack(true)}>{confirmBtn}</button>
                            {props.ShowCancel == undefined || props.ShowCancel ?
                                <button type="button" className={cxnbtnCls} onClick={() => props.CallBack(false)}>{cxnBtn}</button>
                                : null}
                        </div>
                    </div>
                </div>
            </div>
            {props.Show ? < div style={{
                width: '100%',
                height: '100%',
                position: 'fixed',
                top: 0,
                left: 0,
                opacity: 0.5,
                backgroundColor: '#ffffff',
                zIndex: 9980,
            }}></div> : null}
        </>
    )
}

export default Modal;