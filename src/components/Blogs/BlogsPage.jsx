import React, { useState, useEffect } from 'react';
import { Layout, Typography, Button, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ArrowRightOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import PageHead from '../PageHead';
import { getBlogs } from '../../api/getBlogs';
import defaultCover from '../../assets/defaultcoverimg.png';

const CDN_BASE_URL = 'https://d3uhxzbj1embbx.cloudfront.net';

const { Content } = Layout;
const { Title, Paragraph, Text } = Typography;

const BlogCard = ({ post }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        if (post.slug) {
            navigate(`/blogs/${post.slug}`);
            window.scrollTo(0, 0);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            onClick={handleCardClick}
            className="flex flex-col md:flex-row bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-slate-100 h-full md:h-80 cursor-pointer group"
        >
            {/* Left Visual Side */}
            <div
                className="md:w-1/2 relative overflow-hidden h-64 md:h-auto"
            >
                <img
                    src={post.coverImageUrl ? `${CDN_BASE_URL}/${post.coverImageUrl}` : defaultCover}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/10"></div>

                <div className="absolute bottom-0 left-0 p-6 z-10 md:hidden">
                    <h3 className="text-xl font-bold text-white leading-tight shadow-black drop-shadow-md">
                        {post.title}
                    </h3>
                </div>
            </div>

            {/* Right Content Side */}
            <div className="md:w-1/2 p-6 md:p-10 flex flex-col justify-center bg-white relative">
                <div className="hidden md:block absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-transparent to-white z-10"></div>

                <div className="flex items-center gap-3 mb-3 text-xs font-medium text-slate-400 uppercase tracking-wider relative z-20">
                    <span>Uploaded on {new Date(post.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>

                <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 group-hover:text-violet-600 transition-colors relative z-20 hidden md:block">
                    {post.title}
                </h3>
                  
                {post.excerpt && (
                    <p className="text-slate-600 mb-4 line-clamp-3 relative z-20 hidden md:block">
                        {post.excerpt}
                    </p>
                )}

                <div className="mt-auto pt-6 flex items-center justify-end border-t border-slate-100">
                    <div className="flex items-center gap-2 text-violet-600 font-medium text-sm hover:gap-3 transition-all">
                        Read article <ArrowRightOutlined />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const BlogsPage = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const data = await getBlogs();
                if (Array.isArray(data)) {
                    setBlogs(data);
                }
            } catch (error) {
                console.error("Failed to load blogs", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    return (
        <div className="min-h-screen bg-white p-4 md:p-6 relative overflow-hidden font-sans text-slate-900">
            <PageHead 
                title="Auto Glass Business Insights & Guides | APAI Blog" 
                description="Expert advice for auto glass shop owners. Read our latest guides on scaling your business, and using AI features to increase your shop's profitability." 
            />
            {/* Gradient Background matching other pages */}
            <div
                className="fixed inset-0 z-0 pointer-events-none opacity-20"
                style={{ background: 'linear-gradient(135deg, #7E5CFE 0%, #00A8E4 100%)' }}
            />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Hero / Header Section */}
                <div className="text-center mb-6 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="text-violet-600 font-medium tracking-wide text-sm uppercase mb-1 block">
                            Discover our resources
                        </span>
                        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-2 font-outfit relative inline-block">
                            Resources to <span className="text-violet-600 relative">Grow</span> Your Business
                        </h1>
                        <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                            Expert advice, industry insights, and practical tips for modern auto glass shops.
                        </p>
                    </motion.div>
                </div>

                {/* Blog Grid */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
                    </div>
                ) : (
                    <div className="space-y-12 pb-20">
                        {blogs.length > 0 ? (
                            blogs.map((post, index) => (
                                <BlogCard key={post.slug || index} post={post} />
                            ))
                        ) : (
                            <div className="text-center py-20">
                                <h3 className="text-xl text-slate-400">No articles found yet. Check back soon!</h3>
                            </div>
                        )}

                        {/* Load More - Hidden for now or implement logic */}
                        {blogs.length > 5 && (
                            <div className="text-center pt-8">
                                <Button size="large" className="!px-8 !h-12 !border-slate-300 hover:!border-slate-800 hover:!text-slate-800 !text-slate-500 !rounded-none">
                                    Load more articles
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogsPage;
