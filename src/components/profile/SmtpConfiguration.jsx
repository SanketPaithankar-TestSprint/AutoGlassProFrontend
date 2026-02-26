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
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();

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
            message.error(t('settings.failedToLoadSmtp', { defaultValue: 'Failed to load SMTP configurations' }));
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
            message.success(t('settings.smtpDeleted', { defaultValue: 'SMTP configuration deleted' }));
            queryClient.invalidateQueries({ queryKey: ['smtpConfigs'] });
        } catch (error) {
            message.error(t('settings.failedToDeleteSmtp', { defaultValue: 'Failed to delete configuration' }));
        }
    };

    const handleTest = async (configId) => {
        setTestingId(configId);
        try {
            await testSmtpConnection(configId);
            message.success(t('settings.connectionTestSuccessful', { defaultValue: 'Connection test successful!' }));
        } catch (error) {
            message.error(t('settings.connectionTestFailed', { defaultValue: 'Connection test failed: ' }) + error.message);
        } finally {
            setTestingId(null);
        }
    };

    const handleVerify = async (configId) => {
        try {
            await verifySmtpConfig(configId);
            message.success(t('settings.verificationSuccessful', { defaultValue: 'Configuration verified' }));
            queryClient.invalidateQueries({ queryKey: ['smtpConfigs'] });
        } catch (error) {
            message.error(t('settings.verificationFailed', { defaultValue: 'Verification failed: ' }) + error.message);
        }
    };

    const handleSubmit = async (values) => {
        try {
            if (editingConfig) {
                // Update existing
                await updateSmtpConfig(editingConfig.id, values);
                message.success(t('settings.smtpUpdated', { defaultValue: 'SMTP configuration updated' }));
            } else {
                // Create new
                await createSmtpConfig(values);
                message.success(t('settings.smtpCreated', { defaultValue: 'SMTP configuration created' }));
            }
            setModalVisible(false);
            form.resetFields();
            queryClient.invalidateQueries({ queryKey: ['smtpConfigs'] });
        } catch (error) {
            message.error(t('settings.failedToSaveSmtp', { defaultValue: 'Failed to save configuration: ' }) + error.message);
        }
    };

    const columns = [
        {
            title: t('employees.status', { defaultValue: 'Status' }),
            dataIndex: "isActive",
            key: "isActive",
            width: 100,
            render: (isActive) => (
                isActive ? (
                    <Tag color="green" icon={<CheckCircleOutlined />}>{t('employees.active', { defaultValue: 'Active' })}</Tag>
                ) : (
                    <Tag color="default">{t('employees.inactive', { defaultValue: 'Inactive' })}</Tag>
                )
            )
        },
        {
            title: t('settings.host', { defaultValue: 'Host' }),
            dataIndex: "host",
            key: "host",
        },
        {
            title: t('settings.port', { defaultValue: 'Port' }),
            dataIndex: "port",
            key: "port",
            width: 80
        },
        {
            title: t('settings.encryption', { defaultValue: 'Encryption' }),
            dataIndex: "encryption",
            key: "encryption",
            width: 100,
            render: (encryption) => <Tag>{encryption || "NONE"}</Tag>
        },
        {
            title: t('settings.fromEmail', { defaultValue: 'From Email' }),
            dataIndex: "fromEmail",
            key: "fromEmail",
        },
        {
            title: t('auth.username', { defaultValue: 'Username' }),
            dataIndex: "username",
            key: "username",
        },
        {
            title: t('employees.actions', { defaultValue: 'Actions' }),
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
                        {t('settings.test', { defaultValue: 'Test' })}
                    </Button>
                    <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />
                    <Popconfirm
                        title={t('settings.deleteConfigConfirm', { defaultValue: 'Delete this configuration?' })}
                        onConfirm={() => handleDelete(record.id)}
                        okText={t('employees.yes', { defaultValue: 'Yes' })}
                        cancelText={t('employees.no', { defaultValue: 'No' })}
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
                    <h3 className="text-lg font-semibold mb-1">{t('settings.emailConfig', { defaultValue: 'Email Configuration (SMTP)' })}</h3>
                    <p className="text-sm text-gray-500">{t('settings.emailConfigDesc', { defaultValue: 'Manage SMTP settings for sending emails from the system' })}</p>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                >
                    {t('settings.addConfig', { defaultValue: 'Add Configuration' })}
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
                        <div className="text-center py-8 text-gray-500">{t('pricing.loadingLaborRate', { defaultValue: 'Loading...' })}</div>
                    ) : configs.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">{t('settings.noConfigsFound', { defaultValue: 'No configurations found' })}</div>
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
                                        <span className="text-gray-500">{t('employees.status', { defaultValue: 'Status' })}:</span>
                                        <Tag color={config.isActive ? 'green' : 'red'}>
                                            {config.isActive ? t('employees.active', { defaultValue: 'Active' }) : t('employees.inactive', { defaultValue: 'Inactive' })}
                                        </Tag>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">{t('settings.host', { defaultValue: 'Host' })}:</span>
                                        <span className="text-gray-900 font-mono text-xs">{config.host}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">{t('settings.port', { defaultValue: 'Port' })}:</span>
                                        <span className="text-gray-900 font-bold">{config.port}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">{t('settings.encryption', { defaultValue: 'Encryption' })}:</span>
                                        <Tag>{config.encryption || "NONE"}</Tag>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">{t('settings.fromEmail', { defaultValue: 'From Email' })}:</span>
                                        <span className="text-gray-900 font-mono text-xs">{config.fromEmail}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">{t('auth.username', { defaultValue: 'Username' })}:</span>
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
                                        {t('settings.test', { defaultValue: 'Test' })}
                                    </Button>
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<EditOutlined />}
                                        onClick={() => handleEdit(config)}
                                        className="flex-1"
                                    >
                                        {t('employees.edit', { defaultValue: 'Edit' })}
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
                                            {t('employees.delete', { defaultValue: 'Delete' })}
                                        </Button>
                                    </Popconfirm>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            <Modal
                title={editingConfig ? t('settings.editConfig', { defaultValue: 'Edit SMTP Configuration' }) : t('settings.addConfig', { defaultValue: 'Add SMTP Configuration' })}
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
                        label={t('settings.smtpHost', { defaultValue: 'SMTP Host' })}
                        rules={[{ required: true, message: t('settings.enterHost', { defaultValue: 'Please enter SMTP host' }) }]}
                    >
                        <Input placeholder="smtp.gmail.com" />
                    </Form.Item>

                    <Form.Item
                        name="port"
                        label={t('settings.smtpPort', { defaultValue: 'SMTP Port' })}
                        rules={[{ required: true, message: t('settings.enterPort', { defaultValue: 'Please enter port' }) }]}
                    >
                        <InputNumber className="w-full" min={1} max={65535} />
                    </Form.Item>

                    <Form.Item
                        name="encryption"
                        label={t('settings.encryption', { defaultValue: 'Encryption' })}
                        rules={[{ required: true, message: t('settings.selectEncryption', { defaultValue: 'Please select encryption' }) }]}
                    >
                        <Select>
                            <Option value="TLS">TLS (Port 587)</Option>
                            <Option value="SSL">SSL (Port 465)</Option>
                            <Option value="NONE">{t('pricing.none', { defaultValue: 'None' })}</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="username"
                        label={t('settings.smtpUsername', { defaultValue: 'SMTP Username' })}
                        rules={[{ required: true, message: t('settings.enterUsername', { defaultValue: 'Please enter username' }) }]}
                    >
                        <Input placeholder="your-email@gmail.com" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label={t('settings.smtpPassword', { defaultValue: 'SMTP Password' })}
                        rules={[{ required: !editingConfig, message: t('settings.enterPassword', { defaultValue: 'Please enter password' }) }]}
                        extra={editingConfig ? t('settings.leaveBlankToKeep', { defaultValue: 'Leave blank to keep existing password' }) : ""}
                    >
                        <Input.Password placeholder="App password or SMTP password" />
                    </Form.Item>

                    <Form.Item
                        name="fromEmail"
                        label={t('settings.fromEmailAddress', { defaultValue: 'From Email Address' })}
                        rules={[
                            { required: true, message: t('settings.enterFromEmail', { defaultValue: 'Please enter from email' }) },
                            { type: "email", message: t('settings.enterValidEmail', { defaultValue: 'Please enter a valid email' }) }
                        ]}
                    >
                        <Input placeholder="noreply@yourcompany.com" />
                    </Form.Item>

                    <Form.Item
                        name="isActive"
                        label={t('settings.setActiveConfig', { defaultValue: 'Set as Active Configuration' })}
                        valuePropName="checked"
                    >
                        <Select>
                            <Option value={true}>{t('settings.yesUseDefault', { defaultValue: 'Yes - Use this as default' })}</Option>
                            <Option value={false}>{t('settings.noSaveLater', { defaultValue: 'No - Save for later' })}</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SmtpConfiguration;
