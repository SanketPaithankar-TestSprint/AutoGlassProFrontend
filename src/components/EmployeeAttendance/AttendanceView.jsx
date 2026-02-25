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
    DownloadOutlined, SearchOutlined, UnorderedListOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getAllAttendance, recordAttendance, bulkRecordAttendance } from "../../api/attendance";
import AttendanceCalendarView from "./AttendanceCalendarView";
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

const AttendanceView = ({ token, isMobile }) => {
    const queryClient = useQueryClient();
    const [recordModalOpen, setRecordModalOpen] = useState(false);
    const [bulkModalOpen, setBulkModalOpen] = useState(false);
    const [recordForm] = Form.useForm();
    const [bulkForm] = Form.useForm();
    const tableRef = useRef(null);
    const [viewMode, setViewMode] = useState("list");

    /* ─── Horizontal Scroll on Wheel ─── */
    useEffect(() => {
        const handleWheel = (e) => {
            if (tableRef.current) {
                const container = tableRef.current;
                const hasVerticalScroll = container.scrollHeight > container.clientHeight;

                // If holding Shift, always scroll horizontally
                if (e.shiftKey && e.deltaY !== 0) {
                    const canScrollLeft = container.scrollLeft > 0;
                    const canScrollRight = Math.ceil(container.scrollLeft) < container.scrollWidth - container.clientWidth;
                    if ((e.deltaY > 0 && canScrollRight) || (e.deltaY < 0 && canScrollLeft)) {
                        e.preventDefault();
                        container.scrollLeft += e.deltaY;
                    }
                    return;
                }

                // If not holding shift, and there's NO vertical scroll needed, convert vertical wheel to horizontal
                if (!e.shiftKey && !hasVerticalScroll && e.deltaY !== 0) {
                    const canScrollLeft = container.scrollLeft > 0;
                    const canScrollRight = Math.ceil(container.scrollLeft) < container.scrollWidth - container.clientWidth;

                    if ((e.deltaY > 0 && canScrollRight) || (e.deltaY < 0 && canScrollLeft)) {
                        e.preventDefault();
                        container.scrollLeft += e.deltaY;
                    }
                }
            }
        };

        const currentRef = tableRef.current;
        if (currentRef) {
            // passive: false is required to be able to call e.preventDefault()
            currentRef.addEventListener('wheel', handleWheel, { passive: false });
        }

        return () => {
            if (currentRef) {
                currentRef.removeEventListener('wheel', handleWheel);
            }
        };
    }, []);
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
            <div key={emp.employeeId} className="bg-white rounded-xl border border-gray-100 p-4 mb-3 shadow-sm">
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
                <div className="flex gap-1 flex-wrap mt-2">
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                        const info = emp.days[day];
                        const weekend = isWeekend(day);
                        const isToday = isCurrentMonth && day === today;

                        let badgeStyle = { width: 22, height: 22, borderRadius: 4, background: "#f1f5f9", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#64748b" };
                        if (info) {
                            const s = STATUS_MAP[info.status];
                            if (s) {
                                badgeStyle.background = s.bg;
                                badgeStyle.color = s.color;
                            }
                        }

                        return (
                            <Tooltip key={day} title={info ? renderTooltip(info, day) : `${monthName} ${day} – No record`}>
                                <div
                                    onClick={() => handleCellClick(emp.employeeId, day)}
                                    style={{
                                        ...badgeStyle,
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
            <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden flex flex-col flex-1 min-h-0">
                <div className="overflow-x-auto overflow-y-auto flex-1 min-h-[400px] max-h-[calc(100vh-280px)] custom-scrollbar" ref={tableRef}>
                    <table className="w-full min-w-[1200px] border-collapse text-[13px] border-spacing-0">
                        <thead>
                            <tr>
                                <th className="sticky left-0 z-20 bg-slate-50 min-w-[200px] max-w-[220px] px-4 py-3 border-r-2 border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-600">Employee</th>
                                {days.map(day => {
                                    const weekend = isWeekend(day);
                                    const isToday = isCurrentMonth && day === today;
                                    return (
                                        <th
                                            key={day}
                                            className={`sticky top-0 z-10 px-1 py-2.5 text-center font-semibold text-[11px] min-w-[42px] w-[42px] border-b-2 border-slate-200 select-none ${isToday ? 'bg-violet-50 text-violet-600 font-extrabold' :
                                                weekend ? 'bg-red-50 text-rose-600' :
                                                    'bg-slate-50 text-slate-500'
                                                }`}
                                        >
                                            <div>{getDayName(day)}</div>
                                            <div style={{ fontSize: 13, fontWeight: 700 }}>{day}</div>
                                        </th>
                                    );
                                })}
                                <th className="sticky top-0 z-10 bg-slate-50 min-w-[48px] px-2 py-2.5 text-center font-bold text-[11px] uppercase tracking-wider border-b-2 border-l-2 border-slate-200 text-green-500">P</th>
                                <th className="sticky top-0 z-10 bg-slate-50 min-w-[48px] px-2 py-2.5 text-center font-bold text-[11px] uppercase tracking-wider border-b-2 border-slate-200 text-red-500">A</th>
                                <th className="sticky top-0 z-10 bg-slate-50 min-w-[48px] px-2 py-2.5 text-center font-bold text-[11px] uppercase tracking-wider border-b-2 border-slate-200 text-amber-500">L</th>
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
                                        <td className={`sticky left-0 z-12 min-w-[200px] max-w-[220px] px-4 py-2.5 border-r-2 border-slate-100 font-semibold whitespace-nowrap overflow-hidden text-ellipsis ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
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

                                            // Determine styles for day cells
                                            let cellClass = "p-1 text-center align-middle min-w-[42px] w-[42px] cursor-pointer transition-colors border-b border-r border-slate-50 hover:bg-slate-100 ";
                                            if (isToday) cellClass += "bg-purple-50 ";
                                            else if (weekend) cellClass += "bg-red-50/30 ";

                                            // Determine styles for badges
                                            let badgeStyle = { width: 30, height: 26, borderRadius: 6, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, lineHeight: 1, color: "#e2e8f0" };
                                            if (info) {
                                                const s = STATUS_MAP[info.status];
                                                if (s) {
                                                    badgeStyle.background = s.bg;
                                                    badgeStyle.color = s.color;
                                                }
                                            }

                                            return (
                                                <td
                                                    key={day}
                                                    className={cellClass}
                                                    onClick={() => handleCellClick(emp.employeeId, day)}
                                                >
                                                    {info ? (
                                                        <Tooltip
                                                            title={renderTooltip(info, day)}
                                                            placement="top"
                                                            color="#1e293b"
                                                        >
                                                            <span style={badgeStyle}>
                                                                {STATUS_MAP[info.status]?.short || "?"}
                                                            </span>
                                                        </Tooltip>
                                                    ) : (
                                                        <span className="inline-flex items-center justify-center w-[30px] h-[26px] rounded-md text-base text-slate-300 font-normal leading-none" style={{ color: "#e2e8f0" }}>·</span>
                                                    )}
                                                </td>
                                            );
                                        })}
                                        <td className="px-2 py-1.5 text-center font-bold text-[13px] border-b border-l-2 border-slate-100 min-w-[48px] text-green-500">
                                            <span className="bg-green-50 px-2.5 py-1 rounded-md">{emp.totals.P}</span>
                                        </td>
                                        <td className="px-2 py-1.5 text-center font-bold text-[13px] border-b border-slate-100 min-w-[48px] text-red-500">
                                            <span className="bg-red-50 px-2.5 py-1 rounded-md">{emp.totals.A}</span>
                                        </td>
                                        <td className="px-2 py-1.5 text-center font-bold text-[13px] border-b border-slate-100 min-w-[48px] text-amber-500">
                                            <span className="bg-amber-50 px-2.5 py-1 rounded-md">{emp.totals.L}</span>
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
        <div className="flex-1 flex flex-col font-sans animate-fadeIn">
            {/* ─── Header Container ─── */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div className="flex items-center gap-4">
                    <h1 className="!text-[30px] font-bold text-slate-900 m-0">Attendance</h1>
                    <div className="bg-slate-100 p-1 rounded-lg flex gap-1 hidden sm:flex">
                        <Button
                            type={viewMode === 'list' ? 'primary' : 'text'}
                            icon={<UnorderedListOutlined />}
                            onClick={() => setViewMode('list')}
                            className={`border-0 ${viewMode === 'list' ? 'bg-white shadow-sm text-violet-600 font-medium' : 'text-slate-500 hover:text-slate-700'}`}
                            size="small"
                        >
                            List
                        </Button>
                        <Button
                            type={viewMode === 'calendar' ? 'primary' : 'text'}
                            icon={<CalendarOutlined />}
                            onClick={() => setViewMode('calendar')}
                            className={`border-0 ${viewMode === 'calendar' ? 'bg-white shadow-sm text-violet-600 font-medium' : 'text-slate-500 hover:text-slate-700'}`}
                            size="small"
                        >
                            Calendar
                        </Button>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        className="bg-gradient-to-r from-violet-600 to-indigo-600 border-0 hover:from-violet-500 hover:to-indigo-500 shadow-md"
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
                        onClick={() => { bulkForm.resetFields(); setBulkModalOpen(true); }}
                    >
                        Bulk
                    </Button>
                    <Button
                        icon={<DownloadOutlined />}
                        onClick={handleExportCSV}
                    >
                        Export
                    </Button>
                </div>
            </div>

            {/* Controls row */}
            <div className="mb-4 bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-100">
                <div className="flex flex-col md:flex-row md:flex-nowrap md:items-center gap-2 md:gap-3">
                    <Select
                        value={month}
                        onChange={setMonth}
                        className="w-[120px] shrink-0"
                        popupMatchSelectWidth={false}
                        size="small"
                    >
                        {MONTHS.map((m, i) => (
                            <Option key={i + 1} value={i + 1}>{m}</Option>
                        ))}
                    </Select>
                    <Select
                        value={year}
                        onChange={setYear}
                        className="w-[80px] shrink-0"
                        size="small"
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
                        className="w-[200px] shrink-0"
                        loading={loadingEmployees}
                        size="small"
                    >
                        {employees.map(e => (
                            <Option key={e.employeeId} value={e.employeeId}>
                                {e.firstName} {e.lastName}
                            </Option>
                        ))}
                    </Select>
                    <Input
                        prefix={<SearchOutlined className="text-slate-400" />}
                        placeholder="Search name..."
                        allowClear
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        className="w-full md:w-[220px]"
                        size="small"
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
            ) : viewMode === 'calendar' ? (
                <AttendanceCalendarView
                    attendanceData={attendanceData}
                    currentDate={dayjs(`${year}-${String(month).padStart(2, '0')}-01`)}
                    setCurrentDate={(d) => {
                        setMonth(d.month() + 1);
                        setYear(d.year());
                    }}
                />
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
