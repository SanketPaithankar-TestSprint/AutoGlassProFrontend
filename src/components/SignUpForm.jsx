import React, { useState } from 'react';
import urls from '../config';
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
    PhoneOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { COUNTRIES, getStatesOrProvinces } from '../const/locations';

// Reusable style for form items
const formItemStyle = {
    marginBottom: '16px'
};

// Custom Input Styles injected via style tag
const customInputStyle = `
  .custom-api-input .ant-input, 
  .custom-api-input .ant-input-password .ant-input,
  .custom-api-input.ant-select .ant-select-selector {
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
  .custom-api-input.ant-select .ant-select-selector {
      height: 40px !important;
      display: flex !important;
      align-items: center !important;
  }
  .custom-api-input .ant-input:hover, 
  .custom-api-input .ant-input-password:hover .ant-input,
  .custom-api-input.ant-select:hover .ant-select-selector {
      border-color: #7E5CFE !important;
  }
  .custom-api-input .ant-input:focus, 
  .custom-api-input.ant-input-affix-wrapper-focused,
  .custom-api-input.ant-select-focused .ant-select-selector {
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

const SignUpForm = ({ onSuccess, onCancel }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedCountry, setSelectedCountry] = useState('USA');

    const [availableStates, setAvailableStates] = useState(getStatesOrProvinces('USA'));


    const onFinish = async (values) => {
        setLoading(true);
        setError(null);

        try {
            const payload = {
                businessName: values.businessName,
                ownerName: values.ownerName,
                email: values.email,
                phone: values.phone,
                alternatePhone: values.alternatePhone,
                addressLine1: values.addressLine1,
                addressLine2: values.addressLine2,
                city: Array.isArray(values.city) ? values.city[0] : values.city,
                state: values.state,
                postalCode: values.postalCode,
                country: values.country,
                businessLicenseNumber: values.businessLicenseNumber,
                userType: values.userType,
                ein: values.ein
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

    const handleCountryChange = (value) => {
        setSelectedCountry(value);

        setAvailableStates(getStatesOrProvinces(value));
        form.setFieldsValue({ state: undefined });
    };

    const handleStateChange = (value) => {

        form.setFieldsValue({ city: undefined });
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
                name="signup"
                onFinish={onFinish}
                layout="vertical"
                size="large"
                requiredMark={false}
                initialValues={{ userType: 'SHOP_OWNER', country: 'USA' }}
            >
                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="businessName"
                            label="Business Name"
                            rules={[{ required: true, message: 'Please input business name!' }]}
                            style={formItemStyle}
                        >
                            <Input placeholder="APAI" className="custom-api-input" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="ownerName"
                            label="Contact Name"
                            rules={[{ required: true, message: 'Please input contact name!' }]}
                            style={formItemStyle}
                        >
                            <Input prefix={<UserOutlined style={{ color: '#a0aec0' }} />} placeholder="John Doe" className="custom-api-input" />
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
                            style={formItemStyle}
                        >
                            <Input prefix={<MailOutlined style={{ color: '#a0aec0' }} />} placeholder="john@example.com" className="custom-api-input" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="businessLicenseNumber"
                            label="Business License Number"
                            rules={[{ required: true, message: 'Please input business license number!' }]}
                            style={formItemStyle}
                        >
                            <Input placeholder="BLN-123456" className="custom-api-input" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="phone"
                            label="Phone"
                            rules={[{ required: true, message: 'Please input phone number!' }]}
                            style={formItemStyle}
                        >
                            <Input prefix={<PhoneOutlined style={{ color: '#a0aec0' }} />} placeholder="123-456-7890" className="custom-api-input" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="alternatePhone"
                            label="Alternate Phone"
                            style={formItemStyle}
                        >
                            <Input prefix={<PhoneOutlined style={{ color: '#a0aec0' }} />} placeholder="098-765-4321" className="custom-api-input" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    name="addressLine1"
                    label="Address Line 1"
                    rules={[{ required: true, message: 'Please input address!' }]}
                    style={formItemStyle}
                >
                    <Input placeholder="123 Main St" className="custom-api-input" />
                </Form.Item>

                <Form.Item
                    name="addressLine2"
                    label="Address Line 2"
                    style={formItemStyle}
                >
                    <Input placeholder="Suite 100" className="custom-api-input" />
                </Form.Item>

                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="city"
                            label="City"
                            rules={[{ required: true, message: 'Please enter or select city!' }]}
                            style={formItemStyle}
                        >
                            <Input placeholder="Enter city name" className="custom-api-input" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="state"
                            label={selectedCountry === 'Canada' ? 'Province' : 'State'}
                            rules={[{ required: true, message: `Please select ${selectedCountry === 'Canada' ? 'province' : 'state'}!` }]}
                            style={formItemStyle}
                        >
                            <Select
                                placeholder={`Select ${selectedCountry === 'Canada' ? 'province' : 'state'}`}
                                onChange={handleStateChange}
                                showSearch
                                optionFilterProp="label"
                                className="custom-api-input"
                            >
                                {availableStates.map(state => (
                                    <Select.Option key={state.value} value={state.value}>
                                        {state.label}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="country"
                            label="Country"
                            rules={[{ required: true, message: 'Please select country!' }]}
                            initialValue="USA"
                            style={formItemStyle}
                        >
                            <Select
                                placeholder="Select country"
                                onChange={handleCountryChange}
                                showSearch
                                optionFilterProp="label"
                                className="custom-api-input"
                            >
                                {COUNTRIES.map(country => (
                                    <Select.Option key={country.value} value={country.value}>
                                        {country.label}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="postalCode"
                            label="Zip Code"
                            rules={[{ required: true, message: 'Please input zip code!' }]}
                            style={formItemStyle}
                        >
                            <Input placeholder="10001" className="custom-api-input" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    name="userType"
                    label="User Type"
                    rules={[{ required: true, message: 'Please select user type!' }]}
                    style={formItemStyle}
                >
                    <Select placeholder="Select user type" className="custom-api-input">
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
                            style={formItemStyle}
                        >
                            <Input placeholder="12-3456789" className="custom-api-input" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
                    <Space style={{ width: '100%', justifyContent: 'center' }}>
                        <Button onClick={onCancel} disabled={loading}>
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
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
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </div>
    );
};

export default SignUpForm;
