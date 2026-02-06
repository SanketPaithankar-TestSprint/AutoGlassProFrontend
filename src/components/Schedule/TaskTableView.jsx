import React from 'react';
import { Table, Tag, Button, Space, Tooltip } from 'antd';
import { EditOutlined, CheckCircleOutlined, DeleteOutlined } from '@ant-design/icons';

const TaskTableView = ({ tasks = [], onStatusChange, onViewDetails }) => {

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

export default TaskTableView;
