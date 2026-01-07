import React, { useState, useEffect } from 'react';
import { Tabs, Button, Select, Space, message, Spin, DatePicker, Input } from 'antd';
import { PlusOutlined, AppstoreOutlined, UnorderedListOutlined, ReloadOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import TaskStats from './TaskStats';
import KanbanView from './KanbanView';
import TaskTableView from './TaskTableView';

// API Imports (Assuming these exist or I'm using the ones I saw)
import CreateTaskModal from './CreateTaskModal';
import { getEmployeeTasks } from '../../api/getEmployeeTasks';
import { updateTaskStatus } from '../../api/updateTaskStatus';

const { Search } = Input;

const ScheduleRoot = () => {
    const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'table'
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchText, setSearchText] = useState('');
    const [createModalVisible, setCreateModalVisible] = useState(false);

    // Get current user ID (fallback to 2 if not found)
    const userId = localStorage.getItem('userId') || 2;
    const queryClient = useQueryClient();

    // Fetch Tasks
    const { data: tasks = [], isLoading, refetch } = useQuery({
        queryKey: ['employeeTasks', userId],
        queryFn: async () => {
            const data = await getEmployeeTasks(userId);
            // Ensure data is array
            return Array.isArray(data) ? data : (data.content || []);
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Update Status Mutation
    const updateStatusMutation = useMutation({
        mutationFn: async ({ taskId, newStatus }) => {
            return updateTaskStatus(taskId, newStatus);
        },
        onSuccess: () => {
            message.success('Task status updated');
            queryClient.invalidateQueries(['employeeTasks']);
        },
        onError: () => {
            message.error('Failed to update task status');
        }
    });

    const handleStatusChange = (taskId, newStatus) => {
        updateStatusMutation.mutate({ taskId, newStatus });
    };

    // Filter Logic
    const filteredTasks = tasks.filter(task => {
        const matchesStatus = filterStatus === 'ALL' || task.status === filterStatus;
        const matchesSearch = searchText === '' ||
            task.taskName?.toLowerCase().includes(searchText.toLowerCase()) ||
            task.description?.toLowerCase().includes(searchText.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const statusOptions = [
        { label: 'All Status', value: 'ALL' },
        { label: 'To Do', value: 'PENDING' },
        { label: 'In Progress', value: 'IN_PROGRESS' },
        { label: 'Done', value: 'COMPLETED' },
    ];

    return (
        <div className="p-6 h-full flex flex-col bg-slate-50 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 m-0">Schedule & Tasks</h1>
                    <p className="text-slate-500 m-0">Manage your assignments and daily workflow</p>
                </div>
                <div className="flex gap-2">
                    {/* View Switcher */}
                    <div className="bg-white border p-1 rounded-lg flex">
                        <Button
                            type={viewMode === 'kanban' ? 'primary' : 'text'}
                            icon={<AppstoreOutlined />}
                            onClick={() => setViewMode('kanban')}
                            size="small"
                        >
                            Board
                        </Button>
                        <Button
                            type={viewMode === 'table' ? 'primary' : 'text'}
                            icon={<UnorderedListOutlined />}
                            onClick={() => setViewMode('table')}
                            size="small"
                        >
                            List
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <TaskStats tasks={tasks} />

            {/* Filters & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4 bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 flex-1 w-full">
                    <Search
                        placeholder="Search tasks..."
                        allowClear
                        onSearch={val => setSearchText(val)}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 250 }}
                    />
                    <Select
                        value={filterStatus}
                        onChange={setFilterStatus}
                        options={statusOptions}
                        style={{ width: 150 }}
                    />
                </div>
                <div className="flex gap-2">
                    <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>Refresh</Button>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        className="bg-violet-600"
                        onClick={() => setCreateModalVisible(true)}
                    >
                        New Task
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-h-0">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Spin size="large" tip="Loading tasks..." />
                    </div>
                ) : (
                    <>
                        {viewMode === 'kanban' ? (
                            <KanbanView tasks={filteredTasks} onStatusChange={handleStatusChange} />
                        ) : (
                            <TaskTableView tasks={filteredTasks} onStatusChange={handleStatusChange} />
                        )}
                    </>
                )}
            </div>

            <CreateTaskModal
                visible={createModalVisible}
                onClose={() => setCreateModalVisible(false)}
            />
        </div>
    );
};

export default ScheduleRoot;
