import React, { useEffect, useRef, useState } from 'react';
import { Layout, Button } from 'antd';
import {
    FileSearchOutlined,
    FundProjectionScreenOutlined,
    CalculatorOutlined,
    FileTextOutlined,
    ToolOutlined,
    ClockCircleOutlined,
    CameraOutlined,
    TeamOutlined,
    FileProtectOutlined,
    UnorderedListOutlined,
    MailOutlined,
    BarChartOutlined,
    CheckCircleFilled
} from '@ant-design/icons';

// Intersection Observer Hook for scroll animations
const useIntersectionObserver = (options = {}) => {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const targetRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsIntersecting(true);
                observer.unobserve(entry.target);
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
                transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
                transition: `all 0.8s cubic-bezier(0.17, 0.55, 0.55, 1) ${delay}`
            }}
        >
            {children}
        </div>
    );
};

const FeatureBlock = ({ icon, title, description }) => (
    <div className="flex gap-4 items-start p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow h-full">
        <div className="flex-shrink-0 mt-1 text-2xl text-violet-600">
            {icon}
        </div>
        <div>
            <h4 className="text-lg font-bold text-slate-900 mb-1 font-outfit">{title}</h4>
            <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
        </div>
    </div>
);

const FeaturesPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = "APAI | Features";
    }, []);

    const sections = [
        {
            category: "Quoting & Pricing",
            title: "Precision Quoting: Win the Job and Maximize Profit.",
            subHeadline: "Generate professional, accurate estimates instantly, reducing administrative time and eliminating costly errors.",
            color: "from-blue-500 to-cyan-500",
            features: [
                {
                    icon: <FileSearchOutlined />,
                    title: "VIN Decoder & Search",
                    desc: "Utilize the NHTSA VPIC API for guaranteed accurate vehicle glass search by Year, Make, Model, Style, or VIN. We classify parts using industry-standard NAGS codes (DB, DD, DQ, DR, DV, DW)."
                },
                {
                    icon: <FundProjectionScreenOutlined />,
                    title: "Real-Time Price Engine",
                    desc: "Integrate real-time pricing from NAGS database and define custom labor cost entries to ensure your quote always reflects current market values and your required margins."
                },
                {
                    icon: <CalculatorOutlined />,
                    title: "Automatic Calculations",
                    desc: "Automatically apply custom labor rates, tax percentages, and discounts, presenting the customer with a clear, professional final price."
                },
                {
                    icon: <FileTextOutlined />,
                    title: "Professional Documents",
                    desc: "Generate branded, easy-to-read Quote documents that customers can approve quickly via email or SMS."
                }
            ]
        },
        {
            category: "Work Order & Field Service",
            title: "Mobile Management: Empower Your Technicians, Anywhere.",
            subHeadline: "AutoPaneAI is built for the mobile service economy, giving remote installers and shop technicians the tools they need to complete jobs efficiently.",
            color: "from-violet-500 to-fuchsia-500",
            features: [
                {
                    icon: <ToolOutlined />,
                    title: "Digital Work Order",
                    desc: "Quotes instantly convert to detailed Work Orders, pre-populated with customer and vehicle data. Technicians access all details on their mobile device."
                },
                {
                    icon: <ClockCircleOutlined />,
                    title: "Time and Labor Tracking",
                    desc: "Technicians log start and end times right in the app, automatically tracking and logging labor hours against the job."
                },
                {
                    icon: <CameraOutlined />,
                    title: "Photo & Signature Capture",
                    desc: "Capture mandatory Before/After photos of the vehicle glass and collect the customer's signature electronically upon job completion, securing your records."
                },
                {
                    icon: <TeamOutlined />,
                    title: "Role-Based Access",
                    desc: "Customize access for every team member, from SHOP_OWNER and Admin to REMOTE_WORKER and Technician, ensuring everyone has the right level of control."
                }
            ]
        },
        {
            category: "Invoicing & Payments",
            title: "Financial Control: Simplify Billing and Accelerate Cash Flow.",
            subHeadline: "Turn completed jobs into paid invoices with robust tracking, insurance management, and automated follow-up.",
            color: "from-emerald-500 to-teal-500",
            features: [
                {
                    icon: <FileProtectOutlined />,
                    title: "Insurance Claim Tracking",
                    desc: "Easily log and track critical details like the insurance claim number and customer deductible directly on the invoice."
                },
                {
                    icon: <UnorderedListOutlined />,
                    title: "Status Management",
                    desc: "Clearly track the status of every invoice: Partial Paid, Paid, or Overdue. Set custom payment terms (e.g., Net 30) for clarity."
                },
                {
                    icon: <MailOutlined />,
                    title: "Automated Reminders",
                    desc: "When an invoice reaches the Overdue status, AutoPaneAI automatically sends payment reminder emails, significantly reducing late payments."
                },
                {
                    icon: <BarChartOutlined />,
                    title: "Comprehensive Reporting",
                    desc: "Access reports that analyze job profitability, technician performance, and revenue trends, helping you make data-driven decisions."
                }
            ]
        }
    ];

    return (
        <div className="bg-white min-h-screen pb-20 pt-10">
            {/* Page Header */}
            <div className="bg-white pt-10 pb-16 px-6 md:px-12 lg:px-20 border-b border-slate-100">
                <AnimatedSection>
                    <div className="max-w-4xl mx-auto text-center">
                        <span className="inline-block py-1 px-3 rounded-full bg-violet-100 text-violet-700 text-xs font-bold tracking-wide uppercase mb-3">
                            Platform Features
                        </span>
                        <h1 className="text-3xl md:text-5xl font-bold mb-4 font-outfit text-slate-900 leading-tight">
                            Everything You Need to Run Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">Auto Glass Business</span>
                        </h1>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                            From the first quote to the final payment, AutoPaneAI provides a comprehensive suite of tools designed for speed, accuracy, and growth.
                        </p>
                    </div>
                </AnimatedSection>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-12 space-y-32">
                {sections.map((section, idx) => (
                    <div key={idx} className="scroll-mt-24" id={section.category.toLowerCase().replace(/\s+/g, '-')}>
                        <AnimatedSection>
                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className={`h-1 w-8 rounded-full bg-gradient-to-r ${section.color}`}></div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{section.category}</span>
                                </div>
                                <h2 className="text-2xl md:text-4xl font-bold mb-3 font-outfit text-slate-900">
                                    {section.title}
                                </h2>
                                <p className="text-lg md:text-xl text-slate-600 max-w-4xl leading-relaxed">
                                    {section.subHeadline}
                                </p>
                            </div>
                        </AnimatedSection>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {section.features.map((feature, fIdx) => (
                                <AnimatedSection key={fIdx} delay={`${fIdx * 0.1}s`} className="h-full">
                                    <FeatureBlock
                                        icon={feature.icon}
                                        title={feature.title}
                                        description={feature.desc}
                                    />
                                </AnimatedSection>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <AnimatedSection>
                <div className="max-w-4xl mx-auto mt-24 bg-violet-50 rounded-3xl py-12 px-6 md:px-12 text-center relative overflow-hidden border border-violet-100">
                    <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className="relative z-10">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 font-outfit">
                            Ready to Transform Your Business?
                        </h2>
                        <p className="text-base text-slate-600 mb-8 max-w-xl mx-auto">
                            Join the auto glass professionals who are saving time and increasing profits with AutoPaneAI.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                type="primary"
                                size="large"
                                className="!bg-violet-600 !border-violet-600 hover:!bg-violet-500 !h-11 !px-8 !text-base !rounded-full shadow-md shadow-violet-200"
                            >
                                Start Your Free Trial
                            </Button>
                            <Button
                                size="large"
                                className="!bg-transparent !border-violet-600 !text-violet-600 hover:!bg-violet-100 !h-11 !px-8 !text-base !rounded-full"
                            >
                                Book a Demo
                            </Button>
                        </div>
                    </div>
                </div>
            </AnimatedSection>
        </div>
    );
};

export default FeaturesPage;
