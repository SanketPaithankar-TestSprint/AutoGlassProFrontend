import React from 'react';
import { Input, Select, Card } from 'antd';
import { EnvironmentOutlined, UserOutlined, CalendarOutlined, HomeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import DatePickerHelper from './DatePickerHelper';
import { updateServiceDocumentStatus } from '../../api/updateServiceDocumentStatus';
import { App } from 'antd';

const { Option } = Select;
const { TextArea } = Input;

const SERVICE_LOCATION_OPTIONS = [
    { value: 'IN_SHOP', label: 'In Shop', icon: <HomeOutlined /> },
    { value: 'MOBILE', label: 'Mobile', icon: <EnvironmentOutlined /> }
];

const STATUS_OPTIONS = [
    { value: 'DRAFT', label: 'Draft', color: 'default' },
    { value: 'SENT', label: 'Sent', color: 'blue' },
    { value: 'VIEWED', label: 'Viewed', color: 'cyan' },
    { value: 'ACCEPTED', label: 'Accepted', color: 'green' },
    { value: 'REJECTED', label: 'Rejected', color: 'red' },
    { value: 'EXPIRED', label: 'Expired', color: 'orange' },
    { value: 'COMPLETED', label: 'Completed', color: 'purple' },
    { value: 'IN_PROGRESS', label: 'In Progress', color: 'processing' }
];

const JobSchedulingPanel = ({
    schedulingData,
    setSchedulingData,
    employees = [],
    loadingEmployees = false,
    status = null,
    documentNumber = null,
    onStatusChange = () => { }
}) => {
    const { message } = App.useApp();

    // Helper to handle date changes
    const handleDateChange = (field, date) => {
        setSchedulingData(prev => ({
            ...prev,
            [field]: date ? date.toISOString() : null
        }));
    };

    // Helper to handle input/select changes
    const handleChange = (field, value) => {
        setSchedulingData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Helper to convert ISO string to dayjs object for Antd DatePicker
    const getDayjsValue = (isoString) => {
        return isoString ? dayjs(isoString) : null;
    };

    // Handle status change
    const handleStatusChange = async (newStatus) => {
        if (!documentNumber) return;

        try {
            await updateServiceDocumentStatus(documentNumber, newStatus);
            onStatusChange(newStatus);
            message.success(`Status updated to ${newStatus}`);
        } catch (error) {
            console.error("Failed to update status", error);
            message.error("Failed to update status");
        }
    };

    // Check if service address is required
    const isServiceAddressRequired = schedulingData.serviceLocation === 'MOBILE' || schedulingData.serviceLocation === 'CUSTOMER_LOCATION';

    return (
        <div className="">
            <Card
                title={
                    <span className="flex items-center gap-2">
                        <CalendarOutlined className="text-violet-500" />
                        Appointment
                    </span>
                }
                className="shadow-sm"
            >
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Status Dropdown - Only visible if documentNumber exists */}
                    {documentNumber && status && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                <span className="flex items-center gap-1">
                                    <CheckCircleOutlined />
                                    Service Document Status
                                </span>
                            </label>
                            <Select
                                value={status}
                                style={{ width: '100%' }}
                                onChange={handleStatusChange}
                            >
                                {STATUS_OPTIONS.map(option => (
                                    <Option key={option.value} value={option.value}>
                                        <span className={`flex items-center gap-2`}>
                                            {option.label}
                                        </span>
                                    </Option>
                                ))}
                            </Select>
                            <p className="text-xs text-slate-500 mt-1">
                                update status
                            </p>
                        </div>
                    )}

                    {/* Service Location */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Service Location <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={schedulingData.serviceLocation || 'IN_SHOP'}
                            style={{ width: '100%' }}
                            onChange={(val) => handleChange('serviceLocation', val)}
                        >
                            {SERVICE_LOCATION_OPTIONS.map(option => (
                                <Option key={option.value} value={option.value}>
                                    <span className="flex items-center gap-2">
                                        {option.icon}
                                        {option.label}
                                    </span>
                                </Option>
                            ))}
                        </Select>
                        <p className="text-xs text-slate-500 mt-1">
                            Location type
                        </p>
                    </div>

                    {/* Scheduled Date */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Scheduled Date & Time <span className="text-red-500">*</span>
                        </label>
                        <DatePickerHelper
                            value={getDayjsValue(schedulingData.scheduledDate)}
                            onChange={(date) => handleDateChange('scheduledDate', date)}
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            Job start time
                        </p>
                    </div>

                    {/* Employee Assignment */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            <span className="flex items-center gap-1">
                                <UserOutlined />
                                Assigned Technician
                            </span>
                        </label>
                        <Select
                            value={schedulingData.assignedEmployeeId || schedulingData.employeeId}
                            style={{ width: '100%' }}
                            allowClear
                            onChange={(val) => {
                                handleChange('assignedEmployeeId', val);
                                handleChange('employeeId', val);
                            }}
                            loading={loadingEmployees}
                        >
                            {employees.map(emp => (
                                <Option key={emp.employeeId} value={emp.employeeId}>
                                    {emp.firstName} {emp.lastName}
                                </Option>
                            ))}
                        </Select>
                        <p className="text-xs text-slate-500 mt-1">
                            Optional assignment
                        </p>
                    </div>

                    {/* Service Address - Always shown, disabled if not required */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            <span className="flex items-center gap-1">
                                <EnvironmentOutlined />
                                Service Address {isServiceAddressRequired && <span className="text-red-500">*</span>}
                            </span>
                        </label>
                        <TextArea
                            value={schedulingData.serviceAddress || ''}
                            onChange={(e) => handleChange('serviceAddress', e.target.value)}
                            rows={1}
                            style={{ width: '100%', resize: 'none' }}
                            disabled={!isServiceAddressRequired}
                            className={!isServiceAddressRequired ? 'bg-slate-50' : ''}
                        />
                        <p className="text-xs text-slate-500 mt-1 text-nowrap overflow-hidden text-ellipsis">
                            {isServiceAddressRequired
                                ? 'Address for service'
                                : 'Default: Shop Location'}
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default JobSchedulingPanel;
