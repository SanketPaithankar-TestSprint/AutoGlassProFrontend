import React, { useState, useEffect } from "react";
import { Tabs } from "antd";
import {
    CalendarOutlined, TeamOutlined
} from "@ant-design/icons";
import { getValidToken } from "../../api/getValidToken";
import EmployeeManagement from "./EmployeeManagement";
import AttendanceView from "./AttendanceView";

const EmployeeAttendance = () => {
    const token = getValidToken();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [activeTab, setActiveTab] = useState('employees');

    useEffect(() => {
        document.title = "APAI | Employee Attendance";
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const items = [
        {
            key: 'employees',
            label: (
                <span className="flex items-center gap-2">
                    <TeamOutlined />
                    Manage Employees
                </span>
            ),
            children: <EmployeeManagement token={token} isMobile={isMobile} />,
        },
        {
            key: 'attendance',
            label: (
                <span className="flex items-center gap-2">
                    <CalendarOutlined />
                    Attendance
                </span>
            ),
            children: <AttendanceView token={token} isMobile={isMobile} />,
        },
    ];

    return (
        <div style={{ padding: isMobile ? 12 : 32, maxWidth: 1200, margin: "0 auto" }}>
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={items}
                type="card"
                size={isMobile ? "small" : "middle"}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
            />
        </div>
    );
};

export default EmployeeAttendance;
