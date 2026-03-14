import React from 'react';
import { Collapse } from 'antd';

const PricingFAQ = () => {
    return (
        <div className="relative z-10 max-w-4xl mx-auto mt-24 px-5 pb-16">
            <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">Frequently Asked Questions</h2>
                <p className="text-slate-600">Find answers to common questions about Autopane AI.</p>
            </div>

            <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-800 mb-4 px-2 tracking-tight">General Information</h3>
                <Collapse
                    items={[
                        {
                            key: '1',
                            label: <span className="font-semibold text-slate-900">What is Autopane AI?</span>,
                            children: <p className="text-slate-700 leading-relaxed">Autopane AI is a specialized B2B SaaS platform built exclusively for the auto glass industry. We provide an all-in-one solution for glass repair shops and mobile technicians to manage VIN-accurate quoting, NAGS integration, work orders, and invoicing from a single, cloud-based dashboard.</p>,
                            style: { borderRadius: '8px', marginBottom: '8px' }
                        },
                        {
                            key: '2',
                            label: <span className="font-semibold text-slate-900">Who is Autopane AI designed for?</span>,
                            children: <p className="text-slate-700 leading-relaxed">Our platform is designed for auto glass business owners, shop managers, and mobile technicians who want to eliminate manual data entry, reduce ordering errors, and professionalize their customer experience.</p>,
                            style: { borderRadius: '8px', marginBottom: '8px' }
                        },
                        {
                            key: '3',
                            label: <span className="font-semibold text-slate-900">Do I need to install any software?</span>,
                            children: <p className="text-slate-700 leading-relaxed">No. Autopane AI is a cloud-based platform. You can access your dashboard from any web browser on your desktop, tablet, or smartphone.</p>,
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

            <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-800 mb-4 px-2 tracking-tight">Features & Accuracy</h3>
                <Collapse
                    items={[
                        {
                            key: '4',
                            label: <span className="font-semibold text-slate-900">How does the VIN decoding work?</span>,
                            children: <p className="text-slate-700 leading-relaxed">We integrate directly with the NHTSA VPIC API. By entering a VIN, our system automatically identifies the exact Year, Make, Model, and Style of the vehicle, matching it to the correct glass parts and specifications instantly.</p>,
                            style: { borderRadius: '8px', marginBottom: '8px' }
                        },
                        {
                            key: '5',
                            label: <span className="font-semibold text-slate-900">Is NAGS data included?</span>,
                            children: <p className="text-slate-700 leading-relaxed">Yes. Autopane AI features full NAGS (National Auto Glass Specifications) integration. This ensures your quotes reflect the most current industry standards for parts, labor hours, and pricing, protecting your profit margins.</p>,
                            style: { borderRadius: '8px', marginBottom: '8px' }
                        },
                        {
                            key: '6',
                            label: <span className="font-semibold text-slate-900">What is the "AI Chatbot" feature?</span>,
                            children: <p className="text-slate-700 leading-relaxed">The AI Chatbot is a tool you can embed on your own website. It interacts with your visitors 24/7, answering common questions and capturing lead information directly into your Autopane dashboard so you never miss a potential job.</p>,
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

            <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-800 mb-4 px-2 tracking-tight">Workflow & Invoicing</h3>
                <Collapse
                    items={[
                        {
                            key: '7',
                            label: <span className="font-semibold text-slate-900">Can I manage mobile technicians in the field?</span>,
                            children: <p className="text-slate-700 leading-relaxed">Absolutely. Autopane AI allows you to create digital work orders and dispatch them to technicians. Technicians can access job details on-site, upload photos, and capture customer signatures directly on their mobile devices.</p>,
                            style: { borderRadius: '8px', marginBottom: '8px' }
                        },
                        {
                            key: '8',
                            label: <span className="font-semibold text-slate-900">How does the "Quote-to-Invoice" flow work?</span>,
                            children: <p className="text-slate-700 leading-relaxed">Our system is built for speed. Once a customer approves a quote, you can convert it into a Work Order with one click. After the job is completed, that work order is instantly converted into a professional invoice—no duplicate data entry required.</p>,
                            style: { borderRadius: '8px', marginBottom: '8px' }
                        },
                        {
                            key: '9',
                            label: <span className="font-semibold text-slate-900">Does the platform handle insurance claims?</span>,
                            children: <p className="text-slate-700 leading-relaxed">Yes. Autopane AI helps you track insurance claim statuses, document required compliance information, and monitor outstanding balances to ensure you get paid faster by both providers and private customers.</p>,
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

            <div className="mb-0">
                <h3 className="text-xl font-bold text-slate-800 mb-4 px-2 tracking-tight">Security & Support</h3>
                <Collapse
                    items={[
                        {
                            key: '10',
                            label: <span className="font-semibold text-slate-900">Is my business data secure?</span>,
                            children: <p className="text-slate-700 leading-relaxed">Security is our top priority. All data is encrypted and stored in secure cloud environments with automatic backups. We also use role-based access control, meaning you decide exactly which team members can see sensitive financial or customer data.</p>,
                            style: { borderRadius: '8px', marginBottom: '8px' }
                        },
                        {
                            key: '11',
                            label: <span className="font-semibold text-slate-900">What happens with my data?</span>,
                            children: <p className="text-slate-700 leading-relaxed">You will always maintain full ownership of your data.</p>,
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
        </div>
    );
};

export default PricingFAQ;
