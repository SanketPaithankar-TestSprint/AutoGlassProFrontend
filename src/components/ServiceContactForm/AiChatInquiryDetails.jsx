import React from 'react';
import { Card, Tag, Typography, Divider } from 'antd';

const { Title, Text } = Typography;

const formatGlass = (g) => {
    if (typeof g === 'string') return g;
    if (typeof g === 'object' && g !== null) {
        const parts = [];
        if (g.glass_type) parts.push(g.glass_type);
        if (g.position) parts.push(g.position === 'F' ? 'Front' : g.position === 'R' ? 'Rear' : g.position);
        if (g.side) parts.push(g.side === 'L' ? 'Left' : g.side === 'R' ? 'Right' : g.side);
        if (g.glass_code) parts.push(`(${g.glass_code})`);
        return parts.join(' ') || JSON.stringify(g);
    }
    return String(g);
};

const formatFeature = (f) => {
    if (typeof f === 'string') return f.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return String(f);
};

const Field = ({ label, children }) => (
    <div style={{ marginBottom: 10 }}>
        <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 2 }}>
            {label}
        </Text>
        <div style={{ fontSize: 14 }}>{children || '-'}</div>
    </div>
);

const AiChatInquiryDetails = ({ form }) => {
    if (!form) return null;

    const {
        first_name, last_name, email, phone,
        year, make_name, model_name, body_style_name,
        service_type, selected_glasses, windshield_features, incident_details,
    } = form;

    return (
        <Card
            title={<Title level={5} style={{ margin: 0 }}>AI Chat Inquiry Details</Title>}
            bordered={false}
            size="small"
        >
            {/* Contact info row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 24px' }}>
                <Field label="Customer Name">
                    {[first_name, last_name].filter(Boolean).join(' ')}
                </Field>
                <Field label="Phone">{phone}</Field>
                <Field label="Email">{email}</Field>
            </div>

            <Divider style={{ margin: '8px 0' }} />

            {/* Vehicle + service row */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0 24px' }}>
                <Field label="Vehicle">
                    {[year, make_name, model_name, body_style_name].filter(Boolean).join(' ')}
                </Field>
                <Field label="Service Type">
                    {service_type
                        ? <Tag color="blue">{service_type.replace(/_/g, ' ').toUpperCase()}</Tag>
                        : '-'}
                </Field>
            </div>

            <Divider style={{ margin: '8px 0' }} />

            {/* Glasses + features row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                <Field label="Selected Glasses">
                    {Array.isArray(selected_glasses) && selected_glasses.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {selected_glasses.map((g, i) => (
                                <Tag key={i} color="cyan">{formatGlass(g)}</Tag>
                            ))}
                        </div>
                    ) : '-'}
                </Field>
                <Field label="Windshield Features">
                    {Array.isArray(windshield_features) && windshield_features.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {windshield_features.map((f, i) => (
                                <Tag key={i}>{formatFeature(f)}</Tag>
                            ))}
                        </div>
                    ) : '-'}
                </Field>
            </div>

            {incident_details && typeof incident_details === 'object' && (
                <>
                    <Divider style={{ margin: '8px 0' }} />
                    <Field label="Incident Details">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 24px' }}>
                            {Object.entries(incident_details).map(([key, val]) => (
                                <div key={key}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        {key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}:{' '}
                                    </Text>
                                    <Text style={{ fontSize: 13 }}>{String(val)}</Text>
                                </div>
                            ))}
                        </div>
                    </Field>
                </>
            )}
        </Card>
    );
};

export default AiChatInquiryDetails;
