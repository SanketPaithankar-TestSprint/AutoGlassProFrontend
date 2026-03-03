import React, { useEffect, useRef, useState } from "react";
import { CheckOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const WhyChooseSection = () => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    const benefits = t('whyChooseSection.benefits', { returnObjects: true }) || [];

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
        <section ref={sectionRef} className="py-20 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                    {/* Left Column: Text */}
                    <div>
                        <h2
                            className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text mb-6 opacity-0"
                            style={isVisible ? {
                                animation: `fadeInUp 0.6s ease-out 0.3s forwards`,
                                backgroundImage: 'linear-gradient(90deg, #7E5CFE 0%, #00A8E4 100%)'
                            } : {}}
                        >
                            {t('whyChooseSection.title')}
                        </h2>
                        <p
                            className="text-lg text-slate-600 leading-relaxed opacity-0"
                            style={isVisible ? {
                                animation: `fadeInUp 0.6s ease-out 0.4s forwards`
                            } : {}}
                        >
                            {t('whyChooseSection.desc')}
                        </p>
                    </div>

                    {/* Right Column: Benefits List */}
                    <div className="space-y-6">
                        {benefits.map((benefit, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-4 opacity-0"
                                style={isVisible ? {
                                    animation: `fadeInUp 0.6s ease-out ${0.5 + (index * 0.2)}s forwards`
                                } : {}}
                            >
                                <div className="mt-1">
                                    <CheckOutlined className="text-lg" style={{ color: '#7E5CFE' }} />
                                </div>
                                <div>
                                    <span className="font-bold text-slate-800">{benefit.title}: </span>
                                    <span className="text-slate-600">{benefit.desc}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WhyChooseSection;
