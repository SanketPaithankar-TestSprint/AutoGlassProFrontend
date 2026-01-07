import React, { useState } from 'react';
import { Modal, Form, Select, Input, DatePicker, InputNumber, Button, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { getEmployees } from '../../api/getEmployees';
import { getServiceDocuments } from '../../api/getServiceDocuments';
import { assignTask } from '../../api/assignTask';
import { getValidToken } from '../../api/getValidToken';

const { Option } = Select;
const { TextArea } = Input;

const CreateTaskModal = ({ visible, onClose }) => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const [token, setToken] = useState(getValidToken());

    // Fetch Employees
    const { data: employees = [] } = useQuery({
        queryKey: ['employees'],
        queryFn: async () => {
            const t = getValidToken();
            return getEmployees(t);
        },
        enabled: visible
    });

    // Fetch Service Documents
    const { data: documentsData } = useQuery({
        queryKey: ['serviceDocuments', 'list'],
        queryFn: async () => {
            const t = getValidToken();
            const res = await getServiceDocuments(t, 0, 100); // Fetch up to 100 (ideally would have a search endpoint)
            return res.content || res;
        },
        enabled: visible
    });

    const documents = Array.isArray(documentsData) ? documentsData : [];

    // Create Task Mutation
    const createTaskMutation = useMutation({
        mutationFn: (values) => assignTask(values),
        onSuccess: () => {
            message.success('Task assigned successfully');
            queryClient.invalidateQueries(['employeeTasks']);
            form.resetFields();
            onClose();
        },
        onError: (error) => {
            message.error(`Failed to assign task: ${error.message}`);
        }
    });

    const handleCreate = async () => {
        try {
            const values = await form.validateFields();

            // Format payload to match endpoint requirements
            const payload = {
                documentNumber: values.documentNumber,
                employeeId: values.employeeId,
                dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DDTHH:mm:ss') + '+00:00' : null, // Handle timezone if needed
                taskDescription: values.taskDescription,
                priority: values.priority,
                estimatedDurationMinutes: values.estimatedDurationMinutes,
                notes: values.notes
            };

            createTaskMutation.mutate(payload);
        } catch (error) {
            console.error("Validation failed:", error);
        }
    };

    return (
        <Modal
            title={<span className="text-violet-600 font-bold">New Task Assignment</span>}
            open={visible}
            onCancel={onClose}
            onOk={handleCreate}
            confirmLoading={createTaskMutation.isPending}
            width={600}
            okText="Assign Task"
            cancelText="Cancel"
            okButtonProps={{ className: 'bg-violet-600 hover:bg-violet-700' }}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    priority: 'MEDIUM',
                    estimatedDurationMinutes: 60,
                    dueDate: dayjs().add(1, 'day').hour(12).minute(0)
                }}
            >
                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        name="documentNumber"
                        label="Service Document"
                        rules={[{ required: true, message: 'Please select a document' }]}
                    >
                        <Select
                            showSearch
                            placeholder="Select Document"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {documents.map(doc => (
                                <Option key={doc.id} value={doc.documentNumber}>
                                    {doc.documentNumber} - {doc.customerName || 'Unknown Customer'}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="employeeId"
                        label="Assign To"
                        rules={[{ required: true, message: 'Please select an employee' }]}
                    >
                        <Select placeholder="Select Employee">
                            {employees.map(emp => (
                                <Option key={emp.id} value={emp.id}>
                                    {emp.firstName} {emp.lastName}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        name="dueDate"
                        label="Due Date"
                        rules={[{ required: true, message: 'Please select a due date' }]}
                    >
                        <DatePicker showTime format="YYYY-MM-DD HH:mm" className="w-full" />
                    </Form.Item>

                    <Form.Item
                        name="priority"
                        label="Priority"
                        rules={[{ required: true, message: 'Please select priority' }]}
                    >
                        <Select>
                            <Option value="LOW">Low</Option>
                            <Option value="MEDIUM">Medium</Option>
                            <Option value="HIGH">High</Option>
                            <Option value="URGENT">Urgent</Option>
                        </Select>
                    </Form.Item>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        name="estimatedDurationMinutes"
                        label="Est. Duration (mins)"
                        rules={[{ required: true, message: 'Please enter duration' }]}
                    >
                        <InputNumber min={0} className="w-full" />
                    </Form.Item>
                </div>

                <Form.Item
                    name="taskDescription"
                    label="Task Description"
                    rules={[{ required: true, message: 'Please enter task description' }]}
                >
                    <Input placeholder="e.g. Replace windshield on customer vehicle" />
                </Form.Item>

                <Form.Item
                    name="notes"
                    label="Notes"
                >
                    <TextArea rows={4} placeholder="Additional instructions..." />
                </Form.Item>

            </Form>
        </Modal>
    );
};

export default CreateTaskModal;
