import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, ColorPicker, message, Spin, TimePicker, Switch, Row, Col, Radio, Tooltip } from "antd";
import dayjs from "dayjs";
import { SaveOutlined, ReloadOutlined, CheckOutlined, CloseOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { createOrUpdateUserSlug, getUserSlugByUserId } from "../../api/userSlugInfo";
import { getValidToken } from "../../api/getValidToken";

const SlugConfig = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [initialLoaded, setInitialLoaded] = useState(false);

    const token = getValidToken();
    // Retrieve userId from sessionStorage as stored during login
    const userId = sessionStorage.getItem('userId');

    const fetchSlugInfo = async () => {
        if (!userId || !token) return;
        setFetching(true);
        try {
            const data = await getUserSlugByUserId(token, userId);
            if (data) {
                form.setFieldsValue({
                    id: data.id,
                    slug: data.slug,
                    businessName: data.businessName,
                    tagline: data.tagline,
                    themeColor: data.themeColor || "#1677ff",
                    backgroundColorHex: data.backgroundColorHex || "#ffffff",
                    name: data.name
                });
                // Update localStorage if changed
                if (data.slug) {
                    localStorage.setItem('userSlug', data.slug);
                }
            }
        } catch (error) {
            console.error("Error fetching slug config:", error);
            if (error.message && error.message.includes("401")) {
                message.error("Session expired or unauthorized. Please refresh or login again manually if needed.");
            }
        } finally {
            setFetching(false);
            setInitialLoaded(true);
        }
    };

    useEffect(() => {
        fetchSlugInfo();
    }, [userId]);

    const onFinish = async (values) => {
        if (!userId || !token) {
            message.error("Missing user session or token.");
            return;
        }
        setLoading(true);
        try {
            // Extract color string from ColorPicker value (which can be object)
            const colorHex = typeof values.themeColor === 'string' ? values.themeColor : values.themeColor.toHexString();
            const bgColorHex = typeof values.backgroundColorHex === 'string' ? values.backgroundColorHex : values.backgroundColorHex.toHexString();

            const payload = {
                id: form.getFieldValue('id'),
                slug: values.slug,
                userId: parseInt(userId),
                businessName: values.businessName,
                tagline: values.tagline,
                themeColor: colorHex,
                backgroundColorHex: bgColorHex,
                name: values.name
            };

            console.log("Submitting Payload:", payload);

            const result = await createOrUpdateUserSlug(token, payload);

            if (result) {
                message.success("Configuration saved successfully!");
                localStorage.setItem('userSlug', values.slug);
            }
        } catch (error) {
            console.error("Submission error:", error);
            if (error.message && error.message.includes("401")) {
                message.error("Unauthorized. Changes not saved.");
            } else {
                message.error("Failed to save configuration.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Contact Form Configuration</h2>
                <Button
                    type="text"
                    icon={<ReloadOutlined />}
                    onClick={fetchSlugInfo}
                    loading={fetching}
                >
                    <span className="hidden sm:inline">Refresh</span>
                </Button>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                {fetching && !initialLoaded ? (
                    <div className="text-center py-8">
                        <Spin tip="Loading configuration..." />
                    </div>
                ) : (
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        initialValues={{
                            themeColor: "#1677ff",
                            backgroundColorHex: "#ffffff"
                        }}
                    >
                        <Form.Item name="id" hidden>
                            <Input />
                        </Form.Item>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Form.Item
                                label="User Slug"
                                name="slug"
                                tooltip="Unique identifier for your public profile/shop."
                                rules={[
                                    { required: true, message: 'Please enter a slug' },
                                    { pattern: /^[a-z0-9-]+$/, message: 'Slug must be lowercase alphanumeric with hyphens only.' }
                                ]}
                            >
                                <Input placeholder="e.g. my-auto-glass-shop" />
                            </Form.Item>

                            <Form.Item
                                label="Business Name"
                                name="businessName"
                                rules={[{ required: true, message: 'Please enter your business name' }]}
                            >
                                <Input placeholder="e.g. Auto Glass Pro" />
                            </Form.Item>

                            <Form.Item
                                label="Tagline"
                                name="tagline"
                            >
                                <Input placeholder="e.g. Best Glass in Town" />
                            </Form.Item>

                            <Form.Item
                                label="Contact Name"
                                name="name"
                                tooltip="Name displayed on contact forms."
                            >
                                <Input placeholder="e.g. John Doe" />
                            </Form.Item>

                            <div className="flex items-center justify-between border border-gray-100 rounded-lg p-3 bg-white hover:border-violet-100 transition-colors">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-600">Theme Color</span>
                                    <Tooltip title="Primary color for your public pages.">
                                        <InfoCircleOutlined className="text-gray-300 text-xs" />
                                    </Tooltip>
                                </div>
                                <Form.Item name="themeColor" noStyle>
                                    <ColorPicker showText size="small" />
                                </Form.Item>
                            </div>

                            <div className="flex items-center justify-between border border-gray-100 rounded-lg p-3 bg-white hover:border-violet-100 transition-colors">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-600">Background Color</span>
                                    <Tooltip title="Background color for your public pages.">
                                        <InfoCircleOutlined className="text-gray-300 text-xs" />
                                    </Tooltip>
                                </div>
                                <Form.Item name="backgroundColorHex" noStyle>
                                    <ColorPicker showText size="small" />
                                </Form.Item>
                            </div>
                        </div>

                        <Form.Item className="pt-1 mt-8 mb-0">
                            <div className="flex justify-end">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    icon={<SaveOutlined />}
                                    loading={loading}
                                    style={{ background: '#2563eb', borderColor: '#2563eb' }}
                                    className="min-w-[200px]"
                                >
                                    Save Configuration
                                </Button>
                            </div>
                        </Form.Item>
                    </Form>
                )}
            </div>
        </div>
    );
};

export default SlugConfig;
