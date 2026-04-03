import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Form, Input, Checkbox, Alert, Space, notification } from "antd";
import { UserOutlined, LockOutlined, GoogleOutlined, AppleOutlined } from "@ant-design/icons";
import BrandButton from "../common/BrandButton";
import { loginUser, loginEmployee, handleLoginSuccess } from '../../api/login';
import { getTaxSettings } from '../../api/taxSettings';

// Reusable style for form items to ensure consistent bordering and focus states
const formItemStyle = {
    marginBottom: '20px'
};

// Custom Input Styles injected via style tag or css-in-js approach for specific focus states
// For simplicity in this file, we'll use inline styles and Ant Design's `classNames` if needed, 
// or rely on a global CSS class. Let's add a small internal style block for the glow effect.
const customInputStyle = `
  .custom-api-input .ant-input, .custom-api-input .ant-input-password .ant-input {
      border-color: #e2e8f0; /* Light grey border */
      border-width: 1.5px;
      padding: 6px 11px;
      border-radius: 8px;
      height: 40px;
      display: flex !important;
      align-items: center !important;
      line-height: 28px !important;
  }
  .custom-api-input .ant-input::placeholder, .custom-api-input .ant-input-password .ant-input::placeholder {
      line-height: 28px !important;
      vertical-align: middle !important;
  }
  .custom-api-input .ant-input-prefix {
      display: flex !important;
      align-items: center !important;
  }
  .custom-api-input .ant-input-password-icon {
      display: flex !important;
      align-items: center !important;
  }
  .custom-api-input .ant-input:hover, .custom-api-input .ant-input-password:hover .ant-input {
      border-color: #7E5CFE;
  }
  .custom-api-input .ant-input:focus, .custom-api-input.ant-input-affix-wrapper-focused {
      border-color: #7E5CFE;
      box-shadow: 0 0 0 3px rgba(126, 92, 254, 0.2);
  }
  .custom-api-input.ant-input-affix-wrapper {
      padding: 6px 11px;
      border-radius: 8px;
      border-color: #e2e8f0;
      border-width: 1.5px;
      height: 40px;
  }
  .custom-api-input.ant-input-affix-wrapper:hover {
      border-color: #7E5CFE;
  }
  .custom-api-input.ant-input-affix-wrapper-focused {
       border-color: #7E5CFE;
       box-shadow: 0 0 0 3px rgba(126, 92, 254, 0.2);
  }
  .custom-api-input.ant-input-password .ant-input-affix-wrapper {
      padding: 6px 11px;
      height: 40px;
  }
`;

export default function Login({ onLoginSuccess, onSignUpClick, onForgotPasswordClick }) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isEmployee, setIsEmployee] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        setError(null);

        try {
            let res;
            if (isEmployee) {
                res = await loginEmployee({
                    email: values.email,
                    password: values.password,
                    deviceType: "WEB",
                    browserInfo: "",
                });
            } else {
                res = await loginUser({
                    usernameOrEmail: values.email,
                    password: values.password,
                    deviceType: "WEB",
                    browserInfo: "",
                });
            }

            if (res && res.success) {
                // Handle post-login storage
                handleLoginSuccess(res, values.remember);

                // Fetch and cache tax settings
                try {
                    const settings = await getTaxSettings();
                    if (settings) {
                        localStorage.setItem("user_tax_settings", JSON.stringify(settings));
                    }
                } catch (e) {
                    console.error("Failed to fetch tax settings on login", e);
                }

                notification.success({
                    message: `Welcome, ${res.data.username}!`,
                    description: t('auth.signedInSuccess'),
                    placement: "topRight",
                });

                if (onLoginSuccess) {
                    onLoginSuccess();
                } else {
                    window.location.href = "/";
                }
            } else {
                setError(res?.message || "Sign in failed. Please check your credentials.");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <style>{customInputStyle}</style>
            {error && (
                <Alert
                    message={t('auth.loginFailed')}
                    description={error}
                    type="error"
                    showIcon
                    closable
                    onClose={() => setError(null)}
                    className="mb-6 rounded-xl"
                />
            )}

            <Form
                name="login"
                initialValues={{ remember: true }}
                onFinish={onFinish}
                layout="vertical"
                size="large"
                requiredMark={false}
                className="w-full"
            >
                <Form.Item
                    name="email"
                    rules={[
                        { required: true, message: 'Please input your email or username!' },
                        {
                            validator: (_, value) => {
                                if (!value) return Promise.resolve();
                                const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                                const isUsername = /^[a-zA-Z0-9_]{3,}$/.test(value);
                                if (isEmail || isUsername || value.length >= 3) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Please enter a valid email or username'));
                             }
                        }
                    ]}
                    className="mb-6"
                >
                    <Input
                        prefix={<UserOutlined className="text-gray-400 mr-2" />}
                        placeholder="Company username"
                        className="h-14 rounded-xl border-gray-200 hover:border-[#7C3AED] focus:border-[#7C3AED] transition-all text-lg px-4"
                    />
                </Form.Item>

                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                    className="mb-6"
                >
                    <Input.Password
                        prefix={<LockOutlined className="text-gray-400 mr-2" />}
                        placeholder="Password"
                        className="h-14 rounded-xl border-gray-200 hover:border-[#7C3AED] focus:border-[#7C3AED] transition-all text-lg px-4"
                    />
                </Form.Item>

                <div className="flex items-center justify-between mb-8">
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                        <Checkbox className="text-gray-700 font-semibold flex items-center">
                            Keep me logged in
                        </Checkbox>
                    </Form.Item>
                    <a
                        href=""
                        onClick={(e) => {
                            e.preventDefault();
                            if (onForgotPasswordClick) onForgotPasswordClick();
                        }}
                        className="text-blue-500 font-semibold hover:text-blue-600 transition-colors"
                    >
                        Forgot your password?
                    </a>
                </div>

                <div className="mb-8">
                    <Form.Item noStyle>
                        <Checkbox 
                            checked={isEmployee} 
                            onChange={(e) => setIsEmployee(e.target.checked)}
                            className="text-gray-700 font-semibold"
                        >
                            {t('auth.loginAsEmployee', 'Login as Employee')}
                        </Checkbox>
                    </Form.Item>
                </div>

                <Form.Item className="mb-8">
                    <BrandButton
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        block
                        className="h-14 text-xl"
                    >
                        {loading ? t('auth.signingIn') : t('auth.signIn')}
                    </BrandButton>
                </Form.Item>

                <div className="relative flex items-center justify-center mb-8">
                    <div className="flex-grow border-t border-gray-100"></div>
                    <span className="flex-shrink mx-4 text-gray-400 text-sm font-bold uppercase tracking-widest">OR</span>
                    <div className="flex-grow border-t border-gray-100"></div>
                </div>

                <div className="text-center">
                    <span className="text-gray-400 font-semibold tracking-tight">Don't have an account? </span>
                    <button 
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            if (onSignUpClick) onSignUpClick();
                        }}
                        className="text-blue-500 font-bold auth-link-gradient-hover cursor-pointer"
                    >
                        Sign up
                    </button>
                </div>
            </Form>
        </div>
    );
}

