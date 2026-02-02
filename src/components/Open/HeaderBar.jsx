import React, { useState, useEffect } from 'react';
import { Segmented, Input, Button, Tag, Spin } from 'antd';
import { AppstoreOutlined, UnorderedListOutlined, SearchOutlined, ClockCircleOutlined, FilterOutlined, LoadingOutlined, CloudServerOutlined, DatabaseOutlined } from '@ant-design/icons';

const HeaderBar = ({
    viewMode,
    setViewMode,
    searchTerm,
    setSearchTerm,
    onOpenFilters,
    isSearchingApi = false,
    searchSource = 'local',
}) => {
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
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
                        Open Dashboard
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Manage and track your service documents
                    </p>
                </div>

                {/* Date/Time Display */}
                <div className="flex items-center gap-2 text-slate-600 text-base lg:text-lg font-medium bg-slate-100 px-4 py-2 rounded-lg">
                    <ClockCircleOutlined className="text-violet-600" />
                    <span>{formatDateTime(currentTime)}</span>
                </div>
            </div>

            {/* Controls Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* View Mode Toggle */}
                    <Segmented
                        value={viewMode}
                        onChange={setViewMode}
                        options={[
                            {
                                label: 'Grid',
                                value: 'grid',
                                icon: <AppstoreOutlined />,
                            },
                            {
                                label: 'List',
                                value: 'list',
                                icon: <UnorderedListOutlined />,
                            },
                        ]}
                        className="flex-shrink-0"
                    />

                    {/* Mobile Filter Button */}
                    <Button
                        icon={<FilterOutlined />}
                        onClick={onOpenFilters}
                        className="lg:hidden"
                    >
                        Filter
                    </Button>
                </div>

                {/* Search Input */}
                <div className="flex-1 w-full sm:max-w-md">
                    <div className="relative">
                        <Input
                            size="large"
                            placeholder="Search by Document #, Customer, or Vehicle..."
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
                                        {searchSource === 'api' ? 'Server' : searchSource === 'mixed' ? 'Mixed' : 'Local'}
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
