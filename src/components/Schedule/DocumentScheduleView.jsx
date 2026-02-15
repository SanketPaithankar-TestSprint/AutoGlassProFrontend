import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Table, Tag, Button, Space, Tooltip, Card, Empty, Avatar, Modal, message, Spin } from 'antd';
import {
    EditOutlined,
    EyeOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
    CarOutlined,
    UserOutlined,
    HomeOutlined,
    MobileOutlined,
    CarryOutOutlined
} from '@ant-design/icons';
import { convertToWorkOrder } from '../../api/convertToWorkOrder';
import { convertToInvoice } from '../../api/convertToInvoice';
import { updateServiceDocument } from '../../api/updateServiceDocument';

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

// Service Type Icon Helper
const getServiceTypeIcon = (serviceType) => {
    if (!serviceType) return null;
    const lower = serviceType.toLowerCase();
    if (lower.includes('in-shop') || lower.includes('inshop')) return <HomeOutlined className="mr-1" />;
    if (lower.includes('mobile')) return <MobileOutlined className="mr-1" />;
    if (lower.includes('delivery')) return <CarryOutOutlined className="mr-1" />;
    return null;
};

// Mobile Detector Hook
const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return isMobile;
};

// Mobile Calendar View with dots
const MobileDocumentCalendarView = ({ documents = [], onViewDetails }) => {
    const [currentDate, setCurrentDate] = useState(moment());
    const [selectedDateAppointments, setSelectedDateAppointments] = useState([]);
    const [showModal, setShowModal] = useState(false);

    // Group documents by date
    const documentsByDate = useMemo(() => {
        const grouped = {};
        documents.forEach(doc => {
            if (doc.scheduledDate) {
                const dateKey = moment(doc.scheduledDate).format('YYYY-MM-DD');
                if (!grouped[dateKey]) {
                    grouped[dateKey] = [];
                }
                grouped[dateKey].push(doc);
            }
        });
        return grouped;
    }, [documents]);

    const handleDateClick = (day) => {
        const dateKey = moment(day).format('YYYY-MM-DD');
        const appointments = documentsByDate[dateKey] || [];
        setSelectedDateAppointments(appointments);
        setShowModal(true);
    };

    const renderCalendarDays = () => {
        const startOfMonth = currentDate.clone().startOf('month');
        const endOfMonth = currentDate.clone().endOf('month');
        const startDay = startOfMonth.clone().startOf('week');

        const days = [];
        let day = startDay.clone();

        while (day.isBefore(endOfMonth.clone().endOf('week'))) {
            days.push(day.clone());
            day.add(1, 'day');
        }

        return days;
    };

    const calendarDays = renderCalendarDays();
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <Button
                    type="text"
                    size="small"
                    onClick={() => setCurrentDate(currentDate.clone().subtract(1, 'month'))}
                >
                    ←
                </Button>
                <h3 className="text-base font-semibold text-slate-900">
                    {currentDate.format('MMMM YYYY')}
                </h3>
                <Button
                    type="text"
                    size="small"
                    onClick={() => setCurrentDate(currentDate.clone().add(1, 'month'))}
                >
                    →
                </Button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-slate-500 py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, idx) => {
                    const dateKey = day.format('YYYY-MM-DD');
                    const hasAppointments = documentsByDate[dateKey];
                    const isCurrentMonth = day.isSame(currentDate, 'month');
                    const isToday = day.isSame(moment(), 'day');

                    return (
                        <div
                            key={idx}
                            onClick={() => hasAppointments && handleDateClick(day)}
                            className={`
                                aspect-square flex items-center justify-center rounded text-xs font-medium cursor-pointer relative
                                transition-all duration-200
                                ${isCurrentMonth ? 'text-slate-900' : 'text-slate-300'}
                                ${isToday ? 'bg-violet-100 border border-violet-300' : ''}
                                ${hasAppointments ? 'hover:bg-slate-100' : ''}
                            `}
                        >
                            <span>{day.date()}</span>
                            {hasAppointments && (
                                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-violet-500 rounded-full"></div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Modal for selected date appointments */}
            <Modal
                title={`Appointments - ${moment(selectedDateAppointments[0]?.scheduledDate).format('MMM DD, YYYY')}`}
                open={showModal}
                onCancel={() => setShowModal(false)}
                footer={null}
                width={350}
                bodyStyle={{ maxHeight: '500px', overflowY: 'auto' }}
            >
                {selectedDateAppointments.length === 0 ? (
                    <Empty description="No appointments" />
                ) : (
                    <div className="space-y-3">
                        {selectedDateAppointments.map(doc => (
                            <Card
                                key={doc.id}
                                size="small"
                                className="cursor-pointer hover:shadow-md transition-all"
                                onClick={() => {
                                    setShowModal(false);
                                    onViewDetails && onViewDetails(doc);
                                }}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <Tag color="blue">
                                        <FileTextOutlined className="mr-1" />
                                        {doc.documentNumber}
                                    </Tag>
                                    <Tag color={getStatusColor(doc.documentType)}>{doc.documentType}</Tag>
                                </div>

                                <div className="mb-2">
                                    <div className="flex items-center text-slate-700 mb-1">
                                        <UserOutlined className="mr-2 text-slate-400" />
                                        <span className="font-medium text-sm">{doc.customerName || doc.customer?.name || 'N/A'}</span>
                                    </div>
                                    {(doc.vehicle || doc.vehicleInfo) && (
                                        <div className="flex items-center text-slate-500 text-xs">
                                            <CarOutlined className="mr-2 text-slate-400" />
                                            <span>
                                                {doc.vehicle
                                                    ? `${doc.vehicle.year} ${doc.vehicle.make} ${doc.vehicle.model}`
                                                    : doc.vehicleInfo}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200">
                                    <span className="text-xs text-slate-400">{doc.serviceLocation || 'Shop'}</span>
                                    {doc.totalAmount && (
                                        <span className="text-sm font-semibold text-green-600">
                                            ${doc.totalAmount.toFixed(2)}
                                        </span>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </Modal>
        </div>
    );
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
// Draggable Document Card Component
const DraggableDocumentCard = ({ doc, color, onViewDetails, isDragging, isLoading }) => {
    return (
        <div
            draggable="true"
            className={`border-l-4 rounded-lg shadow-sm transition-all duration-150 cursor-grab active:cursor-grabbing p-3 bg-white ${isDragging ? 'opacity-50' : 'hover:shadow-md'} ${isLoading ? 'opacity-40' : ''}`}
            style={{ borderLeftColor: color }}
            onClick={() => !isLoading && onViewDetails && onViewDetails(doc)}
        >
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-lg">
                    <Spin size="small" />
                </div>
            )}

            <div className="flex justify-between items-start gap-2 mb-2">
                <Tag color="blue" className="text-xs">
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
                <div className="flex items-center text-slate-700 mb-1 text-sm">
                    <UserOutlined className="mr-2 text-slate-400" />
                    <span className="font-medium truncate">{doc.customerName || doc.customer?.name || 'N/A'}</span>
                </div>
                {(doc.vehicle || doc.vehicleInfo) && (
                    <div className="flex items-center text-slate-500 text-xs">
                        <CarOutlined className="mr-2 text-slate-400" />
                        <span>
                            {doc.vehicle
                                ? `${doc.vehicle.year} ${doc.vehicle.make} ${doc.vehicle.model}`
                                : doc.vehicleInfo}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                <div className="flex items-center text-xs text-slate-500 gap-1">
                    {getServiceTypeIcon(doc.serviceType)}
                    <span className="truncate">{doc.serviceLocation || 'Shop'}</span>
                </div>
                {doc.totalAmount && (
                    <span className="text-xs font-semibold text-green-600">
                        ${doc.totalAmount.toFixed(2)}
                    </span>
                )}
            </div>

            <div className="text-xs text-slate-400 mt-2">
                <ClockCircleOutlined className="mr-1" />
                {doc.scheduledDate
                    ? moment(doc.scheduledDate).format('MMM DD')
                    : 'Not Scheduled'}
            </div>
        </div>
    );
};

// Status Column with Drag & Drop Support
const DocumentStatusColumn = ({ title, docType, documents, color, onViewDetails, loadingDocId, onDragStart, onDragOver, onDrop }) => {
    const filteredDocs = documents.filter(d => d.documentType === docType);
    const [dragOver, setDragOver] = useState(false);

    return (
        <div
            className={`flex-1 min-w-[280px] md:min-w-[320px] bg-slate-50 rounded-lg p-3 md:p-4 flex flex-col h-full border transition-all ${
                dragOver ? 'bg-slate-100 shadow-md' : 'border-slate-200'
            }`}
            style={{
                borderColor: dragOver ? color : '#e2e8f0',
                borderWidth: dragOver ? '3px' : '2px'
            }}
            onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
                onDragOver?.(docType);
            }}
            onDragLeave={() => {
                setDragOver(false);
            }}
            onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const data = e.dataTransfer.getData('document');
                if (data) {
                    try {
                        const doc = JSON.parse(data);
                        onDrop?.(doc, docType);
                    } catch (err) {
                        console.error('Failed to parse dropped document:', err);
                    }
                }
            }}
        >
            <div className={`flex justify-between items-center mb-3 pb-2 border-b-2`} style={{ borderColor: color }}>
                <h3 className="font-semibold text-slate-700 m-0 text-sm md:text-base">{title}</h3>
                <Tag color={color}>{filteredDocs.length}</Tag>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 md:space-y-3 custom-scrollbar pr-1">
                {filteredDocs.length === 0 ? (
                    <Empty description="No documents" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ marginTop: '2rem' }} />
                ) : (
                    filteredDocs.map(doc => (
                        <div
                            key={doc.id}
                            draggable="true"
                            onDragStart={(e) => {
                                e.dataTransfer.effectAllowed = 'move';
                                e.dataTransfer.setData('document', JSON.stringify(doc));
                                onDragStart?.(doc);
                            }}
                        >
                            <DraggableDocumentCard
                                doc={doc}
                                color={color}
                                onViewDetails={onViewDetails}
                                isDragging={false}
                                isLoading={loadingDocId === (doc.id || doc.documentNumber)}
                            />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// Kanban View for Documents with Drag & Drop
const DocumentKanbanView = ({ documents = [], onViewDetails, onConversionSuccess }) => {
    const [docs, setDocs] = useState(documents);
    const [loadingDocId, setLoadingDocId] = useState(null);
    const [dragOverColumn, setDragOverColumn] = useState(null);
    const [targetTypeForDoc, setTargetTypeForDoc] = useState(null);

    useEffect(() => {
        setDocs(documents);
    }, [documents]);

    // Check if document has been converted, clear spinner when confirmed
    useEffect(() => {
        if (loadingDocId && targetTypeForDoc) {
            const convertedDoc = docs.find(doc => (doc.id === loadingDocId || doc.documentNumber === loadingDocId));
            if (convertedDoc && convertedDoc.documentType === targetTypeForDoc) {
                // Document has been successfully converted!
                setLoadingDocId(null);
                setTargetTypeForDoc(null);
                message.success('Conversion successful!');
            }
        }
    }, [docs, loadingDocId, targetTypeForDoc]);

    const handleDragStart = (doc) => {
        // Optional visual feedback
    };

    const handleDragOver = (columnType) => {
        setDragOverColumn(columnType);
    };

    const handleDrop = async (draggedDoc, targetDocType) => {
        setDragOverColumn(null);

        // No-op if dropped in same column
        if (draggedDoc.documentType === targetDocType) return;

        // Block Invoice from being moved to other columns
        if (draggedDoc.documentType === 'INVOICE') {
            Modal.error({
                title: 'Save Failed',
                content: 'Invoice cannot be changed to work order or quote',
                okText: 'OK',
            });
            return;
        }

        // Prevent further drag while processing
        const docId = draggedDoc.id || draggedDoc.documentNumber;
        if (loadingDocId === docId) return;

        setLoadingDocId(docId);
        setTargetTypeForDoc(targetDocType);

        try {
            const documentNumber = draggedDoc.documentNumber;
            let apiResponse;

            // Call appropriate conversion API
            if (draggedDoc.documentType === 'QUOTE' && targetDocType === 'WORK_ORDER') {
                apiResponse = await convertToWorkOrder(documentNumber);
                message.info('Converting to Work Order...');
            } else if (draggedDoc.documentType === 'WORK_ORDER' && targetDocType === 'INVOICE') {
                apiResponse = await convertToInvoice(documentNumber);
                message.info('Converting to Invoice...');
            } else if (draggedDoc.documentType === 'WORK_ORDER' && targetDocType === 'QUOTE') {
                apiResponse = await updateServiceDocument(documentNumber, { documentType: 'QUOTE' });
                message.info('Reverting to Quote...');
            } else if (draggedDoc.documentType === 'INVOICE' && targetDocType === 'WORK_ORDER') {
                apiResponse = await updateServiceDocument(documentNumber, { documentType: 'WORK_ORDER' });
                message.info('Reverting to Work Order...');
            } else {
                message.warning('Unsupported conversion');
                setLoadingDocId(null);
                setTargetTypeForDoc(null);
                return;
            }

            // Update local state immediately with API response if available
            if (apiResponse && apiResponse.documentType === targetDocType) {
                setDocs(prevDocs =>
                    prevDocs.map(doc =>
                        doc.id === docId || doc.documentNumber === docId
                            ? apiResponse // Use full API response
                            : doc
                    )
                );
            } else {
                // Fallback: optimistic update
                setDocs(prevDocs =>
                    prevDocs.map(doc =>
                        doc.id === docId || doc.documentNumber === docId
                            ? { ...doc, documentType: targetDocType }
                            : doc
                    )
                );
            }

            // Trigger parent to refetch from server
            if (onConversionSuccess) {
                await onConversionSuccess();
            }
        } catch (error) {
            console.error('Conversion error:', error);
            message.error(`Failed: ${error.message}`);
            setLoadingDocId(null);
            setTargetTypeForDoc(null);
        }
    };

    const columns = [
        { id: 'QUOTE', title: 'Quotes', color: '#1890ff', docType: 'QUOTE' },
        { id: 'WORK_ORDER', title: 'Work Orders', color: '#faad14', docType: 'WORK_ORDER' },
        { id: 'INVOICE', title: 'Invoices', color: '#52c41a', docType: 'INVOICE' }
    ];

    return (
        <div className="flex flex-col md:flex-row gap-2 md:gap-4 overflow-x-auto h-[calc(100vh-260px)] pb-2">
            {columns.map(column => (
                <DocumentStatusColumn
                    key={column.id}
                    title={column.title}
                    docType={column.docType}
                    documents={docs}
                    color={column.color}
                    onViewDetails={onViewDetails}
                    loadingDocId={loadingDocId}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                />
            ))}
        </div>
    );
};

// Table View for Documents
// Mobile Table View for Documents (Card Layout)
const MobileDocumentTableView = ({ documents = [], onViewDetails }) => {
    const typeColors = {
        'QUOTE': '#1890ff',
        'WORK_ORDER': '#faad14',
        'INVOICE': '#52c41a'
    };

    return (
        <div className="space-y-3 p-2">
            {documents.length === 0 ? (
                <Empty description="No documents" />
            ) : (
                documents.map(doc => (
                    <Card
                        key={doc.id}
                        size="small"
                        className="shadow-sm cursor-pointer hover:shadow-md transition-all border border-slate-200"
                        style={{ borderLeft: `4px solid ${typeColors[doc.documentType] || '#8c8c8c'}` }}
                        onClick={() => onViewDetails && onViewDetails(doc)}
                    >
                        {/* Header: Document Number & Type */}
                        <div className="flex items-start justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
                            <span className="text-xs font-bold text-blue-600">
                                {doc.documentNumber}
                            </span>
                            <Tag color={getStatusColor(doc.documentType)}>
                                {doc.documentType}
                            </Tag>
                        </div>

                        {/* Customer & Vehicle */}
                        <div className="space-y-2 mb-3">
                            {/* Customer */}
                            <div className="flex items-start gap-2">
                                <UserOutlined className="text-slate-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <div className="font-medium text-slate-800 text-sm">
                                        {doc.customerName || doc.customer?.name || 'N/A'}
                                    </div>
                                    {doc.customer?.phone && (
                                        <div className="text-xs text-slate-500">{doc.customer.phone}</div>
                                    )}
                                </div>
                            </div>

                            {/* Vehicle */}
                            {(doc.vehicle || doc.vehicleInfo) && (
                                <div className="flex items-start gap-2">
                                    <CarOutlined className="text-slate-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-xs text-slate-600">
                                        {doc.vehicle
                                            ? `${doc.vehicle.year} ${doc.vehicle.make} ${doc.vehicle.model}`
                                            : doc.vehicleInfo}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Service Details */}
                        <div className="space-y-2 mb-3 text-xs">
                            {/* Scheduled Date */}
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Scheduled:</span>
                                <span className="font-medium text-slate-700">
                                    {doc.scheduledDate
                                        ? moment(doc.scheduledDate).format('MMM DD, YYYY h:mm A')
                                        : 'Not Scheduled'}
                                </span>
                            </div>

                            {/* Location */}
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Location:</span>
                                <span className="font-medium text-slate-700">
                                    {doc.serviceLocation || 'Shop'}
                                </span>
                            </div>
                        </div>

                        {/* Total & Actions Footer */}
                        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                            <span className="text-sm font-bold text-green-600">
                                ${(doc.totalAmount || 0).toFixed(2)}
                            </span>
                            <Tooltip title="View Details">
                                <Button
                                    type="primary"
                                    size="small"
                                    icon={<EyeOutlined />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onViewDetails && onViewDetails(doc);
                                    }}
                                />
                            </Tooltip>
                        </div>
                    </Card>
                ))
            )}
        </div>
    );
};

// Desktop Table View for Documents
const DesktopDocumentTableView = ({ documents = [], onViewDetails }) => {
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

// Document Table View Wrapper (Routes to mobile or desktop)
const DocumentTableView = ({ documents = [], onViewDetails }) => {
    const isMobile = useIsMobile();

    if (isMobile) {
        return <MobileDocumentTableView documents={documents} onViewDetails={onViewDetails} />;
    }

    return <DesktopDocumentTableView documents={documents} onViewDetails={onViewDetails} />;
};

// Mobile List View for Kanban documents (using card strategy from quotes page)
const MobileDocumentListView = ({ documents = [], onViewDetails }) => {
    const [selectedType, setSelectedType] = useState('QUOTE');

    const filteredDocs = documents.filter(doc => doc.documentType === selectedType);
    const types = ['QUOTE', 'WORK_ORDER', 'INVOICE'];
    const typeNames = { QUOTE: 'Quotes', WORK_ORDER: 'Work Orders', INVOICE: 'Invoices' };
    const typeColors = { QUOTE: '#1890ff', WORK_ORDER: '#faad14', INVOICE: '#52c41a' };

    return (
        <div className="flex flex-col h-[calc(100vh-350px)]">
            {/* Type Tabs */}
            <div className="flex gap-2 pb-3 border-b border-slate-200 overflow-x-auto">
                {types.map(type => (
                    <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`px-3 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${selectedType === type
                            ? 'text-white'
                            : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
                            }`}
                        style={selectedType === type ? { backgroundColor: typeColors[type] } : {}}
                    >
                        {typeNames[type]} ({documents.filter(d => d.documentType === type).length})
                    </button>
                ))}
            </div>

            {/* Documents List */}
            <div className="flex-1 overflow-y-auto space-y-3 mt-3 px-2">
                {filteredDocs.length === 0 ? (
                    <Empty description="No documents" />
                ) : (
                    filteredDocs.map(doc => (
                        <Card
                            key={doc.id}
                            size="small"
                            className="shadow-sm cursor-pointer hover:shadow-md transition-all border border-slate-200"
                            style={{ borderLeft: `4px solid ${typeColors[selectedType]}` }}
                            onClick={() => onViewDetails && onViewDetails(doc)}
                        >
                            {/* Document Header */}
                            <div className="mb-3 pb-2 border-b border-slate-100">
                                <div className="text-xs font-bold text-blue-600 mb-1">
                                    <FileTextOutlined className="mr-1" />
                                    {doc.documentNumber}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="space-y-2 text-sm">
                                {/* Customer */}
                                <div className="flex items-start gap-2">
                                    <UserOutlined className="text-slate-400 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <span className="font-medium text-slate-700 truncate">
                                            {doc.customerName || doc.customer?.name || 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                {/* Vehicle */}
                                {(doc.vehicle || doc.vehicleInfo) && (
                                    <div className="flex items-start gap-2">
                                        <CarOutlined className="text-slate-400 mt-0.5 flex-shrink-0" />
                                        <span className="text-xs text-slate-600">
                                            {doc.vehicle
                                                ? `${doc.vehicle.year} ${doc.vehicle.make} ${doc.vehicle.model}`
                                                : doc.vehicleInfo}
                                        </span>
                                    </div>
                                )}

                                {/* Service Type & Location */}
                                <div className="flex items-start gap-2">
                                    {doc.serviceType && doc.serviceType.toLowerCase().includes('in-shop') && (
                                        <HomeOutlined className="text-slate-400 mt-0.5 flex-shrink-0" />
                                    )}
                                    {doc.serviceType && doc.serviceType.toLowerCase().includes('mobile') && (
                                        <MobileOutlined className="text-slate-400 mt-0.5 flex-shrink-0" />
                                    )}
                                    {doc.serviceType && doc.serviceType.toLowerCase().includes('delivery') && (
                                        <CarryOutOutlined className="text-slate-400 mt-0.5 flex-shrink-0" />
                                    )}
                                    {(!doc.serviceType || (!doc.serviceType.toLowerCase().includes('in-shop') &&
                                        !doc.serviceType.toLowerCase().includes('mobile') &&
                                        !doc.serviceType.toLowerCase().includes('delivery'))) && (
                                            <HomeOutlined className="text-slate-400 mt-0.5 flex-shrink-0" />
                                        )}
                                    <span className="text-xs text-slate-600">
                                        {doc.serviceType || doc.serviceLocation || 'In-Shop'}
                                    </span>
                                </div>

                                {/* Date & Amount Footer */}
                                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                    <span className="text-xs text-slate-500">
                                        <ClockCircleOutlined className="mr-1" />
                                        {doc.scheduledDate
                                            ? moment(doc.scheduledDate).format('MMM DD, YYYY')
                                            : 'Not Scheduled'}
                                    </span>
                                    <span className="text-xs font-bold text-green-600">
                                        ${(doc.totalAmount || 0).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

// Main Component
const DocumentScheduleView = ({ documents = [], viewMode = 'calendar', onDocumentClick, onConversionSuccess }) => {
    const isMobile = useIsMobile();

    const handleViewDetails = (document) => {
        if (onDocumentClick && document.documentNumber) {
            onDocumentClick(document.documentNumber);
        } else if (document.documentNumber) {
            console.warn("No click handler provided for document:", document.documentNumber);
        }
    };

    // For mobile kanban, show mobile list view
    if (isMobile && viewMode === 'kanban') {
        return <MobileDocumentListView documents={documents} onViewDetails={handleViewDetails} />;
    }
    // For mobile, always show the mobile calendar view when calendar mode is selected
    if (isMobile && viewMode === 'calendar') {
        return <MobileDocumentCalendarView documents={documents} onViewDetails={handleViewDetails} />;
    } else if (viewMode === 'calendar') {
        return <DocumentCalendarView documents={documents} onViewDetails={handleViewDetails} />;
    } else if (viewMode === 'kanban') {
        return <DocumentKanbanView documents={documents} onViewDetails={handleViewDetails} onConversionSuccess={onConversionSuccess} />;
    } else {
        return <DocumentTableView documents={documents} onViewDetails={handleViewDetails} />;
    }
};

export default DocumentScheduleView;
