import React, { useState } from "react";
import { Modal, Form, Input, Button, message } from "antd";
import { sendServiceDocumentEmail } from "../../api/sendServiceDocumentEmail";
import { getActiveSmtpConfig } from "../../api/getActiveSmtpConfig";
import { useNavigate } from "react-router-dom";

const EmailDocumentModal = ({ visible, documentNumber, defaultEmail, onClose, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSend = async (values) => {
        setLoading(true);
        try {
            // Check if SMTP is configured
            const smtpConfig = await getActiveSmtpConfig();
            if (!smtpConfig) {
                Modal.warning({
                    title: 'SMTP Not Configured',
                    content: (
                        <div>
                            <p className="mb-3">Please configure your SMTP email settings before sending emails.</p>
                            <Button
                                type="primary"
                                onClick={() => {
                                    Modal.destroyAll();
                                    onClose();
                                    navigate('/profile', { state: { activeTab: 'smtp' } });
                                }}
                            >
                                Go to Email Settings
                            </Button>
                        </div>
                    ),
                    okText: 'Close'
                });
                setLoading(false);
                return;
            }

            await sendServiceDocumentEmail(documentNumber, values.email);
            message.success("Email sent successfully");
            if (onSuccess) onSuccess();
            onClose();
            form.resetFields();
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
            footer={null}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSend}
                initialValues={{ email: defaultEmail }}
            >
                <Form.Item
                    label="Recipient Email"
                    name="email"
                    rules={[
                        { required: true, message: "Please enter recipient email" },
                        { type: "email", message: "Please enter a valid email" }
                    ]}
                >
                    <Input placeholder="customer@example.com" />
                </Form.Item>

                <Form.Item>
                    <div className="flex gap-2 justify-end">
                        <Button onClick={onClose}>Cancel</Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Send Email
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EmailDocumentModal;
