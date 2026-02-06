import React, { useState } from "react";
import { Form, Input, Button, Checkbox, Alert, Space, notification } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { loginUser, handleLoginSuccess } from "../api/login";
import { getTaxSettings } from "../api/taxSettings";

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
                setError(res?.message || "Sign in failed. Please check your credentials.");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '0px 0' }}>
            <style>{customInputStyle}</style>
            {error && (
                <Alert
                    message="Log In Failed"
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
                size="large"
                requiredMark={false}
            >
                <Form.Item
                    name="email"
                    label="Email or Username"
                    rules={[{ required: true, message: 'Please input your email or username!' }]}
                    style={formItemStyle}
                >
                    <Input
                        prefix={<UserOutlined style={{ color: '#a0aec0' }} />}
                        placeholder="Email or Username"
                        className="custom-api-input"
                    />
                </Form.Item>

                <Form.Item
                    name="password"
                    label="Password"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                    style={formItemStyle}
                >
                    <Input.Password
                        prefix={<LockOutlined style={{ color: '#a0aec0' }} />}
                        placeholder="Password"
                        className="custom-api-input"
                    />
                </Form.Item>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                        <Checkbox>Remember me</Checkbox>
                    </Form.Item>
                    <a
                        className="login-form-forgot"
                        href=""
                        onClick={(e) => {
                            e.preventDefault();
                            if (onForgotPasswordClick) onForgotPasswordClick();
                        }}
                    >
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
                            height: '50px',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            borderRadius: '12px',
                            boxShadow: '0 4px 14px 0 rgba(118, 75, 162, 0.39)'
                        }}
                    >
                        {loading ? 'Logging in...' : 'Log In'}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}

