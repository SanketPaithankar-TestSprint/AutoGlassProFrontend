import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, DatePicker, message, Select } from 'antd';
import { getAllAttendance } from '../../api/attendance';
import { getValidToken } from '../../api/getValidToken';
import dayjs from 'dayjs';

const AdminAttendanceView = ({ onRecordAttendance }) => {
    const [loading, setLoading] = useState(false);
    const [attendanceData, setAttendanceData] = useState([]);
    const [selectedDate, setSelectedDate] = useState(dayjs());

    // Admin can also filter by employee ideally
    // For now, listing all for the selected date

    const token = getValidToken();

    useEffect(() => {
        fetchAdminData();

        const handleRefresh = () => fetchAdminData();
        window.addEventListener('refreshAttendance', handleRefresh);
        return () => window.removeEventListener('refreshAttendance', handleRefresh);
    }, [selectedDate]);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            // Depending on API, we might need to pass date range.
            // Assuming getAllAttendance accepts a 'date' param or fetches all.
            // Let's assume it fetches all for now and we filter client side if API doesn't support filter, 
            // OR we pass params. Ideally API should support it.
            // Based on task description, "admin based apis should be visible"
            const data = await getAllAttendance(token);

            // Filter by selected month on client side if API returns all
            const monthStr = selectedDate.format('YYYY-MM');
            const filtered = Array.isArray(data) ? data.filter(item => item.date && item.date.startsWith(monthStr)) : [];

            // Sort by date descending
            filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

            setAttendanceData(filtered);
        } catch (error) {
            message.error("Failed to fetch attendance records");
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (text) => text ? dayjs(text).format('MMM D, YYYY') : '-'
        },
        {
            title: 'Employee',
            dataIndex: 'employeeName', // Assuming API returns employee name
            key: 'employeeName',
            render: (text, record) => record.employeeName || `Emp #${record.employeeId}`
        },
        {
            title: 'Clock In',
            dataIndex: 'clockInTime',
            key: 'clockInTime',
            render: (text) => text ? dayjs(text).format('h:mm A') : '-'
        },
        {
            title: 'Clock Out',
            dataIndex: 'clockOutTime',
            key: 'clockOutTime',
            render: (text) => text ? dayjs(text).format('h:mm A') : '-'
        },
        {
            title: 'Total Hours',
            key: 'totalHours',
            render: (_, record) => {
                if (record.totalHours) return record.totalHours.toFixed(2);
                if (record.clockInTime && record.clockOutTime) {
                    const start = dayjs(record.clockInTime);
                    const end = dayjs(record.clockOutTime);
                    const hours = end.diff(start, 'hour', true);
                    return hours.toFixed(2);
                }
                return '-';
            }
        },
        {
            title: 'Status',
            key: 'status',
            render: (_, record) => (
                <Tag color={record.clockOutTime ? 'green' : 'blue'}>
                    {record.status || (record.clockOutTime ? 'Completed' : 'Active')}
                </Tag>
            )
        },
        {
            title: 'Notes',
            dataIndex: 'notes',
            key: 'notes',
            render: (text) => text || '-'
        }
    ];

    return (
        <div className="space-y-6">
            <Card title="Employee Attendance Overview" extra={
                <DatePicker
                    picker="month"
                    value={selectedDate}
                    onChange={date => setSelectedDate(date)}
                    allowClear={false}
                    format="MMMM YYYY"
                />
            }>
                <Table
                    dataSource={attendanceData}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                />
            </Card>
        </div>
    );
};

export default AdminAttendanceView;
