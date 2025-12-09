import React, { useState } from "react";
import { Modal, Form, InputNumber, Button, message } from "antd";
import { recordServiceDocumentPayment } from "../../api/recordServiceDocumentPayment";

const PaymentModal = ({ visible, onClose, documentId, balanceDue, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            await recordServiceDocumentPayment(documentId, values.amount);
            message.success("Payment recorded successfully");
            onSuccess();
            onClose();
        } catch (error) {
            message.error("Failed to record payment: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Record Payment"
            open={visible}
            onCancel={onClose}
            onOk={() => form.submit()}
            confirmLoading={loading}
        >
            <div className="mb-4 p-3 bg-amber-50 rounded border border-amber-200">
                <span className="text-amber-800 font-medium">Balance Due: </span>
                <span className="text-amber-800 font-bold">${balanceDue?.toFixed(2)}</span>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{ amount: balanceDue }}
            >
                <Form.Item
                    name="amount"
                    label="Payment Amount"
                    rules={[
                        { required: true, message: "Please enter amount" },
                        { type: 'number', min: 0.01, message: "Amount must be greater than 0" }
                    ]}
                >
                    <InputNumber
                        className="w-full"
                        prefix="$"
                        placeholder="0.00"
                        precision={2}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default PaymentModal;
