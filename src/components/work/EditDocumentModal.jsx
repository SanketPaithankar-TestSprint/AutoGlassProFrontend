import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, DatePicker, InputNumber, Button, message, Table, Popconfirm } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { updateServiceDocument } from "../../api/updateServiceDocument";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;

const EditDocumentModal = ({ visible, onClose, document, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (visible && document) {
            // Initialize form with document data
            form.setFieldsValue({
                documentType: document.documentType?.toLowerCase(),
                status: document.status?.toLowerCase(),
                serviceLocation: document.serviceLocation,
                paymentTerms: document.paymentTerms,
                notes: document.notes,
                taxRate: document.taxRate || 0,
                discountAmount: document.discountAmount || 0,
                documentDate: document.documentDate ? dayjs(document.documentDate) : null,
                scheduledDate: document.scheduledDate ? dayjs(document.scheduledDate) : null,
                estimatedCompletion: document.estimatedCompletion ? dayjs(document.estimatedCompletion) : null,
                dueDate: document.dueDate ? dayjs(document.dueDate) : null
            });

            // Initialize items
            const mappedItems = (document.items || []).map((item, idx) => ({
                key: idx,
                nagsGlassId: item.nagsGlassId || "",
                partDescription: item.partDescription || "",
                partPrice: item.partPrice || 0,
                laborHours: item.laborHours || 0,
                quantity: item.quantity || 1
            }));
            setItems(mappedItems);
        } else {
            form.resetFields();
            setItems([]);
        }
    }, [visible, document]);

    const handleAddItem = () => {
        const newItem = {
            key: items.length,
            nagsGlassId: "",
            partDescription: "",
            partPrice: 0,
            laborHours: 0,
            quantity: 1
        };
        setItems([...items, newItem]);
    };

    const handleDeleteItem = (key) => {
        setItems(items.filter(item => item.key !== key));
    };

    const handleItemChange = (key, field, value) => {
        setItems(items.map(item =>
            item.key === key ? { ...item, [field]: value } : item
        ));
    };

    const calculateTotals = () => {
        const subtotal = items.reduce((sum, item) =>
            sum + (Number(item.partPrice) || 0) * (Number(item.quantity) || 0), 0
        );
        const laborAmount = items.reduce((sum, item) =>
            sum + (Number(item.laborHours) || 0) * 65, 0
        ); // $65 per hour - should come from profile
        const taxRate = form.getFieldValue('taxRate') || 0;
        const discountAmount = form.getFieldValue('discountAmount') || 0;
        const taxAmount = subtotal * (taxRate / 100);
        const total = subtotal + laborAmount + taxAmount - discountAmount;

        return { subtotal, laborAmount, taxAmount, total };
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const { subtotal, laborAmount } = calculateTotals();

            const payload = {
                documentType: values.documentType,
                status: values.status,
                customerId: document.customerId,
                vehicleId: document.vehicleId,
                employeeId: document.employeeId || 0,
                serviceLocation: values.serviceLocation || "mobile",
                serviceAddress: document.serviceAddress || "",
                documentDate: values.documentDate?.toISOString(),
                scheduledDate: values.scheduledDate?.toISOString(),
                estimatedCompletion: values.estimatedCompletion?.toISOString(),
                dueDate: values.dueDate?.format('YYYY-MM-DD'),
                paymentTerms: values.paymentTerms || "Due upon receipt",
                notes: values.notes || "",
                termsConditions: document.termsConditions || "Warranty valid for 12 months on workmanship.",
                taxRate: Number(values.taxRate) || 0,
                discountAmount: Number(values.discountAmount) || 0,
                laborAmount: laborAmount,
                items: items.map(item => ({
                    nagsGlassId: item.nagsGlassId || "MISC",
                    partDescription: item.partDescription || "",
                    partPrice: Number(item.partPrice) || 0,
                    laborHours: Number(item.laborHours) || 0,
                    quantity: Number(item.quantity) || 1,
                    prefixCd: "",
                    posCd: "",
                    sideCd: ""
                }))
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

    const columns = [
        {
            title: 'NAGS ID',
            dataIndex: 'nagsGlassId',
            width: 120,
            render: (text, record) => (
                <Input
                    value={text}
                    onChange={(e) => handleItemChange(record.key, 'nagsGlassId', e.target.value)}
                    placeholder="NAGS ID"
                />
            )
        },
        {
            title: 'Description',
            dataIndex: 'partDescription',
            render: (text, record) => (
                <Input
                    value={text}
                    onChange={(e) => handleItemChange(record.key, 'partDescription', e.target.value)}
                    placeholder="Part description"
                />
            )
        },
        {
            title: 'Price',
            dataIndex: 'partPrice',
            width: 100,
            render: (text, record) => (
                <InputNumber
                    value={text}
                    onChange={(value) => handleItemChange(record.key, 'partPrice', value)}
                    prefix="$"
                    min={0}
                    precision={2}
                    className="w-full"
                />
            )
        },
        {
            title: 'Labor (Hrs)',
            dataIndex: 'laborHours',
            width: 100,
            render: (text, record) => (
                <InputNumber
                    value={text}
                    onChange={(value) => handleItemChange(record.key, 'laborHours', value)}
                    min={0}
                    precision={2}
                    step={0.5}
                    className="w-full"
                />
            )
        },
        {
            title: 'Qty',
            dataIndex: 'quantity',
            width: 80,
            render: (text, record) => (
                <InputNumber
                    value={text}
                    onChange={(value) => handleItemChange(record.key, 'quantity', value)}
                    min={1}
                    className="w-full"
                />
            )
        },
        {
            title: 'Total',
            width: 100,
            render: (_, record) => {
                const total = (Number(record.partPrice) || 0) * (Number(record.quantity) || 1);
                return `$${total.toFixed(2)}`;
            }
        },
        {
            title: '',
            width: 60,
            render: (_, record) => (
                <Popconfirm
                    title="Delete this item?"
                    onConfirm={() => handleDeleteItem(record.key)}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button type="text" danger icon={<DeleteOutlined />} size="small" />
                </Popconfirm>
            )
        }
    ];

    const totals = calculateTotals();

    return (
        <Modal
            title={`Edit Document: ${document?.documentNumber || ''}`}
            open={visible}
            onCancel={onClose}
            onOk={() => form.submit()}
            confirmLoading={loading}
            width={1000}
            style={{ top: 20 }}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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

                    <Form.Item
                        name="status"
                        label="Status"
                        rules={[{ required: true, message: "Please select status" }]}
                    >
                        <Select>
                            <Option value="pending">Pending</Option>
                            <Option value="accepted">Accepted</Option>
                            <Option value="in_progress">In Progress</Option>
                            <Option value="completed">Completed</Option>
                            <Option value="cancelled">Cancelled</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="documentDate" label="Document Date">
                        <DatePicker className="w-full" showTime />
                    </Form.Item>

                    <Form.Item name="scheduledDate" label="Scheduled Date">
                        <DatePicker className="w-full" showTime />
                    </Form.Item>

                    <Form.Item name="estimatedCompletion" label="Estimated Completion">
                        <DatePicker className="w-full" showTime />
                    </Form.Item>

                    <Form.Item name="dueDate" label="Due Date">
                        <DatePicker className="w-full" />
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

                    <Form.Item name="discountAmount" label="Discount Amount ($)">
                        <InputNumber min={0} precision={2} prefix="$" className="w-full" />
                    </Form.Item>
                </div>

                <Form.Item name="notes" label="Notes">
                    <TextArea rows={2} />
                </Form.Item>

                <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-base font-semibold">Items</h3>
                        <Button type="dashed" onClick={handleAddItem} icon={<PlusOutlined />}>
                            Add Item
                        </Button>
                    </div>
                    <Table
                        dataSource={items}
                        columns={columns}
                        pagination={false}
                        size="small"
                        bordered
                    />
                </div>

                <div className="bg-gray-50 p-4 rounded border">
                    <div className="flex justify-between mb-2 text-sm">
                        <span>Subtotal:</span>
                        <span className="font-medium">${totals.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2 text-sm">
                        <span>Labor:</span>
                        <span className="font-medium">${totals.laborAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2 text-sm">
                        <span>Tax:</span>
                        <span className="font-medium">${totals.taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t text-base font-bold">
                        <span>Total:</span>
                        <span>${totals.total.toFixed(2)}</span>
                    </div>
                </div>
            </Form>
        </Modal>
    );
};

export default EditDocumentModal;
