import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Input, Button, Select, message, Typography } from 'antd';
import { 
    MailOutlined, UserOutlined, CheckCircleOutlined, 
    BulbOutlined, SettingOutlined, PlaySquareOutlined, ThunderboltOutlined 
} from '@ant-design/icons';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import PageHead from './PageHead';

gsap.registerPlugin(ScrollTrigger);

import contactImage from '../assets/contact_form_image_1.png';
import contactImage2 from '../assets/contact_form_image_2.png';

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
    const stepsContainerRef = useRef(null);

    useGSAP(() => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: stepsContainerRef.current,
                start: "top 70%",
                end: "center center",
                scrub: 1, 
            }
        });

        tl.to(".progress-line", { width: "100%", ease: "none", duration: 2 }, 0);

        // Step 1
        tl.to(".step-circle-0", { borderColor: "#00A8E4", backgroundColor: "#00A8E4", color: "#ffffff", duration: 0.2 }, 0);
        tl.to(".step-badge-0", { backgroundColor: "#00A8E4", borderColor: "#00A8E4", color: "#ffffff", duration: 0.2 }, 0);
        tl.to(".step-card-0", { borderColor: "#bae6fd", boxShadow: "0 10px 15px -3px rgba(0, 168, 228, 0.1), 0 4px 6px -4px rgba(0, 168, 228, 0.1)", duration: 0.2 }, 0);

        // Step 2
        tl.to(".step-circle-1", { borderColor: "#00A8E4", backgroundColor: "#00A8E4", color: "#ffffff", duration: 0.2 }, 1.0);
        tl.to(".step-badge-1", { backgroundColor: "#00A8E4", borderColor: "#00A8E4", color: "#ffffff", duration: 0.2 }, 1.0);
        tl.to(".step-card-1", { borderColor: "#bae6fd", boxShadow: "0 10px 15px -3px rgba(0, 168, 228, 0.1), 0 4px 6px -4px rgba(0, 168, 228, 0.1)", duration: 0.2 }, 1.0);

        // Step 3
        tl.to(".step-circle-2", { borderColor: "#00A8E4", backgroundColor: "#00A8E4", color: "#ffffff", duration: 0.2 }, 2.0);
        tl.to(".step-badge-2", { backgroundColor: "#00A8E4", borderColor: "#00A8E4", color: "#ffffff", duration: 0.2 }, 2.0);
        tl.to(".step-card-2", { borderColor: "#bae6fd", boxShadow: "0 10px 15px -3px rgba(0, 168, 228, 0.1), 0 4px 6px -4px rgba(0, 168, 228, 0.1)", duration: 0.2 }, 2.0);

    }, { scope: stepsContainerRef });

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
        <div className="min-h-screen py-4 md:py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center animate-fade-in relative overflow-hidden">
            <PageHead
                title="Contact APAI | Sign Up for Your Auto Glass Business"
                description="Have questions about APAI? Contact our team today for support, demos, or sign up for 30 days trial."
            />

            <div className="w-full max-w-6xl flex flex-col items-center relative z-10">
                {/* Header Section */}
                <div className="text-center mb-10 md:mb-16 mt-8">
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 mb-4">
                        {t('contact.getInTouch')}
                    </h1>
                    <p className="text-base md:text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
                        {t('contact.loveToHear')}
                    </p>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch w-full">
                    
                    {/* Left Column: Image Area */}
                    <div className="lg:col-span-6 relative lg:-mt-10 flex flex-col justify-center">
                        <div className="relative mt-10 md:mt-20">
                            <img
                                src={contactImage2}
                                alt="Dashboard Mockup"
                                className="w-full h-auto drop-shadow-xl rounded-3xl border border-slate-200"
                            />
                            <div className="absolute -bottom-16 -right-4 md:-right-8 w-56 md:w-72 lg:w-80 animate-float z-10">
                                <img
                                    src={contactImage}
                                    alt="Support Character"
                                    className="w-full h-auto drop-shadow-[0_25px_50px_rgba(0,0,0,0.45)] filter brightness-105"
                                />
                            </div>
                        </div>
                        <div className="mt-20 md:mt-24 lg:mt-32 w-full max-w-md mx-auto xl:ml-0 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center lg:text-left">
                            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-3">{t('contact.emailUs')}</h3>
                            <p className="text-slate-500 text-sm md:text-base leading-relaxed mb-4">
                                For any inquiries, support, or feedback, feel free to email us. Our team will get back to you within 24–48 hours.
                            </p>
                            <div className="bg-slate-50 py-3 px-4 rounded-xl border border-slate-100 inline-block">
                                <a href="mailto:support@autopaneai.com" className="inline-flex items-center gap-2 text-base font-bold text-[#00A8E4] hover:text-[#0082b3] transition-colors">
                                    <MailOutlined className="text-lg" />
                                    support@autopaneai.com
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Standard Form */}
                    <div className="lg:col-span-6">
                        <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-200 shadow-sm h-full flex flex-col justify-center">
                            {submitted ? (
                                <div className="text-center py-8 animate-fade-in">
                                    <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100">
                                        <CheckCircleOutlined className="text-2xl text-green-500" />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-800 mb-1">{t('contact.messageSent')}</h2>
                                    <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
                                        {t('contact.messageSentDesc')}
                                    </p>
                                    <Button
                                        onClick={handleReset}
                                        className="h-11 px-8 rounded-xl text-sm font-bold bg-[#00A8E4] text-white hover:!bg-[#0082b3] !border-none transition-all shadow-md shadow-blue-200"
                                    >
                                        {t('contact.sendAnother')}
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-8 h-8 rounded-lg bg-[#00A8E4] flex items-center justify-center text-white text-base shadow-sm">
                                            <UserOutlined />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-slate-900 m-0">{t('contact.tellUsAboutYourself')}</h3>
                                            <p className="text-slate-400 text-[10px] m-0">Typically replies within 24 hours.</p>
                                        </div>
                                    </div>

                                    <Form
                                        form={form}
                                        layout="vertical"
                                        onFinish={onFinish}
                                        requiredMark={false}
                                        size="middle"
                                        className="form-compact"
                                        initialValues={{ phonePrefix: '+1', businessType: 'new' }}
                                    >
                                        <Form.Item
                                            name="shopName"
                                            label={<span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('contact.companyName')}</span>}
                                            rules={[{ required: true, message: 'Required' }]}
                                            className="mb-3"
                                        >
                                            <Input className="!rounded-lg bg-slate-50 border-slate-200 hover:border-[#0082b3] focus:border-[#00A8E4] transition-all h-10 text-xs" placeholder="e.g. Acme Auto Glass" />
                                        </Form.Item>

                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                            <Form.Item
                                                name="firstName"
                                                label={<span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('contact.firstName')}</span>}
                                                rules={[{ required: true, message: '!' }]}
                                                className="mb-0"
                                            >
                                                <Input className="!rounded-lg bg-slate-50 border-slate-200 hover:border-[#0082b3] focus:border-[#00A8E4] transition-all h-10 text-xs" placeholder="John" />
                                            </Form.Item>
                                            <Form.Item
                                                name="lastName"
                                                label={<span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('contact.lastName')}</span>}
                                                rules={[{ required: true, message: '!' }]}
                                                className="mb-0"
                                            >
                                                <Input className="!rounded-lg bg-slate-50 border-slate-200 hover:border-[#0082b3] focus:border-[#00A8E4] transition-all h-10 text-xs" placeholder="Doe" />
                                            </Form.Item>
                                        </div>

                                        <Form.Item
                                            name="email"
                                            label={<span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('contact.email')}</span>}
                                            rules={[{ required: true, type: 'email', message: '!' }]}
                                            className="mb-3"
                                        >
                                            <Input className="!rounded-lg bg-slate-50 border-slate-200 hover:border-[#0082b3] focus:border-[#00A8E4] transition-all h-10 text-xs" placeholder="john@example.com" />
                                        </Form.Item>

                                        <Form.Item
                                            label={<span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('contact.phone')}</span>}
                                            className="mb-3"
                                        >
                                            <div className="flex gap-2">
                                                <Form.Item name="phonePrefix" noStyle>
                                                    <Select
                                                        style={{ width: 85 }}
                                                        className="[&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!h-10 [&_.ant-select-selector]:!bg-slate-50 [&_.ant-select-selector]:!border-slate-200 text-xs"
                                                        optionLabelProp="label"
                                                    >
                                                        {countryOptions.map(opt => (
                                                            <Option key={opt.code} value={opt.dial} label={opt.dial}>
                                                                <div className="flex gap-2"><span>{opt.flag}</span><span>{opt.label} ({opt.dial})</span></div>
                                                            </Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>
                                                <Form.Item name="phone" noStyle rules={[{ required: true, message: '!' }]}>
                                                    <Input className="flex-1 !rounded-lg bg-slate-50 border-slate-200 hover:border-[#0082b3] focus:border-[#00A8E4] transition-all h-10 text-xs" placeholder="(555) 000-0000" />
                                                </Form.Item>
                                            </div>
                                        </Form.Item>

                                        <Form.Item
                                            name="message"
                                            label={<span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('contact.message')}</span>}
                                            className="mb-6"
                                        >
                                            <Input.TextArea
                                                rows={2}
                                                className="!rounded-lg bg-slate-50 border-slate-200 hover:border-[#0082b3] focus:border-[#00A8E4] transition-all text-xs"
                                                placeholder={t('contact.howCanWeHelp')}
                                            />
                                        </Form.Item>

                                        <Form.Item className="mb-0">
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                loading={loading}
                                                className="w-full !h-11 !rounded-xl !text-sm !font-bold !bg-[#00A8E4] hover:!bg-[#0082b3] !border-none shadow-md shadow-blue-200 transition-all hover:-translate-y-1 active:scale-[0.98]"
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

                {/* Section Divider */}
                <div className="w-full h-px bg-slate-200 my-20"></div>

                {/* How It Works Section */}
                <div className="w-full mb-24">
                    <div className="text-center mb-16">
                        <span className="text-[#00A8E4] font-bold tracking-[0.2em] uppercase text-xs mb-3 block">{t('contact.howItWorks')}</span>
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                            3 <span className="text-[#00A8E4]">{t('contact.simpleSteps')}</span> {t('contact.toGetStarted')}
                        </h2>
                        <h3 className="text-lg md:text-xl font-medium text-slate-600 mb-6 max-w-3xl mx-auto">{t('contact.howItWorksDesc')}</h3>
                    </div>

                    <div ref={stepsContainerRef} className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-[2px] bg-slate-200 z-0">
                            <div className="progress-line absolute top-0 left-0 h-full w-0 bg-[#00A8E4]"></div>
                        </div>
                        
                        {[
                            {
                                step: "01",
                                title: t('contact.step1Title'),
                                desc: t('contact.step1Desc'),
                                icon: <UserOutlined />
                            },
                            {
                                step: "02",
                                title: t('contact.step2Title'),
                                desc: t('contact.step2Desc'),
                                icon: <CheckCircleOutlined />
                            },
                            {
                                step: "03",
                                title: t('contact.step3Title'),
                                desc: t('contact.step3Desc'),
                                icon: <MailOutlined />
                            }
                        ].map((item, index) => (
                            <div key={index} className="relative z-10 flex flex-col items-center group text-center px-4 pt-10">
                                <div className={`step-card-${index} w-full bg-white p-6 md:p-8 rounded-[1.5rem] border border-slate-200 shadow-sm transition-all relative pt-14 flex flex-col items-center h-full`}>
                                    <div className={`step-circle-${index} absolute -top-10 w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-xl text-slate-300 border-2 border-slate-200 transition-colors`}>
                                        {item.icon}
                                        <span className={`step-badge-${index} absolute -top-1 -right-1 text-[10px] font-black w-6 h-6 rounded-full bg-slate-300 text-white flex items-center justify-center border-2 border-white transition-colors`}>
                                            {item.step}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3 mt-4">{item.title}</h3>
                                    <p className="text-slate-500 leading-relaxed text-sm max-w-[240px]">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Why Connect Section */}
                <div className="w-full mb-32 bg-slate-50 rounded-[3rem] p-10 md:p-16 border border-slate-100">
                    <div className="flex flex-col lg:flex-row gap-16 items-center">
                        <div className="lg:w-2/5">
                            <span className="text-[#00A8E4] font-bold tracking-[0.2em] uppercase text-xs mb-3 block">{t('contact.why')}</span>
                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 mb-6 leading-[1.1]">
                                {t('contact.connectWith')} <span className="text-[#00A8E4]">APAI?</span>
                            </h2>
                            <p className="text-slate-500 text-lg leading-relaxed">
                                {t('contact.whyConnectDesc')}
                            </p>
                        </div>

                        <div className="lg:w-3/5 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                                { title: t('contact.expertGuidance'), desc: t('contact.expertGuidanceDesc'), icon: <BulbOutlined style={{ color: '#ffffff' }} /> },
                                { title: t('contact.tailoredSolutions'), desc: t('contact.tailoredSolutionsDesc'), icon: <SettingOutlined style={{ color: '#ffffff' }} /> },
                                { title: t('contact.zeroPressureDemos'), desc: t('contact.zeroPressureDemosDesc'), icon: <PlaySquareOutlined style={{ color: '#ffffff' }} /> },
                                { title: t('contact.rapidSupport'), desc: t('contact.rapidSupportDesc'), icon: <ThunderboltOutlined style={{ color: '#ffffff' }} /> }
                            ].map((item, index) => (
                                <div key={index} className="bg-[#00A8E4] p-6 rounded-[1.5rem] shadow-md transition-all hover:-translate-y-1 hover:shadow-lg shadow-cyan-500/20">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl mb-4 border border-white/30 shadow-inner backdrop-blur-sm">
                                        {item.icon}
                                    </div>
                                    <h4 className="text-base font-bold text-white mb-2">{item.title}</h4>
                                    <p className="text-cyan-50 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ContactPage;
