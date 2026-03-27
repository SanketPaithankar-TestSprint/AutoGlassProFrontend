import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const ProcessSection = () => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    const steps = [
        {
            number: "1",
            title: t('processSection.step1.title'),
            description: t('processSection.step1.desc')
        },
        {
            number: "2",
            title: t('processSection.step2.title'),
            description: t('processSection.step2.desc')
        },
        {
            number: "3",
            title: t('processSection.step3.title'),
            description: t('processSection.step3.desc')
        },
        {
            number: "4",
            title: t('processSection.step4.title'),
            description: t('processSection.step4.desc')
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
        <section ref={sectionRef} className="py-16 px-4 max-w-7xl mx-auto">
            <div className="text-center mb-16">
                <h2
                    className="section-heading text-transparent bg-clip-text mb-4 opacity-0"
                    style={isVisible ? {
                        animation: `fadeInUp 0.6s ease-out 0.3s forwards`,
                        backgroundImage: 'linear-gradient(90deg, #7B5BE6 0%, #3FAFD0 50%, #0F9AC7 100%)'
                    } : {}}
                >
                    {t('processSection.title')}
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {steps.map((step, index) => (
                    <div
                        key={index}
                        className="premium-card transition-all duration-200 text-center opacity-0 group"
                        style={isVisible ? {
                            animation: `fadeInUp 0.6s ease-out ${0.5 + (index * 0.2)}s forwards`
                        } : {}}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#ffffff';
                            e.currentTarget.style.boxShadow = '0 0 40px rgba(126, 92, 254, 0.6)'; // Purple glow
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e2e8f0'; // slate-200
                        }}
                    >
                        <div className="mb-6 transform group-hover:scale-110 transition-transform duration-200">
                            <div
                                className="w-12 h-12 mx-auto rounded-full text-white flex items-center justify-center text-xl font-bold shadow-lg"
                                style={{ backgroundColor: '#7E5CFE', boxShadow: '0 10px 15px -3px rgba(126, 92, 254, 0.3)' }}
                            >
                                {step.number}
                            </div>
                        </div>
                         <h3 className="card-title mb-4 h-12 flex items-center justify-center">
                            {step.title}
                        </h3>
                         <p className="body-text">
                            {step.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ProcessSection;
