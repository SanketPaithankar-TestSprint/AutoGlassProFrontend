import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Table, Tag, Button, Modal, Form, Input, Select, DatePicker,
    TimePicker, notification, Card, Row, Col, Space, Typography,
    Tooltip, Spin, Empty, Badge, Statistic, InputNumber
} from "antd";
import {
    CalendarOutlined, UserOutlined, CheckCircleOutlined,
    CloseCircleOutlined, ClockCircleOutlined, TeamOutlined,
    PlusOutlined, FilterOutlined, ReloadOutlined,
    FileTextOutlined, ThunderboltOutlined, FieldTimeOutlined,
    ClearOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getAllAttendance, recordAttendance, bulkRecordAttendance } from "../../api/attendance";
import { getEmployees } from "../../api/getEmployees";

const { Title, Text } = Typography;
const { Option } = Select;

/* ─── Constants ─── */
const STATUS_OPTIONS = [
    { value: "PRESENT", label: "Present", color: "green", icon: <CheckCircleOutlined /> },
    { value: "ABSENT", label: "Absent", color: "red", icon: <CloseCircleOutlined /> },
    { value: "LATE", label: "Late", color: "orange", icon: <ClockCircleOutlined /> },
    { value: "HALF_DAY", label: "Half Day", color: "blue", icon: <FieldTimeOutlined /> },
];

const STATUS_MAP = Object.fromEntries(STATUS_OPTIONS.map(s => [s.value, s]));

const MONTHS = [
    { value: 1, label: "January" }, { value: 2, label: "February" },
    { value: 3, label: "March" }, { value: 4, label: "April" },
    { value: 5, label: "May" }, { value: 6, label: "June" },
    { value: 7, label: "July" }, { value: 8, label: "August" },
    { value: 9, label: "September" }, { value: 10, label: "October" },
    { value: 11, label: "November" }, { value: 12, label: "December" },
];

const AttendanceView = ({ token, isMobile }) => {
    const queryClient = useQueryClient();
    const [recordModalOpen, setRecordModalOpen] = useState(false);
    const [bulkModalOpen, setBulkModalOpen] = useState(false);
    const [recordForm] = Form.useForm();
    const [bulkForm] = Form.useForm();

    /* ─── Filter State ─── */
    const now = dayjs();
    const [filters, setFilters] = useState({
        month: now.month() + 1,
        year: now.year(),
        employeeId: null,
        shopId: null,
    });
    const [showFilters, setShowFilters] = useState(false);

    /* ─── Queries ─── */
    const { data: employees = [], isLoading: loadingEmployees } = useQuery({
        queryKey: ["employees"],
        queryFn: async () => {
            // We can rely on the parent or re-fetch here if needed. 
            // Since this component is independent tab, fine to fetch.
            // But let's check cache logic from original file.
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

    const activeFilters = useMemo(() => {
        const f = {};
        if (filters.month) f.month = filters.month;
        if (filters.year) f.year = filters.year;
        if (filters.employeeId) f.employeeId = filters.employeeId;
        if (filters.shopId) f.shopId = filters.shopId;
        return f;
    }, [filters]);

    const {
        data: attendanceData = [],
        isLoading: loadingAttendance,
        refetch: refetchAttendance,
    } = useQuery({
        queryKey: ["attendance", activeFilters],
        queryFn: () => getAllAttendance(activeFilters),
        keepPreviousData: true,
    });

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

    const handleClearFilters = () => {
        setFilters({
            month: now.month() + 1,
            year: now.year(),
            employeeId: null,
            shopId: null,
        });
    };

    /* ─── Stats ─── */
    const stats = useMemo(() => {
        const records = Array.isArray(attendanceData) ? attendanceData : [];
        const present = records.filter(r => r.status === "PRESENT").length;
        const absent = records.filter(r => r.status === "ABSENT").length;
        const late = records.filter(r => r.status === "LATE").length;
        const halfDay = records.filter(r => r.status === "HALF_DAY").length;
        return { total: records.length, present, absent, late, halfDay };
    }, [attendanceData]);

    /* ─── Employee lookup ─── */
    const employeeMap = useMemo(() => {
        const map = {};
        employees.forEach(e => { map[e.employeeId] = `${e.firstName} ${e.lastName}`; });
        return map;
    }, [employees]);

    /* ─── Table columns ─── */
    const columns = [
        {
            title: "Date",
            dataIndex: "date",
            key: "date",
            sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
            render: (val) => val ? dayjs(val).format("MMM DD, YYYY") : "-",
            width: 140,
        },
        {
            title: "Employee",
            dataIndex: "employeeId",
            key: "employee",
            render: (id, record) => {
                const name = record.employeeName || employeeMap[id] || `ID: ${id}`;
                return (
                    <Space>
                        <UserOutlined style={{ color: "#7c3aed" }} />
                        <Text strong>{name}</Text>
                    </Space>
                );
            },
            width: 200,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            filters: STATUS_OPTIONS.map(s => ({ text: s.label, value: s.value })),
            onFilter: (value, record) => record.status === value,
            render: (status) => {
                const info = STATUS_MAP[status] || { label: status, color: "default" };
                return <Tag color={info.color} icon={info.icon}>{info.label}</Tag>;
            },
            width: 130,
        },
        {
            title: "Clock In",
            dataIndex: "clockInTime",
            key: "clockInTime",
            render: (val) => val ? dayjs(val).format("hh:mm A") : "-",
            width: 110,
        },
        {
            title: "Clock Out",
            dataIndex: "clockOutTime",
            key: "clockOutTime",
            render: (val) => val ? dayjs(val).format("hh:mm A") : "-",
            width: 110,
        },
        {
            title: "Notes",
            dataIndex: "notes",
            key: "notes",
            ellipsis: true,
            render: (val) => val || "-",
        },
    ];

    /* ─── Mobile card render ─── */
    const renderMobileCard = (record, idx) => {
        const info = STATUS_MAP[record.status] || { label: record.status, color: "default" };
        const empName = record.employeeName || employeeMap[record.employeeId] || `ID: ${record.employeeId}`;
        return (
            <div
                key={record.id || idx}
                style={{
                    background: "#fff",
                    borderRadius: 12,
                    border: "1px solid #f0f0f0",
                    padding: 16,
                    marginBottom: 12,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <Text strong style={{ fontSize: 15 }}>{empName}</Text>
                    <Tag color={info.color} icon={info.icon}>{info.label}</Tag>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#666", marginBottom: 4 }}>
                    <span><CalendarOutlined style={{ marginRight: 4 }} />{record.date ? dayjs(record.date).format("MMM DD, YYYY") : "-"}</span>
                </div>
                <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#666", marginBottom: 4 }}>
                    <span><ClockCircleOutlined style={{ marginRight: 4 }} />In: {record.clockInTime ? dayjs(record.clockInTime).format("hh:mm A") : "-"}</span>
                    <span>Out: {record.clockOutTime ? dayjs(record.clockOutTime).format("hh:mm A") : "-"}</span>
                </div>
                {record.notes && (
                    <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
                        <FileTextOutlined style={{ marginRight: 4 }} />{record.notes}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="animate-fadeIn">
            {/* Header Actions */}
            <div style={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                justifyContent: "space-between",
                alignItems: isMobile ? "stretch" : "center",
                marginBottom: 24,
                gap: 12,
            }}>
                <div>
                    {/* Title handled by Parent Tabs */}
                </div>
                <Space wrap>
                    <Button
                        icon={<PlusOutlined />}
                        type="primary"
                        onClick={() => {
                            recordForm.resetFields();
                            const now = dayjs();
                            recordForm.setFieldsValue({
                                date: now,
                                status: "PRESENT",
                                clockInTime: now
                            });
                            setRecordModalOpen(true);
                        }}
                        style={{ background: "#7c3aed", borderColor: "#7c3aed" }}
                    >
                        Record
                    </Button>
                    <Button
                        icon={<TeamOutlined />}
                        onClick={() => { bulkForm.resetFields(); setBulkModalOpen(true); }}
                        style={{ borderColor: "#7c3aed", color: "#7c3aed" }}
                    >
                        Bulk Record
                    </Button>
                    <Tooltip title="Toggle Filters">
                        <Button icon={<FilterOutlined />} onClick={() => setShowFilters(v => !v)} type={showFilters ? "primary" : "default"} />
                    </Tooltip>
                    <Tooltip title="Refresh">
                        <Button icon={<ReloadOutlined />} onClick={refetchAttendance} loading={loadingAttendance} />
                    </Tooltip>
                </Space>
            </div>

            {/* Stats Cards */}
            <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
                {[
                    { title: "Total Records", value: stats.total, color: "#7c3aed", icon: <CalendarOutlined /> },
                    { title: "Present", value: stats.present, color: "#52c41a", icon: <CheckCircleOutlined /> },
                    { title: "Absent", value: stats.absent, color: "#ff4d4f", icon: <CloseCircleOutlined /> },
                    { title: "Late", value: stats.late, color: "#fa8c16", icon: <ClockCircleOutlined /> },
                ].map((s, i) => (
                    <Col xs={12} sm={6} key={i}>
                        <Card size="small" style={{ borderRadius: 12, border: "1px solid #f0f0f0" }} bodyStyle={{ padding: "14px 16px" }}>
                            <Statistic
                                title={<span style={{ fontSize: 12, color: "#888" }}>{s.title}</span>}
                                value={s.value}
                                prefix={React.cloneElement(s.icon, { style: { color: s.color, fontSize: 18 } })}
                                valueStyle={{ color: s.color, fontWeight: 700, fontSize: 22 }}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Filters */}
            {showFilters && (
                <Card
                    size="small"
                    style={{ marginBottom: 20, borderRadius: 12, background: "#fafafa" }}
                    bodyStyle={{ padding: "16px 20px" }}
                >
                    <Row gutter={[12, 12]} align="bottom">
                        <Col xs={12} sm={6}>
                            <Text type="secondary" style={{ fontSize: 12 }}>Month</Text>
                            <Select
                                value={filters.month}
                                onChange={v => setFilters(f => ({ ...f, month: v }))}
                                style={{ width: "100%", marginTop: 4 }}
                                allowClear
                                placeholder="All Months"
                            >
                                {MONTHS.map(m => <Option key={m.value} value={m.value}>{m.label}</Option>)}
                            </Select>
                        </Col>
                        <Col xs={12} sm={6}>
                            <Text type="secondary" style={{ fontSize: 12 }}>Year</Text>
                            <InputNumber
                                value={filters.year}
                                onChange={v => setFilters(f => ({ ...f, year: v }))}
                                style={{ width: "100%", marginTop: 4 }}
                                min={2020}
                                max={2030}
                                placeholder="Year"
                            />
                        </Col>
                        <Col xs={12} sm={6}>
                            <Text type="secondary" style={{ fontSize: 12 }}>Employee</Text>
                            <Select
                                value={filters.employeeId}
                                onChange={v => setFilters(f => ({ ...f, employeeId: v }))}
                                style={{ width: "100%", marginTop: 4 }}
                                allowClear
                                placeholder="All Employees"
                                showSearch
                                optionFilterProp="children"
                            >
                                {employees.map(e => (
                                    <Option key={e.employeeId} value={e.employeeId}>{e.firstName} {e.lastName} (ID: {e.employeeId})</Option>
                                ))}
                            </Select>
                        </Col>
                        <Col xs={12} sm={6}>
                            <Text type="secondary" style={{ fontSize: 12 }}>Shop ID</Text>
                            <InputNumber
                                value={filters.shopId}
                                onChange={v => setFilters(f => ({ ...f, shopId: v }))}
                                style={{ width: "100%", marginTop: 4 }}
                                min={1}
                                placeholder="Shop ID"
                            />
                        </Col>
                    </Row>
                    <div style={{ marginTop: 12, textAlign: "right" }}>
                        <Button icon={<ClearOutlined />} size="small" onClick={handleClearFilters}>Reset Filters</Button>
                    </div>
                </Card>
            )}

            {/* Table / Cards */}
            <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: isMobile ? 12 : 0 }}>
                {loadingAttendance ? (
                    <div style={{ textAlign: "center", padding: 60 }}>
                        <Spin size="large" />
                        <div style={{ marginTop: 12, color: "#999" }}>Loading attendance data...</div>
                    </div>
                ) : !Array.isArray(attendanceData) || attendanceData.length === 0 ? (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="No attendance records found"
                        style={{ padding: 40 }}
                    >
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => {
                                recordForm.resetFields();
                                const now = dayjs();
                                recordForm.setFieldsValue({
                                    date: now,
                                    status: "PRESENT",
                                    clockInTime: now
                                });
                                setRecordModalOpen(true);
                            }}
                            style={{ background: "#7c3aed", borderColor: "#7c3aed" }}
                        >
                            Record First Attendance
                        </Button>
                    </Empty>
                ) : isMobile ? (
                    <div>{attendanceData.map(renderMobileCard)}</div>
                ) : (
                    <Table
                        columns={columns}
                        dataSource={attendanceData}
                        rowKey={(r) => r.id || `${r.employeeId}-${r.date}`}
                        pagination={{ pageSize: 15, showSizeChanger: true, showTotal: (total) => `${total} records` }}
                        size="middle"
                        scroll={{ x: 800 }}
                    />
                )}
            </Card>

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
                    <Row gutter={12}>
                        <Col span={12}>
                            <Form.Item name="date" label="Date" rules={[{ required: true, message: "Select a date" }]}>
                                <DatePicker style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="status" label="Status" rules={[{ required: true, message: "Select status" }]}>
                                <Select placeholder="Select status">
                                    {STATUS_OPTIONS.map(s => (
                                        <Option key={s.value} value={s.value}>
                                            <Space>{s.icon}{s.label}</Space>
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={12}>
                        <Col span={12}>
                            <Form.Item name="clockInTime" label="Clock In">
                                <TimePicker format="HH:mm" style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="clockOutTime" label="Clock Out">
                                <TimePicker format="HH:mm" style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                    </Row>
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
                    <Form.Item name="shopId" label="Shop ID" rules={[{ required: true, message: "Enter shop ID" }]}>
                        <InputNumber style={{ width: "100%" }} min={1} placeholder="Enter shop ID" />
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
                        background: "#f5f0ff",
                        padding: "10px 14px",
                        borderRadius: 8,
                        fontSize: 13,
                        color: "#7c3aed",
                        border: "1px solid #ede5ff",
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
