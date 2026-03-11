import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Input, Button, Steps, notification, Alert } from 'antd';
import { MailOutlined, LockOutlined, SafetyOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { requestPasswordResetOtp, resetPasswordWithOtp } from '../api/password';

const { Step } = Steps;

// Reusable styling to match login.jsx
const formItemStyle = {
    marginBottom: '20px'
};

const customInputStyle = `
  .custom-api-input .ant-input, .custom-api-input .ant-input-password .ant-input {
      border-color: #e2e8f0;
      border-width: 1.5px;
      padding: 10px 14px;
      border-radius: 8px;
  }
  .custom-api-input .ant-input:hover, .custom-api-input .ant-input-password:hover .ant-input {
      border-color: #7E5CFE;
  }
  .custom-api-input .ant-input:focus, .custom-api-input.ant-input-affix-wrapper-focused {
      border-color: #7E5CFE;
      box-shadow: 0 0 0 3px rgba(126, 92, 254, 0.2);
  }
  .custom-api-input.ant-input-affix-wrapper {
      padding: 10px 14px;
      border-radius: 8px;
      border-color: #e2e8f0;
      border-width: 1.5px;
  }
  .custom-api-input.ant-input-affix-wrapper:hover {
      border-color: #7E5CFE;
  }
  .custom-api-input.ant-input-affix-wrapper-focused {
       border-color: #7E5CFE;
       box-shadow: 0 0 0 3px rgba(126, 92, 254, 0.2);
  }
`;

export default function ForgotPasswordForm({ onBackToLogin, onSuccess }) {
    const { t } = useTranslation();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const [form] = Form.useForm();

    const handleEmailSubmit = async (values) => {
        setLoading(true);
        setError(null);
        try {
            const res = await requestPasswordResetOtp(values.email);
            if (res && (res.success || res.status === 200 || res.message === "OTP sent successfully")) {
                setEmail(values.email);
                notification.success({
                    message: "OTP Sent",
                    description: res.message || "Please check your email for the OTP.",
                    placement: "topRight",
                });
                setCurrentStep(1);
            } else {
                setError(res.message || "Failed to send OTP. Please try again.");
            }
        } catch (error) {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetSubmit = async (values) => {
        setLoading(true);
        setError(null);
        try {
            const res = await resetPasswordWithOtp(email, values.otp, values.newPassword);
            if (res && (res.success || res.status === 200)) {
                notification.success({
                    message: "Password Reset Successful",
                    description: "You can now sign in with your new password.",
                    placement: "topRight",
                });
                if (onSuccess) onSuccess();
            } else {
                setError(res.message || "Failed to reset password. Invalid OTP or other error.");
            }
        } catch (error) {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '0px 0' }}>
            <style>{customInputStyle}</style>

            <div className="mb-6">
                <Button
                    type="text"
                    icon={<ArrowLeftOutlined />}
                    onClick={onBackToLogin}
                    className="text-slate-500 hover:text-violet-600 pl-0"
                >
                    {t('auth.login')}
                </Button>
            </div>

            {error && (
                <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                    closable
                    onClose={() => setError(null)}
                    style={{ marginBottom: '20px', borderRadius: '8px' }}
                />
            )}

            <Steps current={currentStep} size="small" className="mb-8" items={[
                { title: t('auth.email') },
                { title: t('auth.resetPassword') },
            ]} />

            {currentStep === 0 && (
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleEmailSubmit}
                    size="large"
                    requiredMark={false}
                >
                    <p className="mb-6 text-slate-500 text-sm">Enter your registered email address to receive a One-Time Password (OTP).</p>
                    <Form.Item
                        name="email"
                        label={t('auth.email')}
                        rules={[
                            { required: true, message: 'Please input your email!' },
                            { type: 'email', message: 'Please enter a valid email!' }
                        ]}
                        style={formItemStyle}
                    >
                        <Input
                            prefix={<MailOutlined style={{ color: '#a0aec0' }} />}
                            placeholder="john@example.com"
                            className="custom-api-input"
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={loading}
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none',
                                height: '50px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                borderRadius: '12px',
                                boxShadow: '0 4px 14px 0 rgba(118, 75, 162, 0.39)'
                            }}
                        >
                            Send OTP
                        </Button>
                    </Form.Item>
                </Form>
            )}

            {currentStep === 1 && (
                <Form
                    layout="vertical"
                    onFinish={handleResetSubmit}
                    size="large"
                    requiredMark={false}
                >
                    <p className="mb-6 text-slate-500 text-sm">
                        Enter the OTP sent to <strong>{email}</strong> and your new password.
                    </p>
                    <Form.Item
                        name="otp"
                        label="OTP"
                        rules={[{ required: true, message: 'Please enter the OTP!' }]}
                        style={formItemStyle}
                    >
                        <Input
                            prefix={<SafetyOutlined style={{ color: '#a0aec0' }} />}
                            placeholder="Enter OTP"
                            className="custom-api-input"
                        />
                    </Form.Item>
                    <Form.Item
                        name="newPassword"
                        label={t('auth.password')}
                        rules={[
                            { required: true, message: 'Please enter your new password!' },
                            { min: 6, message: 'Password must be at least 6 characters.' }
                        ]}
                        style={formItemStyle}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{ color: '#a0aec0' }} />}
                            placeholder="New Password"
                            className="custom-api-input"
                        />
                    </Form.Item>
                    <Form.Item
                        name="confirmPassword"
                        label={t('auth.confirmPassword')}
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
                        style={formItemStyle}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{ color: '#a0aec0' }} />}
                            placeholder="Confirm New Password"
                            className="custom-api-input"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={loading}
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none',
                                height: '50px',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                borderRadius: '12px',
                                boxShadow: '0 4px 14px 0 rgba(118, 75, 162, 0.39)'
                            }}
                        >
                            {t('auth.resetPassword')}
                        </Button>
                    </Form.Item>
                </Form>
            )}
        </div>
    );
};
