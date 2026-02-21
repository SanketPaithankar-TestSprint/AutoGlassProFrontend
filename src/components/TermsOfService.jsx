import React, { useEffect } from 'react';
import { Typography, Divider } from 'antd';
import { FileProtectOutlined } from '@ant-design/icons';
import PageHead from './PageHead';

const { Title, Text, Paragraph } = Typography;

const TermsOfService = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const sections = [
        {
            number: "1",
            title: "Scope of Service",
            intro: "APAI provides an all-in-one AI-driven management platform specifically for the auto glass industry. Our services include, but are not limited to:",
            content: [
                { label: "AI-Assisted Quoting:", text: "Generating estimates using integrated NAGS data and proprietary SmartVIN technology." },
                { label: "Field Service Management:", text: "Tools to streamline technician workflows and mobile operations." },
                { label: "Business Administration:", text: "Features for invoicing, payment tracking, and insurance (EDI) billing management." },
            ],
            type: "labeled-list"
        },
        {
            number: "2",
            title: "User Accounts and Eligibility",
            intro: null,
            content: [
                { label: "Professional Use:", text: "This platform is designed strictly for auto glass shop owners, repair shop owners, and technicians." },
                { label: "Account Responsibility:", text: "You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account." },
                { label: "Accuracy of Information:", text: "You agree to provide accurate and complete business information during registration and to keep this data current." },
            ],
            type: "labeled-list"
        },
        {
            number: "3",
            title: "Subscription and Fees",
            intro: null,
            content: [
                { label: "Pricing:", text: "Access to the APAI platform is currently provided at a subscription rate of $99." },
                { label: "Free Trials:", text: "If you sign up for a free trial, you will have access to the platform's features for the duration of the trial period specified at signup." },
                { label: "Payment Terms:", text: "Fees are non-refundable unless otherwise stated. We reserve the right to modify pricing with prior notice to active subscribers." },
            ],
            type: "labeled-list"
        },
        {
            number: "4",
            title: "Data Usage and Industry Integrations",
            intro: null,
            content: [
                { label: "NAGS Data:", text: "Your use of the platform includes access to NAGS (National Auto Glass Specifications) data for the purpose of generating accurate quotes." },
                { label: "Third-Party Distributors:", text: "The platform may facilitate communication with third-party glass distributors (e.g., Pilkington) for live pricing and parts availability." },
                { label: "Insurance Billing:", text: "Users utilizing EDI billing features are responsible for the accuracy of claims submitted through the platform." },
            ],
            type: "labeled-list"
        },
        {
            number: "5",
            title: "Intellectual Property",
            intro: null,
            content: [
                { label: "Platform Ownership:", text: "All software, AI models, SmartVIN technology, and interface designs are the exclusive property of APAI." },
                { label: "License:", text: "We grant you a limited, non-transferable, non-exclusive license to use the platform solely for your internal business operations." },
            ],
            type: "labeled-list"
        },
        {
            number: "6",
            title: "Limitation of Liability",
            intro: null,
            content: [
                { label: "Service Continuity:", text: 'While we strive for 100% accuracy and uptime, APAI provides the service on an "as-is" basis.' },
                { label: "Business Outcomes:", text: "APAI is not liable for any lost profits, wasted technician trips, or customer disputes resulting from the use or inability to use the platform." },
            ],
            type: "labeled-list"
        },
        {
            number: "7",
            title: "Termination",
            intro: "We reserve the right to suspend or terminate your account if you violate these Terms or engage in any activity that harms the platform or other users. You may cancel your subscription at any time through your account settings.",
            content: [],
            type: "intro-only"
        },
        {
            number: "8",
            title: "Governing Law",
            intro: "These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.",
            content: [],
            type: "intro-only"
        },
        {
            number: "9",
            title: "Contact Information",
            intro: "For questions or formal notices regarding these Terms, please contact us at:",
            content: [
                { label: "AutoPane AI (APAI)", text: null },
                { label: "Email:", text: "support@autopaneai.com", isEmail: true },
            ],
            type: "contact"
        },
    ];

    return (
        <div className="min-h-screen bg-white pb-20 pt-10 px-6 md:px-12 lg:px-20 relative overflow-hidden">
            <PageHead
                title="Terms of Service | APAI Auto Glass Management Software"
                description="Review the terms and conditions for using APAI's AI-powered auto glass platform. Learn about subscriptions, usage rights, and our $99 service."
            />
            {/* Static gradient background */}
            <div
                className="fixed inset-0 z-0 pointer-events-none opacity-20"
                style={{ background: 'linear-gradient(135deg, #7E5CFE 0%, #00A8E4 100%)' }}
            />

            <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12 relative z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <FileProtectOutlined className="text-5xl text-violet-600 mb-4" />
                    <Title level={1} className="!text-3xl md:!text-4xl !font-bold !text-slate-900 !mb-3 !font-outfit">
                        Terms of Service
                    </Title>
                    <Paragraph className="!text-slate-600 !text-base !mb-1 !leading-relaxed max-w-2xl mx-auto">
                        These Terms of Service ("Terms") govern your access to and use of the website and platform provided by
                        AutoPane AI (APAI) ("we," "us," or "our"). By creating an account, starting a free trial, or using our
                        services, you agree to be bound by these Terms.
                    </Paragraph>
                    <Text className="text-slate-400 text-sm">
                        Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </Text>
                </div>

                <div className="space-y-10">
                    {sections.map((section, index) => (
                        <div key={index}>
                            <Title level={3} className="!text-xl !font-bold !text-slate-800 !mb-3 !font-outfit">
                                {section.number}. {section.title}
                            </Title>

                            {section.intro && (
                                <Paragraph className="!text-slate-600 !leading-relaxed !text-base !mb-3">
                                    {section.intro}
                                </Paragraph>
                            )}

                            {section.type === "labeled-list" && section.content.length > 0 && (
                                <ul className="list-disc pl-5 space-y-2">
                                    {section.content.map((item, idx) => (
                                        <li key={idx} className="text-slate-600 leading-relaxed text-base">
                                            <span className="font-semibold text-slate-800">{item.label}</span>{" "}
                                            {item.text}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {section.type === "contact" && section.content.length > 0 && (
                                <ul className="list-none pl-0 space-y-1">
                                    {section.content.map((item, idx) => (
                                        <li key={idx} className="text-slate-700 text-base font-medium">
                                            {item.isEmail ? (
                                                <>
                                                    <span className="font-semibold text-slate-800">{item.label}</span>{" "}
                                                    <a
                                                        href={`mailto:${item.text}`}
                                                        className="text-violet-600 hover:text-violet-800 underline transition-colors"
                                                    >
                                                        {item.text}
                                                    </a>
                                                </>
                                            ) : (
                                                <span className="font-semibold text-slate-800">{item.label}</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {index < sections.length - 1 && <Divider className="!my-8 !border-slate-100" />}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
