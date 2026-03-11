import React from 'react';
import { Input, Select, Card, Button, InputNumber, Space } from 'antd';
import { EnvironmentOutlined, UserOutlined, CalendarOutlined, HomeOutlined, CheckCircleOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import DatePickerHelper from './DatePickerHelper';
import { updateServiceDocumentStatus } from '../../api/updateServiceDocumentStatus';
import { App } from 'antd';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();

    // Helper to handle date changes
    const handleDateChange = (field, date) => {
        setSchedulingData(prev => ({
            ...prev,
            [field]: date ? date.toISOString() : null
        }));
    };

    // Helper to handle time changes
    const handleTimeChange = (field, value) => {
        if (!schedulingData.scheduledDate) return;

        const currentDate = dayjs(schedulingData.scheduledDate);
        let newDate = currentDate;

        if (field === 'hour') {
            newDate = newDate.hour(value);
        } else if (field === 'minute') {
            newDate = newDate.minute(value);
        } else if (field === 'ampm') {
            const hour = currentDate.hour();
            if (value === 'PM' && hour < 12) {
                newDate = newDate.hour(hour + 12);
            } else if (value === 'AM' && hour >= 12) {
                newDate = newDate.hour(hour - 12);
            }
        }

        setSchedulingData(prev => ({
            ...prev,
            scheduledDate: newDate.toISOString()
        }));
    };

    // Helper to increment/decrement values
    const incrementTime = (field) => {
        if (!schedulingData.scheduledDate) return;

        const currentDate = dayjs(schedulingData.scheduledDate);
        let newDate = currentDate;

        if (field === 'hour') {
            newDate = newDate.add(1, 'hour');
        } else if (field === 'minute') {
            newDate = newDate.add(15, 'minute');
        }

        setSchedulingData(prev => ({
            ...prev,
            scheduledDate: newDate.toISOString()
        }));
    };

    const decrementTime = (field) => {
        if (!schedulingData.scheduledDate) return;

        const currentDate = dayjs(schedulingData.scheduledDate);
        let newDate = currentDate;

        if (field === 'hour') {
            newDate = newDate.subtract(1, 'hour');
        } else if (field === 'minute') {
            newDate = newDate.subtract(15, 'minute');
        }

        setSchedulingData(prev => ({
            ...prev,
            scheduledDate: newDate.toISOString()
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
            message.success(t('quoteDetails.jobScheduling.statusUpdatedTo', { status: t(`quoteDetails.jobScheduling.status.${newStatus}`) }));
        } catch (error) {
            console.error("Failed to update status", error);
            message.error(t('quoteDetails.jobScheduling.failedToUpdateStatus'));
        }
    };

    // Check if service address is required
    const isServiceAddressRequired = schedulingData.serviceLocation === 'MOBILE' || schedulingData.serviceLocation === 'CUSTOMER_LOCATION';

    return (
        <div className="w-full">
            <Card
                title={
                    <span className="flex items-center gap-2 text-xs !font-semibold text-slate-800 uppercase tracking-wide">
                        <CalendarOutlined className="text-violet-500" />
                        {t('quoteDetails.jobScheduling.appointment')}
                    </span>
                }
                className="shadow-sm"
                styles={{ body: { overflow: 'auto', padding: '1.25rem' } }}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pr-2">
                    {/* Status Dropdown - Only visible if documentNumber exists */}
                    {documentNumber && status && (
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                                <span className="flex items-center gap-1">
                                    <CheckCircleOutlined />
                                    <span className="hidden sm:inline">{t('quoteDetails.jobScheduling.serviceDocumentStatus')}</span>
                                    <span className="sm:hidden">{t('quoteDetails.jobScheduling.statusShort')}</span>
                                </span>
                            </label>
                            <Select
                                value={status}
                                style={{ width: '100%' }}
                                onChange={handleStatusChange}
                                size="small"
                            >
                                {STATUS_OPTIONS.map(option => (
                                    <Option key={option.value} value={option.value}>
                                        <span className={`flex items-center gap-2`}>
                                            {t(`quoteDetails.jobScheduling.status.${option.value}`)}
                                        </span>
                                    </Option>
                                ))}
                            </Select>
                            <p className="text-xs text-slate-500 mt-1">
                                {t('quoteDetails.jobScheduling.updateStatus')}
                            </p>
                        </div>
                    )}


                    {/* Scheduled Date */}
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                            {t('quoteDetails.jobScheduling.scheduledDateTime')} <span className="text-red-500">*</span>
                        </label>
                        <DatePickerHelper
                            value={getDayjsValue(schedulingData.scheduledDate)}
                            onChange={(date) => handleDateChange('scheduledDate', date)}
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            {t('quoteDetails.jobScheduling.jobStartDateTime')}
                        </p>
                    </div>

                    {/* Employee Assignment */}
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                            <span className="flex items-center gap-1">
                                <UserOutlined />
                                <span className="hidden sm:inline">{t('quoteDetails.jobScheduling.assignedTechnician')}</span>
                                <span className="sm:hidden">{t('quoteDetails.jobScheduling.technicianShort')}</span>
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
                            size="small"
                        >
                            {employees.map(emp => (
                                <Option key={emp.employeeId} value={emp.employeeId}>
                                    {emp.firstName} {emp.lastName}
                                </Option>
                            ))}
                        </Select>
                        <p className="text-xs text-slate-500 mt-1">
                            {t('quoteDetails.jobScheduling.optionalAssignment')}
                        </p>
                    </div>

                    {/* Service Address - Always shown, disabled if not required */}
                    <div>
                        <label className="block text-xs sm:text-sm font-medium text-slate-700 mb-1">
                            <span className="flex items-center gap-1">
                                <EnvironmentOutlined />
                                <span className="hidden sm:inline">{t('quoteDetails.jobScheduling.serviceAddress')}</span>
                                <span className="sm:hidden">{t('quoteDetails.jobScheduling.addressShort')}</span>
                                {isServiceAddressRequired && <span className="text-red-500">*</span>}
                            </span>
                        </label>
                        <TextArea
                            value={schedulingData.serviceAddress || ''}
                            onChange={(e) => handleChange('serviceAddress', e.target.value)}
                            rows={1}
                            style={{ width: '100%', resize: 'none', fontSize: '0.875rem' }}
                            disabled={!isServiceAddressRequired}
                            className={!isServiceAddressRequired ? 'bg-slate-50' : ''}
                            size="small"
                        />
                        <p className="text-xs text-slate-500 mt-1 break-words">
                            {isServiceAddressRequired
                                ? t('quoteDetails.jobScheduling.addressForService')
                                : t('quoteDetails.jobScheduling.defaultShopLocation')}
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default JobSchedulingPanel;
