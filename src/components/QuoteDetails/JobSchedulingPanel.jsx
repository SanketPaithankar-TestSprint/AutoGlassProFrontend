import React from 'react';
import { Input, Select, Card } from 'antd';
import { EnvironmentOutlined, UserOutlined, CalendarOutlined, HomeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import DatePickerHelper from './DatePickerHelper';

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
                        Appointment
                    </span>
                }
                className="shadow-sm"
            >
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Service Location */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Service Location <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={schedulingData.serviceLocation || 'SHOP'}
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
                            placeholder="Select technician"
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
                            placeholder={isServiceAddressRequired ? "Enter address..." : "Not required for Shop"}
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
