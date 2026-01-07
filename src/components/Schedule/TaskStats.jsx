import React from 'react';
import { Card, Statistic, Row, Col, Progress } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, SyncOutlined, WarningOutlined } from '@ant-design/icons';

const TaskStats = ({ tasks = [] }) => {
    // Calculate stats
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'COMPLETED').length;
    const pending = tasks.filter(t => t.status === 'PENDING').length;
    const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const overdue = tasks.filter(t => {
        if (t.status === 'COMPLETED') return false;
        return new Date(t.dueDate) < new Date();
    }).length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
        <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} md={6}>
                <Card bordered={false} className="shadow-sm">
                    <Statistic
                        title="Completion Rate"
                        value={completionRate}
                        suffix="%"
                        prefix={<CheckCircleOutlined className="text-green-500" />}
                    />
                    <Progress percent={completionRate} showInfo={false} size="small" status="active" strokeColor="#52c41a" />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card bordered={false} className="shadow-sm">
                    <Statistic
                        title="Pending Tasks"
                        value={pending}
                        prefix={<ClockCircleOutlined className="text-orange-500" />}
                    />
                    <div className="text-xs text-gray-400 mt-2">To be picked up</div>
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card bordered={false} className="shadow-sm">
                    <Statistic
                        title="In Progress"
                        value={inProgress}
                        prefix={<SyncOutlined spin className="text-blue-500" />}
                    />
                    <div className="text-xs text-gray-400 mt-2">Currently active</div>
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card bordered={false} className="shadow-sm">
                    <Statistic
                        title="Overdue"
                        value={overdue}
                        prefix={<WarningOutlined className="text-red-500" />}
                        valueStyle={{ color: overdue > 0 ? '#cf1322' : '#3f8600' }}
                    />
                    <div className="text-xs text-gray-400 mt-2">Late tasks</div>
                </Card>
            </Col>
        </Row>
    );
};

export default TaskStats;
