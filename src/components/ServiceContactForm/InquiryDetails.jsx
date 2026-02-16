import React, { useState, useEffect } from 'react';
import { Descriptions, Card, Tag, Typography, Spin, Alert, Image } from 'antd';
import { getValidToken } from '../../api/getValidToken';
import urls from '../../config';

const { Title } = Typography;

const InquiryDetails = ({ inquiryId }) => {
    const [inquiry, setInquiry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Secure Image Component to fetch image with auth token
    const SecureImage = ({ attachment }) => {
        const [imageUrl, setImageUrl] = useState(null);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            let active = true;
            const fetchImage = async () => {
                try {
                    const token = getValidToken();
                    const response = await fetch(`${urls.javaApiUrl}/v1/service-inquiries/attachments/${attachment.id}/download`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': '*/*'
                        }
                    });

                    if (response.ok && active) {
                        const blob = await response.blob();
                        const imageBlob = blob.type ? blob : new Blob([blob], { type: 'image/jpeg' });
                        const url = URL.createObjectURL(imageBlob);
                        setImageUrl(url);
                    }
                } catch (err) {
                    console.error("Error loading image:", err);
                } finally {
                    if (active) setLoading(false);
                }
            };

            fetchImage();
            return () => { active = false; };
        }, [attachment.id]);

        if (loading) return <Spin size="small" />;

        return (
            <div className="mr-2 mb-2">
                <Image
                    width={100}
                    src={imageUrl || 'error_placeholder'}
                    alt={attachment.fileName}
                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQ7_8HAAABjElEQVR4nO3BMQEAAADCoPVPbQ0PoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPwZkAAAAEAA="
                />
            </div>
        );
    };

    useEffect(() => {
        const fetchInquiry = async () => {
            if (!inquiryId) return;
            setLoading(true);
            try {
                const token = getValidToken();
                const response = await fetch(`${urls.javaApiUrl}/v1/service-inquiries/${inquiryId}`, {
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

        fetchInquiry();
    }, [inquiryId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-40">
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <Alert message="Error" description={error} type="error" showIcon />
            </div>
        );
    }

    if (!inquiry) {
        return null;
    }

    return (
        <Card
            title={<Title level={4} className="m-0 text-base md:text-lg">Inquiry Details #{inquiry.id}</Title>}
            bordered={false}
            className="shadow-sm w-full"
            bodyStyle={{ padding: '12px md:24px' }}
        >
            <Descriptions bordered column={1} size="small" layout="vertical">
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
                        <Tag key={type} className="mb-1">{type}</Tag>
                    ))}
                </Descriptions.Item>
                <Descriptions.Item label="Service Preference">{inquiry.servicePreference}</Descriptions.Item>
                <Descriptions.Item label="Affected Glass">
                    {inquiry.affectedGlassLocation?.map(loc => (
                        <Tag key={loc} className="mb-1">{loc}</Tag>
                    ))}
                </Descriptions.Item>
                <Descriptions.Item label="Windshield Features">
                    {inquiry.windshieldFeatures?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {inquiry.windshieldFeatures.map(f => <Tag key={f}>{f}</Tag>)}
                        </div>
                    ) : '-'}
                </Descriptions.Item>

                <Descriptions.Item label="Attachments">
                    {inquiry.attachments && inquiry.attachments.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {inquiry.attachments.map(att => (
                                <SecureImage key={att.id} attachment={att} />
                            ))}
                        </div>
                    ) : 'No attachments'}
                </Descriptions.Item>

                <Descriptions.Item label="Customer Message" className="whitespace-pre-wrap">
                    {inquiry.customerMessage || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Address">
                    {[
                        inquiry?.addressLine1,
                        inquiry?.addressLine2,
                        inquiry?.city,
                        inquiry?.state,
                        inquiry?.postalCode
                    ].filter(Boolean).join(', ') || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Created At">
                    {new Date(inquiry.createdAt).toLocaleString()}
                </Descriptions.Item>
            </Descriptions>
        </Card>
    );
};

export default InquiryDetails;
