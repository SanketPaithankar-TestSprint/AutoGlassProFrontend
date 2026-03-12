import React, { useState, useEffect } from 'react';
import { Segmented, Input, Button, Tag, Spin, Tooltip } from 'antd';
import { AppstoreOutlined, UnorderedListOutlined, SearchOutlined, ClockCircleOutlined, FilterOutlined, LoadingOutlined, CloudServerOutlined, DatabaseOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const HeaderBar = ({
    viewMode,
    setViewMode,
    searchTerm,
    setSearchTerm,
    onOpenFilters,
    sidebarOpen = true,
    isSearchingApi = false,
    searchSource = 'local',
    isMobile = false,
}) => {
    const { t } = useTranslation();
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update time every second for real-time display
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatDateTime = (date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="bg-white border-b border-slate-200 px-6 py-6">
            {/* Title Section */}
            <div className="mb-6 flex items-center gap-2">
                <h1 className="!text-[30px] font-bold text-slate-900 m-0">
                    {t('openRoute.title')}
                </h1>
                <Tooltip title={t('openRoute.subtitle')} placement="right">
                    <InfoCircleOutlined className="text-slate-400 text-base cursor-pointer hover:text-violet-500 transition-colors" />
                </Tooltip>
            </div>

            {/* Controls Section - Below Title */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* View Mode Toggle - Hide on mobile */}
                    {!isMobile && (
                        <div className="bg-slate-100 p-1 rounded-lg flex gap-1">
                            <Button
                                type={viewMode === 'grid' ? 'primary' : 'text'}
                                icon={<AppstoreOutlined />}
                                onClick={() => setViewMode('grid')}
                                className={`flex-shrink-0 border-0 ${viewMode === 'grid' ? 'bg-white shadow-sm text-violet-600 font-medium' : 'text-slate-500 hover:text-slate-700'}`}
                                size="small"
                            >
                                {t('openRoute.viewModes.grid')}
                            </Button>
                            <Button
                                type={viewMode === 'list' ? 'primary' : 'text'}
                                icon={<UnorderedListOutlined />}
                                onClick={() => setViewMode('list')}
                                className={`flex-shrink-0 border-0 ${viewMode === 'list' ? 'bg-white shadow-sm text-violet-600 font-medium' : 'text-slate-500 hover:text-slate-700'}`}
                                size="small"
                            >
                                {t('openRoute.viewModes.list')}
                            </Button>
                        </div>
                    )}

                    {/* Filter Toggle Button */}
                    <Button
                        icon={<FilterOutlined />}
                        onClick={onOpenFilters}
                    >
                        {sidebarOpen ? t('openRoute.actions.hideFilters') : t('openRoute.actions.showFilters')}
                    </Button>
                </div>

                {/* Search Input */}
                <div className="flex-1 w-full sm:max-w-md">
                    <div className="relative">
                        <Input
                            size="large"
                            placeholder={t('openRoute.search.placeholder')}
                            prefix={
                                isSearchingApi
                                    ? <Spin indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />} />
                                    : <SearchOutlined className="text-slate-400" />
                            }
                            suffix={
                                searchTerm && searchTerm.length >= 3 && (
                                    <Tag
                                        color={searchSource === 'api' ? 'blue' : searchSource === 'mixed' ? 'purple' : 'default'}
                                        icon={searchSource === 'api' || searchSource === 'mixed' ? <CloudServerOutlined /> : <DatabaseOutlined />}
                                        className="mr-0"
                                    >
                                        {searchSource === 'api' ? t('openRoute.search.server') : searchSource === 'mixed' ? t('openRoute.search.mixed') : t('openRoute.search.local')}
                                    </Tag>
                                )
                            }
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="rounded-lg"
                            allowClear
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeaderBar;
