import React, { useState } from 'react';
import { Descriptions, Card, Tag, Typography, Spin, Image, Button, message } from 'antd';
import { FileAddOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useSecureImage from './hooks/useSecureImage';
import { createQuoteFromInquiry } from '../../utils/createQuoteFromInquiry';
import { useTranslation } from 'react-i18next';

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
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [creatingQuote, setCreatingQuote] = useState(false);

    const handleCreateQuote = async () => {
        setCreatingQuote(true);
        try {
            const prefillData = await createQuoteFromInquiry(inquiry);
            console.log('[InquiryDetails] prefillData:', prefillData);
            localStorage.removeItem('agp_customer_data');
            localStorage.removeItem('agp_doc_metadata');
            navigate('/quote', { state: { prefillData } });
        } catch (err) {
            console.error('[InquiryDetails] Create quote failed:', err);
            message.error('Failed to prepare quote. Please try again.');
        } finally {
            setCreatingQuote(false);
        }
    };

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
                <Descriptions.Item label="Body Style">{inquiry.bodyType || '-'}</Descriptions.Item>
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

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
                <Button
                    type="primary"
                    icon={<FileAddOutlined />}
                    loading={creatingQuote}
                    onClick={handleCreateQuote}
                    style={{ backgroundColor: '#2563eb', borderColor: '#2563eb' }}
                >
                    {t('serviceInquiries.createQuote')}
                </Button>
            </div>
        </Card>
    );
};

export default InquiryDetails;
