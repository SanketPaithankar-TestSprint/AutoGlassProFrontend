import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, DatePicker, InputNumber, Button, message } from "antd";
import { createServiceDocument } from "../../api/createServiceDocument";
import { getCustomers } from "../../api/getCustomers";
import { getValidToken } from "../../api/getValidToken";
import { getActiveTaxRates, getDefaultTaxRate } from "../../api/taxRateApi";

const { Option } = Select;
const { TextArea } = Input;

const CreateServiceDocumentModal = ({ visible, onClose, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [taxRates, setTaxRates] = useState([]);

    useEffect(() => {
        if (visible) {
            fetchInitialData();
        } else {
            form.resetFields();
        }
    }, [visible]);

    const fetchInitialData = async () => {
        try {
            const token = await getValidToken();
            const [customersData, ratesData, defaultRate] = await Promise.all([
                getCustomers(token),
                getActiveTaxRates().catch(() => []),
                getDefaultTaxRate().catch(() => null)
            ]);

            // Handle customers
            const customerList = Array.isArray(customersData) ? customersData : (customersData?.data || []);
            setCustomers(customerList);

            // Handle tax rates
            setTaxRates(Array.isArray(ratesData) ? ratesData : []);

            // Set default tax rate if not already set by form interaction
            if (defaultRate && defaultRate.taxPercent) {
                form.setFieldsValue({ taxRate: defaultRate.taxPercent });
            }
        } catch (error) {
            console.error("Failed to fetch initial data:", error);
            message.error("Failed to load data");
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
                        <Select placeholder="Select location">
                            <Option value="SHOP">Shop</Option>
                            <Option value="MOBILE">Mobile</Option>
                            <Option value="CUSTOMER_LOCATION">Customer Location</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="paymentTerms" label="Payment Terms">
                        <Input placeholder="e.g. Due on Receipt, Net 30" />
                    </Form.Item>

                    <Form.Item name="taxRate" label="Tax Rate">
                        <Select placeholder="Select Tax Rate">
                            {taxRates.map(rate => (
                                <Option key={rate.taxRateId} value={rate.taxPercent}>
                                    {rate.stateName || rate.stateCode} ({rate.taxPercent}%)
                                </Option>
                            ))}
                            <Option value={0}>No Tax (0%)</Option>
                        </Select>
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
