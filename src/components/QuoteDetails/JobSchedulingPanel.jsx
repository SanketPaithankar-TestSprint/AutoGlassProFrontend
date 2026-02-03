import React from 'react';
import { DatePicker, Input, Select, Card } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;

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

    return (
        <div className="">
            <Card title="Job Scheduling & Terms" className="shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Scheduled Date */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Scheduled Date
                        </label>
                        <DatePicker
                            showTime={{ format: 'hh:mm A', minuteStep: 30, use12Hours: true }}
                            format="YYYY-MM-DD hh:mm A"
                            className="w-full"
                            value={getDayjsValue(schedulingData.scheduledDate)}
                            onChange={(date) => handleDateChange('scheduledDate', date)}
                            placeholder="Select Date & Time"
                        />
                    </div>

                    {/* Estimated Completion */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Estimated Completion
                        </label>
                        <DatePicker
                            showTime={{ format: 'hh:mm A', minuteStep: 30, use12Hours: true }}
                            format="YYYY-MM-DD hh:mm A"
                            className="w-full"
                            value={getDayjsValue(schedulingData.estimatedCompletion)}
                            onChange={(date) => handleDateChange('estimatedCompletion', date)}
                            placeholder="Select Date & Time"
                        />
                    </div>

                    {/* Due Date */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Due Date
                        </label>
                        <DatePicker
                            className="w-full"
                            value={getDayjsValue(schedulingData.dueDate)}
                            onChange={(date) => handleDateChange('dueDate', date)}
                            placeholder="Select Due Date"
                        />
                    </div>

                    {/* Assigned Employee */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Assigned Employee
                        </label>
                        <Select
                            className="w-full"
                            placeholder="Select Employee"
                            value={schedulingData.assignedEmployeeId}
                            onChange={(val) => handleChange('assignedEmployeeId', val)}
                            loading={loadingEmployees}
                            allowClear
                        >
                            {employees.map(emp => (
                                <Option key={emp.id} value={emp.id}>
                                    {emp.firstName} {emp.lastName}
                                </Option>
                            ))}
                        </Select>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default JobSchedulingPanel;
