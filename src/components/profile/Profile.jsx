import React, { useEffect, useState } from "react";
import { getProfile } from "../../api/getProfile";
import { getCustomers } from "../../api/getCustomers";
import { getEmployees } from "../../api/getEmployees";
import { createCustomer } from "../../api/createCustomer";
import { updateCustomer } from "../../api/updateCustomer";
import { createEmployee } from "../../api/createEmployee";
import { getValidToken } from "../../api/getValidToken";
import { setLaborRate } from "../../api/setLaborRate";
import { setUserLaborRate } from "../../services/laborRateService";
import { saveEmployees as saveEmployeesToCache } from "../../services/employeeService";
import { UserOutlined, TeamOutlined, IdcardOutlined, ShopOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined, EditOutlined, PlusOutlined, DollarOutlined } from "@ant-design/icons";
import { Modal, Form, Input, Select, Button, notification, message } from "antd";

const Profile = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [profile, setProfile] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [employees, setEmployees] = useState([]);

    const [loadingProfile, setLoadingProfile] = useState(true);
    const [loadingCustomers, setLoadingCustomers] = useState(false);
    const [loadingEmployees, setLoadingEmployees] = useState(false);
    const [saving, setSaving] = useState(false);

    // Modals state
    const [isCustomerModalVisible, setIsCustomerModalVisible] = useState(false);
    const [isEmployeeModalVisible, setIsEmployeeModalVisible] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);

    // Labor rate state
    const [laborRate, setLaborRateState] = useState(null);
    const [isEditingLaborRate, setIsEditingLaborRate] = useState(false);
    const [savingLaborRate, setSavingLaborRate] = useState(false);
    const [tempLaborRate, setTempLaborRate] = useState("");

    const [form] = Form.useForm();
    const [employeeForm] = Form.useForm();

    const [error, setError] = useState(null);

    const token = getValidToken();

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        if (activeTab === 'customers') fetchCustomers();
        if (activeTab === 'employees') fetchEmployees();
    }, [activeTab]);

    const fetchProfile = async () => {
        setLoadingProfile(true);
        setError(null);
        try {
            if (!token) throw new Error("No token found. Please login.");
            const res = await getProfile(token);
            setProfile(res);
            // Parse laborRate as it may come as string from API
            const rate = res.laborRate ? parseFloat(res.laborRate) : null;
            setLaborRateState(rate);
            localStorage.setItem("agp_profile_data", JSON.stringify(res));
        } catch (err) {
            setError(err.message || "Failed to fetch profile.");
        } finally {
            setLoadingProfile(false);
        }
    };

    const fetchCustomers = async () => {
        if (customers.length > 0) return; // cache locally
        setLoadingCustomers(true);
        try {
            if (!token) throw new Error("No token found. Please login.");
            const res = await getCustomers(token);
            setCustomers(Array.isArray(res) ? res : []);
        } catch (err) {
            console.error(err);
            // setError(err.message || "Failed to fetch customers.");
        } finally {
            setLoadingCustomers(false);
        }
    };

    const fetchEmployees = async () => {
        if (employees.length > 0) return; // cache locally
        setLoadingEmployees(true);
        try {
            if (!token) throw new Error("No token found. Please login.");
            const res = await getEmployees(token);
            const employeeList = Array.isArray(res) ? res : [];
            setEmployees(employeeList);

            // Save to localStorage for app-wide access
            saveEmployeesToCache(employeeList);
        } catch (err) {
            console.error(err);
            // setError(err.message || "Failed to fetch employees.");
        } finally {
            setLoadingEmployees(false);
        }
    };

    // Customer Handlers
    const handleAddCustomer = () => {
        setEditingCustomer(null);
        form.resetFields();
        setIsCustomerModalVisible(true);
    };

    const handleEditCustomer = (customer) => {
        setEditingCustomer(customer);
        form.setFieldsValue({
            ...customer,
            vehicle: null // Vehicle editing not supported in this simple form yet
        });
        setIsCustomerModalVisible(true);
    };

    const handleSaveCustomer = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);

            if (!token) throw new Error("No token found");
            if (!profile?.userId) throw new Error("User ID not found");

            const payload = {
                ...values,
                userId: profile.userId
            };

            if (editingCustomer) {
                await updateCustomer(token, editingCustomer.customerId, payload);
                notification.success({ message: "Customer updated successfully" });
            } else {
                await createCustomer(token, payload);
                notification.success({ message: "Customer created successfully" });
            }

            setIsCustomerModalVisible(false);
            fetchCustomers(); // Refresh list
        } catch (err) {
            console.error(err);
            notification.error({ message: "Failed to save customer", description: err.message });
        } finally {
            setSaving(false);
        }
    };

    // Employee Handlers
    const handleAddEmployee = () => {
        employeeForm.resetFields();
        setIsEmployeeModalVisible(true);
    };

    const handleSaveEmployee = async () => {
        try {
            const values = await employeeForm.validateFields();
            setSaving(true);

            if (!token) throw new Error("No token found");
            if (!profile?.userId) throw new Error("User ID not found");

            const payload = {
                ...values,
                userId: profile.userId
            };

            await createEmployee(token, payload);
            notification.success({ message: "Employee created successfully" });

            setIsEmployeeModalVisible(false);
            fetchEmployees(); // Refresh list
        } catch (err) {
            console.error(err);
            notification.error({ message: "Failed to create employee", description: err.message });
        } finally {
            setSaving(false);
        }
    };

    // Labor Rate Handlers
    const handleEditLaborRate = () => {
        setTempLaborRate(laborRate !== null ? laborRate.toString() : "");
        setIsEditingLaborRate(true);
    };

    const handleSaveLaborRate = async () => {
        try {
            const rate = parseFloat(tempLaborRate);
            if (isNaN(rate) || rate < 0) {
                notification.error({ message: "Invalid labor rate", description: "Please enter a valid positive number" });
                return;
            }

            setSavingLaborRate(true);
            if (!token) throw new Error("No token found");

            await setLaborRate(token, rate);
            setLaborRateState(rate);
            setIsEditingLaborRate(false);

            // Save to localStorage for use in quote creation
            setUserLaborRate(rate);

            notification.success({ message: "Labor rate updated successfully" });
        } catch (err) {
            console.error(err);
            notification.error({ message: "Failed to update labor rate", description: err.message });
        } finally {
            setSavingLaborRate(false);
        }
    };

    const handleCancelLaborRate = () => {
        setTempLaborRate("");
        setIsEditingLaborRate(false);
    };

    // Format address helper
    const formatAddress = (p) => {
        if (!p) return "-";
        const parts = [
            p.addressLine1,
            p.addressLine2,
            p.city,
            p.state,
            p.postalCode,
            p.country
        ].filter(Boolean);
        return parts.length > 0 ? parts.join(", ") : "-";
    };

    const renderMenuItem = (id, label, icon) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left font-medium ${activeTab === id
                ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                : "text-gray-600 hover:bg-violet-50 hover:text-violet-600"
                }`}
        >
            <span className="text-lg">{icon}</span>
            <span>{label}</span>
        </button>
    );

    const renderProfileContent = () => {
        if (loadingProfile) return <div className="text-center py-12 text-lg text-gray-500 animate-pulse">Loading profile...</div>;
        if (error) return <div className="text-center py-12 text-lg text-red-500">{error}</div>;
        if (!profile) return null;

        return (
            <div className="space-y-6 animate-fadeIn">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <ShopOutlined className="text-violet-500" /> Business Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Business Name</span>
                            <p className="text-gray-900 font-semibold text-lg">{profile.businessName || "-"}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Owner Name</span>
                            <p className="text-gray-900 font-semibold text-lg">{profile.ownerName || "-"}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">User Type</span>
                            <div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {profile.userType || "-"}
                                </span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Business License</span>
                            <p className="text-gray-900 font-mono">{profile.businessLicenseNumber || "-"}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">EIN</span>
                            <p className="text-gray-900 font-mono">{profile.ein || "-"}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Labor Rate</span>
                            {!isEditingLaborRate ? (
                                <div className="flex items-center gap-2">
                                    <p className="text-gray-900 font-semibold text-lg flex items-center gap-1">
                                        <DollarOutlined className="text-violet-500" />
                                        {laborRate !== null ? `${Number(laborRate).toFixed(2)}/hr` : "Not Set"}
                                    </p>
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<EditOutlined />}
                                        onClick={handleEditLaborRate}
                                        className="text-violet-600 hover:text-violet-700"
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={tempLaborRate}
                                        onChange={(e) => setTempLaborRate(e.target.value)}
                                        placeholder="Enter rate"
                                        prefix={<DollarOutlined />}
                                        suffix="/hr"
                                        className="max-w-[180px]"
                                    />
                                    <Button
                                        type="primary"
                                        size="small"
                                        onClick={handleSaveLaborRate}
                                        loading={savingLaborRate}
                                        className="bg-violet-600 hover:bg-violet-700"
                                    >
                                        Save
                                    </Button>
                                    <Button
                                        size="small"
                                        onClick={handleCancelLaborRate}
                                        disabled={savingLaborRate}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <PhoneOutlined className="text-violet-500" /> Contact Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email</span>
                            <p className="text-gray-900 font-medium">{profile.email || "-"}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone</span>
                            <p className="text-gray-900 font-medium">{profile.phone || "-"}</p>
                        </div>
                        {profile.alternatePhone && (
                            <div className="space-y-1">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Alternate Phone</span>
                                <p className="text-gray-900 font-medium">{profile.alternatePhone}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <EnvironmentOutlined className="text-violet-500" /> Address
                    </h2>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Address</span>
                            <p className="text-gray-900 font-medium">{formatAddress(profile)}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderCustomersContent = () => {
        if (loadingCustomers) return <div className="text-center py-12 text-lg text-gray-500 animate-pulse">Loading customers...</div>;

        return (
            <div className="space-y-6 animate-fadeIn">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Customers</h2>
                    <button
                        onClick={handleAddCustomer}
                        className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <PlusOutlined /> Add Customer
                    </button>
                </div>
                {customers.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                        <TeamOutlined className="text-4xl text-gray-300 mb-3" />
                        <p className="text-gray-500">No customers found.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Vehicle</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {customers.map((c, i) => (
                                        <tr key={c.id || i} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 text-sm font-medium text-gray-900">{c.firstName} {c.lastName}</td>
                                            <td className="p-4 text-sm text-gray-600">{c.email || "-"}</td>
                                            <td className="p-4 text-sm text-gray-600">{c.phone || "-"}</td>
                                            <td className="p-4 text-sm text-gray-600">{c.vehicle ? `${c.vehicle.year} ${c.vehicle.make} ${c.vehicle.model}` : "-"}</td>
                                            <td className="p-4 text-sm text-gray-600">
                                                <Button
                                                    type="text"
                                                    icon={<EditOutlined />}
                                                    onClick={() => handleEditCustomer(c)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <Modal
                    title={editingCustomer ? "Edit Customer" : "Add Customer"}
                    open={isCustomerModalVisible}
                    onOk={handleSaveCustomer}
                    onCancel={() => setIsCustomerModalVisible(false)}
                    confirmLoading={saving}
                >
                    <Form form={form} layout="vertical">
                        <div className="grid grid-cols-2 gap-4">
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
                        <Form.Item name="addressLine1" label="Address Line 1">
                            <Input />
                        </Form.Item>
                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item name="city" label="City">
                                <Input />
                            </Form.Item>
                            <Form.Item name="state" label="State">
                                <Input />
                            </Form.Item>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item name="postalCode" label="Zip Code">
                                <Input />
                            </Form.Item>
                            <Form.Item name="country" label="Country">
                                <Input />
                            </Form.Item>
                        </div>
                    </Form>
                </Modal>
            </div>
        );
    };

    const renderEmployeesContent = () => {
        if (loadingEmployees) return <div className="text-center py-12 text-lg text-gray-500 animate-pulse">Loading employees...</div>;

        return (
            <div className="space-y-6 animate-fadeIn">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Employees</h2>
                    <button
                        onClick={handleAddEmployee}
                        className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <PlusOutlined /> Add Employee
                    </button>
                </div>
                {employees.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                        <IdcardOutlined className="text-4xl text-gray-300 mb-3" />
                        <p className="text-gray-500">No employees found.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {employees.map((e, i) => (
                                        <tr key={e.id || i} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 text-sm font-medium text-gray-900">{e.firstName} {e.lastName}</td>
                                            <td className="p-4 text-sm text-gray-600">{e.role || "-"}</td>
                                            <td className="p-4 text-sm text-gray-600">{e.email || "-"}</td>
                                            <td className="p-4 text-sm">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${e.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {e.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <Modal
                    title="Add Employee"
                    open={isEmployeeModalVisible}
                    onOk={handleSaveEmployee}
                    onCancel={() => setIsEmployeeModalVisible(false)}
                    confirmLoading={saving}
                >
                    <Form form={employeeForm} layout="vertical">
                        <div className="grid grid-cols-2 gap-4">
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
            </div>
        );
    };

    return (
        <div className="flex flex-col md:flex-row h-screen bg-gray-50/50 pt-16">
            {/* Sidebar */}
            <div className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0 md:h-[calc(100vh-64px)] overflow-y-auto">
                <div className="p-6">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Menu</h2>
                    <div className="space-y-2">
                        {renderMenuItem('profile', 'Profile', <UserOutlined />)}
                        {renderMenuItem('customers', 'Customers', <TeamOutlined />)}
                        {renderMenuItem('employees', 'Employees', <IdcardOutlined />)}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 md:h-[calc(100vh-64px)]">
                <div className="max-w-4xl mx-auto">
                    {activeTab === 'profile' && renderProfileContent()}
                    {activeTab === 'customers' && renderCustomersContent()}
                    {activeTab === 'employees' && renderEmployeesContent()}
                </div>
            </div>
        </div>
    );
};

export default Profile;
