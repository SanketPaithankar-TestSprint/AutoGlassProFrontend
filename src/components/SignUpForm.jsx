import React, { useState } from 'react';
import
{
    Form,
    Input,
    Button,
    Row,
    Col,
    Alert,
    notification,
    Space
} from 'antd';
import
{
    UserOutlined,
    MailOutlined,
    LockOutlined,
    PhoneOutlined,
    EyeInvisibleOutlined,
    EyeTwoTone
} from '@ant-design/icons';
import axios from 'axios';

const SignUpForm = ({ onSuccess, onCancel }) =>
{
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const onFinish = async (values) =>
    {
        setLoading(true);
        setError(null);

        try
        {
            const response = await axios.post('http://localhost:8080/api/auth/register', {
                username: values.username,
                email: values.email,
                password: values.password,
                firstName: values.firstName,
                lastName: values.lastName,
                phoneNumber: values.phoneNumber || null
            });

            if (response.data.success)
            {
                if (response.data.data.token)
                {
                    localStorage.setItem('token', response.data.data.token);
                    localStorage.setItem('username', response.data.data.username);
                }

                notification.success({
                    message: 'Registration Successful!',
                    description: 'Welcome to AutoGlass Pro! Your account has been created.',
                    duration: 4
                });

                // Call success callback to close modal and handle navigation
                if (onSuccess)
                {
                    onSuccess(response.data.data);
                }
            } else
            {
                setError(response.data.message || 'Registration failed');
            }
        } catch (err)
        {
            const errorMessage = err.response?.data?.message ||
                err.response?.data?.error ||
                'Registration failed. Please try again.';
            setError(errorMessage);

            notification.error({
                message: 'Registration Failed',
                description: errorMessage,
                duration: 5
            });
        } finally
        {
            setLoading(false);
        }
    };

    const validatePassword = (_, value) =>
    {
        if (!value)
        {
            return Promise.reject(new Error('Please input your password!'));
        }
        if (value.length < 6)
        {
            return Promise.reject(new Error('Password must be at least 6 characters long!'));
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(value))
        {
            return Promise.reject(new Error('Password must contain uppercase, lowercase, number and special character!'));
        }
        return Promise.resolve();
    };

    const validateConfirmPassword = ({ getFieldValue }) => ({
        validator(_, value)
        {
            if (!value || getFieldValue('password') === value)
            {
                return Promise.resolve();
            }
            return Promise.reject(new Error('The two passwords do not match!'));
        },
    });

    return (
        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {error && (
                <Alert
                    message="Registration Error"
                    description={error}
                    type="error"
                    showIcon
                    closable
                    onClose={() => setError(null)}
                    style={{ marginBottom: '20px' }}
                />
            )}

            <Form
                form={form}
                name="signup"
                onFinish={onFinish}
                layout="vertical"
                size="large"
                requiredMark={false}
            >
                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="firstName"
                            label="First Name"
                            rules={[
                                { required: true, message: 'Please input your first name!' },
                                { min: 2, message: 'First name must be at least 2 characters!' }
                            ]}
                        >
                            <Input
                                prefix={<UserOutlined />}
                                placeholder="John"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="lastName"
                            label="Last Name"
                            rules={[
                                { required: true, message: 'Please input your last name!' },
                                { min: 2, message: 'Last name must be at least 2 characters!' }
                            ]}
                        >
                            <Input
                                prefix={<UserOutlined />}
                                placeholder="Doe"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    name="username"
                    label="Username"
                    rules={[
                        { required: true, message: 'Please input your username!' },
                        { min: 3, message: 'Username must be at least 3 characters!' },
                        { max: 50, message: 'Username cannot exceed 50 characters!' },
                        { pattern: /^[a-zA-Z0-9_]+$/, message: 'Username can only contain letters, numbers, and underscores!' }
                    ]}
                >
                    <Input
                        prefix={<UserOutlined />}
                        placeholder="johndoe123"
                    />
                </Form.Item>

                <Form.Item
                    name="email"
                    label="Email Address"
                    rules={[
                        { required: true, message: 'Please input your email!' },
                        { type: 'email', message: 'Please enter a valid email address!' }
                    ]}
                >
                    <Input
                        prefix={<MailOutlined />}
                        placeholder="john.doe@example.com"
                    />
                </Form.Item>

                <Form.Item
                    name="phoneNumber"
                    label="Phone Number (Optional)"
                    rules={[
                        { pattern: /^[\+]?[\d\s\-\(\)]{10,}$/, message: 'Please enter a valid phone number!' }
                    ]}
                >
                    <Input
                        prefix={<PhoneOutlined />}
                        placeholder="555-123-4567"
                    />
                </Form.Item>

                <Form.Item
                    name="password"
                    label="Password"
                    rules={[{ validator: validatePassword }]}
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Enter your password"
                        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    />
                </Form.Item>

                <Form.Item
                    name="confirmPassword"
                    label="Confirm Password"
                    dependencies={['password']}
                    rules={[
                        { required: true, message: 'Please confirm your password!' },
                        validateConfirmPassword
                    ]}
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Confirm your password"
                        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
                    <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                        <Button onClick={onCancel} disabled={loading}>
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none'
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

export default SignUpForm;
