import React, { useMemo, useState } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Table, Tag, Button, Space, Tooltip, Card, Empty, Avatar } from 'antd';
import {
    EditOutlined,
    EyeOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
    CarOutlined,
    UserOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const localizer = momentLocalizer(moment);

// Document Status Colors
const getStatusColor = (status) => {
    switch (status) {
        case 'DRAFT': return '#8c8c8c';
        case 'QUOTE': return '#1890ff';
        case 'WORK_ORDER': return '#faad14';
        case 'INVOICE': return '#52c41a';
        case 'COMPLETED': return '#52c41a';
        case 'CANCELLED': return '#ff4d4f';
        default: return '#3174ad';
    }
};

// Calendar View for Documents
const DocumentCalendarView = ({ documents = [], onViewDetails }) => {
    const [view, setView] = useState(Views.MONTH);
    const [date, setDate] = useState(new Date());

    const events = useMemo(() => {
        return documents.map(doc => {
            const scheduledDate = doc.scheduledDate ? new Date(doc.scheduledDate) : new Date();
            // Assume 2 hour appointment if no end time
            const endDate = new Date(scheduledDate.getTime() + (2 * 60 * 60 * 1000));

            return {
                id: doc.id,
                title: `${doc.documentNumber} - ${doc.customerName || doc.customer?.name || 'Customer'}`,
                start: scheduledDate,
                end: endDate,
                resource: doc,
                allDay: false
            };
        });
    }, [documents]);

    const handleSelectEvent = (event) => {
        if (onViewDetails && event.resource) {
            onViewDetails(event.resource);
        }
    };

    const eventStyleGetter = (event) => {
        const doc = event.resource;
        const backgroundColor = getStatusColor(doc.documentType || doc.status);

        return {
            style: {
                backgroundColor,
                borderRadius: '4px',
                opacity: 0.9,
                color: 'white',
                border: '0px',
                display: 'block'
            }
        };
    };

    return (
        <div className="h-full bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 'calc(100vh - 350px)' }}
                onSelectEvent={handleSelectEvent}
                eventPropGetter={eventStyleGetter}
                view={view}
                onView={setView}
                date={date}
                onNavigate={setDate}
                views={['month', 'week', 'day', 'agenda']}
                popup
            />
        </div>
    );
};

// Status Column for Kanban View
const DocumentStatusColumn = ({ title, docType, documents, color, onViewDetails }) => {
    const filteredDocs = documents.filter(d => d.documentType === docType);

    return (
        <div className="flex-1 min-w-[300px] bg-slate-50 rounded-lg p-4 flex flex-col h-full border border-slate-200">
            <div className={`flex justify-between items-center mb-4 pb-2 border-b-2`} style={{ borderColor: color }}>
                <h3 className="font-semibold text-slate-700 m-0">{title}</h3>
                <Tag color={color}>{filteredDocs.length}</Tag>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                {filteredDocs.length === 0 ? (
                    <Empty description="No documents" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                    filteredDocs.map(doc => (
                        <Card
                            key={doc.id}
                            size="small"
                            bordered={false}
                            className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => onViewDetails && onViewDetails(doc)}
                            actions={[
                                <div className="text-xs text-slate-400 px-4 text-left">
                                    <ClockCircleOutlined className="mr-1" />
                                    {doc.scheduledDate
                                        ? moment(doc.scheduledDate).format('MMM DD, YYYY h:mm A')
                                        : 'Not Scheduled'}
                                </div>
                            ]}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <Tag color="blue">
                                    <FileTextOutlined className="mr-1" />
                                    {doc.documentNumber}
                                </Tag>
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<EyeOutlined />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onViewDetails && onViewDetails(doc);
                                    }}
                                    title="View Details"
                                />
                            </div>

                            <div className="mb-2">
                                <div className="flex items-center text-slate-700 mb-1">
                                    <UserOutlined className="mr-2 text-slate-400" />
                                    <span className="font-medium">{doc.customerName || doc.customer?.name || 'N/A'}</span>
                                </div>
                                {(doc.vehicle || doc.vehicleInfo) && (
                                    <div className="flex items-center text-slate-500 text-sm">
                                        <CarOutlined className="mr-2 text-slate-400" />
                                        <span>
                                            {doc.vehicle
                                                ? `${doc.vehicle.year} ${doc.vehicle.make} ${doc.vehicle.model}`
                                                : doc.vehicleInfo}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-slate-400">
                                    {doc.serviceLocation || 'Shop'}
                                </span>
                                {doc.totalAmount && (
                                    <span className="text-sm font-semibold text-green-600">
                                        ${doc.totalAmount.toFixed(2)}
                                    </span>
                                )}
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

// Kanban View for Documents
const DocumentKanbanView = ({ documents = [], onViewDetails }) => {
    return (
        <div className="flex gap-4 overflow-x-auto h-[calc(100vh-350px)] pb-2">
            <DocumentStatusColumn
                title="Quote"
                docType="QUOTE"
                documents={documents}
                color="#1890ff"
                onViewDetails={onViewDetails}
            />
            <DocumentStatusColumn
                title="Work Order"
                docType="WORK_ORDER"
                documents={documents}
                color="#faad14"
                onViewDetails={onViewDetails}
            />
            <DocumentStatusColumn
                title="Invoice"
                docType="INVOICE"
                documents={documents}
                color="#52c41a"
                onViewDetails={onViewDetails}
            />
        </div>
    );
};

// Table View for Documents
const DocumentTableView = ({ documents = [], onViewDetails }) => {
    const columns = [
        {
            title: 'Document #',
            dataIndex: 'documentNumber',
            key: 'documentNumber',
            width: 140,
            render: (text) => (
                <span className="font-medium text-blue-600">{text}</span>
            )
        },
        {
            title: 'Customer',
            key: 'customer',
            render: (_, record) => (
                <div>
                    <div className="font-medium text-slate-800">
                        {record.customerName || record.customer?.name || 'N/A'}
                    </div>
                    <div className="text-xs text-slate-500">{record.customer?.phone || ''}</div>
                </div>
            )
        },
        {
            title: 'Vehicle',
            key: 'vehicle',
            render: (_, record) => {
                if (record.vehicle) {
                    return (
                        <span className="text-slate-600">
                            {record.vehicle.year} {record.vehicle.make} {record.vehicle.model}
                        </span>
                    );
                }
                return record.vehicleInfo || '-';
            }
        },
        {
            title: 'Scheduled Date',
            dataIndex: 'scheduledDate',
            key: 'scheduledDate',
            width: 180,
            render: (date) => date
                ? moment(date).format('MMM DD, YYYY h:mm A')
                : '-'
        },
        {
            title: 'Type',
            dataIndex: 'documentType',
            key: 'documentType',
            width: 120,
            render: (type) => {
                const color = getStatusColor(type);
                return <Tag color={color}>{type}</Tag>;
            }
        },
        {
            title: 'Location',
            dataIndex: 'serviceLocation',
            key: 'serviceLocation',
            width: 120,
            render: (location) => location || 'Shop'
        },
        {
            title: 'Total',
            dataIndex: 'totalAmount',
            key: 'totalAmount',
            width: 100,
            render: (amount) => amount ? `$${amount.toFixed(2)}` : '-'
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 100,
            render: (_, record) => (
                <Tooltip title="View Details">
                    <Button
                        type="text"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => onViewDetails && onViewDetails(record)}
                    />
                </Tooltip>
            )
        }
    ];

    return (
        <Table
            dataSource={documents}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            className="shadow-sm border border-slate-200 rounded-lg"
            scroll={{ x: 'max-content' }}
        />
    );
};

// Main Component
const DocumentScheduleView = ({ documents = [], viewMode = 'calendar' }) => {
    const navigate = useNavigate();

    const handleViewDetails = (document) => {
        if (document.documentNumber) {
            navigate(`/quote/${document.documentNumber}`);
        }
    };

    if (viewMode === 'calendar') {
        return <DocumentCalendarView documents={documents} onViewDetails={handleViewDetails} />;
    } else if (viewMode === 'kanban') {
        return <DocumentKanbanView documents={documents} onViewDetails={handleViewDetails} />;
    } else {
        return <DocumentTableView documents={documents} onViewDetails={handleViewDetails} />;
    }
};

export default DocumentScheduleView;
