import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Descriptions, Card, Tag, Typography, Spin, Alert, Image } from 'antd';
import { getValidToken } from '../../api/getValidToken';
import urls from '../../config';

const { Title } = Typography;

const ServiceInquiryView = () => {
    const { id } = useParams();
    const [inquiry, setInquiry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Secure Image Component to fetch image with auth token
    const SecureImage = ({ attachment }) => {
        const [imageUrl, setImageUrl] = useState(null);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            const fetchImage = async () => {
                try {
                    const token = getValidToken();
                    const response = await fetch(`${urls.javaApiUrl}/v1/service-inquiries/attachments/${attachment.id}/download`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': '*/*'
                        }
                    });

                    if (response.ok) {
                        const blob = await response.blob();
                        // Force type if needed, or rely on blob type. User mentioned adding .jpg extension, 
                        // effectively ensuring it's treated as an image.
                        const imageBlob = blob.type ? blob : new Blob([blob], { type: 'image/jpeg' });
                        const url = URL.createObjectURL(imageBlob);
                        setImageUrl(url);
                    }
                } catch (err) {
                    console.error("Error loading image:", err);
                } finally {
                    setLoading(false);
                }
            };

            fetchImage();
        }, [attachment.id]);

        if (loading) return <Spin size="small" />;

        return (
            <Image
                width={100}
                src={imageUrl || 'error_placeholder'}
                alt={attachment.fileName}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQ7_8HAAABjElEQVR4nO3BMQEAAADCoPVPbQ0PoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPwZkAAAAEAA="
            />
        );
    };

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
        <div className="p-4 md:p-6 bg-slate-50 min-h-screen">
            <Card
                title={<Title level={4} className="m-0">Inquiry Details #{inquiry.id}</Title>}
                bordered={false}
                className="shadow-sm"
            >
                <Descriptions bordered column={{ xs: 1, sm: 1, md: 1 }}>
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

                    <Descriptions.Item label="Attachments">
                        {inquiry.attachments && inquiry.attachments.length > 0 ? (
                            <div className="flex gap-2 flex-wrap">
                                {inquiry.attachments.map(att => (
                                    <div key={att.id} className="flex flex-col items-center">
                                        <SecureImage attachment={att} />
                                    </div>
                                ))}
                            </div>
                        ) : 'No attachments'}
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
