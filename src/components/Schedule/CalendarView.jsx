import React, { useMemo, useState, useEffect } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Modal, Button, Card, Empty, Tag } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, FlagOutlined } from '@ant-design/icons';

const localizer = momentLocalizer(moment);

// Mobile Detector Hook
const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return isMobile;
};

// Mobile Calendar View for Tasks
const MobileTaskCalendarView = ({ tasks = [], onEdit }) => {
    const [currentDate, setCurrentDate] = useState(moment());
    const [selectedDateTasks, setSelectedDateTasks] = useState([]);
    const [showModal, setShowModal] = useState(false);

    // Group tasks by date
    const tasksByDate = useMemo(() => {
        const grouped = {};
        tasks.forEach(task => {
            if (task.dueDate) {
                const dateKey = moment(task.dueDate).format('YYYY-MM-DD');
                if (!grouped[dateKey]) {
                    grouped[dateKey] = [];
                }
                grouped[dateKey].push(task);
            }
        });
        return grouped;
    }, [tasks]);

    const handleDateClick = (day) => {
        const dateKey = moment(day).format('YYYY-MM-DD');
        const tasksForDate = tasksByDate[dateKey] || [];
        setSelectedDateTasks(tasksForDate);
        setShowModal(true);
    };

    const renderCalendarDays = () => {
        const startOfMonth = currentDate.clone().startOf('month');
        const endOfMonth = currentDate.clone().endOf('month');
        const startDay = startOfMonth.clone().startOf('week');

        const days = [];
        let day = startDay.clone();

        while (day.isBefore(endOfMonth.clone().endOf('week'))) {
            days.push(day.clone());
            day.add(1, 'day');
        }

        return days;
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'HIGH':
                return 'red';
            case 'MEDIUM':
                return 'orange';
            default:
                return 'blue';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED':
                return '#52c41a';
            case 'IN_PROGRESS':
                return '#1890ff';
            case 'PENDING':
                return '#faad14';
            default:
                return '#3174ad';
        }
    };

    const calendarDays = renderCalendarDays();
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <Button
                    type="text"
                    size="small"
                    onClick={() => setCurrentDate(currentDate.clone().subtract(1, 'month'))}
                >
                    ←
                </Button>
                <h3 className="text-base font-semibold text-slate-900">
                    {currentDate.format('MMMM YYYY')}
                </h3>
                <Button
                    type="text"
                    size="small"
                    onClick={() => setCurrentDate(currentDate.clone().add(1, 'month'))}
                >
                    →
                </Button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-slate-500 py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, idx) => {
                    const dateKey = day.format('YYYY-MM-DD');
                    const hasTasks = tasksByDate[dateKey];
                    const isCurrentMonth = day.isSame(currentDate, 'month');
                    const isToday = day.isSame(moment(), 'day');

                    return (
                        <div
                            key={idx}
                            onClick={() => hasTasks && handleDateClick(day)}
                            className={`
                                aspect-square flex items-center justify-center rounded text-xs font-medium cursor-pointer relative
                                transition-all duration-200
                                ${isCurrentMonth ? 'text-slate-900' : 'text-slate-300'}
                                ${isToday ? 'bg-violet-100 border border-violet-300' : ''}
                                ${hasTasks ? 'hover:bg-slate-100' : ''}
                            `}
                        >
                            <span>{day.date()}</span>
                            {hasTasks && (
                                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-violet-500 rounded-full"></div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Modal for selected date tasks */}
            <Modal
                title={`Tasks - ${moment(selectedDateTasks[0]?.dueDate).format('MMM DD, YYYY')}`}
                open={showModal}
                onCancel={() => setShowModal(false)}
                footer={null}
                width={350}
                bodyStyle={{ maxHeight: '500px', overflowY: 'auto' }}
            >
                {selectedDateTasks.length === 0 ? (
                    <Empty description="No tasks" />
                ) : (
                    <div className="space-y-3">
                        {selectedDateTasks.map(task => (
                            <Card
                                key={task.id}
                                size="small"
                                className="cursor-pointer hover:shadow-md transition-all border border-slate-200"
                                style={{ borderLeft: `4px solid ${getStatusColor(task.status)}` }}
                                onClick={() => {
                                    setShowModal(false);
                                    onEdit && onEdit(task);
                                }}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <Tag color={getPriorityColor(task.priority)}>
                                        <FlagOutlined className="mr-1" />
                                        {task.priority || 'NORMAL'}
                                    </Tag>
                                    <Tag color="blue">ID: #{task.id}</Tag>
                                </div>

                                <div className="mb-2">
                                    <div className="font-medium text-sm text-slate-900 mb-1 line-clamp-2">
                                        {task.taskName}
                                    </div>
                                    <div className="text-xs text-slate-600 line-clamp-2">
                                        {task.description || 'No description'}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200">
                                    <span className="text-xs font-semibold px-2 py-1 rounded" style={{ backgroundColor: getStatusColor(task.status) + '20', color: getStatusColor(task.status) }}>
                                        {task.status === 'COMPLETED' ? 'Completed' : task.status === 'IN_PROGRESS' ? 'In Progress' : 'To Do'}
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        <ClockCircleOutlined className="mr-1" />
                                        {task.dueDate ? moment(task.dueDate).format('MMM DD') : 'No Due Date'}
                                    </span>
                                </div>

                                {task.status !== 'COMPLETED' && (
                                    <Button
                                        type="primary"
                                        size="small"
                                        className="w-full mt-2 !bg-green-600 border-0"
                                        icon={<CheckCircleOutlined />}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEdit && onEdit(task);
                                        }}
                                    >
                                        Complete
                                    </Button>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </Modal>
        </div>
    );
};

// Desktop Calendar View for Tasks
const DesktopTaskCalendarView = ({ tasks = [], onEdit }) => {
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
                style={{ height: 'calc(100vh - 350px)' }}
                onSelectEvent={handleSelectEvent}
                eventPropGetter={eventStyleGetter}
                view={view}
                onView={setView}
                date={date}
                onNavigate={setDate}
                views={['month', 'week', 'day']}
                popup
            />
        </div>
    );
};

// Main Calendar View Component
const CalendarView = ({ tasks = [], onEdit }) => {
    const isMobile = useIsMobile();

    if (isMobile) {
        return <MobileTaskCalendarView tasks={tasks} onEdit={onEdit} />;
    }

    return <DesktopTaskCalendarView tasks={tasks} onEdit={onEdit} />;
};

export default CalendarView;
