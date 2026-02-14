import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, ColorPicker, message, Spin, TimePicker, Switch, Row, Col, Radio } from "antd";
import dayjs from "dayjs";
import { SaveOutlined, ReloadOutlined } from "@ant-design/icons";
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
                const openHours = data.openHoursJson || {};
                const formattedOpenHours = {};

                ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
                    const dayData = openHours[day] || {};

                    if (dayData.closed || !dayData.intervals || dayData.intervals.length === 0) {
                        formattedOpenHours[`${day}_status`] = 'closed';
                    } else {
                        formattedOpenHours[`${day}_status`] = 'open';
                        const interval = dayData.intervals[0];
                        formattedOpenHours[`${day}_time`] = [
                            dayjs(interval.from, "HH:mm"),
                            dayjs(interval.to, "HH:mm")
                        ];
                    }
                });

                form.setFieldsValue({
                    slug: data.slug,
                    businessName: data.businessName,
                    tagline: data.tagline,
                    themeColor: data.themeColor || "#1677ff", // Default blue-ish
                    backgroundColorHex: data.backgroundColorHex || "#ffffff", // Default white
                    name: data.name,
                    address: data.address,
                    phone: data.phone,
                    alternatePhone: data.alternatePhone,
                    maps: data.maps,
                    ...formattedOpenHours
                });
                // Update localStorage if changed
                if (data.slug) {
                    localStorage.setItem('userSlug', data.slug);
                }
            }
        } catch (error) {
            // It's possible specific 404 means no slug yet, which is fine
            console.error("Error fetching slug config:", error);
            if (error.message && error.message.includes("401")) {
                // Explicitly DO NOT route to login. Just show error.
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

            const openHoursJson = {};

            ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].forEach(day => {
                const status = values[`${day}_status`];
                const timeRange = values[`${day}_time`];

                if (status === 'closed') {
                    openHoursJson[day] = { closed: true };
                } else {
                    if (timeRange && timeRange.length === 2) {
                        openHoursJson[day] = {
                            intervals: [{
                                from: timeRange[0].format("HH:mm"),
                                to: timeRange[1].format("HH:mm")
                            }]
                        };
                    } else {
                        // Fallback or skip if open but no time selected (though validation should catch this)
                        openHoursJson[day] = {
                            intervals: [{ from: "09:00", to: "17:00" }]
                        };
                    }
                }
            });

            const payload = {
                slug: values.slug,
                businessName: values.businessName,
                tagline: values.tagline,
                themeColor: colorHex,
                backgroundColorHex: bgColorHex,
                name: values.name,
                address: values.address,
                phone: values.phone,
                alternatePhone: values.alternatePhone,
                maps: values.maps,
                openHoursJson
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
        <Card
            title="Contact Form Configuration"
            className="w-full shadow-sm rounded-2xl border-gray-100"
            extra={
                <Button
                    type="text"
                    icon={<ReloadOutlined />}
                    onClick={fetchSlugInfo}
                    loading={fetching}
                >
                    Refresh
                </Button>
            }
        >
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
                            label="Theme Color"
                            name="themeColor"
                            tooltip="Primary color for your public pages."
                        >
                            <ColorPicker showText />
                        </Form.Item>

                        <Form.Item
                            label="Background Color"
                            name="backgroundColorHex"
                            tooltip="Background color for your public pages."
                        >
                            <ColorPicker showText />
                        </Form.Item>

                        <div className="col-span-1 md:col-span-2 border-t pt-4 mt-2">
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Opening Hours</h3>
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            {/* Individual Days Configuration */}
                            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                                <div key={day} className="mb-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                        <div className="w-24 font-medium text-gray-700 capitalize shrink-0">
                                            {day}
                                        </div>

                                        <Form.Item name={`${day}_status`} initialValue="open" className="mb-0 shrink-0">
                                            <Radio.Group buttonStyle="solid">
                                                <Radio.Button
                                                    value="open"
                                                    style={{
                                                        backgroundColor: form.getFieldValue(`${day}_status`) === 'open' ? '#e6f7ff' : '#fff',
                                                        borderColor: form.getFieldValue(`${day}_status`) === 'open' ? '#1890ff' : '#d9d9d9',
                                                        color: form.getFieldValue(`${day}_status`) === 'open' ? '#1890ff' : 'rgba(0, 0, 0, 0.85)',
                                                    }}
                                                >
                                                    Open
                                                </Radio.Button>
                                                <Radio.Button
                                                    value="closed"
                                                    style={{
                                                        backgroundColor: form.getFieldValue(`${day}_status`) === 'closed' ? '#fff1f0' : '#fff',
                                                        borderColor: form.getFieldValue(`${day}_status`) === 'closed' ? '#ff4d4f' : '#d9d9d9',
                                                        color: form.getFieldValue(`${day}_status`) === 'closed' ? '#ff4d4f' : 'rgba(0, 0, 0, 0.85)',
                                                    }}
                                                >
                                                    Closed
                                                </Radio.Button>
                                            </Radio.Group>
                                        </Form.Item>

                                        <Form.Item
                                            noStyle
                                            shouldUpdate={(prev, curr) => prev[`${day}_status`] !== curr[`${day}_status`]}
                                        >
                                            {({ getFieldValue }) => {
                                                return getFieldValue(`${day}_status`) === 'open' ? (
                                                    <Form.Item
                                                        name={`${day}_time`}
                                                        className="mb-0 flex-1"
                                                        initialValue={[dayjs("09:00", "HH:mm"), dayjs("17:00", "HH:mm")]}
                                                    >
                                                        <TimePicker.RangePicker format="h:mm A" minuteStep={15} use12Hours className="w-full sm:w-auto" />
                                                    </Form.Item>
                                                ) : (
                                                    <div className="text-gray-400 italic text-sm flex-1">Shop is closed on this day</div>
                                                );
                                            }}
                                        </Form.Item>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="col-span-1 md:col-span-2 border-t pt-4 mt-2">
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Contact Details</h3>
                        </div>

                        <Form.Item
                            label="Contact Name"
                            name="name"
                            tooltip="Name displayed on contact forms."
                        >
                            <Input placeholder="e.g. John Doe" />
                        </Form.Item>

                        <Form.Item
                            label="Primary Phone"
                            name="phone"
                            rules={[{ required: true, message: 'Please enter a phone number' }]}
                        >
                            <Input placeholder="(555) 123-4567" />
                        </Form.Item>

                        <Form.Item
                            label="Alternate Phone"
                            name="alternatePhone"
                        >
                            <Input placeholder="Optional secondary number" />
                        </Form.Item>

                        <div className="col-span-1 md:col-span-2 border-t pt-4 mt-2">
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Location Settings</h3>
                        </div>

                        <Form.Item
                            label="Full Address"
                            name="address"
                            className="col-span-1 md:col-span-2"
                        >
                            <Input.TextArea rows={2} placeholder="123 Glass St, City, State, Zip" />
                        </Form.Item>

                        <Form.Item
                            label="Google Maps URL"
                            name="maps"
                            className="col-span-1 md:col-span-2"
                            tooltip="Link to your Google Maps location."
                        >
                            <Input placeholder="https://maps.google.com/..." />
                        </Form.Item>
                    </div>

                    <Form.Item className="mb-0 text-right">
                        <Button
                            type="primary"
                            htmlType="submit"
                            icon={<SaveOutlined />}
                            loading={loading}
                            className="bg-violet-600 hover:bg-violet-700"
                        >
                            Save Configuration
                        </Button>
                    </Form.Item>
                </Form>
            )}
        </Card>
    );
};

export default SlugConfig;
