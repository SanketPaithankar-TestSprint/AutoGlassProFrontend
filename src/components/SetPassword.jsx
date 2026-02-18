import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, notification, Typography, Result, Alert } from 'antd';
import { LockOutlined, ArrowLeftOutlined, MailOutlined } from '@ant-design/icons';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { setPassword } from '../api/setPassword';

const { Title, Text } = Typography;

const SetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [countdown, setCountdown] = useState(10);

    // Countdown effect for success redirection
    useEffect(() => {
        let timer;
        if (success && countdown > 0) {
            timer = setTimeout(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        } else if (success && countdown === 0) {
            navigate('/auth');
        }
        return () => clearTimeout(timer);
    }, [success, countdown, navigate]);

    const onFinish = async (values) => {
        if (!token) {
            setError("Invalid Request: No token provided.");
            return;
        }

        try {
            setLoading(true);
            setError(null);
            await setPassword(token, values.password);
            setSuccess(true);
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to set password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // 1. Success State
    if (success) {
        return (
            <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-lg rounded-xl border border-slate-200">
                    <Result
                        status="success"
                        title="Password Set Successfully!"
                        subTitle={`You will be redirected to the login page in ${countdown} seconds.`}
                        extra={[
                            <Button
                                type="primary"
                                key="login"
                                onClick={() => navigate('/auth')}
                                className="bg-violet-600 hover:bg-violet-700 w-full"
                            >
                                Go to Login Now
                            </Button>,
                        ]}
                    />
                </Card>
            </div>
        );
    }

    // 2. Check Email State (Registered but not verified)
    if (!token && email) {
        return (
            <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-lg rounded-xl border border-slate-200">
                    <Result
                        icon={<MailOutlined className="text-violet-600" />}
                        title="Check Your Email"
                        subTitle={
                            <div className="text-gray-600">
                                We have sent a password setup link to <span className="font-semibold text-gray-800">{email}</span>. Please check your inbox and click the link to activate your account.
                            </div>
                        }
                        extra={[
                            <Button
                                type="primary"
                                key="login"
                                onClick={() => navigate('/auth')}
                                className="bg-violet-600 hover:bg-violet-700 w-full"
                            >
                                Back to Login
                            </Button>,
                        ]}
                    />
                </Card>
            </div>
        );
    }

    // 3. Fallback: No Token, No Email
    if (!token) {
        return (
            <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-lg rounded-xl border border-slate-200 text-center p-8">
                    <Title level={4} className="mb-4">Invalid Link</Title>
                    <Text type="secondary" className="block mb-6">This link appears to be invalid or expired.</Text>
                    <Button type="primary" onClick={() => navigate('/auth')}>Go to Login</Button>
                </Card>
            </div>
        )
    }

    // 4. Default: Set Password Form
    return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-lg rounded-xl border border-slate-200">
                <div className="text-center mb-6">
                    <Title level={3} className="!mb-2">Set Password</Title>
                    <Text type="secondary">Create a new password for your account</Text>
                </div>

                {error && (
                    <Alert
                        message="Error"
                        description={error}
                        type="error"
                        showIcon
                        closable
                        onClose={() => setError(null)}
                        className="mb-6"
                    />
                )}

                <Form
                    name="set_password"
                    layout="vertical"
                    onFinish={onFinish}
                    autoComplete="off"
                    size="large"
                >
                    <Form.Item
                        name="password"
                        rules={[
                            { required: true, message: 'Please input your new password!' },
                            { min: 6, message: 'Password must be at least 6 characters.' }
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="text-gray-400" />}
                            placeholder="New Password"
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirm"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Please confirm your password!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('The new passwords that you entered do not match!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="text-gray-400" />}
                            placeholder="Confirm Password"
                        />
                    </Form.Item>

                    <Form.Item className="mb-2">
                        <Button type="primary" htmlType="submit" className="w-full bg-violet-600 hover:bg-violet-700" loading={loading}>
                            Set Password
                        </Button>
                    </Form.Item>
                </Form>

                <div className="mt-4 text-center">
                    <Button type="link" onClick={() => navigate('/auth')} icon={<ArrowLeftOutlined />} className="text-gray-500 hover:text-gray-800">
                        Back to Login
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default SetPassword;
