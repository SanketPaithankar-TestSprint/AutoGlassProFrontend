import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Table, Button, Modal, Form, Input, InputNumber, Select, message, Popconfirm, Space, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { getAllSmtpConfigs } from "../../api/getAllSmtpConfigs";
import { createSmtpConfig } from "../../api/createSmtpConfig";
import { updateSmtpConfig } from "../../api/updateSmtpConfig";
import { deleteSmtpConfig } from "../../api/deleteSmtpConfig";
import { testSmtpConnection } from "../../api/testSmtpConnection";
import { verifySmtpConfig } from "../../api/verifySmtpConfig";

const { Option } = Select;

const SmtpConfiguration = () => {
    const queryClient = useQueryClient();
    // const [configs, setConfigs] = useState([]); // Replaced by useQuery
    // const [loading, setLoading] = useState(false); // Replaced by useQuery
    const [modalVisible, setModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingConfig, setEditingConfig] = useState(null);
    const [testingId, setTestingId] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const { data: configs = [], isLoading: loading } = useQuery({
        queryKey: ['smtpConfigs'],
        queryFn: async () => {
            const data = await getAllSmtpConfigs();
            return Array.isArray(data) ? data : [];
        },
        onError: (error) => {
            message.error("Failed to load SMTP configurations");
            console.error(error);
        }
    });

    const handleAdd = () => {
        setEditingConfig(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (config) => {
        setEditingConfig(config);
        form.setFieldsValue({
            host: config.host,
            port: config.port,
            encryption: config.encryption,
            username: config.username,
            password: "", // Don't populate password for security
            fromEmail: config.fromEmail,
            isActive: config.isActive
        });
        setModalVisible(true);
    };

    const handleDelete = async (configId) => {
        try {
            await deleteSmtpConfig(configId);
            message.success("SMTP configuration deleted");
            queryClient.invalidateQueries({ queryKey: ['smtpConfigs'] });
        } catch (error) {
            message.error("Failed to delete configuration");
        }
    };

    const handleTest = async (configId) => {
        setTestingId(configId);
        try {
            await testSmtpConnection(configId);
            message.success("Connection test successful!");
        } catch (error) {
            message.error("Connection test failed: " + error.message);
        } finally {
            setTestingId(null);
        }
    };

    const handleVerify = async (configId) => {
        try {
            await verifySmtpConfig(configId);
            message.success("Configuration verified");
            queryClient.invalidateQueries({ queryKey: ['smtpConfigs'] });
        } catch (error) {
            message.error("Verification failed: " + error.message);
        }
    };

    const handleSubmit = async (values) => {
        try {
            if (editingConfig) {
                // Update existing
                await updateSmtpConfig(editingConfig.id, values);
                message.success("SMTP configuration updated");
            } else {
                // Create new
                await createSmtpConfig(values);
                message.success("SMTP configuration created");
            }
            setModalVisible(false);
            form.resetFields();
            queryClient.invalidateQueries({ queryKey: ['smtpConfigs'] });
        } catch (error) {
            message.error("Failed to save configuration: " + error.message);
        }
    };

    const columns = [
        {
            title: "Status",
            dataIndex: "isActive",
            key: "isActive",
            width: 100,
            render: (isActive) => (
                isActive ? (
                    <Tag color="green" icon={<CheckCircleOutlined />}>Active</Tag>
                ) : (
                    <Tag color="default">Inactive</Tag>
                )
            )
        },
        {
            title: "Host",
            dataIndex: "host",
            key: "host",
        },
        {
            title: "Port",
            dataIndex: "port",
            key: "port",
            width: 80
        },
        {
            title: "Encryption",
            dataIndex: "encryption",
            key: "encryption",
            width: 100,
            render: (encryption) => <Tag>{encryption || "NONE"}</Tag>
        },
        {
            title: "From Email",
            dataIndex: "fromEmail",
            key: "fromEmail",
        },
        {
            title: "Username",
            dataIndex: "username",
            key: "username",
        },
        {
            title: "Actions",
            key: "actions",
            width: 200,
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="text"
                        size="small"
                        icon={<ThunderboltOutlined />}
                        onClick={() => handleTest(record.id)}
                        loading={testingId === record.id}
                    >
                        Test
                    </Button>
                    <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />
                    <Popconfirm
                        title="Delete this configuration?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            type="text"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                        />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div className="smtp-configuration">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-semibold mb-1">Email Configuration (SMTP)</h3>
                    <p className="text-sm text-gray-500">Manage SMTP settings for sending emails from the system</p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                >
                    Add Configuration
                </Button>
            </div>

            {/* Desktop Table View */}
            {!isMobile && (
                <Table
                    dataSource={configs}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                    bordered
                    size="middle"
                />
            )}

            {/* Mobile Card View */}
            {isMobile && (
                <div className="space-y-3">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading...</div>
                    ) : configs.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No configurations found</div>
                    ) : (
                        configs.map((config) => (
                            <div key={config.id} className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900">{config.fromEmail}</h3>
                                        <p className="text-xs text-gray-500">{config.host}:{config.port}</p>
                                    </div>
                                    {config.isActive && <CheckCircleOutlined className="text-green-600 text-lg" />}
                                </div>
                                <div className="space-y-2 text-xs mb-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Status:</span>
                                        <Tag color={config.isActive ? 'green' : 'red'}>
                                            {config.isActive ? 'Active' : 'Inactive'}
                                        </Tag>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Host:</span>
                                        <span className="text-gray-900 font-mono text-xs">{config.host}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Port:</span>
                                        <span className="text-gray-900 font-bold">{config.port}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Encryption:</span>
                                        <Tag>{config.encryption || "NONE"}</Tag>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">From Email:</span>
                                        <span className="text-gray-900 font-mono text-xs">{config.fromEmail}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Username:</span>
                                        <span className="text-gray-900 font-mono text-xs">{config.username}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2 justify-between">
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<ThunderboltOutlined />}
                                        onClick={() => handleTest(config.id)}
                                        loading={testingId === config.id}
                                        className="flex-1"
                                    >
                                        Test
                                    </Button>
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<EditOutlined />}
                                        onClick={() => handleEdit(config)}
                                        className="flex-1"
                                    >
                                        Edit
                                    </Button>
                                    <Popconfirm
                                        title="Delete configuration"
                                        description="Are you sure?"
                                        onConfirm={() => handleDelete(config.id)}
                                        okText="Yes"
                                        cancelText="No"
                                        okButtonProps={{ danger: true }}
                                    >
                                        <Button
                                            type="text"
                                            size="small"
                                            danger
                                            icon={<DeleteOutlined />}
                                            className="flex-1"
                                        >
                                            Delete
                                        </Button>
                                    </Popconfirm>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            <Modal
                title={editingConfig ? "Edit SMTP Configuration" : "Add SMTP Configuration"}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                width={isMobile ? '95%' : 600}
                style={isMobile ? { maxWidth: 'calc(100vw - 20px)' } : {}}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        port: 587,
                        encryption: "TLS",
                        isActive: false
                    }}
                >
                    <Form.Item
                        name="host"
                        label="SMTP Host"
                        rules={[{ required: true, message: "Please enter SMTP host" }]}
                    >
                        <Input placeholder="smtp.gmail.com" />
                    </Form.Item>

                    <Form.Item
                        name="port"
                        label="SMTP Port"
                        rules={[{ required: true, message: "Please enter port" }]}
                    >
                        <InputNumber className="w-full" min={1} max={65535} />
                    </Form.Item>

                    <Form.Item
                        name="encryption"
                        label="Encryption"
                        rules={[{ required: true, message: "Please select encryption" }]}
                    >
                        <Select>
                            <Option value="TLS">TLS (Port 587)</Option>
                            <Option value="SSL">SSL (Port 465)</Option>
                            <Option value="NONE">None</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="username"
                        label="SMTP Username"
                        rules={[{ required: true, message: "Please enter username" }]}
                    >
                        <Input placeholder="your-email@gmail.com" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="SMTP Password"
                        rules={[{ required: !editingConfig, message: "Please enter password" }]}
                        extra={editingConfig ? "Leave blank to keep existing password" : ""}
                    >
                        <Input.Password placeholder="App password or SMTP password" />
                    </Form.Item>

                    <Form.Item
                        name="fromEmail"
                        label="From Email Address"
                        rules={[
                            { required: true, message: "Please enter from email" },
                            { type: "email", message: "Please enter a valid email" }
                        ]}
                    >
                        <Input placeholder="noreply@yourcompany.com" />
                    </Form.Item>

                    <Form.Item
                        name="isActive"
                        label="Set as Active Configuration"
                        valuePropName="checked"
                    >
                        <Select>
                            <Option value={true}>Yes - Use this as default</Option>
                            <Option value={false}>No - Save for later</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SmtpConfiguration;
