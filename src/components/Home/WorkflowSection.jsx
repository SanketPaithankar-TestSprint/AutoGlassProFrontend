import React, { useEffect, useRef, useState } from "react";
import {
    FormOutlined,
    CheckSquareOutlined,
    ToolOutlined,
    CreditCardOutlined
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const WorkflowSection = () => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    const stepsTranslations = t('workflowSection.steps', { returnObjects: true }) || [];

    const steps = [
        {
            icon: <FormOutlined className="text-4xl" style={{ color: '#00A8E4' }} />,
            title: stepsTranslations[0]?.title || '',
            description: stepsTranslations[0]?.desc || ''
        },
        {
            icon: <CheckSquareOutlined className="text-4xl" style={{ color: '#00A8E4' }} />,
            title: stepsTranslations[1]?.title || '',
            description: stepsTranslations[1]?.desc || ''
        },
        {
            icon: <ToolOutlined className="text-4xl" style={{ color: '#00A8E4' }} />,
            title: stepsTranslations[2]?.title || '',
            description: stepsTranslations[2]?.desc || ''
        },
        {
            icon: <CreditCardOutlined className="text-4xl" style={{ color: '#00A8E4' }} />,
            title: stepsTranslations[3]?.title || '',
            description: stepsTranslations[3]?.desc || ''
        }
    ];

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            {
                threshold: 0.1,
                rootMargin: "0px"
            }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

    return (
        <section ref={sectionRef} className="section-padding px-4 max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <h2
                    className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text mb-4 opacity-0"
                    style={isVisible ? {
                        animation: `fadeInUp 0.6s ease-out 0.2s forwards`,
                        backgroundImage: 'linear-gradient(90deg, #00A8E4 0%, #33c3f0 100%)'
                    } : {}}
                >
                    {t('workflowSection.title')}
                </h2>
                <p className="text-slate-500 text-lg">
                    {t('workflowSection.subtitle')}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {steps.map((step, index) => (
                    <div
                        key={index}
                        className="premium-card bg-white rounded-xl p-8 text-center group opacity-0"
                        style={isVisible ? {
                            animation: `fadeInUp 0.6s ease-out ${0.4 + (index * 0.1)}s forwards`
                        } : {}}
                    >
                        <div className="mb-6 transform group-hover:scale-110 transition-transform duration-200">
                            <div
                                className="w-16 h-16 mx-auto rounded-2xl bg-slate-50 flex items-center justify-center mb-4 transition-colors duration-200"
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 168, 228, 0.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                            >
                                {step.icon}
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-4">
                            {step.title}
                        </h3>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            {step.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default WorkflowSection;
