//******************************************************************************************************
//  EventSearchSettingsSlice.tsx - Gbtc
//
//  Copyright © 2021, Grid Protection Alliance.  All Rights Reserved.
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
//  12/08/2022 - Harrison Stropkay
//       Generated original version of source code.
//
//******************************************************************************************************
import { createSlice } from '@reduxjs/toolkit';
import { Redux } from '../../global';

const settingsSlice = createSlice({ 
    name: 'EventSearchSettings',

    initialState: {
        NumberResults: parseInt(localStorage.getItem('SEBrowser.Settings.numberResults') ?? '100')
    } as Redux.SettingsState,
    
    reducers: {
        SetSettingsNumberResults(state: any, action: { type: string, payload: { numberResults: number } }) {
            let numberResults = action.payload.numberResults
            numberResults = Math.floor(numberResults)       // in case input is not an integer
            if (numberResults >= 0) {                       // in case input is not positive
                state.NumberResults = numberResults
                localStorage.setItem('SEBrowser.Settings.numberResults', numberResults.toString())
            }
        }
    }
})

export const SettingsReducer = settingsSlice.reducer
export const { SetSettingsNumberResults } = settingsSlice.actions
export const SelectSearchSettings = (state: Redux.StoreState) => state.Settings
export const SelectSearchNumberResults = (state: Redux.StoreState) => state.Settings.NumberResults
