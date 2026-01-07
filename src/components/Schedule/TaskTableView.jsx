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
            width: 120,
            render: (status) => {
                let color = 'default';
                if (status === 'COMPLETED') color = 'success';
                if (status === 'IN_PROGRESS') color = 'processing';
                if (status === 'PENDING') color = 'warning';
                if (status === 'OVERDUE') color = 'error';
                return <Tag color={color}>{status}</Tag>;
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
        />
    );
};

export default TaskTableView;
