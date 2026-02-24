import React, { useState } from 'react';
import { Modal, Form, Select, Input, DatePicker, InputNumber, Button, message } from 'antd';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Spin } from 'antd';

import { getEmployees } from '../../api/getEmployees';
import { getServiceDocuments } from '../../api/getServiceDocuments';
import { assignTask } from '../../api/assignTask';
import { updateTask } from '../../api/updateTask';
import { deleteTask } from '../../api/deleteTask';
import { getValidToken } from '../../api/getValidToken';

const { Option } = Select;
const { TextArea } = Input;



const CreateTaskModal = ({ visible, onClose, task = null }) => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const [token, setToken] = useState(getValidToken());
    const isEditMode = !!task;

    // Populate form when task changes
    React.useEffect(() => {
        if (visible && task) {
            form.setFieldsValue({
                documentNumber: task.documentNumber,
                employeeId: task.employeeId,
                dueDate: task.dueDate ? dayjs(task.dueDate) : null,
                assignmentDate: task.assignmentDate ? dayjs(task.assignmentDate) : null,
                taskDescription: task.taskDescription || task.taskName, // taskName map to description just in case
                priority: task.priority,
                estimatedDurationMinutes: task.estimatedDurationMinutes,
                notes: task.notes
            });
        } else if (visible && !task) {
            form.resetFields();
            form.setFieldsValue({
                priority: 'MEDIUM',
                estimatedDurationMinutes: 60,
                dueDate: dayjs().add(1, 'day').hour(12).minute(0),
                assignmentDate: dayjs()
            });
        }
    }, [visible, task, form]);

    // Fetch Employees
    const { data: employees = [] } = useQuery({
        queryKey: ['employees'],
        queryFn: async () => {
            const t = getValidToken();
            const res = await getEmployees(t);
            console.log('Employees Data:', res);
            return res;
        },
        enabled: visible
    });

    // Fetch Service Documents (Infinite Query)
    const {
        data: documentsData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ['serviceDocuments', 'infinite'],
        queryFn: async ({ pageParam = 0 }) => {
            const t = getValidToken();
            const res = await getServiceDocuments(t, pageParam, 20); // Batch size 20
            return res;
        },
        getNextPageParam: (lastPage, allPages) => {
            const totalElements = lastPage.totalElements || 0;
            const loadedElements = allPages.flatMap(p => p.content || []).length;
            if (loadedElements < totalElements) {
                return allPages.length; // Next page index
            }
            return undefined;
        },
        enabled: visible
    });

    const documents = documentsData ? documentsData.pages.flatMap(page => page.content || []) : [];

    const handlePopupScroll = (e) => {
        const { target } = e;
        if (
            target.scrollTop + target.offsetHeight === target.scrollHeight &&
            hasNextPage &&
            !isFetchingNextPage
        ) {
            fetchNextPage();
        }
    };

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

    // Update Task Mutation
    const updateTaskMutation = useMutation({
        mutationFn: (values) => updateTask(task.id, values),
        onSuccess: () => {
            message.success('Task updated successfully');
            queryClient.invalidateQueries(['employeeTasks']);
            onClose();
        },
        onError: (error) => {
            message.error(`Failed to update task: ${error.message}`);
        }
    });

    // Delete Task Mutation
    const deleteTaskMutation = useMutation({
        mutationFn: () => deleteTask(task.id),
        onSuccess: () => {
            message.success('Task deleted successfully');
            queryClient.invalidateQueries(['employeeTasks']);
            onClose();
        },
        onError: (error) => {
            message.error(`Failed to delete task: ${error.message}`);
        }
    });

    const handleCreate = async () => {
        try {
            const values = await form.validateFields();

            // Format payload to match endpoint requirements
            const payload = {
                documentNumber: values.documentNumber,
                employeeId: values.employeeId,
                dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DDTHH:mm:ssZ') : null,
                taskDescription: values.taskDescription,
                priority: values.priority,
                estimatedDurationMinutes: values.estimatedDurationMinutes,
                notes: values.notes,
                assignmentDate: values.assignmentDate ? values.assignmentDate.format('YYYY-MM-DDTHH:mm:ssZ') : null
            };

            if (isEditMode) {
                updateTaskMutation.mutate(payload);
            } else {
                createTaskMutation.mutate(payload);
            }
        } catch (error) {
            console.error("Validation failed:", error);
        }
    };

    const handleDelete = () => {
        Modal.confirm({
            title: 'Delete Task',
            content: 'Are you sure you want to delete this task? This action cannot be undone.',
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: () => deleteTaskMutation.mutate()
        });
    };

    return (
        <Modal
            title={<span className="text-violet-600 font-bold">{isEditMode ? 'Edit Task' : 'New Task Assignment'}</span>}
            open={visible}
            onCancel={onClose}
            onOk={handleCreate}
            confirmLoading={createTaskMutation.isPending || updateTaskMutation.isPending}
            width={600}
            okText={isEditMode ? 'Update Task' : 'Assign Task'}
            cancelText="Cancel"
            okButtonProps={{ className: 'bg-violet-600 hover:bg-violet-700' }}
            footer={
                <div className="flex items-center gap-3 w-full">
                    <Button key="back" onClick={onClose} className="flex-1">
                        Cancel
                    </Button>
                    {isEditMode && (
                        <Button
                            key="delete"
                            danger
                            onClick={handleDelete}
                            loading={deleteTaskMutation.isPending}
                            className="flex-1"
                        >
                            Delete
                        </Button>
                    )}
                    <Button
                        key="submit"
                        type="primary"
                        className='flex-1 bg-violet-600 hover:bg-violet-700'
                        loading={createTaskMutation.isPending || updateTaskMutation.isPending}
                        onClick={handleCreate}
                    >
                        {isEditMode ? 'Update Task' : 'Assign Task'}
                    </Button>
                </div>
            }
        >
            <Form
                form={form}
                layout="vertical"
            // Initial values are handled by useEffect
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            onPopupScroll={handlePopupScroll}
                            dropdownRender={(menu) => (
                                <>
                                    {menu}
                                    {isFetchingNextPage && (
                                        <div className="p-2 flex justify-center text-slate-500">
                                            <Spin size="small" /> Loading more...
                                        </div>
                                    )}
                                </>
                            )}
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
                        <Select
                            showSearch
                            placeholder="Select Employee"
                            optionFilterProp="label"
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={(Array.isArray(employees) ? employees : (employees.content || [])).map(emp => ({
                                label: `${emp.firstName} ${emp.lastName}`,
                                value: emp.id ?? emp.userId
                            }))}
                        />
                    </Form.Item>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item
                        name="assignmentDate"
                        label="Assignment Date"
                        rules={[{ required: true, message: 'Please select assignment date' }]}
                    >
                        <DatePicker showTime format="YYYY-MM-DD HH:mm" className="w-full" />
                    </Form.Item>

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <TextArea
                        placeholder="e.g. Replace windshield on customer vehicle"
                        autoSize={{ minRows: 2, maxRows: 8 }}
                    />
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
