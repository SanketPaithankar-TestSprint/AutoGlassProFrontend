
// src/components/AiContactForm/AiContactForm.jsx
import React, { useState, useEffect } from 'react';
import { Table, message, Card, Typography, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getAiContactForms } from '../../api/aiContactForm';
import { getValidToken } from '../../api/getValidToken';

const { Title } = Typography;

const AiContactForm = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    const fetchData = async (page = 1, pageSize = 10) => {
        setLoading(true);
        const token = getValidToken();
        if (!token) {
            message.error("Authentication token not found");
            setLoading(false);
            return;
        }

        try {
            // API expects 0-indexed page
            const response = await getAiContactForms(token, page - 1, pageSize);
            setData(response.content || []);
            setPagination({
                current: page,
                pageSize: pageSize,
                total: response.totalElements || 0,
            });
        } catch (error) {
            message.error("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(pagination.current, pagination.pageSize);
    }, []);

    const handleTableChange = (pagination) => {
        fetchData(pagination.current, pagination.pageSize);
    };

    const handleCreateQuote = (record) => {
        // Parse selectedGlasses if it's a string
        let items = [];
        if (record.selectedGlasses) {
            try {
                const glasses = typeof record.selectedGlasses === 'string'
                    ? JSON.parse(record.selectedGlasses)
                    : record.selectedGlasses;

                items = glasses.map(glass => ({
                    nagsId: glass.glass_code || glass.glass_type,
                    glassType: glass.glass_type,
                    data: glass,
                    description: `${glass.glass_type} - ${glass.position || ''} ${glass.side || ''} ${glass.glass_code || ''}`,
                }));
            } catch (e) {
                console.error("Failed to parse selectedGlasses", e);
            }
        }

        const prefillData = {
            customer: {
                firstName: record.firstName,
                lastName: record.lastName,
                email: record.email,
                phone: record.phone,
                userId: record.userId
            },
            vehicle: {
                vehicleYear: record.year,
                vehicleMake: record.makeName,
                vehicleModel: record.modelName,
                vehicleStyle: record.bodyStyleName,
                bodyType: record.bodyStyleName,
                vin: null,
                vehicleId: record.vehId
            },
            items: items,
            notes: `Created from AI Contact Form. Session ID: ${record.sessionId}`
        };

        navigate('/search-by-root', { state: { prefillData } });
    };

    const columns = [
        {
            title: 'Contact Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text) => new Date(text).toLocaleString(),
        },
        {
            title: 'Name',
            key: 'name',
            render: (text, record) => `${record.firstName || ''} ${record.lastName || ''}`,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Vehicle',
            key: 'vehicle',
            render: (text, record) => `${record.year} ${record.makeName} ${record.modelName} ${record.bodyStyleName || ''}`,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
        },
        {
            title: 'Service Status',
            dataIndex: 'serviceDocumentStatus',
            key: 'serviceDocumentStatus',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="primary"
                    onClick={() => handleCreateQuote(record)}
                    disabled={record.serviceDocumentStatus === 'CREATED'} // Optional: disable if already created
                >
                    Create Quote
                </Button>
            ),
        },
    ];

    return (
        <div className="p-6">
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <Title level={4} style={{ margin: 0 }}>AI Contact Forms</Title>
                </div>
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="sessionId" // Assuming sessionId is unique
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                    }}
                    loading={loading}
                    onChange={handleTableChange}
                    scroll={{ x: true }}
                />
            </Card>
        </div>
    );
};

export default AiContactForm;
