import React, { useState, useEffect } from 'react';
import { Button, Select, Popover, Input } from 'antd';
import { LeftOutlined, RightOutlined, CalendarOutlined, ClockCircleOutlined, FieldTimeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const DatePickerHelper = ({ value, onChange }) => {
    // State for the calendar view (month navigation)
    const [viewDate, setViewDate] = useState(value ? dayjs(value) : dayjs());
    const [selectedDate, setSelectedDate] = useState(value ? dayjs(value) : null);
    const [open, setOpen] = useState(false);

    // Sync internal state with external value prop
    useEffect(() => {
        if (value) {
            const newVal = dayjs(value);
            setSelectedDate(newVal);
            if (!viewDate.isSame(newVal, 'month')) {
                setViewDate(newVal);
            }
        }
    }, [value]);

    // Calendar navigation
    const prevMonth = () => setViewDate(viewDate.subtract(1, 'month'));
    const nextMonth = () => setViewDate(viewDate.add(1, 'month'));

    // Date Selection
    const handleDateClick = (dayDisplay) => {
        let newDate = viewDate.date(dayDisplay);

        if (selectedDate) {
            newDate = newDate.hour(selectedDate.hour()).minute(selectedDate.minute());
        } else {
            newDate = newDate.hour(9).minute(0);
        }

        setSelectedDate(newDate);
        onChange(newDate);
    };

    // Preset Handlers
    const setToday = () => {
        const now = dayjs();
        const newDate = selectedDate
            ? now.hour(selectedDate.hour()).minute(selectedDate.minute())
            : now.hour(9).minute(0);

        setViewDate(now);
        setSelectedDate(newDate);
        onChange(newDate);
    };

    const setTomorrow = () => {
        const tom = dayjs().add(1, 'day');
        const newDate = selectedDate
            ? tom.hour(selectedDate.hour()).minute(selectedDate.minute())
            : tom.hour(9).minute(0);

        setViewDate(tom);
        setSelectedDate(newDate);
        onChange(newDate);
    };

    const setNextWeek = () => {
        const next = dayjs().add(1, 'week');
        const newDate = selectedDate
            ? next.hour(selectedDate.hour()).minute(selectedDate.minute())
            : next.hour(9).minute(0);

        setViewDate(next);
        setSelectedDate(newDate);
        onChange(newDate);
    };

    // Time Handling
    const handleTimeChange = (type, val) => {
        if (!selectedDate) return;

        let newDate = dayjs(selectedDate);

        if (type === 'hour') {
            const currentHour = newDate.hour();
            const isPM = currentHour >= 12;

            // logic for 12h -> 24h
            if (isPM && val !== 12) val += 12;
            else if (!isPM && val === 12) val = 0;

            newDate = newDate.hour(val);
        } else if (type === 'minute') {
            newDate = newDate.minute(val);
        } else if (type === 'ampm') {
            const currentHour = newDate.hour();
            if (val === 'PM' && currentHour < 12) {
                newDate = newDate.hour(currentHour + 12);
            } else if (val === 'AM' && currentHour >= 12) {
                newDate = newDate.hour(currentHour - 12);
            }
        }

        setSelectedDate(newDate);
        onChange(newDate);
    };

    // Calendar Generation Logic
    const startOfMonth = viewDate.startOf('month');
    const endOfMonth = viewDate.endOf('month');
    const startDay = startOfMonth.day();
    const daysInMonth = viewDate.daysInMonth();
    const startOffset = startDay === 0 ? 6 : startDay - 1;

    const calendarDays = [];
    for (let i = 0; i < startOffset; i++) {
        calendarDays.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push(i);
    }

    const calendarContent = (
        <div className="w-full max-w-sm font-sans mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 pb-2">
                <h2 className="text-lg font-bold text-slate-800 m-0">
                    {viewDate.format('MMM YYYY')}
                </h2>
                <div className="flex gap-1">
                    <Button
                        type="text"
                        shape="circle"
                        icon={<LeftOutlined />}
                        onClick={prevMonth}
                    />
                    <Button
                        type="text"
                        shape="circle"
                        icon={<RightOutlined />}
                        onClick={nextMonth}
                    />
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="px-4 pb-4">
                <div className="grid grid-cols-7 mb-2">
                    {DAYS.map(day => (
                        <div key={day} className="text-center text-xs font-medium text-slate-500 py-1">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-y-2">
                    {calendarDays.map((day, idx) => {
                        if (!day) return <div key={`empty-${idx}`} />;

                        const dateToCheck = viewDate.date(day);
                        const isSelected = selectedDate && dateToCheck.isSame(selectedDate, 'day');
                        const isToday = dateToCheck.isSame(dayjs(), 'day');

                        return (
                            <div key={day} className="flex justify-center">
                                <button
                                    onClick={() => handleDateClick(day)}
                                    className={`
                                        w-8 h-8 flex items-center justify-center rounded-full text-sm transition-all
                                        ${isSelected
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-200 font-semibold'
                                            : isToday
                                                ? 'text-blue-600 font-semibold bg-blue-50'
                                                : 'text-slate-700 hover:bg-slate-100'
                                        }
                                    `}
                                >
                                    {day}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                {/* Presets */}
                <div className="flex gap-3 mb-4">
                    <button
                        onClick={setToday}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-lg text-base font-medium text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-colors shadow-sm"
                    >
                        <CalendarOutlined />
                        Today
                    </button>
                    <button
                        onClick={setTomorrow}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-lg text-base font-medium text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-colors shadow-sm"
                    >
                        <RightOutlined className="text-sm" />
                        Tmrw
                    </button>
                    <button
                        onClick={setNextWeek}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-lg text-base font-medium text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-colors shadow-sm"
                    >
                        <ClockCircleOutlined />
                        Week
                    </button>
                </div>

                {/* Time Picker */}
                <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                        <FieldTimeOutlined className="text-xl" />
                        <span className="text-base font-medium">Time</span>
                    </div>

                    <div className="flex items-center gap-1">
                        {/* Hour 1-12 */}
                        <Select
                            variant="borderless"
                            value={selectedDate ? (selectedDate.hour() % 12 || 12) : 9}
                            onChange={(val) => handleTimeChange('hour', val)}
                            className="w-20 text-right font-bold text-2xl h-10 flex items-center"
                            popupMatchSelectWidth={false}
                            disabled={!selectedDate}
                            options={Array.from({ length: 12 }, (_, i) => ({
                                value: i + 1,
                                label: (i + 1).toString().padStart(2, '0')
                            }))}
                        />
                        <span className="text-slate-400 font-bold text-xl">:</span>
                        {/* Minute */}
                        <Select
                            variant="borderless"
                            value={selectedDate ? selectedDate.minute() : 0}
                            onChange={(val) => handleTimeChange('minute', val)}
                            className="w-20 text-center font-bold text-2xl h-10 flex items-center"
                            popupMatchSelectWidth={false}
                            disabled={!selectedDate}
                            options={[0, 15, 30, 45].map(m => ({
                                value: m,
                                label: m.toString().padStart(2, '0')
                            }))}
                        />
                        {/* AM/PM */}
                        <Select
                            variant="borderless"
                            value={selectedDate ? (selectedDate.hour() >= 12 ? 'PM' : 'AM') : 'AM'}
                            onChange={(val) => handleTimeChange('ampm', val)}
                            className="w-24 font-bold text-2xl text-blue-600 h-10 flex items-center"
                            popupMatchSelectWidth={false}
                            disabled={!selectedDate}
                            options={[
                                { value: 'AM', label: 'AM' },
                                { value: 'PM', label: 'PM' }
                            ]}
                        />
                    </div>
                </div>

                {selectedDate && (
                    <div className="mt-3 text-center">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                            {selectedDate.format('dddd, MMM D • hh:mm A')}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <Popover
            content={calendarContent}
            trigger="click"
            open={open}
            onOpenChange={setOpen}
            placement="bottomLeft"
            overlayInnerStyle={{ padding: 0, borderRadius: '0.75rem' }}
        >
            <Input
                readOnly
                value={selectedDate ? selectedDate.format('MM/DD/YYYY hh:mm A') : ''}
                placeholder="Select date and time"
                prefix={<CalendarOutlined className="text-slate-400" />}
                className="cursor-pointer hover:border-blue-400 focus:border-blue-500"
                onClick={() => setOpen(true)}
            />
        </Popover>
    );
};

export default DatePickerHelper;
