import React, { useState, useEffect } from 'react';
import { Form, Input, Button, notification, Tabs, Spin, Modal, Popconfirm, List, Typography, Space, Tag } from 'antd';
import { SaveOutlined, AppstoreOutlined, KeyOutlined, IdcardOutlined, ShopOutlined, CodeOutlined, PlusOutlined, EditOutlined, DeleteOutlined, CreditCardOutlined } from '@ant-design/icons';
import { setupTerminalDetails } from '../../api/setupTerminalDetails';
import { getTerminalDetails } from '../../api/getTerminalDetails';
import { updateTerminalDetails } from '../../api/updateTerminalDetails';
import { deleteTerminalDetails } from '../../api/deleteTerminalDetails';
import { getValidToken } from '../../api/getValidToken';

const { Text, Title } = Typography;

const TerminalConfiguration = () => {
    const [form] = Form.useForm();
    const [terminals, setTerminals] = useState([]);
    const [isFetching, setIsFetching] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Initial values based on curl command defaults
    const initialValues = {
        appid: '',
        appkey: '',
        epi: '',
        txnType: 'vc_publish',
        channelId: '',
        terminalName: '',
        isv: '',
        version: '1'
    };

    const fetchDetails = async () => {
        setIsFetching(true);
        try {
            const token = getValidToken();
            if (!token) return;

            const data = await getTerminalDetails(token);
            setTerminals(data || []);
        } catch (error) {
            console.error("Failed to fetch terminal details:", error);
            notification.error({
                message: "Fetch Error",
                description: "Failed to load existing terminal configurations.",
                placement: "topRight"
            });
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, []);

    const openAddModal = () => {
        setEditingId(null);
        form.setFieldsValue(initialValues);
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        setEditingId(item.id);
        form.setFieldsValue(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        form.resetFields();
        setEditingId(null);
    };

    const handleSave = async (values) => {
        setIsSaving(true);
        try {
            const token = getValidToken();
            if (!token) {
                throw new Error("No authentication token found. Please login again.");
            }

            if (editingId) {
                await updateTerminalDetails(token, editingId, values);
                notification.success({
                    message: "Device Updated",
                    description: "Terminal details have been updated successfully.",
                    placement: "topRight"
                });
            } else {
                await setupTerminalDetails(token, values);
                notification.success({
                    message: "Device Added",
                    description: "New terminal device added successfully.",
                    placement: "topRight"
                });
            }

            closeModal();
            fetchDetails(); // Refresh list
        } catch (error) {
            notification.error({
                message: "Configuration Error",
                description: error.message || "Failed to save terminal configuration.",
                placement: "topRight"
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const token = getValidToken();
            await deleteTerminalDetails(token, id);
            notification.success({
                message: "Device Deleted",
                description: "The terminal device was removed successfully.",
                placement: "topRight"
            });
            fetchDetails();
        } catch (error) {
            notification.error({
                message: "Deletion Error",
                description: error.message || "Failed to delete the terminal device.",
                placement: "topRight"
            });
        }
    };

    const valorPayContent = (
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 animate-fadeIn min-h-[400px]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-violet-100 text-violet-600">
                            <AppstoreOutlined />
                        </div>
                        Valor Pay Terminals
                    </h2>
                    <p className="text-gray-500 mt-2 text-sm leading-relaxed max-w-2xl">
                        Manage your Valor Pay payment terminal devices. You can add new hardware or edit existing credentials here.
                    </p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={openAddModal}
                    className="bg-violet-600 hover:bg-violet-700 h-10 px-5 rounded-lg shadow-sm font-medium"
                >
                    Add Device
                </Button>
            </div>

            {isFetching ? (
                <div className="flex justify-center items-center py-20">
                    <Spin size="large" tip="Loading devices..." />
                </div>
            ) : terminals.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <CreditCardOutlined className="text-4xl text-gray-300 mb-4" />
                    <Title level={5} className="text-gray-600 mb-1">No Devices Found</Title>
                    <Text className="text-gray-400 block mb-4">You haven't added any Valor Pay terminals yet.</Text>
                    <Button type="dashed" onClick={openAddModal} icon={<PlusOutlined />}>
                        Add Your First Device
                    </Button>
                </div>
            ) : (
                <List
                    grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 2, xl: 3, xxl: 3 }}
                    dataSource={terminals}
                    renderItem={item => (
                        <List.Item>
                            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-violet-200 transition-all duration-300 relative group overflow-hidden">
                                {/* Decorative top accent */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center">
                                            <ShopOutlined className="text-violet-500 text-lg" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-base m-0 leading-tight truncate max-w-[150px]" title={item.terminalName}>
                                                {item.terminalName}
                                            </h3>
                                            <Text type="secondary" className="text-xs">EPI: {item.epi}</Text>
                                        </div>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white shadow-sm p-1 rounded-md border border-gray-100">
                                        <Space size="small">
                                            <Button type="text" size="small" icon={<EditOutlined className="text-blue-500" />} onClick={() => openEditModal(item)} />
                                            <Popconfirm
                                                title="Delete terminal"
                                                description="Are you sure you want to delete this device?"
                                                onConfirm={() => handleDelete(item.id)}
                                                okText="Yes"
                                                cancelText="No"
                                                okButtonProps={{ danger: true }}
                                            >
                                                <Button type="text" danger size="small" icon={<DeleteOutlined />} />
                                            </Popconfirm>
                                        </Space>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100/50">
                                    <div className="flex justify-between items-center">
                                        <Text type="secondary" className="text-xs font-semibold">APP ID</Text>
                                        <Text className="font-mono text-xs truncate max-w-[120px] text-gray-700" title={item.appid}>{item.appid}</Text>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <Text type="secondary" className="text-xs font-semibold">ISV</Text>
                                        <Text className="font-mono text-xs truncate max-w-[120px] text-gray-700">{item.isv}</Text>
                                    </div>
                                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200/50">
                                        <Text type="secondary" className="text-xs font-semibold">TXN TYPE</Text>
                                        <Tag color="purple" bordered={false} className="m-0 text-[10px] leading-3 py-1 font-semibold">{item.txnType}</Tag>
                                    </div>
                                </div>
                            </div>
                        </List.Item>
                    )}
                />
            )}

            <Modal
                title={
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                        {editingId ? <EditOutlined className="text-violet-500" /> : <PlusOutlined className="text-violet-500" />}
                        <span className="font-bold text-lg">{editingId ? 'Edit Terminal Device' : 'Add New Terminal Device'}</span>
                    </div>
                }
                open={isModalOpen}
                onCancel={closeModal}
                footer={null}
                width={700}
                destroyOnClose
                centered
                maskClosable={false}
                className="custom-modal"
            >
                <div className="pt-4">
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSave}
                        requiredMark={false}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                            {/* App ID & App Key */}
                            <Form.Item
                                name="appid"
                                label={<span className="text-gray-700 font-medium text-sm">App ID</span>}
                                rules={[{ required: true, message: 'App ID is required' }]}
                            >
                                <Input prefix={<IdcardOutlined className="text-gray-400" />} placeholder="Enter App ID" className="rounded-md bg-gray-50 border-gray-200 hover:border-violet-400 focus:border-violet-500" />
                            </Form.Item>

                            <Form.Item
                                name="appkey"
                                label={<span className="text-gray-700 font-medium text-sm">App Key</span>}
                                rules={[{ required: true, message: 'App Key is required' }]}
                            >
                                <Input.Password prefix={<KeyOutlined className="text-gray-400" />} placeholder="Enter App Key" className="rounded-md bg-gray-50 border-gray-200 hover:border-violet-400 focus:border-violet-500" />
                            </Form.Item>

                            {/* EPI & Channel ID */}
                            <Form.Item
                                name="epi"
                                label={<span className="text-gray-700 font-medium text-sm">EPI</span>}
                                rules={[{ required: true, message: 'EPI is required' }]}
                            >
                                <Input prefix={<CodeOutlined className="text-gray-400" />} placeholder="e.g. 2418559012" className="rounded-md bg-gray-50 border-gray-200 hover:border-violet-400 focus:border-violet-500" />
                            </Form.Item>

                            <Form.Item
                                name="channelId"
                                label={<span className="text-gray-700 font-medium text-sm">Channel ID</span>}
                                rules={[{ required: true, message: 'Channel ID is required' }]}
                            >
                                <Input prefix={<CodeOutlined className="text-gray-400" />} placeholder="e.g. f1e2d3c4b5a6987654..." className="rounded-md bg-gray-50 border-gray-200 hover:border-violet-400 focus:border-violet-500" />
                            </Form.Item>

                            {/* Terminal Name & ISV */}
                            <Form.Item
                                name="terminalName"
                                label={<span className="text-gray-700 font-medium text-sm">Terminal Name</span>}
                                rules={[{ required: true, message: 'Terminal Name is required' }]}
                            >
                                <Input prefix={<ShopOutlined className="text-gray-400" />} placeholder="e.g. TERM-POS-9921" className="rounded-md bg-gray-50 border-gray-200 hover:border-violet-400 focus:border-violet-500" />
                            </Form.Item>

                            <Form.Item
                                name="isv"
                                label={<span className="text-gray-700 font-medium text-sm">ISV</span>}
                                rules={[{ required: true, message: 'ISV is required' }]}
                            >
                                <Input prefix={<CodeOutlined className="text-gray-400" />} placeholder="e.g. ISV-CERT-8842-X" className="rounded-md bg-gray-50 border-gray-200 hover:border-violet-400 focus:border-violet-500" />
                            </Form.Item>

                            {/* Txn Type & Version (readonly or default) */}
                            <Form.Item
                                name="txnType"
                                label={<span className="text-gray-700 font-medium text-sm">Transaction Type</span>}
                                rules={[{ required: true, message: 'Transaction Type is required' }]}
                            >
                                <Input className="rounded-md bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed" readOnly />
                            </Form.Item>

                            <Form.Item
                                name="version"
                                label={<span className="text-gray-700 font-medium text-sm">API Version</span>}
                                rules={[{ required: true, message: 'API Version is required' }]}
                            >
                                <Input className="rounded-md bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed" readOnly />
                            </Form.Item>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100 justify-end flex gap-3">
                            <Button onClick={closeModal} disabled={isSaving}>
                                Cancel
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={isSaving}
                                icon={<SaveOutlined />}
                                className="bg-violet-600 hover:bg-violet-700 rounded-md font-medium shadow-sm transition-all duration-200"
                            >
                                {isSaving ? "Saving..." : (editingId ? "Update Device" : "Add Device")}
                            </Button>
                        </div>
                    </Form>
                </div>
            </Modal>
        </div>
    );

    const items = [
        {
            key: 'valor',
            label: (
                <div className="flex items-center gap-2 px-4 py-1">
                    <AppstoreOutlined className="text-lg" />
                    <span className="font-semibold">Valor Pay</span>
                </div>
            ),
            children: valorPayContent,
        }
    ];

    return (
        <div className="w-full">
            <Tabs
                defaultActiveKey="valor"
                items={items}
                className="custom-tabs"
                animated={{ inkBar: true, tabPane: true }}
            />
            {/* Inline CSS overrides to match the premium purple aesthetic */}
            <style>{`
                .custom-tabs .ant-tabs-nav::before {
                    border-bottom-color: #f3f4f6;
                }
                .custom-tabs .ant-tabs-tab {
                    padding: 12px 0;
                    margin-right: 32px;
                }
                .custom-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
                    color: #7c3aed !important;
                }
                .custom-tabs .ant-tabs-ink-bar {
                    background: #7c3aed;
                    height: 3px;
                    border-radius: 3px 3px 0 0;
                }
                .custom-tabs .ant-tabs-tab:hover .ant-tabs-tab-btn {
                    color: #8b5cf6;
                }
                .custom-modal .ant-modal-content {
                    border-radius: 16px;
                    padding: 24px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
                }
            `}</style>
        </div>
    );
};

export default TerminalConfiguration;
