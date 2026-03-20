import React from 'react';
import { Input, Button, Space, Tooltip } from 'antd';
import { 
    SearchOutlined, 
    FilterOutlined, 
    AppstoreOutlined, 
    BarsOutlined,
    PlusOutlined 
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const VendorHeaderBar = ({ 
    searchTerm, 
    setSearchTerm, 
    onOpenFilters, 
    sidebarOpen,
    onAddVendor 
}) => {
    const { t } = useTranslation();

    return (
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-10 shadow-sm">
            <div className="flex items-center gap-4 flex-1 min-w-[300px]">
                <div className="relative flex-1 max-w-md">
                    <Input
                        placeholder={t('vendors.searchPlaceholder') || "Search by company name..."}
                        prefix={<SearchOutlined className="text-gray-400" />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="rounded-full bg-slate-50 border-gray-200 hover:border-violet-400 focus:border-violet-500 h-10 transition-all shadow-inner"
                        allowClear
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Space size="middle">
                    <Tooltip title={sidebarOpen ? t('common.hideFilters') : t('common.showFilters')}>
                        <Button
                            icon={<FilterOutlined />}
                            onClick={onOpenFilters}
                            className={`rounded-lg border-gray-200 flex items-center justify-center h-10 w-10 transition-all ${
                                !sidebarOpen ? 'bg-violet-50 text-violet-600 border-violet-200 shadow-sm' : 'text-slate-600'
                            }`}
                        />
                    </Tooltip>
                    
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={onAddVendor}
                        className="bg-gradient-to-r from-violet-600 to-indigo-600 border-0 hover:from-violet-500 hover:to-indigo-500 shadow-md h-10 px-6 rounded-lg font-medium"
                    >
                        {t('vendors.addVendor') || 'Add Vendor'}
                    </Button>
                </Space>
            </div>
        </div>
    );
};

export default VendorHeaderBar;
