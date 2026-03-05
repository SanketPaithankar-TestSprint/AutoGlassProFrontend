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
import { useChat } from '../context/ChatContext';

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
    const { unreadTotal } = useChat() || {};
    const unreadChatCount = unreadTotal || 0;
    const { t } = useTranslation();
    const activeTabBg = useSidebarStore(state => state.activeTabBg);
    const setActiveTabBg = useSidebarStore(state => state.setActiveTabBg);

    // Sync active tab background with the current page's route
    useEffect(() => {
        const pageBg = getPageBackground(location.pathname);
        setActiveTabBg(pageBg);
    }, [location.pathname, setActiveTabBg]);

    // GFG-inspired: inject curve elements into the active tab + add classes to adjacent items
    useEffect(() => {
        const updateCurves = () => {
            // Clean up previous curve elements and adjacent classes
            document.querySelectorAll('.sidebar-curve-top, .sidebar-curve-bottom').forEach(el => el.remove());
            document.querySelectorAll('.ant-menu-item-above-selected, .ant-menu-item-below-selected').forEach(el => {
                el.classList.remove('ant-menu-item-above-selected', 'ant-menu-item-below-selected');
            });

            const selectedItem = document.querySelector('.ant-menu-dark .ant-menu-item-selected');
            if (!selectedItem) return;

            // Inject top curve span
            const topCurve = document.createElement('span');
            topCurve.className = 'sidebar-curve-top';
            selectedItem.appendChild(topCurve);

            // Inject bottom curve span
            const bottomCurve = document.createElement('span');
            bottomCurve.className = 'sidebar-curve-bottom';
            selectedItem.appendChild(bottomCurve);

            // Add border-radius classes to adjacent menu items
            const selectedLi = selectedItem.closest('li');
            if (!selectedLi) return;

            const prevLi = selectedLi.previousElementSibling;
            if (prevLi?.querySelector('.ant-menu-item')) {
                prevLi.querySelector('.ant-menu-item').classList.add('ant-menu-item-above-selected');
            }

            const nextLi = selectedLi.nextElementSibling;
            if (nextLi?.querySelector('.ant-menu-item')) {
                nextLi.querySelector('.ant-menu-item').classList.add('ant-menu-item-below-selected');
            }
        };

        // Run immediately, then again after Ant Design re-renders
        updateCurves();
        const raf = requestAnimationFrame(updateCurves);
        return () => {
            cancelAnimationFrame(raf);
            document.querySelectorAll('.sidebar-curve-top, .sidebar-curve-bottom').forEach(el => el.remove());
        };
    }, [location.pathname]);

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

    const inquiryBadgeCount = badgeCount || 0;

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
                    {collapsed && inquiryBadgeCount > 0 && (
                        <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 bg-red-500 w-2 h-2 rounded-full z-[100]"></div>
                    )}
                </div>
            ),
            label: (
                <Link to="/service-contact-form">
                    <span className="inline-flex items-center gap-2">
                        <span>{t('nav.serviceInquiries')}</span>
                        {!collapsed && inquiryBadgeCount > 0 && (
                            <Badge
                                count={inquiryBadgeCount}
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
            icon: (
                <div className="relative inline-block">
                    <MdSupportAgent style={{ fontSize: '1.2rem' }} />
                    {collapsed && unreadChatCount > 0 && (
                        <div className="absolute -right-1 top-1/2 transform -translate-y-1/2 bg-red-500 w-2 h-2 rounded-full z-[100]"></div>
                    )}
                </div>
            ),
            label: (
                <Link to="/chat">
                    <span className="inline-flex items-center gap-2">
                        <span>{t('nav.liveChat')}</span>
                        {!collapsed && unreadChatCount > 0 && (
                            <Badge
                                count={unreadChatCount}
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
            className="h-full z-50 rounded-tr-2xl rounded-br-2xl overflow-hidden"
            style={{ background: '#203a78ff', '--active-bg': activeTabBg }}
            width={200}
            collapsedWidth={80}
        >
            <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 to-indigo-950" style={{ '--sidebar-bg': '#0f172a' }}>
                {/* Top: Logo */}
                <div className={`p-4 flex items-center ${collapsed ? 'justify-center' : 'justify-start'} transition-all duration-200 border-b border-white/5`}>
                    <Link to="/">
                        <img src={Logo} alt="APAI Logo" className={`${collapsed ? 'w-8' : 'w-32'} h-auto transition-all duration-200 object-contain`} />
                    </Link>
                </div>

                {/* Middle: Navigation */}
                <div className="flex-1 pt-6 pb-4 overflow-y-auto custom-scrollbar">
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
                .ant-layout-sider {
                    border-top-right-radius: 32px !important;
                    border-bottom-right-radius: 32px !important;
                    overflow: hidden !important;
                }
                .ant-layout-sider-trigger {
                    background: #0f172a !important;
                    color: #cbd5e1 !important;
                    border-top: 1px solid rgba(255,255,255,0.05) !important;
                    border-bottom-right-radius: 32px !important;
                    transition: all 0.2s;
                }
                .ant-layout-sider-trigger:hover {
                    color: #fff !important;
                    background: #1e293b !important;
                }

                /* ========================================= */
                /* CURVED ACTIVE TAB EFFECT            */
                /* ========================================= */

                /* 0. Remove Ant Design native borders that cause vertical ghost lines */
                .ant-layout-sider,
                .ant-menu,
                .ant-menu-dark,
                .ant-menu-item {
                    border-right: none !important;
                    border-inline-end: none !important;
                }

                /* Add margin/padding between tab menu items */
                .ant-menu-item {
                    margin-top: 8px !important;
                    margin-bottom: 8px !important;
                }

                /* 1. Base styling for the active tab */
                .ant-menu-dark .ant-menu-item-selected {
                    /* Use your existing dynamic background variable */
                    background-color: var(--active-bg, #f0f2f5) !important;
                    
                    /* Round the left side, keep right side flat */
                    border-radius: 30px 0 0 30px !important; 
                    
                    /* Overlap the edge slightly to perfectly hide any vertical subpixel gaps */
                    margin-right: -1px !important; 
                    margin-left: 12px !important;
                    width: calc(100% - 11px) !important;
                    position: relative;
                    
                    /* Remove any native shadows or borders */
                    border: none !important;

                    /* CRITICAL: Allow the ::before and ::after to be seen outside the bounds */
                    overflow: visible !important;
                    z-index: 2 !important; 
                }

                /* 2. Invert text/icon colors for contrast on light background */
                .ant-menu-dark .ant-menu-item-selected .ant-menu-title-content,
                .ant-menu-dark .ant-menu-item-selected .ant-menu-title-content a,
                .ant-menu-dark .ant-menu-item-selected .anticon {
                    color: #1e293b !important; /* Dark color for readability */
                    font-weight: 500;
                    position: relative;
                    z-index: 10 !important; /* Force icons above everything */
                }

                /* 3. Setup invisible bounding boxes for the curves */
                .ant-menu-dark .ant-menu-item-selected::before,
                .ant-menu-dark .ant-menu-item-selected::after {
                    content: '';
                    position: absolute;
                    right: 0;
                    width: 30px;
                    height: 30px; /* STRICTLY 30px so it doesn't overlap the icon */
                    background-color: transparent;
                    pointer-events: none; /* Prevents blocking clicks */
                    z-index: 1;
                }

                /* 4. Top Inverted Curve via Box-Shadow (smooth anti-aliased perfectly) */
                .ant-menu-dark .ant-menu-item-selected::before {
                    top: -30px;
                    border-radius: 0 0 30px 0;
                    box-shadow: 15px 15px 0 15px var(--active-bg, #f0f2f5);
                }

                /* 5. Bottom Inverted Curve via Box-Shadow (smooth anti-aliased perfectly) */
                .ant-menu-dark .ant-menu-item-selected::after {
                    bottom: -30px;
                    border-radius: 0 30px 0 0;
                    box-shadow: 15px -15px 0 15px var(--active-bg, #f0f2f5);
                }

                /* Increase Icon Size */
                .ant-menu-dark .ant-menu-item .anticon, 
                .ant-menu-dark .ant-menu-item svg {
                    font-size: 1.25rem !important;
                    transition: all 0.2s;
                }

                /* 6. Hover state for unselected menu items (bonus) */
                .ant-menu-dark .ant-menu-item:not(.ant-menu-item-selected):hover {
                    border-radius: 30px 0 0 30px !important;
                    margin-right: 0 !important;
                    margin-left: 12px !important;
                    width: calc(100% - 12px) !important;
                    background-color: rgba(255, 255, 255, 0.08) !important;
                }
            `}</style>
        </Sider>
    );
};

export default React.memo(Sidebar);
