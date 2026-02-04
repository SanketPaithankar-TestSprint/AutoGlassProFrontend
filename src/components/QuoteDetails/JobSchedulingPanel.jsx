import React from 'react';
import { DatePicker, Input, Select, Card } from 'antd';
import { EnvironmentOutlined, UserOutlined, CalendarOutlined, HomeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const SERVICE_LOCATION_OPTIONS = [
    { value: 'SHOP', label: 'Shop', icon: <HomeOutlined /> },
    { value: 'MOBILE', label: 'Mobile', icon: <EnvironmentOutlined /> },
    { value: 'CUSTOMER_LOCATION', label: 'Customer Location', icon: <EnvironmentOutlined /> }
];

const JobSchedulingPanel = ({
    schedulingData,
    setSchedulingData,
    employees = [],
    loadingEmployees = false
}) => {

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

    // Check if service address is required
    const isServiceAddressRequired = schedulingData.serviceLocation === 'MOBILE' || schedulingData.serviceLocation === 'CUSTOMER_LOCATION';

    return (
        <div className="">
            <Card
                title={
                    <span className="flex items-center gap-2">
                        <CalendarOutlined className="text-violet-500" />
                        Job Scheduling
                    </span>
                }
                className="shadow-sm"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Service Location */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Service Location <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={schedulingData.serviceLocation || 'SHOP'}
                            style={{ width: '100%' }}
                            onChange={(val) => handleChange('serviceLocation', val)}
                            size="large"
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
                            {schedulingData.serviceLocation === 'SHOP' && 'Service will be performed at your shop location.'}
                            {schedulingData.serviceLocation === 'MOBILE' && 'Service will be performed at a mobile location.'}
                            {schedulingData.serviceLocation === 'CUSTOMER_LOCATION' && 'Service will be performed at the customer\'s address.'}
                        </p>
                    </div>

                    {/* Scheduled Date */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Scheduled Date & Time <span className="text-red-500">*</span>
                        </label>
                        <DatePicker
                            value={getDayjsValue(schedulingData.scheduledDate)}
                            onChange={(date) => handleDateChange('scheduledDate', date)}
                            showTime={{ format: 'HH:mm' }}
                            format="YYYY-MM-DD HH:mm"
                            style={{ width: '100%' }}
                            size="large"
                            placeholder="Select date and time"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            When is the job scheduled to start?
                        </p>
                    </div>

                    {/* Employee Assignment */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            <span className="flex items-center gap-1">
                                <UserOutlined />
                                Assigned Technician
                            </span>
                        </label>
                        <Select
                            value={schedulingData.assignedEmployeeId || schedulingData.employeeId}
                            style={{ width: '100%' }}
                            placeholder="Select technician (optional)"
                            allowClear
                            onChange={(val) => {
                                handleChange('assignedEmployeeId', val);
                                handleChange('employeeId', val);
                            }}
                            loading={loadingEmployees}
                            size="large"
                        >
                            {employees.map(emp => (
                                <Option key={emp.employeeId} value={emp.employeeId}>
                                    {emp.firstName} {emp.lastName}
                                </Option>
                            ))}
                        </Select>
                        <p className="text-xs text-slate-500 mt-1">
                            Assign a technician to this job (optional).
                        </p>
                    </div>

                    {/* Service Address - Only shown when required */}
                    {isServiceAddressRequired && (
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                <span className="flex items-center gap-1">
                                    <EnvironmentOutlined />
                                    Service Address <span className="text-red-500">*</span>
                                </span>
                            </label>
                            <TextArea
                                value={schedulingData.serviceAddress || ''}
                                onChange={(e) => handleChange('serviceAddress', e.target.value)}
                                placeholder="Enter the full address where service will be performed (e.g., 123 Main St, Springfield, IL 62701)"
                                rows={3}
                                style={{ width: '100%' }}
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                {schedulingData.serviceLocation === 'MOBILE'
                                    ? 'Required for mobile service - enter the location where the technician will go.'
                                    : 'Required for customer location service - enter the customer\'s address.'}
                            </p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default JobSchedulingPanel;
