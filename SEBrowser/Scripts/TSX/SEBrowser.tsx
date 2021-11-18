//******************************************************************************************************
//  SEBrowser.tsx - Gbtc
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
//  02/19/2020 - Billy Ernest
//       Generated original version of source code.
//
//******************************************************************************************************

import { Provider } from 'react-redux';
import store from './Store';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, NavLink, Switch, Redirect } from 'react-router-dom';
import About from './Components/About';
import MeterActivity from './Components/MeterActivity';
import EventSearch from './Components/EventSearch/EventSearch';
import BreakerReport from './Components/BreakerReport/BreakerReport';
import RelayReport from './Components/RelayReport/RelayReport';
import CapBankReport from './Components/CapBankReport/CapBankReport';
import DERAnalysisReport from './Components/DERAnalysisReport/DERAnalysisReport';

import { SystemCenter } from '@gpa-gemstone/application-typings';

const SEBrowserMainPage = (props: {}) => {
    const [links, setLinks] = React.useState<SystemCenter.Types.ValueListItem[]>([]);

    React.useEffect(() => {
        let handle = $.ajax({
            type: "GET",
            url: `${homePath}api/ValueList/Group/CustomReports`,
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            cache: true,
            async: true
        });

        handle.done(data => setLinks(data));
        return () => { if(handle.abort != undefined) handle.abort()}
    }, []);
    return (
        <Router>
            <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' }}>
                <div style={{ width: 300, height: 'inherit', backgroundColor: '#eeeeee', position: 'relative', float: 'left' }}>
                    <a href="https://www.gridprotectionalliance.org"><img style={{ width: 280, margin: 10 }} src={homePath + "Images/SE Browser - Spelled out - 111 high.png"} /></a>
                    <div style={{ width: '100%', height: '100%', marginTop: 30}}>
                        <div className="nav flex-column nav-pills" id="v-pills-tab" role="tablist" aria-orientation="vertical" style={{ height: 'calc(100% - 240px)' }}>
                            {/*<NavLink activeClassName='nav-link active' className="nav-link" exact={true} to={controllerViewPath + "/"}>Home</NavLink>*/}
                            <NavLink activeClassName='nav-link active' className="nav-link" to={homePath + "eventsearch"}>Event Search</NavLink>
                            <NavLink activeClassName='nav-link active' className="nav-link" to={homePath + "meteractivity"}>Meter Activity</NavLink>

                            <hr style={{borderTop: '1px solid darkgrey', width: '75%'}}/>
                            <h6 style={{ width: '100%', textAlign: 'center' }}>Custom Reports</h6>
                            {links.map((item, i) => <NavLink key={i} activeClassName='nav-link active' className="nav-link" to={homePath +  item.AltValue}>{item.Value}</NavLink>)}
                        </div>
                        
                        <div style={{ width: '100%', textAlign: 'center' }}>

                            <span>Version {version}</span>
                            <br />
                            <span><About /></span>
                        </div>
                    </div>
                </div>
                <div style={{ width: 'calc(100% - 300px)', height: 'inherit', position: 'relative', float: 'right' }}>
                    <Switch >
                        <Route path={homePath + "eventsearch"}><EventSearch /> </Route>
                        <Route path={homePath + "meteractivity"}><MeterActivity /> </Route>
                        <Route path={homePath + "breakerreport"}><BreakerReport /> </Route>
                        <Route path={homePath + "relayreport"}><RelayReport /> </Route>
                        <Route path={homePath + "capbankreport"}><CapBankReport /> </Route>
                        <Route path={homePath + "derreport"}><DERAnalysisReport /> </Route>

                        <Route path={homePath}><Redirect to={homePath + "eventsearch"}/></Route>
                    </Switch>
                </div>
            </div>
    </Router>
    );
}

ReactDOM.render(<Provider store={store}><SEBrowserMainPage /></Provider>, document.getElementById('pageBody'));

