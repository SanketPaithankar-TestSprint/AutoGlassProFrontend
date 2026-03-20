import React, { useState, useEffect, useRef } from 'react';
import { Table, Card, Tag, Button, Statistic, Row, Col, Typography, Popconfirm, Tooltip, Modal, List, message, Tabs } from 'antd';
import { ReloadOutlined, EyeOutlined, DeleteOutlined, UserOutlined, CarOutlined, ToolOutlined, CalendarOutlined, InfoCircleOutlined, FileAddOutlined, RobotOutlined, FormOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { getValidToken } from '../../api/getValidToken';
import urls from '../../config';
import InquiryDetails from './InquiryDetails';
import AiChatInquiryDetails from './AiChatInquiryDetails';
import useServiceInquiries from './hooks/useServiceInquiries';
import useInquiryDetails from './hooks/useInquiryDetails';
import useAiChatInquiries from './hooks/useAiChatInquiries';
import { useInquiry } from '../../context/InquiryContext';
import { createQuoteFromInquiry } from '../../utils/createQuoteFromInquiry';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;

// Helper component to fetch and render full details inside the modal
const ModalInquiryDetails = ({ inquiryId }) => {
    const { inquiry, loading, error } = useInquiryDetails(inquiryId);

    if (loading) {
        return (
            <div className="flex justify-center flex-col items-center h-40">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-600 mb-4"></div>
                <div className="text-gray-500">Loading details...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 text-red-600 p-4 rounded-md shadow-sm border border-red-100">
                    {error}
                </div>
            </div>
        );
    }

    return <InquiryDetails inquiry={inquiry} />;
};

// ─────────────────────────────────────────────
//  Tab 1 – Contact Form Inquiries (unchanged)
// ─────────────────────────────────────────────
const ContactFormInquiriesTab = () => {
    const { t } = useTranslation();
    const [viewDetailsModalOpen, setViewDetailsModalOpen] = useState(false);
    const [selectedInquiryId, setSelectedInquiryId] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [currentPage, setCurrentPage] = useState(1);
    const [creatingQuoteId, setCreatingQuoteId] = useState(null);

    const navigate = useNavigate();
    const { inquiries, loading, total, fetchInquiries, deleteInquiry, markAsRead } = useServiceInquiries();
    const { badgeCount } = useInquiry();
    const prevBadgeRef = useRef(badgeCount);

    useEffect(() => {
        if (badgeCount > prevBadgeRef.current) {
            fetchInquiries(currentPage - 1);
            message.info(t('serviceContactForm.newInquiryReceived'));
        }
        prevBadgeRef.current = badgeCount;
    }, [badgeCount, fetchInquiries, currentPage]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        fetchInquiries(currentPage - 1);
    }, [fetchInquiries]);

    const handleDelete = async (id) => {
        await deleteInquiry(id);
    };

    const handleCreateQuote = async (record) => {
        setCreatingQuoteId(record.id);
        try {
            const token = getValidToken();
            const res = await fetch(`${urls.javaApiUrl}/v1/service-inquiries/${record.id}`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
            });
            const fullInquiry = res.ok ? await res.json() : record;
            const prefillData = await createQuoteFromInquiry(fullInquiry);
            markAsRead(record.id);
            localStorage.removeItem('agp_customer_data');
            localStorage.removeItem('agp_doc_metadata');
            navigate('/search-by-root', { state: { prefillData } });
        } catch (err) {
            console.error('[handleCreateQuote] Failed:', err);
            message.error(t('serviceContactForm.failedToPrepareQuote'));
        } finally {
            setCreatingQuoteId(null);
        }
    };

    const columns = [
        {
            title: t('serviceContactForm.name'),
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
            width: 150,
        },
        {
            title: t('serviceContactForm.vehicle'),
            dataIndex: 'vehicle',
            key: 'vehicle',
            ellipsis: true,
            responsive: ['md'],
        },
        {
            title: t('serviceContactForm.service'),
            dataIndex: 'serviceType',
            key: 'serviceType',
            responsive: ['lg'],
            render: (types) => (
                <>
                    {Array.isArray(types) ? types.slice(0, 2).map(tag => (
                        <Tag color="blue" key={tag} className="text-xs">
                            {tag}
                        </Tag>
                    )) : types}
                    {Array.isArray(types) && types.length > 2 && <span className="text-xs text-gray-500">+{types.length - 2}</span>}
                </>
            ),
        },
        {
            title: t('serviceContactForm.status'),
            dataIndex: 'status',
            key: 'status',
            width: 80,
            render: (status) => (
                <Tag color={status === 'NEW' ? 'green' : 'default'} className="text-xs">
                    {status || 'NEW'}
                </Tag>
            ),
        },
        {
            title: t('serviceContactForm.date'),
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            responsive: ['sm'],
            render: (date) => date ? new Date(date).toLocaleDateString() : '-',
        },
        {
            title: t('serviceContactForm.actions'),
            key: 'actions',
            width: 130,
            fixed: 'right',
            render: (text, record) => (
                <div className="flex gap-2">
                    <Tooltip title={t('serviceContactForm.viewDetails')}>
                        <Button
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetails(record)}
                            size="small"
                        />
                    </Tooltip>
                    <Tooltip title={t('serviceContactForm.createQuote')}>
                        <Button
                            icon={<FileAddOutlined />}
                            onClick={() => handleCreateQuote(record)}
                            size="small"
                            loading={creatingQuoteId === record.id}
                            style={{ color: '#16a34a', borderColor: '#16a34a' }}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Delete Inquiry"
                        description={t('serviceContactForm.deleteInquiryConfirm')}
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Tooltip title="Delete">
                            <Button
                                icon={<DeleteOutlined />}
                                danger
                                size="small"
                            />
                        </Tooltip>
                    </Popconfirm>
                </div>
            ),
        }
    ];

    const handleViewDetails = async (record) => {
        if (record.status !== 'READ') {
            await markAsRead(record.id);
        }

        if (isMobile) {
            setSelectedInquiryId(record.id);
            setViewDetailsModalOpen(true);
        } else {
            const width = 800;
            const height = 900;
            const left = (window.screen.width - width) / 2;
            const top = (window.screen.height - height) / 2;
            window.open(
                `/service-inquiry-view/${record.id}`,
                '_blank',
                `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
            );
        }
    };

    return (
        <>
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} md={8}>
                    <Card>
                        <Statistic title={t('serviceContactForm.totalInquiries')} value={total} />
                    </Card>
                </Col>
            </Row>

            {isMobile ? (
                <List
                    grid={{ gutter: 16, column: 1 }}
                    dataSource={inquiries}
                    loading={loading}
                    pagination={{
                        current: currentPage,
                        total: total,
                        pageSize: 20,
                        position: 'bottom',
                        align: 'center',
                        onChange: (page) => {
                            setCurrentPage(page);
                            fetchInquiries(page - 1);
                        }
                    }}
                    renderItem={item => (
                        <List.Item>
                            <Card
                                title={<div className="flex justify-between items-center">
                                    <span className="font-semibold truncate max-w-[150px]">{item.name}</span>
                                    <Tag color={item.status === 'NEW' ? 'green' : 'default'}>{item.status || 'NEW'}</Tag>
                                </div>}
                                actions={[
                                    <Button icon={<EyeOutlined />} onClick={() => handleViewDetails(item)}>{t('serviceContactForm.view')}</Button>,
                                    <Button
                                        icon={<FileAddOutlined />}
                                        onClick={() => handleCreateQuote(item)}
                                        loading={creatingQuoteId === item.id}
                                        style={{ color: '#16a34a', borderColor: '#16a34a' }}
                                    >{t('serviceContactForm.createQuote')}</Button>,
                                    <Popconfirm
                                        title={t('serviceContactForm.deleteInquiry')}
                                        description={t('serviceContactForm.deleteInquiryConfirm')}
                                        onConfirm={() => handleDelete(item.id)}
                                        okText={t('serviceContactForm.yes')}
                                        cancelText={t('serviceContactForm.no')}
                                    >
                                        <Button icon={<DeleteOutlined />} danger>Delete</Button>
                                    </Popconfirm>
                                ]}
                            >
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Vehicle:</span>
                                        <span>{item.vehicle}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Service:</span>
                                        <div className="text-right">
                                            {Array.isArray(item.serviceType)
                                                ? item.serviceType.map(t => <Tag key={t} className="mr-0 mb-1">{t}</Tag>)
                                                : item.serviceType}
                                        </div>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Date:</span>
                                        <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}</span>
                                    </div>
                                </div>
                            </Card>
                        </List.Item>
                    )}
                />
            ) : (
                <Table
                    dataSource={inquiries}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        current: currentPage,
                        total: total,
                        pageSize: 20,
                        showSizeChanger: false,
                        position: ['bottomCenter']
                    }}
                    onChange={(pagination) => {
                        setCurrentPage(pagination.current);
                        fetchInquiries(pagination.current - 1);
                    }}
                />
            )}

            <Modal
                open={viewDetailsModalOpen}
                onCancel={() => {
                    setViewDetailsModalOpen(false);
                    setSelectedInquiryId(null);
                }}
                footer={null}
                width={800}
                centered
                destroyOnClose
            >
                {selectedInquiryId && <ModalInquiryDetails inquiryId={selectedInquiryId} />}
            </Modal>
        </>
    );
};

// ─────────────────────────────────────────────
//  Tab 2 – AI Chat Inquiries
// ─────────────────────────────────────────────
const AiChatInquiriesTab = () => {
    const { forms, count, loading, fetchForms, markAsRead } = useAiChatInquiries();
    const [selectedForm, setSelectedForm] = useState(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [creatingQuoteId, setCreatingQuoteId] = useState(null);
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        fetchForms();
    }, [fetchForms]);

    const handleViewDetail = async (form) => {
        if (form.read === false) {
            await markAsRead(form.session_id);
        }
        setSelectedForm(form);
        setDetailModalOpen(true);
    };

    const handleCreateQuote = async (record) => {
        setCreatingQuoteId(record.session_id);
        try {
            // AI Chat inquiries in forms state are already full records
            const prefillData = await createQuoteFromInquiry(record);
            console.log('[AiChatInquiriesTab] prefillData:', prefillData);

            if (record.read === false) {
                await markAsRead(record.session_id);
            }

            localStorage.removeItem('agp_customer_data');
            localStorage.removeItem('agp_doc_metadata');
            navigate('/search-by-root', { state: { prefillData } });
        } catch (err) {
            console.error('[AiChatInquiriesTab] Create quote failed:', err);
            message.error(t('serviceContactForm.failedToPrepareQuote'));
        } finally {
            setCreatingQuoteId(null);
        }
    };

    const columns = [
        {
            title: 'Name',
            key: 'name',
            ellipsis: true,
            width: 160,
            render: (_, record) => `${record.first_name || ''} ${record.last_name || ''}`.trim() || '-',
        },
        {
            title: 'Vehicle',
            key: 'vehicle',
            ellipsis: true,
            responsive: ['md'],
            render: (_, record) =>
                [record.year, record.make_name, record.model_name].filter(Boolean).join(' ') || '-',
        },
        {
            title: 'Service Type',
            dataIndex: 'service_type',
            key: 'service_type',
            responsive: ['lg'],
            render: (type) => type ? (
                <Tag color="blue" className="text-xs">
                    {type.replace(/_/g, ' ').toUpperCase()}
                </Tag>
            ) : '-',
        },
        {
            title: 'Status',
            key: 'status',
            width: 80,
            render: (_, record) => (
                <Tag color={record.read === false ? 'green' : 'default'} className="text-xs">
                    {record.read === false ? 'NEW' : 'READ'}
                </Tag>
            ),
        },
        {
            title: 'Date',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 120,
            responsive: ['sm'],
            render: (date) => date ? new Date(date).toLocaleDateString() : '-',
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 130,
            fixed: 'right',
            render: (_, record) => {
                const isUnread = record.read === false;
                return (
                    <div className="flex gap-2">
                        <Tooltip title="View Details">
                            <Button
                                icon={<EyeOutlined />}
                                size="small"
                                style={{
                                    color: isUnread ? '#ff4d4f' : '#52c41a',
                                    borderColor: isUnread ? '#ffade8' : '#b7eb8f',
                                    backgroundColor: isUnread ? '#fff1f0' : '#f6ffed'
                                }}
                                onClick={() => handleViewDetail(record)}
                            />
                        </Tooltip>
                        <Tooltip title={t('serviceContactForm.createQuote')}>
                            <Button
                                icon={<FileAddOutlined />}
                                size="small"
                                loading={creatingQuoteId === record.session_id}
                                onClick={() => handleCreateQuote(record)}
                                style={{ color: '#16a34a', borderColor: '#16a34a' }}
                            />
                        </Tooltip>
                    </div>
                );
            },
        },
    ];

    return (
        <>
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} md={8}>
                    <Card>
                        <Statistic title="Total AI Chat Inquiries" value={count} />
                    </Card>
                </Col>
            </Row>

            <Table
                dataSource={forms}
                columns={columns}
                rowKey={(record, index) => record.session_id || index}
                loading={loading}
                pagination={{
                    pageSize: 20,
                    showSizeChanger: false,
                    position: ['bottomCenter'],
                }}
            />

            <Modal
                open={detailModalOpen}
                onCancel={() => {
                    setDetailModalOpen(false);
                    setSelectedForm(null);
                }}
                footer={null}
                width={800}
                centered
                destroyOnClose
            >
                {selectedForm && <AiChatInquiryDetails form={selectedForm} />}
            </Modal>
        </>
    );
};

// ─────────────────────────────────────────────
//  Root – wraps both tabs
// ─────────────────────────────────────────────
const ServiceContactFormRoot = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const { inquiries, loading, fetchInquiries } = useServiceInquiries();
    const [currentPage] = useState(1);
    const [activeTab, setActiveTab] = useState('contact-form');

    // Sync tab with location state (e.g. from notification)
    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab);
        }
    }, [location.state]);

    const tabItems = [
        {
            key: 'contact-form',
            label: (
                <span className="flex items-center gap-1">
                    <FormOutlined />
                    Contact Form Inquiries
                </span>
            ),
            children: <ContactFormInquiriesTab />,
        },
        {
            key: 'ai-chat',
            label: (
                <span className="flex items-center gap-1">
                    <RobotOutlined />
                    AI Chat Inquiries
                </span>
            ),
            children: <AiChatInquiriesTab />,
        },
    ];

    return (
        <div className="min-h-screen p-4 md:p-6 bg-slate-100">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                    <h1 className="!text-[30px] md:text-2xl font-bold text-slate-900 m-0">
                        {t('serviceContactForm.serviceInquiries')}
                    </h1>
                    <Tooltip title={t('serviceContactForm.viewAndManageTooltip')} placement="right">
                        <InfoCircleOutlined className="text-slate-400 text-base cursor-pointer hover:text-violet-500 transition-colors" />
                    </Tooltip>
                </div>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={() => fetchInquiries(0)}
                    loading={loading}
                    className="w-full sm:w-auto"
                >
                    {t('serviceContactForm.refresh')}
                </Button>
            </div>

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
                type="card"
                size="middle"
            />
        </div>
    );
};

export default ServiceContactFormRoot;
