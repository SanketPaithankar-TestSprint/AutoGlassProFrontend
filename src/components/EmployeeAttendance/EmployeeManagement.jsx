import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Table, Button, Modal, Form, Input, Select, notification, Empty, Space, Tooltip } from "antd";
import {
    PlusOutlined, IdcardOutlined, EditOutlined, KeyOutlined, LockOutlined
} from "@ant-design/icons";
import { getEmployees } from "../../api/getEmployees";
import { createEmployee } from "../../api/createEmployee";
import { updateEmployee } from "../../api/updateEmployee";
import { enableEmployeeLogin } from "../../api/enableEmployeeLogin";
import { getProfile } from "../../api/getProfile";

const { Option } = Select;

const EmployeeManagement = ({ token, isMobile }) => {
    const queryClient = useQueryClient();
    const [isEmployeeModalVisible, setIsEmployeeModalVisible] = useState(false);
    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
    const [employeeForm] = Form.useForm();
    const [loginForm] = Form.useForm();
    const [saving, setSaving] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null); // State to track which employee is being edited
    const [selectedEmployeeForLogin, setSelectedEmployeeForLogin] = useState(null);

    // Profile query to get User ID for creation
    const { data: profile } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            if (!token) return null;
            const res = await getProfile(token);
            return res;
        }
    });

    const { data: employees = [], isLoading: loadingEmployees } = useQuery({
        queryKey: ['employees'],
        queryFn: async () => {
            // Check localStorage cache first
            const cached = localStorage.getItem("agp_employees");
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
                } catch (e) {
                    console.error("Failed to parse cached employees", e);
                }
            }

            if (!token) throw new Error("No token found. Please login.");
            const res = await getEmployees(token);
            const data = Array.isArray(res) ? res : [];
            localStorage.setItem("agp_employees", JSON.stringify(data));
            return data;
        },
        staleTime: 1000 * 60 * 30 // Cache for 30 minutes
    });

    const handleAddEmployee = () => {
        setEditingEmployee(null); // Clear editing state
        employeeForm.resetFields();
        setIsEmployeeModalVisible(true);
    };

    const handleEditEmployee = (employee) => {
        setEditingEmployee(employee);
        employeeForm.setFieldsValue(employee); // Populate form with employee data
        setIsEmployeeModalVisible(true);
    };

    const handleEnableLogin = (employee) => {
        setSelectedEmployeeForLogin(employee);
        loginForm.setFieldsValue({ email: employee.email });
        setIsLoginModalVisible(true);
    };

    const handleSaveEmployee = async () => {
        try {
            const values = await employeeForm.validateFields();
            setSaving(true);

            if (!token) throw new Error("No token found");

            if (editingEmployee) {
                // Update existing employee
                await updateEmployee(token, editingEmployee.employeeId, values);
                notification.success({ message: "Employee updated successfully" });
            } else {
                // Create new employee
                if (!profile?.userId) throw new Error("User ID not found");

                const payload = {
                    ...values,
                    userId: profile.userId
                };

                await createEmployee(token, payload);
                notification.success({ message: "Employee created successfully" });
            }

            setIsEmployeeModalVisible(false);
            localStorage.removeItem("agp_employees");
            queryClient.invalidateQueries({ queryKey: ['employees'] });
        } catch (err) {
            console.error(err);
            notification.error({ message: `Failed to ${editingEmployee ? 'update' : 'create'} employee`, description: err.message });
        } finally {
            setSaving(false);
        }
    };

    const handleSaveLogin = async () => {
        try {
            const values = await loginForm.validateFields();
            setSaving(true);

            const payload = {
                employeeId: selectedEmployeeForLogin.employeeId,
                email: values.email,
                password: values.password
            };

            await enableEmployeeLogin(token, payload);
            notification.success({ message: "Login enabled successfully" });
            setIsLoginModalVisible(false);
        } catch (err) {
            notification.error({ message: "Failed to enable login", description: err.message });
        } finally {
            setSaving(false);
        }
    };

    const columns = [
        {
            title: "Name",
            key: "name",
            render: (_, record) => (
                <span className="font-medium text-gray-900">
                    {record.firstName} {record.lastName}
                </span>
            ),
        },
        {
            title: "Role",
            dataIndex: "role",
            key: "role",
            render: (role) => (
                <span className="text-gray-600">{role || "-"}</span>
            ),
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            render: (email) => (
                <span className="text-gray-600 font-mono text-sm">{email || "-"}</span>
            ),
        },
        {
            title: "Status",
            dataIndex: "isActive",
            key: "status",
            render: (isActive) => (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {isActive ? 'Active' : 'Inactive'}
                </span>
            ),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Tooltip title="Edit Employee">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleEditEmployee(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Enable Login / Set Password">
                        <Button
                            type="text"
                            icon={<LockOutlined />}
                            onClick={() => handleEnableLogin(record)}
                        />
                    </Tooltip>
                </Space>
            ),
            width: 120,
        }
    ];

    if (loadingEmployees) return <div className="text-center py-12 text-lg text-gray-500 animate-pulse">Loading employees...</div>;

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-end items-center mb-4">
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddEmployee}
                    style={{ background: "#7c3aed", borderColor: "#7c3aed" }}
                >
                    Add Employee
                </Button>
            </div>

            {employees.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                    <IdcardOutlined className="text-4xl text-gray-300 mb-3" />
                    <p className="text-gray-500">No employees found.</p>
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    {!isMobile && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <Table
                                columns={columns}
                                dataSource={employees}
                                rowKey="employeeId"
                                pagination={false}
                            />
                        </div>
                    )}

                    {/* Mobile Card View */}
                    {isMobile && (
                        <div className="space-y-3">
                            {employees.map((e, i) => (
                                <div key={e.employeeId || i} className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex flex-col">
                                            <h3 className="text-sm font-bold text-gray-900">{e.firstName} {e.lastName}</h3>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium w-fit mt-1 ${e.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {e.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <Space>
                                            <Button
                                                size="small"
                                                icon={<EditOutlined />}
                                                onClick={() => handleEditEmployee(e)}
                                            />
                                            <Button
                                                size="small"
                                                icon={<LockOutlined />}
                                                onClick={() => handleEnableLogin(e)}
                                            />
                                        </Space>
                                    </div>
                                    <div className="space-y-1 text-xs mt-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Role:</span>
                                            <span className="text-gray-900 font-medium">{e.role || "-"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Email:</span>
                                            <span className="text-gray-900 font-mono">{e.email || "-"}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            <Modal
                title={editingEmployee ? "Edit Employee" : "Add Employee"}
                open={isEmployeeModalVisible}
                onOk={handleSaveEmployee}
                onCancel={() => setIsEmployeeModalVisible(false)}
                confirmLoading={saving}
                width={isMobile ? '95%' : undefined}
                style={isMobile ? { maxWidth: 'calc(100vw - 20px)' } : {}}
            >
                <Form form={employeeForm} layout="vertical">
                    <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                        <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </div>
                    <Form.Item name="email" label="Email" rules={[{ type: 'email' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="role" label="Role" rules={[{ required: true }]}>
                        <Select>
                            <Select.Option value="technician">Technician</Select.Option>
                            <Select.Option value="manager">Manager</Select.Option>
                            <Select.Option value="sales">Sales</Select.Option>
                            <Select.Option value="csr">CSR</Select.Option>
                            <Select.Option value="installer">Installer</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Enable Employe Login"
                open={isLoginModalVisible}
                onOk={handleSaveLogin}
                onCancel={() => setIsLoginModalVisible(false)}
                confirmLoading={saving}
            >
                <Form form={loginForm} layout="vertical">
                    <p className="text-gray-500 mb-4">Set up login credentials for {selectedEmployeeForLogin?.firstName}.</p>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                        <Input disabled />
                    </Form.Item>
                    <Form.Item name="password" label="New Password" rules={[{ required: true, min: 6 }]}>
                        <Input.Password />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default EmployeeManagement;
