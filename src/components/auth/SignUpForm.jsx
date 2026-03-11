import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
    Form,
    Input,
    Select,
    Button,
    Row,
    Col,
    Space,
    notification,
    Result,
    Alert
} from 'antd';
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined
} from '@ant-design/icons';
import axios from 'axios';
import urls from '../../config';
import { COUNTRIES, getStatesOrProvinces, getCities } from '../../const/locations';

// Reusable style for form items
const formItemStyle = {
    marginBottom: '16px'
};

// Custom Input Styles injected via style tag
/* Custom Input Styles injected via style tag */
const customInputStyle = `
  .custom-api-input .ant-input, 
  .custom-api-input .ant-input-password .ant-input,
  .custom-api-input.ant-select .ant-select-selector {
      border-color: #e2e8f0 !important;
      border-width: 1.5px !important;
      border-radius: 8px !important;
      padding: 10px 15px !important;
      height: 45px !important;
      line-height: 28px !important;
      display: flex !important;
      align-items: center !important;
  }
  .custom-api-input .ant-input::placeholder {
      line-height: 28px !important;
      vertical-align: middle !important;
  }
  .custom-api-input .ant-input-prefix {
      margin-right: 8px !important;
      display: flex !important;
      align-items: center !important;
  }
  .custom-api-input.ant-select .ant-select-selector {
      height: 45px !important;
      display: flex !important;
      align-items: center !important;
  }
  .custom-api-input .ant-input:hover, 
  .custom-api-input .ant-input-password:hover .ant-input,
  .custom-api-input.ant-select:hover .ant-select-selector {
      border-color: #7E5CFE !important;
  }
  .custom-api-input.ant-input:focus, 
  .custom-api-input.ant-input-affix-wrapper-focused,
  .custom-api-input.ant-select-focused .ant-select-selector {
      border-color: #7E5CFE !important;
      box-shadow: 0 0 0 3px rgba(126, 92, 254, 0.2) !important;
  }
  .custom-api-input.ant-input-affix-wrapper {
      padding: 10px 15px !important;
      border-radius: 8px;
      border-color: #e2e8f0;
      border-width: 1.5px;
      height: 45px !important;
      display: flex !important;
      align-items: center !important;
  }
  .custom-api-input.ant-input-password {
      height: 45px !important;
  }
  .custom-api-input .ant-input-password-icon {
      display: flex !important;
      align-items: center !important;
  }
`;

const formatPhoneNumber = (value) => {
    if (!value) return '';
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (!match) return value;
    const [, area, prefix, line] = match;
    if (!area) return '';
    if (!prefix) return `(${area}`;
    if (!line) return `(${area})${prefix}`;
    return `(${area})${prefix}-${line}`;
};

const validatePhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length !== 10) {
        return Promise.reject(new Error('Phone number must be exactly 10 digits!'));
    }
    return Promise.resolve();
};

const SignUpForm = ({ onSuccess, onCancel }) => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const [selectedCountry, setSelectedCountry] = useState('USA');
    const [availableStates, setAvailableStates] = useState(getStatesOrProvinces('USA'));
    const [availableCities, setAvailableCities] = useState([]);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState(null);

    // Ref for scrolling to top
    const formContainerRef = React.useRef(null);

    React.useEffect(() => {
        if (error && formContainerRef.current) {
            formContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [error]);

    const onFinish = async (values) => {
        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();

            // Determine final city value
            let finalCity = values.city;
            if (Array.isArray(values.city)) {
                finalCity = values.city[0];
            }
            if (finalCity === 'Other') {
                finalCity = values.customCity;
            }

            // Map values to payload
            const userData = {
                businessName: values.businessName,
                ownerName: values.ownerName,
                email: values.email,
                phone: values.phone,
                alternatePhone: values.alternatePhone,
                addressLine1: values.addressLine1,
                addressLine2: values.addressLine2,
                city: finalCity,
                state: values.state,
                postalCode: values.postalCode,
                country: values.country,
                userType: values.userType,
                ein: null
            };

            // Append all user data fields to FormData
            Object.keys(userData).forEach(key => {
                if (userData[key] !== null && userData[key] !== undefined) {
                    formData.append(key, userData[key]);
                }
            });

            // Use javaApiUrl from config.js
            const response = await axios.post(`${urls.javaApiUrl}/auth/register`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('Registration Response:', response);

            if (response.data?.success) {
                // Redirect to Set Password page with email
                navigate(`/set-password?email=${encodeURIComponent(values.email)}`);
                if (onSuccess) {
                    onSuccess(response.data);
                }
            } else {
                console.log('Registration Failed (Logic):', response.data);
                setError(response.data?.message || 'Registration failed.');
                notification.error({
                    message: 'Registration Failed',
                    description: response.data?.message || 'Registration failed.',
                    duration: 5
                });
            }
        } catch (err) {
            console.error('Registration Error (Catch):', err);
            const errorMessage = err.response?.data?.message ||
                err.response?.data?.error ||
                'Registration failed. Please try again.';

            console.log('Setting Error State to:', errorMessage);
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
        setAvailableCities([]);
        form.setFieldsValue({ state: undefined, city: undefined, customCity: undefined });
    };

    const handleStateChange = (value) => {
        const cities = getCities(selectedCountry, value);
        // Add "Other" option
        const citiesWithOther = [...cities, { value: 'Other', label: 'Other' }];
        setAvailableCities(citiesWithOther);
        form.setFieldsValue({ city: undefined, customCity: undefined });
    };

    // Watch for city changes to conditionally render custom city input
    const selectedCity = Form.useWatch('city', form);

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center p-8 h-full">
                <Result
                    status="success"
                    title={t('auth.registrationSuccessful')}
                    subTitle={t('auth.registrationSubTitle')}
                    extra={[
                        <Button type="primary" key="login" onClick={onCancel}>
                            {t('auth.backToLogin')}
                        </Button>,
                    ]}
                />
            </div>
        );
    }

    return (
        <div ref={formContainerRef} className="md:mx-4 lg:mx-6" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px' }}>
            <style>{customInputStyle}</style>

            {error && (
                <Alert
                    message="Registration Failed"
                    description={error}
                    type="error"
                    showIcon
                    closable
                    onClose={() => setError(null)}
                    style={{ marginBottom: 16 }}
                />
            )}

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
                label={t('customers.companyName')}
                rules={[{ required: true, message: 'Please input business name!' }]}
                style={formItemStyle}
            >
                {/* Ensure the custom class is applied */}
                <Input className="custom-api-input" />
            </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
            <Form.Item
                name="ownerName"
                label={t('customers.contactName')}
                rules={[{ required: true, message: 'Please input contact name!' }]}
                style={formItemStyle}
            >
                <Input prefix={<UserOutlined style={{ color: '#a0aec0' }} />} className="custom-api-input" />
            </Form.Item>
        </Col>
    </Row>

    <Row gutter={16}>
        <Col xs={24} sm={24}> {/* Ensure full width for the email field */}
            <Form.Item
                name="email"
                label={t('auth.email')}
                rules={[
                    { required: true, message: 'Please input email!' },
                    { type: 'email', message: 'Invalid email!' }
                ]}
                style={formItemStyle}
            >
                <Input prefix={<MailOutlined style={{ color: '#a0aec0' }} />} className="custom-api-input" />
            </Form.Item>
        </Col>
    </Row>
    <Row gutter={16}>
        <Col xs={24} sm={12}>
            <Form.Item
                name="phone"
                label={t('customers.phone')}
                rules={[
                    { required: true, message: 'Please input phone number!' },
                    { validator: (_, value) => validatePhoneNumber(value || '') }
                ]}
                style={formItemStyle}
            >
                <Input
                    prefix={<PhoneOutlined style={{ color: '#a0aec0' }} />}
                    className="custom-api-input"
                    maxLength={14}
                    onChange={(e) => {
                        const formatted = formatPhoneNumber(e.target.value);
                        form.setFieldsValue({ phone: formatted });
                    }}
                />
            </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
            <Form.Item
                name="alternatePhone"
                label={t('auth.alternatePhone')}
                rules={[
                    {
                        validator: (_, value) => {
                            if (!value) return Promise.resolve();
                            return validatePhoneNumber(value);
                        }
                    }
                ]}
                style={formItemStyle}
            >
                <Input
                    prefix={<PhoneOutlined style={{ color: '#a0aec0' }} />}
                    className="custom-api-input"
                    maxLength={14}
                    onChange={(e) => {
                        const formatted = formatPhoneNumber(e.target.value);
                        form.setFieldsValue({ alternatePhone: formatted });
                    }}
                />
            </Form.Item>
        </Col>
    </Row>

    {/* City, State, Zip, Country */}
    <Row gutter={16}>
        <Col xs={24} sm={12}>
            <Form.Item
                name="city"
                label={t('customers.city')}
                rules={[{ required: true, message: 'Please enter or select city!' }]}
                style={formItemStyle}
            >
                <Select
                    showSearch
                    optionFilterProp="label"
                    className="custom-api-input"
                    placeholder={t('auth.selectCity')}
                >
                    {availableCities.map(city => (
                        <Select.Option key={city.value} value={city.value}>
                            {city.label}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
            <Form.Item
                name="state"
                label={selectedCountry === 'Canada' ? t('customers.provinceLabel') : t('customers.stateLabel')}
                rules={[{ required: true, message: `Please select ${selectedCountry === 'Canada' ? 'province' : 'state'}!` }]}
                style={formItemStyle}
            >
                <Select
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
                name="postalCode"
                label={t('customers.zipCode')}
                rules={[{ required: true, message: 'Please input zip code!' }]}
                style={formItemStyle}
            >
                <Input className="custom-api-input" />
            </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
            <Form.Item
                name="country"
                label={t('customers.country')}
                rules={[{ required: true, message: 'Please select country!' }]}
                initialValue="USA"
                style={formItemStyle}
            >
                <Select
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
    </Row>

    {selectedCity === 'Other' && (
        <Form.Item
            name="customCity"
            label={t('auth.enterCityName')}
            rules={[{ required: true, message: 'Please enter your city!' }]}
            style={formItemStyle}
        >
            <Input className="custom-api-input" placeholder={t('auth.typeCityName')} />
        </Form.Item>
    )}

    <Form.Item
        name="userType"
        label={t('auth.userType')}
        rules={[{ required: true, message: 'Please select user type!' }]}
        style={formItemStyle}
    >
        <Select className="custom-api-input">
            <Select.Option value="SHOP_OWNER">{t('auth.shopOwner')}</Select.Option>
            <Select.Option value="MOBILE_TECHNICIAN">{t('auth.mobileTechnician')}</Select.Option>
        </Select>
    </Form.Item>

    {/* Action buttons */}
    <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
        <div className="grid grid-cols-2 gap-4 w-full">
            <Button
                onClick={onCancel}
                className="w-full"
                style={{
                    backgroundColor: '#7E5CFE', // Solid color for the button
                    border: 'none',
                    height: '50px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    borderRadius: '12px',
                    color: 'white',
                    boxShadow: '0 4px 14px 0 rgba(118, 75, 162, 0.39)',
                }}
            >
                {t('common.cancel')}
            </Button>
            <Button
                type="primary"
                htmlType="submit"
                className="w-full"
                style={{
                    backgroundColor: '#7E5CFE', // Same color for both buttons
                    border: 'none',
                    height: '50px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    borderRadius: '12px',
                    color: 'white',
                    boxShadow: '0 4px 14px 0 rgba(118, 75, 162, 0.39)',
                }}
                loading={loading}
            >
                {t('auth.continue')}
            </Button>
        </div>
    </Form.Item>
</Form>
        </div>
    );
};

export default SignUpForm;
