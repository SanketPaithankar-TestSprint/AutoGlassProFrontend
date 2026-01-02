import React, { useEffect, useState } from "react";
import { getDistributorCredentials } from "../../api/getDistributorCredentials";
import { createDistributorCredential } from "../../api/createDistributorCredential";
import { updateDistributorCredential } from "../../api/updateDistributorCredential";
import { deleteDistributorCredential } from "../../api/deleteDistributorCredential";
import { getValidToken } from "../../api/getValidToken";
import { KeyOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { Modal, Form, Input, Button, notification, Popconfirm, Select } from "antd";

const DistributorCredentials = () => {
    const [credentials, setCredentials] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingCredential, setEditingCredential] = useState(null);
    const [showPasswords, setShowPasswords] = useState({});

    const [form] = Form.useForm();

    useEffect(() => {
        fetchCredentials();
    }, []);

    const fetchCredentials = async () => {
        setLoading(true);
        try {
            const token = getValidToken(); // Get fresh token
            if (!token) throw new Error("No token found. Please login.");
            const res = await getDistributorCredentials(token);
            setCredentials(res);
        } catch (err) {
            console.error(err);
            notification.error({
                message: "Failed to fetch credentials",
                description: err.message
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingCredential(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (credential) => {
        setEditingCredential(credential);
        form.setFieldsValue({
            distributorName: credential.distributorName,
            username: credential.username,
            password: "", // Don't populate password for security
            agentId: credential.agentId || "",
            accountNumber: credential.accountNumber || ""
        });
        setIsModalVisible(true);
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);

            const token = getValidToken(); // Get fresh token
            if (!token) throw new Error("No token found");

            // If editing and password is empty, remove it from the payload
            const payload = { ...values };
            if (editingCredential && !payload.password) {
                delete payload.password;
            }

            if (editingCredential) {
                await updateDistributorCredential(token, editingCredential.id, payload);
                notification.success({ message: "Credential updated successfully" });
            } else {
                await createDistributorCredential(token, payload);
                notification.success({ message: "Credential created successfully" });
            }

            setIsModalVisible(false);
            form.resetFields();
            fetchCredentials();
        } catch (err) {
            console.error(err);
            notification.error({
                message: "Failed to save credential",
                description: err.message
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (credentialId) => {
        try {
            const token = getValidToken(); // Get fresh token
            if (!token) throw new Error("No token found");
            await deleteDistributorCredential(token, credentialId);
            notification.success({ message: "Credential deleted successfully" });
            fetchCredentials();
        } catch (err) {
            console.error(err);
            notification.error({
                message: "Failed to delete credential",
                description: err.message
            });
        }
    };

    const togglePasswordVisibility = (id) => {
        setShowPasswords(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    if (loading) {
        return (
            <div className="text-center py-12 text-lg text-gray-500 animate-pulse">
                Loading credentials...
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <KeyOutlined className="text-violet-500" />
                    Distributor Credentials
                </h2>
                <button
                    onClick={handleAdd}
                    className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                    <PlusOutlined /> Add Credential
                </button>
            </div>

            {credentials.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                    <KeyOutlined className="text-4xl text-gray-300 mb-3" />
                    <p className="text-gray-500">No distributor credentials found.</p>
                    <p className="text-sm text-gray-400 mt-2">Add credentials to manage your distributor accounts.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Distributor</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Username</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Password</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Agent ID</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Account Number</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {credentials.map((cred) => (
                                    <tr key={cred.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 text-sm font-medium text-gray-900">
                                            {cred.distributorName}
                                        </td>
                                        <td className="p-4 text-sm text-gray-600 font-mono">
                                            {cred.usernameMasked || cred.username || "-"}
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                {cred.hasPassword ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        ✓ Set
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                        Not Set
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {cred.hasAgentId ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    ✓ Set
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                    Not Set
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {cred.hasAccountNumber ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    ✓ Set
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                    Not Set
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    type="text"
                                                    icon={<EditOutlined />}
                                                    onClick={() => handleEdit(cred)}
                                                    title="Edit credential"
                                                />
                                                <Popconfirm
                                                    title="Delete credential"
                                                    description="Are you sure you want to delete this credential?"
                                                    onConfirm={() => handleDelete(cred.id)}
                                                    okText="Yes"
                                                    cancelText="No"
                                                    okButtonProps={{ danger: true }}
                                                >
                                                    <Button
                                                        type="text"
                                                        danger
                                                        icon={<DeleteOutlined />}
                                                        title="Delete credential"
                                                    />
                                                </Popconfirm>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <KeyOutlined />
                        {editingCredential ? "Edit Credential" : "Add Credential"}
                    </div>
                }
                open={isModalVisible}
                onOk={handleSave}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                confirmLoading={saving}
                okText={editingCredential ? "Update" : "Create"}
                width={500}
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item
                        name="distributorName"
                        label="Distributor Name"
                        rules={[
                            { required: true, message: "Please select the distributor name" }
                        ]}
                    >
                        <Select
                            placeholder="Select a distributor"
                            size="large"
                            options={[
                                { label: "Pilkington", value: "Pilkington" }
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        name="username"
                        label="Username"
                        rules={[
                            { required: true, message: "Please enter the username" },
                            { max: 100, message: "Username is too long" }
                        ]}
                    >
                        <Input
                            placeholder="Enter username"
                            size="large"
                            autoComplete="off"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label={editingCredential ? "Password (leave blank to keep current)" : "Password"}
                        rules={editingCredential ? [] : [
                            { required: true, message: "Please enter the password" }
                        ]}
                        extra={editingCredential ? "Only fill this if you want to change the password" : null}
                    >
                        <Input.Password
                            placeholder="Enter password"
                            size="large"
                            autoComplete="new-password"
                        />
                    </Form.Item>

                    <Form.Item
                        name="agentId"
                        label="Agent ID"
                        rules={[
                            { required: true, message: "Please enter the agent ID" },
                            { max: 100, message: "Agent ID is too long" }
                        ]}
                    >
                        <Input
                            placeholder="Enter agent ID"
                            size="large"
                            autoComplete="off"
                        />
                    </Form.Item>

                    <Form.Item
                        name="accountNumber"
                        label="Account Number"
                        rules={[
                            { required: true, message: "Please enter the account number" },
                            { max: 100, message: "Account number is too long" }
                        ]}
                    >
                        <Input
                            placeholder="Enter account number"
                            size="large"
                            autoComplete="off"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default DistributorCredentials;
