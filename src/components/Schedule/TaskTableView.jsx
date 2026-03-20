import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
    const getStatusColor = (status) => {
        switch (status) {
            case 'COMPLETED':
                return { tag: 'success', label: t('schedule.completed'), border: '#52c41a' };
            case 'IN_PROGRESS':
                return { tag: 'processing', label: t('schedule.inProgress'), border: '#1890ff' };
            case 'PENDING':
                return { tag: 'warning', label: t('schedule.todo'), border: '#faad14' };
            case 'OVERDUE':
                return { tag: 'error', label: t('schedule.overdue'), border: '#ff4d4f' };
            default:
                return { tag: 'default', label: t('schedule.unknown'), border: '#8c8c8c' };
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
                <Empty description={t('schedule.noTasks')} />
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
                                    {task.priority || t('schedule.normal')}
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
                                    {task.description || t('schedule.noDescription')}
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
                                    {task.dueDate ? moment(task.dueDate).format('MMM DD, YYYY') : t('schedule.noDueDate')}
                                </span>
                            </div>

                            {/* Action Button */}
                            <div className="flex justify-end gap-2">
                                {task.status !== 'COMPLETED' && (
                                    <Tooltip title={t('schedule.markComplete')}>
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
                                            {t('schedule.complete')}
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
                                    {t('schedule.edit')}
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
    const { t } = useTranslation();
    const columns = [
        {
            title: t('schedule.id'),
            dataIndex: 'id',
            key: 'id',
            width: 80,
            render: (text) => <span className="text-xs text-slate-500">#{text}</span>
        },
        {
            title: t('schedule.tasksTab'),
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
            title: t('schedule.priority'),
            dataIndex: 'priority',
            key: 'priority',
            width: 100,
            render: (priority) => {
                const color = priority === 'HIGH' ? 'red' : priority === 'MEDIUM' ? 'orange' : 'blue';
                return <Tag color={color}>{priority || t('schedule.normal')}</Tag>;
            }
        },
        {
            title: t('schedule.dueDate'),
            dataIndex: 'dueDate',
            key: 'dueDate',
            width: 120,
            render: (date) => date ? new Date(date).toLocaleDateString() : '-'
        },
        {
            title: t('schedule.status'),
            dataIndex: 'status',
            key: 'status',
            width: 140,
            render: (status) => {
                let colorClass = 'bg-slate-500';
                let textClass = 'text-slate-600';
                let label = status || t('schedule.unknown');
                let pulse = false;

                if (status === 'COMPLETED') {
                    colorClass = 'bg-emerald-500';
                    textClass = 'text-emerald-700';
                    label = t('schedule.completed');
                } else if (status === 'IN_PROGRESS') {
                    colorClass = 'bg-blue-500';
                    textClass = 'text-blue-700';
                    label = t('schedule.inProgress');
                    pulse = true;
                } else if (status === 'PENDING') {
                    colorClass = 'bg-amber-500';
                    textClass = 'text-amber-700';
                    label = t('schedule.todo');
                } else if (status === 'OVERDUE') {
                    colorClass = 'bg-red-500';
                    textClass = 'text-red-700';
                    label = t('schedule.overdue');
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
            title: t('schedule.actions'),
            key: 'actions',
            width: 150,
            render: (_, record) => (
                <Space size="small">
                    {record.status !== 'COMPLETED' && (
                        <Tooltip title={t('schedule.markComplete')}>
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
