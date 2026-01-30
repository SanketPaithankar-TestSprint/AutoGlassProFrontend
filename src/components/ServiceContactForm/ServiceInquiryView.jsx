import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Descriptions, Card, Tag, Typography, Spin, Alert } from 'antd';
import { getValidToken } from '../../api/getValidToken';
import urls from '../../config';

const { Title } = Typography;

const ServiceInquiryView = () => {
    const { id } = useParams();
    const [inquiry, setInquiry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchInquiry = async () => {
            try {
                const token = getValidToken();
                const response = await fetch(`${urls.javaApiUrl}/v1/service-inquiries/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': '*/*'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setInquiry(data);
                } else {
                    setError('Failed to fetch inquiry details');
                }
            } catch (err) {
                setError('An error occurred while fetching details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchInquiry();
        }
    }, [id]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '24px' }}>
                <Alert message="Error" description={error} type="error" showIcon />
            </div>
        );
    }

    if (!inquiry) {
        return null;
    }

    return (
        <div style={{ padding: '24px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
            <Card title={<Title level={4}>Inquiry Details #{inquiry.id}</Title>} bordered={false}>
                <Descriptions bordered column={1}>
                    {/* <Descriptions.Item label="Status">
                        <Tag color={inquiry.status === 'NEW' ? 'green' : 'blue'}>{inquiry.status}</Tag>
                    </Descriptions.Item> */}
                    <Descriptions.Item label="Customer Name">
                        {inquiry.firstName} {inquiry.lastName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">{inquiry.email}</Descriptions.Item>
                    <Descriptions.Item label="Phone">{inquiry.phone}</Descriptions.Item>
                    <Descriptions.Item label="Vehicle">
                        {inquiry.vehicleYear} {inquiry.vehicleMake} {inquiry.vehicleModel}
                    </Descriptions.Item>
                    <Descriptions.Item label="VIN">{inquiry.vin || '-'}</Descriptions.Item>
                    <Descriptions.Item label="License Plate">{inquiry.licensePlateNumber || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Service Type">
                        {inquiry.serviceType?.map(type => (
                            <Tag key={type}>{type}</Tag>
                        ))}
                    </Descriptions.Item>
                    <Descriptions.Item label="Service Preference">{inquiry.servicePreference}</Descriptions.Item>
                    <Descriptions.Item label="Affected Glass">
                        {inquiry.affectedGlassLocation?.map(loc => (
                            <Tag key={loc}>{loc}</Tag>
                        ))}
                    </Descriptions.Item>
                    <Descriptions.Item label="Windshield Features">
                        {inquiry.windshieldFeatures?.length > 0 ? (
                            inquiry.windshieldFeatures.map(f => <Tag key={f}>{f}</Tag>)
                        ) : '-'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Customer Message">{inquiry.customerMessage || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Address">
                        {inquiry.addressLine1} {inquiry.addressLine2}, {inquiry.city}, {inquiry.state} {inquiry.postalCode}
                    </Descriptions.Item>
                    <Descriptions.Item label="Created At">
                        {new Date(inquiry.createdAt).toLocaleString()}
                    </Descriptions.Item>
                </Descriptions>
            </Card>
        </div>
    );
};

export default ServiceInquiryView;
