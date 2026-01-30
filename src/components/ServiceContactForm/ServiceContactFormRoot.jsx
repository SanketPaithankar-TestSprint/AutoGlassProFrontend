import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Button, Statistic, Row, Col, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { getValidToken } from '../../api/getValidToken';
import urls from '../../config';

const { Title } = Typography;

const ServiceContactFormRoot = () => {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(false);

    // Function to fetch inquiries (Simulated or Real if endpoint exists)
    // Assuming we might have a GET endpoint or we just want to show this empty for now until real data is streamed/fetched.
    // For now, I will assume a GET endpoint exists or I will create a placeholder.
    // The user requirement said: "endpoint this endpoint in it curl -X 'GET' ... stream"
    // But also "accessable so that i can see the response from the get". 
    // I will try to fetch from the same base URL but GET /service-inquiries if standard REST.
    // However, I'll stick to a basic fetch implementation.

    const fetchInquiries = async () => {
        setLoading(true);
        try {
            // Placeholder: The actual GET endpoint for list might be different. 
            // If NOT provided, I will leave this as a placeholder or try to hit the collection resource.
            // Based on previous task, we created POST /v1/service-inquiries. Usually GET is on the same.
            const token = getValidToken();
            const response = await fetch(`${urls.javaApiUrl}/v1/service-inquiries/my?page=0&size=20&sort=createdAt,desc`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*'
                }
            });

            if (response.ok) {
                const data = await response.json();
                // Ensure data is array
                const safeData = Array.isArray(data) ? data : (data.content || []);
                setInquiries(safeData);
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
            key: 'name',
            render: (text, record) => `${record.firstName || ''} ${record.lastName || ''}`,
        },
        {
            title: 'Vehicle',
            key: 'vehicle',
            render: (text, record) => `${record.vehicleYear || ''} ${record.vehicleMake || ''} ${record.vehicleModel || ''}`,
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
            dataIndex: 'createdAt', // Adjust field name based on API
            key: 'createdAt',
            render: (date) => date ? new Date(date).toLocaleString() : '-',
        }
    ];

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
                        <Statistic title="Total Inquiries" value={inquiries.length} />
                    </Card>
                </Col>
            </Row>

            <Table
                dataSource={inquiries}
                columns={columns}
                rowKey="id"
                loading={loading}
            />
        </div>
    );
};

export default ServiceContactFormRoot;
