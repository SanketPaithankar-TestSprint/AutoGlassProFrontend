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
                    <span className="hidden sm:inline">Refresh</span>
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

                        <div className="col-span-1 md:col-span-2 border-t pt-4 mt-2">
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Opening Hours</h3>
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            {/* Individual Days Configuration */}
                            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                                <div key={day} className="flex flex-nowrap items-center justify-between gap-2 h-12 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-all px-1">
                                    <div className="flex flex-nowrap items-center gap-3 shrink-0">
                                        <div className="w-8 font-bold text-gray-400 uppercase text-[10px] tracking-wider">
                                            {day.substring(0, 3)}
                                        </div>

                                        <Form.Item
                                            name={`${day}_status`}
                                            initialValue="open"
                                            className="mb-0 leading-none flex items-center"
                                            valuePropName="checked"
                                            getValueProps={(value) => ({ checked: value === 'open' })}
                                            normalize={(value) => (value ? 'open' : 'closed')}
                                        >
                                            <Switch
                                                size="small"
                                                className="bg-gray-200"
                                                checkedChildren={<span className="text-[10px] font-bold">OPEN</span>}
                                                unCheckedChildren={<span className="text-[10px] font-bold">CLOSED</span>}
                                            />
                                        </Form.Item>
                                    </div>

                                    <Form.Item
                                        noStyle
                                        shouldUpdate={(prev, curr) => prev[`${day}_status`] !== curr[`${day}_status`]}
                                    >
                                        {({ getFieldValue }) => {
                                            const isOpen = getFieldValue(`${day}_status`) === 'open';
                                            return isOpen ? (
                                                <div className="flex-1 flex justify-end min-w-0 animate-fadeIn ml-2">
                                                    <Form.Item
                                                        name={`${day}_time`}
                                                        className="mb-0 flex items-center justify-end w-full"
                                                        initialValue={[dayjs("09:00", "HH:mm"), dayjs("17:00", "HH:mm")]}
                                                    >
                                                        <TimePicker.RangePicker
                                                            size="small"
                                                            format="h:mm a"
                                                            minuteStep={15}
                                                            use12Hours
                                                            allowClear={false}
                                                            suffixIcon={null}
                                                            bordered={false}
                                                            className="w-full justify-end bg-transparent hover:bg-white focus:bg-white transition-all rounded px-0 text-xs shadow-none border-none"
                                                            style={{ maxWidth: '180px', padding: 0 }}
                                                            inputReadOnly
                                                            separator={<span className="text-gray-300 mx-1">-</span>}
                                                        />
                                                    </Form.Item>
                                                </div>
                                            ) : null;
                                        }}
                                    </Form.Item>
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

                    <Form.Item className="mb-0 text-center">
                        <Button
                            type="primary"
                            htmlType="submit"
                            icon={<SaveOutlined />}
                            loading={loading}
                            className="bg-violet-600 hover:bg-violet-700 min-w-[200px]"
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
