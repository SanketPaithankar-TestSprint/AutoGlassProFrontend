import React, { useState, useMemo } from 'react';
import { Tabs, Button, Select, Space, message, Spin, DatePicker, Input, Switch, notification } from 'antd';
import { PlusOutlined, AppstoreOutlined, UnorderedListOutlined, ReloadOutlined, CalendarOutlined, FileTextOutlined, TeamOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import moment from 'moment';
import dayjs from 'dayjs';
import { playNotificationSound } from '../../utils/playNotificationSound';
import TaskStats from './TaskStats';
import KanbanView from './KanbanView';
import TaskTableView from './TaskTableView';
import CalendarView from './CalendarView';
import DocumentScheduleView from './DocumentScheduleView';

// API Imports
import CreateTaskModal from './CreateTaskModal';
import { getEmployeeTasks } from '../../api/getEmployeeTasks';
import { getShopTasks } from '../../api/getShopTasks';
import { updateTaskStatus } from '../../api/updateTaskStatus';
import { getServiceDocumentSchedule } from '../../api/getServiceDocumentSchedule';
import { getCompositeServiceDocument } from '../../api/getCompositeServiceDocument';
import { useNavigate } from 'react-router-dom';

const { Search } = Input;

const ScheduleRoot = () => {
    // Main Tab State
    const [activeTab, setActiveTab] = useState('schedule'); // 'schedule' or 'tasks'

    // View Mode (shared between tabs)
    const [viewMode, setViewMode] = useState('calendar'); // 'kanban', 'table', or 'calendar'

    // Tasks Tab State
    const [taskScope, setTaskScope] = useState('mine'); // 'mine' or 'shop'
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchText, setSearchText] = useState('');
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    // Schedule Tab Filter State
    const [scheduleDays, setScheduleDays] = useState(30);
    const [scheduleStartDate, setScheduleStartDate] = useState(dayjs());
    const [scheduleIncludePast, setScheduleIncludePast] = useState(false);
    const [scheduleSearchText, setScheduleSearchText] = useState('');

    // Get current user ID (fallback to 2 if not found)
    const userId = localStorage.getItem('userId') || 2;
    const queryClient = useQueryClient();

    // ===== Schedule Documents Query =====
    const {
        data: scheduledDocuments = [],
        isLoading: isLoadingSchedule,
        refetch: refetchSchedule
    } = useQuery({
        queryKey: ['scheduleDocuments', scheduleDays, scheduleStartDate?.format('YYYY-MM-DD'), scheduleIncludePast],
        queryFn: async () => {
            const data = await getServiceDocumentSchedule({
                days: scheduleDays,
                startDate: scheduleStartDate?.format('YYYY-MM-DD'),
                includePast: scheduleIncludePast
            });
            return Array.isArray(data) ? data : (data.content || []);
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 10, // 10 minutes
        enabled: activeTab === 'schedule'
    });

    // ===== Tasks Query =====
    const { data: tasks = [], isLoading: isLoadingTasks, refetch: refetchTasks } = useQuery({
        queryKey: ['tasks', userId, taskScope],
        queryFn: async () => {
            let data;
            if (taskScope === 'shop') {
                data = await getShopTasks();
            } else {
                data = await getEmployeeTasks(userId);
            }
            return Array.isArray(data) ? data : (data.content || []);
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: activeTab === 'tasks'
    });

    // Update Status Mutation
    const updateStatusMutation = useMutation({
        mutationFn: async ({ taskId, newStatus }) => {
            return updateTaskStatus(taskId, newStatus);
        },
        onSuccess: () => {
            message.success('Task status updated');
            queryClient.invalidateQueries(['tasks']);
        },
        onError: () => {
            message.error('Failed to update task status');
        }
    });

    const handleStatusChange = (taskId, newStatus) => {
        updateStatusMutation.mutate({ taskId, newStatus });
    };

    const handleEditTask = (task) => {
        setSelectedTask(task);
        setCreateModalVisible(true);
    };

    const handleCloseModal = () => {
        setCreateModalVisible(false);
        setSelectedTask(null);
    };

    // Filter Logic for Tasks
    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const matchesStatus = filterStatus === 'ALL' || task.status === filterStatus;
            const matchesSearch = searchText === '' ||
                task.taskName?.toLowerCase().includes(searchText.toLowerCase()) ||
                task.description?.toLowerCase().includes(searchText.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [tasks, filterStatus, searchText]);

    // Filter Logic for Schedule Documents
    const filteredDocuments = useMemo(() => {
        return scheduledDocuments.filter(doc => {
            const matchesSearch = scheduleSearchText === '' ||
                doc.documentNumber?.toLowerCase().includes(scheduleSearchText.toLowerCase()) ||
                doc.customer?.name?.toLowerCase().includes(scheduleSearchText.toLowerCase());
            return matchesSearch;
        });
    }, [scheduledDocuments, scheduleSearchText]);

    const statusOptions = [
        { label: 'All Status', value: 'ALL' },
        { label: 'To Do', value: 'PENDING' },
        { label: 'In Progress', value: 'IN_PROGRESS' },
        { label: 'Done', value: 'COMPLETED' },
    ];

    const daysOptions = [
        { label: '7 Days', value: 7 },
        { label: '14 Days', value: 14 },
        { label: '30 Days', value: 30 },
        { label: '60 Days', value: 60 },
        { label: '90 Days', value: 90 },
    ];

    const isLoading = activeTab === 'schedule' ? isLoadingSchedule : isLoadingTasks;

    // ===== Notifications Logic =====
    React.useEffect(() => {
        if (isLoadingSchedule || !scheduledDocuments?.length) return;

        const checkNotifications = () => {
            const lastNotify = localStorage.getItem('lastScheduleNotify');
            const todayStr = dayjs().format('YYYY-MM-DD');

            // Prevent spamming on refresh (notify once per day)
            if (lastNotify === todayStr) {
                return;
            }

            const today = dayjs();
            const threeDaysLater = today.add(3, 'day');

            // Filter Today's Tasks
            const todayDocs = scheduledDocuments.filter(doc =>
                doc.scheduledDate && dayjs(doc.scheduledDate).isSame(today, 'day')
            );

            // Filter Upcoming Tasks (Next 3 days)
            const upcomingDocs = scheduledDocuments.filter(doc => {
                if (!doc.scheduledDate) return false;
                const d = dayjs(doc.scheduledDate);
                return d.isAfter(today, 'day') && d.isBefore(threeDaysLater, 'day');
            });

            if (todayDocs.length > 0 || upcomingDocs.length > 0) {
                playNotificationSound();
            }

            // Notify for Today (Each task)
            todayDocs.forEach(doc => {
                notification.info({
                    message: `Scheduled for Today: ${doc.documentNumber}`,
                    description: `${doc.customer?.name || 'Customer'} - ${doc.vehicle?.year || ''} ${doc.vehicle?.make || ''} ${doc.vehicle?.model || ''}`,
                    placement: 'topRight',
                    duration: 0, // Persistent so they don't miss it
                });
            });

            // Notify for Upcoming (Summary)
            if (upcomingDocs.length > 0) {
                notification.warning({
                    message: 'Upcoming Schedule',
                    description: `You have ${upcomingDocs.length} upcoming jobs in the next 72 hours.`,
                    placement: 'topRight',
                    duration: 6, // Auto dismiss summary
                });
            }

            // Update persistence
            localStorage.setItem('lastScheduleNotify', todayStr);
        };

        checkNotifications();

    }, [scheduledDocuments, isLoadingSchedule]);

    // ===== Navigation Logic =====
    const navigate = useNavigate();

    const handleDocumentClick = async (documentNumber) => {
        if (!documentNumber) return;

        message.loading({ content: 'Loading document details...', key: 'navLoading' });
        try {
            const compositeData = await getCompositeServiceDocument(documentNumber);
            message.success({ content: 'Loaded!', key: 'navLoading', duration: 1 });
            navigate('/search-by-root', { state: { compositeData } });
        } catch (error) {
            console.error("Error fetching composite document:", error);
            message.error({ content: 'Failed to load document details', key: 'navLoading' });
        }
    };

    const tabItems = [
        {
            key: 'schedule',
            label: (
                <span className="flex items-center gap-2">
                    <CalendarOutlined />
                    Schedule
                </span>
            ),
        },
        {
            key: 'tasks',
            label: (
                <span className="flex items-center gap-2">
                    <TeamOutlined />
                    Tasks
                </span>
            ),
        },
    ];

    return (
        <div className="p-6 h-full flex flex-col bg-slate-50 overflow-y-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 m-0">Schedule & Tasks</h1>
                    <p className="text-slate-500 m-0">Manage your appointments and daily workflow</p>
                </div>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    {/* View Switcher */}
                    <div className="bg-white border p-1 rounded-lg flex">
                        <Button
                            type={viewMode === 'calendar' ? 'primary' : 'text'}
                            icon={<span className="material-icons-outlined text-sm"></span>}
                            onClick={() => setViewMode('calendar')}
                            size="small"
                        >
                            Calendar
                        </Button>
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

            {/* Tabs */}
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
                className="mb-4"
            />

            {/* Tab-specific Content */}
            {activeTab === 'schedule' ? (
                <>
                    {/* Schedule Filters */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4 bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                        <div className="flex flex-col md:flex-row items-center gap-3 flex-1 w-full">
                            <Search
                                placeholder="Search documents..."
                                allowClear
                                onSearch={val => setScheduleSearchText(val)}
                                onChange={e => setScheduleSearchText(e.target.value)}
                                className="w-full md:w-[250px]"
                            />
                            <Select
                                value={scheduleDays}
                                onChange={setScheduleDays}
                                options={daysOptions}
                                className="w-full md:w-[120px]"
                                placeholder="Days"
                            />
                            <DatePicker
                                value={scheduleStartDate}
                                onChange={setScheduleStartDate}
                                className="w-full md:w-[150px]"
                                placeholder="Start Date"
                                allowClear={false}
                            />
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-600">Include Past:</span>
                                <Switch
                                    checked={scheduleIncludePast}
                                    onChange={setScheduleIncludePast}
                                    size="small"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto justify-end">
                            <Button
                                icon={<ReloadOutlined />}
                                onClick={() => refetchSchedule()}
                                loading={isLoadingSchedule}
                            >
                                Refresh
                            </Button>
                        </div>
                    </div>

                    {/* Schedule Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-slate-200/60">
                            <div className="text-2xl font-bold text-violet-600">{filteredDocuments.length}</div>
                            <div className="text-sm text-slate-500 font-medium">Total Scheduled</div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-slate-200/60">
                            <div className="text-2xl font-bold text-amber-500">
                                {filteredDocuments.filter(d => d.status === 'QUOTE').length}
                            </div>
                            <div className="text-sm text-slate-500 font-medium">Quotes</div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-slate-200/60">
                            <div className="text-2xl font-bold text-orange-500">
                                {filteredDocuments.filter(d => d.status === 'WORK_ORDER').length}
                            </div>
                            <div className="text-sm text-slate-500 font-medium">Work Orders</div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-slate-200/60">
                            <div className="text-2xl font-bold text-emerald-500">
                                {filteredDocuments.filter(d => d.status === 'INVOICE').length}
                            </div>
                            <div className="text-sm text-slate-500 font-medium">Invoices</div>
                        </div>
                    </div>

                    {/* Schedule Content */}
                    <div className="flex-1 min-h-0">
                        {isLoadingSchedule ? (
                            <div className="flex justify-center items-center h-64">
                                <Spin size="large" tip="Loading schedule..." />
                            </div>
                        ) : (
                            <DocumentScheduleView
                                documents={filteredDocuments}
                                viewMode={viewMode}
                                onDocumentClick={handleDocumentClick}
                            />
                        )}
                    </div>
                </>
            ) : (
                <>
                    {/* Tasks Scope Switcher */}
                    <div className="flex mb-4">
                        <div className="bg-white border p-1 rounded-lg flex">
                            <Button
                                type={taskScope === 'mine' ? 'primary' : 'text'}
                                onClick={() => setTaskScope('mine')}
                                size="small"
                            >
                                My Tasks
                            </Button>
                            <Button
                                type={taskScope === 'shop' ? 'primary' : 'text'}
                                onClick={() => setTaskScope('shop')}
                                size="small"
                            >
                                Shop Tasks
                            </Button>
                        </div>
                    </div>

                    {/* Tasks Stats */}
                    <TaskStats tasks={tasks} />

                    {/* Tasks Filters & Actions */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4 bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                        <div className="flex flex-col md:flex-row items-center gap-3 flex-1 w-full">
                            <Search
                                placeholder="Search tasks..."
                                allowClear
                                onSearch={val => setSearchText(val)}
                                onChange={e => setSearchText(e.target.value)}
                                className="w-full md:w-[250px]"
                            />
                            <Select
                                value={filterStatus}
                                onChange={setFilterStatus}
                                options={statusOptions}
                                className="w-full md:w-[150px]"
                            />
                        </div>
                        <div className="flex gap-2 w-full md:w-auto justify-end">
                            <Button icon={<ReloadOutlined />} onClick={() => refetchTasks()} loading={isLoadingTasks}>Refresh</Button>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                className="bg-gradient-to-r from-violet-600 to-indigo-600 border-0 hover:from-violet-500 hover:to-indigo-500 shadow-md"
                                onClick={() => setCreateModalVisible(true)}
                            >
                                New Task
                            </Button>
                        </div>
                    </div>

                    {/* Tasks Content */}
                    <div className="flex-1 min-h-0">
                        {isLoadingTasks ? (
                            <div className="flex justify-center items-center h-64">
                                <Spin size="large" tip="Loading tasks..." />
                            </div>
                        ) : (
                            <>
                                {viewMode === 'kanban' ? (
                                    <KanbanView
                                        tasks={filteredTasks}
                                        onStatusChange={handleStatusChange}
                                        onEdit={handleEditTask}
                                    />
                                ) : viewMode === 'calendar' ? (
                                    <CalendarView
                                        tasks={filteredTasks}
                                        onEdit={handleEditTask}
                                    />
                                ) : (
                                    <TaskTableView
                                        tasks={filteredTasks}
                                        onStatusChange={handleStatusChange}
                                        onViewDetails={handleEditTask}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </>
            )}

            <CreateTaskModal
                visible={createModalVisible}
                onClose={handleCloseModal}
                task={selectedTask}
            />
        </div>
    );
};

export default ScheduleRoot;
