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
            <div className="flex items-center justify-between p-2 sm:p-4 sm:pb-2 pb-1">
                <h2 className="text-base sm:text-lg font-bold text-slate-800 m-0">
                    {viewDate.format('MMM YYYY')}
                </h2>
                <div className="flex gap-1">
                    <Button
                        type="text"
                        shape="circle"
                        icon={<LeftOutlined />}
                        size="small"
                        onClick={prevMonth}
                    />
                    <Button
                        type="text"
                        shape="circle"
                        icon={<RightOutlined />}
                        size="small"
                        onClick={nextMonth}
                    />
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="px-2 sm:px-4 pb-2 sm:pb-4">
                <div className="grid grid-cols-7 mb-1 sm:mb-2">
                    {DAYS.map(day => (
                        <div key={day} className="text-center text-xs font-medium text-slate-500 py-0.5 sm:py-1">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-y-1 sm:gap-y-2">
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
                                        w-6 sm:w-8 h-6 sm:h-8 flex items-center justify-center rounded-full text-xs sm:text-sm transition-all
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

            <div className="px-2 sm:px-4 py-2 sm:py-3 border-t border-slate-100 bg-slate-50/50">
                {/* Time Picker */}
                {selectedDate && (
                    <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-slate-200">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <FieldTimeOutlined className="text-slate-500 text-sm" />
                            <span className="text-xs sm:text-sm font-semibold text-slate-700">Time</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 mt-2">
                            {/* Hours (12-hour format) */}
                            <Select
                                value={selectedDate.hour() % 12 || 12}
                                onChange={(val) => handleTimeChange('hour', val)}
                                style={{ width: '60px' }}
                                size="small"
                                className="text-xs"
                            >
                                {Array.from({ length: 12 }, (_, i) => (
                                    <Select.Option key={i + 1} value={i + 1}>
                                        {String(i + 1).padStart(2, '0')}
                                    </Select.Option>
                                ))}
                            </Select>
                            <span className="text-slate-500 font-bold">:</span>
                            {/* Minutes */}
                            <Select
                                value={selectedDate.minute()}
                                onChange={(val) => handleTimeChange('minute', val)}
                                style={{ width: '60px' }}
                                size="small"
                                className="text-xs"
                            >
                                {Array.from({ length: 60 }, (_, i) => (
                                    <Select.Option key={i} value={i}>
                                        {String(i).padStart(2, '0')}
                                    </Select.Option>
                                ))}
                            </Select>
                            {/* AM/PM */}
                            <Select
                                value={selectedDate.hour() >= 12 ? 'PM' : 'AM'}
                                onChange={(val) => handleTimeChange('ampm', val)}
                                style={{ width: '70px' }}
                                size="small"
                                className="text-xs font-semibold"
                            >
                                <Select.Option value="AM">AM</Select.Option>
                                <Select.Option value="PM">PM</Select.Option>
                            </Select>
                        </div>
                    </div>
                )}

                {/* Presets */}
                <div className="flex gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <button
                        onClick={setToday}
                        className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 bg-white border border-slate-200 rounded-lg text-xs sm:text-base font-medium text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-colors shadow-sm"
                    >
                        <CalendarOutlined className="text-xs sm:text-base" />
                        <span className="hidden sm:inline">Today</span>
                    </button>
                    <button
                        onClick={setTomorrow}
                        className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 bg-white border border-slate-200 rounded-lg text-xs sm:text-base font-medium text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-colors shadow-sm"
                    >
                        <RightOutlined className="text-xs" />
                        <span className="hidden sm:inline">Tmrw</span>
                    </button>
                    <button
                        onClick={setNextWeek}
                        className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 bg-white border border-slate-200 rounded-lg text-xs sm:text-base font-medium text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-colors shadow-sm"
                    >
                        <ClockCircleOutlined className="text-xs sm:text-base" />
                        <span className="hidden sm:inline">Week</span>
                    </button>
                </div>

                {selectedDate && (
                    <div className="mt-2 sm:mt-3 text-center">
                        <span className="inline-block px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                            {selectedDate.format('dddd, MMM D, HH:mm')}
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
                value={selectedDate ? selectedDate.format('MM/DD/YYYY HH:mm') : ''}
                placeholder="Select date & time"
                prefix={<CalendarOutlined className="text-slate-400" />}
                className="cursor-pointer hover:border-blue-400 focus:border-blue-500"
                onClick={() => setOpen(true)}
                onFocus={(e) => e.target.blur()}
                style={{ caretColor: 'transparent' }}
            />
        </Popover>
    );
};

export default DatePickerHelper;
