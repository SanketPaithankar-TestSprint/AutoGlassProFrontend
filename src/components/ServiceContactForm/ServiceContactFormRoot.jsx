import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Button, Statistic, Row, Col, Typography } from 'antd';
import { ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { getValidToken } from '../../api/getValidToken';
import urls from '../../config';

const { Title } = Typography;

const ServiceContactFormRoot = () => {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);

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
    }, []);

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Vehicle',
            dataIndex: 'vehicle',
            key: 'vehicle',
        },
        {
            title: 'Service Type',
            dataIndex: 'serviceType',
            key: 'serviceType',
            render: (types) => (
                <>
                    {Array.isArray(types) ? types.map(tag => (
                        <Tag color="blue" key={tag}>
                            {tag}
                        </Tag>
                    )) : types}
                </>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'NEW' ? 'green' : 'default'}>
                    {status || 'NEW'}
                </Tag>
            ),
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => date ? new Date(date).toLocaleString() : '-',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (text, record) => (
                <Button
                    icon={<EyeOutlined />}
                    onClick={() => handleViewDetails(record)}
                    shape="circle"
                />
            ),
        }
    ];

    const handleViewDetails = async (record) => {
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
            } catch (error) {
                console.error("Failed to update status", error);
            }
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={2}>Service Inquiries</Title>
                <Button
                    icon={<ReloadOutlined />}
                    onClick={fetchInquiries}
                    loading={loading}
                >
                    Refresh
                </Button>
            </div>

            <Row gutter={16} style={{ marginBottom: '24px' }}>
                <Col span={8}>
                    <Card>
                        <Statistic title="Total Inquiries" value={total} />
                    </Card>
                </Col>
            </Row>

            <Table
                dataSource={inquiries}
                columns={columns}
                rowKey="id"
                loading={loading}
                pagination={{
                    total: total,
                    pageSize: 20,
                    showSizeChanger: false
                }}
            />
        </div>
    );
};

export default ServiceContactFormRoot;
