import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, Divider } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';
import PageHead from './PageHead';

const { Title, Text, Paragraph } = Typography;

const PrivacyPolicy = () => {
    const { t } = useTranslation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const sections = [
        {
            number: "1",
            title: "Information We Collect",
            intro: "To provide our all-in-one platform services, including AI-assisted quoting and field service management, we collect several types of information:",
            content: [
                { label: "Account Information:", text: "When you register for an account or start a free trial, we collect your name, business name, physical address, and contact information." },
                { label: "Business Operations Data:", text: "This includes information processed through the platform such as vehicle details (VINs), glass part numbers (NAGS data), labor rates, and installation kit pricing." },
                { label: "Customer Information:", text: "When you generate a quote or invoice, you provide information about your customers, including their names, contact details, and vehicle information." },
                { label: "Payment Information:", text: "We process payment data for our subscription services, currently offered at a flat rate of $99." },
                { label: "Technical Data:", text: "We automatically collect standard internet log information, including IP addresses, browser types, and usage patterns through cookies and similar tracking technologies." },
            ],
            type: "labeled-list"
        },
        {
            number: "2",
            title: "How We Use Your Information",
            intro: "We utilize the collected data to maintain and improve our services, specifically to:",
            content: [
                "Generate 100% accurate quotes using integrated NAGS data and proprietary SmartVIN technology.",
                "Streamline field service operations and manage invoicing and insurance billing.",
                "Provide customer support and respond to inquiries sent to support@autopaneai.com.",
                "Process payments and manage your subscription.",
                "Comply with legal obligations and protect against fraudulent or illegal activity.",
            ],
            type: "bullet-list"
        },
        {
            number: "3",
            title: "Data Sharing and Disclosure",
            intro: "We do not sell your personal or business data to third parties. We may share information with:",
            content: [
                { label: "Service Providers:", text: "Trusted third-party vendors who assist in operating our platform (e.g., payment processors, cloud hosting, and email delivery services)." },
                { label: "Industry Partners:", text: "Information may be exchanged with distributors (e.g., Pilkington) or insurance entities for the purpose of live pricing or EDI billing as initiated by your use of the platform." },
                { label: "Legal Compliance:", text: "We may disclose information if required by law or in response to valid requests by public authorities." },
            ],
            type: "labeled-list"
        },
        {
            number: "4",
            title: "Data Security",
            intro: "We implement industry-standard security measures, including encryption and secure access controls, to protect your data from unauthorized access, alteration, or destruction. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.",
            content: [],
            type: "intro-only"
        },
        {
            number: "5",
            title: "Your Rights and Choices",
            intro: "Depending on your location, you may have rights regarding your personal data, including the right to access, correct, or delete the information we hold about you. You can manage most account details directly through the APAI dashboard.",
            content: [],
            type: "intro-only"
        },
        {
            number: "6",
            title: "Children's Privacy",
            intro: "Our services are strictly for professional use by adults in the auto glass industry and are not directed at individuals under the age of 18.",
            content: [],
            type: "intro-only"
        },
        {
            number: "7",
            title: "Changes to This Policy",
            intro: "We may update this Privacy Policy from time to time to reflect changes in our practices or for legal reasons. We will notify you of any significant changes by posting the new policy on this page.",
            content: [],
            type: "intro-only"
        },
        {
            number: "8",
            title: "Contact Us",
            intro: "If you have any questions about this Privacy Policy or our data practices, please contact us at:",
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
                title="Privacy Policy | APAI Auto Glass Management Software"
                description="Read the APAI Privacy Policy. Learn how we protect your auto glass shop's data, ensure secure transactions, and maintain your business confidentiality."
            />
            {/* Static gradient background */}
            <div
                className="fixed inset-0 z-0 pointer-events-none opacity-20"
                style={{ background: 'linear-gradient(135deg, #7E5CFE 0%, #00A8E4 100%)' }}
            />

            <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12 relative z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <SafetyCertificateOutlined className="text-5xl text-violet-600 mb-4" />
                    <Title level={1} className="!text-3xl md:!text-4xl !font-bold !text-slate-900 !mb-3 !font-outfit">
                        {t('privacy.title')}
                    </Title>
                    <Paragraph className="!text-slate-600 !text-base !mb-1 !leading-relaxed max-w-2xl mx-auto">
                        This Privacy Policy describes how AutoPane AI (APAI) ("we," "us," or "our") collects, uses, and discloses
                        your information when you use our website (<a href="https://autopaneai.com/" target="_blank" rel="noopener noreferrer" className="text-violet-600 underline">https://autopaneai.com/</a>) and our AI-driven
                        management platform designed for the auto glass industry. We are committed to protecting the privacy of
                        auto glass shop owners, technicians, and their customers.
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

                            {section.type === "bullet-list" && section.content.length > 0 && (
                                <ul className="list-disc pl-5 space-y-2">
                                    {section.content.map((item, idx) => (
                                        <li key={idx} className="text-slate-600 leading-relaxed text-base">
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {section.type === "contact" && section.content.length > 0 && (
                                <ul className="list-none pl-0 space-y-1">
                                    {section.content.map((item, idx) => (
                                        <li key={idx} className="text-slate-700 text-base font-medium">
                                            {item.isEmail ? (
                                                <><span className="font-semibold text-slate-800">{item.label}</span>{" "}
                                                    <a href={`mailto:${item.text}`} className="text-violet-600 hover:text-violet-800 underline transition-colors">{item.text}</a>
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

export default PrivacyPolicy;
