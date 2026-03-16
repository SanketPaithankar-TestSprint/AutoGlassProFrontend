import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Button, Modal, Form, Input, Select, DatePicker,
    TimePicker, notification, Spin, Empty, InputNumber, Space, Tooltip, Switch, Segmented
} from "antd";
import {
    CalendarOutlined, UserOutlined, CheckCircleOutlined,
    CloseCircleOutlined, ClockCircleOutlined, TeamOutlined,
    PlusOutlined, FieldTimeOutlined, ThunderboltOutlined,
    DownloadOutlined, SearchOutlined, UnorderedListOutlined, InfoCircleOutlined,
    CheckOutlined, CloseOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { getAllAttendance, recordAttendance, bulkRecordAttendance } from "../../api/attendance";
import AttendanceCalendarView from "./AttendanceCalendarView";
import { getEmployees } from "../../api/getEmployees";
import { getAllShops } from "../../api/getAllShops";
import { PresentBox, AbsentBox, WeekendBox, LateBox } from "./UIComponents";

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
    const { t } = useTranslation();
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
                    employeeName: record.employeeName || `${t("attendance.employee")} ${id}`,
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
        const todayStr = dayjs().format("YYYY-MM-DD");
        const todayRecords = records.filter(r => dayjs(r.date).format("YYYY-MM-DD") === todayStr);

        return {
            total: records.length,
            present: records.filter(r => r.status === "PRESENT").length,
            absent: records.filter(r => r.status === "ABSENT").length,
            late: records.filter(r => r.status === "LATE").length,
            todayPresent: todayRecords.filter(r => r.status === "PRESENT").length,
            todayAbsent: todayRecords.filter(r => r.status === "ABSENT").length,
            todayLate: todayRecords.filter(r => r.status === "LATE").length,
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
            if (values.clockInTime) payload.clockInTime = values.date.hour(values.clockInTime.hour()).minute(values.clockInTime.minute()).second(values.clockInTime.second()).toISOString();
            if (values.clockOutTime) payload.clockOutTime = values.date.hour(values.clockOutTime.hour()).minute(values.clockOutTime.minute()).second(values.clockOutTime.second()).toISOString();
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
        
        // Find existing attendance record for this employee and date
        const existingRecord = attendanceData.find(record => 
            record.employeeId === employeeId && 
            dayjs(record.date).format("YYYY-MM-DD") === dateStr
        );
        
        if (existingRecord) {
            // Load existing data
            const formValues = {
                employeeId,
                date: dayjs(existingRecord.date),
                status: existingRecord.status,
                notes: existingRecord.notes || ""
            };
            
            // Add time fields if they exist
            if (existingRecord.clockInTime) {
                formValues.clockInTime = dayjs(existingRecord.clockInTime);
            }
            if (existingRecord.clockOutTime) {
                formValues.clockOutTime = dayjs(existingRecord.clockOutTime);
            }
            
            recordForm.setFieldsValue(formValues);
        } else {
            // Set defaults only for new records
            recordForm.setFieldsValue({
                employeeId,
                date: dayjs(dateStr),
                status: "PRESENT"
            });
        }
        
        setRecordModalOpen(true);
    };

    const handleExportCSV = () => {
        if (matrixData.length === 0) return;
        const dayHeaders = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        let csv = `${t("attendance.employee")},` + dayHeaders.join(",") + ",Present,Absent,Late\n";
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
                    description={t("attendance.noRecordsFound")}
                    style={{ padding: 40 }}
                >
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            recordForm.resetFields();
                            const n = dayjs();
                            recordForm.setFieldsValue({ date: n, status: "PRESENT" });
                            setRecordModalOpen(true);
                        }}
                        style={{ background: "#7c3aed", borderColor: "#7c3aed" }}
                    >
                        {t("attendance.recordFirstAttendance")}
                    </Button>
                </Empty>
            );
        }
        return matrixData.map(emp => (
            <div key={emp.employeeId} className="bg-white rounded-xl border border-gray-200 p-4 mb-3 shadow-sm">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, borderBottom: "1px solid #e5e7eb", paddingBottom: 8 }}>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{emp.employeeName}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#22c55e" }}>P:{emp.totals.P}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#ef4444" }}>A:{emp.totals.A}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b" }}>L:{emp.totals.L}</span>
                    </div>
                </div>
                <div className="flex gap-1 flex-wrap mt-2" style={{ borderTop: "1px solid #f3f4f6", paddingTop: 8 }}>
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                        const info = emp.days[day];
                        const weekend = isWeekend(day);
                        const isToday = isCurrentMonth && day === today;

                        let badgeStyle = { 
                            width: 22, 
                            height: 22, 
                            borderRadius: 4, 
                            background: "#f1f5f9", 
                            display: "inline-flex", 
                            alignItems: "center", 
                            justifyContent: "center", 
                            fontSize: 10, 
                            fontWeight: 700, 
                            color: "#64748b",
                            border: "1px solid #e5e7eb"
                        };
                        if (info) {
                            const s = STATUS_MAP[info.status];
                            if (s) {
                                badgeStyle.background = s.bg;
                                badgeStyle.color = s.color;
                                badgeStyle.borderColor = s.color + "30";
                            }
                        }

                        return (
                            <Tooltip key={day} title={info ? renderTooltip(info, day) : `${monthName} ${day} – No record`}>
                                <div
                                    onClick={() => handleCellClick(emp.employeeId, day)}
                                    style={{
                                        ...badgeStyle,
                                        ...(weekend && !info ? { background: "#fef2f2", borderColor: "#fecaca" } : {}),
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
                    <table className="w-full border-collapse text-[13px] border-spacing-0 border border-slate-200">
                        <thead>
                            <tr>
                                <th className="sticky left-0 z-20 bg-slate-50 min-w-[200px] max-w-[220px] px-4 py-3 border-r-2 border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-600">{t("attendance.employee")}</th>
                                {days.map(day => {
                                    const weekend = isWeekend(day);
                                    const isToday = isCurrentMonth && day === today;
                                    return (
                                        <th
                                            key={day}
                                            className={`sticky top-0 z-10 px-0.5 py-2 text-center font-semibold text-[10px] min-w-[32px] w-[32px] border-b-2 border-r border-slate-200 select-none ${isToday ? 'bg-violet-50 text-violet-600 font-extrabold' :
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
                                    <td colSpan={daysInMonth + 4} className="p-0 border-0" style={{ height: "400px", minWidth: "100%" }}>
                                        <div style={{ position: "sticky", left: 0, width: "100%", display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                                            <Empty
                                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                                description={<span style={{ color: "#94a3b8" }}>{t("attendance.noRecordsForMonth")}</span>}
                                            >
                                                <Button
                                                    type="primary"
                                                    icon={<PlusOutlined />}
                                                    onClick={() => {
                                                        recordForm.resetFields();
                                                        const n = dayjs();
                                                        recordForm.setFieldsValue({ date: n, status: "PRESENT" });
                                                        setRecordModalOpen(true);
                                                    }}
                                                    style={{ background: "#7c3aed", borderColor: "#7c3aed" }}
                                                >
                                                    {t("attendance.recordAttendance")}
                                                </Button>
                                            </Empty>
                                        </div>
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
                                            let cellClass = "p-0 text-center align-middle min-w-[32px] w-[32px] cursor-pointer transition-colors border-b border-r border-slate-200 hover:bg-slate-100 ";
                                            if (isToday) cellClass += "bg-purple-50 ";
                                            else if (weekend) cellClass += "bg-red-50/30 ";

                                            // Determine styles for badges
                                            let badgeStyle = { width: 24, height: 20, borderRadius: 4, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, lineHeight: 1, color: "#e2e8f0" };
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
                                                    {weekend && !info ? (
                                                        <Tooltip
                                                            title={`${monthName} ${day} – Weekend`}
                                                            placement="top"
                                                            color="#1e293b"
                                                        >
                                                            <WeekendBox />
                                                        </Tooltip>
                                                    ) : info ? (
                                                        <Tooltip
                                                            title={renderTooltip(info, day)}
                                                            placement="top"
                                                            color="#1e293b"
                                                        >
                                                            {info.status === 'PRESENT' && <PresentBox showIcon={true} showNumber={false} />}
                                                            {info.status === 'ABSENT' && <AbsentBox showIcon={true} showNumber={false} />}
                                                            {info.status === 'LATE' && <LateBox showIcon={true} showNumber={false} />}
                                                            {info.status === 'HALF_DAY' && <LateBox showIcon={true} showNumber={false} />}
                                                        </Tooltip>
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <span className="text-slate-300 text-sm">·</span>
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                        <td className="px-1 py-1 text-center border-b border-l-2 border-slate-100 min-w-[48px]">
                                            <PresentBox count={emp.totals.P} showIcon={false} showNumber={true} />
                                        </td>
                                        <td className="px-1 py-1 text-center border-b border-slate-100 min-w-[48px]">
                                            <AbsentBox count={emp.totals.A} showIcon={false} showNumber={true} />
                                        </td>
                                        <td className="px-1 py-1 text-center border-b border-slate-100 min-w-[48px]">
                                            <LateBox count={emp.totals.L} showIcon={false} showNumber={true} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                            </div>
        );
    };

    return (
        <div className="flex-1 flex flex-col font-sans animate-fadeIn bg-slate-50">
            {/* ─── Header Container ─── */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 mb-4">
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="!text-[24px] md:!text-[30px] font-bold text-slate-900 m-0">{t("attendance.title")}</h1>
                    <Tooltip title={t("attendance.infoTooltip")} placement="right">
                        <InfoCircleOutlined className="text-slate-400 text-base cursor-pointer hover:text-violet-500 transition-colors" />
                    </Tooltip>
                    <div className="bg-white border p-1 rounded-lg flex">
                        <Button
                            type={viewMode === 'list' ? 'primary' : 'text'}
                            icon={<UnorderedListOutlined />}
                            onClick={() => setViewMode('list')}
                            size="small"
                        >
                            {t("attendance.list")}
                        </Button>
                        <Button
                            type={viewMode === 'calendar' ? 'primary' : 'text'}
                            icon={<CalendarOutlined />}
                            onClick={() => setViewMode('calendar')}
                            size="small"
                        >
                            {t("attendance.calendar")}
                        </Button>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        className="bg-blue-600 border-blue-600 hover:!bg-blue-500 hover:!border-blue-500 shadow-md flex-1 sm:flex-none"
                        onClick={() => {
                            recordForm.resetFields();
                            const n = dayjs();
                            recordForm.setFieldsValue({ date: n, status: "PRESENT" });
                            setRecordModalOpen(true);
                        }}
                    >
                        {t("attendance.recordAttendance")}
                    </Button>
                    <Button
                        icon={<TeamOutlined />}
                        className="flex-1 sm:flex-none"
                        onClick={() => { bulkForm.resetFields(); setBulkModalOpen(true); }}
                    >
                        {t("attendance.bulk")}
                    </Button>
                    <Button
                        icon={<DownloadOutlined />}
                        className="flex-1 sm:flex-none"
                        onClick={handleExportCSV}
                    >
                        {t("attendance.export")}
                    </Button>
                </div>
            </div>

            {/* Controls row */}
            <div className="mb-4 flex flex-col xl:flex-row xl:flex-nowrap xl:items-center gap-2 xl:gap-3">
                <div className="bg-white px-3 sm:px-4 py-2 rounded-lg shadow-sm border border-slate-100 flex items-center gap-2 overflow-x-auto pr-3 sm:pr-6 w-full xl:w-auto">
                    <Select
                        value={month}
                        onChange={setMonth}
                        className="w-[100px] shrink-0"
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
                        className="w-[70px] shrink-0"
                        size="small"
                    >
                        {yearOptions.map(y => (
                            <Option key={y} value={y}>{y}</Option>
                        ))}
                    </Select>
                    <Select
                        placeholder={t("attendance.allEmployees")}
                        allowClear
                        showSearch
                        optionFilterProp="children"
                        value={filterEmployee}
                        onChange={setFilterEmployee}
                        className="w-[160px] shrink-0"
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
                        placeholder={t("attendance.searchName")}
                        allowClear
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        className="!w-[220px] md:!w-[300px] shrink-0"
                        size="small"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 w-full xl:w-auto xl:ml-auto">
                    <div className="flex items-center bg-white px-3 sm:px-4 py-2 rounded-lg shadow-sm border border-slate-100">
                        <div className="rounded-md p-1.5 mr-3 flex items-center justify-center" style={{ backgroundColor: '#dcfce7' }}>
                            <CheckOutlined className="text-lg" style={{ color: '#166534' }} />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-800">{t("attendance.presentToday")}</div>
                            <div className="text-xs text-gray-400">{stats.todayPresent}</div>
                        </div>
                    </div>
                    <div className="flex items-center bg-white px-3 sm:px-4 py-2 rounded-lg shadow-sm border border-slate-100">
                        <div className="rounded-md p-1.5 mr-3 flex items-center justify-center" style={{ backgroundColor: '#fee2e2' }}>
                            <CloseOutlined className="text-lg" style={{ color: '#991b1b' }} />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-800">{t("attendance.absentToday")}</div>
                            <div className="text-xs text-gray-400">{stats.todayAbsent}</div>
                        </div>
                    </div>
                    <div className="flex items-center bg-white px-3 sm:px-4 py-2 rounded-lg shadow-sm border border-slate-100">
                        <div className="rounded-md p-1.5 mr-3 flex items-center justify-center" style={{ backgroundColor: '#fef9c3' }}>
                            <ClockCircleOutlined className="text-lg" style={{ color: '#854d0e' }} />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-800">{t("attendance.lateToday")}</div>
                            <div className="text-xs text-gray-400">{stats.todayLate}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Main Content ─── */}
            {loadingAttendance ? (
                <div style={{ textAlign: "center", padding: 80 }}>
                    <Spin size="large" />
                    <div style={{ marginTop: 12, color: "#94a3b8" }}>{t("attendance.loadingData")}</div>
                </div>
            ) : viewMode === 'calendar' ? (
                <AttendanceCalendarView
                    attendanceData={attendanceData}
                    currentDate={dayjs(`${year}-${String(month).padStart(2, '0')}-01`)}
                    setCurrentDate={(d) => {
                        setMonth(d.month() + 1);
                        setYear(d.year());
                    }}
                />
            ) : isMobile ? (
                renderMobileView()
            ) : (
                renderSpreadsheet()
            )}

            {/* ─── Stats Bar (shown for both views) ─── */}
            <div className="mt-4 mb-4 px-2 sm:px-4 py-3">
                <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-center">
                    <span className="text-sm text-gray-600">
                        {matrixData.length} {t("attendance.employee").toLowerCase()}{matrixData.length !== 1 ? "s" : ""} · {monthName} {year}
                    </span>
                    <div className="flex flex-wrap gap-3 text-sm">
                        <span>{t("attendance.totalRecords")}: <strong style={{ color: "#1e293b" }}>{stats.total}</strong></span>
                        <span style={{ color: "#22c55e" }}>{t("attendance.present")}: <strong>{stats.present}</strong></span>
                        <span style={{ color: "#ef4444" }}>{t("attendance.absent")}: <strong>{stats.absent}</strong></span>
                        <span style={{ color: "#f59e0b" }}>{t("attendance.late")}: <strong>{stats.late}</strong></span>
                    </div>
                </div>
            </div>

            {/* ─── Record Attendance Modal ─── */}
            <Modal
                title={
                    <Space>
                        <span>{t("attendance.recordAttendance")}</span>
                    </Space>
                }
                open={recordModalOpen}
                onCancel={() => setRecordModalOpen(false)}
                onOk={handleRecordSubmit}
                confirmLoading={recordMutation.isPending}
                okText={t("attendance.save")}
                cancelText={t("attendance.cancel")}
                okButtonProps={{ style: { background: "#2563eb", borderColor: "#2563eb" } }}
                width={isMobile ? "95%" : 400}
                destroyOnClose
            >
                <Form form={recordForm} layout="vertical" style={{ marginTop: 16 }}>
                    <Form.Item name="employeeId" label={t("attendance.employee")} rules={[{ required: true, message: t("attendance.selectEmployee") }]}>
                        <Select
                            placeholder={t("attendance.selectEmployee")}
                            showSearch
                            optionFilterProp="children"
                            loading={loadingEmployees}
                        >
                            {employees.map(e => (
                                <Option key={e.employeeId} value={e.employeeId}>{e.firstName} {e.lastName}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="date" label={t("attendance.date")} rules={[{ required: true, message: t("attendance.selectDate") }]}>
                        <DatePicker style={{ width: "100%" }} placeholder={t("attendance.selectDate")} />
                    </Form.Item>
                    <Form.Item name="status" label={t("attendance.status")} rules={[{ required: true, message: t("attendance.selectStatus") }]}>
                        <Segmented
                            options={[
                                { label: t("attendance.present"), value: 'PRESENT' },
                                { label: t("attendance.absent"), value: 'ABSENT' },
                                { label: t("attendance.late"), value: 'LATE' }
                            ]}
                            className="w-full bg-slate-100 p-1"
                            block
                        />
                    </Form.Item>
                    <div style={{ display: "flex", gap: 12 }}>
                        <Form.Item name="clockInTime" label={t("attendance.clockIn")} style={{ flex: 1 }}>
                            <TimePicker format="HH:mm" style={{ width: "100%" }} placeholder={t("attendance.selectTime")} />
                        </Form.Item>
                        <Form.Item name="clockOutTime" label={t("attendance.clockOut")} style={{ flex: 1 }}>
                            <TimePicker format="HH:mm" style={{ width: "100%" }} placeholder={t("attendance.selectTime")} />
                        </Form.Item>
                    </div>
                    <Form.Item name="notes" label={t("attendance.notes")}>
                        <Input.TextArea rows={2} placeholder={t("attendance.optionalNotes")} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* ─── Bulk Record Attendance Modal ─── */}
            <Modal
                title={
                    <Space>
                        <TeamOutlined style={{ color: "#2563eb" }} />
                        <span>{t("attendance.bulkRecordAttendance")}</span>
                    </Space>
                }
                open={bulkModalOpen}
                onCancel={() => setBulkModalOpen(false)}
                onOk={handleBulkSubmit}
                confirmLoading={bulkMutation.isPending}
                okText={t("attendance.applyToAll")}
                cancelText={t("attendance.cancel")}
                okButtonProps={{ style: { background: "#2563eb", borderColor: "#2563eb" } }}
                width={isMobile ? "95%" : 420}
                destroyOnClose
            >
                <Form form={bulkForm} layout="vertical" style={{ marginTop: 16 }}>
                    <Form.Item name="shopId" label={t("attendance.shop")} rules={[{ required: true, message: t("attendance.selectShop") }]}>
                        <Select placeholder={t("attendance.selectShop")} loading={loadingShops}>
                            {shops.map(shop => (
                                <Option key={shop.shopId} value={shop.shopId}>{shop.name || `Shop #${shop.shopId}`}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="date" label={t("attendance.date")} rules={[{ required: true, message: t("attendance.selectDate") }]}>
                        <DatePicker style={{ width: "100%" }} placeholder={t("attendance.selectDate")} />
                    </Form.Item>
                    <Form.Item name="status" label={t("attendance.status")} rules={[{ required: true, message: t("attendance.selectStatus") }]}>
                        <Segmented
                            options={[
                                { label: t("attendance.present"), value: 'PRESENT' },
                                { label: t("attendance.absent"), value: 'ABSENT' },
                                { label: t("attendance.late"), value: 'LATE' }
                            ]}
                            className="w-full bg-slate-100 p-1"
                            block
                        />
                    </Form.Item>
                    <div style={{
                        background: "#eff6ff",
                        padding: "10px 14px",
                        borderRadius: 8,
                        fontSize: 13,
                        color: "#2563eb",
                        border: "1px solid #dbeafe",
                    }}>
                        <ThunderboltOutlined style={{ marginRight: 6 }} />
                        {t("attendance.bulkWarning")}
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default AttendanceView;
