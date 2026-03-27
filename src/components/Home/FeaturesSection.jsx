import React, { useEffect, useRef, useState } from "react";
import {
    CarOutlined,
    DollarOutlined,
    FileTextOutlined,
    TeamOutlined,
    UserOutlined,
    LockOutlined
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const FEATURE_ICON_CLASS = "text-2xl text-violet-600";

const FeaturesSection = () => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    const features = [
        {
            icon: <CarOutlined className={FEATURE_ICON_CLASS} />,
            title: t('featuresSection.vinLookup.title'),
            description: t('featuresSection.vinLookup.desc')
        },
        {
            icon: <DollarOutlined className={FEATURE_ICON_CLASS} />,
            title: t('featuresSection.realTimePricing.title'),
            description: t('featuresSection.realTimePricing.desc')
        },
        {
            icon: <FileTextOutlined className={FEATURE_ICON_CLASS} />,
            title: t('featuresSection.professionalDocs.title'),
            description: t('featuresSection.professionalDocs.desc')
        },
        {
            icon: <TeamOutlined className={FEATURE_ICON_CLASS} />,
            title: t('featuresSection.teamCollab.title'),
            description: t('featuresSection.teamCollab.desc')
        },
        {
            icon: <UserOutlined className={FEATURE_ICON_CLASS} />,
            title: t('featuresSection.customerMgmt.title'),
            description: t('featuresSection.customerMgmt.desc')
        },
        {
            icon: <LockOutlined className={FEATURE_ICON_CLASS} />,
            title: t('featuresSection.enterpriseSecurity.title'),
            description: t('featuresSection.enterpriseSecurity.desc')
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
                threshold: 0.1, // Trigger when 10% of the section is visible
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
            <div className="text-center mb-12">
                <h2
                    className="section-heading text-transparent bg-clip-text opacity-0"
                    style={isVisible ? {
                        animation: `fadeInUp 0.6s ease-out 0.2s forwards`,
                        backgroundImage: 'linear-gradient(90deg, #7B5BE6 0%, #3FAFD0 50%, #0F9AC7 100%)'
                    } : {}}
                >
                    {t('featuresSection.title')}
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                     <div
                        key={index}
                        className="premium-card group opacity-0"
                        style={isVisible ? {
                            // Start card animations after heading (0.2s heading delay + ~0.4s to start cards)
                            animation: `fadeInUp 0.6s ease-out ${0.4 + (index * 0.1)}s forwards`
                        } : {}}
                    >
                        <div className="mb-6">
                            <div
                                className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center transition-colors duration-300 group-hover:bg-violet-50"
                            >
                                {feature.icon}
                            </div>
                        </div>
                         <h3 className="card-title mb-3">
                            {feature.title}
                        </h3>
                         <p className="body-text">
                            {feature.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default FeaturesSection;
