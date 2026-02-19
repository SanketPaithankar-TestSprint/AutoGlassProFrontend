import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Typography, Button, Spin } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined, CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import PageHead from '../PageHead';
import { getBlogBySlug, getBlogs } from '../../api/getBlogs';

import defaultCover from '../../assets/defaultcoverimg.png';

const CDN_BASE_URL = 'https://d3uhxzbj1embbx.cloudfront.net';

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

                console.log('Blog Post Data:', postData);
                console.log('Raw Content:', postData?.content);
                console.log('Content Type:', typeof postData?.content);

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

    console.log('Rendering post with content:', post.content);

    // Format date
    const formattedDate = new Date(post.createdAt || Date.now()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="min-h-screen bg-white pt-20 pb-20 relative overflow-hidden font-sans text-slate-900">
             <PageHead 
                title={post.metaTitle || post.title} 
                description={post.metaDescription || post.excerpt || "Read our latest blog post on Auto Glass Pro."} 
            />
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
                            src={post.coverImageUrl ? `${CDN_BASE_URL}/${post.coverImageUrl}` : defaultCover}
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
                            <span>Uploaded on {formattedDate}</span>
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
                    className="max-w-none bg-white p-8 rounded-xl mb-16"
                >
                    {/* Render HTML content safely */}
                    <div
                        className="text-slate-600 leading-relaxed [&_a]:text-violet-600 [&_a:hover]:text-violet-700 [&_a]:underline [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4 [&_li]:mb-2 [&_strong]:font-semibold [&_em]:italic [&_code]:bg-slate-100 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_pre]:bg-slate-900 [&_pre]:text-slate-100 [&_pre]:p-4 [&_pre]:rounded-lg [&_blockquote]:border-l-4 [&_blockquote]:border-violet-500 [&_blockquote]:bg-violet-50 [&_blockquote]:py-2 [&_blockquote]:px-4 [&_blockquote]:rounded-r-lg [&_blockquote]:italic [&_img]:rounded-lg [&_img]:shadow-md [&_img]:max-w-full [&_img]:h-auto"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
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
                                            src={relatedPost.coverImageUrl ? `${CDN_BASE_URL}/${relatedPost.coverImageUrl}` : defaultCover}
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
