import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space } from 'antd';
import {
    HomeOutlined,
    FileTextOutlined,
    UserOutlined,
    LogoutOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    DownOutlined,
    FolderOpenOutlined
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import Logo from './logo';

const { Sider } = Layout;

const Sidebar = ({ onLogout, collapsed, onCollapse }) => {
    const location = useLocation();

    const items = [
        {
            key: '/',
            icon: <HomeOutlined />,
            label: <Link to="/">Home</Link>,
        },
        {
            icon: <FileTextOutlined />,
            label: <Link to="/search-by-root">Quote</Link>,
        },
        {
            key: '/open',
            icon: <FolderOpenOutlined />,
            label: <Link to="/open">Dashboard</Link>,
        },
        // Add other authenticated links here if needed
    ];

    const profileMenu = (
        <Menu items={[
            {
                key: 'profile',
                label: <Link to="/profile">Profile</Link>,
                icon: <UserOutlined />
            },
            {
                key: 'work',
                label: <Link to="/work">Work</Link>,
                icon: <FileTextOutlined /> // Or a better icon for Work
            },
            {
                type: 'divider'
            },
            {
                key: 'logout',
                label: 'Logout',
                icon: <LogoutOutlined />,
                danger: true,
                onClick: onLogout
            }
        ]} />
    );

    return (
        <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={onCollapse}
            theme="light"
            className="h-full border-r border-slate-200 z-50 shadow-md"
            width={200}
            collapsedWidth={80}
        >
            <div className="flex flex-col h-full">
                {/* Top: Logo */}
                <div className={`p-4 flex items-center ${collapsed ? 'justify-center' : 'justify-start'} transition-all duration-200 border-b border-gray-100`}>
                    <Link to="/">
                        <Logo className={`${collapsed ? 'w-8' : 'w-32'} h-auto transition-all duration-200`} />
                    </Link>
                </div>

                {/* Middle: Navigation */}
                <div className="flex-1 py-4 overflow-y-auto custom-scrollbar">
                    <Menu
                        mode="inline"
                        selectedKeys={[location.pathname]}
                        items={items}
                        className="border-none text-base"
                        style={{ background: 'transparent' }}
                    />
                </div>

                {/* Bottom: Profile */}
                <div className="p-4 border-t border-gray-100">
                    <Dropdown overlay={profileMenu} trigger={['click']} placement="topRight">
                        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} p-2 rounded-lg hover:bg-violet-50 cursor-pointer transition-colors group`}>
                            <div className="flex items-center gap-3">
                                <Avatar icon={<UserOutlined />} className="bg-violet-100 text-violet-600" />
                                {!collapsed && (
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-medium text-slate-700 truncate group-hover:text-violet-700">My Account</span>
                                    </div>
                                )}
                            </div>
                            {!collapsed && <DownOutlined className="text-xs text-slate-400 group-hover:text-violet-500" />}
                        </div>
                    </Dropdown>
                </div>
            </div>
        </Sider>
    );
};

export default Sidebar;
