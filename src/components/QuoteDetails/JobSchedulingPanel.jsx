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
                            showTime
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
                            showTime
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

                    {/* Payment Terms */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Payment Terms
                        </label>
                        <Select
                            className="w-full"
                            value={schedulingData.paymentTerms}
                            onChange={(val) => handleChange('paymentTerms', val)}
                            placeholder="Select Terms"
                        >
                            <Option value="Due upon receipt">Due upon receipt</Option>
                            <Option value="Net 15">Net 15</Option>
                            <Option value="Net 30">Net 30</Option>
                            <Option value="Net 45">Net 45</Option>
                            <Option value="Net 60">Net 60</Option>
                            <Option value="Custom">Custom</Option>
                        </Select>
                        {schedulingData.paymentTerms === 'Custom' && (
                            <Input
                                className="mt-2"
                                placeholder="Enter custom terms"
                                value={schedulingData.customPaymentTerms || ''} // Handle custom logic if needed, or just let users type in Select if supported? 
                            // Antd Select with mode="tags" or combobox allows custom, but simple Select doesn't.
                            // For simplicity, let's keep it simple or switch to Input if they really need custom.
                            // If "Custom", we might want a separate input to override?
                            // Let's just assume they select one of these or we add an Input if user asks.
                            // Actually, let's make the Select editable?
                            // mode="tags" allows creation.
                            />
                        )}
                        {/* Correction: Allow generic input by using an Input if "Custom" is complicated, 
                           OR just use an AutoComplete/Select with search. 
                           Let's stick to the requested plan: "Input or Select". 
                           Let's make it a Select with predefined + Input fallback? 
                           Or just an Input with AutoComplete? 
                           Let's use an Editable Select (Antd Select with showSearch and creating options is complex).
                           Simple solution: Input with list? 
                           Let's just use an AutoComplete or Select with `showSearch` and `onSearch`?
                           Actually, plan said "Input or Select".
                           Let's use a Select for now as per code above.
                        */}
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
