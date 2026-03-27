import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Typography, Input, Button, DatePicker, TimePicker, Card, Row, Col, Space, Table, Tag, Modal, Spin, message } from 'antd';
import { PhoneOutlined, CalendarOutlined, ClockCircleOutlined, NumberOutlined, FileTextOutlined, HistoryOutlined, LeftOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { requestPhoneCall, getCallHistory } from '../../api/supportTickets';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

const STATUS_CONFIG = {
    'SCHEDULED': { color: 'blue', label: 'Scheduled' },
    'COMPLETED': { color: 'green', label: 'Completed' },
    'CANCELLED': { color: 'red', label: 'Cancelled' },
    'PENDING':   { color: 'orange', label: 'Pending' }
};

const CallSupportPage = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    // Form state
    const [form, setForm] = useState({
        preferredDate: null,
        preferredTime: null,
        contactNumber: '',
        notes: ''
    });

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const data = await getCallHistory();
            setHistory(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch call history:', error);
            message.error('Failed to load call history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleRequestCall = async () => {
        if (!form.preferredDate || !form.preferredTime || !form.contactNumber) {
            message.warning('Please fill in all required fields');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                preferredDate: form.preferredDate.format('YYYY-MM-DD'),
                preferredTime: form.preferredTime.format('HH:mm'),
                contactNumber: form.contactNumber,
                notes: form.notes
            };
            
            await requestPhoneCall(payload);
            message.success('Call request submitted successfully');
            setModalVisible(false);
            setForm({ preferredDate: null, preferredTime: null, contactNumber: '', notes: '' });
            fetchHistory();
        } catch (error) {
            console.error('Failed to submit call request:', error);
            message.error('Failed to submit call request');
        } finally {
            setSubmitting(false);
        }
    };

    const columns = [
        {
            title: 'Ref ID',
            dataIndex: 'id',
            key: 'id',
            render: (text) => <Text code className="text-xs">{text.substring(0, 8)}</Text>
        },
        {
            title: 'Date',
            dataIndex: 'preferredDate',
            key: 'preferredDate',
            render: (text) => dayjs(text).format('MMM DD, YYYY')
        },
        {
            title: 'Time',
            dataIndex: 'preferredTime',
            key: 'preferredTime',
        },
        {
            title: 'Contact',
            dataIndex: 'contactNumber',
            key: 'contactNumber',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const config = STATUS_CONFIG[status] || { color: 'default', label: status };
                return <Tag color={config.color}>{config.label}</Tag>;
            }
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            responsive: ['md'],
            render: (text) => dayjs(text).format('MMM DD, HH:mm')
        }
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8"
            >
                <div className="flex items-center justify-between mb-4">
                    <Button
                        icon={<LeftOutlined />}
                        onClick={() => navigate('/help')}
                        size="small"
                        className="bg-white hover:bg-blue-50 border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-700 flex-shrink-0"
                    >
                        Back to Help and Support
                    </Button>
                    <div />
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <Title level={1} className="text-4xl font-bold text-gray-800 m-0">
                            Contact Support
                        </Title>
                        <Paragraph className="text-lg text-gray-600 mt-2 mb-0">
                            Schedule a callback or send a message to our support team
                        </Paragraph>
                    </div>
                    <Button 
                        type="primary" 
                        size="large" 
                        icon={<PhoneOutlined />} 
                        onClick={() => setModalVisible(true)}
                        className="bg-blue-600 hover:bg-blue-700 h-12 px-8 text-lg font-bold shadow-lg shadow-blue-200/50"
                    >
                        Request a Call
                    </Button>
                </div>
            </motion.div>

            {/* Call History Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <Card 
                    className="shadow-md border-slate-200"
                    title={
                        <Space>
                            <HistoryOutlined className="text-blue-600" />
                            <span className="font-bold">Call History</span>
                        </Space>
                    }
                >
                    <Table 
                        dataSource={history} 
                        columns={columns} 
                        loading={loading}
                        rowKey="id"
                        pagination={{ pageSize: 5 }}
                        scroll={{ x: true }}
                    />
                </Card>
            </motion.div>

            {/* Request Call Modal */}
            <Modal
                title={
                    <Space size="middle">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <PhoneOutlined className="text-blue-600 text-lg" />
                        </div>
                        <span className="text-xl font-bold">Schedule a Callback</span>
                    </Space>
                }
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={500}
                centered
            >
                <div className="py-2">
                    <Paragraph className="text-gray-500 mb-6">
                        We'll give you a call back during your preferred time slot.
                    </Paragraph>
                    
                    <div className="space-y-4">
                        <div>
                            <Text strong className="block mb-1.5"><CalendarOutlined className="mr-2 text-blue-500" />Preferred Date</Text>
                            <DatePicker 
                                className="w-full h-11" 
                                placeholder="Select date" 
                                value={form.preferredDate}
                                onChange={(val) => setForm({...form, preferredDate: val})}
                                disabledDate={(current) => current && current < dayjs().startOf('day')}
                            />
                        </div>
                        
                        <div>
                            <Text strong className="block mb-1.5"><ClockCircleOutlined className="mr-2 text-blue-500" />Preferred Time</Text>
                            <TimePicker 
                                className="w-full h-11" 
                                format="HH:mm" 
                                placeholder="Select time"
                                value={form.preferredTime}
                                onChange={(val) => setForm({...form, preferredTime: val})}
                            />
                        </div>
                        
                        <div>
                            <Text strong className="block mb-1.5"><NumberOutlined className="mr-2 text-blue-500" />Contact Number</Text>
                            <Input 
                                className="h-11" 
                                placeholder="Your phone number" 
                                prefix={<PhoneOutlined className="text-gray-400" />}
                                value={form.contactNumber}
                                onChange={(e) => setForm({...form, contactNumber: e.target.value})}
                            />
                        </div>
                        
                        <div>
                            <Text strong className="block mb-1.5"><FileTextOutlined className="mr-2 text-blue-500" />Short Message (Optional)</Text>
                            <TextArea 
                                rows={3} 
                                placeholder="What would you like to discuss?"
                                value={form.notes}
                                onChange={(e) => setForm({...form, notes: e.target.value})}
                                className="resize-none"
                            />
                        </div>
                        
                        <div className="pt-4 flex gap-3">
                            <Button 
                                className="flex-1 h-12 font-bold" 
                                onClick={() => setModalVisible(false)}
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="primary" 
                                className="flex-2 h-12 px-10 font-bold bg-blue-600 hover:bg-blue-700"
                                loading={submitting}
                                onClick={handleRequestCall}
                            >
                                Submit Request
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default CallSupportPage;
