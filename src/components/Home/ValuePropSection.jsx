import React, { useEffect, useRef, useState } from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import { CheckCircleFilled, MessageOutlined, FormOutlined } from "@ant-design/icons";

// Simple hook for intersection observer
const useIntersectionObserver = (options = {}) => {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const targetRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsIntersecting(true);
                observer.unobserve(entry.target); // Only animate once
            }
        }, options);

        if (targetRef.current) {
            observer.observe(targetRef.current);
        }

        return () => {
            if (targetRef.current) {
                observer.unobserve(targetRef.current);
            }
        };
    }, [options]);

    return [targetRef, isIntersecting];
};

const AnimatedSection = ({ children, delay = "0s", className = "" }) => {
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

    return (
        <div
            ref={ref}
            className={`${className}`}
            style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(60px)',
                transition: `all 1s cubic-bezier(0.17, 0.55, 0.55, 1) ${delay}`
            }}
        >
            {children}
        </div>
    );
};

const ValuePropSection = () => {
    const navigate = useNavigate();
    const pillars = [
        {
            title: "Quote with Precision",
            focus: "Instant, accurate NAGS part lookup.",
            benefit: "Eliminate pricing errors with VIN-based searches and real-time NAGS data.",
            color: "from-violet-600 to-fuchsia-600"
        },
        {
            title: "Execute with Confidence",
            focus: "Digital work order and mobile readiness.",
            benefit: "Dispatch technicians, track labor hours, and capture required documentation in the field.",
            color: "from-violet-600 to-fuchsia-600"
        },
        {
            title: "Get Paid Faster",
            focus: "Automated billing and tracking.",
            benefit: "Simplify insurance claims, monitor payment status, and send automatic overdue reminders.",
            color: "from-violet-600 to-fuchsia-600"
        }
    ];

    const keyFeatures = [
        {
            title: "100% VIN Accuracy",
            desc: "Our integration with the NHTSA VPIC API ensures perfect vehicle identification every time, matching Year, Make, Model, and Style to the correct glass part."
        },
        {
            title: "NAGS Code Integration",
            desc: "Access the absolute complete National Auto Glass Specifications (NAGS) catalog for real-time pricing and labor hours, ensuring maximum profitability on every job."
        },
        {
            title: "Quote-to-Invoice Flow",
            desc: "Effortlessly convert an approved quote into a Work Order and finally an Invoice with a single click—no duplicate data entry."
        }
    ];

    return (
        <div className="bg-transparent py-16 md:py-24 px-6 md:px-12 lg:px-20 overflow-hidden">

            {/* 1. Value Proposition Header */}
            <AnimatedSection>
                <div className="max-w-4xl mx-auto text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 font-outfit text-slate-900">
                        The AutoPaneAI Difference
                    </h2>
                    <p className="text-xl md:text-2xl text-violet-600 font-semibold mb-6">
                        Stop Juggling Systems. Start Growing.
                    </p>
                    <p className="text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto">
                        AutoPaneAI is a specialized B2B SaaS platform designed exclusively for auto glass repair shops
                        and mobile technicians to streamline the entire service lifecycle, turning quotes into paid invoices effortlessly.
                    </p>
                </div>
            </AnimatedSection>

            {/* 2. Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 max-w-7xl mx-auto">
                {pillars.map((pillar, idx) => (
                    <AnimatedSection key={idx} delay={`${idx * 0.1}s`}>
                        <div
                            className="group p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:shadow-2xl hover:shadow-violet-200/50 hover:border-violet-200 transition-all duration-300 hover:-translate-y-2 relative overflow-hidden h-full"
                        >
                            <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${pillar.color}`} />
                            <h3 className="text-2xl font-bold mb-4 font-outfit text-slate-800 group-hover:text-violet-600 transition-colors">
                                {pillar.title}
                            </h3>
                            <div className="mb-4">
                                <span className="text-xs font-bold tracking-wider uppercase text-slate-400">Focus</span>
                                <p className="text-lg font-medium text-slate-700 mt-1">{pillar.focus}</p>
                            </div>
                            <div>
                                <span className="text-xs font-bold tracking-wider uppercase text-slate-400">Benefit</span>
                                <p className="text-slate-600 mt-1">{pillar.benefit}</p>
                            </div>
                        </div>
                    </AnimatedSection>
                ))}
            </div>

            {/* 3. Key Feature Showcase */}
            <div className="max-w-7xl mx-auto mb-24 pt-24">
                <AnimatedSection>
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 font-outfit text-slate-900">
                            Unmatched Accuracy from the Ground Up
                        </h2>
                        <p className="text-slate-500">Everything you need to run your business efficiently</p>
                    </div>
                </AnimatedSection>

                <div className="flex flex-col gap-20">
                    <AnimatedSection>
                        <div className="max-w-3xl mx-auto space-y-10">
                            {keyFeatures.map((feat, idx) => (
                                <div key={idx} className="flex gap-6 items-start">
                                    <div className="flex-shrink-0 mt-1">
                                        <CheckCircleFilled className="text-2xl" style={{ color: '#7E5CFE' }} />
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-bold text-slate-800 mb-2">{feat.title}</h4>
                                        <p className="text-lg text-slate-600 leading-relaxed">{feat.desc}</p>
                                    </div>
                                </div>
                            ))}
                            <div className="pt-8 text-center">
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={() => navigate('/features')}
                                    className="!rounded-full !px-10 !h-14 !text-lg transition-transform duration-200 hover:scale-105"
                                    style={{
                                        backgroundColor: '#7E5CFE',
                                        borderColor: '#7E5CFE',
                                        boxShadow: '0 4px 14px 0 rgba(126, 92, 254, 0.39)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#6b47e8';
                                        e.currentTarget.style.borderColor = '#6b47e8';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#7E5CFE';
                                        e.currentTarget.style.borderColor = '#7E5CFE';
                                    }}
                                >
                                    See All Features
                                </Button>
                            </div>
                        </div>
                    </AnimatedSection>

                    {/* Additional Feature Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Custom Contact Form Card */}
                        <AnimatedSection delay="0.1s">
                            <div className="bg-white border border-slate-200 p-10 rounded-3xl shadow-lg relative overflow-hidden group hover:border-violet-300 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-violet-200/50 h-full">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <FormOutlined style={{ fontSize: '120px', color: '#7c3aed' }} />
                                </div>
                                <h3 className="text-2xl font-bold mb-6 font-outfit text-slate-900">Custom Contact Form</h3>
                                <ul className="space-y-4 text-slate-600 text-lg">
                                    <li className="flex gap-3 items-center"><div className="w-2 h-2 rounded-full bg-violet-500" /> Personalized Page for each user</li>
                                    <li className="flex gap-3 items-center"><div className="w-2 h-2 rounded-full bg-violet-500" /> Auto-Fill YMM Fields</li>
                                    <li className="flex gap-3 items-center"><div className="w-2 h-2 rounded-full bg-violet-500" /> Secure database storage</li>
                                    <li className="flex gap-3 items-center"><div className="w-2 h-2 rounded-full bg-violet-500" /> Automatic AI response</li>
                                </ul>
                            </div>
                        </AnimatedSection>

                        {/* AI Chatbot Card */}
                        <AnimatedSection delay="0.2s">
                            <div className="bg-white border border-slate-200 p-10 rounded-3xl shadow-lg relative overflow-hidden group hover:border-violet-300 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-violet-200/50 h-full">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <MessageOutlined style={{ fontSize: '120px', color: '#7c3aed' }} />
                                </div>
                                <h3 className="text-2xl font-bold mb-6 font-outfit text-slate-900 flex items-center gap-3">
                                    AI Chatbot <span className="bg-violet-100 text-violet-700 text-sm px-3 py-1 rounded-full">New</span>
                                </h3>
                                <p className="text-slate-600 text-lg leading-relaxed">
                                    An AI Chatbot integrated into your website allowing visitors to interact with the system in real time, answering queries and capturing leads 24/7.
                                </p>
                            </div>
                        </AnimatedSection>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ValuePropSection;
