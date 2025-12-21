import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, DatePicker, InputNumber, Button, message } from "antd";
import { updateServiceDocument } from "../../api/updateServiceDocument";
import { getEmployees } from "../../api/getEmployees";
import { getValidToken } from "../../api/getValidToken";
import { getActiveTaxRates } from "../../api/taxRateApi";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;

const EditDocumentModal = ({ visible, onClose, document, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [taxRates, setTaxRates] = useState([]);

    useEffect(() => {
        if (visible && document) {
            // Fetch employees and tax rates
            const fetchData = async () => {
                const token = getValidToken();
                try {
                    if (token) {
                        const [emps, rates] = await Promise.all([
                            getEmployees(token),
                            getActiveTaxRates()
                        ]);
                        setEmployees(emps);
                        setTaxRates(Array.isArray(rates) ? rates : []);
                    }
                } catch (error) {
                    console.error("Failed to fetch reference data:", error);
                }
            };
            fetchData();

            // Initialize form with document data
            form.setFieldsValue({
                serviceLocation: document.serviceLocation,
                serviceAddress: document.serviceAddress,
                paymentTerms: document.paymentTerms,
                notes: document.notes,
                termsConditions: document.termsConditions,
                taxRate: document.taxRate || 0,
                discountAmount: document.discountAmount || 0,
                employeeId: document.employeeId,
                documentDate: document.documentDate ? dayjs(document.documentDate) : null,
                scheduledDate: document.scheduledDate ? dayjs(document.scheduledDate) : null,
                estimatedCompletion: document.estimatedCompletion ? dayjs(document.estimatedCompletion) : null,
                dueDate: document.dueDate ? dayjs(document.dueDate) : null
            });
        } else {
            form.resetFields();
            setEmployees([]);
        }
    }, [visible, document, form]);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            // Preserve existing structure for non-editable fields
            // We only update what the user is allowed to change
            const payload = {
                ...document, // Base on existing document to keep IDs, items, etc.

                // Overwrite with editable fields
                serviceLocation: values.serviceLocation,
                serviceAddress: values.serviceAddress,
                documentDate: values.documentDate?.toISOString(),
                scheduledDate: values.scheduledDate?.toISOString(),
                estimatedCompletion: values.estimatedCompletion?.toISOString(),
                dueDate: values.dueDate?.format('YYYY-MM-DD'),
                paymentTerms: values.paymentTerms,
                notes: values.notes || "",
                termsConditions: values.termsConditions || "",
                taxRate: Number(values.taxRate) || 0,
                discountAmount: Number(values.discountAmount) || 0,
                employeeId: values.employeeId || 0,

                // Explicitly preserve items and totals (backend might recalculate total based on tax/discount)
                items: document.items,
                laborAmount: document.laborAmount,
                // Ensure statuses don't accidentally revert if not in form
                status: document.status,
                documentType: document.documentType
            };

            await updateServiceDocument(document.documentNumber, payload);
            message.success("Document updated successfully");
            onSuccess();
            onClose();
        } catch (error) {
            message.error("Failed to update document: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={`Edit Document: ${document?.documentNumber || ''}`}
            open={visible}
            onCancel={onClose}
            onOk={() => form.submit()}
            confirmLoading={loading}
            width={700}
            centered
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Dates */}
                    <Form.Item name="documentDate" label="Document Date">
                        <DatePicker className="w-full" showTime />
                    </Form.Item>

                    <Form.Item name="scheduledDate" label="Scheduled Date">
                        <DatePicker className="w-full" showTime />
                    </Form.Item>

                    <Form.Item name="estimatedCompletion" label="Est. Completion">
                        <DatePicker className="w-full" showTime />
                    </Form.Item>

                    <Form.Item name="dueDate" label="Due Date">
                        <DatePicker className="w-full" />
                    </Form.Item>

                    {/* Location & Address */}
                    <Form.Item name="serviceLocation" label="Service Location">
                        <Select placeholder="Select location">
                            <Option value="SHOP">Shop</Option>
                            <Option value="MOBILE">Mobile</Option>
                            <Option value="CUSTOMER_LOCATION">Customer Location</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="serviceAddress" label="Service Address">
                        <Input placeholder="Full address for service" />
                    </Form.Item>

                    {/* Financials & Terms */}
                    <Form.Item name="paymentTerms" label="Payment Terms">
                        <Input placeholder="e.g. Due on Receipt" />
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

                    <Form.Item name="discountAmount" label="Discount Amount ($)">
                        <InputNumber min={0} precision={2} prefix="$" className="w-full" />
                    </Form.Item>

                    {/* Employee Assignment */}
                    <Form.Item name="employeeId" label="Assigned Employee">
                        <Select placeholder="Select an employee" allowClear>
                            {employees.map(emp => (
                                <Option key={emp.employeeId} value={emp.employeeId}>
                                    {emp.firstName} {emp.lastName}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </div>

                <Form.Item name="notes" label="Notes">
                    <TextArea rows={2} placeholder="Internal notes or customer comments" />
                </Form.Item>

                <Form.Item name="termsConditions" label="Terms & Conditions">
                    <TextArea rows={2} placeholder="Warranty info, etc." />
                </Form.Item>

                <div className="bg-blue-50 p-3 rounded text-xs text-blue-700 border border-blue-200 mt-2">
                    <strong>Note:</strong> To modify line items, glass parts, or labor details, please use the specific item management tools. Totals will be automatically recalculated based on your changes here (e.g. tax rate).
                </div>
            </Form>
        </Modal>
    );
};

export default EditDocumentModal;
