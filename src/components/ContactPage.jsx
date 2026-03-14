import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Input, Button, Radio, Select, message, Typography } from 'antd';
import { MailOutlined, UserOutlined, CheckCircleOutlined } from '@ant-design/icons';
import PageHead from './PageHead';
import contactImage from '../assets/contact_form_image_1.png';
import contactImage2 from '../assets/contact_form_image_2.png';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const countryOptions = [
    { code: 'US', dial: '+1', flag: '🇺🇸', label: 'United States' },
];

import { sendEmail } from '../api/sendEmail';

const ContactPage = () => {
    const { t } = useTranslation();
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
        <div className="min-h-screen py-8 md:py-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center animate-fade-in relative overflow-hidden bg-slate-50">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-violet-100/40 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <PageHead
                title="Contact APAI | Sign Up for Your Auto Glass Business"
                description="Have questions about APAI? Contact our team today for support, demos, or sign up for 30 days trial."
            />

            <div className="w-full max-w-6xl flex flex-col items-center relative z-10">
                {/* Header Section - Refined Typography */}
                <div className="text-center mb-10 md:mb-16">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 mb-4 bg-clip-text text-transparent bg-gradient-to-b from-slate-900 via-slate-800 to-slate-600">
                        {t('contact.getInTouch')}
                    </h1>
                    <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                        {t('contact.loveToHear')}
                    </p>
                </div>

                {/* Main Content Grid - Compact & Polished */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
                    
                    {/* Left Column: Artistic Illustration */}
                    <div className="lg:col-span-5 relative order-2 lg:order-1">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-blue-100/50 to-violet-100/50 rounded-[2rem] blur-2xl -z-10"></div>
                        <div className="relative group">
                            <img
                                src={contactImage2}
                                alt="Dashboard Mockup"
                                className="w-full h-auto drop-shadow-2xl rounded-2xl transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute -bottom-8 -right-8 w-48 md:w-64 animate-float">
                                <img
                                    src={contactImage}
                                    alt="Support Character"
                                    className="w-full h-auto drop-shadow-xl"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Premium Glassmorphism Form */}
                    <div className="lg:col-span-7 order-1 lg:order-2">
                        <div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-10 border border-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
                            {submitted ? (
                                <div className="text-center py-10 animate-fade-in">
                                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-100/50">
                                        <CheckCircleOutlined className="text-3xl text-green-500" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-800 mb-2">{t('contact.messageSent')}</h2>
                                    <p className="text-slate-500 mb-8 max-w-xs mx-auto">
                                        {t('contact.messageSentDesc')}
                                    </p>
                                    <Button
                                        onClick={handleReset}
                                        className="h-12 px-10 rounded-xl text-base font-bold bg-[#7E5CFE] text-white hover:!bg-[#6a4deb] !border-none transition-all shadow-lg shadow-violet-200"
                                    >
                                        {t('contact.sendAnother')}
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-lg shadow-lg">
                                            <UserOutlined />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 m-0">{t('contact.tellUsAboutYourself')}</h3>
                                            <p className="text-slate-500 text-sm m-0">We typically reply within 24 hours.</p>
                                        </div>
                                    </div>

                                    <Form
                                        form={form}
                                        layout="vertical"
                                        onFinish={onFinish}
                                        requiredMark={false}
                                        size="large"
                                        className="form-compact"
                                        initialValues={{ phonePrefix: '+1', businessType: 'new' }}
                                    >
                                        <Form.Item
                                            name="shopName"
                                            label={<span className="text-sm font-semibold text-slate-600 uppercase tracking-wider">{t('contact.companyName')}</span>}
                                            rules={[{ required: true, message: 'Required' }]}
                                            className="mb-4"
                                        >
                                            <Input className="!rounded-xl bg-white/50 border-slate-200 hover:border-blue-400 focus:border-blue-500 focus:bg-white transition-all h-12" placeholder="e.g. Acme Auto Glass" />
                                        </Form.Item>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <Form.Item
                                                name="firstName"
                                                label={<span className="text-sm font-semibold text-slate-600 uppercase tracking-wider">{t('contact.firstName')}</span>}
                                                rules={[{ required: true, message: 'Required' }]}
                                                className="mb-0"
                                            >
                                                <Input className="!rounded-xl bg-white/50 border-slate-200 hover:border-blue-400 focus:border-blue-500 focus:bg-white transition-all h-12" placeholder="John" />
                                            </Form.Item>
                                            <Form.Item
                                                name="lastName"
                                                label={<span className="text-sm font-semibold text-slate-600 uppercase tracking-wider">{t('contact.lastName')}</span>}
                                                rules={[{ required: true, message: 'Required' }]}
                                                className="mb-0"
                                            >
                                                <Input className="!rounded-xl bg-white/50 border-slate-200 hover:border-blue-400 focus:border-blue-500 focus:bg-white transition-all h-12" placeholder="Doe" />
                                            </Form.Item>
                                        </div>

                                        <Form.Item
                                            name="email"
                                            label={<span className="text-sm font-semibold text-slate-600 uppercase tracking-wider">{t('contact.email')}</span>}
                                            rules={[{ required: true, type: 'email', message: 'Valid email required' }]}
                                            className="mb-4"
                                        >
                                            <Input className="!rounded-xl bg-white/50 border-slate-200 hover:border-blue-400 focus:border-blue-500 focus:bg-white transition-all h-12" placeholder="john@example.com" />
                                        </Form.Item>

                                        <Form.Item
                                            label={<span className="text-sm font-semibold text-slate-600 uppercase tracking-wider">{t('contact.phone')}</span>}
                                            className="mb-4"
                                        >
                                            <div className="flex gap-2">
                                                <Form.Item name="phonePrefix" noStyle>
                                                    <Select
                                                        style={{ width: 100 }}
                                                        className="[&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!h-12 [&_.ant-select-selector]:!py-1 [&_.ant-select-selector]:!bg-white/50 [&_.ant-select-selector]:!border-slate-200"
                                                        optionLabelProp="label"
                                                    >
                                                        {countryOptions.map(opt => (
                                                            <Option key={opt.code} value={opt.dial} label={opt.dial}>
                                                                <div className="flex gap-2"><span>{opt.flag}</span><span>{opt.label} ({opt.dial})</span></div>
                                                            </Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>
                                                <Form.Item name="phone" noStyle rules={[{ required: true, message: 'Required' }]}>
                                                    <Input className="flex-1 !rounded-xl bg-white/50 border-slate-200 hover:border-blue-400 focus:border-blue-500 focus:bg-white transition-all h-12" placeholder="(555) 000-0000" />
                                                </Form.Item>
                                            </div>
                                        </Form.Item>

                                        <Form.Item
                                            name="message"
                                            label={<span className="text-sm font-semibold text-slate-600 uppercase tracking-wider">{t('contact.message')}</span>}
                                            className="mb-6"
                                        >
                                            <Input.TextArea
                                                rows={3}
                                                className="!rounded-xl bg-white/50 border-slate-200 hover:border-blue-400 focus:border-blue-500 focus:bg-white transition-all"
                                                placeholder={t('contact.howCanWeHelp')}
                                            />
                                        </Form.Item>

                                        <Form.Item className="mb-0">
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                loading={loading}
                                                className="w-full !h-14 !rounded-2xl !text-lg !font-bold !bg-[#7E5CFE] hover:!bg-[#6a4deb] !border-none shadow-xl shadow-violet-200 transition-all hover:-translate-y-1 active:scale-[0.98]"
                                            >
                                                {t('common.submit')}
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Section Divider - Artistic Line */}
                <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-20"></div>

                {/* How It Works Section - Refined & Compact */}
                <div className="w-full mb-32">
                    <div className="text-center mb-16">
                        <span className="text-blue-600 font-bold tracking-[0.2em] uppercase text-xs mb-3 block">How It Works</span>
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                            3 Simple Steps to Get Started
                        </h2>
                        <h3 className="text-lg md:text-xl font-black text-slate-900 mb-6 tracking-tight">We&apos;ve made it easy for you to transition from a manual "grind" to a streamlined, AI-powered operation. <br/>Here is what happens after you hit submit</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-[2.25rem] left-[10%] right-[10%] h-[2px] bg-slate-100 z-0">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#7E5CFE] to-blue-500 w-1/2"></div>
                        </div>
                        
                        {[
                            {
                                step: "01",
                                title: "Submit Details",
                                desc: "Tell us about your shop's journey—new or existing.",
                                icon: <UserOutlined />
                            },
                            {
                                step: "02",
                                title: "30-Day Free Trial",
                                desc: "Immediate access to quoting, NAGS & work orders.",
                                icon: <CheckCircleOutlined />
                            },
                            {
                                step: "03",
                                title: "Custom Setup",
                                desc: "We'll align APAI perfectly with your operations.",
                                icon: <MailOutlined />
                            }
                        ].map((item, index) => (
                            <div key={index} className="relative z-10 flex flex-col items-center group text-center px-4">
                                <div className="w-16 h-16 rounded-full bg-white shadow-xl shadow-slate-100 flex items-center justify-center text-xl text-[#7E5CFE] mb-8 border border-slate-50 relative">
                                    <div className="absolute -inset-2 bg-[#7E5CFE]/5 rounded-full scale-0 group-hover:scale-100 transition-transform duration-500"></div>
                                    {item.icon}
                                    <span className="absolute -top-1 -right-1 text-[10px] font-black w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center border-2 border-white">
                                        {item.step}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight group-hover:text-[#7E5CFE] transition-colors">{item.title}</h3>
                                <p className="text-slate-500 leading-relaxed text-sm max-w-[240px]">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Why Connect Section - Modern Grid */}
                <div className="w-full mb-32 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-violet-50/50 -mx-[10vw] rounded-[4rem] -z-10 border-y border-white"></div>
                    
                    <div className="p-10 md:p-20 flex flex-col lg:flex-row gap-16 items-center">
                        <div className="lg:w-2/5">
                            <span className="text-violet-600 font-bold tracking-[0.2em] uppercase text-xs mb-3 block">Why Us</span>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 mb-6 leading-[1.1]">
                                Your Partner in <br />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7E5CFE] to-blue-500">Auto Glass Growth.</span>
                            </h2>
                            <p className="text-slate-500 text-lg leading-relaxed">
                                Choosing the right software is a big decision. We're here to make it the best one you've ever made.
                            </p>
                        </div>

                        <div className="lg:w-3/5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { title: "Expert Guidance", desc: "Speak with auto glass specialists.", icon: "💡" },
                                { title: "Tailored Solutions", desc: "Role-based management setup.", icon: "⚙️" },
                                { title: "Zero-Pressure Demos", desc: "Explore AI-driven VIN decoding.", icon: "🎬" },
                                { title: "Rapid Support", desc: "Dedicated team for your shop.", icon: "⚡" }
                            ].map((item, index) => (
                                <div key={index} className="bg-white/80 p-6 rounded-[1.5rem] border border-white shadow-sm hover:shadow-md transition-all group hover:-translate-y-1">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xl mb-4 group-hover:bg-[#7E5CFE]/5 group-hover:scale-110 transition-all">
                                        {item.icon}
                                    </div>
                                    <h4 className="text-base font-bold text-slate-900 mb-2">{item.title}</h4>
                                    <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Email Info Section - Compact & SaaS-like */}
                <div className="w-full max-w-4xl mb-20 bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 border border-blue-50 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.03)] flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-[#7E5CFE] text-2xl shadow-inner border border-blue-100">
                            <MailOutlined />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 m-0 mb-2">{t('contact.emailUs')}</h3>
                            <p className="text-slate-500 m-0 text-sm md:text-base max-w-sm leading-relaxed">
                                {t('contact.emailUsDesc')}
                            </p>
                        </div>
                    </div>
                    <div className="bg-[#7E5CFE]/5 px-8 py-5 rounded-2xl border border-[#7E5CFE]/10 flex items-center gap-3 group transition-all hover:bg-[#7E5CFE]/10">
                        <a href="mailto:support@autopaneai.com" className="text-lg font-bold text-[#7E5CFE] hover:text-[#6a4deb] transition-colors">
                            support@autopaneai.com
                        </a>
                        <CheckCircleOutlined className="text-[#7E5CFE] opacity-0 group-hover:opacity-100 transition-all transform scale-50 group-hover:scale-100" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
