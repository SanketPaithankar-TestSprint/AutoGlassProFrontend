import React, { useEffect, useRef, useState } from "react";
import {
    CarOutlined,
    DollarOutlined,
    FileTextOutlined,
    TeamOutlined,
    UserOutlined,
    LockOutlined
} from "@ant-design/icons";

const features = [
    {
        icon: <CarOutlined className="text-2xl" style={{ color: '#7E5CFE' }} />,
        title: "VIN-Based Vehicle Lookup",
        description: "Instantly identify vehicles using 17-character VINs. Auto-populates year, make, model, and style for 100% accuracy through NHTSA VPIC API integration."
    },
    {
        icon: <DollarOutlined className="text-2xl" style={{ color: '#d946ef' }} />, // fuchsia-500
        title: "Real-Time Pricing",
        description: "Access up-to-date glass part pricing integrated with supplier databases. Automatic calculations for parts, labor, tax, and discounts in seconds."
    },
    {
        icon: <FileTextOutlined className="text-2xl" style={{ color: '#7E5CFE' }} />,
        title: "Professional Documents",
        description: "Generate branded quotes, work orders, and invoices with customized pricing breakdowns, terms, and professional formatting ready to send to customers."
    },
    {
        icon: <TeamOutlined className="text-2xl" style={{ color: '#c026d3' }} />, // fuchsia-600
        title: "Team Collaboration",
        description: "Manage unlimited employees with role-based access control. Technicians, managers, sales teams, and administrators all work from one platform."
    },
    {
        icon: <UserOutlined className="text-2xl" style={{ color: '#7E5CFE' }} />,
        title: "Customer Management",
        description: "Maintain detailed customer profiles, vehicle history, and service records. Track quotes, work orders, and invoices per customer for relationship management."
    },
    {
        icon: <LockOutlined className="text-2xl" style={{ color: '#d946ef' }} />, // fuchsia-500
        title: "Enterprise Security",
        description: "All data encrypted and stored securely in the cloud. Automatic backups, role-based access control, and compliance-ready infrastructure."
    }
];

const FeaturesSection = () => {
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
        <section ref={sectionRef} className="py-16 px-4 max-w-7xl mx-auto">
            <div className="text-center mb-12">
                <h2
                    className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text opacity-0"
                    style={isVisible ? {
                        animation: `fadeInUp 0.6s ease-out 0.2s forwards`,
                        backgroundImage: 'linear-gradient(90deg, #7E5CFE 0%, #9d7eff 100%)'
                    } : {}}
                >
                    Powerful Features Built for Your Business
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl p-8 shadow-sm border border-slate-100 transition-all duration-300 group opacity-0"
                        style={isVisible ? {
                            // Start card animations after heading (0.2s heading delay + ~0.4s to start cards)
                            animation: `fadeInUp 0.6s ease-out ${0.4 + (index * 0.1)}s forwards`
                        } : {}}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#ffffff'; // White outline
                            e.currentTarget.style.boxShadow = '0 0 40px rgba(126, 92, 254, 0.6)'; // Even bigger glow
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#f1f5f9'; // slate-100
                            e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)'; // shadow-sm
                        }}
                    >
                        <div className="mb-6">
                            <div
                                className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center transition-colors duration-300"
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(126, 92, 254, 0.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} // slate-50
                            >
                                {feature.icon}
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">
                            {feature.title}
                        </h3>
                        <p className="text-slate-600 leading-relaxed text-sm">
                            {feature.description}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default FeaturesSection;
