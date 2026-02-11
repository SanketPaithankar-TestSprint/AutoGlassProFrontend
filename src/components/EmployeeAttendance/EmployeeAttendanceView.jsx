import React, { useState, useEffect } from 'react';
import { Button, Table, Card, Statistic, Tag, message, Spin } from 'antd';
import { ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { clockIn, clockOut, getAttendanceHistory } from '../../api/attendance';
import { getValidToken } from '../../api/getValidToken';

const EmployeeAttendanceView = ({ employee, onRecordAttendance }) => {
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [currentStatus, setCurrentStatus] = useState(null); // 'CLOCKED_IN' or 'CLOCKED_OUT'
    const [lastSession, setLastSession] = useState(null);

    const token = getValidToken();

    useEffect(() => {
        if (employee?.id) {
            fetchHistory();
        }

        const handleRefresh = () => { if (employee?.id) fetchHistory(); };
        window.addEventListener('refreshAttendance', handleRefresh);
        return () => window.removeEventListener('refreshAttendance', handleRefresh);
    }, [employee?.id]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const data = await getAttendanceHistory(token, employee.id);
            // Assuming data is a list of attendance records
            // Sort by date desc
            const sorted = Array.isArray(data) ? data.sort((a, b) => new Date(b.date) - new Date(a.date)) : [];
            setHistory(sorted);

            // Determine current status based on latest record
            // If latest record has clockIn but no clockOut, then CLOCKED_IN
            if (sorted.length > 0) {
                const latest = sorted[0];
                if (latest.clockInTime && !latest.clockOutTime) {
                    setCurrentStatus('CLOCKED_IN');
                    setLastSession(latest);
                } else {
                    setCurrentStatus('CLOCKED_OUT');
                    setLastSession(latest);
                }
            } else {
                setCurrentStatus('CLOCKED_OUT');
            }
        } catch (error) {
            message.error("Failed to fetch attendance history");
        } finally {
            setLoading(false);
        }
    };

    const handleClockAction = async (action) => {
        setLoading(true);
        try {
            // Get Location
            if (!navigator.geolocation) {
                message.error("Geolocation is not supported by your browser");
                setLoading(false);
                return;
            }

            navigator.geolocation.getCurrentPosition(async (position) => {
                const location = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };

                try {
                    if (action === 'in') {
                        await clockIn(token, employee.id, location);
                        message.success("Clocked In Successfully");
                    } else {
                        await clockOut(token, employee.id, location);
                        message.success("Clocked Out Successfully");
                    }
                    fetchHistory(); // Refresh status and history
                } catch (apiError) {
                    message.error(apiError.message);
                } finally {
                    setLoading(false);
                }
            }, (error) => {
                message.error("Unable to retrieve location. Please allow location access.");
                setLoading(false);
            });

        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            render: (text) => new Date(text).toLocaleDateString()
        },
        {
            title: 'Clock In',
            dataIndex: 'clockInTime',
            key: 'clockInTime',
            render: (text) => text ? new Date(text).toLocaleTimeString() : '-'
        },
        {
            title: 'Clock Out',
            dataIndex: 'clockOutTime',
            key: 'clockOutTime',
            render: (text) => text ? new Date(text).toLocaleTimeString() : '-'
        },
        {
            title: 'Total Hours',
            key: 'totalHours',
            render: (_, record) => {
                if (record.totalHours) return record.totalHours.toFixed(2);
                if (record.clockInTime && record.clockOutTime) {
                    const start = new Date(record.clockInTime);
                    const end = new Date(record.clockOutTime);
                    const diffMs = end - start;
                    const hours = diffMs / (1000 * 60 * 60);
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Current Status" className="shadow-sm">
                    <div className="flex flex-col items-center justify-center py-6">
                        <Statistic
                            title="Status"
                            value={currentStatus === 'CLOCKED_IN' ? 'Clocked In' : 'Clocked Out'}
                            valueStyle={{ color: currentStatus === 'CLOCKED_IN' ? '#3f8600' : '#cf1322' }}
                        />
                        {lastSession && currentStatus === 'CLOCKED_IN' && (
                            <p className="mt-2 text-gray-500">Since: {new Date(lastSession.clockInTime).toLocaleTimeString()}</p>
                        )}

                        <div className="mt-6">
                            {currentStatus === 'CLOCKED_OUT' ? (
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<ClockCircleOutlined />}
                                    className="bg-green-600 hover:bg-green-700 w-40"
                                    onClick={() => handleClockAction('in')}
                                    loading={loading}
                                >
                                    Clock In
                                </Button>
                            ) : (
                                <Button
                                    danger
                                    type="primary"
                                    size="large"
                                    icon={<ClockCircleOutlined />}
                                    className="w-40"
                                    onClick={() => handleClockAction('out')}
                                    loading={loading}
                                >
                                    Clock Out
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>

                <Card title="Summary" className="shadow-sm">
                    {/* Add summary stats here later if needed */}
                    <Statistic title="Total Shifts" value={history.length} prefix={<ClockCircleOutlined />} />
                </Card>
            </div>

            <Card title="Attendance History" className="shadow-sm">
                <Table
                    dataSource={history}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 5 }}
                />
            </Card>
        </div>
    );
};

export default EmployeeAttendanceView;
