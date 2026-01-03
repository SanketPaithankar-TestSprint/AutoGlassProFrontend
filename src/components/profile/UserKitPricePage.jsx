import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, notification, Table } from "antd";
import { DollarOutlined, SaveOutlined } from "@ant-design/icons";
import { createUserKitPrice, getUserKitPrices } from "../../api/userKitPrices";

const UserKitPricePage = () => {
    const [form] = Form.useForm();
    const [saving, setSaving] = useState(false);
    const [kitPrices, setKitPrices] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchKitPrices = async () => {
        setLoading(true);
        try {
            const data = await getUserKitPrices();
            setKitPrices(data);
            localStorage.setItem("user_kit_prices", JSON.stringify(data));
        } catch (error) {
            console.error("Error fetching kit prices:", error);
            notification.error({
                message: "Failed to fetch kit prices",
                description: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKitPrices();
    }, []);

    const onFinish = async (values) => {
        setSaving(true);
        try {
            await createUserKitPrice({
                kitCode: values.kitCode,
                kitPrice: parseFloat(values.kitPrice)
            });
            notification.success({ message: "User kit price created successfully" });
            form.resetFields();
            fetchKitPrices(); // Refresh the list
        } catch (error) {
            console.error("Error creating user kit price:", error);
            notification.error({
                message: "Failed to create user kit price",
                description: error.message
            });
        } finally {
            setSaving(false);
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Kit Code',
            dataIndex: 'kitCode',
            key: 'kitCode',
        },
        {
            title: 'Kit Price',
            dataIndex: 'kitPrice',
            key: 'kitPrice',
            render: (price) => `$${price.toFixed(2)}`
        },
    ];

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">User Kit Price</h2>
            </div>

            <Card className="shadow-sm">
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <DollarOutlined className="text-3xl text-violet-600" />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Create Kit Price</h3>
                            <p className="text-sm text-gray-500">Set specific prices for kits</p>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6">
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Form.Item
                                    name="kitCode"
                                    label="Kit Code"
                                    rules={[{ required: true, message: 'Please enter kit code' }]}
                                >
                                    <Input placeholder="Enter kit code" size="large" />
                                </Form.Item>

                                <Form.Item
                                    name="kitPrice"
                                    label="Kit Price"
                                    rules={[{ required: true, message: 'Please enter kit price' }]}
                                >
                                    <Input
                                        type="number"
                                        prefix="$"
                                        placeholder="0.00"
                                        size="large"
                                        step={0.01}
                                    />
                                </Form.Item>
                            </div>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    icon={<SaveOutlined />}
                                    loading={saving}
                                    size="large"
                                >
                                    Create Price
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                </div>
            </Card>

            <Card className="shadow-sm">
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <DollarOutlined className="text-2xl text-violet-600" />
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Existing Kit Prices</h3>
                            <p className="text-sm text-gray-500">List of all configured kit prices</p>
                        </div>
                    </div>
                    <Table
                        dataSource={kitPrices}
                        columns={columns}
                        rowKey="id"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                    />
                </div>
            </Card>
        </div>
    );
};

export default UserKitPricePage;
