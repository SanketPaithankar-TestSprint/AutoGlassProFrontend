import React, { useEffect, useRef, useState } from "react";
import {
    FileTextOutlined,
    CheckSquareOutlined,
    ToolOutlined,
    CreditCardOutlined
} from "@ant-design/icons";

const steps = [
    {
        icon: <FileTextOutlined className="text-4xl" style={{ color: '#00A8E4' }} />,
        title: "Create Quote",
        description: "Generate professional quotes with customer info, vehicle details, glass parts, labor costs, and automatic pricing calculations in minutes."
    },
    {
        icon: <CheckSquareOutlined className="text-4xl" style={{ color: '#00A8E4' }} />,
        title: "Approve & Convert",
        description: "Customer reviews and accepts quote. System automatically converts to work order and schedules service with assigned technician."
    },
    {
        icon: <ToolOutlined className="text-4xl" style={{ color: '#00A8E4' }} />,
        title: "Execute Service",
        description: "Technicians complete work in field with before/after photo documentation, time logging, and customer signature confirmation."
    },
    {
        icon: <CreditCardOutlined className="text-4xl" style={{ color: '#00A8E4' }} />,
        title: "Invoice & Track",
        description: "Automatically generate invoices with payment tracking. Monitor partial payments, overdue invoices, and late fees all in one dashboard."
    }
];

const WorkflowSection = () => {
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
                        animation: `fadeInUp 0.6s ease-out 0.2s forwards`,
                        backgroundImage: 'linear-gradient(90deg, #00A8E4 0%, #33c3f0 100%)'
                    } : {}}
                >
                    Workflow from Quote to Invoice
                </h2>
                <p className="text-slate-500 text-lg">
                    Complete lifecycle management of every automotive glass service
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {steps.map((step, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-xl p-8 shadow-sm border border-slate-100 transition-all duration-200 text-center group opacity-0"
                        style={isVisible ? {
                            animation: `fadeInUp 0.6s ease-out ${0.4 + (index * 0.1)}s forwards`
                        } : {}}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#ffffff';
                            e.currentTarget.style.boxShadow = '0 0 40px rgba(0, 168, 228, 0.4)'; // Blue glow
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#f1f5f9';
                            e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                        }}
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
