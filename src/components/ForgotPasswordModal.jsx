import React, { useState } from 'react';
import { Modal, Form, Input, Button, Steps, notification } from 'antd';
import { MailOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { requestPasswordResetOtp, resetPasswordWithOtp } from '../api/password';

const { Step } = Steps;

const ForgotPasswordModal = ({ visible, onCancel }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [form] = Form.useForm();

    const handleEmailSubmit = async (values) => {
        setLoading(true);
        try {
            const res = await requestPasswordResetOtp(values.email);
            // Assuming successful response structure; adjust if needed based on API behavior
            if (res && (res.success || res.status === 200 || res.message === "OTP sent successfully")) {
                setEmail(values.email);
                notification.success({
                    message: "OTP Sent",
                    description: res.message || "Please check your email for the OTP.",
                });
                setCurrentStep(1);
            } else {
                notification.error({
                    message: "Request Failed",
                    description: res.message || "Failed to send OTP. Please try again.",
                });
            }
        } catch (error) {
            notification.error({
                message: "Error",
                description: "An unexpected error occurred. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleResetSubmit = async (values) => {
        setLoading(true);
        try {
            const res = await resetPasswordWithOtp(email, values.otp, values.newPassword);
            if (res && (res.success || res.status === 200)) {
                notification.success({
                    message: "Password Reset Successful",
                    description: "You can now sign in with your new password.",
                });
                onCancel();
                // Reset state after closing
                setTimeout(() => {
                    setCurrentStep(0);
                    form.resetFields();
                    setEmail('');
                }, 500);
            } else {
                notification.error({
                    message: "Reset Failed",
                    description: res.message || "Failed to reset password. Invalid OTP or other error.",
                });
            }
        } catch (error) {
            notification.error({
                message: "Error",
                description: "An unexpected error occurred. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        onCancel();
        // Reset state when closed
        setTimeout(() => {
            setCurrentStep(0);
            form.resetFields();
            setEmail('');
        }, 500);
    };

    return (
        <Modal
            title="Reset Password"
            open={visible}
            onCancel={handleCancel}
            footer={null}
            destroyOnClose
            maskClosable={false}
            centered
        >
            <Steps current={currentStep} size="small" style={{ marginBottom: 24 }}>
                <Step title="Email" />
                <Step title="Reset" />
            </Steps>

            {currentStep === 0 && (
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleEmailSubmit}
                    initialValues={{ email: email }}
                >
                    <p className="mb-4 text-slate-500">Enter your registered email address to receive an OTP.</p>
                    <Form.Item
                        name="email"
                        label="Email Address"
                        rules={[
                            { required: true, message: 'Please input your email!' },
                            { type: 'email', message: 'Please enter a valid email!' }
                        ]}
                    >
                        <Input prefix={<MailOutlined />} placeholder="john@example.com" size="large" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block size="large" loading={loading}>
                            Send OTP
                        </Button>
                    </Form.Item>
                </Form>
            )}

            {currentStep === 1 && (
                <Form
                    layout="vertical"
                    onFinish={handleResetSubmit}
                >
                    <p className="mb-4 text-slate-500">
                        Enter the OTP sent to <strong>{email}</strong> and your new password.
                    </p>
                    <Form.Item
                        name="otp"
                        label="OTP"
                        rules={[{ required: true, message: 'Please enter the OTP!' }]}
                    >
                        <Input prefix={<SafetyOutlined />} placeholder="Enter OTP" size="large" />
                    </Form.Item>
                    <Form.Item
                        name="newPassword"
                        label="New Password"
                        rules={[
                            { required: true, message: 'Please enter your new password!' },
                            { min: 6, message: 'Password must be at least 6 characters.' }
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="New Password" size="large" />
                    </Form.Item>
                    <Form.Item
                        name="confirmPassword"
                        label="Confirm New Password"
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: 'Please confirm your new password!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('The two passwords do not match!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Confirm New Password" size="large" />
                    </Form.Item>

                    <div className="flex gap-2">
                        <Button onClick={() => setCurrentStep(0)} block size="large">
                            Back
                        </Button>
                        <Button type="primary" htmlType="submit" block size="large" loading={loading} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}>
                            Reset Password
                        </Button>
                    </div>
                </Form>
            )}
        </Modal>
    );
};

export default ForgotPasswordModal;
