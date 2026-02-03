import React, { useMemo, useState } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Modal } from 'antd';

const localizer = momentLocalizer(moment);

const CalendarView = ({ tasks = [], onEdit }) => {
    const [view, setView] = useState(Views.MONTH);
    const [date, setDate] = useState(new Date());

    const events = useMemo(() => {
        return tasks.map(task => {
            const startDate = task.startDate ? new Date(task.startDate) : new Date();
            // If no due date, assume 1 hour duration
            const endDate = task.dueDate ? new Date(task.dueDate) : new Date(startDate.getTime() + (60 * 60 * 1000));

            return {
                id: task.id,
                title: task.taskName,
                start: startDate,
                end: endDate,
                resource: task,
                // Make all day if it spans more than 24h
                allDay: (endDate - startDate) > (24 * 60 * 60 * 1000)
            };
        });
    }, [tasks]);

    const handleSelectEvent = (event) => {
        if (onEdit && event.resource) {
            onEdit(event.resource);
        }
    };

    const eventStyleGetter = (event, start, end, isSelected) => {
        let backgroundColor = '#3174ad';
        const task = event.resource;

        switch (task.status) {
            case 'COMPLETED':
                backgroundColor = '#52c41a';
                break;
            case 'IN_PROGRESS':
                backgroundColor = '#1890ff';
                break;
            case 'PENDING':
                backgroundColor = '#faad14';
                break;
            default:
                backgroundColor = '#3174ad';
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '4px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block'
            }
        };
    };

    return (
        <div className="h-full bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 'calc(100vh - 250px)' }}
                onSelectEvent={handleSelectEvent}
                eventPropGetter={eventStyleGetter}
                view={view}
                onView={setView}
                date={date}
                onNavigate={setDate}
                views={['month', 'week', 'day', 'agenda']}
                popup
            />
        </div>
    );
};

export default CalendarView;
