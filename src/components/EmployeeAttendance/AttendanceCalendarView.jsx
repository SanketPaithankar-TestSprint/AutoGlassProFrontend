import React, { useMemo, useState } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Modal, Empty, Card, Badge } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, FieldTimeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const localizer = momentLocalizer(moment);

const STATUS_MAP = {
    "PRESENT": { label: "Present", color: "#22c55e", bg: "#f0fdf4", icon: <CheckCircleOutlined /> },
    "ABSENT": { label: "Absent", color: "#ef4444", bg: "#fef2f2", icon: <CloseCircleOutlined /> },
    "LATE": { label: "Late", color: "#f59e0b", bg: "#fffbeb", icon: <ClockCircleOutlined /> },
    "HALF_DAY": { label: "Half Day", color: "#7c3aed", bg: "#f5f3ff", icon: <FieldTimeOutlined /> },
};

const CustomEvent = ({ event }) => {
    const stat = event.resource;
    const { total, PRESENT, ABSENT, LATE, HALF_DAY } = stat;

    return (
        <div className="flex flex-col justify-center items-center w-full px-1 py-1 h-full mt-1">
            <div className="flex flex-wrap items-center justify-center gap-1.5 font-bold text-[11.5px] tracking-wide">
                {PRESENT > 0 && <span style={{ color: STATUS_MAP.PRESENT.color }}>P:{PRESENT}</span>}
                {HALF_DAY > 0 && <span style={{ color: STATUS_MAP.HALF_DAY.color }}>H:{HALF_DAY}</span>}
                {ABSENT > 0 && <span style={{ color: STATUS_MAP.ABSENT.color }}>A:{ABSENT}</span>}
                {LATE > 0 && <span style={{ color: STATUS_MAP.LATE.color }}>L:{LATE}</span>}
            </div>
        </div>
    );
};

const AttendanceCalendarView = ({ attendanceData, currentDate, setCurrentDate }) => {
    const [view, setView] = useState(Views.MONTH);
    const [showModal, setShowModal] = useState(false);
    const [selectedDateRecords, setSelectedDateRecords] = useState([]);
    const [selectedDateStr, setSelectedDateStr] = useState("");

    // Process attendance data into aggregated calendar events
    const events = useMemo(() => {
        if (!Array.isArray(attendanceData) || attendanceData.length === 0) return [];

        const statsByDate = {};

        attendanceData.forEach(record => {
            const dateStr = dayjs(record.date).format('YYYY-MM-DD');
            if (!statsByDate[dateStr]) {
                statsByDate[dateStr] = {
                    dateStr,
                    dateObj: new Date(record.date),
                    total: 0,
                    PRESENT: 0,
                    ABSENT: 0,
                    LATE: 0,
                    HALF_DAY: 0,
                    records: []
                };
            }
            statsByDate[dateStr].total += 1;
            if (statsByDate[dateStr][record.status] !== undefined) {
                statsByDate[dateStr][record.status] += 1;
            }
            statsByDate[dateStr].records.push(record);
        });

        return Object.values(statsByDate).map(stat => ({
            id: stat.dateStr,
            start: stat.dateObj,
            end: stat.dateObj,
            allDay: true,
            resource: stat
        }));
    }, [attendanceData]);

    const handleSelectSlot = ({ start }) => {
        const slotDateStr = dayjs(start).format('YYYY-MM-DD');
        setSelectedDateStr(slotDateStr);

        // Include all records for this specific date
        const recordsForDate = attendanceData.filter(record => {
            return dayjs(record.date).format('YYYY-MM-DD') === slotDateStr;
        });

        setSelectedDateRecords(recordsForDate);
        if (recordsForDate.length > 0) {
            setShowModal(true);
        }
    };

    const handleSelectEvent = (event) => {
        handleSelectSlot({ start: event.start });
    };

    const eventStyleGetter = () => {
        return {
            style: {
                backgroundColor: 'transparent',
                border: 'none',
                display: 'block',
                outline: 'none',
            }
        };
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden flex flex-col flex-1 min-h-0 p-4 relative z-0">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 'calc(100vh - 280px)' }}
                eventPropGetter={eventStyleGetter}
                components={{
                    event: CustomEvent
                }}
                view={view}
                onView={setView}
                date={currentDate.toDate()}
                onNavigate={(newDate) => setCurrentDate(dayjs(newDate))}
                views={['month']}
                selectable={true}
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                popup
            />

            {/* Modal for all employees on a specific date */}
            <Modal
                title={`Attendance Details - ${dayjs(selectedDateStr).format("MMMM D, YYYY")}`}
                open={showModal}
                onCancel={() => setShowModal(false)}
                footer={null}
                className="rounded-lg overflow-hidden"
            >
                {selectedDateRecords.length === 0 ? (
                    <Empty description="No records found." />
                ) : (
                    <div className="space-y-3 mt-4 max-h-[60vh] overflow-y-auto custom-scrollbar px-1">
                        {selectedDateRecords.map(record => {
                            const statusInfo = STATUS_MAP[record.status] || { label: record.status, color: '#64748b', bg: '#f1f5f9' };
                            return (
                                <Card
                                    key={record.employeeId}
                                    size="small"
                                    className="border border-slate-200"
                                    style={{ borderLeft: `4px solid ${statusInfo?.color}` }}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="font-semibold text-slate-800">{record.employeeName}</div>
                                            <div className="text-xs text-slate-500">ID: {record.employeeId}</div>
                                        </div>
                                        <Badge
                                            count={statusInfo?.label}
                                            style={{ backgroundColor: statusInfo?.bg, color: statusInfo?.color, borderColor: statusInfo?.color }}
                                        />
                                    </div>
                                    {record.notes && (
                                        <div className="mt-2 text-xs italic text-slate-600 bg-slate-50 p-2 rounded">
                                            "{record.notes}"
                                        </div>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AttendanceCalendarView;
