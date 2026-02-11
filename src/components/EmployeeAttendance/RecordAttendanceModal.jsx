import React, { useState, useEffect } from 'react';
import { Modal, Form, DatePicker, TimePicker, Select, Input, Button, message } from 'antd';
import dayjs from 'dayjs';
import { recordAttendance } from '../../api/attendance';
import { getValidToken } from '../../api/getValidToken';

const { Option } = Select;
const { TextArea } = Input;

const RecordAttendanceModal = ({ visible, onClose, employees, currentUser, onSuccess, preSelectedEmployee, isShopOwner }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const token = getValidToken();

    useEffect(() => {
        if (visible) {
            form.resetFields();
            // Pre-fill defaults
            // If preSelectedEmployee is null (e.g. generic add), and isShopOwner, maybe don't default to currentUser?
            // Or default to currentUser is fine, provided they can change it.
            // If we want it blank for Shop Owner generic add:
            // const defaultEmployeeId = preSelectedEmployee ? preSelectedEmployee.id : (isShopOwner ? null : currentUser?.id);
            // But user might want to record for themselves often. Let's keep existing logic but allow clearing.
            const defaultEmployeeId = preSelectedEmployee ? preSelectedEmployee.id : (currentUser?.id);

            form.setFieldsValue({
                employeeId: defaultEmployeeId,
                date: dayjs(),
                clockInTime: dayjs(),
                status: 'ON_TIME'
            });
        }
    }, [visible, preSelectedEmployee, currentUser, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const payload = {
                employeeId: values.employeeId,
                date: values.date.format('YYYY-MM-DD'),
                clockInTime: values.clockInTime.toISOString(),
                clockOutTime: values.clockOutTime ? values.clockOutTime.toISOString() : null,
                status: values.status,
                notes: values.notes
            };

            await recordAttendance(token, payload);
            message.success("Attendance recorded successfully");
            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            message.error(error.message || "Failed to record attendance");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Record Attendance"
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Cancel
                </Button>,
                <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
                    Submit
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical">
                {isShopOwner && employees && employees.length > 0 ? (
                    <Form.Item
                        name="employeeId"
                        label="Employee"
                        rules={[{ required: true, message: 'Please select an employee' }]}
                    >
                        <Select
                            showSearch
                            optionFilterProp="children"
                            placeholder="Select an employee"
                        >
                            {employees.map(emp => (
                                <Option key={emp.id} value={emp.id}>
                                    {emp.firstName} {emp.lastName}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                ) : (
                    // For regular employees or if passed as hidden, we still need the ID in form state
                    <div className="mb-4">
                        <span className="text-gray-500 font-medium">Employee: </span>
                        <span className="font-bold">
                            {preSelectedEmployee ? `${preSelectedEmployee.firstName} ${preSelectedEmployee.lastName}` : (currentUser?.firstName || 'Me')}
                        </span>
                        <Form.Item name="employeeId" hidden>
                            <Input />
                        </Form.Item>
                    </div>
                )}

                <Form.Item
                    name="date"
                    label="Date"
                    rules={[{ required: true, message: 'Please select a date' }]}
                >
                    <DatePicker className="w-full" />
                </Form.Item>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        name="clockInTime"
                        label="Clock In Time"
                        rules={[{ required: true, message: 'Please select clock in time' }]}
                    >
                        <TimePicker className="w-full" use12Hours format="h:mm a" />
                    </Form.Item>

                    <Form.Item
                        name="clockOutTime"
                        label="Clock Out Time"
                    >
                        <TimePicker className="w-full" use12Hours format="h:mm a" />
                    </Form.Item>
                </div>

                <Form.Item name="status" label="Status" initialValue="ON_TIME">
                    <Select>
                        <Option value="ON_TIME">On Time</Option>
                        <Option value="LATE">Late</Option>
                        <Option value="ABSENT">Absent</Option>
                        <Option value="LEFT_EARLY">Left Early</Option>
                        <Option value="HALF_DAY">Half Day</Option>
                    </Select>
                </Form.Item>

                <Form.Item name="notes" label="Notes">
                    <TextArea rows={3} placeholder="Optional notes" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default RecordAttendanceModal;
