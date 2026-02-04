import React, { useEffect } from 'react';
import { Typography, Divider } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const PrivacyPolicy = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = "APAI | Privacy Policy";
    }, []);

    const sections = [
        {
            title: "Introduction",
            content: [
                "We value the privacy and security of our users’ personal information.",
                "This policy explains how information is collected, used, and protected through our website."
            ]
        },
        {
            title: "Information We Collect",
            content: [
                "Personal details such as name, email address, phone number, and company name.",
                "Technical information including device and browser details."
            ]
        },
        {
            title: "How We Use Your Information",
            content: [
                "To provide services such as free demos.",
                "To communicate about products and services.",
                "To personalize user experience and improve our offerings.",
                "To send marketing communications, which users may opt out of at any time."
            ]
        },
        {
            title: "Data Protection & Security",
            content: [
                "We use reasonable and industry-standard security measures.",
                "Protection against unauthorized access, disclosure, alteration, or destruction.",
                "Encryption for sensitive information.",
                "Access limited to authorized employees and contractors only."
            ]
        },
        {
            title: "Sharing of Information",
            content: [
                "We do not sell or rent personal information.",
                "Information may be shared with trusted partners solely to provide services.",
                "Data may be disclosed to comply with legal obligations."
            ]
        },
        {
            title: "User Rights",
            content: [
                "Right to access, correct, or delete personal data.",
                "Right to object to or restrict processing.",
                "Right to request data in a machine-readable format."
            ]
        },
        {
            title: "Contact Information",
            content: [
                "Users may contact us for privacy-related questions or requests.",
                "Contact via official support email."
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-white pb-20 pt-10 px-6 md:px-12 lg:px-20 relative overflow-hidden">
            {/* Simple static gradient background */}
            <div
                className="fixed inset-0 z-0 pointer-events-none opacity-20"
                style={{ background: 'linear-gradient(135deg, #7E5CFE 0%, #00A8E4 100%)' }}
            />

            <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-100 p-8 md:p-12 relative z-10">
                <div className="text-center mb-12">
                    <SafetyCertificateOutlined className="text-5xl text-violet-600 mb-4" />
                    <Title level={1} className="!text-3xl md:!text-4xl !font-bold !text-slate-900 !mb-4 !font-outfit">
                        Privacy Policy
                    </Title>
                    <Text className="text-slate-500 text-lg">
                        Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </Text>
                </div>

                <div className="space-y-10">
                    {sections.map((section, index) => (
                        <div key={index}>
                            <Title level={3} className="!text-xl !font-bold !text-slate-800 !mb-4 !font-outfit">
                                {section.title}
                            </Title>
                            <ul className="list-disc pl-5 space-y-2">
                                {section.content.map((item, idx) => (
                                    <li key={idx} className="text-slate-600 leading-relaxed text-base">
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            {index < sections.length - 1 && <Divider className="!my-8 !border-slate-100" />}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
