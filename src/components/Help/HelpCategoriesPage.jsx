import React, { useState, useEffect } from 'react';
import { Typography, Card, Row, Col, Spin, Empty, Tag, Button } from 'antd';
import { BookOutlined, FolderOutlined, LeftOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getHelpCategories } from '../../api/getHelpCategories';

const { Title, Paragraph } = Typography;

const HelpCategoriesPage = () => {
    console.log('🚀 HelpCategoriesPage component mounted');
    
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            try {
                // Fetch categories from the proper API
                const response = await getHelpCategories();
                console.log('📂 Categories - API Response:', response);
                
                setCategories(response);
            } catch (error) {
                console.error('❌ Failed to fetch categories:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const handleCategoryClick = (category) => {
        console.log('📂 Clicking category:', category);
        // Navigate to articles page with category ID and name
        navigate(`/help/articles?categoryId=${category.id}&category=${encodeURIComponent(category.name)}`);
    };

    const renderCategoryCard = (category) => {
        return (
            <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -4 }}
            >
                <Card
                    className="h-full cursor-pointer transition-all duration-300 hover:shadow-lg bg-blue-50 border-blue-200 hover:bg-blue-100"
                    onClick={() => handleCategoryClick(category)}
                    bodyStyle={{ padding: '32px' }}
                >
                    <div className="flex flex-col items-center text-center h-full">
                        <div className="mb-6">
                            <FolderOutlined className="text-5xl text-blue-600" />
                        </div>
                        <Title level={3} className="mb-3 !text-blue-800">
                            {category.name}
                        </Title>
                        <Paragraph className="text-blue-600 text-lg mb-4">
                            {category.articleCount} {category.articleCount === 1 ? 'article' : 'articles'}
                        </Paragraph>
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
                    <Button
                        icon={<LeftOutlined />}
                        onClick={() => navigate('/help')}
                        size="small"
                        className="bg-white hover:bg-blue-50 border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-700 flex-shrink-0"
                    >
                        Back
                    </Button>
                    <div />
                </div>
                
                <Title level={1} className="text-4xl font-bold text-gray-800 mb-4">
                    Help Categories
                </Title>
                <Paragraph className="text-lg text-gray-600">
                    Browse help articles by category to find exactly what you're looking for
                </Paragraph>
            </motion.div>

            {/* Categories Grid */}
            <Spin spinning={loading}>
                {categories.length > 0 ? (
                    <Row gutter={[24, 24]}>
                        {categories.map((category) => (
                            <Col xs={24} sm={12} md={8} lg={6} key={category.id}>
                                <div className="h-full">
                                    {renderCategoryCard(category)}
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
                            description="No categories found"
                            className="py-8"
                        />
                        <Paragraph className="text-gray-500">
                            Please check back later for help categories
                        </Paragraph>
                    </motion.div>
                )}
            </Spin>
        </div>
    );
};

export default HelpCategoriesPage;
