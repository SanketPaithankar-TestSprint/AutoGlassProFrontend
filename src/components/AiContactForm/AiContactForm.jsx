// src/components/AiContactForm/AiContactForm.jsx
import React, { useState, useEffect } from 'react';
import { Table, message, Card, Typography, Button, Modal, Descriptions, Tag, Divider, List } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getAiContactForms, getAiContactFormById, updateAiContactFormStatus } from '../../api/aiContactForm';
import { getValidToken } from '../../api/getValidToken';

const { Title } = Typography;

// Glass code mappings for readable display
const POSITION_CODES = {
    F: 'Front',
    R: 'Rear',
    B: 'Back',
    M: 'Middle'
};

const SIDE_CODES = {
    C: 'Center',
    L: 'Left',
    R: 'Right'
};

// Helper function to format position and side codes
const formatPositionSide = (position, side) => {
    const parts = [];
    if (position && POSITION_CODES[position]) {
        parts.push(POSITION_CODES[position]);
    } else if (position) {
        parts.push(position);
    }
    if (side && SIDE_CODES[side]) {
        parts.push(SIDE_CODES[side]);
    } else if (side) {
        parts.push(side);
    }
    return parts.join(' ');
};

const AiContactForm = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);

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

    const handleOpenLead = async (record) => {
        setModalLoading(true);
        setIsModalOpen(true);
        setSelectedLead(null); // Clear previous

        const token = getValidToken();
        if (!token) {
            message.error("Authentication token not found");
            setModalLoading(false);
            setIsModalOpen(false);
            return;
        }

        try {
            const leadDetails = await getAiContactFormById(token, record.sessionId);
            setSelectedLead(leadDetails);

            // Update status to VIEWED if it's pending
            if (leadDetails.serviceDocumentStatus === 'PENDING') {
                try {
                    await updateAiContactFormStatus(token, record.sessionId, 'VIEWED');
                    // Update local state to reflect change?
                    // Ideally we should refresh the table too, but let's just update the modal data if needed
                } catch (e) {
                    console.error("Failed to update status to VIEWED", e);
                }
            }

        } catch (error) {
            message.error("Failed to load lead details");
            setIsModalOpen(false);
        } finally {
            setModalLoading(false);
        }
    };

    const handleCreateQuote = () => {
        if (!selectedLead) return;

        // Parse selectedGlasses if it's a string
        let items = [];
        if (selectedLead.selectedGlasses) {
            try {
                const glasses = typeof selectedLead.selectedGlasses === 'string'
                    ? JSON.parse(selectedLead.selectedGlasses)
                    : selectedLead.selectedGlasses;

                items = glasses.map(glass => {
                    const isWindshield = glass.glass_type?.toLowerCase() === 'windshield' || glass.glass_code === 'FW';
                    let description;

                    if (isWindshield) {
                        // Format: Windshield(FW)(Features)
                        const type = glass.glass_type || 'Windshield';
                        const code = glass.glass_code ? `(${glass.glass_code})` : '';
                        const features = (selectedLead.windshieldFeatures && selectedLead.windshieldFeatures.length > 0)
                            ? `(${selectedLead.windshieldFeatures.join(', ')})`
                            : '';

                        description = `${type}${code}${features}`;
                    } else {
                        // Standard format for other glass
                        description = `${glass.glass_type} - ${glass.position || ''} ${glass.side || ''} ${glass.glass_code || ''}`;
                    }

                    return {
                        nagsId: glass.glass_code || glass.glass_type,
                        glassType: glass.glass_type,
                        data: glass,
                        description: description,
                    };
                });
            } catch (e) {
                console.error("Failed to parse selectedGlasses", e);
            }
        }

        const prefillData = {
            aiContactFormId: selectedLead.sessionId, // Pass the ID for status tracking
            customer: {
                firstName: selectedLead.firstName,
                lastName: selectedLead.lastName,
                email: selectedLead.email,
                phone: selectedLead.phone,
                userId: selectedLead.userId,
                // New fields if available in response
                addressLine1: selectedLead.addrLine1, // Mapped correctly to addressLine1
                city: selectedLead.city,
                state: selectedLead.state,
                postalCode: selectedLead.postalCode,
                country: selectedLead.country
            },
            vehicle: {
                vehicleYear: selectedLead.year,
                vehicleMake: selectedLead.makeName,
                vehicleModel: selectedLead.modelName,
                vehicleStyle: selectedLead.bodyStyleName,
                bodyType: selectedLead.bodyStyleName,
                vin: selectedLead.vin,
                vehicleId: selectedLead.vehId
            },
            items: items,
            notes: `Created from AI Contact Form. Session ID: ${selectedLead.sessionId}`
        };

        setIsModalOpen(false);
        navigate('/search-by-root', { state: { prefillData } });
    };

    const columns = [
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
            title: 'Service Status',
            dataIndex: 'serviceDocumentStatus',
            key: 'serviceDocumentStatus',
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="default"
                    onClick={() => handleOpenLead(record)}
                >
                    Open
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

            {/* Lead Details Modal */}
            <Modal
                title="Lead Details"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                width={800}
                footer={[
                    <Button key="close" onClick={() => setIsModalOpen(false)}>
                        Close
                    </Button>,
                    <Button
                        key="create"
                        type="primary"
                        onClick={handleCreateQuote}
                        disabled={!selectedLead || selectedLead.serviceDocumentStatus === 'CREATED'}
                    >
                        Create Quote
                    </Button>
                ]}
            >
                {modalLoading ? (
                    <div className="p-8 text-center">Loading details...</div>
                ) : selectedLead ? (
                    <div className="flex flex-col gap-4">
                        <Descriptions title="Customer Information" bordered size="small" column={2}>
                            <Descriptions.Item label="Name">{selectedLead.firstName} {selectedLead.lastName}</Descriptions.Item>
                            <Descriptions.Item label="Email">{selectedLead.email}</Descriptions.Item>
                            <Descriptions.Item label="Phone">{selectedLead.phone || 'N/A'}</Descriptions.Item>
                            <Descriptions.Item label="Location">
                                {selectedLead.serviceType === 'in_shop' ?
                                    <span><Tag color="blue">In Shop</Tag> {selectedLead.city ? `(${selectedLead.city})` : ''}</span>
                                    :
                                    [selectedLead.addrLine1, selectedLead.city, selectedLead.state, selectedLead.postalCode].filter(Boolean).join(', ') || 'N/A'
                                }
                            </Descriptions.Item>
                        </Descriptions>

                        <Descriptions title="Vehicle Information" bordered size="small" column={1}>
                            <Descriptions.Item label="Vehicle">{selectedLead.year} {selectedLead.makeName} {selectedLead.modelName} - {selectedLead.bodyStyleName}</Descriptions.Item>
                            {selectedLead.vin && (
                                <Descriptions.Item label="VIN">{selectedLead.vin}</Descriptions.Item>
                            )}
                        </Descriptions>

                        <div>
                            <h4 className="font-bold mb-2">Requested Glasses</h4>
                            <List
                                size="small"
                                bordered
                                dataSource={typeof selectedLead.selectedGlasses === 'string' ? JSON.parse(selectedLead.selectedGlasses) : (selectedLead.selectedGlasses || [])}
                                renderItem={item => {
                                    const isWindshield = item.glass_type?.toLowerCase() === 'windshield' || item.glass_code === 'FW';
                                    const hasSensors = isWindshield && selectedLead.windshieldFeatures && selectedLead.windshieldFeatures.length > 0;

                                    return (
                                        <List.Item>
                                            <div className="flex flex-col w-full">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">{item.glass_type}</span>
                                                    {(item.position || item.side) && formatPositionSide(item.position, item.side) ? (
                                                        <>
                                                            <span className="text-gray-400">-</span>
                                                            <span className="font-medium text-gray-800">
                                                                {formatPositionSide(item.position, item.side)}
                                                            </span>
                                                        </>
                                                    ) : null}
                                                </div>
                                                {hasSensors && (
                                                    <div className="mt-2 pl-4 border-l-2 border-violet-200">
                                                        <span className="text-xs font-medium text-gray-600 mb-1 block">Sensors:</span>
                                                        <ul className="text-sm text-gray-700 space-y-1">
                                                            {selectedLead.windshieldFeatures.map(f => {
                                                                const formattedText = f.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                                                                return (
                                                                    <li key={f} className="flex items-center gap-2">
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
                                                                        {formattedText}
                                                                    </li>
                                                                );
                                                            })}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </List.Item>
                                    );
                                }}
                            />
                        </div>
                    </div>
                ) : (
                    <div>No details available</div>
                )}
            </Modal>
        </div>
    );
};

export default AiContactForm;
