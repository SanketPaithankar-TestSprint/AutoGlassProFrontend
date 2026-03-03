import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getCustomers } from "../../api/getCustomers";
import { createCustomer } from "../../api/createCustomer";
import { updateCustomer } from "../../api/updateCustomer";
import { deleteCustomer } from "../../api/deleteCustomer";

import { getOrganizations, createOrganization, updateOrganization, getOrganizationById, deleteOrganization } from "../../api/organizationApi";
import { getValidToken } from "../../api/getValidToken";
import { TeamOutlined, EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined, MinusCircleOutlined, ShopOutlined, UserOutlined, FilterOutlined } from "@ant-design/icons";
import { Modal, Form, Input, Button, notification, Tabs, Tag, Empty, Pagination, Spin, Descriptions } from "antd";
import { getProfile } from "../../api/getProfile";

// Imports for Filter/Layout
import DashboardLayout from "../Open/DashboardLayout";
import CustomerHeaderBar from "./CustomerHeaderBar";
import CustomerSidebarFilters from "./CustomerSidebarFilters";
import { applyCustomerFilters } from "./helpers/utils";

const CustomersRoot = () => {
    const queryClient = useQueryClient();
    const token = getValidToken();
    const { t } = useTranslation();

    useEffect(() => {
        document.title = `APAI | ${t('customers.title')}`;
    }, [t]);

    // ------------------- STATES ------------------- //
    const [activeTab, setActiveTab] = useState('individuals');

    // Pagination States
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(50);
    const [totalCustomers, setTotalCustomers] = useState(0);

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
    const [modal, contextHolder] = Modal.useModal();

    // Organization detail view state
    const [orgDetailVisible, setOrgDetailVisible] = useState(false);
    const [orgDetailData, setOrgDetailData] = useState(null);
    const [orgDetailLoading, setOrgDetailLoading] = useState(false);

    // Customer detail view state
    const [customerDetailVisible, setCustomerDetailVisible] = useState(false);
    const [customerDetailData, setCustomerDetailData] = useState(null);

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
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
    });

    const { data: customers = [], isLoading: loadingCustomers } = useQuery({
        queryKey: ['customers', currentPage, pageSize],
        queryFn: async () => {
            if (!token) throw new Error("No token found. Please login.");
            const res = await getCustomers(token, { page: currentPage, size: pageSize });
            // Handle Spring Boot Page response
            if (res && res.content) {
                setTotalCustomers(res.totalElements || 0);
                return Array.isArray(res.content) ? res.content : [];
            }
            // Fallback for non-paginated response
            if (Array.isArray(res)) {
                setTotalCustomers(res.length);
                return res;
            }
            return [];
        },
        enabled: !!token,
        keepPreviousData: true,
        staleTime: 5 * 60 * 1000, // 5 minutes — only refetch on create/edit/delete
        refetchOnWindowFocus: false,
    });

    const { data: organizations = [], isLoading: loadingOrgs, refetch: refetchOrgs } = useQuery({
        queryKey: ['organizations'],
        queryFn: async () => {
            if (!token) throw new Error("No token found.");
            const orgs = await getOrganizations();
            return Array.isArray(orgs) ? orgs : [];
        },
        enabled: !!token,
        staleTime: 5 * 60 * 1000, // 5 minutes — only refetch on create/edit/delete
        refetchOnWindowFocus: false,
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
        setCurrentPage(0);
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
    const handleViewCustomerDetails = (c) => {
        setCustomerDetailVisible(true);
        setCustomerDetailData(c);
    };

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

    const handleSaveCustomer = async () => {
        try {
            const values = await customerForm.validateFields();
            setSaving(true);
            const userId = profile?.userId || (JSON.parse(localStorage.getItem("agp_profile_data") || "{}").userId);
            if (!userId) throw new Error("User ID not found");
            const payload = { ...values, userId };

            if (editingItem) {
                await updateCustomer(token, editingItem.customerId, payload);
                notification.success({ message: t('customers.customerUpdated') });
            } else {
                await createCustomer(token, payload);
                notification.success({ message: t('customers.customerCreated') });
            }
            setIsCustomerModalVisible(false);
            queryClient.invalidateQueries({ queryKey: ['customers'] });
        } catch (err) {
            console.error(err);
            notification.error({ message: t('customers.failedToSaveCustomer'), description: err.message });
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
    const handleEditOrg = async (org) => {
        setOrgDetailLoading(true);
        try {
            const details = await getOrganizationById(org.organizationId);
            const fullOrg = { ...org, ...details };
            setEditingItem(fullOrg);
            orgForm.setFieldsValue(fullOrg);
            setIsOrgModalVisible(true);
        } catch (err) {
            setEditingItem(org);
            orgForm.setFieldsValue(org);
            setIsOrgModalVisible(true);
        } finally {
            setOrgDetailLoading(false);
        }
    };

    const handleViewOrgDetails = async (org) => {
        setOrgDetailVisible(true);
        setOrgDetailData(null);
        setOrgDetailLoading(true);
        try {
            const details = await getOrganizationById(org.organizationId);
            setOrgDetailData({ ...org, ...details });
        } catch (err) {
            notification.error({ message: 'Failed to load organization details' });
            setOrgDetailVisible(false);
        } finally {
            setOrgDetailLoading(false);
        }
    };

    const handleSaveOrg = async () => {
        try {
            const values = await orgForm.validateFields();
            setSaving(true);
            if (editingItem) {
                const payload = {
                    ...values,
                    userId: editingItem.userId,
                    contacts: values.contacts || editingItem.contacts || [],
                    contactName: values.contactName || ""
                };

                // Remove deprecated fields if they exist in values
                delete payload.city;
                delete payload.state;
                delete payload.addressLine2;

                await updateOrganization(editingItem.organizationId, payload);
                notification.success({ message: t('customers.organizationUpdated') });
            } else {
                // For new organization
                const payload = {
                    ...values,
                    contacts: [],
                    contactName: values.contactName || ""
                };

                // Remove deprecated fields if they exist in values
                delete payload.city;
                delete payload.state;
                delete payload.addressLine2;

                await createOrganization(payload);
                notification.success({ message: t('customers.organizationCreated') });
            }
            setIsOrgModalVisible(false);
            await queryClient.invalidateQueries({ queryKey: ['organizations'] });
            refetchOrgs();
        } catch (err) {
            console.error(err);
            notification.error({ message: t('customers.failedToSaveOrganization'), description: err.message });
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteCustomer = (customer) => {
        modal.confirm({
            title: 'Delete Customer',
            content: `Are you sure you want to delete ${customer.firstName || ''} ${customer.lastName || ''}? This action cannot be undone.`,
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                await performDeleteCustomer(customer.customerId, false, customer);
            }
        });
    };

    const performDeleteCustomer = async (id, force, customer) => {
        try {
            const res = await deleteCustomer(token, id, force);
            if (res && res.requiresConfirmation) {
                modal.confirm({
                    title: 'This customer is linked to existing documents',
                    content: (
                        <div>
                            <p className="mb-2 text-red-600">This customer cannot be removed because they are linked to the following documents:</p>
                            {res.associatedDocuments && res.associatedDocuments.length > 0 && (
                                <ul className="list-disc pl-5 mb-2 text-gray-600 text-sm max-h-32 overflow-y-auto">
                                    {res.associatedDocuments.map(doc => <li key={doc}>{doc}</li>)}
                                </ul>
                            )}
                            <p className="font-semibold">Would you like to remove the customer anyway? The customer will be unlinked from these documents.</p>
                        </div>
                    ),
                    okText: 'Yes, Delete Anyway',
                    okType: 'danger',
                    cancelText: 'Cancel',
                    width: 500,
                    onOk: async () => {
                        await performDeleteCustomer(id, true, customer);
                    }
                });
            } else if (res && res.success) {
                notification.success({ message: 'Customer deleted successfully' });
                queryClient.invalidateQueries({ queryKey: ['customers'] });
            } else {
                throw new Error("Failed to delete");
            }
        } catch (err) {
            notification.error({ message: 'Failed to delete customer', description: err.message });
        }
    };

    const handleDeleteOrg = (org) => {
        modal.confirm({
            title: 'Delete Organization',
            content: `Are you sure you want to delete "${org.companyName || ''}"? This action cannot be undone.`,
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                await performDeleteOrg(org.organizationId, false);
            }
        });
    };

    const performDeleteOrg = async (id, force) => {
        try {
            const res = await deleteOrganization(id, force);
            if (res && res.requiresConfirmation) {
                modal.confirm({
                    title: 'This organization is linked to existing documents',
                    content: (
                        <div>
                            <p className="mb-2 text-red-600">This organization cannot be removed because it is linked to the following documents:</p>
                            {res.associatedDocuments && res.associatedDocuments.length > 0 && (
                                <ul className="list-disc pl-5 mb-2 text-gray-600 text-sm max-h-32 overflow-y-auto">
                                    {res.associatedDocuments.map(doc => <li key={doc}>{doc}</li>)}
                                </ul>
                            )}
                            <p className="font-semibold">Would you like to remove the organization anyway? It will be unlinked from these documents.</p>
                        </div>
                    ),
                    okText: 'Yes, Delete Anyway',
                    okType: 'danger',
                    cancelText: 'Cancel',
                    width: 500,
                    onOk: async () => {
                        await performDeleteOrg(id, true);
                    }
                });
            } else if (res && res.success) {
                notification.success({ message: 'Organization deleted successfully' });
                await queryClient.invalidateQueries({ queryKey: ['organizations'] });
                refetchOrgs();
            } else {
                throw new Error(res?.message || "Failed to delete");
            }
        } catch (err) {
            notification.error({ message: 'Failed to delete organization', description: err.message });
        }
    };


    // ------------------- UI COMPONENTS ------------------- //
    const renderCustomersTable = () => {
        // Show card layout for medium and small devices
        if (isMobile) {
            return (
                <div className="space-y-3">
                    {filteredCustomers.length === 0 ? (
                        <Empty description={t('customers.noCustomersFound')} className="py-12" />
                    ) : (
                        filteredCustomers.map((c) => (
                            <div key={c.customerId || Math.random()} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-gray-900 text-base truncate">{c.firstName} {c.lastName}</div>
                                        <div className="text-xs text-gray-500 mt-1">{c.email || "No Email"} | {c.phone || "No Phone"}</div>
                                    </div>
                                    <div className="flex gap-2 ml-2">
                                        <Button type="text" size="small" className="text-blue-600 bg-blue-50 hover:bg-blue-100" icon={<EyeOutlined />} onClick={() => handleViewCustomerDetails(c)} />
                                        <Button type="text" size="small" className="text-violet-600 bg-violet-50 hover:bg-violet-100" icon={<EditOutlined />} onClick={() => handleEditCustomer(c)} />
                                        <Button type="text" size="small" danger className="bg-red-50 hover:bg-red-100" icon={<DeleteOutlined />} onClick={() => handleDeleteCustomer(c)} />
                                    </div>
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
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider pl-6">{t('customers.name')}</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('customers.email')}</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">{t('customers.phone')}</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right pr-6">{t('common.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredCustomers.map((c) => (
                                    <tr key={c.customerId || Math.random()} className="hover:bg-violet-50/50 transition-colors group">
                                        <td className="p-4 pl-6 text-sm font-semibold text-gray-900">{c.firstName} {c.lastName}</td>
                                        <td className="p-4 text-sm text-gray-600">{c.email || "-"}</td>
                                        <td className="p-4 text-sm text-gray-600 font-mono">{c.phone || "-"}</td>
                                        <td className="p-4 text-right pr-6">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button type="text" size="small" className="text-blue-600 hover:bg-blue-50" icon={<EyeOutlined />} onClick={() => handleViewCustomerDetails(c)} />
                                                <Button type="text" size="small" className="text-violet-600 hover:bg-violet-100" icon={<EditOutlined />} onClick={() => handleEditCustomer(c)} />
                                                <Button type="text" size="small" danger className="hover:bg-red-50" icon={<DeleteOutlined />} onClick={() => handleDeleteCustomer(c)} />
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
                        <Empty description={t('customers.noOrganizationsFound')} className="py-12" />
                    ) : (
                        filteredOrgs.map((org) => (
                            <div key={org.organizationId} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-gray-900 text-base truncate">
                                            {org.companyName}
                                            {org.taxExempt && <Tag color="green" className="ml-2 text-[10px]">{t('customers.taxExempt')}</Tag>}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 ml-2">
                                        <Button type="text" size="small" className="text-blue-600 bg-blue-50 hover:bg-blue-100" icon={<EyeOutlined />} onClick={() => handleViewOrgDetails(org)} />
                                        <Button type="text" size="small" className="text-violet-600 bg-violet-50 hover:bg-violet-100" icon={<EditOutlined />} onClick={() => handleEditOrg(org)} />
                                        <Button type="text" size="small" danger className="bg-red-50 hover:bg-red-100" icon={<DeleteOutlined />} onClick={() => handleDeleteOrg(org)} />
                                    </div>
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
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider pl-6">{t('customers.companyName')}</th>
                                    <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right pr-6">{t('common.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredOrgs.map((org) => (
                                    <tr key={org.organizationId} className="hover:bg-violet-50/50 transition-colors group">
                                        <td className="p-4 pl-6 text-sm font-semibold text-gray-900">
                                            {org.companyName}
                                            {org.taxExempt && <Tag color="green" className="ml-2">{t('customers.taxExempt')}</Tag>}
                                        </td>
                                        <td className="p-4 text-right pr-6">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button type="text" size="small" className="text-blue-600 hover:bg-blue-50" icon={<EyeOutlined />} onClick={() => handleViewOrgDetails(org)} />
                                                <Button type="text" size="small" className="text-violet-600 hover:bg-violet-100" icon={<EditOutlined />} onClick={() => handleEditOrg(org)} />
                                                <Button type="text" size="small" danger className="hover:bg-red-50" icon={<DeleteOutlined />} onClick={() => handleDeleteOrg(org)} />
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
            {contextHolder}
            <div className="min-h-screen bg-slate-100">
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
                            {t('common.showing')} {activeTab === 'individuals' ? `${filteredCustomers.length} ${t('common.of')} ${totalCustomers}` : filteredOrgs.length} {t('common.results')}
                        </div>
                        <div>
                            {activeTab === 'individuals' ? (
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={handleAddCustomer}
                                    className="bg-gradient-to-r from-violet-600 to-indigo-600 border-0 hover:from-violet-500 hover:to-indigo-500 shadow-md"
                                >
                                    {t('customers.addCustomer')}
                                </Button>
                            ) : (
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={handleAddOrg}
                                    className="bg-gradient-to-r from-violet-600 to-indigo-600 border-0 hover:from-violet-500 hover:to-indigo-500 shadow-md"
                                >
                                    {t('customers.addOrganization')}
                                </Button>
                            )}
                        </div>
                    </div>

                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        items={[
                            {
                                key: 'individuals',
                                label: <span className="flex items-center gap-2"><UserOutlined /> {t('customers.individualCustomers')}</span>,
                                children: (
                                    <>
                                        {renderCustomersTable()}
                                        {totalCustomers > pageSize && (
                                            <div className="flex justify-center mt-6">
                                                <Pagination
                                                    current={currentPage + 1}
                                                    pageSize={pageSize}
                                                    total={totalCustomers}
                                                    onChange={(page, size) => {
                                                        setCurrentPage(page - 1);
                                                        setPageSize(size);
                                                    }}
                                                    showSizeChanger
                                                    pageSizeOptions={['25', '50', '100']}
                                                    showTotal={(total, range) => `${range[0]}-${range[1]} ${t('common.of')} ${total}`}
                                                />
                                            </div>
                                        )}
                                    </>
                                ),
                            },
                            {
                                key: 'organizations',
                                label: <span className="flex items-center gap-2"><ShopOutlined /> {t('customers.organizations')}</span>,
                                children: renderOrganizationsTable(),
                            },
                        ]}
                        className="custom-tabs"
                        type="card"
                    />
                </div>

                {/* Modals */}
                <Modal title={editingItem ? t('customers.editCustomer') : t('customers.addCustomer')} open={isCustomerModalVisible} onOk={handleSaveCustomer} onCancel={() => setIsCustomerModalVisible(false)} confirmLoading={saving} okText={t('common.save')} cancelText={t('common.cancel')} centered>
                    <Form form={customerForm} layout="vertical" className="mt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item name="firstName" label={t('customers.firstName')} rules={[{ required: true }]}><Input /></Form.Item>
                            <Form.Item name="lastName" label={t('customers.lastName')}><Input /></Form.Item>
                        </div>
                        <Form.Item name="email" label={t('customers.email')} rules={[{ type: 'email' }]}><Input /></Form.Item>
                        <Form.Item name="phone" label={t('customers.phone')} rules={[{ required: true, message: t('common.phoneRequired') }]}>
                            <Input
                                placeholder="(XXX) XXX-XXXX"
                                onChange={(e) => handlePhoneChange(e, customerForm)}
                                maxLength={14}
                            />
                        </Form.Item>
                        <div className="border-t pt-4 mt-2">
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">{t('customers.address')}</h4>
                            <Form.Item name="addressLine1" label={t('customers.addressLine1')}><Input /></Form.Item>
                            <div className="grid grid-cols-2 gap-4">
                                <Form.Item name="city" label={t('customers.city')}><Input /></Form.Item>
                                <Form.Item name="state" label={t('customers.state')}><Input /></Form.Item>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Form.Item name="postalCode" label={t('customers.zipCode')}><Input /></Form.Item>
                                <Form.Item name="country" label={t('customers.country')}><Input /></Form.Item>
                            </div>
                        </div>
                    </Form>
                </Modal>

                <Modal title={editingItem ? t('customers.editOrganization') : t('customers.addOrganization')} open={isOrgModalVisible} onOk={handleSaveOrg} onCancel={() => setIsOrgModalVisible(false)} confirmLoading={saving} okText={t('common.save')} cancelText={t('common.cancel')} centered width={700}>
                    <Form form={orgForm} layout="vertical" className="mt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item name="companyName" label={t('customers.companyName')} rules={[{ required: true }]}><Input /></Form.Item>
                            <Form.Item name="contactName" label={t('customers.contactName')}><Input /></Form.Item>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item name="taxId" label={t('customers.taxId')}><Input /></Form.Item>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Form.Item name="email" label={t('customers.email')} rules={[{ type: 'email' }]}><Input /></Form.Item>
                            <Form.Item name="phone" label={t('customers.phone')} rules={[{ required: true }]}>
                                <Input
                                    placeholder="(XXX) XXX-XXXX"
                                    onChange={(e) => handlePhoneChange(e, orgForm)}
                                    maxLength={14}
                                />
                            </Form.Item>
                        </div>
                        <div className="border-t pt-4 mt-2">
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">{t('customers.address')}</h4>
                            <Form.Item name="addressLine1" label={t('customers.addressLine1')}><Input /></Form.Item>
                            <div className="grid grid-cols-2 gap-4">
                                <Form.Item name="postalCode" label={t('customers.zipCode')}><Input /></Form.Item>
                                <Form.Item name="country" label={t('customers.country')}><Input /></Form.Item>
                            </div>
                        </div>

                        {/* Contacts Section - only show when editing */}
                        {editingItem && (
                            <div className="border-t pt-4 mt-2">
                                <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Contact Persons</h4>
                                <Form.List name="contacts">
                                    {(fields, { add, remove }) => (
                                        <>
                                            {fields.map(({ key, name, ...restField }) => (
                                                <div key={key} className="flex items-start gap-2 mb-3 p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex-1 grid grid-cols-3 gap-2">
                                                        <Form.Item {...restField} name={[name, 'name']} className="mb-0" rules={[{ required: true, message: 'Name required' }]}>
                                                            <Input placeholder="Name" size="small" />
                                                        </Form.Item>
                                                        <Form.Item {...restField} name={[name, 'phone']} className="mb-0">
                                                            <Input placeholder="Phone" size="small" />
                                                        </Form.Item>
                                                        <Form.Item {...restField} name={[name, 'email']} className="mb-0" rules={[{ type: 'email', message: 'Invalid email' }]}>
                                                            <Input placeholder="Email" size="small" />
                                                        </Form.Item>
                                                    </div>
                                                    <Form.Item {...restField} name={[name, 'id']} hidden><Input /></Form.Item>
                                                    <Button type="text" danger icon={<MinusCircleOutlined />} onClick={() => remove(name)} className="mt-0.5" size="small" />
                                                </div>
                                            ))}
                                            <Button type="dashed" onClick={() => add({ id: crypto.randomUUID(), name: '', phone: '', email: '' })} block icon={<PlusOutlined />} size="small">
                                                Add Contact
                                            </Button>
                                        </>
                                    )}
                                </Form.List>
                            </div>
                        )}
                    </Form>
                </Modal>

                {/* Organization Detail View Modal */}
                <Modal
                    title={orgDetailData ? orgDetailData.companyName : "Organization Details"}
                    open={orgDetailVisible}
                    onCancel={() => { setOrgDetailVisible(false); setOrgDetailData(null); }}
                    footer={null}
                    centered
                    width={700}
                >
                    {orgDetailLoading ? (
                        <div className="flex justify-center py-12"><Spin size="large" /></div>
                    ) : orgDetailData ? (
                        <div className="mt-4 space-y-5">
                            {/* Company Info */}
                            <Descriptions column={2} bordered size="small">
                                <Descriptions.Item label="Company Name" span={2}>
                                    <span className="font-semibold">{orgDetailData.companyName || "-"}</span>
                                    {orgDetailData.taxExempt && <Tag color="green" className="ml-2">Tax Exempt</Tag>}
                                </Descriptions.Item>
                                <Descriptions.Item label="Contact Name">{orgDetailData.contactName || "-"}</Descriptions.Item>
                                <Descriptions.Item label="Tax ID"><span className="font-mono">{orgDetailData.taxId || "-"}</span></Descriptions.Item>
                                <Descriptions.Item label="Email">{orgDetailData.email || "-"}</Descriptions.Item>
                                <Descriptions.Item label="Phone">{orgDetailData.phone || "-"}</Descriptions.Item>
                                {orgDetailData.alternatePhone && (
                                    <Descriptions.Item label="Alt. Phone" span={2}>{orgDetailData.alternatePhone}</Descriptions.Item>
                                )}
                            </Descriptions>

                            {/* Address */}
                            <Descriptions column={2} bordered size="small" title={<span className="text-xs font-bold text-gray-400 uppercase">Address</span>}>
                                <Descriptions.Item label="Address Line 1" span={2}>{orgDetailData.addressLine1 || "-"}</Descriptions.Item>
                                {orgDetailData.addressLine2 && (
                                    <Descriptions.Item label="Address Line 2" span={2}>{orgDetailData.addressLine2}</Descriptions.Item>
                                )}
                                <Descriptions.Item label="City">{orgDetailData.city || "-"}</Descriptions.Item>
                                <Descriptions.Item label="State">{orgDetailData.state || "-"}</Descriptions.Item>
                                <Descriptions.Item label="Postal Code">{orgDetailData.postalCode || "-"}</Descriptions.Item>
                                <Descriptions.Item label="Country">{orgDetailData.country || "-"}</Descriptions.Item>
                            </Descriptions>

                            {/* Notes */}
                            {orgDetailData.notes && (
                                <Descriptions column={1} bordered size="small">
                                    <Descriptions.Item label="Notes">{orgDetailData.notes}</Descriptions.Item>
                                </Descriptions>
                            )}

                            {/* Contacts */}
                            {orgDetailData.contacts && orgDetailData.contacts.length > 0 && (
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Contacts ({orgDetailData.contacts.length})</h4>
                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        <table className="w-full text-left text-sm">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-gray-200">
                                                    <th className="p-2.5 text-xs font-bold text-gray-500 uppercase">Name</th>
                                                    <th className="p-2.5 text-xs font-bold text-gray-500 uppercase">Phone</th>
                                                    <th className="p-2.5 text-xs font-bold text-gray-500 uppercase">Email</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {orgDetailData.contacts.map((contact) => (
                                                    <tr key={contact.id} className="hover:bg-gray-50">
                                                        <td className="p-2.5 font-medium text-gray-900">{contact.name || "-"}</td>
                                                        <td className="p-2.5 text-gray-600">{contact.phone || "-"}</td>
                                                        <td className="p-2.5 text-gray-600">{contact.email || "-"}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Timestamps */}
                            <div className="flex justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
                                <span>Created: {orgDetailData.createdAt ? new Date(orgDetailData.createdAt).toLocaleDateString() : "-"}</span>
                                <span>Last Updated: {orgDetailData.updatedAt ? new Date(orgDetailData.updatedAt).toLocaleDateString() : "-"}</span>
                            </div>
                        </div>
                    ) : null}
                </Modal>

                {/* Customer Detail View Modal */}
                <Modal
                    title={customerDetailData ? `${customerDetailData.firstName} ${customerDetailData.lastName}` : "Customer Details"}
                    open={customerDetailVisible}
                    onCancel={() => { setCustomerDetailVisible(false); setCustomerDetailData(null); }}
                    footer={null}
                    centered
                    width={700}
                >
                    {customerDetailData ? (
                        <div className="mt-4 space-y-5">
                            <Descriptions column={2} bordered size="small">
                                <Descriptions.Item label="Name" span={2}>
                                    <span className="font-semibold">{customerDetailData.firstName} {customerDetailData.lastName}</span>
                                </Descriptions.Item>
                                <Descriptions.Item label="Email">{customerDetailData.email || "-"}</Descriptions.Item>
                                <Descriptions.Item label="Phone" span={2}>{customerDetailData.phone || "-"}</Descriptions.Item>
                            </Descriptions>

                            <Descriptions column={2} bordered size="small" title={<span className="text-xs font-bold text-gray-400 uppercase">Address</span>}>
                                <Descriptions.Item label="Address Line 1" span={2}>{customerDetailData.addressLine1 || "-"}</Descriptions.Item>
                                <Descriptions.Item label="City">{customerDetailData.city || "-"}</Descriptions.Item>
                                <Descriptions.Item label="State">{customerDetailData.state || "-"}</Descriptions.Item>
                                <Descriptions.Item label="Postal Code">{customerDetailData.postalCode || "-"}</Descriptions.Item>
                                <Descriptions.Item label="Country">{customerDetailData.country || "-"}</Descriptions.Item>
                            </Descriptions>

                            <div className="flex justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
                                <span>Created: {customerDetailData.createdAt ? new Date(customerDetailData.createdAt).toLocaleDateString() : "-"}</span>
                            </div>
                        </div>
                    ) : null}
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
