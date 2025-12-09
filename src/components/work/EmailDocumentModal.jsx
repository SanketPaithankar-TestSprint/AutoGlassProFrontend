import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, message } from "antd";
import { sendServiceDocumentEmail } from "../../api/sendServiceDocumentEmail";

const EmailDocumentModal = ({ visible, onClose, documentId, defaultEmail, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && defaultEmail) {
            form.setFieldsValue({ email: defaultEmail });
        }
    }, [visible, defaultEmail]);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            await sendServiceDocumentEmail(documentId, values.email);
            message.success("Email sent successfully");
            onSuccess();
            onClose();
        } catch (error) {
            message.error("Failed to send email: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Send Document via Email"
            open={visible}
            onCancel={onClose}
            onOk={() => form.submit()}
            confirmLoading={loading}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <Form.Item
                    name="email"
                    label="Recipient Email"
                    rules={[
                        { required: true, message: "Please enter email" },
                        { type: 'email', message: "Please enter a valid email" }
                    ]}
                >
                    <Input placeholder="customer@example.com" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EmailDocumentModal;
