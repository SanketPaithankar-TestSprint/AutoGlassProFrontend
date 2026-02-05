import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCustomers } from "../../api/getCustomers";
import { createCustomer } from "../../api/createCustomer";
import { updateCustomer } from "../../api/updateCustomer";
import { deleteCustomer } from "../../api/deleteCustomer";
import { getOrganizations, deleteOrganization, createOrganization, updateOrganization, getOrganizationById } from "../../api/organizationApi";
import { getValidToken } from "../../api/getValidToken";
import { TeamOutlined, EditOutlined, PlusOutlined, DeleteOutlined, ShopOutlined, UserOutlined, FilterOutlined } from "@ant-design/icons";
import { Modal, Form, Input, Button, notification, Tabs, Popconfirm, Tag, Empty } from "antd";
import { getProfile } from "../../api/getProfile";

// Imports for Filter/Layout
import DashboardLayout from "../Open/DashboardLayout";
import CustomerHeaderBar from "./CustomerHeaderBar";
import CustomerSidebarFilters from "./CustomerSidebarFilters";
import { applyCustomerFilters } from "./helpers/utils";

const CustomersRoot = () => {
    const queryClient = useQueryClient();
    const token = getValidToken();

    useEffect(() => {
        document.title = "APAI | Customers & Organizations";
    }, []);

    // ------------------- STATES ------------------- //
    const [activeTab, setActiveTab] = useState('individuals');

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRangeFilter, setDateRangeFilter] = useState('all');
    const [customDateRange, setCustomDateRange] = useState(null);
    const [hasVehicleFilter, setHasVehicleFilter] = useState(false);
    const [hasEmailFilter, setHasEmailFilter] = useState(false);
    const [taxExemptFilter, setTaxExemptFilter] = useState(false);

    // View States
    const [viewMode, setViewMode] = useState('list');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

    // Sync sidebar state with mobile state
    useEffect(() => {
        setSidebarOpen(!isMobile);
    }, [isMobile]);

    // Modal States
    const [isCustomerModalVisible, setIsCustomerModalVisible] = useState(false);
    const [isOrgModalVisible, setIsOrgModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [saving, setSaving] = useState(false);

    const [customerForm] = Form.useForm();
    const [orgForm] = Form.useForm();

    // Resize Handler
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ------------------- QUERIES ------------------- //
    const { data: profile } = useQuery({
        queryKey: ['profile'],
        queryFn: async () => {
            const cached = localStorage.getItem("agp_profile_data");
            if (cached) return JSON.parse(cached);
            if (!token) return null;
            const res = await getProfile(token);
            localStorage.setItem("agp_profile_data", JSON.stringify(res));
            return res;
        }
    });

    const { data: customers = [], isLoading: loadingCustomers } = useQuery({
        queryKey: ['customers'],
        queryFn: async () => {
            if (!token) throw new Error("No token found. Please login.");
            const res = await getCustomers(token);
            return Array.isArray(res) ? res : [];
        },
        enabled: !!token
    });

    const { data: organizations = [], isLoading: loadingOrgs, refetch: refetchOrgs } = useQuery({
        queryKey: ['organizations'],
        queryFn: async () => {
            if (!token) throw new Error("No token found.");
            const basicOrgs = await getOrganizations();

            // Fetch details for each organization to get email/phone/address which are missing in list view
            if (Array.isArray(basicOrgs) && basicOrgs.length > 0) {
                const detailedOrgs = await Promise.all(
                    basicOrgs.map(async (org) => {
                        try {
                            const details = await getOrganizationById(org.organizationId);
                            // Merge basic info with details (details usually contain everything, but safe to merge)
                            return { ...org, ...details };
                        } catch (err) {
                            console.error(`Failed to fetch details for org ID ${org.organizationId}`, err);
                            return org; // Return basic info if details fetch fails
                        }
                    })
                );
                return detailedOrgs;
            }

            return [];
        },
        enabled: !!token
    });

    // ------------------- FILTER LOGIC ------------------- //
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (dateRangeFilter !== 'all') count++;
        if (hasVehicleFilter) count++;
        if (hasEmailFilter) count++;
        if (taxExemptFilter) count++;
        return count;
    }, [dateRangeFilter, hasVehicleFilter, hasEmailFilter, taxExemptFilter]);

    const handleClearAllFilters = () => {
        setSearchTerm('');
        setDateRangeFilter('all');
        setCustomDateRange(null);
        setHasVehicleFilter(false);
        setHasEmailFilter(false);
        setTaxExemptFilter(false);
    };

    // Phone number formatting helper
    const formatPhoneNumber = (value) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length === 0) return '';
        if (cleaned.length <= 3) return `(${cleaned}`;
        if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    };

    const handlePhoneChange = (e, form) => {
        const { value } = e.target;
        const formatted = formatPhoneNumber(value);
        form.setFieldValue('phone', formatted);
    };

    const filters = {
        searchTerm,
        dateRange: dateRangeFilter,
        customStartDate: customDateRange?.[0]?.toDate?.() || customDateRange?.[0],
        customEndDate: customDateRange?.[1]?.toDate?.() || customDateRange?.[1],
        hasVehicle: hasVehicleFilter,
        hasEmail: hasEmailFilter,
        taxExempt: taxExemptFilter
    };

    const filteredCustomers = useMemo(() => applyCustomerFilters(customers, filters), [customers, filters]);
    const filteredOrgs = useMemo(() => applyCustomerFilters(organizations, filters), [organizations, filters]);


    // ------------------- HANDLERS ------------------- //
    // Customer
    const handleAddCustomer = () => {
        setEditingItem(null);
        customerForm.resetFields();
        setIsCustomerModalVisible(true);
    };
    const handleEditCustomer = (c) => {
        setEditingItem(c);
        customerForm.setFieldsValue({ ...c, vehicle: null });
        setIsCustomerModalVisible(true);
    };
    const handleDeleteCustomer = async (id) => {
        try {
            await deleteCustomer(token, id);
            notification.success({ message: "Customer deleted successfully" });
            queryClient.invalidateQueries({ queryKey: ['customers'] });
        } catch (err) {
            notification.error({ message: "Failed to delete customer", description: err.message });
        }
    };
    const handleSaveCustomer = async () => {
        try {
            const values = await customerForm.validateFields();
            setSaving(true);
            const userId = profile?.userId || (JSON.parse(localStorage.getItem("agp_profile_data") || "{}").userId);
            if (!userId) throw new Error("User ID not found");
            const payload = { ...values, userId };

            if (editingItem) {
                await updateCustomer(token, editingItem.customerId, payload);
                notification.success({ message: "Customer updated" });
            } else {
                await createCustomer(token, payload);
                notification.success({ message: "Customer created" });
            }
            setIsCustomerModalVisible(false);
            queryClient.invalidateQueries({ queryKey: ['customers'] });
        } catch (err) {
            console.error(err);
            notification.error({ message: "Failed to save customer", description: err.message });
        } finally {
            setSaving(false);
        }
    };

    // Organization
    const handleAddOrg = () => {
        setEditingItem(null);
        orgForm.resetFields();
        setIsOrgModalVisible(true);
    };
    const handleEditOrg = (org) => {
        setEditingItem(org);
        orgForm.setFieldsValue(org);
        setIsOrgModalVisible(true);
    };
    const handleDeleteOrg = async (id) => {
        try {
            await deleteOrganization(id);
            notification.success({ message: "Organization deleted" });
            await queryClient.invalidateQueries({ queryKey: ['organizations'] });
            refetchOrgs();
        } catch (err) {
            notification.error({ message: "Failed to delete organization", description: err.message });
        }
    };
    const handleSaveOrg = async () => {
        try {
            const values = await orgForm.validateFields();
            setSaving(true);
            if (editingItem) {
                const payload = { ...values, userId: editingItem.userId };
                await updateOrganization(editingItem.organizationId, payload);
                notification.success({ message: "Organization updated" });
            } else {
                await createOrganization(values);
                notification.success({ message: "Organization created" });
            }
            setIsOrgModalVisible(false);
            await queryClient.invalidateQueries({ queryKey: ['organizations'] });
            refetchOrgs();
        } catch (err) {
            console.error(err);
            notification.error({ message: "Failed to save organization", description: err.message });
        } finally {
            setSaving(false);
        }
    };


    // ------------------- UI COMPONENTS ------------------- //
    const renderCustomersTable = () => {
        // Show card layout for medium and small devices
        if (isMobile) {
            return (
                <div className="space-y-3">
                    {filteredCustomers.length === 0 ? (
                        <Empty description="No customers found" className="py-12" />
                    ) : (
                        filteredCustomers.map((c) => (
                            <div key={c.customerId || Math.random()} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-gray-900 text-base truncate">{c.firstName} {c.lastName}</div>
                                        <div className="text-sm text-gray-500 truncate">{c.email || "-"}</div>
                                    </div>
                                    <div className="flex gap-2 ml-2">
                                        <Button type="text" size="small" className="text-violet-600 bg-violet-50 hover:bg-violet-100" icon={<EditOutlined />} onClick={() => handleEditCustomer(c)} />
                                        <Popconfirm title="Delete?" onConfirm={() => handleDeleteCustomer(c.customerId)} okText="Yes" cancelText="No">
                                            <Button type="text" size="small" danger className="bg-red-50 hover:bg-red-100" icon={<DeleteOutlined />} />
                                        </Popconfirm>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <ShopOutlined className="text-gray-400" />
                                    <span className="truncate">{c.phone || "-"}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            );
        }

        // Desktop table layout
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                {filteredCustomers.length === 0 ? (
                    <Empty description="No customers found" className="py-12" />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-100">
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider pl-6">Name</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right pr-6">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredCustomers.map((c) => (
                                    <tr key={c.customerId || Math.random()} className="hover:bg-violet-50/50 transition-colors group">
                                        <td className="p-4 pl-6 text-sm font-semibold text-gray-900">{c.firstName} {c.lastName}</td>
                                        <td className="p-4 text-sm text-gray-600">{c.email || "-"}</td>
                                        <td className="p-4 text-sm text-gray-600">{c.phone || "-"}</td>
                                        <td className="p-4 text-right pr-6">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button type="text" size="small" className="text-violet-600 hover:bg-violet-100" icon={<EditOutlined />} onClick={() => handleEditCustomer(c)} />
                                                <Popconfirm title="Delete?" onConfirm={() => handleDeleteCustomer(c.customerId)} okText="Yes" cancelText="No">
                                                    <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                                                </Popconfirm>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };

    const renderOrganizationsTable = () => {
        if (isMobile) {
            return (
                <div className="space-y-3">
                    {filteredOrgs.length === 0 ? (
                        <Empty description="No organizations found" className="py-12" />
                    ) : (
                        filteredOrgs.map((org) => (
                            <div key={org.organizationId} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-gray-900 text-base truncate">
                                            {org.companyName}
                                            {org.taxExempt && <Tag color="green" className="ml-2 text-[10px]">Tax Exempt</Tag>}
                                        </div>
                                        <div className="text-sm text-gray-500 truncate">{org.email || "-"}</div>
                                    </div>
                                    <div className="flex gap-2 ml-2">
                                        <Button type="text" size="small" className="text-violet-600 bg-violet-50 hover:bg-violet-100" icon={<EditOutlined />} onClick={() => handleEditOrg(org)} />
                                        <Popconfirm title="Delete?" onConfirm={() => handleDeleteOrg(org.organizationId)} okText="Yes" cancelText="No">
                                            <Button type="text" size="small" danger className="bg-red-50 hover:bg-red-100" icon={<DeleteOutlined />} />
                                        </Popconfirm>
                                    </div>
                                </div>
                                <div className="space-y-1 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <ShopOutlined className="text-gray-400 flex-shrink-0" />
                                        <span className="truncate">{[org.city, org.state].filter(Boolean).join(", ") || "-"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400 text-xs flex-shrink-0">Ph:</span>
                                        <span className="truncate">{org.phone || "-"}</span>
                                    </div>
                                    {org.taxId && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400 text-xs flex-shrink-0">Tax ID:</span>
                                            <span className="font-mono truncate">{org.taxId}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            );
        }

        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                {filteredOrgs.length === 0 ? (
                    <Empty description="No organizations found" className="py-12" />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-100">
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider pl-6">Company Name</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Tax ID</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right pr-6">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredOrgs.map((org) => (
                                    <tr key={org.organizationId} className="hover:bg-violet-50/50 transition-colors group">
                                        <td className="p-4 pl-6 text-sm font-semibold text-gray-900">
                                            {org.companyName}
                                            {org.taxExempt && <Tag color="green" className="ml-2">Tax Exempt</Tag>}
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {org.email || org.companyEmail || org.contactEmail || "-"}
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {org.phone || org.companyPhone || org.contactPhone || org.phoneNumber || "-"}
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {[org.city, org.state].filter(Boolean).join(", ") || "-"}
                                        </td>
                                        <td className="p-4 text-sm text-gray-600 font-mono">{org.taxId || "-"}</td>
                                        <td className="p-4 text-right pr-6">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button type="text" size="small" className="text-violet-600 hover:bg-violet-100" icon={<EditOutlined />} onClick={() => handleEditOrg(org)} />
                                                <Popconfirm title="Delete?" onConfirm={() => handleDeleteOrg(org.organizationId)} okText="Yes" cancelText="No">
                                                    <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                                                </Popconfirm>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };

    // Sidebar Content
    const sidebarContent = (
        <CustomerSidebarFilters
            dateRangeFilter={dateRangeFilter}
            setDateRangeFilter={setDateRangeFilter}
            customDateRange={customDateRange}
            setCustomDateRange={setCustomDateRange}
            hasVehicleFilter={hasVehicleFilter}
            setHasVehicleFilter={setHasVehicleFilter}
            hasEmailFilter={hasEmailFilter}
            setHasEmailFilter={setHasEmailFilter}
            taxExemptFilter={taxExemptFilter}
            setTaxExemptFilter={setTaxExemptFilter}
            onClearAll={handleClearAllFilters}
            activeFilterCount={activeFilterCount}
        />
    );
    return (
        <DashboardLayout
            sidebar={sidebarContent}
            isMobile={isMobile}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
        >
            <div className="min-h-screen bg-slate-50">
                <CustomerHeaderBar
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    onOpenFilters={() => setSidebarOpen(!sidebarOpen)}
                    sidebarOpen={sidebarOpen}
                />

                <div className="p-6">
                    {/* Add Button Section */}
                    <div className="flex justify-between items-center mb-6">
                        <div className="text-sm text-slate-600">
                            Showing {activeTab === 'individuals' ? filteredCustomers.length : filteredOrgs.length} results
                        </div>
                        <div>
                            {activeTab === 'individuals' ? (
                                <button
                                    onClick={handleAddCustomer}
                                    className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
                                >
                                    <PlusOutlined /> Add Customer
                                </button>
                            ) : (
                                <button
                                    onClick={handleAddOrg}
                                    className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
                                >
                                    <PlusOutlined /> Add Organization
                                </button>
                            )}
                        </div>
                    </div>

                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        items={[
                            {
                                key: 'individuals',
                                label: <span className="flex items-center gap-2"><UserOutlined /> Individual Customers</span>,
                                children: renderCustomersTable(),
                            },
                            {
                                key: 'organizations',
                                label: <span className="flex items-center gap-2"><ShopOutlined /> Organizations</span>,
                                children: renderOrganizationsTable(),
                            },
                        ]}
                        className="custom-tabs"
                        type="card"
                    />
                </div>

                {/* Modals */}
                <Modal title={editingItem ? "Edit Customer" : "Add Customer"} open={isCustomerModalVisible} onOk={handleSaveCustomer} onCancel={() => setIsCustomerModalVisible(false)} confirmLoading={saving} okText="Save" centered>
                    <Form form={customerForm} layout="vertical" className="mt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}><Input /></Form.Item>
                            <Form.Item name="lastName" label="Last Name"><Input /></Form.Item>
                        </div>
                        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
                        <Form.Item name="phone" label="Phone" rules={[{ required: true, message: 'Phone is required' }]}>
                            <Input
                                placeholder="(XXX) XXX-XXXX"
                                onChange={(e) => handlePhoneChange(e, customerForm)}
                                maxLength={14}
                            />
                        </Form.Item>
                        <div className="border-t pt-4 mt-2">
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Address</h4>
                            <Form.Item name="addressLine1" label="Address Line 1"><Input /></Form.Item>
                            <div className="grid grid-cols-2 gap-4">
                                <Form.Item name="city" label="City"><Input /></Form.Item>
                                <Form.Item name="state" label="State"><Input /></Form.Item>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Form.Item name="postalCode" label="Zip Code"><Input /></Form.Item>
                                <Form.Item name="country" label="Country"><Input /></Form.Item>
                            </div>
                        </div>
                    </Form>
                </Modal>

                <Modal title={editingItem ? "Edit Organization" : "Add Organization"} open={isOrgModalVisible} onOk={handleSaveOrg} onCancel={() => setIsOrgModalVisible(false)} confirmLoading={saving} okText="Save" centered width={700}>
                    <Form form={orgForm} layout="vertical" className="mt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item name="companyName" label="Company Name" rules={[{ required: true }]}><Input /></Form.Item>
                            <Form.Item name="contactName" label="Contact Name"><Input /></Form.Item>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item name="taxId" label="Tax ID"><Input /></Form.Item>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}><Input /></Form.Item>
                            <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
                                <Input
                                    placeholder="(XXX) XXX-XXXX"
                                    onChange={(e) => handlePhoneChange(e, orgForm)}
                                    maxLength={14}
                                />
                            </Form.Item>
                        </div>
                        <div className="border-t pt-4 mt-2">
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Address</h4>
                            <Form.Item name="addressLine1" label="Address Line 1"><Input /></Form.Item>
                            <Form.Item name="addressLine2" label="Address Line 2"><Input /></Form.Item>
                            <div className="grid grid-cols-3 gap-4">
                                <Form.Item name="city" label="City"><Input /></Form.Item>
                                <Form.Item name="state" label="State"><Input /></Form.Item>
                                <Form.Item name="postalCode" label="Zip"><Input /></Form.Item>
                            </div>
                            <Form.Item name="country" label="Country"><Input /></Form.Item>
                        </div>
                    </Form>
                </Modal>
            </div>

            <style>{`
                .custom-tabs .ant-tabs-nav {
                    margin-bottom: 24px;
                }
                .custom-tabs .ant-tabs-tab {
                    padding: 8px 16px !important;
                }
            `}</style>
        </DashboardLayout>
    );
};

export default CustomersRoot;
