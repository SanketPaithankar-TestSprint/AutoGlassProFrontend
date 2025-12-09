import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, DatePicker, InputNumber, Button, message } from "antd";
import { createServiceDocument } from "../../api/createServiceDocument";
import { getCustomers } from "../../api/getCustomers";
import { getValidToken } from "../../api/getValidToken";

const { Option } = Select;
const { TextArea } = Input;

const CreateServiceDocumentModal = ({ visible, onClose, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState([]);

    useEffect(() => {
        if (visible) {
            fetchCustomers();
        } else {
            form.resetFields();
        }
    }, [visible]);

    const fetchCustomers = async () => {
        try {
            const token = await getValidToken();
            const data = await getCustomers(token);
            // Handle different variations of customer API response if needed
            const customerList = Array.isArray(data) ? data : (data?.data || []);
            setCustomers(customerList);
        } catch (error) {
            console.error("Failed to fetch customers:", error);
            message.error("Failed to load customers");
        }
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            // Prepare payload matching ServiceDocumentRequest schema
            const payload = {
                ...values,
                // Ensure dates are formatted if needed, Antd DatePicker returns Moment/Dayjs
                documentDate: values.documentDate?.toISOString(),
                dueDate: values.dueDate?.toISOString(),
                scheduledDate: values.scheduledDate?.toISOString(),
                estimatedCompletion: values.estimatedCompletion?.toISOString(),
                customerId: values.customerId,
                vehicleId: values.vehicleId, // Assumes user might select this if we add logic, or backend handles it
                items: [] // Initialize with empty items, can add later
            };

            await createServiceDocument(payload);
            message.success("Service document created successfully");
            onSuccess();
            onClose();
        } catch (error) {
            message.error("Failed to create service document: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Create Service Document"
            open={visible}
            onCancel={onClose}
            onOk={() => form.submit()}
            confirmLoading={loading}
            width={800}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    documentType: "quote",
                    taxRate: 0
                }}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item
                        name="customerId"
                        label="Customer"
                        rules={[{ required: true, message: "Please select a customer" }]}
                    >
                        <Select
                            showSearch
                            placeholder="Select a customer"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={customers.map(c => ({
                                label: `${c.firstName} ${c.lastName} (${c.email || c.phone})`,
                                value: c.customerId
                            }))}
                        />
                    </Form.Item>

                    <Form.Item
                        name="documentType"
                        label="Document Type"
                        rules={[{ required: true, message: "Please select type" }]}
                    >
                        <Select>
                            <Option value="quote">Quote</Option>
                            <Option value="work_order">Work Order</Option>
                            <Option value="invoice">Invoice</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="documentDate" label="Document Date">
                        <DatePicker className="w-full" showTime />
                    </Form.Item>

                    <Form.Item name="dueDate" label="Due Date">
                        <DatePicker className="w-full" showTime />
                    </Form.Item>

                    <Form.Item name="serviceLocation" label="Service Location">
                        <Input placeholder="e.g. Shop, Mobile" />
                    </Form.Item>

                    <Form.Item name="paymentTerms" label="Payment Terms">
                        <Input placeholder="e.g. Due on Receipt, Net 30" />
                    </Form.Item>

                    <Form.Item name="taxRate" label="Tax Rate (%)">
                        <InputNumber min={0} max={100} className="w-full" />
                    </Form.Item>
                </div>

                <Form.Item name="notes" label="Notes">
                    <TextArea rows={3} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateServiceDocumentModal;
