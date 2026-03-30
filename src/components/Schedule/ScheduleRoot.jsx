import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, Button, Select, Space, message, Spin, DatePicker, Input, Switch, notification, Tooltip } from 'antd';
import { PlusOutlined, AppstoreOutlined, UnorderedListOutlined, ReloadOutlined, CalendarOutlined, FileTextOutlined, TeamOutlined, ToolOutlined, CreditCardOutlined, InfoCircleOutlined } from '@ant-design/icons';
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
import { getProfile } from '../../api/getProfile';
import { getValidToken } from '../../api/getValidToken';
import { useNavigate } from 'react-router-dom';

const { Search } = Input;

const ScheduleRoot = () => {
    const { t } = useTranslation();
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

    // ===== Profile / Role Query =====
    const { data: userProfile } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const token = await getValidToken();
            if (!token) return null;
            return await getProfile(token);
        },
        staleTime: 1000 * 60 * 30, // 30 min
    });

    const isAdmin = userProfile?.role === 'SHOP_OWNER';

    // Auto-set task scope based on role (ADMIN sees shop tasks, employees see their own)
    React.useEffect(() => {
        if (!userProfile) return;
        setTaskScope(isAdmin ? 'shop' : 'mine');
    }, [isAdmin, userProfile]);

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
            message.success(t('schedule.updatedSuccessfully'));
            queryClient.invalidateQueries(['tasks']);
        },
        onError: () => {
            message.error(t('schedule.failedUpdateStatus'));
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
        { label: t('schedule.allStatus'), value: 'ALL' },
        { label: t('schedule.todo'), value: 'PENDING' },
        { label: t('schedule.inProgress'), value: 'IN_PROGRESS' },
        { label: t('schedule.completed'), value: 'COMPLETED' },
    ];

    const daysOptions = [
        { label: t('schedule.sevenDays'), value: 7 },
        { label: t('schedule.fourteenDays'), value: 14 },
        { label: t('schedule.thirtyDays'), value: 30 },
        { label: t('schedule.sixtyDays'), value: 60 },
        { label: t('schedule.ninetyDays'), value: 90 },
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
                    message: `${t('schedule.scheduledForToday')}: ${doc.documentNumber}`,
                    description: `${doc.customer?.name || t('schedule.unknownCustomer')} - ${doc.vehicle?.year || ''} ${doc.vehicle?.make || ''} ${doc.vehicle?.model || ''}`,
                    placement: 'topRight',
                    duration: 0, // Persistent so they don't miss it
                });
            });

            // Notify for Upcoming (Summary)
            if (upcomingDocs.length > 0) {
                notification.warning({
                    message: t('schedule.upcomingSchedule'),
                    description: t('schedule.upcomingJobsDescription', { count: upcomingDocs.length }),
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

        message.loading({ content: t('schedule.loadingDetails'), key: 'navLoading' });
        try {
            const compositeData = await getCompositeServiceDocument(documentNumber);
            message.success({ content: t('schedule.loaded'), key: 'navLoading', duration: 1 });
            navigate('/quote', { state: { compositeData } });
        } catch (error) {
            console.error("Error fetching composite document:", error);
            message.error({ content: t('schedule.failedUpdate'), key: 'navLoading' });
        }
    };

    const tabItems = [
        {
            key: 'schedule',
            label: (
                <span className="flex items-center gap-2">
                    <CalendarOutlined />
                    {t('schedule.title')}
                </span>
            ),
        },
        {
            key: 'tasks',
            label: (
                <span className="flex items-center gap-2">
                    <TeamOutlined />
                    {t('schedule.tasksTab')}
                </span>
            ),
        },
    ];

    return (
        <div className="p-6 h-full flex flex-col bg-slate-50 overflow-y-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                    <h1 className="!text-[30px] font-bold text-slate-900 m-0">{t('schedule.title')}</h1>
                    <Tooltip title={t('schedule.titleTooltip')} placement="right">
                        <InfoCircleOutlined className="text-slate-400 text-base cursor-pointer hover:text-violet-500 transition-colors" />
                    </Tooltip>
                </div>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    {/* View Switcher */}
                    <div className="bg-white border p-1 rounded-lg flex">
                        <Button
                            type={viewMode === 'calendar' ? 'primary' : 'text'}
                            icon={<CalendarOutlined />}
                            onClick={() => setViewMode('calendar')}
                            size="small"
                        >
                            {t('schedule.calendar')}
                        </Button>
                        <Button
                            type={viewMode === 'table' ? 'primary' : 'text'}
                            icon={<UnorderedListOutlined />}
                            onClick={() => setViewMode('table')}
                            size="small"
                        >
                            {t('schedule.list')}
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
                    {/* Schedule Filters — responsive: 1 row desktop, 2 rows mobile */}
                    <div className="mb-4 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-100">
                        <div className="flex flex-col md:flex-row md:flex-nowrap md:items-center gap-2 md:gap-3">
                            {/* Row 1 (mobile) / start (desktop): Search */}
                            <Search
                                placeholder={t('schedule.searchDocuments')}
                                allowClear
                                onSearch={val => setScheduleSearchText(val)}
                                onChange={e => setScheduleSearchText(e.target.value)}
                                className="w-full"
                                style={{ maxWidth: 360 }}
                                size="small"
                            />
                            {/* Row 2 (mobile) / rest (desktop) */}
                            <div className="flex items-center gap-2 overflow-x-auto flex-nowrap">
                                <Select
                                    value={scheduleDays}
                                    onChange={setScheduleDays}
                                    options={daysOptions}
                                    style={{ width: 95, flexShrink: 0 }}
                                    placeholder={t('schedule.days')}
                                    size="small"
                                />
                                <DatePicker
                                    value={scheduleStartDate}
                                    onChange={setScheduleStartDate}
                                    style={{ width: 105, flexShrink: 0 }}
                                    placeholder={t('schedule.date')}
                                    allowClear={false}
                                    size="small"
                                />
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <span className="hidden md:inline text-xs text-slate-500 whitespace-nowrap">{t('schedule.includePast')}</span>
                                    {/* Mobile only: styled switch with PAST label inside */}
                                    <div className="md:hidden">
                                        <Switch
                                            checked={scheduleIncludePast}
                                            onChange={setScheduleIncludePast}
                                            size="small"
                                            checkedChildren={<span className="text-[10px] font-bold">{t('schedule.past')}</span>}
                                            unCheckedChildren={<span className="text-[10px] font-bold">{t('schedule.past')}</span>}
                                        />
                                    </div>
                                    {/* Desktop only: plain normal toggle */}
                                    <div className="hidden md:block">
                                        <Switch
                                            checked={scheduleIncludePast}
                                            onChange={setScheduleIncludePast}
                                            size="small"
                                        />
                                    </div>
                                </div>
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={() => refetchSchedule()}
                                    loading={isLoadingSchedule}
                                    size="small"
                                    style={{ flexShrink: 0 }}
                                    title={t('schedule.refresh')}
                                >
                                    <span className="hidden md:inline">{t('schedule.refresh')}</span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Schedule Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-slate-200/60">
                            <div className="flex items-center justify-between mb-2">
                                <CalendarOutlined className="text-3xl text-violet-400" />
                                <div className="text-2xl font-bold text-violet-600">{filteredDocuments.length}</div>
                            </div>
                            <div className="text-sm text-slate-500 font-medium">{t('schedule.totalScheduled')}</div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-slate-200/60">
                            <div className="flex items-center justify-between mb-2">
                                <FileTextOutlined className="text-3xl text-amber-400" />
                                <div className="text-2xl font-bold text-amber-500">
                                    {filteredDocuments.filter(d => d.documentType === 'QUOTE').length}
                                </div>
                            </div>
                            <div className="text-sm text-slate-500 font-medium">{t('schedule.quotes')}</div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-slate-200/60">
                            <div className="flex items-center justify-between mb-2">
                                <ToolOutlined className="text-3xl text-orange-400" />
                                <div className="text-2xl font-bold text-orange-500">
                                    {filteredDocuments.filter(d => d.documentType === 'WORK_ORDER').length}
                                </div>
                            </div>
                            <div className="text-sm text-slate-500 font-medium">{t('schedule.workOrders')}</div>
                        </div>
                        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-slate-200/60">
                            <div className="flex items-center justify-between mb-2">
                                <CreditCardOutlined className="text-3xl text-emerald-400" />
                                <div className="text-2xl font-bold text-emerald-500">
                                    {filteredDocuments.filter(d => d.documentType === 'INVOICE').length}
                                </div>
                            </div>
                            <div className="text-sm text-slate-500 font-medium">{t('schedule.invoices')}</div>
                        </div>
                    </div>

                    {/* Schedule Content */}
                    <div className="flex-1 min-h-0">
                        {isLoadingSchedule ? (
                            <div className="flex justify-center items-center h-64">
                                <Spin size="large" tip={t('schedule.loadingSchedule')} />
                            </div>
                        ) : (
                            <DocumentScheduleView
                                documents={filteredDocuments}
                                viewMode={viewMode}
                                onDocumentClick={handleDocumentClick}
                                onConversionSuccess={async () => {
                                    // Small delay to ensure DB has updated
                                    await new Promise(resolve => setTimeout(resolve, 500));
                                    // Refetch the document list from server
                                    await refetchSchedule();
                                }}
                            />
                        )}
                    </div>
                </>
            ) : (
                <>
                    {/* Tasks Filters — responsive: 1 row desktop, 2 rows mobile */}
                    <div className="mb-4 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-100">
                        <div className="flex flex-col md:flex-row md:flex-nowrap md:items-center gap-2 md:gap-3">
                            {/* Row 1 (mobile): Search */}
                            <Search
                                placeholder={t('schedule.searchTasks')}
                                allowClear
                                onSearch={val => setSearchText(val)}
                                onChange={e => setSearchText(e.target.value)}
                                className="w-full"
                                style={{ maxWidth: 360 }}
                                size="small"
                            />
                            {/* Row 2 (mobile): New Task first, then Status + Refresh */}
                            <div className="flex items-center gap-2 overflow-x-auto flex-nowrap">
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    size="small"
                                    style={{ flexShrink: 0 }}
                                    className="bg-gradient-to-r from-violet-600 to-indigo-600 border-0 hover:from-violet-500 hover:to-indigo-500 shadow-md"
                                    onClick={() => setCreateModalVisible(true)}
                                >
                                    {t('schedule.createTask')}
                                </Button>
                                <Select
                                    value={filterStatus}
                                    onChange={setFilterStatus}
                                    options={statusOptions}
                                    style={{ width: 130, flexShrink: 0 }}
                                    size="small"
                                />
                                <Button icon={<ReloadOutlined />} onClick={() => refetchTasks()} loading={isLoadingTasks} size="small" style={{ flexShrink: 0 }} title={t('schedule.refresh')}>
                                    <span className="hidden md:inline">{t('schedule.refresh')}</span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Tasks Stats */}
                    <TaskStats tasks={tasks} />

                    {/* Tasks Content */}
                    <div className="flex-1 min-h-0">
                        {isLoadingTasks ? (
                            <div className="flex justify-center items-center h-64">
                                <Spin size="large" tip={t('schedule.loadingTasks')} />
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
