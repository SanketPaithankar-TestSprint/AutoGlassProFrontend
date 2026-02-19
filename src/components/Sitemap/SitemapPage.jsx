import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageHead from '../PageHead';

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
                { path: '/blogs', title: 'Blogs', description: 'Read our latest articles and updates' },
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
                                {section.title}
                            </h2>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                                {section.links.map((link, linkIndex) => (
                                    <li key={linkIndex} className="group">
                                        <Link to={link.path} className="flex flex-col h-full bg-gradient-to-br from-white/50 to-white/30 p-4 md:p-5 rounded-lg transition-all duration-300 border border-white/40 hover:border-violet-300 hover:bg-gradient-to-br hover:from-white/70 hover:to-white/50 hover:shadow-md cursor-pointer">
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
