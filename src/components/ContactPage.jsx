import React, { useState } from 'react';
import { Form, Input, Button, Radio, Select, message, Typography } from 'antd';
import { MailOutlined, UserOutlined, CheckCircleOutlined } from '@ant-design/icons';
import PageHead from './PageHead';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const countryOptions = [
    { code: 'US', dial: '+1', flag: '🇺🇸', label: 'United States' },
];

import { sendEmail } from '../api/sendEmail';

// ... (existing imports)

const ContactPage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const { shopName, firstName, lastName, email, phonePrefix, phone, businessType, message: userMessage } = values;

            const subject = `New Contact Form Submission - ${shopName}`;
            const body = `
New Contact Request:

Shop Name: ${shopName}
Contact Person: ${firstName} ${lastName}
Email: ${email}
Phone: ${phonePrefix} ${phone}
Business Type: ${businessType === 'new' ? 'New Business' : 'Existing Business'}

Message:
${userMessage || 'No message provided'}
            `.trim();

            await sendEmail('support@autopaneai.com', subject, body);

            message.success('Message sent successfully!');
            form.resetFields();
            setSubmitted(true);
        } catch (error) {
            console.error('Contact form error:', error);
            message.error('Failed to send message. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setSubmitted(false);
        form.resetFields();
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center animate-fade-in-up relative overflow-hidden">
            <PageHead 
                title="Contact APAI | Sign Up for Your Auto Glass Business" 
                description="Have questions about APAI? Contact our team today for support, demos, or sign up for 30 days trial. We're here to help your auto glass shop succeed." 
            />
            {/* Simple static gradient background */}
            <div
                className="fixed inset-0 z-0 pointer-events-none opacity-20"
                style={{ background: 'linear-gradient(135deg, #7E5CFE 0%, #00A8E4 100%)' }}
            />
            {/* Content Container (z-10 to sit above background) */}
            <div className="w-full max-w-6xl flex flex-col items-center relative z-10">

                {/* Header Section */}
                <div className="text-center mb-16 max-w-3xl">
                    <Title level={1} className="!font-bold !text-4xl md:!text-5xl !mb-4">
                        Contact Us
                    </Title>
                    <div className="w-16 h-1 bg-blue-500 mx-auto rounded-full mb-8"></div>
                    <Paragraph className="text-lg text-slate-600">
                        Get in Touch with Us. <br />
                        Wherever you are, everything you need!
                    </Paragraph>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl">

                    {/* Left Column: Email Info */}
                    <div className="relative">
                        <div className="bg-blue-50/50 rounded-3xl p-8 flex flex-col items-start">
                            {/* Abstract map background decoration could go here if we had the asset */}

                            <div className="z-10 bg-white/60 backdrop-blur-sm p-6 rounded-2xl w-full max-w-md shadow-sm border border-blue-100">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white text-xl shadow-lg shadow-blue-500/30">
                                        <MailOutlined />
                                    </div>
                                    <Title level={3} className="!mb-0 !text-xl">E-mail Us</Title>
                                </div>

                                <Paragraph className="text-slate-600 mb-6 leading-relaxed">
                                    For any inquiries, support, or feedback, feel free to email us. Our team will get back to you within 24–48 hours.
                                </Paragraph>

                                <Text strong className="text-lg text-slate-800 break-all">
                                    support@autopaneai.com
                                </Text>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Contact Form */}
                    <div className="relative">
                        <div className="bg-blue-50/30 rounded-3xl p-6 md:p-8 h-full flex flex-col justify-center">
                            {submitted ? (
                                <div className="text-center py-12 animate-fade-in">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircleOutlined className="text-4xl text-green-500" />
                                    </div>
                                    <Title level={2} className="!mb-4 !text-slate-800">Message Sent!</Title>
                                    <Paragraph className="text-slate-600 mb-8 max-w-xs mx-auto text-lg">
                                        Thank you for reaching out. We will get back to you shortly.
                                    </Paragraph>
                                    <Button
                                        onClick={handleReset}
                                        className="h-11 px-8 rounded-lg text-base font-semibold border-slate-300 text-slate-600 hover:text-slate-800 hover:border-slate-400"
                                    >
                                        Send another message
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg shadow-md">
                                            <UserOutlined />
                                        </div>
                                        <Title level={3} className="!mb-0 !text-xl">Tell us a bit about yourself</Title>
                                    </div>

                                    <div className="mb-6">
                                        <Paragraph className="text-slate-600">
                                            Want to test out APAI? We'll show you around, or you can drive the bus!
                                        </Paragraph>
                                    </div>

                                    <Form
                                        form={form}
                                        layout="vertical"
                                        onFinish={onFinish}
                                        requiredMark="optional"
                                        size="large"
                                        className="bg-transparent"
                                        initialValues={{
                                            phonePrefix: '+1',
                                            businessType: 'new'
                                        }}
                                    >
                                        <Form.Item
                                            name="shopName"
                                            label={<span className="font-medium text-slate-700">Shop Name<span className="text-red-500">*</span></span>}
                                            rules={[{ required: true, message: 'Please enter your shop name' }]}
                                            className="mb-3"
                                        >
                                            <Input className="rounded-lg bg-gray-50 border-gray-200 hover:bg-white focus:bg-white transition-all" />
                                        </Form.Item>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                            <Form.Item
                                                name="firstName"
                                                label={<span className="font-medium text-slate-700">First Name<span className="text-red-500">*</span></span>}
                                                rules={[{ required: true, message: 'Please enter your first name' }]}
                                                className="mb-0"
                                            >
                                                <Input className="rounded-lg bg-gray-50 border-gray-200 hover:bg-white focus:bg-white transition-all" />
                                            </Form.Item>

                                            <Form.Item
                                                name="lastName"
                                                label={<span className="font-medium text-slate-700">Last Name<span className="text-red-500">*</span></span>}
                                                rules={[{ required: true, message: 'Please enter your last name' }]}
                                                className="mb-0"
                                            >
                                                <Input className="rounded-lg bg-gray-50 border-gray-200 hover:bg-white focus:bg-white transition-all" />
                                            </Form.Item>
                                        </div>

                                        <Form.Item
                                            name="email"
                                            label={<span className="font-medium text-slate-700">Email<span className="text-red-500">*</span></span>}
                                            rules={[
                                                { required: true, message: 'Please enter your email' },
                                                { type: 'email', message: 'Please enter a valid email' }
                                            ]}
                                            className="mb-3"
                                        >
                                            <Input className="rounded-lg bg-gray-50 border-gray-200 hover:bg-white focus:bg-white transition-all" />
                                        </Form.Item>

                                        <Form.Item
                                            label={<span className="font-medium text-slate-700">Phone number<span className="text-red-500">*</span></span>}
                                            required
                                            className="mb-3"
                                        >
                                            <div className="flex gap-2">
                                                <Form.Item
                                                    name="phonePrefix"
                                                    noStyle
                                                >
                                                    <Select
                                                        style={{ width: 100 }}
                                                        className="rounded-lg [&_.ant-select-selector]:!bg-gray-50 [&_.ant-select-selector]:!border-gray-200 hover:[&_.ant-select-selector]:!bg-white"
                                                        dropdownMatchSelectWidth={false}
                                                        optionLabelProp="label"
                                                    >
                                                        {countryOptions.map(opt => (
                                                            <Option key={opt.code} value={opt.dial} label={<div className="flex gap-1"><span>{opt.flag}</span><span>{opt.dial}</span></div>}>
                                                                <div className="flex gap-2"><span>{opt.flag}</span><span>{opt.label} ({opt.dial})</span></div>
                                                            </Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>
                                                <Form.Item
                                                    name="phone"
                                                    noStyle
                                                    rules={[{ required: true, message: 'Required' }]}
                                                >
                                                    <Input className="w-full rounded-lg bg-gray-50 border-gray-200 hover:bg-white focus:bg-white transition-all" />
                                                </Form.Item>
                                            </div>
                                        </Form.Item>

                                        <Form.Item
                                            name="businessType"
                                            label={<span className="font-medium text-slate-700">New Business?</span>}
                                            className="mb-3"
                                        >
                                            <Radio.Group className="flex gap-6">
                                                <Radio value="new">New</Radio>
                                                <Radio value="existing">Existing</Radio>
                                            </Radio.Group>
                                        </Form.Item>

                                        <Form.Item
                                            name="message"
                                            label={<span className="font-medium text-slate-700">Message</span>}
                                            className="mb-6"
                                        >
                                            <Input.TextArea
                                                rows={3}
                                                className="rounded-lg bg-gray-50 border-gray-200 hover:bg-white focus:bg-white transition-all"
                                                placeholder="How can we help you?"
                                            />
                                        </Form.Item>

                                        <Form.Item className="text-center mb-0">
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                loading={loading}
                                                className="!bg-[#FF7A50] hover:!bg-[#E06945] !border-none !h-11 !px-8 !rounded-lg !text-base !font-semibold shadow-lg shadow-orange-200 w-full md:w-auto"
                                            >
                                                Submit
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
