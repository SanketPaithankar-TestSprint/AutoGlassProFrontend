import React, { useEffect, useState } from "react";
import { getEmployeeTasks } from "../../api/getEmployeeTasks";
import { getOverdueTasks } from "../../api/getOverdueTasks";
import { updateTaskStatus } from "../../api/updateTaskStatus";
import { assignTask } from "../../api/assignTask";
import { getEmployees } from "../../api/getEmployees";
import { getServiceDocuments } from "../../api/getServiceDocuments";
import { getValidToken } from "../../api/getValidToken";
import { Modal, Form, Input, Select, Button, notification, DatePicker, Tag, Card, Tabs } from "antd";
import { CalendarOutlined, UserOutlined, ClockCircleOutlined, CheckCircleOutlined, PlusOutlined, WarningOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Option } = Select;
const { TabPane } = Tabs;

const priorityColors = {
    LOW: 'green',
    MEDIUM: 'blue',
    HIGH: 'orange',
    URGENT: 'red'
};

const statusColors = {
    PENDING: 'gold',
    IN_PROGRESS: 'blue',
    ON_HOLD: 'orange',
    COMPLETED: 'green',
    CANCELLED: 'red'
};

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [overdueTasks, setOverdueTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [serviceDocuments, setServiceDocuments] = useState([]);
    const [profileData, setProfileData] = useState(null);
    const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [form] = Form.useForm();
    const token = getValidToken();

    useEffect(() => {
        // Load profile data from localStorage
        try {
            const saved = localStorage.getItem("agp_profile_data");
            if (saved) {
                setProfileData(JSON.parse(saved));
            }
        } catch (e) {
            console.error("Failed to parse profile data", e);
        }

        fetchEmployees();
        fetchServiceDocuments();
        fetchTasks();
    }, []);

    const fetchEmployees = async () => {
        try {
            const token = await getValidToken();
            const employeeList = await getEmployees(token);
            setEmployees(employeeList);
        } catch (error) {
            console.error("Failed to fetch employees:", error);
            notification.error({ message: "Failed to load employees" });
        }
    };

    const fetchServiceDocuments = async () => {
        try {
            const token = await getValidToken();
            const docs = await getServiceDocuments(token);
            setServiceDocuments(docs);
        } catch (error) {
            console.error("Failed to fetch service documents:", error);
        }
    };

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const token = await getValidToken();
            const overdueList = await getOverdueTasks();
            setOverdueTasks(overdueList);

            // Get tasks for all employees
            const allTasks = [];
            for (const employee of employees) {
                const empTasks = await getEmployeeTasks(employee.employeeId);
                allTasks.push(...empTasks);
            }
            setTasks(allTasks);
        } catch (error) {
            console.error("Failed to fetch tasks:", error);
            notification.error({ message: "Failed to load tasks" });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (assignmentId, newStatus) => {
        try {
            await updateTaskStatus(assignmentId, newStatus);
            notification.success({ message: "Task status updated successfully" });
            fetchTasks(); // Refresh tasks
        } catch (error) {
            console.error("Failed to update task status:", error);
            notification.error({ message: "Failed to update task status" });
        }
    };

    const handleAssignTask = () => {
        setIsAssignModalVisible(true);
    };

    const handleAssignSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                documentId: values.documentId,
                employeeId: values.employeeId,
                dueDate: values.dueDate.toISOString(),
                taskDescription: values.taskDescription,
                priority: values.priority || 'MEDIUM',
                estimatedDurationMinutes: values.estimatedDurationMinutes || 120,
                notes: values.notes || ''
            };

            await assignTask(payload);
            notification.success({ message: "Task assigned successfully" });
            setIsAssignModalVisible(false);
            form.resetFields();
            fetchTasks();
        } catch (error) {
            console.error("Failed to assign task:", error);
            notification.error({ message: "Failed to assign task", description: error.message });
        }
    };

    const isOverdue = (dueDate) => {
        return dayjs(dueDate).isBefore(dayjs());
    };

    const filterTasks = (taskList) => {
        switch (activeTab) {
            case 'pending':
                return taskList.filter(t => t.assignmentStatus === 'PENDING');
            case 'inProgress':
                return taskList.filter(t => t.assignmentStatus === 'IN_PROGRESS');
            case 'completed':
                return taskList.filter(t => t.assignmentStatus === 'COMPLETED');
            case 'overdue':
                return overdueTasks;
            default:
                return taskList;
        }
    };

    const renderTaskCard = (task) => {
        const employee = employees.find(e => e.employeeId === task.employee?.employeeId);
        const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown';
        const overdue = isOverdue(task.dueDate) && task.assignmentStatus !== 'COMPLETED';

        return (
            <Card
                key={task.assignmentId}
                className={`mb-4 transition-all hover:shadow-md ${overdue ? 'border-red-400' : 'border-gray-200'}`}
                bordered
            >
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            {overdue && <WarningOutlined className="text-red-500" />}
                            <h3 className="text-lg font-semibold text-gray-800">
                                {task.taskDescription || 'No description'}
                            </h3>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                            <Tag color={statusColors[task.assignmentStatus]}>
                                {task.assignmentStatus}
                            </Tag>
                            <Tag color={priorityColors[task.priority]}>
                                {task.priority} PRIORITY
                            </Tag>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <UserOutlined className="text-violet-500" />
                                <span>{employeeName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CalendarOutlined className={overdue ? "text-red-500" : "text-gray-400"} />
                                <span className={overdue ? "text-red-600 font-semibold" : ""}>
                                    Due: {dayjs(task.dueDate).format('MMM D, YYYY h:mm A')}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <ClockCircleOutlined className="text-blue-500" />
                                <span>{task.estimatedDurationMinutes || 0} mins estimated</span>
                            </div>
                            {task.serviceDocument && (
                                <div className="flex items-center gap-2">
                                    <span className="text-violet-600 font-medium">
                                        Doc: {task.serviceDocument.documentNumber}
                                    </span>
                                </div>
                            )}
                        </div>

                        {task.notes && (
                            <p className="mt-3 text-sm text-gray-500 italic">
                                Note: {task.notes}
                            </p>
                        )}
                    </div>

                    <div className="ml-4">
                        <Select
                            value={task.assignmentStatus}
                            style={{ width: 150 }}
                            onChange={(value) => handleStatusChange(task.assignmentId, value)}
                            disabled={task.assignmentStatus === 'COMPLETED' || task.assignmentStatus === 'CANCELLED'}
                        >
                            <Option value="PENDING">Pending</Option>
                            <Option value="IN_PROGRESS">In Progress</Option>
                            <Option value="ON_HOLD">On Hold</Option>
                            <Option value="COMPLETED">Completed</Option>
                            <Option value="CANCELLED">Cancelled</Option>
                        </Select>
                    </div>
                </div>
            </Card>
        );
    };

    const filteredTasks = filterTasks(tasks);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50 to-purple-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800 mb-2">Task Management</h1>
                        <p className="text-gray-600">Manage and track employee task assignments</p>
                    </div>
                    <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={handleAssignTask}
                        className="bg-violet-600 hover:bg-violet-700 border-none"
                    >
                        Assign New Task
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card className="bg-white border-l-4 border-gold hover:shadow-md transition-shadow">
                        <div className="text-sm text-gray-500">Pending Tasks</div>
                        <div className="text-3xl font-bold text-gray-800">
                            {tasks.filter(t => t.assignmentStatus === 'PENDING').length}
                        </div>
                    </Card>
                    <Card className="bg-white border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                        <div className="text-sm text-gray-500">In Progress</div>
                        <div className="text-3xl font-bold text-gray-800">
                            {tasks.filter(t => t.assignmentStatus === 'IN_PROGRESS').length}
                        </div>
                    </Card>
                    <Card className="bg-white border-l-4 border-green-500 hover:shadow-md transition-shadow">
                        <div className="text-sm text-gray-500">Completed</div>
                        <div className="text-3xl font-bold text-gray-800">
                            {tasks.filter(t => t.assignmentStatus === 'COMPLETED').length}
                        </div>
                    </Card>
                    <Card className="bg-white border-l-4 border-red-500 hover:shadow-md transition-shadow">
                        <div className="text-sm text-gray-500">Overdue</div>
                        <div className="text-3xl font-bold text-red-600">
                            {overdueTasks.length}
                        </div>
                    </Card>
                </div>

                {/* Tabs */}
                <Tabs activeKey={activeTab} onChange={setActiveTab} className="bg-white rounded-lg p-4 shadow-sm">
                    <TabPane tab="All Tasks" key="all" />
                    <TabPane tab="Pending" key="pending" />
                    <TabPane tab="In Progress" key="inProgress" />
                    <TabPane tab="Completed" key="completed" />
                    <TabPane tab={`Overdue (${overdueTasks.length})`} key="overdue" />
                </Tabs>

                {/* Task List */}
                <div className="mt-6">
                    {loading ? (
                        <div className="text-center py-12 text-lg text-gray-500">Loading tasks...</div>
                    ) : filteredTasks.length === 0 ? (
                        <div className="text-center py-12 text-lg text-gray-500">No tasks found</div>
                    ) : (
                        filteredTasks.map(renderTaskCard)
                    )}
                </div>

                {/* Assign Task Modal */}
                <Modal
                    title="Assign New Task"
                    open={isAssignModalVisible}
                    onOk={handleAssignSubmit}
                    onCancel={() => {
                        setIsAssignModalVisible(false);
                        form.resetFields();
                    }}
                    width={600}
                >
                    <Form form={form} layout="vertical">
                        <Form.Item
                            name="documentId"
                            label="Service Document"
                            rules={[{ required: true, message: 'Please select a document' }]}
                        >
                            <Select placeholder="Select service document">
                                {serviceDocuments.map(doc => (
                                    <Option key={doc.documentId} value={doc.documentId}>
                                        {doc.documentNumber} - {doc.customerName}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="employeeId"
                            label="Assign To"
                            rules={[{ required: true, message: 'Please select an employee' }]}
                        >
                            <Select placeholder="Select employee">
                                {employees.map(emp => (
                                    <Option key={emp.employeeId} value={emp.employeeId}>
                                        {emp.firstName} {emp.lastName} - {emp.role}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="taskDescription"
                            label="Task Description"
                            rules={[{ required: true, message: 'Please enter task description' }]}
                        >
                            <Input.TextArea rows={3} placeholder="Describe the task..." />
                        </Form.Item>

                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item
                                name="dueDate"
                                label="Due Date"
                                rules={[{ required: true, message: 'Please select due date' }]}
                            >
                                <DatePicker showTime className="w-full" />
                            </Form.Item>

                            <Form.Item name="priority" label="Priority" initialValue="MEDIUM">
                                <Select>
                                    <Option value="LOW">Low</Option>
                                    <Option value="MEDIUM">Medium</Option>
                                    <Option value="HIGH">High</Option>
                                    <Option value="URGENT">Urgent</Option>
                                </Select>
                            </Form.Item>
                        </div>

                        <Form.Item name="estimatedDurationMinutes" label="Estimated Duration (minutes)" initialValue={120}>
                            <Input type="number" min={0} />
                        </Form.Item>

                        <Form.Item name="notes" label="Additional Notes">
                            <Input.TextArea rows={2} placeholder="Any additional information..." />
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </div>
    );
};

export default Tasks;
