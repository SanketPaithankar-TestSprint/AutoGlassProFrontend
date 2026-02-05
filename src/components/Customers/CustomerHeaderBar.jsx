import React, { useState, useEffect } from 'react';
import { Segmented, Input, Button } from 'antd';
import { AppstoreOutlined, UnorderedListOutlined, SearchOutlined, ClockCircleOutlined, FilterOutlined } from '@ant-design/icons';

const CustomerHeaderBar = ({
    viewMode,
    setViewMode,
    searchTerm,
    setSearchTerm,
    onOpenFilters,
    sidebarOpen = true,
}) => {

    return (
        <div className="bg-white border-b border-slate-200 px-6 py-6">
            {/* Title Section */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
                        Customer Management
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Manage individual customers and organizations
                    </p>
                </div>
            </div>

            {/* Controls Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                {/* View Mode Toggle - Keeping it for consistency even if only List is primary for now */}
                {/* 
                <Segmented
                    value={viewMode}
                    onChange={setViewMode}
                    options={[
                        {
                            label: 'List',
                            value: 'list',
                            icon: <UnorderedListOutlined />,
                        },
                         // Grid mode isn't implemented for customers yet, but we can keep the UI if desired or hide it. 
                         // Hiding for now to avoid confusion.
                    ]}
                    className="flex-shrink-0"
                /> 
                */}

                {/* Filter Toggle Button */}
                <div className="flex items-center w-full sm:w-auto">
                    <Button
                        icon={<FilterOutlined />}
                        onClick={onOpenFilters}
                    >
                        {sidebarOpen ? 'Hide Filters' : 'Show Filters'}
                    </Button>
                </div>

                {/* Search Input */}
                <div className="flex-1 w-full sm:max-w-md">
                    <Input
                        size="large"
                        placeholder="Search by Name, Email, Phone, Company..."
                        prefix={<SearchOutlined className="text-slate-400" />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="rounded-lg"
                        allowClear
                    />
                </div>
            </div>
        </div>
    );
};

export default CustomerHeaderBar;
