import React, { useEffect, useRef, useState } from 'react';
import { Layout, Button, Collapse } from 'antd';
import { useNavigate } from 'react-router-dom';
import PageHead from '../PageHead';
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
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import VideoModal from '../VideoModal/VideoModal';

gsap.registerPlugin(ScrollTrigger);

// Basic Fade-Up Animation for Headers
const AnimatedSection = ({ children, delay = 0, className = "" }) => {
    const el = useRef(null);

    useGSAP(() => {
        gsap.fromTo(el.current,
            {
                opacity: 0,
                y: 30
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power2.out",
                delay: typeof delay === 'string' ? parseFloat(delay) : delay,
                scrollTrigger: {
                    trigger: el.current,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    }, { scope: el });

    return (
        <div ref={el} className={className}>
            {children}
        </div>
    );
};
// Staggered Reveal Section
const StaggeredSection = ({ children, delay = 0, className = "" }) => {
    const el = useRef(null);

    useGSAP(() => {
        gsap.fromTo(el.current.children,
            {
                opacity: 0,
                y: 30
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: el.current,
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    }, { scope: el });

    return (
        <div ref={el} className={className}>
            {children}
        </div>
    );
};

// 3D Tilt Feature Block
const FeatureBlock = ({ icon, title, description }) => {
    const cardRef = useRef(null);

    // Hover animation context
    const { contextSafe } = useGSAP({ scope: cardRef });

    const onEnter = contextSafe(() => {
        gsap.to(cardRef.current, {
            y: -5,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            borderColor: '#ddd6fe', // violet-200
            scale: 1,
            duration: 0.3,
            ease: "power2.out"
        });
        // Animate icon pop
        gsap.to(cardRef.current.querySelector('.feature-icon'), {
            scale: 1.1,
            rotate: 3,
            duration: 0.4,
            ease: "back.out(1.7)"
        });
    });

    const onLeave = contextSafe(() => {
        gsap.to(cardRef.current, {
            y: 0,
            boxShadow: 'none',
            borderColor: '#f1f5f9', // slate-100
            scale: 1,
            duration: 0.3,
            ease: "power2.out"
        });
        // Reset icon
        gsap.to(cardRef.current.querySelector('.feature-icon'), {
            scale: 1,
            rotate: 0,
            duration: 0.3,
        });
    });

    return (
        <div
            ref={cardRef}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            className="flex gap-4 items-start p-6 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-100 h-full cursor-default will-change-transform"
        >
            <div className="feature-icon flex-shrink-0 mt-1 text-3xl text-violet-600 bg-violet-50 p-3 rounded-xl">
                {icon}
            </div>
            <div>
                <h4 className="text-xl font-bold text-slate-900 mb-2 font-outfit">{title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">{description}</p>
            </div>
        </div>
    );
};

const FeaturesPage = () => {
    const navigate = useNavigate();
    const [isVideoOpen, setIsVideoOpen] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
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
            subHeadline: "APAI is built for the mobile service economy, giving remote installers and shop technicians the tools they need to complete jobs efficiently.",
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
                    desc: "Customize access for every team member, from SHOP_OWNER and Admin to MOBILE_TECHNICIAN and Technician, ensuring everyone has the right level of control."
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
                    desc: "When an invoice reaches the Overdue status, APAI automatically sends payment reminder emails, significantly reducing late payments."
                },
                {
                    icon: <BarChartOutlined />,
                    title: "Comprehensive Reporting",
                    desc: "Access reports that analyze job profitability, technician performance, and revenue trends, helping you make data-driven decisions."
                }
            ]
        }
    ];

    const handleStartTrial = () => {
        navigate('/auth', { state: { mode: 'signup' } });
    };

    return (
        <div className="bg-white min-h-screen pb-20 relative overflow-hidden font-sans text-slate-900">
            <PageHead 
                title="APAI Features | VIN Decode, AI Chat, Quotes & NAGS Data" 
                description="Discover APAI's powerful features: Instant VIN decoding, AI Chat, professional PDF quotes, and real-time NAGS data. Scale your glass shop for just $99/mo." 
            />
            {/* Optimized Gradient Background (Same as Pricing Page) */}
            <div
                className="fixed inset-0 z-0 pointer-events-none opacity-20"
                style={{ background: 'linear-gradient(135deg, #7E5CFE 0%, #00A8E4 100%)' }}
            />

            {/* Page Header */}
            <div className="relative pt-10 pb-16 px-6 md:px-12 lg:px-20 border-b border-transparent z-10">
                <AnimatedSection>
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-3xl md:text-5xl font-bold mb-4 font-outfit text-slate-900 leading-tight">
                            Everything You Need to Run Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-fuchsia-600">Auto Glass Business</span>
                        </h1>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                            From the first quote to the final payment, APAI provides a comprehensive suite of tools designed for speed, accuracy, and growth.
                        </p>
                    </div>
                </AnimatedSection>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-12 space-y-32">
                {sections.map((section, idx) => (
                    <div key={idx} className="scroll-mt-24" id={section.category.toLowerCase().replace(/\s+/g, '-')}>
                        <AnimatedSection>
                            <div className="mb-12 text-center md:text-left">
                                <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
                                    <div className={`h-1.5 w-12 rounded-full bg-gradient-to-r ${section.color}`}></div>
                                    <span className="text-sm font-bold uppercase tracking-widest text-slate-500">{section.category}</span>
                                </div>
                                <h2 className="text-3xl md:text-5xl font-extrabold mb-4 font-outfit text-slate-900">
                                    {section.title}
                                </h2>
                                <p className="text-lg md:text-xl text-slate-500 max-w-3xl leading-relaxed mx-auto md:mx-0">
                                    {section.subHeadline}
                                </p>
                            </div>
                        </AnimatedSection>

                        {/* Use StaggeredSection for the grid items */}
                        <StaggeredSection className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {section.features.map((feature, fIdx) => (
                                <FeatureBlock
                                    key={fIdx}
                                    icon={feature.icon}
                                    title={feature.title}
                                    description={feature.desc}
                                />
                            ))}
                        </StaggeredSection>
                    </div>
                ))}
            </div>

            {/* FAQ Section */}
            <AnimatedSection>
                <div className="relative z-10 max-w-4xl mx-auto mt-24 px-5">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">Frequently Asked Questions</h2>
                        <p className="text-slate-600">Find answers to common questions about APAI features and functionality</p>
                    </div>

                    <Collapse
                        items={[
                            {
                                key: '1',
                                label: <span className="font-semibold text-slate-900">What document types does APAI support?</span>,
                                children: (
                                    <p className="text-slate-700 leading-relaxed">
                                        APAI supports multiple document types including Quotes, Invoices, Work Orders, and Composite Service Documents. Each document type includes customizable fields, automatic calculations, and export capabilities to PDF format.
                                    </p>
                                ),
                                style: { borderRadius: '8px', marginBottom: '8px' }
                            },
                            {
                                key: '2',
                                label: <span className="font-semibold text-slate-900">Can I manage multiple customers and vehicles?</span>,
                                children: (
                                    <p className="text-slate-700 leading-relaxed">
                                        Yes! APAI features a comprehensive Customer Management system where you can store unlimited customer profiles with contact information, phone numbers, emails, vehicles, and service history. Quickly search and filter customers by name, phone, or email for easy access.
                                    </p>
                                ),
                                style: { borderRadius: '8px', marginBottom: '8px' }
                            },
                            {
                                key: '3',
                                label: <span className="font-semibold text-slate-900">How does the scheduling system work?</span>,
                                children: (
                                    <p className="text-slate-700 leading-relaxed">
                                        The integrated scheduling system allows you to manage appointments, assign tasks to employees, and track service dates. View your schedule in Calendar, Kanban Board, or Table view. Never miss a scheduled appointment with built-in notifications.
                                    </p>
                                ),
                                style: { borderRadius: '8px', marginBottom: '8px' }
                            },
                            {
                                key: '4',
                                label: <span className="font-semibold text-slate-900">Can I track payments and invoices?</span>,
                                children: (
                                    <p className="text-slate-700 leading-relaxed">
                                        Absolutely! APAI includes advanced payment tracking with payment history, multiple payment methods, overdue tracking, and sales reports. Easily monitor which invoices are paid, pending, or overdue. Generate comprehensive sales reports for any date range.
                                    </p>
                                ),
                                style: { borderRadius: '8px', marginBottom: '8px' }
                            },
                            {
                                key: '5',
                                label: <span className="font-semibold text-slate-900">Is there mobile support or do I need a desktop?</span>,
                                children: (
                                    <p className="text-slate-700 leading-relaxed">
                                        APAI is web-based and responsive, working on both desktop and mobile devices. You can access quotes, customer information, and schedules from your phone or tablet on the job site, making it perfect for on-the-go business management.
                                    </p>
                                ),
                                style: { borderRadius: '8px', marginBottom: '8px' }
                            }
                        ]}
                        accordion
                        style={{
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px'
                        }}
                    />
                </div>
            </AnimatedSection>

            <AnimatedSection>
                <div className='relative z-10 flex items-center justify-center'>
                    <div className="max-w-4xl mx-5 mt-24 bg-violet-50 rounded-3xl py-12 px-6 md:px-12 text-center relative overflow-hidden border border-violet-100 shadow-xl shadow-violet-100/50">
                        <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                        <div className="relative z-10">
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 font-outfit">
                                Ready to Transform Your Business?
                            </h2>
                            <p className="text-base text-slate-600 mb-8 max-w-xl mx-auto">
                                Join the auto glass professionals who are saving time and increasing profits with APAI.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Button
                                    type="primary"
                                    size="large"
                                    className="!bg-violet-600 !border-violet-600 hover:!bg-violet-500 !h-11 !px-8 !text-base !rounded-full shadow-md shadow-violet-200"
                                    onClick={handleStartTrial}
                                >
                                    Start Your Free Trial
                                </Button>
                                <Button
                                    size="large"
                                    className="!bg-transparent !border-violet-600 !text-violet-600 hover:!bg-violet-100 !h-11 !px-8 !text-base !rounded-full"
                                    onClick={() => setIsVideoOpen(true)}
                                >
                                    Watch a Demo
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </AnimatedSection>

            {/* Video Modal */}
            <VideoModal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} />
        </div>
    );
};

export default FeaturesPage;
