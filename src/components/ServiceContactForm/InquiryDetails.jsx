import React from 'react';
import { Descriptions, Card, Tag, Typography, Spin, Image } from 'antd';
import useSecureImage from './hooks/useSecureImage';

const { Title } = Typography;

const SecureImage = ({ attachment }) => {
    const { imageUrl, loading } = useSecureImage(attachment?.id);

    if (loading) return <Spin size="small" />;

    return (
        <div className="mr-2 mb-2">
            <Image
                width={100}
                src={imageUrl || 'error_placeholder'}
                alt={attachment?.fileName}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQ7_8HAAABjElEQVR4nO3BMQEAAADCoPVPbQ0PoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPwZkAAAAEAA="
            />
        </div>
    );
};

const InquiryDetails = ({ inquiry }) => {
    if (!inquiry) return null;
    return (
        <Card
            title={<Title level={4} className="m-0 text-base md:text-lg">Inquiry Details #{inquiry.id}</Title>}
            bordered={false}
            className="shadow-sm w-full"
            styles={{ body: { padding: '12px md:24px' } }}
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
                    ].filter(val => val && val.trim() !== '').join(', ') || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Created At">
                    {new Date(inquiry.createdAt).toLocaleString()}
                </Descriptions.Item>
            </Descriptions>
        </Card>
    );
};

export default InquiryDetails;
