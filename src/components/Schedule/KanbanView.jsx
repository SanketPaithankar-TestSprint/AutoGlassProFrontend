import React, { useState, useEffect } from 'react';
import { Card, Tag, Button, Avatar, Empty, message, Spin, Modal } from 'antd';
import { ClockCircleOutlined, UserOutlined, ArrowRightOutlined, EditOutlined, FlagOutlined } from '@ant-design/icons';
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

// Draggable Task Card
const DraggableTaskCard = ({ task, color, onEdit, isLoading }) => {
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'HIGH': return '#ff4d4f';
            case 'MEDIUM': return '#faad14';
            default: return '#1890ff';
        }
    };

    return (
        <div
            draggable="true"
            className={`bg-white border-l-4 rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-move ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}
            style={{ borderLeftColor: color }}
            onDragStart={(e) => {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('task', JSON.stringify(task));
            }}
        >
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/40 rounded-lg z-10">
                    <Spin size="small" />
                </div>
            )}
            
            <div className="flex items-start justify-between gap-2 mb-2">
                <Tag color={getPriorityColor(task.priority)} className="text-xs">
                    <FlagOutlined className="mr-1" />
                    {task.priority || 'NORMAL'}
                </Tag>
            </div>

            <h4 className="font-medium text-slate-800 mb-1 text-sm line-clamp-2">{task.taskName}</h4>
            <p className="text-slate-500 text-xs line-clamp-2 mb-2">{task.description}</p>

            <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">#{task.id}</span>
                <span className="text-slate-500">
                    <ClockCircleOutlined className="mr-1" />
                    {task.dueDate ? moment(task.dueDate).format('MMM DD') : 'No Due'}
                </span>
            </div>
        </div>
    );
};

// Status Column with Drag-Drop
const StatusColumn = ({ title, status, tasks, color, onStatusChange, onEdit, loadingTaskId }) => {
    const filteredTasks = tasks.filter(t => t.status === status);
    const [dragOver, setDragOver] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        
        try {
            const taskData = JSON.parse(e.dataTransfer.getData('task'));
            if (taskData.status !== status) {
                onStatusChange(taskData.id, status);
            }
        } catch (err) {
            console.error('Error parsing task data:', err);
        }
    };

    return (
        <div
            className={`flex-1 min-w-[300px] bg-slate-50 rounded-lg p-4 flex flex-col h-full border-2 transition-all ${
                dragOver ? 'bg-slate-100 shadow-md' : 'border-slate-200'
            }`}
            style={{
                borderColor: dragOver ? color : '#e2e8f0',
                borderWidth: dragOver ? '3px' : '2px'
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className={`flex justify-between items-center mb-4 pb-2 border-b-2`} style={{ borderColor: color }}>
                <h3 className="font-semibold text-slate-700 m-0">{title}</h3>
                <Tag color={color}>{filteredTasks.length}</Tag>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                {filteredTasks.length === 0 ? (
                    <Empty description="No tasks" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                    filteredTasks.map(task => (
                        <div
                            key={task.id}
                            className="flex flex-col gap-2"
                            onClick={() => !loadingTaskId ? (onEdit && onEdit(task)) : null}
                        >
                            <DraggableTaskCard
                                task={task}
                                color={color}
                                onEdit={onEdit}
                                isLoading={loadingTaskId === task.id}
                            />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// Mobile List View for Tasks
const MobileTaskListView = ({ tasks = [], onStatusChange, onEdit }) => {
    const [selectedStatus, setSelectedStatus] = useState('PENDING');
    const [loadingTaskId, setLoadingTaskId] = useState(null);
    
    const filteredTasks = tasks.filter(task => task.status === selectedStatus);
    const statuses = [
        { key: 'PENDING', label: 'To Do', color: '#faad14' },
        { key: 'IN_PROGRESS', label: 'In Progress', color: '#1890ff' },
        { key: 'COMPLETED', label: 'Done', color: '#52c41a' }
    ];

    const handleStatusChange = async (taskId, newStatus) => {
        setLoadingTaskId(taskId);
        try {
            await onStatusChange(taskId, newStatus);
            message.success('Task status updated');
        } catch (err) {
            message.error('Failed to update task status');
        } finally {
            setLoadingTaskId(null);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-280px)]">
            {/* Status Tabs */}
            <div className="flex gap-2 pb-3 border-b border-slate-200 overflow-x-auto">
                {statuses.map(st => (
                    <button
                        key={st.key}
                        onClick={() => setSelectedStatus(st.key)}
                        className={`px-3 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                            selectedStatus === st.key
                                ? 'text-white'
                                : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                        }`}
                        style={selectedStatus === st.key ? { backgroundColor: st.color } : {}}
                    >
                        {st.label} ({tasks.filter(t => t.status === st.key).length})
                    </button>
                ))}
            </div>

            {/* Tasks List */}
            <div className="flex-1 overflow-y-auto space-y-3 mt-3 px-2">
                {filteredTasks.length === 0 ? (
                    <Empty description="No tasks" />
                ) : (
                    filteredTasks.map(task => {
                        const statusConfig = statuses.find(s => s.key === selectedStatus);
                        const getPriorityColor = (priority) => {
                            switch (priority) {
                                case 'HIGH': return 'bg-red-100 text-red-700';
                                case 'MEDIUM': return 'bg-orange-100 text-orange-700';
                                default: return 'bg-blue-100 text-blue-700';
                            }
                        };

                        return (
                            <Card
                                key={task.id}
                                size="small"
                                className="shadow-sm cursor-pointer hover:shadow-md transition-all border border-slate-200"
                                style={{ borderLeft: `4px solid ${statusConfig.color}` }}
                                onClick={() => !loadingTaskId && (onEdit && onEdit(task))}
                            >
                                {loadingTaskId === task.id && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-lg z-10">
                                        <Spin size="small" />
                                    </div>
                                )}

                                {/* Header */}
                                <div className="mb-3 pb-2 border-b border-slate-100">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className={`text-xs font-bold px-2 py-1 rounded ${getPriorityColor(task.priority)}`}>
                                            <FlagOutlined className="mr-1" />
                                            {task.priority || 'NORMAL'}
                                        </span>
                                        <span className="text-xs text-slate-400">ID: #{task.id}</span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="space-y-2 text-sm mb-3">
                                    <h4 className="font-medium text-slate-800 line-clamp-2">{task.taskName}</h4>
                                    <p className="text-slate-600 text-xs line-clamp-2">{task.description}</p>
                                </div>

                                {/* Footer with Actions */}
                                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                    <span className="text-xs text-slate-500">
                                        <ClockCircleOutlined className="mr-1" />
                                        {task.dueDate ? moment(task.dueDate).format('MMM DD, YYYY') : 'No Due Date'}
                                    </span>
                                    {selectedStatus !== 'COMPLETED' && (
                                        <Button
                                            type="text"
                                            size="small"
                                            icon={<ArrowRightOutlined />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const nextStatus = selectedStatus === 'PENDING' ? 'IN_PROGRESS' : 'COMPLETED';
                                                handleStatusChange(task.id, nextStatus);
                                            }}
                                            title="Advance Status"
                                        />
                                    )}
                                </div>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
};

// Main Kanban View
const KanbanView = ({ tasks = [], onStatusChange, onEdit }) => {
    const isMobile = useIsMobile();
    const [loadingTaskId, setLoadingTaskId] = useState(null);

    const handleStatusChangeWithLoading = async (taskId, newStatus) => {
        setLoadingTaskId(taskId);
        try {
            await onStatusChange(taskId, newStatus);
        } finally {
            setLoadingTaskId(null);
        }
    };

    // Mobile view
    if (isMobile) {
        return (
            <MobileTaskListView
                tasks={tasks}
                onStatusChange={onStatusChange}
                onEdit={onEdit}
            />
        );
    }

    // Desktop Kanban view
    return (
        <div className="flex gap-4 overflow-x-auto h-[calc(100vh-280px)] pb-2">
            <StatusColumn
                title="To Do"
                status="PENDING"
                tasks={tasks}
                color="#faad14"
                onStatusChange={handleStatusChangeWithLoading}
                onEdit={onEdit}
                loadingTaskId={loadingTaskId}
            />
            <StatusColumn
                title="In Progress"
                status="IN_PROGRESS"
                tasks={tasks}
                color="#1890ff"
                onStatusChange={handleStatusChangeWithLoading}
                onEdit={onEdit}
                loadingTaskId={loadingTaskId}
            />
            <StatusColumn
                title="Done"
                status="COMPLETED"
                tasks={tasks}
                color="#52c41a"
                onStatusChange={handleStatusChangeWithLoading}
                onEdit={onEdit}
                loadingTaskId={loadingTaskId}
            />
        </div>
    );
};

export default KanbanView;
