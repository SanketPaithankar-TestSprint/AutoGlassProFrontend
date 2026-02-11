import React, { useState, useEffect } from 'react';
import { Spin, Alert, Tabs, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getCurrentEmployee } from '../../api/attendance';
import { getValidToken } from '../../api/getValidToken';
import { getProfile } from '../../api/getProfile';
import EmployeeAttendanceView from './EmployeeAttendanceView';
import AdminAttendanceView from './AdminAttendanceView';
import RecordAttendanceModal from './RecordAttendanceModal';

import { getEmployees } from '../../api/getEmployees';

const EmployeeAttendance = () => {
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const [employeeRecord, setEmployeeRecord] = useState(null);
    const [allEmployees, setAllEmployees] = useState([]);
    const [error, setError] = useState(null);

    // Modal State
    const [isRecordModalVisible, setIsRecordModalVisible] = useState(false);
    const [preSelectedEmployee, setPreSelectedEmployee] = useState(null);

    const token = getValidToken();

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);

                // 1. Get Profile
                const profile = await getProfile(token);
                setUserProfile(profile);

                // 2. Get Employee Record (for everyone, if it exists)
                try {
                    const emp = await getCurrentEmployee(token);
                    setEmployeeRecord(emp);
                } catch (e) {
                    console.warn("Could not fetch employee record", e);
                }

                // 3. If Shop Owner, fetch all employees for the dropdown
                if (profile.userType === 'SHOP_OWNER') {
                    try {
                        const employees = await getEmployees(token);
                        if (Array.isArray(employees)) {
                            // Filter out invalid IDs and deduplicate
                            const unique = Array.from(new Map(
                                employees
                                    .filter(e => e.id) // Ensure ID exists
                                    .map(e => [e.id, e])
                            ).values());
                            setAllEmployees(unique);
                        } else {
                            setAllEmployees([]);
                        }
                    } catch (e) {
                        console.error("Failed to fetch employees list", e);
                    }
                }

            } catch (err) {
                console.error("Initialization failed", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            init();
        }
    }, [token]);

    const handleRecordAttendance = (employee = null) => {
        setPreSelectedEmployee(employee);
        setIsRecordModalVisible(true);
    };

    const handleModalSuccess = () => {
        // Refresh logic could go here (e.g., re-fetching history in child components)
        // For now, we rely on the user manually refreshing or we can trigger a refresh via context/props if needed.
        // But since the views fetch on mount/update, we might need a trigger.
        // A simple way is to force update, or pass a "refreshTrigger" prop.
        window.dispatchEvent(new Event('refreshAttendance')); // Simple event bus or just let them refresh
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full p-12">
                <Spin size="large" tip="Loading Attendance..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <Alert message="Error" description={error} type="error" showIcon />
            </div>
        );
    }

    if (!userProfile) {
        return <div className="p-6">Please log in.</div>;
    }

    const isShopOwner = userProfile.userType === 'SHOP_OWNER';

    const renderTabs = () => {
        const items = [
            {
                key: 'admin',
                label: 'Admin Dashboard',
                children: (
                    <AdminAttendanceView
                        onRecordAttendance={() => handleRecordAttendance({})} // Pass empty object or null to indicate "select someone"
                    />
                ),
            },
            {
                key: 'my-attendance',
                label: 'My Attendance',
                children: employeeRecord ? (
                    <EmployeeAttendanceView
                        employee={employeeRecord}
                        onRecordAttendance={() => handleRecordAttendance(employeeRecord)}
                    />
                ) : (
                    <Alert
                        message="Employee Profile Not Found"
                        description="You do not have a linked employee profile."
                        type="warning"
                        showIcon
                    />
                ),
            },
        ];

        return <Tabs defaultActiveKey="admin" items={items} />;
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    {isShopOwner ? "Attendance Management" : "My Attendance"}
                </h1>
                {!isShopOwner && (
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => handleRecordAttendance(employeeRecord)}
                    >
                        Record Attendance
                    </Button>
                )}
                {isShopOwner && (
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => handleRecordAttendance(null)}
                    >
                        Record Attendance
                    </Button>
                )}
            </div>

            {isShopOwner ? (
                renderTabs()
            ) : (
                employeeRecord ? (
                    <EmployeeAttendanceView
                        employee={employeeRecord}
                    // The button is already in the header for regular employees, 
                    // but we can pass it down if EmployeeAttendanceView needs it internally
                    />
                ) : (
                    <Alert
                        message="Employee Profile Not Found"
                        description="You do not have a linked employee profile. Please ask your administrator to create one for you."
                        type="warning"
                        showIcon
                    />
                )
            )}

            <RecordAttendanceModal
                visible={isRecordModalVisible}
                onClose={() => setIsRecordModalVisible(false)}
                employees={allEmployees}
                currentUser={employeeRecord || userProfile} // Pass employee record if available, else user profile
                preSelectedEmployee={preSelectedEmployee}
                onSuccess={handleModalSuccess}
                isShopOwner={isShopOwner}
            />
        </div>
    );
};

export default EmployeeAttendance;
