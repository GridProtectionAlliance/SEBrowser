//******************************************************************************************************
//  ReportTimeFilter.tsx - Gbtc
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
//  09/16/2021 - Christoph Lackner
//       Generated original version of source code.
//******************************************************************************************************

import * as React from 'react';
import { SEBrowser } from '../global';
import moment from 'moment';
import momentTZ from 'moment-timezone';
import { DatePicker, Select, Input } from '@gpa-gemstone/react-forms'
import { useSelector } from 'react-redux';
import { SelectTimeZone, SelectDateTimeSetting } from './SettingsSlice';
import { findAppropriateUnit, getMoment, getStartEndTime, momentUnit } from './EventSearch/TimeWindowUtils';

interface IProps {
    filter: SEBrowser.IReportTimeFilter;
    setFilter: (filter: SEBrowser.IReportTimeFilter) => void,
    showQuickSelect: boolean
}

interface ITimeFilter {
    centerTime: string,
    startTime: string,
    endTime: string,
    timeWindowUnits: number,
    windowSize: number,
    halfWindowSize: number,
};

interface IQuickSelect { label: string, createFilter: (timeZone: string) => SEBrowser.IReportTimeFilter }

const momentDateFormat = "MM/DD/YYYY";
const momentTimeFormat = "HH:mm:ss.SSS"; // Also is the gemstone format


const AvailableQuickSelects: IQuickSelect[] = [
    {
        label: 'This Hour', createFilter: (tz) => {
            const offset = momentTZ.tz(moment.utc().startOf('hour').format('YYYY-MM-DDTHH:mm:ss.SSSSS'), tz).utcOffset();
            const t = moment.utc().add(offset, 'hour').startOf('hour');
            t.add(30, 'minutes');
            return {
                date: t.format(momentDateFormat),
                time: t.format(momentTimeFormat),
                timeWindowUnits: 2,
                windowSize: 30
            }
        }
    },
    {
        label: 'Last Hour', createFilter: (tz) => {
            const offset = momentTZ.tz(moment.utc().startOf('hour').subtract(1, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSSS'), tz).utcOffset();
            const t = moment.utc().add(offset, 'hour').startOf('hour').subtract(1, 'hour');
            t.add(30, 'minutes')
            return {
                date: t.format(momentDateFormat),
                time: t.format(momentTimeFormat),
                timeWindowUnits: 2,
                windowSize: 30
            }
        }
    },
    {
        label: 'Last 60 Minutes', createFilter: (tz) => {
            const offset = momentTZ.tz(moment.utc().startOf('minute').subtract(1, 'hour').format('YYYY-MM-DDTHH:mm:ss.SSSSS'), tz).utcOffset();
            const t = moment.utc().add(offset, 'hour').startOf('minute').subtract(1, 'hour');
            t.add(30, 'minutes');
            return {
                date: t.format(momentDateFormat),
                time: t.format(momentTimeFormat),
                timeWindowUnits: 2,
                windowSize: 30
            }
        }
    },
    {
        label: 'Today', createFilter: (tz) => {
            const offset = momentTZ.tz(moment.utc().startOf('day').format('YYYY-MM-DDTHH:mm:ss.SSSSS'), tz).utcOffset();
            const t = moment.utc().add(offset, 'hour').startOf('day');
            t.add(12, 'hours');
            return {
                date: t.format(momentDateFormat),
                time: t.format(momentTimeFormat),
                timeWindowUnits: 3,
                windowSize: 12
            }
        }
    },
    {
        label: 'Yesterday', createFilter: (tz) => {
            const offset = momentTZ.tz(moment.utc().startOf('day').subtract(1, 'days').format('YYYY-MM-DDTHH:mm:ss.SSSSS'), tz).utcOffset();
            const t = moment.utc().add(offset, 'hour').startOf('day').subtract(1, 'days');
            t.add(12, 'hours');
            return {
                date: t.format(momentDateFormat),
                time: t.format(momentTimeFormat),
                timeWindowUnits: 3,
                windowSize: 12
            }
        }
    },
    {
        label: 'Last 24 Hours', createFilter: (tz) => {
            const offset = momentTZ.tz(moment.utc().startOf('hour').subtract(24, 'hours').format('YYYY-MM-DDTHH:mm:ss.SSSSS'), tz).utcOffset();
            const t = moment.utc().add(offset, 'hour').subtract(24, 'hours');
            t.add(12, 'hours');
            return {
                date: t.format(momentDateFormat),
                time: t.format(momentTimeFormat),
                timeWindowUnits: 3,
                windowSize: 12
            }
        }
    },
    {
        label: 'This Week', createFilter: (tz) => {
            const offset = momentTZ.tz(moment.utc().startOf('week').format('YYYY-MM-DDTHH:mm:ss.SSSSS'), tz).utcOffset();
            const t = moment.utc().add(offset, 'hour').startOf('week');
            t.add(3.5 * 24, 'hours');
            return {
                date: t.format(momentDateFormat),
                time: t.format(momentTimeFormat),
                timeWindowUnits: 3,
                windowSize: 3.5 * 24
            }
        }
    },
    {
        label: 'Last Week', createFilter: (tz) => {
            const offset = momentTZ.tz(moment.utc().startOf('week').format('YYYY-MM-DDTHH:mm:ss.SSSSS'), tz).utcOffset();
            const t = moment.utc().add(offset, 'hour').startOf('week');
            t.subtract(3.5 * 24, 'hours');
            return {
                date: t.format(momentDateFormat),
                time: t.format(momentTimeFormat),
                timeWindowUnits: 3,
                windowSize: 3.5 * 24
            }
        }
    },
    {
        label: 'Last 7 Days', createFilter: (tz) => {
            const offset = momentTZ.tz(moment.utc().startOf('day').format('YYYY-MM-DDTHH:mm:ss.SSSSS'), tz).utcOffset();
            const t = moment.utc().add(offset, 'hour').startOf('day');
            t.subtract(3.5 * 24, 'hours');
            return {
                date: t.format(momentDateFormat),
                time: t.format(momentTimeFormat),
                timeWindowUnits: 3,
                windowSize: 3.5 * 24
            }
        }
    },
    {
        label: 'This Month', createFilter: (tz) => {
            const offset = momentTZ.tz(moment.utc().startOf('month').format('YYYY-MM-DDTHH:mm:ss.SSSSS'), tz).utcOffset();
            const t = moment.utc().add(offset, 'hour').startOf('month');
            t.add(12 * t.daysInMonth(), 'hours');
            return {
                date: t.format(momentDateFormat),
                time: t.format(momentTimeFormat),
                timeWindowUnits: 3,
                windowSize: (t.daysInMonth() * 24) / 2.0
            }
        }
    },
    {
        label: 'Last Month', createFilter: (tz) => {
            const offset = momentTZ.tz(moment.utc().startOf('month').subtract(1, 'month').format('YYYY-MM-DDTHH:mm:ss.SSSSS'), tz).utcOffset();
            const t = moment.utc().add(offset, 'hour').startOf('month').subtract(1, 'month');
            t.add(12 * t.daysInMonth(), 'hours');
            return {
                date: t.format(momentDateFormat),
                time: t.format(momentTimeFormat),
                timeWindowUnits: 3,
                windowSize: (t.daysInMonth() * 24) / 2.0
            }
        }
    },
    {
        label: 'Last 30 Days', createFilter: (tz) => {
            const offset = momentTZ.tz(moment.utc().startOf('day').format('YYYY-MM-DDTHH:mm:ss.SSSSS'), tz).utcOffset();
            const t = moment.utc().add(offset, 'hour').startOf('day');
            t.subtract(15, 'days');
            return {
                date: t.format(momentDateFormat),
                time: t.format(momentTimeFormat),
                timeWindowUnits: 4,
                windowSize: 15
            }
        }
    },
    {
        label: 'This Quarter', createFilter: (tz) => {
            const offset = momentTZ.tz(moment.utc().startOf('quarter').add(1, 'quarter').format('YYYY-MM-DDTHH:mm:ss.SSSSS'), tz).utcOffset();
            const offset_tend = momentTZ.tz(moment.utc().startOf('quarter').format('YYYY-MM-DDTHH:mm:ss.SSSSS'), tz).utcOffset();
            const t = moment.utc().add(offset, 'hour').startOf('quarter');
            const tend = moment.utc().add(offset_tend, 'hour').startOf('quarter');
            tend.add(1, 'quarter')
            const h = moment.duration(tend.diff(t)).asDays();
            t.add(h * 0.5, 'day');
            return {
                date: t.format(momentDateFormat),
                time: t.format(momentTimeFormat),
                timeWindowUnits: 4,
                windowSize: h * 0.5
            }
        }
    },
    {
        label: 'Last Quarter', createFilter: (tz) => {
            const offset = momentTZ.tz(moment.utc().startOf('quarter').subtract(1, 'quarter').format('YYYY-MM-DDTHH:mm:ss.SSSSS'), tz).utcOffset();
            const offset_tend = momentTZ.tz(moment.utc().startOf('quarter').format('YYYY-MM-DDTHH:mm:ss.SSSSS'), tz).utcOffset();
            const t = moment.utc().add(offset, 'hour').startOf('quarter');
            const tend = moment.utc().add(offset_tend, 'hour').startOf('quarter');
            t.subtract(1, 'quarter');
            const h = moment.duration(tend.diff(t)).asDays();
            t.add(h * 0.5, 'day');
            return {
                date: t.format(momentDateFormat),
                time: t.format(momentTimeFormat),
                timeWindowUnits: 4,
                windowSize: h * 0.5
            }
        }
    },
    {
        label: 'Last 90 Days', createFilter: (tz) => {
            const offset = momentTZ.tz(moment.utc().startOf('day').subtract(45, 'days').format('YYYY-MM-DDTHH:mm:ss.SSSSS'), tz).utcOffset();
            const t = moment.utc().add(offset, 'minute').startOf('day');
            t.subtract(45, 'days');
            return {
                date: t.format(momentDateFormat),
                time: t.format(momentTimeFormat),
                timeWindowUnits: 4,
                windowSize: 45
            }
        }
    },
    {
        label: 'This Year', createFilter: (tz) => {
            const offset = momentTZ.tz(moment.utc().startOf('year').add(6, 'month').format('YYYY-MM-DDTHH:mm:ss.SSSSS'), tz).utcOffset();
            const t = moment.utc().add(offset, 'minute').startOf('year');
            t.add(6, 'month');
            return {
                date: t.format(momentDateFormat),
                time: t.format(momentTimeFormat),
                timeWindowUnits: 6,
                windowSize: 6
            }
        }
    },
    {
        label: 'Last Year', createFilter: (tz) => {
            const offset = momentTZ.tz(moment.utc().startOf('year').subtract(1, 'year').format('YYYY-MM-DDTHH:mm:ss.SSSSS'), tz).utcOffset();
            const t = moment.utc().add(offset, 'minute').startOf('year').subtract(1, 'year');
            t.add(6, 'month');

            return {
                date: t.format(momentDateFormat),
                time: t.format(momentTimeFormat),
                timeWindowUnits: 6,
                windowSize: 6
            }
        }
    },
    {
        label: 'Last 365 Days', createFilter: (tz) => {
            const offset = momentTZ.tz(moment.utc().startOf('day').subtract(182.5, 'days').format('YYYY-MM-DDTHH:mm:ss.SSSSS'), tz).utcOffset();
            const t = moment.utc().add(offset, 'minute').startOf('day');
            t.subtract(182.5, 'days');
            return {
                date: t.format(momentDateFormat),
                time: t.format(momentTimeFormat),
                timeWindowUnits: 4,
                windowSize: 182
            }
        }
    }
];



const ReportTimeFilter = (props: IProps) => {
    const timeZone = useSelector(SelectTimeZone);
    const [activeQP, setActiveQP] = React.useState<number>(-1);
    const dateTimeSetting = useSelector(SelectDateTimeSetting);
    const [filter, setFilter] = React.useState<ITimeFilter>({
        centerTime: props.filter.date + ' ' + props.filter.time,
        startTime: getMoment(props.filter.date, props.filter.time)
            .subtract(props.filter.windowSize, momentUnit(props.filter.timeWindowUnits))
            .format(momentDateFormat + ' ' + momentTimeFormat),
        endTime: getMoment(props.filter.date,props.filter.time)
            .add(props.filter.windowSize, momentUnit(props.filter.timeWindowUnits))
            .format(momentDateFormat + ' ' + momentTimeFormat),
        timeWindowUnits: props.filter.timeWindowUnits,
        windowSize: props.filter.windowSize*2,
        halfWindowSize: props.filter.windowSize,
    });

    
    React.useEffect(() => {
        if (isEqual(filter, props.filter))
            return;
        props.setFilter({
            time: filter.centerTime.split(' ')[1],
            date: filter.centerTime.split(' ')[0],
            windowSize: filter.halfWindowSize,
            timeWindowUnits: filter.timeWindowUnits
        });
    }, [filter])

    function isEqual(flt1: ITimeFilter, flt2: SEBrowser.IReportTimeFilter) {
        const t = flt2.date + ' ' + flt2.time;
        return flt1.centerTime == t &&
            flt1.timeWindowUnits == flt2.timeWindowUnits &&
            flt1.windowSize == flt2.windowSize * 2;
    }

    React.useEffect(() => {
        if (isEqual(filter, props.filter))
            return;

        const durationValue = props.filter.windowSize;
        const dUnits = props.filter.timeWindowUnits;

        const centerTime = getMoment(props.filter.date, props.filter.time);
        const [startTime, endTime] = getStartEndTime(centerTime, durationValue, dUnits);
        
        setFilter(prevState => ({
            ...prevState,
            centerTime: centerTime.format('MM/DD/YYYY HH:mm:ss.SSS') ,
            startTime: startTime.format('MM/DD/YYYY HH:mm:ss.SSS'),
            endTime: endTime.format('MM/DD/YYYY HH:mm:ss.SSS'),
            timeWindowUnits: dUnits,
            windowSize: durationValue * 2,
            halfWindowSize: durationValue,
        }));

    }, [props.filter]);
   

    return (
        <fieldset className="border" style={{ padding: '10px', height: '100%' }}>
            <legend className="w-auto" style={{ fontSize: 'large' }}>Date/Time Filter:</legend>
                {dateTimeSetting === 'center' ?
                <div className="row">
                    <div className='col-12'>
                        <DatePicker< ITimeFilter > Record={filter} Field="centerTime"
                            Setter={(r) => {
                                const centerTime = getMoment(r.centerTime);
                                const [startTime, endTime] = getStartEndTime(centerTime, filter.halfWindowSize, filter.timeWindowUnits);

                                setFilter(prevFilter => ({
                                    ...prevFilter,
                                    centerTime: centerTime.format(momentDateFormat + ' ' + momentTimeFormat),
                                    startTime: startTime.format(momentDateFormat + ' ' + momentTimeFormat),
                                    endTime: endTime.format(momentDateFormat + ' ' + momentTimeFormat)
                                }));;
                                setActiveQP(-1);
                            }}
                                Label='Time Window Center:'
                            Type='datetime-local'
                            Valid={(record) => { return true; }} Format={momentDateFormat + ' ' + momentTimeFormat} />
                        </div>
                    </div>
                            : null
                        }
            {dateTimeSetting === 'startWindow' || dateTimeSetting === 'startEnd' ?
                <div className="row"> 
                    <div className='col-12'>
                            <DatePicker< ITimeFilter > Record={filter} Field="startTime"
                                Setter={(r) => {
                                    const startTime = getMoment(r.startTime);
                                    let window = filter.windowSize;
                                    let unit = filter.timeWindowUnits;
                                    if (dateTimeSetting === 'startEnd') {
                                        [unit, window] = findAppropriateUnit(startTime, getMoment(filter.endTime));
                                    }

                                    const d = moment.duration(window / 2, momentUnit(unit));
                                    const centerTime = startTime.clone().add(d.asHours(), 'h');
                                    const endTime = centerTime.clone().add(d.asHours(), 'h');
                                    setFilter({
                                        centerTime: centerTime.format(momentDateFormat + ' ' + momentTimeFormat),
                                        startTime: startTime.format(momentDateFormat + ' ' + momentTimeFormat),
                                        endTime: endTime.format(momentDateFormat + ' ' + momentTimeFormat),
                                        windowSize: window,
                                        halfWindowSize: window / 2,
                                        timeWindowUnits: unit

                                    });
                                    setActiveQP(-1);
                                }}
                                Label='Start of Time Window:'
                                Type='datetime-local'
                                Valid={() => true} Format={momentDateFormat + ' ' + momentTimeFormat}
                            />
                    </div> 
                </div>
                            : null
                        }
            {dateTimeSetting === 'endWindow' || dateTimeSetting === 'startEnd' ?
                    <div className="row"> 
                        <div className='col-12'>
                            <DatePicker<ITimeFilter> Record={filter} Field="endTime"
                                Setter={(r) => {
                                    const endTime = getMoment(r.endTime);
                                    let window = filter.windowSize;
                                    let unit = filter.timeWindowUnits;
                                    if (dateTimeSetting === 'startEnd') {
                                        [unit, window] = findAppropriateUnit(getMoment(filter.startTime), endTime);
                                    }
                                    const d = moment.duration(window / 2, momentUnit(unit));
                                    const centerTime = endTime.clone().subtract(d.asHours(), 'h');
                                    const startTime = centerTime.clone().subtract(d.asHours(), 'h');
                                    setFilter({
                                        centerTime: centerTime.format(momentDateFormat + ' ' + momentTimeFormat),
                                        startTime: startTime.format(momentDateFormat + ' ' + momentTimeFormat),
                                        endTime: endTime.format(momentDateFormat + ' ' + momentTimeFormat),
                                        windowSize: window,
                                        halfWindowSize: window / 2,
                                        timeWindowUnits: unit

                                    });
                                    setActiveQP(-1);
                                }}
                                Label='End of Time Window :'
                                Type='datetime-local'
                                Valid={() =>  true } Format={momentDateFormat + ' ' + momentTimeFormat}
                            />
                    </div>
                    </div>
                : null
                }
                {dateTimeSetting === 'center' ?
                <>
                    <label style={{ width: '100%', position: 'relative', float: "left" }}>Time Window(+/-): </label>
                    <div className="row">
                        <div className='col-6'>
                            <Input<ITimeFilter> Record={filter} Field='halfWindowSize' Setter={(r) => {
                                const window = r.halfWindowSize;
                                const centerTime = getMoment(filter.centerTime);
                                const [startTime, endTime] = getStartEndTime(centerTime, window, filter.timeWindowUnits);

                                setFilter(prevFilter => ({
                                    ...prevFilter,
                                    windowSize: 2 * window,
                                    halfWindowSize: window,
                                    startTime: startTime.format(momentDateFormat + ' ' + momentTimeFormat),
                                    endTime: startTime.format(momentDateFormat + ' ' + momentTimeFormat)
                                }));;
                                setActiveQP(-1);
                            }} Label='' Valid={(record) => { return true; }}
                                Type='number' />
                        </div>
                        <div className='col-6'>
                            <Select<ITimeFilter> Record={filter} Label=''
                                Field='timeWindowUnits'
                                Setter={(r) => {
                                    const centerTime = getMoment(filter.centerTime);
                                    const [startTime, endTime] = getStartEndTime(centerTime, filter.halfWindowSize, r.timeWindowUnits);
                                    setFilter(prevFilter => ({
                                        ...prevFilter,
                                        timeWindowUnits: r.timeWindowUnits,              
                                        startTime: startTime.format(momentDateFormat + ' ' + momentTimeFormat),
                                        endTime: endTime.format(momentDateFormat + ' ' + momentTimeFormat)
                                    }));;
                                    setActiveQP(-1);
                                }}
                                Options={[
                                    { Value: '7', Label: 'Year' },
                                    { Value: '6', Label: 'Month' },
                                    { Value: '5', Label: 'Week' },
                                    { Value: '4', Label: 'Day' },
                                    { Value: '3', Label: 'Hour' },
                                    { Value: '2', Label: 'Minute' },
                                    { Value: '1', Label: 'Second' },
                                    { Value: '0', Label: 'Millisecond' }
                                ]} />
                        </div>
                    </div>
                </>
                : null
                }
                {dateTimeSetting === 'startWindow' ?
                <>
                    <label style={{ width: '100%', position: 'relative', float: "left" }}>Time Window(+): </label>
                    <div className="row">
                        <div className='col-6'>
                            <Input<ITimeFilter> Record={filter} Field='windowSize' Setter={(r) => {
                                const startTime = getMoment(filter.startTime);
                                const d = moment.duration(r.windowSize / 2, momentUnit(filter.timeWindowUnits));
                                const centerTime = startTime.clone().add(d.asHours(), 'h');
                                const endTime = centerTime.clone().add(d.asHours(), 'h');
                                setFilter(prevFilter => ({
                                    ...prevFilter,
                                    windowSize: r.windowSize,
                                    halfWindowSize: r.windowSize / 2,
                                    centerTime: centerTime.format(momentDateFormat + ' ' + momentTimeFormat),
                                    endTime: endTime.format(momentDateFormat + ' ' + momentTimeFormat)
                                }));
                                setActiveQP(-1);
                            }} Label='' Valid={(record) => { return true; }}
                                Type='number' />
                        </div>
                        <div className='col-6'>
                            <Select<ITimeFilter> Record={filter} Label=''
                                Field='timeWindowUnits'
                                Setter={(r) => {
                                    const startTime = getMoment(filter.startTime);
                                    const d = moment.duration(filter.halfWindowSize, momentUnit(r.timeWindowUnits));
                                    const centerTime = startTime.clone().add(d.asHours(), 'h');
                                    const endTime = centerTime.clone().add(d.asHours(), 'h');
                                    setFilter(prevFilter => ({
                                        ...prevFilter,
                                        timeWindowUnits: r.timeWindowUnits,
                                        centerTime: centerTime.format(momentDateFormat + ' ' + momentTimeFormat),
                                        endTime: endTime.format(momentDateFormat + ' ' + momentTimeFormat)
                                    }));;
                                    setActiveQP(-1);
                                }}
                                Options={[
                                    { Value: '7', Label: 'Year' },
                                    { Value: '6', Label: 'Month' },
                                    { Value: '5', Label: 'Week' },
                                    { Value: '4', Label: 'Day' },
                                    { Value: '3', Label: 'Hour' },
                                    { Value: '2', Label: 'Minute' },
                                    { Value: '1', Label: 'Second' },
                                    { Value: '0', Label: 'Millisecond' }
                                ]} />
                        </div>
                    </div>
                </>
                : null
                }
                {dateTimeSetting === 'endWindow' ?
                    <>
                    <label style={{ width: '100%', position: 'relative', float: "left" }}>Time Window(-): </label>
                    <div className="row">
                        <div className='col-6'>
                            <Input<ITimeFilter> Record={filter} Field='windowSize' Setter={(r) => {
                                const endTime = getMoment(filter.endTime);
                                const d = moment.duration(r.windowSize / 2, momentUnit(filter.timeWindowUnits));
                                const centerTime = endTime.clone().subtract(d.asHours(), 'h');
                                const startTime = centerTime.clone().subtract(d.asHours(), 'h');
                                setFilter(prevFilter => ({
                                    ...prevFilter,
                                    windowSize: r.windowSize,
                                    halfWindowSize: r.windowSize/2,
                                    centerTime: centerTime.format(momentDateFormat + ' ' + momentTimeFormat),
                                    startTime: startTime.format(momentDateFormat + ' ' + momentTimeFormat)
                                }));
                                setActiveQP(-1);
                            }} Label='' Valid={(record) => { return true; }}
                                Type='number' />
                        </div>
                        <div className='col-6'>
                            <Select<ITimeFilter> Record={filter} Label=''
                                Field='timeWindowUnits'
                            Setter={(r) => {
                                const endTime = getMoment(filter.endTime);
                                const d = moment.duration(filter.halfWindowSize, momentUnit(r.timeWindowUnits));
                                const centerTime = endTime.clone().subtract(d.asHours(), 'h');
                                const startTime = centerTime.clone().subtract(d.asHours(), 'h');
                                setFilter(prevFilter => ({
                                    ...prevFilter,
                                    timeWindowUnits: r.timeWindowUnits,
                                    centerTime: centerTime.format(momentDateFormat + ' ' + momentTimeFormat),
                                    startTime: startTime.format(momentDateFormat + ' ' + momentTimeFormat)
                                }));;
                                setActiveQP(-1);
                            }}
                                Options={[
                                    { Value: '7', Label: 'Year' },
                                    { Value: '6', Label: 'Month' },
                                    { Value: '5', Label: 'Week' },
                                    { Value: '4', Label: 'Day' },
                                    { Value: '3', Label: 'Hour' },
                                    { Value: '2', Label: 'Minute' },
                                    { Value: '1', Label: 'Second' },
                                    { Value: '0', Label: 'Millisecond' }
                                ]} />
                        </div>
                    </div>
                </>
                : null
                }

            {props.showQuickSelect ?
                <div className="row" style={{ width: '100%' }}>

                    {AvailableQuickSelects.map((qs, i) => {
                        if (i % 3 !== 0)
                            return null;
                        return (
                            <div key={i} className={"col-3"} style={{ paddingLeft: (i % 12 == 0 ? 15 : 0), paddingRight: (i % 12 == 9 ? 15 : 2), marginTop: 10 }}>
                                <ul className="list-group" key={i}>
                                    <li key={i} style={{ cursor: 'pointer' }}
                                        onClick={() => {
                                            props.setFilter(AvailableQuickSelects[i].createFilter(timeZone));
                                            setActiveQP(i);
                                        }}
                                        className={"item badge badge-" + (i == activeQP ? "primary" : "secondary")}>{AvailableQuickSelects[i].label}
                                    </li>
                                    {i + 1 < AvailableQuickSelects.length ?
                                        <li key={i + 1} style={{ marginTop: 3, cursor: 'pointer' }}
                                            className={"item badge badge-" + (i + 1 == activeQP ? "primary" : "secondary")}
                                            onClick={() => {
                                                props.setFilter(AvailableQuickSelects[i + 1].createFilter(timeZone));
                                                setActiveQP(i + 1)
                                            }}>
                                            {AvailableQuickSelects[i + 1].label}
                                        </li> : null}
                                    {i + 2 < AvailableQuickSelects.length ?
                                        <li key={i + 2}
                                            style={{ marginTop: 3, cursor: 'pointer' }}
                                            className={"item badge badge-" + (i + 2 == activeQP ? "primary" : "secondary")}
                                            onClick={() => {
                                                props.setFilter(AvailableQuickSelects[i + 2].createFilter(timeZone));
                                                setActiveQP(i + 2);
                                            }}>
                                            {AvailableQuickSelects[i + 2].label}
                                        </li> : null}
                                </ul>
                            </div>
                        )
                    })}
                </div>
                : null}
        </fieldset>
    );
}
export default ReportTimeFilter;