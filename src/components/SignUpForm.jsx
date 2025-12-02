import React, { useState } from 'react';
import {
Form,
Input,
Select,
Button,
Row,
Col,
Alert,
notification,
Space
} from 'antd';
import {
UserOutlined,
MailOutlined,
LockOutlined,
PhoneOutlined,
EyeInvisibleOutlined,
EyeTwoTone
} from '@ant-design/icons';
import axios from 'axios';

const SignUpForm = ({ onSuccess, onCancel }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const onFinish = async (values) => {
        setLoading(true);
        setError(null);

        try {
            const payload = {
                businessName: values.businessName,
                ownerName: values.ownerName,
                email: values.email,
                password: values.password,
                phone: values.phone,
                alternatePhone: values.alternatePhone,
                addressLine1: values.addressLine1,
                addressLine2: values.addressLine2,
                city: values.city,
                state: values.state,
                postalCode: values.postalCode,
                country: values.country,
                businessLicenseNumber: values.businessLicenseNumber,
                userType: values.userType,
                ein: values.ein
            };

            const response = await axios.post('http://localhost:8080/api/auth/register', payload);
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

    const validatePassword = (_, value) => {
        if (!value) {
            return Promise.reject(new Error('Please input your password!'));
        }
        if (value.length < 6) {
            return Promise.reject(new Error('Password must be at least 6 characters long!'));
        }
        // Keeping the complexity check as it's good practice
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(value)) {
            return Promise.reject(new Error('Password must contain uppercase, lowercase, number and special character!'));
        }
        return Promise.resolve();
    };

    const validateConfirmPassword = ({ getFieldValue }) => ({
        validator(_, value) {
            if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
            }
            return Promise.reject(new Error('The two passwords do not match!'));
        },
    });

    return (
        <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px' }}>
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
                initialValues={{ userType: 'BUSINESS' }}
            >
                <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="businessName"
                                label="Business Name"
                                rules={[{ required: true, message: 'Please input business name!' }]}
                            >
                                <Input placeholder="AutoGlass Pro" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="ownerName"
                                label="Owner Name"
                                rules={[{ required: true, message: 'Please input owner name!' }]}
                            >
                                <Input prefix={<UserOutlined />} placeholder="John Doe" />
                            </Form.Item>
                        </Col>
                </Row>

                <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Please input email!' },
                                    { type: 'email', message: 'Invalid email!' }
                                ]}
                            >
                                <Input prefix={<MailOutlined />} placeholder="john@example.com" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="businessLicenseNumber"
                                label="Business License Number"
                                rules={[{ required: true, message: 'Please input business license number!' }]}
                            >
                                <Input placeholder="BLN-123456" />
                            </Form.Item>
                        </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="phone"
                            label="Phone"
                            rules={[{ required: true, message: 'Please input phone number!' }]}
                        >
                            <Input prefix={<PhoneOutlined />} placeholder="123-456-7890" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="alternatePhone"
                            label="Alternate Phone"
                        >
                            <Input prefix={<PhoneOutlined />} placeholder="098-765-4321" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    name="addressLine1"
                    label="Address Line 1"
                    rules={[{ required: true, message: 'Please input address!' }]}
                >
                    <Input placeholder="123 Main St" />
                </Form.Item>

                <Form.Item
                    name="addressLine2"
                    label="Address Line 2"
                >
                    <Input placeholder="Suite 100" />
                </Form.Item>

                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="city"
                            label="City"
                            rules={[{ required: true, message: 'Please input city!' }]}
                        >
                            <Input placeholder="New York" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="state"
                            label="State"
                            rules={[{ required: true, message: 'Please input state!' }]}
                        >
                            <Input placeholder="NY" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="postalCode"
                            label="Postal Code"
                            rules={[{ required: true, message: 'Please input postal code!' }]}
                        >
                            <Input placeholder="10001" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="country"
                            label="Country"
                            rules={[{ required: true, message: 'Please input country!' }]}
                        >
                            <Input placeholder="USA" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    name="userType"
                    label="User Type"
                    rules={[{ required: true, message: 'Please select user type!' }]}
                >
                    <Select placeholder="Select user type">
                        <Select.Option value="SHOP_OWNER">Shop Owner</Select.Option>
                        <Select.Option value="REMOTE_WORKER">Remote Worker</Select.Option>
                    </Select>
                </Form.Item>

                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="ein"
                                label="EIN"
                                rules={[{ required: true, message: 'Please input EIN!' }]}
                            >
                                <Input placeholder="12-3456789" />
                            </Form.Item>
                        </Col>
                    </Row>

                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="password"
                            label="Password"
                            rules={[{ validator: validatePassword }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Password"
                                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="confirmPassword"
                            label="Confirm Password"
                            dependencies={['password']}
                            rules={[
                                { required: true, message: 'Please confirm password!' },
                                validateConfirmPassword
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Confirm Password"
                                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                            />
                        </Form.Item>
                    </Col>
                </Row>

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
