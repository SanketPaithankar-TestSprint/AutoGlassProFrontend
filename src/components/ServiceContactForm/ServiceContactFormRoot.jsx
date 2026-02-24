import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Button, Statistic, Row, Col, Typography, message, Popconfirm, Tooltip, Modal, List } from 'antd';
import { ReloadOutlined, EyeOutlined, DeleteOutlined, UserOutlined, CarOutlined, ToolOutlined, CalendarOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { getValidToken } from '../../api/getValidToken';
import urls from '../../config';
import InquiryDetails from './InquiryDetails';

const { Title } = Typography;

const ServiceContactFormRoot = () => {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [viewDetailsModalOpen, setViewDetailsModalOpen] = useState(false);
    const [selectedInquiryId, setSelectedInquiryId] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchInquiries = async () => {
        setLoading(true);
        try {
            const token = getValidToken();
            const response = await fetch(`${urls.javaApiUrl}/v1/service-inquiries/my?page=0&size=20&sort=createdAt,desc`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*'
                }
            });

            if (response.ok) {
                const data = await response.json();
                // API returns paginated response with 'content' array
                const safeData = data.content || [];
                setInquiries(safeData);
                setTotal(data.totalElements || safeData.length);
            } else {
                console.error("Failed to fetch inquiries");
            }
        } catch (error) {
            console.error("Error fetching inquiries:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInquiries();

        const handleNewInquiry = () => {
            message.info('New inquiry received. Refreshing list...');
            fetchInquiries();
        };

        window.addEventListener('INQUIRY_RECEIVED', handleNewInquiry);

        return () => {
            window.removeEventListener('INQUIRY_RECEIVED', handleNewInquiry);
        };
    }, []);

    const handleDelete = async (id) => {
        try {
            const token = getValidToken();
            const response = await fetch(`${urls.javaApiUrl}/v1/service-inquiries/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*'
                }
            });

            if (response.ok) {
                message.success('Inquiry deleted successfully');
                fetchInquiries(); // Refetch the list to update the UI

                // Dispatch event to notify sidebar to refresh badge count
                window.dispatchEvent(new CustomEvent('INQUIRY_STATUS_CHANGED'));
            } else {
                message.error('Failed to delete inquiry');
            }
        } catch (error) {
            console.error("Error deleting inquiry:", error);
            message.error('An error occurred while deleting');
        }
    };


    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
            width: 150,
        },
        {
            title: 'Vehicle',
            dataIndex: 'vehicle',
            key: 'vehicle',
            ellipsis: true,
            responsive: ['md'],
        },
        {
            title: 'Service',
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
            title: 'Status',
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
            title: 'Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            responsive: ['sm'],
            render: (date) => date ? new Date(date).toLocaleDateString() : '-',
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 100,
            fixed: 'right',
            render: (text, record) => (
                <div className="flex gap-2">
                    <Tooltip title="View Details">
                        <Button
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetails(record)}
                            size="small"
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Delete Inquiry"
                        description="Are you sure you want to delete this inquiry?"
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
        // Update status to READ if it's NEW
        if (record.status !== 'READ') {
            try {
                const token = getValidToken();
                await fetch(`${urls.javaApiUrl}/v1/service-inquiries/${record.id}/status?status=READ`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': '*/*'
                    }
                });

                // Update local state
                setInquiries(prev => prev.map(item =>
                    item.id === record.id ? { ...item, status: 'READ' } : item
                ));

                // Dispatch event to notify sidebar to refresh badge count
                window.dispatchEvent(new CustomEvent('INQUIRY_STATUS_CHANGED'));
            } catch (error) {
                console.error("Failed to update status", error);
            }
        }

        if (isMobile) {
            setSelectedInquiryId(record.id);
            setViewDetailsModalOpen(true);
        } else {
            // Open the window immediately
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
        <div className="min-h-screen p-4 md:p-6 bg-slate-100">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                    <h1 className="!text-[30px] md:text-2xl font-bold text-slate-900 m-0">Service Inquiries</h1>
                    <Tooltip title="View and manage incoming service requests from customers" placement="right">
                        <InfoCircleOutlined className="text-slate-400 text-base cursor-pointer hover:text-violet-500 transition-colors" />
                    </Tooltip>
                </div>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchInquiries}
                    loading={loading}
                    className="w-full sm:w-auto"
                >
                    Refresh
                </Button>
            </div>

            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} md={8}>
                    <Card>
                        <Statistic title="Total Inquiries" value={total} />
                    </Card>
                </Col>
            </Row>

            {isMobile ? (
                <List
                    grid={{ gutter: 16, column: 1 }}
                    dataSource={inquiries}
                    loading={loading}
                    pagination={{
                        total: total,
                        pageSize: 20,
                        position: 'bottom',
                        align: 'center',
                        onChange: (page) => {
                            // If implement server-side pagination, would call fetchInquiries with new page
                            // Current implementation fetches page 0 hardcoded in fetchInquiries
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
                                    <Button icon={<EyeOutlined />} onClick={() => handleViewDetails(item)}>View</Button>,
                                    <Popconfirm
                                        title="Delete Inquiry"
                                        description="Are you sure?"
                                        onConfirm={() => handleDelete(item.id)}
                                        okText="Yes"
                                        cancelText="No"
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
                        total: total,
                        pageSize: 20,
                        showSizeChanger: false,
                        position: ['bottomCenter']
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
                {selectedInquiryId && <InquiryDetails inquiryId={selectedInquiryId} />}
            </Modal>
        </div>
    );
};

export default ServiceContactFormRoot;
