import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Tooltip, Card, Empty } from 'antd';
import { EditOutlined, CheckCircleOutlined, DeleteOutlined, ClockCircleOutlined, FlagOutlined } from '@ant-design/icons';
import moment from 'moment';

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

// Mobile List View for Tasks
const MobileTaskListView = ({ tasks = [], onStatusChange, onViewDetails }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED':
                return { tag: 'success', label: 'Completed', border: '#52c41a' };
            case 'IN_PROGRESS':
                return { tag: 'processing', label: 'In Progress', border: '#1890ff' };
            case 'PENDING':
                return { tag: 'warning', label: 'To Do', border: '#faad14' };
            case 'OVERDUE':
                return { tag: 'error', label: 'Overdue', border: '#ff4d4f' };
            default:
                return { tag: 'default', label: 'Unknown', border: '#8c8c8c' };
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'HIGH':
                return 'bg-red-100 text-red-700';
            case 'MEDIUM':
                return 'bg-orange-100 text-orange-700';
            default:
                return 'bg-blue-100 text-blue-700';
        }
    };

    return (
        <div className="space-y-3 p-2">
            {tasks.length === 0 ? (
                <Empty description="No tasks" />
            ) : (
                tasks.map(task => {
                    const statusConfig = getStatusColor(task.status);
                    
                    return (
                        <Card
                            key={task.id}
                            size="small"
                            className="shadow-sm cursor-pointer hover:shadow-md transition-all border border-slate-200"
                            style={{ borderLeft: `4px solid ${statusConfig.border}` }}
                            onClick={() => onViewDetails && onViewDetails(task)}
                        >
                            {/* Header: ID & Priority */}
                            <div className="flex items-start justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
                                <span className="text-xs font-bold text-blue-600">
                                    ID: #{task.id}
                                </span>
                                <span className={`text-xs font-bold px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                                    <FlagOutlined className="mr-1" />
                                    {task.priority || 'NORMAL'}
                                </span>
                            </div>

                            {/* Task Content */}
                            <div className="space-y-2 mb-3">
                                {/* Task Name */}
                                <h4 className="font-medium text-slate-800 line-clamp-2">
                                    {task.taskName}
                                </h4>
                                
                                {/* Description */}
                                <p className="text-slate-600 text-xs line-clamp-2">
                                    {task.description || 'No description'}
                                </p>
                            </div>

                            {/* Status & Date Footer */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold px-2 py-1 rounded" style={{ backgroundColor: statusConfig.border + '20', color: statusConfig.border }}>
                                        {statusConfig.label}
                                    </span>
                                </div>
                                <span className="text-xs text-slate-500">
                                    <ClockCircleOutlined className="mr-1" />
                                    {task.dueDate ? moment(task.dueDate).format('MMM DD, YYYY') : 'No Due Date'}
                                </span>
                            </div>

                            {/* Action Button */}
                            <div className="flex justify-end gap-2">
                                {task.status !== 'COMPLETED' && (
                                    <Tooltip title="Mark Complete">
                                        <Button
                                            type="primary"
                                            size="small"
                                            icon={<CheckCircleOutlined />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onStatusChange(task.id, 'COMPLETED');
                                            }}
                                            className="!bg-green-600 border-0"
                                        >
                                            Complete
                                        </Button>
                                    </Tooltip>
                                )}
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<EditOutlined />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onViewDetails && onViewDetails(task);
                                    }}
                                >
                                    Edit
                                </Button>
                            </div>
                        </Card>
                    );
                })
            )}
        </div>
    );
};

// Desktop Table View
const DesktopTaskTableView = ({ tasks = [], onStatusChange, onViewDetails }) => {
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            render: (text) => <span className="text-xs text-slate-500">#{text}</span>
        },
        {
            title: 'Task',
            dataIndex: 'taskName',
            key: 'taskName',
            render: (text, record) => (
                <div>
                    <div className="font-medium text-slate-800">{text}</div>
                    <div className="text-xs text-slate-500 truncate max-w-[200px]">{record.description}</div>
                </div>
            )
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            width: 100,
            render: (priority) => {
                const color = priority === 'HIGH' ? 'red' : priority === 'MEDIUM' ? 'orange' : 'blue';
                return <Tag color={color}>{priority || 'NORMAL'}</Tag>;
            }
        },
        {
            title: 'Due Date',
            dataIndex: 'dueDate',
            key: 'dueDate',
            width: 120,
            render: (date) => date ? new Date(date).toLocaleDateString() : '-'
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 140,
            render: (status) => {
                let colorClass = 'bg-slate-500';
                let textClass = 'text-slate-600';
                let label = status || 'UNKNOWN';
                let pulse = false;

                if (status === 'COMPLETED') {
                    colorClass = 'bg-emerald-500';
                    textClass = 'text-emerald-700';
                    label = 'Completed';
                } else if (status === 'IN_PROGRESS') {
                    colorClass = 'bg-blue-500';
                    textClass = 'text-blue-700';
                    label = 'In Progress';
                    pulse = true;
                } else if (status === 'PENDING') {
                    colorClass = 'bg-amber-500';
                    textClass = 'text-amber-700';
                    label = 'To Do';
                } else if (status === 'OVERDUE') {
                    colorClass = 'bg-red-500';
                    textClass = 'text-red-700';
                    label = 'Overdue';
                }

                return (
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                            {pulse && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colorClass} opacity-75`}></span>}
                            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${colorClass}`}></span>
                        </span>
                        <span className={`text-sm font-medium ${textClass}`}>{label}</span>
                    </div>
                );
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space size="small">
                    {record.status !== 'COMPLETED' && (
                        <Tooltip title="Mark Complete">
                            <Button
                                type="text"
                                size="small"
                                icon={<CheckCircleOutlined className="text-green-600" />}
                                onClick={() => onStatusChange(record.id, 'COMPLETED')}
                            />
                        </Tooltip>
                    )}
                    <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => onViewDetails && onViewDetails(record)}
                    />
                </Space>
            )
        }
    ];

    return (
        <Table
            dataSource={tasks}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            className="shadow-sm border border-slate-200 rounded-lg"
            scroll={{ x: 'max-content' }}
        />
    );
};

// Main Component
const TaskTableView = ({ tasks = [], onStatusChange, onViewDetails }) => {
    const isMobile = useIsMobile();

    if (isMobile) {
        return <MobileTaskListView tasks={tasks} onStatusChange={onStatusChange} onViewDetails={onViewDetails} />;
    }

    return <DesktopTaskTableView tasks={tasks} onStatusChange={onStatusChange} onViewDetails={onViewDetails} />;
};

export default TaskTableView;
