import React, { useState, useEffect } from "react";
import { getValidToken } from "../../api/getValidToken";
import AttendanceView from "./AttendanceView";

const EmployeeAttendance = () => {
    const token = getValidToken();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        document.title = "APAI | Employee Attendance";
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="p-6 h-full flex flex-col bg-slate-50 overflow-y-auto">
            <AttendanceView token={token} isMobile={isMobile} />
        </div>
    );
};

export default EmployeeAttendance;
