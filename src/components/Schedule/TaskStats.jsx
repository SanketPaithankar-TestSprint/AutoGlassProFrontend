import React from 'react';
import { Progress } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, SyncOutlined, WarningOutlined } from '@ant-design/icons';

const TaskStats = ({ tasks = [] }) => {
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {/* Completion Rate — Donut */}
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-slate-200/60 flex items-center gap-3">
                <Progress
                    type="circle"
                    percent={completionRate}
                    size={48}
                    strokeColor="#52c41a"
                    trailColor="#f0f0f0"
                    format={pct => <span className="text-[10px] font-bold text-slate-700">{pct}%</span>}
                />
                <div>
                    <div className="text-2xl font-bold text-green-600">{completed}</div>
                    <div className="text-xs text-slate-500 font-medium">Done</div>
                </div>
            </div>

            {/* Pending */}
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-slate-200/60">
                <div className="flex items-center justify-between mb-2">
                    <ClockCircleOutlined className="text-3xl text-orange-400" />
                    <div className="text-2xl font-bold text-orange-500">{pending}</div>
                </div>
                <div className="text-sm text-slate-500 font-medium">Pending</div>
            </div>

            {/* In Progress */}
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-slate-200/60">
                <div className="flex items-center justify-between mb-2">
                    <SyncOutlined
                        spin={inProgress > 0}
                        className="text-3xl text-blue-400"
                    />
                    <div className="text-2xl font-bold text-blue-500">{inProgress}</div>
                </div>
                <div className="text-sm text-slate-500 font-medium">In Progress</div>
            </div>

            {/* Overdue */}
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-slate-200/60">
                <div className="flex items-center justify-between mb-2">
                    <WarningOutlined className="text-3xl text-red-400" />
                    <div className={`text-2xl font-bold ${overdue > 0 ? 'text-red-600' : 'text-slate-400'}`}>{overdue}</div>
                </div>
                <div className="text-sm text-slate-500 font-medium">Overdue</div>
            </div>
        </div>
    );
};

export default TaskStats;
