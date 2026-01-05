import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Table, Button, Modal, Form, Input, InputNumber, Switch, Card, notification, Popconfirm, Tag, Tooltip, Empty } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, StarOutlined, StarFilled, ReloadOutlined } from "@ant-design/icons";
import { getTaxRates, createTaxRate, updateTaxRate, deleteTaxRate, setDefaultTaxRate } from "../../api/taxRateApi";

// US States list for dropdown
const US_STATES = [
    { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" }, { code: "AZ", name: "Arizona" },
    { code: "AR", name: "Arkansas" }, { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
    { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" }, { code: "FL", name: "Florida" },
    { code: "GA", name: "Georgia" }, { code: "HI", name: "Hawaii" }, { code: "ID", name: "Idaho" },
    { code: "IL", name: "Illinois" }, { code: "IN", name: "Indiana" }, { code: "IA", name: "Iowa" },
    { code: "KS", name: "Kansas" }, { code: "KY", name: "Kentucky" }, { code: "LA", name: "Louisiana" },
    { code: "ME", name: "Maine" }, { code: "MD", name: "Maryland" }, { code: "MA", name: "Massachusetts" },
    { code: "MI", name: "Michigan" }, { code: "MN", name: "Minnesota" }, { code: "MS", name: "Mississippi" },
    { code: "MO", name: "Missouri" }, { code: "MT", name: "Montana" }, { code: "NE", name: "Nebraska" },
    { code: "NV", name: "Nevada" }, { code: "NH", name: "New Hampshire" }, { code: "NJ", name: "New Jersey" },
    { code: "NM", name: "New Mexico" }, { code: "NY", name: "New York" }, { code: "NC", name: "North Carolina" },
    { code: "ND", name: "North Dakota" }, { code: "OH", name: "Ohio" }, { code: "OK", name: "Oklahoma" },
    { code: "OR", name: "Oregon" }, { code: "PA", name: "Pennsylvania" }, { code: "RI", name: "Rhode Island" },
    { code: "SC", name: "South Carolina" }, { code: "SD", name: "South Dakota" }, { code: "TN", name: "Tennessee" },
    { code: "TX", name: "Texas" }, { code: "UT", name: "Utah" }, { code: "VT", name: "Vermont" },
    { code: "VA", name: "Virginia" }, { code: "WA", name: "Washington" }, { code: "WV", name: "West Virginia" },
    { code: "WI", name: "Wisconsin" }, { code: "WY", name: "Wyoming" }, { code: "DC", name: "Washington D.C." }
];

const TaxRateConfiguration = () => {
    const queryClient = useQueryClient();
    // const [taxRates, setTaxRates] = useState([]); // Replaced by useQuery
    // const [loading, setLoading] = useState(true); // Replaced by useQuery
    const [modalVisible, setModalVisible] = useState(false);
    const [editingRate, setEditingRate] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm();

    const { data: taxRates = [], isLoading: loading, refetch: fetchTaxRates } = useQuery({
        queryKey: ['taxRates'],
        queryFn: async () => {
            const data = await getTaxRates();
            return Array.isArray(data) ? data : [];
        },
        onError: (error) => {
            console.error("Error fetching tax rates:", error);
            notification.error({ message: "Failed to fetch tax rates", description: error.message });
        }
    });

    const handleAdd = () => {
        setEditingRate(null);
        form.resetFields();
        form.setFieldsValue({ isActive: true, isDefault: false });
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingRate(record);
        form.setFieldsValue({
            stateCode: record.stateCode,
            stateName: record.stateName,
            taxPercent: record.taxPercent,
            isActive: record.isActive,
            isDefault: record.isDefault
        });
        setModalVisible(true);
    };

    const handleDelete = async (taxRateId) => {
        try {
            await deleteTaxRate(taxRateId);
            notification.success({ message: "Tax rate deleted successfully" });
            queryClient.invalidateQueries({ queryKey: ['taxRates'] });
        } catch (error) {
            notification.error({ message: "Failed to delete tax rate", description: error.message });
        }
    };

    const handleSetDefault = async (taxRateId) => {
        try {
            await setDefaultTaxRate(taxRateId);
            notification.success({ message: "Default tax rate updated" });
            queryClient.invalidateQueries({ queryKey: ['taxRates'] });
        } catch (error) {
            notification.error({ message: "Failed to set default", description: error.message });
        }
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);

            // Find state name from code if not provided
            if (!values.stateName && values.stateCode) {
                const state = US_STATES.find(s => s.code === values.stateCode);
                values.stateName = state?.name || values.stateCode;
            }

            if (editingRate) {
                await updateTaxRate(editingRate.taxRateId, values);
                notification.success({ message: "Tax rate updated successfully" });
            } else {
                await createTaxRate(values);
                notification.success({ message: "Tax rate created successfully" });
            }

            setModalVisible(false);
            queryClient.invalidateQueries({ queryKey: ['taxRates'] });
        } catch (error) {
            if (error.errorFields) return; // Form validation error
            notification.error({ message: "Failed to save tax rate", description: error.message });
        } finally {
            setSaving(false);
        }
    };

    const handleStateSelect = (stateCode) => {
        const state = US_STATES.find(s => s.code === stateCode);
        if (state) {
            form.setFieldsValue({
                stateCode: state.code,
                stateName: state.name
            });
        }
    };

    const columns = [
        {
            title: "State",
            key: "state",
            render: (_, record) => (
                <div className="flex items-center gap-2">
                    <span className="font-bold text-violet-600">{record.stateCode}</span>
                    <span className="text-gray-600">- {record.stateName}</span>
                    {record.isDefault && (
                        <Tag color="gold" icon={<StarFilled />}>Default</Tag>
                    )}
                </div>
            )
        },
        {
            title: "Tax Rate",
            dataIndex: "taxPercent",
            key: "taxPercent",
            render: (value) => (
                <span className="font-bold text-lg text-green-600">{value}%</span>
            )
        },
        {
            title: "Status",
            dataIndex: "isActive",
            key: "isActive",
            render: (isActive) => (
                <Tag color={isActive ? "green" : "default"}>
                    {isActive ? "Active" : "Inactive"}
                </Tag>
            )
        },
        {
            title: "Actions",
            key: "actions",
            width: 200,
            render: (_, record) => (
                <div className="flex gap-2">
                    {!record.isDefault && (
                        <Tooltip title="Set as Default">
                            <Button
                                type="text"
                                icon={<StarOutlined />}
                                onClick={() => handleSetDefault(record.taxRateId)}
                            />
                        </Tooltip>
                    )}
                    <Tooltip title="Edit">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Delete this tax rate?"
                        description="This action cannot be undone."
                        onConfirm={() => handleDelete(record.taxRateId)}
                        okText="Delete"
                        okType="danger"
                    >
                        <Tooltip title="Delete">
                            <Button type="text" danger icon={<DeleteOutlined />} />
                        </Tooltip>
                    </Popconfirm>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">State Tax Rates</h2>
                    <p className="text-gray-500 text-sm mt-1">Configure tax rates for different states</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        icon={<ReloadOutlined spin={loading} />}
                        onClick={fetchTaxRates}
                        disabled={loading}
                    />
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                    >
                        Add Tax Rate
                    </Button>
                </div>
            </div>

            <Card className="shadow-sm">
                {taxRates.length === 0 && !loading ? (
                    <Empty
                        description="No tax rates configured"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                            Add Your First Tax Rate
                        </Button>
                    </Empty>
                ) : (
                    <Table
                        columns={columns}
                        dataSource={taxRates}
                        rowKey="taxRateId"
                        loading={loading}
                        pagination={false}
                        size="middle"
                    />
                )}
            </Card>

            <div className="text-sm text-gray-500 bg-blue-50 p-4 rounded-lg">
                <p className="font-medium text-blue-700 mb-1">💡 Tip</p>
                <p>Set a default tax rate to have it automatically selected when creating new service documents. You can always override it on individual documents.</p>
            </div>

            <Modal
                title={editingRate ? "Edit Tax Rate" : "Add Tax Rate"}
                open={modalVisible}
                onOk={handleSave}
                onCancel={() => setModalVisible(false)}
                confirmLoading={saving}
                okText={editingRate ? "Update" : "Create"}
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="stateCode"
                            label="State Code"
                            rules={[
                                { required: true, message: "Required" },
                                { pattern: /^[A-Z]{2}$/, message: "Must be 2 uppercase letters" }
                            ]}
                        >
                            <Input
                                placeholder="e.g., CA"
                                maxLength={2}
                                onChange={(e) => {
                                    const value = e.target.value.toUpperCase();
                                    form.setFieldValue('stateCode', value);
                                    handleStateSelect(value);
                                }}
                                style={{ textTransform: 'uppercase' }}
                            />
                        </Form.Item>
                        <Form.Item
                            name="stateName"
                            label="State Name"
                            rules={[{ required: true, message: "Required" }]}
                        >
                            <Input placeholder="e.g., California" />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="taxPercent"
                        label="Tax Percentage"
                        rules={[
                            { required: true, message: "Required" },
                            { type: 'number', min: 0, max: 99.99, message: "Must be between 0 and 99.99" }
                        ]}
                    >
                        <InputNumber
                            placeholder="e.g., 8.25"
                            min={0}
                            max={99.99}
                            step={0.01}
                            precision={2}
                            addonAfter="%"
                            className="w-full"
                        />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                            name="isActive"
                            label="Active"
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>
                        <Form.Item
                            name="isDefault"
                            label="Set as Default"
                            valuePropName="checked"
                        >
                            <Switch />
                        </Form.Item>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default TaxRateConfiguration;
