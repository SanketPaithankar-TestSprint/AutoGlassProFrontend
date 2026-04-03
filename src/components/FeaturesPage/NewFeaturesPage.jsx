import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChartOutlined,
    CalendarOutlined,
    CreditCardOutlined,
    DatabaseOutlined,
    FormOutlined,
    QrcodeOutlined,
    RobotOutlined,
    SettingOutlined,
    TeamOutlined,
} from '@ant-design/icons';
import PageHead from '../PageHead';

import feature01 from '../../assets/new-features/feature-01.jpg';
import feature02 from '../../assets/new-features/feature-02.jpg';
import feature03 from '../../assets/new-features/feature-03.jpg';
import feature04 from '../../assets/new-features/feature-04.jpg';
import feature05 from '../../assets/new-features/feature-05.jpg';
import feature06 from '../../assets/new-features/feature-06.jpg';
import feature07 from '../../assets/new-features/feature-07.jpg';
import feature08 from '../../assets/new-features/feature-08.jpg';
import feature09 from '../../assets/new-features/feature-09.jpg';
import feature10 from '../../assets/new-features/feature-10.jpg';
import feature11 from '../../assets/new-features/feature-11.jpg';
import feature12 from '../../assets/new-features/feature-12.jpg';
import feature13 from '../../assets/new-features/feature-13.jpg';
import feature14 from '../../assets/new-features/feature-14.jpg';
import feature15 from '../../assets/new-features/feature-15.jpg';
import feature16 from '../../assets/new-features/feature-16.jpg';
import feature17 from '../../assets/new-features/feature-17.jpg';
import feature18 from '../../assets/new-features/feature-18.jpg';
import feature19 from '../../assets/new-features/feature-19.jpg';

const imageBorderClass = 'border border-slate-200 shadow-[0_20px_40px_-24px_rgba(15,23,42,0.35)]';

const imageBlobStyle = {
    position: 'absolute',
    width: '85%',
    height: '85%',
    background: 'radial-gradient(circle, rgba(0, 168, 228, 0.25) 0%, rgba(127, 92, 254, 0.25) 100%)',
    filter: 'blur(60px)',
    zIndex: -1,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: '9999px',
};

const nagsBullets = [
    'Complete Year, Make, Model, and Body Style vehicle coverage for accurate vehicle identification',
    'Automatic display of all available glass positions for each vehicle (Windshield, Back Glass, Door Glass, Quarter Glass, Vent, Roof)',
    'Multiple NAGS Glass IDs per glass position to support different glass variants',
    'Detailed glass specifications including ADAS compatibility, acoustic interlayer, solar tint, and other features',
    'Displays OEM references, manufacturer information, and pricing when available',
    'Structured data hierarchy: Vehicle -> Glass Position -> NAGS Glass Options for fast and accurate quoting',
    'Eliminates manual catalog searching and reduces glass ordering errors',
];

const customQuotesBullets = [
    'Generate a public contact page for your business where customers can request quotes',
    'Fully configurable through Contact Form Configuration inside the dashboard',
    'Automatically displays shop details, contact information, location, and operating hours',
    'Customers can submit service type, contact information, and additional job details',
    'Supports image uploads to help customers show glass damage',
    'Instant notifications inside AutopaneAI when a new inquiry is submitted',
];

const employeeBullets = [
    'Admins can add and manage employees from the dashboard',
    'Each employee can have a separate login account (available as an optional add-on)',
    'Role-based access allows admins to control which features employees can use',
    'Employees can securely access the system to view and work on assigned tasks',
    'Built-in attendance tracking system to monitor employee presence',
];

const analyticsBullets = [
    'Real-time dashboard showing total revenue, payments received, and completed jobs',
    'Visual insights into revenue trends, income breakdown, and job performance',
    'Track quote-to-invoice conversion rates and job status distribution',
    'Analyze service types such as in-shop vs mobile jobs',
    'Generate detailed sales reports by date range and document type',
    'Export professional PDF reports for accounting and business records',
];

const chatBullets = [
    'Customers can start a live chat directly from the shop\'s contact page',
    'Shop owners and staff receive instant notifications for new messages',
    'Optional AI assistant can automatically respond when staff are unavailable',
    'AI can ask structured questions such as vehicle year, make, and model',
    'System converts AI chat inquiries directly into quote-ready requests',
];

const schedulingBullets = [
    'Schedule jobs while creating or converting a quote into an appointment',
    'Assign a specific technician or employee to each job',
    'Define scheduled date, time, and service location for the appointment',
    'Built-in calendar view to easily manage daily and weekly schedules',
    'Provides full visibility into upcoming jobs and team workload',
];

const paymentsBullets = [
    'Record payments while creating or updating quotes and invoices',
    'Support multiple payment methods: credit card, cash, or digital payments',
    'Upload attachments such as ADAS reports and damage photos',
    'Securely store images and PDF files related to each job',
    'Add customer-visible or internal private job notes',
];

const configurationBullets = [
    'Set a default hourly labor rate for automated service document creation',
    'Configure state tax rates for parts, labor, and ADAS services',
    'Define standard installation kit and ADAS calibration pricing',
    'Values are automatically applied while generating quotes and invoices',
];

const vinBullets = [
    'Decode a vehicle instantly using the 17-character VIN number',
    'Automatically detects Year, Make, Model, and Body Style',
    'Intelligently maps the vehicle to the correct NAGS vehicle ID',
    'Reduces manual selection errors and speeds up the quoting process',
    'Access extended details such as engine specs and safety features',
];

const TagPill = ({ tone, icon, label }) => {
    const toneClass = tone === 'purple' ? 'text-[#7E5CFE]' : 'text-[#00A8E4]';

    return (
        <div className={`inline-flex items-center gap-2 ${toneClass} font-bold tracking-[0.2em] uppercase text-[10px]`}>
            <span className="text-base leading-none">{icon}</span>
            <span>{label}</span>
        </div>
    );
};

const BulletList = ({ tone, items }) => {
    const dotClass = tone === 'purple' ? 'bg-[#7E5CFE]' : 'bg-[#00A8E4]';

    return (
        <ul className="space-y-2 text-slate-600">
            {items.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[14px]">
                    <span className={`mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${dotClass}`} />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
};

const NewFeaturesPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen text-slate-900">
            <PageHead
                title="Features | AutoPane AI"
                description="Powerful features built for auto glass shops, including NAGS integration, quote workflows, live chat, analytics, scheduling, payments, and VIN decoding."
            />

            <main className="pb-16">
                <header className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 md:pt-20 text-center mb-8 md:mb-12">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] !text-[#7E5CFE] tracking-[-0.04em] mb-5">
                        Powerful Features Built for Auto Glass Shops
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl leading-7 md:leading-8 text-slate-600 max-w-4xl mx-auto">
                        AutopaneAI provides a complete platform designed specifically for auto glass businesses, helping you
                        manage quotes, customers, jobs, technicians, and operations from one place. From intelligent NAGS
                        data integration and VIN decoding to job scheduling, live chat, analytics, and automated workflows,
                        AutopaneAI simplifies everyday tasks so you can focus on serving customers and growing your business.
                    </p>
                </header>

                <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-[4.5rem]">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                        <div className="md:col-span-5 space-y-5">
                            <TagPill tone="blue" icon={<DatabaseOutlined />} label="Inventory Intelligence" />
                            <h2 className="text-2xl md:text-4xl font-black leading-[1.12] tracking-[-0.02em] text-slate-900">Comprehensive NAGS Vehicle &amp; Glass Database</h2>
                            <div className="text-[14px] text-slate-600 leading-relaxed space-y-4">
                                <p>
                                    AutopaneAI integrates the complete NAGS (National Auto Glass Specifications) dataset to
                                    make vehicle identification and glass selection fast, accurate, and reliable.
                                </p>
                                <div className="font-bold text-slate-900 pt-1">Key Capabilities:</div>
                                <BulletList tone="blue" items={nagsBullets} />
                            </div>
                        </div>

                        <div className="md:col-span-7">
                            <div className="relative">
                                <div style={imageBlobStyle} />
                                <div className="grid grid-cols-1 gap-4">
                                    <img src={feature01} alt="NAGS Database Part Selection" className={`w-full h-auto rounded-lg bg-white ${imageBorderClass}`} />
                                    <img src={feature02} alt="Available Options Grid" className={`w-full h-auto rounded-lg bg-white ${imageBorderClass}`} />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-[4.5rem]">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                        <div className="md:col-span-7 order-2 md:order-1">
                            <div className="relative">
                                <div style={imageBlobStyle} />
                                <div className="relative">
                                    <img src={feature03} alt="Public Quote Request Page" className={`w-full h-auto rounded-xl bg-white ${imageBorderClass}`} />
                                    <div className="absolute -bottom-6 -right-6 w-1/2">
                                        <img
                                            src={feature04}
                                            alt="New Inquiry Alert"
                                            className={`w-full h-auto rounded-lg bg-white border-2 border-white ${imageBorderClass}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-5 order-1 md:order-2 space-y-5">
                            <TagPill tone="purple" icon={<FormOutlined />} label="Client Interaction" />
                            <h2 className="text-2xl md:text-4xl font-black leading-[1.12] tracking-[-0.02em] text-slate-900">Custom Contact &amp; Quote Request Page</h2>
                            <div className="text-[14px] text-slate-600 leading-relaxed space-y-4">
                                <p>
                                    AutopaneAI provides every shop with a dedicated contact and quote request page where
                                    customers can easily submit service inquiries online.
                                </p>
                                <div className="font-bold text-slate-900 pt-1">Key Capabilities:</div>
                                <BulletList tone="purple" items={customQuotesBullets} />
                                <p className="pt-1 italic opacity-80">
                                    This allows shops to capture new leads 24/7 and convert them into jobs without manual
                                    data entry.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-[4.5rem]">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                        <div className="md:col-span-5 space-y-5">
                            <TagPill tone="blue" icon={<TeamOutlined />} label="Workforce" />
                            <h2 className="text-2xl md:text-4xl font-black leading-[1.12] tracking-[-0.02em] text-slate-900">Employee Management &amp; Attendance System</h2>
                            <div className="text-[14px] text-slate-600 leading-relaxed space-y-4">
                                <p>
                                    AutopaneAI allows shop owners to add and manage employees with individual system access,
                                    enabling better team coordination and operational control.
                                </p>
                                <div className="font-bold text-slate-900 pt-1">Key Capabilities:</div>
                                <BulletList tone="blue" items={employeeBullets} />
                                <p className="pt-1 italic opacity-80">
                                    This helps shop owners manage their team, track attendance, and maintain controlled access
                                    to business operations.
                                </p>
                            </div>
                        </div>

                        <div className="md:col-span-7">
                            <div className="relative">
                                <div style={imageBlobStyle} />
                                <img src={feature05} alt="Attendance Management Dashboard" className={`w-full h-auto rounded-xl bg-white ${imageBorderClass}`} />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-[4.5rem]">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                        <div className="md:col-span-7 order-2 md:order-1">
                            <div className="relative">
                                <div style={imageBlobStyle} />
                                <div className="grid grid-cols-1 gap-4">
                                    <img src={feature06} alt="Analytics Overview" className={`w-full h-auto rounded-xl bg-white ${imageBorderClass}`} />
                                    <img src={feature07} alt="Detailed Sales Report" className={`w-full h-auto rounded-xl bg-white ${imageBorderClass}`} />
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-5 order-1 md:order-2 space-y-5">
                            <TagPill tone="purple" icon={<BarChartOutlined />} label="Insights" />
                            <h2 className="text-2xl md:text-4xl font-black leading-[1.12] tracking-[-0.02em] text-slate-900">Business Analytics &amp; Sales Reports</h2>
                            <div className="text-[14px] text-slate-600 leading-relaxed space-y-4">
                                <p>
                                    AutopaneAI provides powerful analytics and reporting tools to help shop owners monitor
                                    performance, track revenue, and understand business trends.
                                </p>
                                <div className="font-bold text-slate-900 pt-1">Key Capabilities:</div>
                                <BulletList tone="purple" items={analyticsBullets} />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-[4.5rem]">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                        <div className="md:col-span-5 space-y-5">
                            <TagPill tone="blue" icon={<RobotOutlined />} label="Automation" />
                            <h2 className="text-2xl md:text-4xl font-black leading-[1.12] tracking-[-0.02em] text-slate-900">Live Chat &amp; AI Customer Assistant</h2>
                            <div className="text-[14px] text-slate-600 leading-relaxed space-y-4">
                                <p>
                                    AutopaneAI provides a built-in live chat system that allows customers to instantly
                                    connect with auto glass shops directly from their website contact page.
                                </p>
                                <div className="font-bold text-slate-900 pt-1">Key Capabilities:</div>
                                <BulletList tone="blue" items={chatBullets} />
                                <p className="pt-1 italic opacity-80">
                                    This ensures shops can capture leads and assist customers instantly even when staff are
                                    offline.
                                </p>
                            </div>
                        </div>

                        <div className="md:col-span-7">
                            <div className="relative">
                                <div style={imageBlobStyle} />
                                <div className="relative min-h-[320px] flex items-center justify-center">
                                    <img src={feature08} alt="Chatbot Interaction Interface" className={`w-4/5 h-auto rounded-xl bg-white z-10 ${imageBorderClass}`} />
                                    <div className="absolute bottom-0 left-0 w-1/2 z-20">
                                        <img
                                            src={feature09}
                                            alt="Chat Welcome Screen"
                                            className={`w-full h-auto rounded-lg bg-white border-2 border-white ${imageBorderClass}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-[4.5rem]">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                        <div className="md:col-span-7 order-2 md:order-1">
                            <div className="relative">
                                <div style={imageBlobStyle} />
                                <div className="relative">
                                    <img src={feature10} alt="Centralized Job Calendar" className={`w-full h-auto rounded-xl bg-white ${imageBorderClass}`} />
                                    <div className="absolute -bottom-6 -right-6 w-1/3">
                                        <img
                                            src={feature11}
                                            alt="Schedule Notification Badge"
                                            className={`w-full h-auto rounded-lg bg-white border-2 border-white ${imageBorderClass}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-5 order-1 md:order-2 space-y-5">
                            <TagPill tone="purple" icon={<CalendarOutlined />} label="Operations" />
                            <h2 className="text-2xl md:text-4xl font-black leading-[1.12] tracking-[-0.02em] text-slate-900">Job Scheduling &amp; Technician Assignment</h2>
                            <div className="text-[14px] text-slate-600 leading-relaxed space-y-4">
                                <p>
                                    AutopaneAI allows shops to schedule jobs directly from quotes, assign technicians, and
                                    manage upcoming work through a centralized scheduling system.
                                </p>
                                <div className="font-bold text-slate-900 pt-1">Key Capabilities:</div>
                                <BulletList tone="purple" items={schedulingBullets} />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-[4.5rem]">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                        <div className="md:col-span-5 space-y-5">
                            <TagPill tone="blue" icon={<CreditCardOutlined />} label="Finance" />
                            <h2 className="text-2xl md:text-4xl font-black leading-[1.12] tracking-[-0.02em] text-slate-900">Payments, Attachments &amp; Notes Management</h2>
                            <div className="text-[14px] text-slate-600 leading-relaxed space-y-4">
                                <p>
                                    AutopaneAI allows shops to manage payments, store job-related documents, and add notes
                                    directly within quotes and work orders, keeping all job information organized in one place.
                                </p>
                                <div className="font-bold text-slate-900 pt-1">Key Capabilities:</div>
                                <BulletList tone="blue" items={paymentsBullets} />
                                <p className="pt-1 italic opacity-80">
                                    This ensures all payments and documents are centralized for complete service records.
                                </p>
                            </div>
                        </div>

                        <div className="md:col-span-7">
                            <div className="relative">
                                <div style={imageBlobStyle} />
                                <div className="relative min-h-[380px] flex items-center">
                                    <img src={feature12} alt="Transaction Ledger Interface" className={`w-full h-auto rounded-xl bg-white z-10 ${imageBorderClass}`} />
                                    <div className="absolute -top-4 -left-4 w-1/2 z-20">
                                        <img
                                            src={feature13}
                                            alt="Job Notes Interface"
                                            className={`w-full h-auto rounded-lg bg-white border-2 border-white ${imageBorderClass}`}
                                        />
                                    </div>
                                    <div className="absolute -bottom-4 -right-4 w-1/3 z-30">
                                        <img
                                            src={feature14}
                                            alt="File Attachments Panel"
                                            className={`w-full h-auto rounded-lg bg-white border-2 border-white ${imageBorderClass}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-[4.5rem]">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                        <div className="md:col-span-7 order-2 md:order-1">
                            <div className="relative">
                                <div style={imageBlobStyle} />
                                <div className="grid grid-cols-2 gap-4">
                                    <img src={feature15} alt="Labor and Rate Settings" className={`w-full h-auto rounded-lg bg-white ${imageBorderClass}`} />
                                    <img src={feature16} alt="Calibration Price Configuration" className={`w-full h-auto rounded-lg bg-white ${imageBorderClass}`} />
                                    <img src={feature17} alt="Tax Rate Management" className={`w-full h-auto rounded-lg bg-white col-span-2 ${imageBorderClass}`} />
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-5 order-1 md:order-2 space-y-5">
                            <TagPill tone="purple" icon={<SettingOutlined />} label="Configuration" />
                            <h2 className="text-2xl md:text-4xl font-black leading-[1.12] tracking-[-0.02em] text-slate-900">Configurable Pricing &amp; Business Settings</h2>
                            <div className="text-[14px] text-slate-600 leading-relaxed space-y-4">
                                <p>
                                    AutopaneAI allows shop owners to configure key business settings directly from the profile
                                    dashboard, ensuring accurate pricing and automation when creating quotes and invoices.
                                </p>
                                <div className="font-bold text-slate-900 pt-1">Key Capabilities:</div>
                                <BulletList tone="purple" items={configurationBullets} />
                                <p className="pt-1 italic opacity-80">
                                    This allows shops to standardize pricing and reduce manual entry for consistent billing.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-[4.5rem]">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                        <div className="md:col-span-5 space-y-5">
                            <TagPill tone="blue" icon={<QrcodeOutlined />} label="Identification" />
                            <h2 className="text-2xl md:text-4xl font-black leading-[1.12] tracking-[-0.02em] text-slate-900">VIN Decoder &amp; Automatic Vehicle Identification</h2>
                            <div className="text-[14px] text-slate-600 leading-relaxed space-y-4">
                                <p>
                                    AutopaneAI includes a powerful VIN decoding system that helps shops quickly identify
                                    vehicles and find the correct glass parts with accuracy.
                                </p>
                                <div className="font-bold text-slate-900 pt-1">Key Capabilities:</div>
                                <BulletList tone="blue" items={vinBullets} />
                            </div>
                        </div>

                        <div className="md:col-span-7">
                            <div className="relative">
                                <div style={imageBlobStyle} />
                                <div className="relative min-h-[400px] flex items-center">
                                    <img src={feature18} alt="Detailed VIN Information Display" className={`w-full h-auto rounded-xl bg-white z-10 ${imageBorderClass}`} />
                                    <div className="absolute -top-4 -left-4 w-1/2 z-20">
                                        <img
                                            src={feature19}
                                            alt="VIN Decoding Search Form"
                                            className={`w-full h-auto rounded-lg bg-white border-2 border-white ${imageBorderClass}`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
                    <div className="rounded-[2.5rem] p-8 md:p-16 text-center text-white relative overflow-hidden shadow-xl bg-[linear-gradient(135deg,#7E5CFE_0%,#00A8E4_100%)]">
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_120%,#fff,transparent)]" />
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-extrabold mb-8 leading-tight">
                                The All-in-One Operating System
                                <br />
                                for Your Glass Shop.
                            </h2>
                            <button
                                type="button"
                                onClick={() => navigate('/auth', { state: { mode: 'signup' } })}
                                className="bg-white text-[#7E5CFE] px-8 py-3.5 rounded-full font-extrabold text-base shadow-lg hover:scale-105 transition-transform duration-300"
                            >
                                Claim Your 30-Day Free Trial
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default NewFeaturesPage;
