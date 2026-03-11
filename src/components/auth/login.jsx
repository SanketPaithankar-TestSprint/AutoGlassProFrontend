import React, { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Form, Input, Checkbox, Alert, notification } from "antd";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { loginUser, handleLoginSuccess } from '../../api/login';
import { getTaxSettings } from '../../api/taxSettings';

export default function Login({ onLoginSuccess, onSignUpClick, onForgotPasswordClick }) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const onFinish = async (values) => {
        setLoading(true);
        setError(null);

        try {
            const res = await loginUser({
                usernameOrEmail: values.email,
                password: values.password,
                deviceType: "WEB",
                browserInfo: "",
            });

            if (res && res.success) {
                handleLoginSuccess(res, values.remember);

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
        <div>
            {error && (
                <Alert
                    message={t('auth.loginFailed')}
                    description={error}
                    type="error"
                    showIcon
                    closable
                    onClose={() => setError(null)}
                    style={{ marginBottom: '20px', borderRadius: '8px' }}
                />
            )}

            <Form
                name="login"
                initialValues={{ remember: true }}
                onFinish={onFinish}
                layout="vertical"
                requiredMark={false}
            >
                {/* Company Username */}
                <Form.Item
                    name="email"
                    label={<span className="text-sm font-medium text-slate-700">Email</span>}
                    rules={[
                        { required: true, message: <span className="text-red-500 text-xs">Please enter your email</span> },
                    ]}
                    style={{ marginBottom: '20px' }}
                >
                    <Input
                        placeholder="Enter your email"
                        className="!h-11 !rounded-lg !border-slate-300 hover:!border-blue-500 focus:!border-blue-500 focus:!shadow-[0_0_0_2px_rgba(59,130,246,0.15)]"
                    />
                </Form.Item>

                {/* Password */}
                <Form.Item
                    name="password"
                    label={<span className="text-sm font-medium text-slate-700">Password</span>}
                    rules={[{ required: true, message: <span className="text-red-500 text-xs">Please enter your password</span> }]}
                    style={{ marginBottom: '16px' }}
                >
                    <Input.Password
                        placeholder="Enter your password"
                        iconRender={(visible) => (visible ? <FiEye className="text-slate-400 cursor-pointer" /> : <FiEyeOff className="text-slate-400 cursor-pointer" />)}
                        className="!h-11 !rounded-lg !border-slate-300 hover:!border-blue-500 focus-within:!border-blue-500 focus-within:!shadow-[0_0_0_2px_rgba(59,130,246,0.15)]"
                    />
                </Form.Item>

                {/* Remember me + Forgot password */}
                <div className="flex items-center justify-between mb-6">
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                        <Checkbox>
                            <span className="text-sm text-slate-600">Keep me logged in</span>
                        </Checkbox>
                    </Form.Item>
                    <a
                        href=""
                        onClick={(e) => {
                            e.preventDefault();
                            if (onForgotPasswordClick) onForgotPasswordClick();
                        }}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Forgot your password?
                    </a>
                </div>

                {/* Submit Button */}
                <Form.Item style={{ marginBottom: '16px' }}>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Signing in...
                            </span>
                        ) : 'Sign In'}
                    </button>
                </Form.Item>
            </Form>

            {/* Divider */}
            <hr className="border-slate-200 my-5" />

            {/* Sign up prompt */}
            <p className="text-center text-sm text-slate-600">
                Don't have an account?{' '}
                <a
                    href=""
                    onClick={(e) => {
                        e.preventDefault();
                        if (onSignUpClick) onSignUpClick();
                    }}
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                    Sign up
                </a>
            </p>
        </div>
    );
}
