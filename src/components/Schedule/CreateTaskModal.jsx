import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
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
            message.success(t('schedule.assignedSuccessfully'));
            queryClient.invalidateQueries(['employeeTasks']);
            form.resetFields();
            onClose();
        },
        onError: (error) => {
            message.error(t('schedule.failedAssign') + `: ${error.message}`);
        }
    });

    // Update Task Mutation
    const updateTaskMutation = useMutation({
        mutationFn: (values) => updateTask(task.id, values),
        onSuccess: () => {
            message.success(t('schedule.updatedSuccessfully'));
            queryClient.invalidateQueries(['employeeTasks']);
            onClose();
        },
        onError: (error) => {
            message.error(t('schedule.failedUpdate') + `: ${error.message}`);
        }
    });

    // Delete Task Mutation
    const deleteTaskMutation = useMutation({
        mutationFn: () => deleteTask(task.id),
        onSuccess: () => {
            message.success(t('schedule.deletedSuccessfully'));
            queryClient.invalidateQueries(['employeeTasks']);
            onClose();
        },
        onError: (error) => {
            message.error(t('schedule.failedDelete') + `: ${error.message}`);
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
            title: t('schedule.deleteTaskConfirmTitle'),
            content: t('schedule.deleteTaskConfirmContent'),
            okText: t('schedule.delete'),
            okType: 'danger',
            cancelText: t('schedule.cancel'),
            onOk: () => deleteTaskMutation.mutate()
        });
    };

    return (
        <Modal
            title={<span className="text-violet-600 font-bold">{isEditMode ? t('schedule.editTask') : t('schedule.newTaskAssignment')}</span>}
            open={visible}
            onCancel={onClose}
            onOk={handleCreate}
            confirmLoading={createTaskMutation.isPending || updateTaskMutation.isPending}
            width={600}
            okText={isEditMode ? t('schedule.updateTask') : t('schedule.assignTask')}
            cancelText={t('schedule.cancel')}
            okButtonProps={{ className: 'bg-violet-600 hover:bg-violet-700' }}
            footer={
                <div className="flex items-center gap-3 w-full">
                    <Button key="back" onClick={onClose} className="flex-1">
                        {t('schedule.cancel')}
                    </Button>
                    {isEditMode && (
                        <Button
                            key="delete"
                            danger
                            onClick={handleDelete}
                            loading={deleteTaskMutation.isPending}
                            className="flex-1"
                        >
                            {t('schedule.delete')}
                        </Button>
                    )}
                    <Button
                        key="submit"
                        type="primary"
                        className='flex-1 bg-violet-600 hover:bg-violet-700'
                        loading={createTaskMutation.isPending || updateTaskMutation.isPending}
                        onClick={handleCreate}
                    >
                        {isEditMode ? t('schedule.updateTask') : t('schedule.assignTask')}
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
                        label={t('schedule.serviceDocument')}
                        rules={[{ required: true, message: t('schedule.pleaseSelectDoc') }]}
                    >
                        <Select
                            showSearch
                            placeholder={t('schedule.selectDocument')}
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
                                            <Spin size="small" /> {t('schedule.loadingMore')}
                                        </div>
                                    )}
                                </>
                            )}
                        >
                            {documents.map(doc => (
                                <Option key={doc.id} value={doc.documentNumber}>
                                    {doc.documentNumber} - {doc.customerName || t('schedule.unknownCustomer')}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="employeeId"
                        label={t('schedule.assignTo')}
                        rules={[{ required: true, message: t('schedule.pleaseSelectEmployee') }]}
                    >
                        <Select
                            showSearch
                            placeholder={t('schedule.selectEmployee')}
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
                        label={t('schedule.assignmentDate')}
                        rules={[{ required: true, message: t('schedule.pleaseSelectAssignmentDate') }]}
                    >
                        <DatePicker showTime format="YYYY-MM-DD HH:mm" className="w-full" />
                    </Form.Item>

                    <Form.Item
                        name="dueDate"
                        label={t('schedule.dueDate')}
                        rules={[{ required: true, message: t('schedule.pleaseSelectDueDate') }]}
                    >
                        <DatePicker showTime format="YYYY-MM-DD HH:mm" className="w-full" />
                    </Form.Item>

                    <Form.Item
                        name="priority"
                        label={t('schedule.priority')}
                        rules={[{ required: true, message: t('schedule.pleaseSelectPriority') }]}
                    >
                        <Select>
                            <Option value="LOW">{t('schedule.low')}</Option>
                            <Option value="MEDIUM">{t('schedule.medium')}</Option>
                            <Option value="HIGH">{t('schedule.high')}</Option>
                            <Option value="URGENT">{t('schedule.urgent')}</Option>
                        </Select>
                    </Form.Item>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item
                        name="estimatedDurationMinutes"
                        label={t('schedule.estDuration')}
                        rules={[{ required: true, message: t('schedule.pleaseEnterDuration') }]}
                    >
                        <InputNumber min={0} className="w-full" />
                    </Form.Item>
                </div>

                <Form.Item
                    name="taskDescription"
                    label={t('schedule.taskDescriptionLabel')}
                    rules={[{ required: true, message: t('schedule.pleaseEnterDescription') }]}
                >
                    <TextArea
                        placeholder={t('schedule.taskDescriptionPlaceholder')}
                        autoSize={{ minRows: 2, maxRows: 8 }}
                    />
                </Form.Item>

                <Form.Item
                    name="notes"
                    label={t('schedule.notes')}
                >
                    <TextArea rows={4} placeholder={t('schedule.notesPlaceholder')} />
                </Form.Item>

            </Form>
        </Modal>
    );
};

export default CreateTaskModal;
