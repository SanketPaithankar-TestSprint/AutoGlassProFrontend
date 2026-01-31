import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space, Drawer } from 'antd';
import {
    HomeOutlined,
    FileTextOutlined,
    UserOutlined,
    LogoutOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    DownOutlined,
    FolderOpenOutlined,
    BarChartOutlined,
    CalendarOutlined,
    MenuOutlined,
    PieChartOutlined,
    TeamOutlined
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import Logo from './logo';
import { getUserLogo } from '../api/getUserLogo';
import { getValidToken } from '../api/getValidToken';

const { Sider } = Layout;

const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    return isMobile;
};

const Sidebar = ({ onLogout, collapsed, onCollapse }) => {
    const location = useLocation();
    const [userLogo, setUserLogo] = useState(localStorage.getItem('userLogo'));

    // Fetch logo on mount and when route changes (to catch post-login state)
    useEffect(() => {
        const fetchLogoIfNeeded = async () => {
            // First check if we have a valid token
            const token = getValidToken();
            if (!token) {
                return; // Not authenticated, don't fetch
            }

            const cachedLogo = localStorage.getItem('userLogo');
            if (!cachedLogo) {
                try {
                    console.log('Sidebar: Fetching user logo from API...');
                    const logoData = await getUserLogo();
                    if (logoData) {
                        console.log('Sidebar: Logo fetched successfully');
                        localStorage.setItem('userLogo', logoData);
                        setUserLogo(logoData);
                        // Also dispatch event for other components
                        window.dispatchEvent(new Event('userLogoUpdated'));
                    } else {
                        console.log('Sidebar: No logo returned from API');
                    }
                } catch (err) {
                    console.error("Failed to fetch user logo in Sidebar", err);
                }
            } else if (userLogo !== cachedLogo) {
                // localStorage has logo but state doesn't - sync it
                setUserLogo(cachedLogo);
            }
        };

        fetchLogoIfNeeded();
    }, [location.pathname]); // Re-run on route changes to catch post-login navigation

    // Listen for logo updates (from login or profile upload)
    useEffect(() => {
        const handleLogoUpdate = () => {
            setUserLogo(localStorage.getItem('userLogo'));
        };

        window.addEventListener('storage', handleLogoUpdate); // Cross-tab
        window.addEventListener('userLogoUpdated', handleLogoUpdate); // Same-tab custom event

        return () => {
            window.removeEventListener('storage', handleLogoUpdate);
            window.removeEventListener('userLogoUpdated', handleLogoUpdate);
        };
    }, []);

    const items = [

        {
            key: '/analytics',
            icon: <PieChartOutlined />,
            label: <Link to="/analytics">Analytics</Link>,
        },
        {
            key: '/customers',
            icon: <TeamOutlined />,
            label: <Link to="/customers">Customers</Link>,
        },
        {
            icon: <FileTextOutlined />,
            label: <Link to="/search-by-root">Quote</Link>,
        },
        {
            key: '/schedule',
            icon: <CalendarOutlined />,
            label: <Link to="/schedule">Schedule</Link>,
        },
        {
            key: '/open',
            icon: <FolderOpenOutlined />,
            label: <Link to="/open">Dashboard</Link>,
        },
        {
            key: '/reports',
            icon: <BarChartOutlined />,
            label: <Link to="/reports">Reports</Link>,
        },
        {
            key: '/service-contact-form',
            icon: <FileTextOutlined />,
            label: <Link to="/service-contact-form">Service Inquiries</Link>,
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
            /* {
                 key: 'work',
                 label: <Link to="/work">Work</Link>,
                 icon: <FileTextOutlined /> // Or a better icon for Work
             }, */
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
                                {userLogo ? (
                                    <Avatar src={userLogo} className="bg-transparent border border-gray-200" />
                                ) : (
                                    <Avatar icon={<UserOutlined />} className="bg-violet-100 text-violet-600" />
                                )}
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

export default React.memo(Sidebar);
