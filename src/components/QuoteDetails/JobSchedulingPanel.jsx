import React, { useState } from 'react';
import { DatePicker, Input, Select, Card, Button, Table, Space, Segmented, Calendar, Badge, Tooltip } from 'antd';
import { DeleteOutlined, PlusOutlined, UnorderedListOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;

const JobSchedulingPanel = ({
    schedulingData,
    setSchedulingData,
    employees = [],
    loadingEmployees = false
}) => {
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'

    // Helper to handle date changes
    const handleDateChange = (field, date) => {
        setSchedulingData(prev => ({
            ...prev,
            [field]: date ? date.toISOString() : null
        }));
    };

    // Helper to handle input/select changes
    const handleChange = (field, value) => {
        setSchedulingData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Helper to convert ISO string to dayjs object for Antd DatePicker
    const getDayjsValue = (isoString) => {
        return isoString ? dayjs(isoString) : null;
    };

    // Task Management
    const addTask = (date = null) => {
        const newTask = {
            id: Math.random().toString(36).substr(2, 9), // Temp frontend ID
            taskDescription: "",
            priority: "MEDIUM",
            employeeId: null,
            dueDate: date ? date.toISOString() : null
        };
        setSchedulingData(prev => ({
            ...prev,
            tasks: [...(prev.tasks || []), newTask]
        }));
        // Switch to list view to edit details if added via calendar (optional UX choice)
        if (viewMode === 'calendar') setViewMode('list');
    };

    const removeTask = (taskId) => {
        setSchedulingData(prev => ({
            ...prev,
            tasks: (prev.tasks || []).filter(t => t.id !== taskId)
        }));
    };

    const updateTask = (taskId, field, value) => {
        setSchedulingData(prev => ({
            ...prev,
            tasks: (prev.tasks || []).map(t =>
                t.id === taskId ? { ...t, [field]: value } : t
            )
        }));
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'URGENT': return 'red';
            case 'HIGH': return 'orange';
            case 'MEDIUM': return 'blue';
            case 'LOW': return 'green';
            default: return 'default';
        }
    };

    // Calendar Renders
    const dateCellRender = (value) => {
        const listData = (schedulingData.tasks || []).filter(task => {
            if (!task.dueDate) return false;
            return dayjs(task.dueDate).isSame(value, 'day');
        });

        return (
            <ul className="events p-0 m-0 list-none">
                {listData.map((item) => (
                    <li key={item.id} className="mb-1">
                        <Tooltip title={`${item.taskDescription} (${item.priority})`}>
                            <Badge
                                status={getPriorityColor(item.priority)}
                                text={<span className="text-xs">{item.taskDescription || "New Task"}</span>}
                            />
                        </Tooltip>
                    </li>
                ))}
            </ul>
        );
    };

    // Handle selecting a date to add a task in calendar view
    const onCalendarSelect = (value, selectInfo) => {
        console.log("Calendar Select:", value?.format('YYYY-MM-DD'), selectInfo);
        if (selectInfo?.source === 'date') {
            // Optional: prompt or just add. For now, let's just log or no-op. 
            // Better UX: Show a modal or switch to list.
            // Let's add a task for this date and switch to list view for editing.

            // addTask(value); 
            // Commented out to avoid accidental creation. Users can use "Add Task" button.
        }
    };


    const taskColumns = [
        {
            title: 'Description',
            dataIndex: 'taskDescription',
            key: 'taskDescription',
            render: (text, record) => (
                <Input
                    value={text}
                    placeholder="Task Description"
                    onChange={(e) => updateTask(record.id, 'taskDescription', e.target.value)}
                />
            )
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            width: 120,
            render: (text, record) => (
                <Select
                    value={text}
                    style={{ width: '100%' }}
                    onChange={(val) => updateTask(record.id, 'priority', val)}
                >
                    <Option value="LOW">Low</Option>
                    <Option value="MEDIUM">Medium</Option>
                    <Option value="HIGH">High</Option>
                    <Option value="URGENT">Urgent</Option>
                </Select>
            )
        },
        {
            title: 'Assignee',
            dataIndex: 'employeeId',
            key: 'employeeId',
            width: 180,
            render: (text, record) => (
                <Select
                    value={text}
                    style={{ width: '100%' }}
                    placeholder="Unassigned"
                    allowClear
                    onChange={(val) => updateTask(record.id, 'employeeId', val)}
                    loading={loadingEmployees}
                >
                    {employees.map(emp => (
                        <Option key={emp.employeeId} value={emp.employeeId}>
                            {emp.firstName} {emp.lastName}
                        </Option>
                    ))}
                </Select>
            )
        },
        {
            title: 'Due Date',
            dataIndex: 'dueDate',
            key: 'dueDate',
            width: 150,
            render: (text, record) => (
                <DatePicker
                    value={getDayjsValue(text)}
                    onChange={(date) => updateTask(record.id, 'dueDate', date ? date.toISOString() : null)}
                    placeholder="Due Date"
                    style={{ width: '100%' }}
                />
            )
        },
        {
            title: '',
            key: 'action',
            width: 50,
            render: (_, record) => (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeTask(record.id)}
                />
            )
        }
    ];

    return (
        <div className="">
            <Card
                title="Job Scheduling & Terms"
                className="shadow-sm"
                extra={
                    <Segmented
                        options={[
                            { label: 'List', value: 'list', icon: <UnorderedListOutlined /> },
                            { label: 'Calendar', value: 'calendar', icon: <CalendarOutlined /> },
                        ]}
                        value={viewMode}
                        onChange={setViewMode}
                    />
                }
            >
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <Space>
                            <label className="block text-sm font-medium text-slate-700">Tasks</label>
                            {viewMode === 'calendar' && <span className="text-xs text-slate-500">(Switch to list to edit)</span>}
                        </Space>
                        <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={() => addTask()}>
                            Add Task
                        </Button>
                    </div>

                    {viewMode === 'list' ? (
                        <Table
                            dataSource={schedulingData.tasks || []}
                            columns={taskColumns}
                            rowKey="id"
                            pagination={false}
                            size="small"
                            bordered
                        />
                    ) : (
                        <div className="border rounded-lg p-2">
                            <Calendar
                                cellRender={dateCellRender}
                                onSelect={onCalendarSelect}
                                fullscreen={false}
                            />
                        </div>
                    )}
                </div>
            </Card >
        </div >
    );
};

export default JobSchedulingPanel;
