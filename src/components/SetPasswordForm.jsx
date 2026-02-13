import React, { useState } from 'react';
import {
    Form,
    Input,
    Button,
    Alert,
    notification,
    Space
} from 'antd';
import {
    LockOutlined
} from '@ant-design/icons';
import axios from 'axios';
import urls from '../config';

const formItemStyle = {
    marginBottom: '16px'
};

const customInputStyle = `
  .custom-api-input .ant-input, 
  .custom-api-input .ant-input-password .ant-input {
      border-color: #e2e8f0 !important;
      border-width: 1.5px !important;
      border-radius: 8px !important;
      padding: 6px 11px !important;
      height: 40px !important;
      line-height: 28px !important;
      display: flex !important;
      align-items: center !important;
  }
  .custom-api-input .ant-input::placeholder,
  .custom-api-input .ant-input-password .ant-input::placeholder {
      line-height: 28px !important;
      vertical-align: middle !important;
  }
  .custom-api-input .ant-input-prefix {
      margin-right: 8px !important;
      display: flex !important;
      align-items: center !important;
  }
  .custom-api-input .ant-input:hover, 
  .custom-api-input .ant-input-password:hover .ant-input {
      border-color: #7E5CFE !important;
  }
  .custom-api-input .ant-input:focus, 
  .custom-api-input.ant-input-affix-wrapper-focused {
      border-color: #7E5CFE !important;
      box-shadow: 0 0 0 3px rgba(126, 92, 254, 0.2) !important;
  }
  .custom-api-input.ant-input-affix-wrapper {
      padding: 6px 11px !important;
      border-radius: 8px;
      border-color: #e2e8f0;
      border-width: 1.5px;
      height: 40px !important;
      display: flex !important;
      align-items: center !important;
  }
  .custom-api-input.ant-input-affix-wrapper:hover {
      border-color: #7E5CFE;
  }
  .custom-api-input.ant-input-affix-wrapper-focused {
       border-color: #7E5CFE;
       box-shadow: 0 0 0 3px rgba(126, 92, 254, 0.2);
  }
  .custom-api-input.ant-input-password {
      height: 40px !important;
  }
  .custom-api-input .ant-input-password-icon {
      display: flex !important;
      align-items: center !important;
  }
`;

const SetPasswordForm = ({ userData, onSuccess, onCancel }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [passwordsMatch, setPasswordsMatch] = useState(true);

    const validatePasswordsMatch = (confirmPassword) => {
        const password = form.getFieldValue('password');
        if (password && confirmPassword) {
            setPasswordsMatch(password === confirmPassword);
        }
    };

    const onFinish = async (values) => {
        // Final validation
        if (values.password !== values.confirmPassword) {
            setError('Passwords do not match!');
            notification.error({
                message: 'Password Mismatch',
                description: 'Please ensure both passwords are identical.',
                duration: 5
            });
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const payload = {
                ...userData,
                password: values.password
            };

            // Use javaApiUrl from config.js
            const response = await axios.post(`${urls.javaApiUrl}/auth/register`, payload);
            if (response.data?.success) {
                notification.success({
                    message: 'Registration Successful!',
                    description: response.data.message || 'Your account has been created.',
                    duration: 4
                });
                setError(null);
                if (onSuccess) {
                    onSuccess(response.data);
                }
            } else {
                setError(response.data?.message || 'Registration failed.');
                notification.error({
                    message: 'Registration Failed',
                    description: response.data?.message || 'Registration failed.',
                    duration: 5
                });
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message ||
                err.response?.data?.error ||
                'Registration failed. Please try again.';
            setError(errorMessage);
            notification.error({
                message: 'Registration Failed',
                description: errorMessage,
                duration: 5
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="md:mx-4 lg:mx-6" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px' }}>
            {error && (
                <Alert
                    message="Registration Error"
                    description={error}
                    type="error"
                    showIcon
                    closable
                    onClose={() => setError(null)}
                    style={{ marginBottom: '20px', borderRadius: '8px' }}
                />
            )}
            <style>{customInputStyle}</style>

            <Form
                form={form}
                name="setPassword"
                onFinish={onFinish}
                layout="vertical"
                size="large"
                requiredMark={false}
            >
                <Form.Item
                    name="password"
                    label="Password"
                    rules={[
                        { required: true, message: 'Please input your password!' },
                        { min: 8, message: 'Password must be at least 8 characters!' }
                    ]}
                    style={formItemStyle}
                >
                    <Input.Password
                        prefix={<LockOutlined style={{ color: '#a0aec0' }} />}
                        className="custom-api-input"
                        onChange={(e) => {
                            validatePasswordsMatch(form.getFieldValue('confirmPassword'));
                        }}
                    />
                </Form.Item>

                <Form.Item
                    name="confirmPassword"
                    label="Confirm Password"
                    rules={[
                        { required: true, message: 'Please confirm your password!' },
                        { 
                            validator: (_, value) => {
                                if (!value || form.getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Passwords do not match!'));
                            }
                        }
                    ]}
                    style={formItemStyle}
                >
                    <Input.Password
                        prefix={<LockOutlined style={{ color: '#a0aec0' }} />}
                        className="custom-api-input"
                        onChange={(e) => {
                            validatePasswordsMatch(e.target.value);
                        }}
                    />
                </Form.Item>

                {!passwordsMatch && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        Passwords do not match
                    </div>
                )}

                <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
                    <Space style={{ width: '100%', justifyContent: 'center' }}>
                        <Button onClick={onCancel} disabled={loading}>
                            Back
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            disabled={!passwordsMatch}
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
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </div>
    );
};

export default SetPasswordForm;
