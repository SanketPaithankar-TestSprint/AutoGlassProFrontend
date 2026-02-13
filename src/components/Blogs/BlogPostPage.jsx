import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Typography, Button, Spin } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined, CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { getBlogBySlug, getBlogs } from '../../api/getBlogs';

import defaultCover from '../../assets/defaultcoverimg.png';

const { Title, Paragraph } = Typography;

const BlogPostPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch current post and all blogs in parallel
                const [postData, allBlogs] = await Promise.all([
                    getBlogBySlug(slug),
                    getBlogs()
                ]);

                setPost(postData);

                // Filter out current post for related section
                if (Array.isArray(allBlogs)) {
                    const filtered = allBlogs.filter(blog => blog.slug !== slug);
                    setRelatedPosts(filtered);
                }

            } catch (error) {
                console.error("Failed to load blog data", error);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchData();
        }
    }, [slug]);

    const handleRelatedClick = (relatedSlug) => {
        navigate(`/blogs/${relatedSlug}`);
        window.scrollTo(0, 0);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex justify-center items-center">
                <Spin size="large" />
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-white flex flex-col justify-center items-center gap-4">
                <Title level={3}>Post not found</Title>
                <Link to="/blogs">
                    <Button type="primary">Back to Blogs</Button>
                </Link>
            </div>
        );
    }

    // Format date
    const formattedDate = new Date(post.createdAt || Date.now()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="min-h-screen bg-white pt-20 pb-20 relative overflow-hidden font-sans text-slate-900">
            {/* Gradient Background */}
            <div
                className="fixed inset-0 z-0 pointer-events-none opacity-20"
                style={{ background: 'linear-gradient(135deg, #7E5CFE 0%, #00A8E4 100%)' }}
            />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Back Button */}
                <Link to="/blogs" className="inline-flex items-center gap-2 text-slate-500 hover:text-violet-600 transition-colors mb-6 font-medium">
                    <ArrowLeftOutlined /> Back to Resources
                </Link>

                {/* Hero / Header */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Cover Image */}
                    <div className="w-full h-56 md:h-80 rounded-2xl overflow-hidden mb-6 shadow-sm">
                        <img
                            src={post.coverImageUrl || defaultCover}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 font-outfit leading-tight">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 border-b border-slate-100 pb-6 mb-6">
                        <div className="flex items-center gap-2">
                            <CalendarOutlined className="text-slate-400" />
                            <span>{formattedDate}</span>
                        </div>
                        {post.readTimeMinutes && (
                            <div className="flex items-center gap-2">
                                <ClockCircleOutlined className="text-slate-400" />
                                <span>{post.readTimeMinutes} min read</span>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="prose prose-lg prose-slate max-w-none bg-white p-8 rounded-xl
                        prose-headings:font-bold prose-headings:text-slate-900 prose-headings:font-outfit
                        prose-p:text-slate-600 prose-p:leading-relaxed
                        prose-a:text-violet-600 hover:prose-a:text-violet-700 
                        prose-img:rounded-xl prose-img:shadow-md
                        prose-strong:text-slate-800
                        prose-blockquote:border-l-4 prose-blockquote:border-violet-500 prose-blockquote:bg-violet-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:italic
                        mb-16"
                >
                    {/* Render HTML content safely */}
                    <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </motion.div>

                {/* Related Posts Section */}
                {relatedPosts.length > 0 && (
                    <div className="border-t border-slate-200 pt-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-8">More Resources</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {relatedPosts.map((relatedPost) => (
                                <motion.div
                                    key={relatedPost.slug}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5 }}
                                    onClick={() => handleRelatedClick(relatedPost.slug)}
                                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 cursor-pointer group flex flex-col h-full"
                                >
                                    <div className="h-48 overflow-hidden relative">
                                        <img
                                            src={relatedPost.coverImageUrl || defaultCover}
                                            alt={relatedPost.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                                    </div>
                                    <div className="p-6 flex flex-col flex-grow">
                                        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                                            {new Date(relatedPost.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-violet-600 transition-colors line-clamp-2">
                                            {relatedPost.title}
                                        </h3>
                                        <div className="mt-auto pt-4 flex items-center text-violet-600 font-medium text-sm">
                                            Read Article <ArrowRightOutlined className="ml-2" />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogPostPage;
