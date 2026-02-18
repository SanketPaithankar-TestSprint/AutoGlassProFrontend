import React, { useEffect, useRef, useState } from "react";
import { CheckOutlined } from "@ant-design/icons";

const models = [
    {
        icon: "🏪",
        title: "Shop Owners",
        description: "Manage your brick-and-mortar location with multiple staff members, handle billing, and scale your business.",
        features: [
            "Full platform access",
            "Unlimited employee management",
            "Multi-location support",
            "Advanced reporting"
        ]
    },
    {
        icon: "🚐",
        title: "Mobile Installers",
        description: "Work independently or lead a mobile team. Generate quotes on-the-go and manage service delivery.",
        features: [
            "Mobile-responsive design",
            "Job scheduling",
            "Photo documentation",
            "Customer communication"
        ]
    },
    {
        icon: "👨‍💼",
        title: "Repair Shops",
        description: "Streamline auto glass repairs with professional documentation, team coordination, and customer management.",
        features: [
            "Customer tracking",
            "Vehicle history",
            "Team workflows",
            "Payment management"
        ]
    }
];

const BusinessModelsSection = () => {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

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
                    className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text mb-4 opacity-0"
                    style={isVisible ? {
                        animation: `fadeInUp 0.6s ease-out 0.3s forwards`,
                        backgroundImage: 'linear-gradient(90deg, #00A8E4 0%, #33c3f0 100%)'
                    } : {}}
                >
                    Built for Different Business Models
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {models.map((model, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 transition-all duration-200 text-center flex flex-col h-full group opacity-0"
                        style={isVisible ? {
                            animation: `fadeInUp 0.6s ease-out ${0.5 + (index * 0.2)}s forwards`
                        } : {}}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#ffffff';
                            e.currentTarget.style.boxShadow = '0 0 40px rgba(0, 168, 228, 0.4)'; // Blue glow
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e2e8f0'; // slate-200
                            e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                        }}
                    >
                        <div className="mb-6 transform group-hover:scale-110 transition-transform duration-200">
                            <div className="text-4xl bg-slate-50 w-20 h-20 mx-auto rounded-2xl flex items-center justify-center">
                                {model.icon}
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 mb-4">
                            {model.title}
                        </h3>

                        <p className="text-slate-600 text-sm leading-relaxed mb-8 min-h-[60px]">
                            {model.description}
                        </p>

                        <div className="mt-auto text-left space-y-3">
                            {model.features.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-3 text-sm text-slate-600">
                                    <CheckOutlined className="flex-shrink-0" style={{ color: '#00A8E4' }} />
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default BusinessModelsSection;
