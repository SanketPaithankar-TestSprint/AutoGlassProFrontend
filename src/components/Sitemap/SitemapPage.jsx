import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const SitemapPage = () => {
    const sitemapSections = [
        {
            title: 'Main Pages',
            links: [
                { path: '/', title: 'Home', description: 'Welcome to AutoPane AI' },
                { path: '/features', title: 'Features', description: 'Explore our powerful features' },
                { path: '/pricing', title: 'Pricing', description: 'View our pricing plans' },
                { path: '/about', title: 'About', description: 'Learn more about us' },
                { path: '/contact', title: 'Contact', description: 'Get in touch with us' },
            ]
        },
        {
            title: 'Legal & Information',
            links: [
                { path: '/privacy-policy', title: 'Privacy Policy', description: 'Our privacy policy and data protection' },
            ]
        }
    ];

    return (
        <div className="bg-transparent min-h-screen py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
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
                                {section.title}
                            </h2>
                            <ul className="space-y-4">
                                {section.links.map((link, linkIndex) => (
                                    <li key={linkIndex} className="group">
                                        <Link to={link.path} className="block hover:bg-white/60 p-3 -mx-3 rounded-lg transition-colors border border-transparent hover:border-slate-100 hover:shadow-sm">
                                            <div className="flex items-baseline gap-3">
                                                <span className="text-violet-600 font-medium group-hover:underline decoration-2 underline-offset-2">
                                                    {link.title}
                                                </span>
                                                <span className="text-sm text-slate-400 font-mono hidden sm:inline-block">
                                                    https://autopaneai.com{link.path}
                                                </span>
                                            </div>
                                            {link.description && (
                                                <p className="text-sm text-slate-500 mt-1">
                                                    {link.description}
                                                </p>
                                            )}
                                        </Link>
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
