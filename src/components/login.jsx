import React, { useState } from "react";
import { Form, Input, Button, Checkbox, Alert, Space, notification } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { loginUser, handleLoginSuccess } from "../api/login";
import { getTaxSettings } from "../api/taxSettings";

export default function Login({ onLoginSuccess, onSignUpClick }) {
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
                    description: "Signed in successfully.",
                    placement: "topRight",
                });

                if (onLoginSuccess) {
                    onLoginSuccess();
                } else {
                    window.location.href = "/";
                }
            } else {
                setError(res?.message || "Login failed. Please check your credentials.");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px 0' }}>
            {error && (
                <Alert
                    message="Login Failed"
                    description={error}
                    type="error"
                    showIcon
                    closable
                    onClose={() => setError(null)}
                    style={{ marginBottom: '20px' }}
                />
            )}

            <Form
                name="login"
                initialValues={{ remember: true }}
                onFinish={onFinish}
                layout="vertical"
                size="large"
                requiredMark={false}
            >
                <Form.Item
                    name="email"
                    label="Email or Username"
                    rules={[{ required: true, message: 'Please input your email or username!' }]}
                >
                    <Input
                        prefix={<UserOutlined />}
                        placeholder="Email or Username"
                    />
                </Form.Item>

                <Form.Item
                    name="password"
                    label="Password"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                >
                    <Input.Password
                        prefix={<LockOutlined />}
                        placeholder="Password"
                    />
                </Form.Item>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                        <Checkbox>Remember me</Checkbox>
                    </Form.Item>
                    <a className="login-form-forgot" href="" onClick={(e) => e.preventDefault()}>
                        Forgot password?
                    </a>
                </div>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        block
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            height: '45px',
                            fontSize: '16px',
                            fontWeight: '600'
                        }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                </Form.Item>

            </Form>
        </div>
    );
}

