//******************************************************************************************************
//  Warning.tsx - Gbtc
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
import Modal from './Modal';

interface IProps {
    Title: string,
    CallBack: ((confirmed: boolean) => void),
    Show: boolean,
    Message: string
}

// Usage:
// <Warning Title='This is a Warning' Message={'Are you sure you want to Continue?'} Callback={(canceled) => setShow(false)} Show={show} />
//

// Props Description:
// Title => Title of The Modal
// CallBack => Function to be called when closing the Modal either through Cancel (confirmed=false) or Confirm Button (confirmed=true)
// Show => Whether to show the modal
// Message => The message shown by the Modal
const Warning: React.FunctionComponent<IProps> = (props) => {


    return (
        <Modal Title={props.Title} Show={props.Show} CancelBtnClass={'btn-danger'} CancelText={'Cancel'} ConfirmBtnClass={'btn-success'} ConfirmText={'Confirm'} ShowX={false} ShowCancel={true} Size={'sm'} CallBack={(confirmed) => props.CallBack(confirmed)} >
            <p>{props.Message}</p>
        </Modal>
    )
}

export default Warning;