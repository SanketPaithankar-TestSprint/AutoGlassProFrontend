import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getDistributorCredentials } from "../../api/getDistributorCredentials";
import { createDistributorCredential } from "../../api/createDistributorCredential";
import { updateDistributorCredential } from "../../api/updateDistributorCredential";
import { deleteDistributorCredential } from "../../api/deleteDistributorCredential";
import { getValidToken } from "../../api/getValidToken";
import { Modal, Form, Input, Button, notification, Popconfirm, Select } from "antd";
import { DeleteOutlined, EditOutlined, EyeInvisibleOutlined, EyeOutlined, KeyOutlined, PlusOutlined } from "@ant-design/icons";
import { useTranslation } from 'react-i18next';

const DistributorCredentials = () => {
    const queryClient = useQueryClient();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingCredential, setEditingCredential] = useState(null);
    const [showPasswords, setShowPasswords] = useState({});
    const [saving, setSaving] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const { t } = useTranslation();

    const [form] = Form.useForm();

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const { data: credentials = [], isLoading: loading } = useQuery({
        queryKey: ['distributorCredentials'],
        queryFn: async () => {
            const token = getValidToken();
            if (!token) throw new Error("No token found. Please login.");
            return await getDistributorCredentials(token);
        },
        onError: (err) => {
            console.error(err);
            notification.error({
                message: "Failed to fetch credentials",
                description: err.message
            });
        }
    });

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
            queryClient.invalidateQueries({ queryKey: ['distributorCredentials'] });
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

    const handleDelete = async (distributorName) => {
        try {
            const token = getValidToken(); // Get fresh token
            if (!token) throw new Error("No token found");
            await deleteDistributorCredential(token, distributorName);
            notification.success({ message: "Credential deleted successfully" });
            queryClient.invalidateQueries({ queryKey: ['distributorCredentials'] });
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
                    {t('distributors.title')}
                </h2>
                <button
                    onClick={handleAdd}
                    className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                    <PlusOutlined /> {t('distributors.addCredential')}
                </button>
            </div>

            {credentials.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                    <KeyOutlined className="text-4xl text-gray-300 mb-3" />
                    <p className="text-gray-500">{t('distributors.noCredentialsFound')}</p>
                    <p className="text-sm text-gray-400 mt-2">{t('distributors.addCredentialsToManage')}</p>
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    {!isMobile && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('distributors.distributor')}</th>
                                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('distributors.username')}</th>
                                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('auth.password')}</th>
                                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('distributors.agentId')}</th>
                                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('distributors.accountNumber')}</th>
                                            <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('employees.actions')}</th>
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
                                                                ✓ {t('distributors.set')}
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                                {t('distributors.notSet')}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-sm text-gray-600">
                                                    {cred.hasAgentId ? (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            ✓ {t('distributors.set')}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                            {t('distributors.notSet')}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-sm text-gray-600">
                                                    {cred.hasAccountNumber ? (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            ✓ {t('distributors.set')}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                            {t('distributors.notSet')}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            type="text"
                                                            icon={<EditOutlined />}
                                                            onClick={() => handleEdit(cred)}
                                                            title={t('distributors.editCredential')}
                                                        />
                                                        <Popconfirm
                                                            title={t('distributors.deleteCredential')}
                                                            description={t('distributors.deleteConfirm')}
                                                            onConfirm={() => handleDelete(cred.distributorName)}
                                                            okText="Yes"
                                                            cancelText="No"
                                                            okButtonProps={{ danger: true }}
                                                        >
                                                            <Button
                                                                type="text"
                                                                danger
                                                                icon={<DeleteOutlined />}
                                                                title={t('distributors.deleteCredential')}
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

                    {/* Mobile Card View */}
                    {isMobile && (
                        <div className="space-y-3">
                            {credentials.map((cred) => (
                                <div key={cred.id} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-sm font-bold text-gray-900">{cred.distributorName}</h3>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                type="text"
                                                size="small"
                                                icon={<EditOutlined />}
                                                onClick={() => handleEdit(cred)}
                                                title={t('distributors.editCredential')}
                                            />
                                            <Popconfirm
                                                title={t('distributors.deleteCredential')}
                                                description={t('distributors.deleteConfirm')}
                                                onConfirm={() => handleDelete(cred.distributorName)}
                                                okText="Yes"
                                                cancelText="No"
                                                okButtonProps={{ danger: true }}
                                            >
                                                <Button
                                                    type="text"
                                                    size="small"
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    title={t('distributors.deleteCredential')}
                                                />
                                            </Popconfirm>
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">{t('distributors.username')}:</span>
                                            <span className="text-gray-900 font-mono">{cred.usernameMasked || cred.username || "-"}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">{t('auth.password')}:</span>
                                            {cred.hasPassword ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    ✓ {t('distributors.set')}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                    {t('distributors.notSet')}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">{t('distributors.agentId')}:</span>
                                            {cred.hasAgentId ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    ✓ {t('distributors.set')}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                    {t('distributors.notSet')}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">{t('distributors.accountNumber')}:</span>
                                            {cred.hasAccountNumber ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    ✓ {t('distributors.set')}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                    {t('distributors.notSet')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            <Modal
                title={
                    <div className="flex items-center gap-2">
                        <KeyOutlined />
                        {editingCredential ? t('distributors.editCredential') : t('distributors.addCredential')}
                    </div>
                }
                open={isModalVisible}
                onOk={handleSave}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                confirmLoading={saving}
                okText={editingCredential ? t('shops.update') : t('shops.create')}
                width={isMobile ? '95%' : 500}
                style={isMobile ? { maxWidth: 'calc(100vw - 20px)' } : {}}
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item
                        name="distributorName"
                        label={t('distributors.distributorName')}
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
                        label={t('distributors.username')}
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
                        label={editingCredential ? t('distributors.passwordLeaveBlank') : t('auth.password')}
                        rules={editingCredential ? [] : [
                            { required: true, message: "Please enter the password" }
                        ]}
                        extra={editingCredential ? t('distributors.onlyFillIfChange') : null}
                    >
                        <Input.Password
                            placeholder="Enter password"
                            size="large"
                            autoComplete="new-password"
                        />
                    </Form.Item>

                    <Form.Item
                        name="agentId"
                        label={t('distributors.agentId')}
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
                        label={t('distributors.accountNumber')}
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
