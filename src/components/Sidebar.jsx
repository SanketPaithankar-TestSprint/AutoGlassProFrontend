import React, { useState, useEffect } from 'react';
import { MdSupportAgent } from "react-icons/md";
import { Layout, Menu, Button, Avatar, Dropdown, Space, Drawer, Badge, Tooltip } from 'antd';
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
    TeamOutlined,
    FormOutlined,
    MessageOutlined,
    AuditOutlined,
    AudioOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../assets/APAI.png';
import { getUserLogo } from '../api/getUserLogo';
import { getValidToken } from '../api/getValidToken';
import urls from '../config';
import { useInquiry } from '../context/InquiryContext';
import { useTranslation } from 'react-i18next';
import LanguageToggle from './LanguageToggle';
import { useSidebarStore } from '../store/useSidebarStore';
import { getPageBackground } from '../const/pageBackgrounds';

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
    const { badgeCount } = useInquiry(); // Get badge count from context
    const [localBadgeCount, setLocalBadgeCount] = useState(0);
    const { t } = useTranslation();
    const activeTabBg = useSidebarStore(state => state.activeTabBg);
    const setActiveTabBg = useSidebarStore(state => state.setActiveTabBg);

    // Sync active tab background with the current page's route
    useEffect(() => {
        const pageBg = getPageBackground(location.pathname);
        setActiveTabBg(pageBg);
    }, [location.pathname, setActiveTabBg]);

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

    // Direct event listener for badge updates - increment/decrement approach
    useEffect(() => {
        const fetchBadgeCount = async () => {
            const token = getValidToken();
            if (!token) {
                setLocalBadgeCount(0);
                return;
            }

            try {
                const response = await fetch(`${urls.javaApiUrl}/v1/service-inquiries/my?page=0&size=50&sort=createdAt,desc`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': '*/*'
                    }
                });

                if (!response.ok) return;

                const data = await response.json();
                const content = Array.isArray(data?.content) ? data.content : [];
                const count = content.filter(item => item?.status === 'NEW').length;

                console.log('🎯 Sidebar: Updating local badge count to', count);
                setLocalBadgeCount(count);
            } catch (error) {
                console.error('Sidebar: Failed to fetch badge count', error);
            }
        };

        // Initial fetch
        fetchBadgeCount();

        // Listen to events and update count directly
        const handleInquiryReceived = (event) => {
            console.log('🔔 Sidebar: New inquiry received, incrementing badge');
            setLocalBadgeCount(prev => prev + 1);
        };

        const handleInquiryStatusChanged = () => {
            console.log('🔔 Sidebar: Inquiry status changed, decrementing badge');
            setLocalBadgeCount(prev => Math.max(0, prev - 1));
        };

        window.addEventListener('INQUIRY_RECEIVED', handleInquiryReceived);
        window.addEventListener('INQUIRY_STATUS_CHANGED', handleInquiryStatusChanged);

        return () => {
            window.removeEventListener('INQUIRY_RECEIVED', handleInquiryReceived);
            window.removeEventListener('INQUIRY_STATUS_CHANGED', handleInquiryStatusChanged);
        };
    }, []);

    const items = [

        {
            key: '/analytics',
            icon: <PieChartOutlined />,
            label: <Link to="/analytics">{t('nav.analytics')}</Link>,
        },
        {
            key: '/customers',
            icon: <TeamOutlined />,
            label: <Link to="/customers">{t('nav.customers')}</Link>,
        },
        {
            key: '/search-by-root',
            icon: <FormOutlined />,
            label: <Link to="/search-by-root">{t('nav.quote')}</Link>,
        },
        {
            key: '/schedule',
            icon: <CalendarOutlined />,
            label: <Link to="/schedule">{t('nav.schedule')}</Link>,
        },
        {
            key: '/open',
            icon: <FolderOpenOutlined />,
            label: <Link to="/open">Jobs</Link>,
        },
        {
            key: '/reports',
            icon: <BarChartOutlined />,
            label: <Link to="/reports">{t('nav.reports')}</Link>,
        },
        {
            key: '/service-contact-form',
            icon: (
                <div className="relative inline-block">
                    <MessageOutlined />
                    {collapsed && localBadgeCount > 0 && (
                        <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 bg-red-500 w-2 h-2 rounded-full"></div>
                    )}
                </div>
            ),
            label: (
                <Link to="/service-contact-form">
                    <span className="inline-flex items-center gap-2">
                        <span>{t('nav.serviceInquiries')}</span>
                        {!collapsed && localBadgeCount > 0 && (
                            <Badge
                                count={localBadgeCount}
                                size="small"
                                color="#ef4444"
                                overflowCount={99}
                                style={{
                                    fontSize: 10,
                                    minWidth: 16,
                                    height: 16,
                                    lineHeight: '16px'
                                }}
                            />
                        )}
                    </span>
                </Link>
            ),
        },

        {
            key: '/employee-attendance',
            icon: <AuditOutlined />,
            label: <Link to="/employee-attendance">Attendance</Link>,
        },

        {
            key: '/chat',
            icon: <MdSupportAgent style={{ fontSize: '1.2rem' }} />,
            label: <Link to="/chat">{t('nav.liveChat')}</Link>,
        },
        // Add other authenticated links here if needed
    ];

    const profileMenuItems = [
        {
            key: 'profile',
            label: <Link to="/profile">{t('auth.profile')}</Link>,
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
            label: t('auth.logout'),
            icon: <LogoutOutlined />,
            danger: true,
            onClick: onLogout
        }
    ];

    return (
        <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={onCollapse}
            theme="dark"
            className="h-full z-50"
            style={{ background: '#203a78ff', '--active-bg': activeTabBg }}
            width={200}
            collapsedWidth={80}
        >
            <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 to-indigo-950">
                {/* Top: Logo */}
                <div className={`p-4 flex items-center ${collapsed ? 'justify-center' : 'justify-start'} transition-all duration-200 border-b border-white/5`}>
                    <Link to="/">
                        <img src={Logo} alt="APAI Logo" className={`${collapsed ? 'w-8' : 'w-32'} h-auto transition-all duration-200 object-contain`} />
                    </Link>
                </div>

                {/* Middle: Navigation */}
                <div className="flex-1 py-4 overflow-y-auto custom-scrollbar">
                    <Menu
                        theme="dark"
                        mode="inline"
                        selectedKeys={[location.pathname]}
                        items={items}
                        className="border-none text-base bg-transparent"
                        style={{ background: 'transparent' }}
                    />
                </div>

                {/* Bottom: Language Toggle + Profile */}
                <div className="p-4 border-t border-white/5 flex flex-col gap-1">
                    <LanguageToggle compact={collapsed} dark={true} sidebarMode={true} />
                    <Dropdown menu={{ items: profileMenuItems }} trigger={['click']} placement="topRight">
                        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors group`}>                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full border-2 border-slate-600 group-hover:border-violet-400 transition-colors flex items-center justify-center">
                                {userLogo ? (
                                    <Avatar src={userLogo} size={32} className="bg-transparent border-0" />
                                ) : (
                                    <Avatar icon={<UserOutlined />} size={32} className="bg-slate-800 text-slate-300 group-hover:text-violet-300 transition-colors" />
                                )}
                            </div>
                            {!collapsed && (
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-medium text-slate-300 truncate group-hover:text-white transition-colors">{t('auth.myAccount')}</span>
                                </div>
                            )}
                        </div>
                            {!collapsed && <DownOutlined className="text-xs text-slate-500 group-hover:text-slate-300 transition-colors" />}
                        </div>
                    </Dropdown>
                </div>
            </div>
            {/* Custom style to override the collapse trigger matching the new dark theme */}
            <style>{`
                .ant-layout-sider-trigger {
                    background: #0f172a !important; /* matches the base siding background */
                    color: #cbd5e1 !important; /* slate-300 */
                    border-top: 1px solid rgba(255,255,255,0.05) !important;
                    transition: all 0.2s;
                }
                .ant-layout-sider-trigger:hover {
                    color: #fff !important;
                    background: #1e293b !important; /* slate-800 */
                }
            `}</style>
        </Sider>
    );
};

export default React.memo(Sidebar);
