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
import BrandButton from '../common/BrandButton';
import axios from 'axios';
import urls from '../../config';
import { COUNTRIES, getStatesOrProvinces, getCities } from '../../const/locations';

// Reusable style for form items
const formItemStyle = {
    marginBottom: '24px'
};


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
                            <Input className="h-11 rounded-xl border-gray-200 hover:border-[#7C3AED] focus:border-[#7C3AED] transition-all text-lg px-4" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="ownerName"
                            label={t('customers.contactName')}
                            rules={[{ required: true, message: 'Please input contact name!' }]}
                            style={formItemStyle}
                        >
                            <Input prefix={<UserOutlined className="text-gray-400 mr-2" />} className="h-11 rounded-xl border-gray-200 hover:border-[#7C3AED] focus:border-[#7C3AED] transition-all text-lg px-4" />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    name="email"
                    label={t('auth.email')}
                    rules={[
                        { required: true, message: 'Please input email!' },
                        { type: 'email', message: 'Invalid email!' }
                    ]}
                    style={formItemStyle}
                >
                    <Input prefix={<MailOutlined className="text-gray-400 mr-2" />} className="h-11 rounded-xl border-gray-200 hover:border-[#7C3AED] focus:border-[#7C3AED] transition-all text-lg px-4" />
                </Form.Item>


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
                                prefix={<PhoneOutlined className="text-gray-400 mr-2" />}
                                className="h-11 rounded-xl border-gray-200 hover:border-[#7C3AED] focus:border-[#7C3AED] transition-all text-lg px-4"
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
                                prefix={<PhoneOutlined className="text-gray-400 mr-2" />}
                                className="h-11 rounded-xl border-gray-200 hover:border-[#7C3AED] focus:border-[#7C3AED] transition-all text-lg px-4"
                                maxLength={14}
                                onChange={(e) => {
                                    const formatted = formatPhoneNumber(e.target.value);
                                    form.setFieldsValue({ alternatePhone: formatted });
                                }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                <Col xs={24} sm={12}>
                <Form.Item
                    name="addressLine1"
                    label={t('customers.addressLine1')}
                    rules={[{ required: true, message: 'Please input address!' }]}
                    style={formItemStyle}
                >
                    <Input className="h-11 rounded-xl border-gray-200 hover:border-[#7C3AED] focus:border-[#7C3AED] transition-all text-lg px-4" />
                </Form.Item>
                </Col>      

                <Col xs={24} sm={12}>
                <Form.Item
                    name="addressLine2"
                    label={t('auth.addressLine2')}
                    style={formItemStyle}
                >
                    <Input className="h-11 rounded-xl border-gray-200 hover:border-[#7C3AED] focus:border-[#7C3AED] transition-all text-lg px-4" />
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
                                className="h-11 rounded-xl border-gray-200 hover:border-[#7C3AED] focus:border-[#7C3AED] transition-all text-lg [&_.ant-select-selector]:!h-full [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!border-gray-200 [&_.ant-select-selection-item]:!leading-[44px] [&_.ant-select-selection-placeholder]:!leading-[44px]"
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
                                className="h-11 rounded-xl border-gray-200 hover:border-[#7C3AED] focus:border-[#7C3AED] transition-all text-lg [&_.ant-select-selector]:!h-full [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!border-gray-200 [&_.ant-select-selection-item]:!leading-[44px] [&_.ant-select-selection-placeholder]:!leading-[44px]"
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
                            <Input className="h-11 rounded-xl border-gray-200 hover:border-[#7C3AED] focus:border-[#7C3AED] transition-all text-lg px-4" />
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
                                className="h-11 rounded-xl border-gray-200 hover:border-[#7C3AED] focus:border-[#7C3AED] transition-all text-lg [&_.ant-select-selector]:!h-full [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!border-gray-200 [&_.ant-select-selection-item]:!leading-[44px] [&_.ant-select-selection-placeholder]:!leading-[44px]"
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
                        <Input className="h-11 rounded-xl border-gray-200 hover:border-[#7C3AED] focus:border-[#7C3AED] transition-all text-lg px-4" placeholder={t('auth.typeCityName')} />
                    </Form.Item>
                )}

                <Form.Item
                    name="userType"
                    label={t('auth.userType')}
                    rules={[{ required: true, message: 'Please select user type!' }]}
                    style={formItemStyle}
                >
                    <Select className="h-11 rounded-xl border-gray-200 hover:border-[#7C3AED] focus:border-[#7C3AED] transition-all text-lg [&_.ant-select-selector]:!h-full [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!border-gray-200 [&_.ant-select-selection-item]:!leading-[44px] [&_.ant-select-selection-placeholder]:!leading-[44px]">
                        <Select.Option value="SHOP_OWNER">{t('auth.shopOwner')}</Select.Option>
                        <Select.Option value="MOBILE_TECHNICIAN">{t('auth.mobileTechnician')}</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item style={{ marginBottom: 0, marginTop: '32px' }}>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                            onClick={onCancel}
                            className="h-11 rounded-xl auth-button-gradient-outline font-semibold text-lg flex-1 flex items-center justify-center transition-all bg-white border border-gray-200 hover:border-[#7C3AED] hover:text-[#7C3AED]"
                        >
                            {t('common.cancel')}
                        </Button>
                        <BrandButton
                            type="primary"
                            htmlType="submit"
                            variant="gradient"
                            className="h-11 flex-1"
                            loading={loading}
                        >
                            {t('auth.continue')}
                        </BrandButton>
                    </div>
                </Form.Item>
            </Form>
        </div>
    );
};

export default SignUpForm;
