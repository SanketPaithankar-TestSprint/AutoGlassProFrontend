import React, { useState, useEffect } from 'react';
import { Typography, Button, Spin, Tag, Breadcrumb, Card, Divider } from 'antd';
import { 
    ArrowLeftOutlined, 
    BookOutlined, 
    CalendarOutlined, 
    TagOutlined,
    HomeOutlined,
    QuestionCircleOutlined 
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { getHelpArticleById } from '../../api/getHelpArticles';

const { Title, Paragraph, Text } = Typography;

const HelpArticlePage = () => {
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchArticle = async () => {
            if (!id) return;
            
            setLoading(true);
            try {
                const response = await getHelpArticleById(id);
                setArticle(response);
            } catch (error) {
                console.error('Failed to fetch help article:', error);
                // Navigate back to help articles if article not found
                navigate('/help');
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [id, navigate]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <Spin size="large" />
            </div>
        );
    }

    if (!article) {
        return (
            <div className="text-center py-12">
                <Title level={2}>Article Not Found</Title>
                <Paragraph className="text-gray-600 mb-6">
                    The help article you're looking for doesn't exist or has been removed.
                </Paragraph>
                <Button type="primary" onClick={() => navigate('/help')}>
                    Back to Help & Support
                </Button>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto min-h-screen">
            {/* Top nav row: Back button only */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-3 mb-6 flex-wrap"
            >
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(-1)}
                    size="small"
                    className="bg-white hover:bg-violet-50 border-slate-200 hover:border-violet-300 text-slate-600 hover:text-violet-700 flex-shrink-0"
                >
                    Back
                </Button>
            </motion.div>

                {/* Article Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-8"
                >
                    <Card className="bg-white/80 backdrop-blur-sm border-violet-100 shadow-sm">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <Title level={1} className="!text-xl md:!text-2xl font-black text-gray-800 mb-2">
                                        {article.title}
                                    </Title>
                                    <Paragraph className="text-sm md:text-base text-gray-600 mb-4 font-medium leading-relaxed">
                                        {article.description}
                                    </Paragraph>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    {article.categoryName && (
                                        <Tag color="blue" icon={<TagOutlined />} className="px-3 py-1">
                                            {article.categoryName}
                                        </Tag>
                                    )}
                                    <div className="flex items-center text-gray-500">
                                        <CalendarOutlined className="mr-2" />
                                        <Text>Last updated: {formatDate(article.lastUpdated)}</Text>
                                    </div>
                                </div>
                                
                                                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Article Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <Card className="bg-white/80 backdrop-blur-sm border-violet-100 shadow-sm">
                        <div className="p-5 md:p-8">
                            <div className="prose prose-slate prose-base max-w-none">
                                <div 
                                    dangerouslySetInnerHTML={{ __html: article.content }}
                                    className="text-gray-700 leading-relaxed font-normal"
                                />
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Article Footer */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-8"
                >
                    <Card className="bg-violet-50/50 border-violet-100">
                        <div className="p-6 text-center">
                            <Paragraph className="text-gray-600 text-sm mb-6">
                                Can't find the answer you're looking for? Our support team is here to help.
                            </Paragraph>
                            <div className="flex justify-center">
                                <Button 
                                    type="primary" 
                                    className="bg-violet-600 border-violet-600 hover:bg-violet-700 h-10 px-8 rounded-lg font-bold"
                                    onClick={() => navigate('/help/contact')}
                                >
                                    Contact Support
                                </Button>
                            </div>
                        </div>
                    </Card>
                </motion.div>
        </div>
    );
};

export default HelpArticlePage;
