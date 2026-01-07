import React from 'react';
import { Card, Tag, Button, Dropdown, Avatar, Empty } from 'antd';
import { MoreOutlined, ClockCircleOutlined, UserOutlined, ArrowRightOutlined } from '@ant-design/icons';

const StatusColumn = ({ title, status, tasks, color, onStatusChange }) => {
    const filteredTasks = tasks.filter(t => t.status === status);

    return (
        <div className="flex-1 min-w-[300px] bg-slate-50 rounded-lg p-4 flex flex-col h-full border border-slate-200">
            <div className={`flex justify-between items-center mb-4 pb-2 border-b-2`} style={{ borderColor: color }}>
                <h3 className="font-semibold text-slate-700 m-0">{title}</h3>
                <Tag color={color}>{filteredTasks.length}</Tag>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                {filteredTasks.length === 0 ? (
                    <Empty description="No tasks" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                    filteredTasks.map(task => (
                        <Card
                            key={task.id}
                            size="small"
                            bordered={false}
                            className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                            actions={[
                                <div className="text-xs text-slate-400 px-4 text-left">
                                    <ClockCircleOutlined className="mr-1" />
                                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No Due Date'}
                                </div>
                            ]}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <Tag color={task.priority === 'HIGH' ? 'red' : task.priority === 'MEDIUM' ? 'orange' : 'blue'}>
                                    {task.priority || 'NORMAL'}
                                </Tag>
                                {status !== 'COMPLETED' && (
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<ArrowRightOutlined />}
                                        onClick={() => onStatusChange(task.id, status === 'PENDING' ? 'IN_PROGRESS' : 'COMPLETED')}
                                        title="Advance Status"
                                    />
                                )}
                            </div>
                            <h4 className="font-medium text-slate-800 mb-1">{task.taskName}</h4>
                            <p className="text-slate-500 text-sm line-clamp-2 mb-3">{task.description}</p>

                            <div className="flex items-center justify-between mt-2">
                                <div className="flex -space-x-2">
                                    {/* Placeholder for assignees if multiple */}
                                    {/* <Avatar size="small" icon={<UserOutlined />} className="bg-slate-300" /> */}
                                </div>
                                <span className="text-xs text-slate-400">ID: #{task.id}</span>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

const KanbanView = ({ tasks = [], onStatusChange }) => {
    return (
        <div className="flex gap-4 overflow-x-auto h-[calc(100vh-280px)] pb-2">
            <StatusColumn
                title="To Do"
                status="PENDING"
                tasks={tasks}
                color="#faad14"
                onStatusChange={onStatusChange}
            />
            <StatusColumn
                title="In Progress"
                status="IN_PROGRESS"
                tasks={tasks}
                color="#1890ff"
                onStatusChange={onStatusChange}
            />
            <StatusColumn
                title="Done"
                status="COMPLETED"
                tasks={tasks}
                color="#52c41a"
                onStatusChange={onStatusChange}
            />
        </div>
    );
};

export default KanbanView;
