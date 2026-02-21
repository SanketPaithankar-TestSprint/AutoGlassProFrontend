import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Button, Modal, Form, Input, Select, DatePicker,
    TimePicker, notification, Spin, Empty, InputNumber, Space, Tooltip
} from "antd";
import {
    CalendarOutlined, UserOutlined, CheckCircleOutlined,
    CloseCircleOutlined, ClockCircleOutlined, TeamOutlined,
    PlusOutlined, FieldTimeOutlined, ThunderboltOutlined,
    DownloadOutlined, SearchOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getAllAttendance, recordAttendance, bulkRecordAttendance } from "../../api/attendance";
import { getEmployees } from "../../api/getEmployees";
import { getAllShops } from "../../api/getAllShops";

const { Option } = Select;

/* ─── Constants ─── */
const STATUS_OPTIONS = [
    { value: "PRESENT", label: "Present", short: "P", color: "#22c55e", bg: "#f0fdf4", icon: <CheckCircleOutlined /> },
    { value: "ABSENT", label: "Absent", short: "A", color: "#ef4444", bg: "#fef2f2", icon: <CloseCircleOutlined /> },
    { value: "LATE", label: "Late", short: "L", color: "#f59e0b", bg: "#fffbeb", icon: <ClockCircleOutlined /> },
    { value: "HALF_DAY", label: "Half Day", short: "H", color: "#7c3aed", bg: "#f5f3ff", icon: <FieldTimeOutlined /> },
];
const STATUS_MAP = Object.fromEntries(STATUS_OPTIONS.map(s => [s.value, s]));

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

/* ─── Styles ─── */
const styles = {
    wrapper: {
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    headerCard: {
        background: "linear-gradient(135deg, #7E5CFE 0%, #00A8E4 100%)",
        borderRadius: 16,
        padding: "28px 32px",
        marginBottom: 24,
        color: "#fff",
        boxShadow: "0 4px 24px rgba(126, 92, 254, 0.25)",
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: 700,
        margin: 0,
        letterSpacing: "-0.5px",
    },
    headerSub: {
        fontSize: 14,
        opacity: 0.85,
        marginTop: 4,
    },
    controlsRow: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginTop: 18,
        flexWrap: "wrap",
    },
    selectStyle: {
        minWidth: 140,
    },
    tableContainer: {
        background: "#fff",
        borderRadius: 14,
        boxShadow: "0 1px 12px rgba(0,0,0,0.06)",
        border: "1px solid #f0f0f0",
        overflow: "hidden",
    },
    scrollArea: {
        overflowX: "auto",
        overflowY: "auto",
        maxHeight: "calc(100vh - 320px)",
    },
    table: {
        borderCollapse: "separate",
        borderSpacing: 0,
        width: "100%",
        minWidth: 1200,
        fontSize: 13,
    },
    stickyName: {
        position: "sticky",
        left: 0,
        zIndex: 12,
        background: "#fff",
        minWidth: 200,
        maxWidth: 220,
        padding: "10px 16px",
        borderRight: "2px solid #f0f0f0",
        fontWeight: 600,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    stickyNameHeader: {
        position: "sticky",
        left: 0,
        zIndex: 20,
        background: "#f8fafc",
        minWidth: 200,
        maxWidth: 220,
        padding: "12px 16px",
        borderRight: "2px solid #e2e8f0",
        fontWeight: 700,
        fontSize: 12,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        color: "#475569",
    },
    dayHeaderCell: {
        padding: "10px 4px",
        textAlign: "center",
        fontWeight: 600,
        fontSize: 11,
        color: "#64748b",
        minWidth: 42,
        width: 42,
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "#f8fafc",
        borderBottom: "2px solid #e2e8f0",
        userSelect: "none",
    },
    dayCell: {
        padding: "4px",
        textAlign: "center",
        verticalAlign: "middle",
        minWidth: 42,
        width: 42,
        cursor: "pointer",
        transition: "background 0.15s",
        borderBottom: "1px solid #f1f5f9",
        borderRight: "1px solid #f8fafc",
    },
    badge: (status) => {
        const s = STATUS_MAP[status];
        if (!s) return {};
        return {
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 30,
            height: 26,
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 700,
            color: s.color,
            background: s.bg,
            lineHeight: 1,
            transition: "transform 0.15s, box-shadow 0.15s",
        };
    },
    summaryCell: {
        padding: "6px 8px",
        textAlign: "center",
        fontWeight: 700,
        fontSize: 13,
        borderBottom: "1px solid #f1f5f9",
        minWidth: 48,
    },
    summaryHeader: {
        padding: "10px 8px",
        textAlign: "center",
        fontWeight: 700,
        fontSize: 11,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "#f8fafc",
        borderBottom: "2px solid #e2e8f0",
        minWidth: 48,
    },
    weekendHeader: {
        background: "#fef2f2",
        color: "#e11d48",
    },
    weekendCell: {
        background: "#fffbfb",
    },
    todayHeader: {
        background: "#f5f3ff",
        color: "#7c3aed",
        fontWeight: 800,
    },
    todayCell: {
        background: "#faf5ff",
    },
    tooltip: {
        background: "#1e293b",
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 12,
        lineHeight: 1.5,
    },
    emptyCell: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 30,
        height: 26,
        borderRadius: 6,
        fontSize: 16,
        color: "#e2e8f0",
        fontWeight: 400,
        lineHeight: 1,
    },
    mobileCard: {
        background: "#fff",
        borderRadius: 14,
        border: "1px solid #f0f0f0",
        padding: 16,
        marginBottom: 12,
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    },
    mobileRow: {
        display: "flex",
        gap: 4,
        flexWrap: "wrap",
        marginTop: 8,
    },
    mobileBadge: (status) => {
        const s = STATUS_MAP[status];
        if (!s) return { width: 22, height: 22, borderRadius: 4, background: "#f1f5f9", display: "inline-block" };
        return {
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 22,
            height: 22,
            borderRadius: 4,
            fontSize: 10,
            fontWeight: 700,
            color: s.color,
            background: s.bg,
        };
    },
};

const AttendanceView = ({ token, isMobile }) => {
    const queryClient = useQueryClient();
    const [recordModalOpen, setRecordModalOpen] = useState(false);
    const [bulkModalOpen, setBulkModalOpen] = useState(false);
    const [recordForm] = Form.useForm();
    const [bulkForm] = Form.useForm();
    const tableRef = useRef(null);

    /* ─── Filter State ─── */
    const now = dayjs();
    const [month, setMonth] = useState(now.month() + 1);
    const [year, setYear] = useState(now.year());
    const [searchText, setSearchText] = useState("");
    const [filterEmployee, setFilterEmployee] = useState(null);

    /* ─── Derived values ─── */
    const daysInMonth = dayjs(`${year}-${String(month).padStart(2, "0")}-01`).daysInMonth();
    const monthName = MONTHS[month - 1];
    const today = now.date();
    const isCurrentMonth = now.month() + 1 === month && now.year() === year;

    /* ─── Helper: is weekend ─── */
    const isWeekend = useCallback((day) => {
        const d = dayjs(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
        return d.day() === 0 || d.day() === 6;
    }, [year, month]);

    /* ─── Helper: get day name abbreviation ─── */
    const getDayName = useCallback((day) => {
        const d = dayjs(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
        return d.format("dd");
    }, [year, month]);

    /* ─── Queries ─── */
    const { data: employees = [], isLoading: loadingEmployees } = useQuery({
        queryKey: ["employees"],
        queryFn: async () => {
            if (!token) throw new Error("No token found. Please login.");
            const cached = localStorage.getItem("agp_employees");
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
                } catch (e) { /* ignore */ }
            }
            const res = await getEmployees(token);
            const data = Array.isArray(res) ? res : [];
            localStorage.setItem("agp_employees", JSON.stringify(data));
            return data;
        },
        staleTime: 1000 * 60 * 30,
    });

    const { data: shops = [], isLoading: loadingShops } = useQuery({
        queryKey: ['shops'],
        queryFn: async () => {
            if (!token) return [];
            const res = await getAllShops(token);
            return Array.isArray(res?.data) ? res.data : [];
        },
        enabled: !!token
    });

    const activeFilters = useMemo(() => {
        const f = {};
        if (month) f.month = month;
        if (year) f.year = year;
        if (filterEmployee) f.employeeId = filterEmployee;
        return f;
    }, [month, year, filterEmployee]);

    const {
        data: attendanceData = [],
        isLoading: loadingAttendance,
        refetch: refetchAttendance,
    } = useQuery({
        queryKey: ["attendance", activeFilters],
        queryFn: () => getAllAttendance(activeFilters),
        keepPreviousData: true,
    });

    /* ─── Transform to matrix data ─── */
    const matrixData = useMemo(() => {
        if (!Array.isArray(attendanceData) || attendanceData.length === 0) return [];

        const empMap = {};
        attendanceData.forEach(record => {
            const id = record.employeeId;
            if (!empMap[id]) {
                empMap[id] = {
                    employeeId: id,
                    employeeName: record.employeeName || `Employee ${id}`,
                    days: {},
                    totals: { P: 0, A: 0, L: 0, H: 0 },
                };
            }
            const day = dayjs(record.date).date();
            empMap[id].days[day] = {
                status: record.status,
                clockInTime: record.clockInTime,
                clockOutTime: record.clockOutTime,
                notes: record.notes,
                attendanceId: record.attendanceId,
            };
            if (record.status === "PRESENT") empMap[id].totals.P++;
            else if (record.status === "ABSENT") empMap[id].totals.A++;
            else if (record.status === "LATE") empMap[id].totals.L++;
            else if (record.status === "HALF_DAY") empMap[id].totals.H++;
        });

        let result = Object.values(empMap);

        // Apply search filter
        if (searchText) {
            const q = searchText.toLowerCase();
            result = result.filter(e => e.employeeName.toLowerCase().includes(q));
        }

        // Sort by name
        result.sort((a, b) => a.employeeName.localeCompare(b.employeeName));
        return result;
    }, [attendanceData, searchText]);

    /* ─── Stats ─── */
    const stats = useMemo(() => {
        const records = Array.isArray(attendanceData) ? attendanceData : [];
        return {
            total: records.length,
            present: records.filter(r => r.status === "PRESENT").length,
            absent: records.filter(r => r.status === "ABSENT").length,
            late: records.filter(r => r.status === "LATE").length,
        };
    }, [attendanceData]);

    /* ─── Mutations ─── */
    const recordMutation = useMutation({
        mutationFn: recordAttendance,
        onSuccess: () => {
            notification.success({ message: "Attendance recorded successfully" });
            setRecordModalOpen(false);
            recordForm.resetFields();
            queryClient.invalidateQueries({ queryKey: ["attendance"] });
        },
        onError: (err) => {
            notification.error({ message: "Failed to record attendance", description: err.message });
        },
    });

    const bulkMutation = useMutation({
        mutationFn: ({ shopId, date, status }) => bulkRecordAttendance(shopId, date, status),
        onSuccess: () => {
            notification.success({ message: "Bulk attendance recorded successfully" });
            setBulkModalOpen(false);
            bulkForm.resetFields();
            queryClient.invalidateQueries({ queryKey: ["attendance"] });
        },
        onError: (err) => {
            notification.error({ message: "Failed to record bulk attendance", description: err.message });
        },
    });

    /* ─── Handlers ─── */
    const handleRecordSubmit = async () => {
        try {
            const values = await recordForm.validateFields();
            const payload = {
                employeeId: values.employeeId,
                date: values.date.format("YYYY-MM-DD"),
                status: values.status,
            };
            if (values.clockInTime) payload.clockInTime = values.date.format("YYYY-MM-DD") + "T" + values.clockInTime.format("HH:mm:ss") + "Z";
            if (values.clockOutTime) payload.clockOutTime = values.date.format("YYYY-MM-DD") + "T" + values.clockOutTime.format("HH:mm:ss") + "Z";
            if (values.notes) payload.notes = values.notes;
            recordMutation.mutate(payload);
        } catch (e) { /* validation errors shown by antd */ }
    };

    const handleBulkSubmit = async () => {
        try {
            const values = await bulkForm.validateFields();
            bulkMutation.mutate({
                shopId: values.shopId,
                date: values.date.format("YYYY-MM-DD"),
                status: values.status,
            });
        } catch (e) { /* validation errors shown by antd */ }
    };

    const handleCellClick = (employeeId, day) => {
        recordForm.resetFields();
        const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        recordForm.setFieldsValue({
            employeeId,
            date: dayjs(dateStr),
            status: "PRESENT",
            clockInTime: dayjs().startOf("hour").hour(9),
        });
        setRecordModalOpen(true);
    };

    const handleExportCSV = () => {
        if (matrixData.length === 0) return;
        const dayHeaders = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        let csv = "Employee," + dayHeaders.join(",") + ",Present,Absent,Late\n";
        matrixData.forEach(emp => {
            const row = [emp.employeeName];
            dayHeaders.forEach(d => {
                const info = emp.days[d];
                row.push(info ? (STATUS_MAP[info.status]?.short || "-") : "");
            });
            row.push(emp.totals.P, emp.totals.A, emp.totals.L);
            csv += row.join(",") + "\n";
        });
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Attendance-${monthName}-${year}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    /* ─── Year options ─── */
    const yearOptions = useMemo(() => {
        const yrs = [];
        for (let y = now.year() - 2; y <= now.year() + 1; y++) yrs.push(y);
        return yrs;
    }, []);

    /* ─── Render tooltip content ─── */
    const renderTooltip = (info, day) => {
        if (!info) return null;
        const statusInfo = STATUS_MAP[info.status];
        return (
            <div style={{ fontSize: 12, lineHeight: 1.7 }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>
                    {monthName} {day}, {year}
                </div>
                <div>Status: <span style={{ color: statusInfo?.color, fontWeight: 600 }}>{statusInfo?.label || info.status}</span></div>
                {info.clockInTime && <div>Clock In: {dayjs(info.clockInTime).format("hh:mm A")}</div>}
                {info.clockOutTime && <div>Clock Out: {dayjs(info.clockOutTime).format("hh:mm A")}</div>}
                {info.notes && <div style={{ marginTop: 4, fontStyle: "italic", opacity: 0.85 }}>📝 {info.notes}</div>}
            </div>
        );
    };

    /* ─── Mobile view: per-employee collapsible cards ─── */
    const renderMobileView = () => {
        if (matrixData.length === 0) {
            return (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No attendance records found"
                    style={{ padding: 40 }}
                >
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => { recordForm.resetFields(); setRecordModalOpen(true); }}
                        style={{ background: "#7c3aed", borderColor: "#7c3aed" }}
                    >
                        Record First Attendance
                    </Button>
                </Empty>
            );
        }
        return matrixData.map(emp => (
            <div key={emp.employeeId} style={styles.mobileCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{emp.employeeName}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#22c55e" }}>P:{emp.totals.P}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#ef4444" }}>A:{emp.totals.A}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b" }}>L:{emp.totals.L}</span>
                    </div>
                </div>
                <div style={styles.mobileRow}>
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                        const info = emp.days[day];
                        const weekend = isWeekend(day);
                        const isToday = isCurrentMonth && day === today;
                        return (
                            <Tooltip key={day} title={info ? renderTooltip(info, day) : `${monthName} ${day} – No record`}>
                                <div
                                    onClick={() => handleCellClick(emp.employeeId, day)}
                                    style={{
                                        ...styles.mobileBadge(info?.status),
                                        ...(weekend && !info ? { background: "#fef2f2" } : {}),
                                        ...(isToday ? { outline: "2px solid #7c3aed", outlineOffset: -1 } : {}),
                                    }}
                                >
                                    {info ? (STATUS_MAP[info.status]?.short || "?") : ""}
                                </div>
                            </Tooltip>
                        );
                    })}
                </div>
            </div>
        ));
    };

    /* ─── Desktop spreadsheet ─── */
    const renderSpreadsheet = () => {
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        return (
            <div style={styles.tableContainer}>
                <div style={styles.scrollArea} ref={tableRef}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.stickyNameHeader}>Employee</th>
                                {days.map(day => {
                                    const weekend = isWeekend(day);
                                    const isToday = isCurrentMonth && day === today;
                                    return (
                                        <th
                                            key={day}
                                            style={{
                                                ...styles.dayHeaderCell,
                                                ...(weekend ? styles.weekendHeader : {}),
                                                ...(isToday ? styles.todayHeader : {}),
                                            }}
                                        >
                                            <div>{getDayName(day)}</div>
                                            <div style={{ fontSize: 13, fontWeight: 700 }}>{day}</div>
                                        </th>
                                    );
                                })}
                                <th style={{ ...styles.summaryHeader, color: "#22c55e", borderLeft: "2px solid #e2e8f0" }}>P</th>
                                <th style={{ ...styles.summaryHeader, color: "#ef4444" }}>A</th>
                                <th style={{ ...styles.summaryHeader, color: "#f59e0b" }}>L</th>
                            </tr>
                        </thead>
                        <tbody>
                            {matrixData.length === 0 ? (
                                <tr>
                                    <td colSpan={daysInMonth + 4} style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>
                                        <Empty
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                            description="No attendance records for this month"
                                        >
                                            <Button
                                                type="primary"
                                                icon={<PlusOutlined />}
                                                onClick={() => { recordForm.resetFields(); setRecordModalOpen(true); }}
                                                style={{ background: "#7c3aed", borderColor: "#7c3aed" }}
                                            >
                                                Record Attendance
                                            </Button>
                                        </Empty>
                                    </td>
                                </tr>
                            ) : (
                                matrixData.map((emp, rowIdx) => (
                                    <tr
                                        key={emp.employeeId}
                                        style={{ background: rowIdx % 2 === 0 ? "#fff" : "#fafbfc" }}
                                        onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
                                        onMouseLeave={e => e.currentTarget.style.background = rowIdx % 2 === 0 ? "#fff" : "#fafbfc"}
                                    >
                                        <td style={{
                                            ...styles.stickyName,
                                            background: rowIdx % 2 === 0 ? "#fff" : "#fafbfc",
                                        }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <div style={{
                                                    width: 30, height: 30, borderRadius: "50%",
                                                    background: "linear-gradient(135deg, #7E5CFE, #00A8E4)",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0,
                                                }}>
                                                    {emp.employeeName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                                                </div>
                                                <div style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                                                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{emp.employeeName}</div>
                                                    <div style={{ fontSize: 11, color: "#94a3b8" }}>ID: {emp.employeeId}</div>
                                                </div>
                                            </div>
                                        </td>
                                        {days.map(day => {
                                            const info = emp.days[day];
                                            const weekend = isWeekend(day);
                                            const isToday = isCurrentMonth && day === today;
                                            return (
                                                <td
                                                    key={day}
                                                    style={{
                                                        ...styles.dayCell,
                                                        ...(weekend ? styles.weekendCell : {}),
                                                        ...(isToday ? styles.todayCell : {}),
                                                    }}
                                                    onClick={() => handleCellClick(emp.employeeId, day)}
                                                >
                                                    {info ? (
                                                        <Tooltip
                                                            title={renderTooltip(info, day)}
                                                            placement="top"
                                                            color="#1e293b"
                                                        >
                                                            <span style={styles.badge(info.status)}>
                                                                {STATUS_MAP[info.status]?.short || "?"}
                                                            </span>
                                                        </Tooltip>
                                                    ) : (
                                                        <span style={styles.emptyCell}>·</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                        <td style={{ ...styles.summaryCell, color: "#22c55e", borderLeft: "2px solid #f0f0f0" }}>
                                            <span style={{
                                                background: "#f0fdf4", padding: "3px 10px", borderRadius: 6,
                                            }}>{emp.totals.P}</span>
                                        </td>
                                        <td style={{ ...styles.summaryCell, color: "#ef4444" }}>
                                            <span style={{
                                                background: "#fef2f2", padding: "3px 10px", borderRadius: 6,
                                            }}>{emp.totals.A}</span>
                                        </td>
                                        <td style={{ ...styles.summaryCell, color: "#f59e0b" }}>
                                            <span style={{
                                                background: "#fffbeb", padding: "3px 10px", borderRadius: 6,
                                            }}>{emp.totals.L}</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer stats bar */}
                {matrixData.length > 0 && (
                    <div style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "12px 20px", borderTop: "1px solid #f0f0f0",
                        background: "#fafbfc", fontSize: 13, color: "#64748b",
                    }}>
                        <span>{matrixData.length} employee{matrixData.length !== 1 ? "s" : ""} · {monthName} {year}</span>
                        <div style={{ display: "flex", gap: 16 }}>
                            <span>Total Records: <strong style={{ color: "#1e293b" }}>{stats.total}</strong></span>
                            <span style={{ color: "#22c55e" }}>Present: <strong>{stats.present}</strong></span>
                            <span style={{ color: "#ef4444" }}>Absent: <strong>{stats.absent}</strong></span>
                            <span style={{ color: "#f59e0b" }}>Late: <strong>{stats.late}</strong></span>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={styles.wrapper} className="animate-fadeIn">
            {/* ─── Header Card ─── */}
            <div style={styles.headerCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                    <div>
                        <h2 style={styles.headerTitle}>
                            <CalendarOutlined style={{ marginRight: 10 }} />
                            Monthly Attendance – {monthName} {year}
                        </h2>
                        <p style={styles.headerSub}>
                            {matrixData.length} employee{matrixData.length !== 1 ? "s" : ""} tracked
                            {stats.total > 0 && ` · ${stats.total} records this month`}
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <Button
                            icon={<PlusOutlined />}
                            type="primary"
                            style={{ background: "rgba(255,255,255,0.2)", borderColor: "rgba(255,255,255,0.3)", color: "#fff" }}
                            onClick={() => {
                                recordForm.resetFields();
                                const n = dayjs();
                                recordForm.setFieldsValue({ date: n, status: "PRESENT", clockInTime: n });
                                setRecordModalOpen(true);
                            }}
                        >
                            Record
                        </Button>
                        <Button
                            icon={<TeamOutlined />}
                            style={{ background: "rgba(255,255,255,0.2)", borderColor: "rgba(255,255,255,0.3)", color: "#fff" }}
                            onClick={() => { bulkForm.resetFields(); setBulkModalOpen(true); }}
                        >
                            Bulk
                        </Button>
                        <Button
                            icon={<DownloadOutlined />}
                            style={{ background: "rgba(255,255,255,0.2)", borderColor: "rgba(255,255,255,0.3)", color: "#fff" }}
                            onClick={handleExportCSV}
                        >
                            Export
                        </Button>
                    </div>
                </div>

                {/* Controls row */}
                <div style={styles.controlsRow}>
                    <Select
                        value={month}
                        onChange={setMonth}
                        style={{ ...styles.selectStyle, width: 150 }}
                        popupMatchSelectWidth={false}
                        dropdownStyle={{ borderRadius: 10 }}
                    >
                        {MONTHS.map((m, i) => (
                            <Option key={i + 1} value={i + 1}>{m}</Option>
                        ))}
                    </Select>
                    <Select
                        value={year}
                        onChange={setYear}
                        style={{ ...styles.selectStyle, width: 100 }}
                    >
                        {yearOptions.map(y => (
                            <Option key={y} value={y}>{y}</Option>
                        ))}
                    </Select>
                    <Select
                        placeholder="All Employees"
                        allowClear
                        showSearch
                        optionFilterProp="children"
                        value={filterEmployee}
                        onChange={setFilterEmployee}
                        style={{ ...styles.selectStyle, width: 200 }}
                        loading={loadingEmployees}
                    >
                        {employees.map(e => (
                            <Option key={e.employeeId} value={e.employeeId}>
                                {e.firstName} {e.lastName}
                            </Option>
                        ))}
                    </Select>
                    <Input
                        prefix={<SearchOutlined style={{ color: "#cbd5e1" }} />}
                        placeholder="Search name..."
                        allowClear
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 180, borderRadius: 8 }}
                    />
                </div>
            </div>

            {/* ─── Main Content ─── */}
            {loadingAttendance ? (
                <div style={{ textAlign: "center", padding: 80 }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 12, color: "#94a3b8" }}>Loading attendance data...</div>
                </div>
            ) : isMobile ? (
                renderMobileView()
            ) : (
                renderSpreadsheet()
            )}

            {/* ─── Record Attendance Modal ─── */}
            <Modal
                title={
                    <Space>
                        <PlusOutlined style={{ color: "#7c3aed" }} />
                        <span>Record Attendance</span>
                    </Space>
                }
                open={recordModalOpen}
                onCancel={() => setRecordModalOpen(false)}
                onOk={handleRecordSubmit}
                confirmLoading={recordMutation.isPending}
                okText="Save"
                okButtonProps={{ style: { background: "#7c3aed", borderColor: "#7c3aed" } }}
                width={isMobile ? "95%" : 520}
                destroyOnClose
            >
                <Form form={recordForm} layout="vertical" style={{ marginTop: 16 }}>
                    <Form.Item name="employeeId" label="Employee" rules={[{ required: true, message: "Select an employee" }]}>
                        <Select
                            placeholder="Select employee"
                            showSearch
                            optionFilterProp="children"
                            loading={loadingEmployees}
                        >
                            {employees.map(e => (
                                <Option key={e.employeeId} value={e.employeeId}>{e.firstName} {e.lastName} (ID: {e.employeeId})</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <div style={{ display: "flex", gap: 12 }}>
                        <Form.Item name="date" label="Date" rules={[{ required: true, message: "Select a date" }]} style={{ flex: 1 }}>
                            <DatePicker style={{ width: "100%" }} />
                        </Form.Item>
                        <Form.Item name="status" label="Status" rules={[{ required: true, message: "Select status" }]} style={{ flex: 1 }}>
                            <Select placeholder="Select status">
                                {STATUS_OPTIONS.map(s => (
                                    <Option key={s.value} value={s.value}>
                                        <Space>{s.icon}{s.label}</Space>
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </div>
                    <div style={{ display: "flex", gap: 12 }}>
                        <Form.Item name="clockInTime" label="Clock In" style={{ flex: 1 }}>
                            <TimePicker format="HH:mm" style={{ width: "100%" }} />
                        </Form.Item>
                        <Form.Item name="clockOutTime" label="Clock Out" style={{ flex: 1 }}>
                            <TimePicker format="HH:mm" style={{ width: "100%" }} />
                        </Form.Item>
                    </div>
                    <Form.Item name="notes" label="Notes">
                        <Input.TextArea rows={2} placeholder="Optional notes..." />
                    </Form.Item>
                </Form>
            </Modal>

            {/* ─── Bulk Record Attendance Modal ─── */}
            <Modal
                title={
                    <Space>
                        <TeamOutlined style={{ color: "#7c3aed" }} />
                        <span>Bulk Record Attendance</span>
                    </Space>
                }
                open={bulkModalOpen}
                onCancel={() => setBulkModalOpen(false)}
                onOk={handleBulkSubmit}
                confirmLoading={bulkMutation.isPending}
                okText="Apply to All"
                okButtonProps={{ style: { background: "#7c3aed", borderColor: "#7c3aed" } }}
                width={isMobile ? "95%" : 420}
                destroyOnClose
            >
                <Form form={bulkForm} layout="vertical" style={{ marginTop: 16 }}>
                    <Form.Item name="shopId" label="Shop" rules={[{ required: true, message: "Select a shop" }]}>
                        <Select placeholder="Select a shop" loading={loadingShops}>
                            {shops.map(shop => (
                                <Option key={shop.shopId} value={shop.shopId}>{shop.name || `Shop #${shop.shopId}`}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="date" label="Date" rules={[{ required: true, message: "Select a date" }]}>
                        <DatePicker style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item name="status" label="Status" rules={[{ required: true, message: "Select status" }]}>
                        <Select placeholder="Select status">
                            {STATUS_OPTIONS.map(s => (
                                <Option key={s.value} value={s.value}>
                                    <Space>{s.icon}{s.label}</Space>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <div style={{
                        background: "#f5f3ff",
                        padding: "10px 14px",
                        borderRadius: 8,
                        fontSize: 13,
                        color: "#7c3aed",
                        border: "1px solid #ede9fe",
                    }}>
                        <ThunderboltOutlined style={{ marginRight: 6 }} />
                        This will apply the selected status to <strong>all employees</strong> in the specified shop for the given date.
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default AttendanceView;
