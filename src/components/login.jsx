import React, { useState } from "react";
import { Form, Input, Button, Checkbox, Alert, Divider, Space, notification } from "antd";
import { UserOutlined, LockOutlined, GoogleOutlined, FacebookOutlined } from "@ant-design/icons";
import { login } from "../api/homepage";

export default function Login() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const onFinish = async (values) => {
        setLoading(true);
        setError(null);

        try {
            const res = await login({
                usernameOrEmail: values.email,
                password: values.password,
                deviceType: "WEB",
                browserInfo: "",
            });

            if (res && res.success) {
                localStorage.setItem("ApiToken", JSON.stringify(res));
                notification.success({
                    message: `Welcome, ${res.data.username}!`,
                    description: "Signed in successfully.",
                    placement: "topRight",
                });
                window.location.href = "/";
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

                <Divider plain>Or continue with</Divider>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Button icon={<GoogleOutlined />}>
                        Google
                    </Button>
                    <Button icon={<FacebookOutlined />}>
                        Facebook
                    </Button>
                </div>

                <div style={{ marginTop: '24px', textAlign: 'center' }}>
                    Don't have an account? <a href="" onClick={(e) => e.preventDefault()}>Sign up</a>
                </div>
            </Form>
        </div>
    );
}
