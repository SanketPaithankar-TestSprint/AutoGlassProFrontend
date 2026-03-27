import React, { useState, useEffect } from 'react';
import { Typography, Input, Spin, Empty, Card, Row, Col, Tag, Button } from 'antd';
import { BookOutlined, CalendarOutlined, TagOutlined, SearchOutlined, LeftOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getHelpArticles } from '../../api/getHelpArticles';

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;

const HelpArticlesPage = () => {
    console.log('🚀 HelpArticlesPage component mounted');
    
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const fetchArticles = async (params = {}) => {
        setLoading(true);
        try {
            const response = await getHelpArticles({
                search: params.search || searchTerm,
                category: params.category || selectedCategoryId,
                limit: params.limit || pagination.pageSize,
                offset: params.offset || (params.current ? (params.current - 1) * pagination.pageSize : 0)
            });
            console.log('📄 HelpArticlesPage - API Response received:', response);
            console.log('📄 HelpArticlesPage - Response type:', typeof response);
            console.log('📄 HelpArticlesPage - Is array:', Array.isArray(response));
            console.log('📄 HelpArticlesPage - Response length:', response?.length);
            setArticles(response);
            // Note: API doesn't return total count, so we'll assume there might be more
            setPagination(prev => ({ 
                ...prev, 
                current: params.current || 1,
                total: response.length === prev.pageSize ? (params.current || 1) * prev.pageSize + prev.pageSize : response.length
            }));
        } catch (error) {
            console.error('❌ HelpArticlesPage - Failed to fetch help articles:', error);
            console.error('❌ HelpArticlesPage - Error details:', error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log('🔍 useEffect triggered - searchParams changed');
        // Check for category in URL parameters
        const categoryFromUrl = searchParams.get('category');
        const categoryIdFromUrl = searchParams.get('categoryId');
        console.log('🔍 URL Params - category:', categoryFromUrl, 'categoryId:', categoryIdFromUrl);
        console.log('🔍 searchParams object:', Object.fromEntries(searchParams));
        
        if (categoryFromUrl && categoryIdFromUrl) {
            const decodedCategory = decodeURIComponent(categoryFromUrl);
            console.log('🔍 Decoded category:', decodedCategory);
            setSelectedCategory(decodedCategory);
            setSelectedCategoryId(parseInt(categoryIdFromUrl));
            fetchArticles({ category: parseInt(categoryIdFromUrl) });
        } else if (categoryFromUrl) {
            // Fallback for when only category name is passed
            const decodedCategory = decodeURIComponent(categoryFromUrl);
            console.log('🔍 Fallback - only category name found:', decodedCategory);
            setSelectedCategory(decodedCategory);
            fetchArticles(); // Fetch all articles (no filtering)
        } else {
            console.log('🔍 No category params found, fetching all articles');
            fetchArticles();
        }
    }, [searchParams]);

    const handleSearch = (value) => {
        setSearchTerm(value);
        fetchArticles({ search: value, category: selectedCategoryId });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    const renderArticleCard = (article) => {
        return (
            <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -4 }}
            >
                <Card
                    className="h-full cursor-pointer transition-all duration-300 hover:shadow-lg"
                    onClick={() => navigate(`/help/articles/${article.id}`)}
                    bodyStyle={{ padding: '24px' }}
                >
                    <div className="flex flex-col h-full">
                        {/* Article Header */}
                        <div className="mb-4">
                            <Title level={4} className="mb-3 !text-gray-800 !leading-tight">
                                {article.title}
                            </Title>
                            <Paragraph className="text-gray-600 mb-4 line-clamp-3 !mb-4">
                                {article.description}
                            </Paragraph>
                        </div>
                        
                        {/* Article Footer */}
                        <div className="flex items-center justify-between mt-auto">
                            <div className="flex items-center space-x-4">
                                {article.categoryName && (
                                    <Tag color="blue" icon={<TagOutlined />}>
                                        {article.categoryName}
                                    </Tag>
                                )}
                            </div>
                            <div className="flex items-center text-gray-500 text-sm">
                                <CalendarOutlined className="mr-1" />
                                {formatDate(article.lastUpdated)}
                            </div>
                        </div>
                    </div>
                </Card>
            </motion.div>
        );
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-12"
            >
                <div className="flex items-center justify-between mb-4">
                    {selectedCategory && (
                        <Button
                            icon={<LeftOutlined />}
                            onClick={() => {
                                setSelectedCategory(null);
                                setSelectedCategoryId(null);
                                navigate('/help/categories');
                                fetchArticles();
                            }}
                            size="small"
                            className="bg-white hover:bg-blue-50 border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-700 flex-shrink-0"
                        >
                            Back to Categories
                        </Button>
                    )}
                    {!selectedCategory && <div />}
                </div>
                
                <Title level={1} className="text-4xl font-bold text-gray-800 mb-4">
                    {selectedCategory ? `${selectedCategory} Articles` : 'Help Articles'}
                </Title>
                <Paragraph className="text-lg text-gray-600">
                    {selectedCategory 
                        ? `Browse all articles in ${selectedCategory} category` 
                        : 'Find comprehensive guides and tutorials to help you get the most out of our platform'
                    }
                </Paragraph>
            </motion.div>

            {/* Search Section - Only show when category is selected */}
            {selectedCategory && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="mb-8"
                >
                    <div className="flex justify-center">
                        <div className="w-full max-w-2xl">
                            <Search
                                placeholder={`Search in ${selectedCategory} articles...`}
                                allowClear
                                enterButton={<SearchOutlined />}
                                size="large"
                                onSearch={handleSearch}
                                onChange={(e) => !e.target.value && handleSearch('')}
                            />
                        </div>
                    </div>
                </motion.div>
            )}

            
            {/* Articles Grid */}
            <Spin spinning={loading}>
                {articles.length > 0 ? (
                    <Row gutter={[24, 24]}>
                        {articles.map((article) => (
                            <Col xs={24} md={12} lg={8} key={article.id}>
                                <div className="h-full">
                                    {renderArticleCard(article)}
                                </div>
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                    >
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description="No help articles found"
                            className="py-8"
                        />
                        <Paragraph className="text-gray-500">
                            Try adjusting your search terms or browse all articles
                        </Paragraph>
                        </motion.div>
                    )}
                </Spin>
        </div>
    );
};

export default HelpArticlesPage;
