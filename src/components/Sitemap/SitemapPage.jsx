import React from 'react';
import { motion } from 'framer-motion';
import PageHead from '../PageHead';

const SitemapPage = () => {
    const baseUrl = 'https://www.autopaneai.com';
    const sitemapSections = [
        {
            title: 'Main Pages',
            links: [
                { path: `${baseUrl}/`, title: 'Home', description: 'Welcome to AutoPane AI' },
                { path: `${baseUrl}/features`, title: 'Features', description: 'Explore our powerful features' },
                { path: `${baseUrl}/pricing`, title: 'Pricing', description: 'View our pricing plans' },
                { path: `${baseUrl}/about`, title: 'About', description: 'Learn more about us' },
                { path: `${baseUrl}/contact`, title: 'Contact', description: 'Get in touch with us' },
                { path: `${baseUrl}/blogs`, title: 'Blogs', description: 'Read our latest articles and updates' },
                { path: `${baseUrl}/vin-decoder`, title: 'VIN Decoder', description: 'Decode any vehicle VIN instantly using official NHTSA data' },
            ]
        },
        {
            title: 'Blogs',
            sectionPath: `${baseUrl}/blogs`,
            links: [
                { path: `${baseUrl}/blogs/6-figure-mobile-auto-glass-business`, title: '6 Figure Mobile Auto Glass Business' },
                { path: `${baseUrl}/blogs/auto-glass-startup-guide`, title: 'Auto Glass Startup Guide' },
                { path: `${baseUrl}/blogs/hidden-cost-of-manual-quoting-auto-glass`, title: 'Hidden Cost Of Manual Quoting Auto Glass' },
                { path: `${baseUrl}/blogs/maximize-auto-glass-profit-margins`, title: 'Maximize Auto Glass Profit Margins' },
                { path: `${baseUrl}/blogs/mobile-field-service-auto-glass`, title: 'Mobile Field Service Auto Glass' },
                { path: `${baseUrl}/blogs/vin-decoding-for-auto-glass-accuracy`, title: 'VIN Decoding For Auto Glass Accuracy' },
                { path: `${baseUrl}/blogs/the-anatomy-of-a-vin-what-exactly-does-a-vin-decoder-do`, title: 'The Anatomy Of A VIN: What Exactly Does A VIN Decoder Do?' },
                { path: `${baseUrl}/blogs/5-manual-auto-glass-tasks-to-delete-2026`, title: 'Stop Bleeding Billable Hours: 5 Manual Tasks To Kill In 2026' },
                { path: `${baseUrl}/blogs/modernizing-auto-glass-inventory-tracking-ai`, title: 'Modernizing Auto Glass Inventory Tracking With AI' },
            ]
        },
        {
            title: 'Legal & Information',
            links: [
                { path: `${baseUrl}/privacy-policy`, title: 'Privacy Policy', description: 'Our privacy policy and data protection' },
                { path: `${baseUrl}/terms-of-service`, title: 'Terms of Service', description: 'Terms and conditions for using the APAI platform' },
            ]
        }
    ];

    return (
        <div className="bg-transparent min-h-screen py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <PageHead
                title="Sitemap | APAI Auto Glass Management Software"
                description="Navigate the APAI website easily. Find links to our shop management features, pricing, blog guides, and support resources for auto glass professionals."
            />
            {/* Global Gradient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <motion.div
                    className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] min-w-[500px] min-h-[500px] rounded-full blur-[120px] opacity-20"
                    style={{ background: 'linear-gradient(135deg, #7E5CFE 0%, #00A8E4 100%)' }}
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.15, 0.25, 0.15],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] min-w-[500px] min-h-[500px] rounded-full blur-[120px] opacity-20"
                    style={{ background: 'linear-gradient(135deg, #00A8E4 0%, #7E5CFE 100%)' }}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.15, 0.25, 0.15],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                />
            </div>

            <div className="max-w-3xl mx-auto relative z-10">
                <div className="mb-12">
                    <h1 className="text-3xl font-bold text-slate-900 mb-4 font-outfit">Sitemap</h1>
                    <p className="text-lg text-slate-600">
                        A complete list of pages on AutoPane AI.
                    </p>
                </div>

                <div className="space-y-12">
                    {sitemapSections.map((section, index) => (
                        <div key={index}>
                            <h2 className="text-xl font-semibold text-slate-800 mb-6 pb-2 border-b border-slate-200">
                                {section.sectionPath ? (
                                    <a href={section.sectionPath} className="hover:underline decoration-2 underline-offset-4" target="_blank" rel="noopener noreferrer">
                                        {section.title}
                                    </a>
                                ) : (
                                    section.title
                                )}
                            </h2>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                                {section.links.map((link, linkIndex) => (
                                    <li key={linkIndex} className="group">
                                        <a href={link.path} className="flex flex-col h-full bg-gradient-to-br from-white/50 to-white/30 p-4 md:p-5 rounded-lg transition-all duration-300 border border-white/40 hover:border-violet-300 hover:bg-gradient-to-br hover:from-white/70 hover:to-white/50 hover:shadow-md cursor-pointer" target="_blank" rel="noopener noreferrer">
                                            <div className="flex flex-col gap-3">
                                                <span className="text-violet-600 font-semibold text-base md:text-lg group-hover:underline decoration-2 underline-offset-2 transition-all">
                                                    {link.title}
                                                </span>
                                            </div>
                                            {link.description && (
                                                <p className="text-sm md:text-base text-slate-600 leading-relaxed flex-grow">
                                                    {link.description}
                                                </p>
                                            )}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SitemapPage;
