import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { 
    TeamOutlined, 
    EditOutlined, 
    DeleteOutlined, 
    EyeOutlined, 
    PlusOutlined, 
    ShopOutlined,
    PhoneOutlined,
    ContainerOutlined,
    CalendarOutlined,
    InfoCircleOutlined
} from "@ant-design/icons";
import { 
    Modal, 
    Form, 
    Input, 
    Button, 
    Tag, 
    Empty, 
    Spin, 
    Descriptions, 
    notification,
    Card,
    Tooltip
} from "antd";
import dayjs from "dayjs";

// Components
import DashboardLayout from "../Open/DashboardLayout";
import VendorHeaderBar from "./VendorHeaderBar";
import { useVendors } from "./hooks/useVendors";

const VendorsRoot = () => {
    const { t } = useTranslation();
    const { 
        vendors, 
        isLoading, 
        createVendor, 
        updateVendor, 
        deleteVendor, 
        isSaving, 
        isDeleting 
    } = useVendors();

    useEffect(() => {
        document.title = `APAI | ${t('nav.vendorContacts') || 'Vendor Contacts'}`;
    }, [t]);

    // ------------------- STATES ------------------- //
    const [searchTerm, setSearchTerm] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    // Modal States
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form] = Form.useForm();
    const [modal, contextHolder] = Modal.useModal();

    // Detail view state
    const [detailVisible, setDetailVisible] = useState(false);
    const [detailData, setDetailData] = useState(null);

    // Resize Handler
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ------------------- FILTER LOGIC ------------------- //
    const filteredVendors = useMemo(() => {
        if (!searchTerm) return vendors;
        return vendors.filter(v => 
            v.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [vendors, searchTerm]);

    // Phone number formatting helper
    const formatPhoneNumber = (value) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length === 0) return '';
        if (cleaned.length <= 3) return `(${cleaned}`;
        if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    };

    const handlePhoneChange = (e) => {
        const { value } = e.target;
        const formatted = formatPhoneNumber(value);
        form.setFieldValue('phoneNumber', formatted);
    };

    // ------------------- HANDLERS ------------------- //
    const handleViewDetails = (v) => {
        setDetailData(v);
        setDetailVisible(true);
    };

    const handleAddVendor = () => {
        setEditingItem(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEditVendor = (v) => {
        setEditingItem(v);
        form.setFieldsValue(v);
        setIsModalVisible(true);
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            if (editingItem) {
                await updateVendor({ id: editingItem.id, data: { ...editingItem, ...values } });
            } else {
                await createVendor(values);
            }
            setIsModalVisible(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = (v) => {
        modal.confirm({
            title: t('vendors.deleteTitle') || 'Delete Vendor',
            content: t('vendors.deleteConfirm', { name: v.companyName }) || `Are you sure you want to delete "${v.companyName}"?`,
            okText: t('common.delete') || 'Delete',
            okType: 'danger',
            cancelText: t('common.cancel') || 'Cancel',
            onOk: async () => {
                try {
                    await deleteVendor(v.id);
                } catch (err) {
                    console.error(err);
                }
            }
        });
    };

    // ------------------- UI COMPONENTS ------------------- //
    const renderTable = () => {
        if (isLoading) return <div className="flex justify-center py-20"><Spin size="large" /></div>;

        if (filteredVendors.length === 0) {
            return (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-20 flex flex-col items-center justify-center">
                    <Empty description={t('vendors.noVendorsFound') || "No vendors found"} />
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        onClick={handleAddVendor}
                        className="mt-4 bg-violet-600 border-0"
                    >
                        {t('vendors.addFirst') || "Add Your First Vendor"}
                    </Button>
                </div>
            );
        }

        if (isMobile) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredVendors.map((v) => (
                        <Card 
                            key={v.id}
                            hoverable
                            className="rounded-xl border-gray-100 shadow-sm transition-all hover:shadow-md group overflow-hidden"
                            actions={[
                                <Tooltip title={t('common.view')} key="view">
                                    <EyeOutlined className="text-blue-500 hover:text-blue-600" onClick={() => handleViewDetails(v)} />
                                </Tooltip>,
                                <Tooltip title={t('common.edit')} key="edit">
                                    <EditOutlined className="text-violet-500 hover:text-violet-600" onClick={() => handleEditVendor(v)} />
                                </Tooltip>,
                                <Tooltip title={t('common.delete')} key="delete">
                                    <DeleteOutlined className="text-red-500 hover:text-red-600" onClick={() => handleDelete(v)} />
                                </Tooltip>
                            ]}
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600 shrink-0 group-hover:bg-violet-100 transition-colors">
                                    <ShopOutlined style={{ fontSize: '1.5rem' }} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="font-bold text-slate-800 text-base truncate group-hover:text-violet-600 transition-colors">
                                        {v.companyName || "Unnamed Company"}
                                    </div>
                                    <div className="text-slate-500 text-sm mt-1 flex items-center gap-1.5">
                                        <PhoneOutlined size={12} />
                                        <span>{v.phoneNumber || "No Phone"}</span>
                                    </div>
                                    {v.accountNumber && (
                                        <div className="mt-3">
                                            <Tag color="blue" className="rounded-md border-0 bg-blue-50 text-blue-600 font-medium py-0.5 px-2">
                                                #{v.accountNumber}
                                            </Tag>
                                        </div>
                                    )}
                                    {v.notes && (
                                        <div className="text-slate-500 text-xs mt-3 bg-slate-50 p-2 rounded border border-slate-100 whitespace-pre-wrap max-h-20 overflow-y-auto">
                                            {v.notes}
                                        </div>
                                    )}
                                    <div className="text-slate-400 text-[10px] mt-4 flex items-center justify-between gap-2 border-t border-slate-50 pt-3">
                                        <span>{t('common.created')}: {v.createdAt ? dayjs(v.createdAt).format('MMM DD, YYYY') : "—"}</span>
                                        <span>{t('common.updated')}: {v.updatedAt ? dayjs(v.updatedAt).format('MMM DD, YYYY') : "—"}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            );
        }

        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-gray-100">
                                <th className="p-4 pl-8 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('vendors.companyName') || 'Company Name'}</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('vendors.phone') || 'Phone'}</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('vendors.accountNumber') || 'Account #'}</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('vendors.notes') || 'Notes'}</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('common.created') || 'Created'}</th>
                                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{t('common.updatedAt') || 'Updated At'}</th>
                                <th className="p-4 pr-8 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">{t('common.actions') || 'Actions'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredVendors.map((v) => (
                                <tr key={v.id} className="hover:bg-violet-50/30 transition-colors group">
                                    <td className="p-4 pl-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600 group-hover:bg-violet-100 transition-colors">
                                                <ShopOutlined />
                                            </div>
                                            <span className="font-semibold text-slate-800 group-hover:text-violet-700 transition-colors">
                                                {v.companyName || "Unnamed Company"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600 font-medium">{v.phoneNumber || "—"}</td>
                                    <td className="p-4">
                                        {v.accountNumber ? (
                                            <Tag color="blue" className="rounded-md border-0 bg-blue-50 text-blue-600 font-medium">
                                                {v.accountNumber}
                                            </Tag>
                                        ) : "—"}
                                    </td>
                                    <td className="p-4 text-sm text-slate-500 max-w-[200px]">
                                        <div className="truncate whitespace-pre-wrap max-h-[40px] leading-relaxed" title={v.notes}>
                                            {v.notes || "—"}
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-slate-500">
                                        {v.createdAt ? dayjs(v.createdAt).format('MMM DD, YYYY') : "—"}
                                    </td>
                                    <td className="p-4 text-sm text-slate-500 font-medium">
                                        {v.updatedAt ? dayjs(v.updatedAt).format('MMM DD, YYYY') : "—"}
                                    </td>
                                    <td className="p-4 pr-8 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Tooltip title={t('common.view')}>
                                                <Button 
                                                    type="text" 
                                                    icon={<EyeOutlined />} 
                                                    className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                                    onClick={() => handleViewDetails(v)}
                                                />
                                            </Tooltip>
                                            <Tooltip title={t('common.edit')}>
                                                <Button 
                                                    type="text" 
                                                    icon={<EditOutlined />} 
                                                    className="text-violet-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg"
                                                    onClick={() => handleEditVendor(v)}
                                                />
                                            </Tooltip>
                                            <Tooltip title={t('common.delete')}>
                                                <Button 
                                                    type="text" 
                                                    icon={<DeleteOutlined />} 
                                                    danger
                                                    className="hover:bg-red-50 rounded-lg"
                                                    onClick={() => handleDelete(v)}
                                                />
                                            </Tooltip>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <DashboardLayout
            isMobile={isMobile}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
        >
            {contextHolder}
            <div className="min-h-screen bg-slate-50/50">
                <VendorHeaderBar
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    onOpenFilters={() => setSidebarOpen(!sidebarOpen)}
                    sidebarOpen={sidebarOpen}
                    onAddVendor={handleAddVendor}
                />

                <div className="p-6 lg:p-10 max-w-[1600px] mx-auto">
                    <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-bold text-slate-800 m-0">
                                    {t('nav.vendorContacts') || 'Vendor Contacts'}
                                </h2>
                                <Tooltip title={t('vendors.infoTooltip')} placement="right">
                                    <InfoCircleOutlined className="text-slate-400 text-sm cursor-pointer hover:text-violet-500 transition-colors" />
                                </Tooltip>
                            </div>
                            <p className="text-slate-500 mt-1">
                                {t('vendors.manageSubtitle') || 'Manage your parts suppliers and distributor contacts'}
                            </p>
                        </div>
                        <div className="bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm text-slate-600 font-medium">
                            {filteredVendors.length} {t('common.results') || 'Results'}
                        </div>
                    </div>

                    {renderTable()}
                </div>

                {/* Upsert Modal */}
                <Modal 
                    title={editingItem ? (t('vendors.editVendor') || 'Edit Vendor') : (t('vendors.addVendor') || 'Add Vendor')} 
                    open={isModalVisible} 
                    onOk={handleSave} 
                    onCancel={() => setIsModalVisible(false)} 
                    confirmLoading={isSaving} 
                    okText={t('common.save') || 'Save'} 
                    cancelText={t('common.cancel') || 'Cancel'} 
                    centered
                    width={500}
                    className="vendor-modal"
                >
                    <Form form={form} layout="vertical" className="mt-6">
                        <Form.Item 
                            name="companyName" 
                            label={t('vendors.companyName') || "Company Name"} 
                            rules={[{ required: true, message: 'Please enter company name' }]}
                        >
                            <Input placeholder="Enter company name" size="large" />
                        </Form.Item>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Form.Item 
                                name="phoneNumber" 
                                label={t('vendors.phone') || "Phone Number"}
                            >
                                <Input 
                                    placeholder="(XXX) XXX-XXXX" 
                                    size="large"
                                    onChange={handlePhoneChange}
                                    maxLength={14}
                                />
                            </Form.Item>
                            <Form.Item 
                                name="accountNumber" 
                                label={t('vendors.accountNumber') || "Account Number"}
                            >
                                <Input placeholder="Ref #" size="large" />
                            </Form.Item>
                        </div>

                        <Form.Item 
                            name="notes" 
                            label={t('vendors.notes') || "Notes"}
                        >
                            <Input.TextArea placeholder="Internal notes..." rows={4} />
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Detail View Modal */}
                <Modal
                    title={detailData?.companyName || "Vendor Details"}
                    open={detailVisible}
                    onCancel={() => setDetailVisible(false)}
                    footer={null}
                    centered
                    width={600}
                >
                    {detailData && (
                        <div className="py-4">
                            <div className="flex items-center gap-4 mb-8 p-4 bg-slate-50 rounded-xl">
                                <div className="w-16 h-16 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-lg shadow-violet-200">
                                    <ShopOutlined style={{ fontSize: '2rem' }} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 m-0">{detailData.companyName}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Tag color="violet" className="rounded-md border-0 font-medium">Vendor</Tag>
                                        {detailData.accountNumber && <span className="text-slate-400 text-sm">Account: #{detailData.accountNumber}</span>}
                                    </div>
                                </div>
                            </div>

                            <Descriptions column={1} bordered size="small" className="custom-descriptions">
                                <Descriptions.Item label={<span className="flex items-center gap-2"><PhoneOutlined /> {t('vendors.phone')}</span>}>
                                    {detailData.phoneNumber || "-"}
                                </Descriptions.Item>
                                <Descriptions.Item label={<span className="flex items-center gap-2"><ContainerOutlined /> {t('vendors.accountNumber')}</span>}>
                                    {detailData.accountNumber || "-"}
                                </Descriptions.Item>
                                <Descriptions.Item label={<span className="flex items-center gap-2"><CalendarOutlined /> {t('common.created')}</span>}>
                                    {detailData.createdAt ? dayjs(detailData.createdAt).format('MMMM D, YYYY') : "-"}
                                </Descriptions.Item>
                                <Descriptions.Item label={<span className="flex items-center gap-2"><CalendarOutlined /> {t('common.lastUpdated')}</span>}>
                                    {detailData.updatedAt ? dayjs(detailData.updatedAt).format('MMMM D, YYYY') : "-"}
                                </Descriptions.Item>
                                <Descriptions.Item label={t('vendors.notes')} span={1}>
                                    <div className="whitespace-pre-wrap text-slate-600 min-h-[60px]">
                                        {detailData.notes || "No notes available for this vendor."}
                                    </div>
                                </Descriptions.Item>
                            </Descriptions>

                            <div className="mt-8 flex justify-end gap-3">
                                <Button 
                                    icon={<EditOutlined />} 
                                    onClick={() => { setDetailVisible(false); handleEditVendor(detailData); }}
                                    className="rounded-lg h-10 px-6"
                                >
                                    {t('common.edit')}
                                </Button>
                                <Button 
                                    danger 
                                    icon={<DeleteOutlined />} 
                                    onClick={() => { setDetailVisible(false); handleDelete(detailData); }}
                                    className="rounded-lg h-10 px-6"
                                >
                                    {t('common.delete')}
                                </Button>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
            <style>{`
                .vendor-modal .ant-modal-content {
                    border-radius: 20px;
                    overflow: hidden;
                    padding: 24px;
                }
                .vendor-modal .ant-modal-header {
                    margin-bottom: 24px;
                }
                .vendor-modal .ant-modal-title {
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: #1e293b;
                }
                .custom-descriptions .ant-descriptions-item-label {
                    width: 160px;
                    font-weight: 600;
                    color: #64748b;
                    background-color: #f8fafc;
                }
                .custom-descriptions .ant-descriptions-item-content {
                    color: #1e293b;
                    font-weight: 500;
                }
            `}</style>
        </DashboardLayout>
    );
};

export default VendorsRoot;
