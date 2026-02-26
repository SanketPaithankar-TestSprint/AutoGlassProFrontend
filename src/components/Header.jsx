import React, { useEffect, useState } from "react";
import { MdSupportAgent } from "react-icons/md";
import { Layout, Button, Space, Drawer, Modal, Dropdown } from "antd";
import { MenuOutlined, UserOutlined, DownOutlined, PieChartOutlined, TeamOutlined, FormOutlined, CalendarOutlined, FolderOpenOutlined, BarChartOutlined, MessageOutlined, AuditOutlined } from "@ant-design/icons";
import Logo from "./logo";
import { getValidToken } from "../api/getValidToken";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageToggle from "./LanguageToggle";

const { Header: AntHeader } = Layout;



// ProfileDropdown component
const ProfileDropdown = ({ onLogout }) => {
  const { t } = useTranslation();
  const items = [
    {
      key: "profile",
      label: <Link to="/profile">{t('auth.userProfile')}</Link>,
    },

    {
      key: "logout",
      label: (
        <span
          style={{ color: "#f97373" }}
          onClick={onLogout}
        >
          {t('auth.logout')}
        </span>
      ),
      danger: true,
    },
  ];

  return (
    <Dropdown
      menu={{ items }}
      placement="bottomRight"
      trigger={["click"]}
    >
      <Button
        type="text"
        icon={<UserOutlined />}
        className="!h-9 !px-4 !text-slate-700 hover:!text-slate-900 !bg-transparent hover:!bg-transparent !border-0 focus:!outline-none focus:!ring-0"
      >
        <span className="inline-flex items-center gap-1">
          <span>{t('auth.profile')}</span>
          <DownOutlined className="text-[10px]" />
        </span>
      </Button>
    </Dropdown>
  );
};

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 1024 : true
  );

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1023.98px)");
    const onChange = (e) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    if (mql.addEventListener) mql.addEventListener("change", onChange);
    else mql.addListener(onChange);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", onChange);
      else mql.removeListener(onChange);
    };
  }, []);

  return isMobile;
};

const Header = ({ onLoginSuccess: onParentLoginSuccess }) => {
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const token = getValidToken();
    setIsAuthed(!!token);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isMobile) setDrawerOpen(false);
  }, [isMobile]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);



  const menuItems = [
    { key: "home", label: t('nav.home'), href: "/", icon: null },
    ...(!isAuthed ? [
      { key: "features", label: t('nav.features'), href: "/features", icon: null },
      { key: "pricing", label: t('nav.pricing'), href: "/pricing", icon: null },
      { key: "about", label: t('nav.about'), href: "/about", icon: null },
      { key: "contact", label: t('nav.contact'), href: "/contact", icon: null },
    ] : []),
    ...(isAuthed ? [
      { key: "analytics", label: t('nav.analytics'), href: "/analytics", icon: <PieChartOutlined /> },
      { key: "customers", label: t('nav.customers'), href: "/customers", icon: <TeamOutlined /> },
      { key: "Quote", label: t('nav.quote'), href: "/search-by-root", icon: <FormOutlined /> },
      { key: "schedule", label: t('nav.schedule'), href: "/schedule", icon: <CalendarOutlined /> },
      { key: "dashboard", label: t('nav.dashboard'), href: "/open", icon: <FolderOpenOutlined /> },
      { key: "reports", label: t('nav.reports'), href: "/reports", icon: <BarChartOutlined /> },
      { key: "service-inquiries", label: t('nav.serviceInquiries'), href: "/service-contact-form", icon: <MessageOutlined /> },
      { key: "employee-attendance", label: t('nav.employeeAttendance'), href: "/employee-attendance", icon: <AuditOutlined /> },
      { key: "live-chat", label: t('nav.liveChat'), href: "/chat", icon: <MdSupportAgent className="text-xl" /> },
    ] : []),
  ];

  const NavLink = ({ label, href }) => (
    <Link
      to={href}
      className="nav-link tracking-wide"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {label}
    </Link>
  );

  if (loading) {
    return (
      <div className="fixed top-0 left-0 right-0 z-40 h-20 bg-transparent flex items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <>
      <AntHeader
        className={`fixed top-0 left-0 right-0 z-40 flex items-center px-4 sm:px-6 md:px-8 transition-all duration-500 h-16
          ${scrolled
            ? '!bg-white/95 backdrop-blur-md border-b border-slate-200/80'
            : '!bg-transparent border-b border-transparent'
          }
        `}
        style={{ paddingInline: 0, boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.08)' : 'none', minWidth: 0 }}
      >
        {/* Left: Logo + small tag */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 ml-4">
          <Link
            to="/"
            className="flex items-center gap-2 hover:scale-[1.02] transition-transform duration-150 min-w-0"
          >
            <Logo className="w-24 sm:w-28 h-auto min-w-0" />
          </Link>
        </div>

        {/* Center: Navigation */}
        <nav className="hidden lg:flex flex-1 justify-center min-w-0">
          <ul className="flex items-center gap-4 sm:gap-8 xl:gap-12 group/navlink min-w-0 m-0 p-0">
            {menuItems.map((item) => (
              <li key={item.key} className="list-none min-w-0 flex items-center h-full">
                <NavLink label={item.label} href={item.href} />
              </li>
            ))}
          </ul>
        </nav>

        {/* Right: Buttons / Profile */}
        {!isAuthed ? (
          <div className="hidden lg:flex ml-auto min-w-0 items-center gap-2 sm:gap-4 pr-6">
            <LanguageToggle />
            <Button
              type="text"
              className="!h-9 !px-2 sm:!px-3 !text-slate-700 hover:!text-[#7E5CFE] !bg-transparent hover:!bg-transparent !border-0 focus:!outline-none focus:!ring-0 focus:!shadow-none hover:!shadow-none active:!shadow-none transition-colors duration-300 !text-[1.1rem]"
              onClick={() => navigate('/auth', { state: { mode: 'signin' } })}
            >
              {t('auth.login')}
            </Button>
            <Button
              type="primary"
              onClick={() => navigate('/auth', { state: { mode: 'signup' } })}
              className="relative !h-9 !px-6 !rounded-full !border-0 !bg-gradient-to-r from-[#7E5CFE] to-[#00A8E4] hover:!from-[#6b4ce6] hover:!to-[#008dc2] !text-white shadow-lg shadow-purple-500/30 transition-all duration-300 hover:scale-105"
            >
              <span className="relative font-semibold text-[1.1rem]">{t('auth.signUp')}</span>
            </Button>
          </div>
        ) : (
          <div className="hidden lg:flex items-center gap-2 sm:gap-3 ml-auto min-w-0">
            <LanguageToggle />
            <ProfileDropdown
              onLogout={() => {
                localStorage.removeItem("ApiToken");
                sessionStorage.removeItem("ApiToken");
                window.location.href = "/";
              }}
            />
          </div>
        )}

        {/* Mobile menu button */}
        {isMobile && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              aria-label="Open navigation"
              icon={<MenuOutlined />}
              onClick={() => setDrawerOpen(true)}
              className="!flex lg:!hidden !items-center !justify-center !h-9 !w-9 !rounded-full !text-slate-700 !bg-white hover:!bg-slate-100 !border border-slate-200 shadow-sm focus:!outline-none focus:!ring-0 focus:!shadow-none"
            />
          </div>
        )}
      </AntHeader>

      {/* Mobile Drawer */}
      {isAuthed && isMobile && (
        <Drawer
          title={
            <div className="flex items-center justify-between w-full pr-8">
              <div className="flex items-center gap-2">
                <Logo className="w-24 h-auto" />
              </div>

              {/* User Avatar Circle */}
              <Link to="/profile" onClick={() => setDrawerOpen(false)}>
                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center border border-violet-200 overflow-hidden">
                  {localStorage.getItem('userLogo') ? (
                    <img src={localStorage.getItem('userLogo')} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <UserOutlined className="text-violet-600 text-lg" />
                  )}
                </div>
              </Link>
            </div>
          }
          placement="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          bodyStyle={{ padding: 0, background: "#f7f7fa", borderRadius: '16px 0 0 16px' }}
          maskClosable
          destroyOnClose
          className="ap-header-drawer"
        >
          <nav className="p-4 text-slate-700">
            {/* Language Toggle in mobile drawer */}
            <div className="flex items-center justify-center py-3 mb-2 border-b border-slate-200">
              <LanguageToggle />
            </div>

            <ul className="space-y-2 pl-0 m-0 list-none">
              {menuItems.filter(item => item.key !== 'home').map((item) => (
                <li key={item.key}>
                  <Link
                    to={item.href}
                    className="flex items-center gap-3 px-4 py-2 rounded-md text-base text-slate-700 hover:text-violet-700 hover:bg-violet-100 outline-none transition-colors duration-150"
                    style={{ WebkitTapHighlightColor: "transparent" }}
                    onClick={() => setDrawerOpen(false)}
                  >
                    {item.icon && <span className="text-lg">{item.icon}</span>}
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            {isAuthed && (
              <div className="pt-4 border-t border-slate-200 mt-4">
                <ul className="space-y-2 pl-0 m-0 list-none">
                  <li>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 rounded-md text-base text-slate-700 hover:text-violet-700 hover:bg-violet-100 outline-none transition-colors duration-150"
                      onClick={() => setDrawerOpen(false)}
                    >
                      {t('auth.viewProfile')}
                    </Link>
                  </li>

                  <li>
                    <div
                      className="block px-4 py-2 rounded-md text-base text-red-500 hover:bg-red-50 hover:text-red-600 cursor-pointer transition-colors duration-150"
                      onClick={() => {
                        setDrawerOpen(false);
                        localStorage.removeItem("ApiToken");
                        sessionStorage.removeItem("ApiToken");
                        window.location.href = "/";
                      }}
                    >
                      {t('auth.logout')}
                    </div>
                  </li>
                </ul>
              </div>
            )}

            {!isAuthed && (
              <div className="px-4 pt-4 border-t border-slate-200 mt-4">
                <Button
                  type="text"
                  className="w-full !h-10 !text-slate-700 !bg-transparent hover:!bg-violet-100 !border-0 text-base"
                  onClick={() => {
                    setDrawerOpen(false);
                    navigate('/auth', { state: { mode: 'signin' } });
                  }}
                >
                  {t('auth.login')}
                </Button>
                <Button
                  type="primary"
                  onClick={() => {
                    setDrawerOpen(false);
                    navigate('/auth', { state: { mode: 'signup' } });
                  }}
                  className="w-full !h-10 !mt-2 !rounded-lg !bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:!from-violet-400 hover:!to-fuchsia-400 !border-0 !text-white text-base shadow-lg shadow-violet-800/40"
                >
                  {t('auth.signUp')}
                </Button>
              </div>
            )}
          </nav>
        </Drawer>
      )}

      {/* Guest Mobile Drawer */}
      {!isAuthed && isMobile && (
        <Drawer
          title={
            <div className="flex items-center gap-2">
              <Logo className="w-24 h-auto" />
            </div>
          }
          placement="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          bodyStyle={{ padding: 0, background: "#f7f7fa", borderRadius: '16px 0 0 16px' }}
          maskClosable
          destroyOnClose
          className="ap-header-drawer"
        >
          <nav className="p-4 text-slate-700">
            {/* Language Toggle in mobile drawer */}
            <div className="flex items-center justify-center py-3 mb-2 border-b border-slate-200">
              <LanguageToggle />
            </div>

            <ul className="space-y-2 pl-0 m-0 list-none">
              {menuItems.filter(item => item.key !== 'home').map((item) => (
                <li key={item.key}>
                  <Link
                    to={item.href}
                    className="flex items-center gap-3 px-4 py-2 rounded-md text-base text-slate-700 hover:text-violet-700 hover:bg-violet-100 outline-none transition-colors duration-150"
                    style={{ WebkitTapHighlightColor: "transparent" }}
                    onClick={() => setDrawerOpen(false)}
                  >
                    {item.icon && <span className="text-lg">{item.icon}</span>}
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="px-4 pt-4 border-t border-slate-200 mt-4">
              <Button
                type="text"
                className="w-full !h-10 !text-slate-700 !bg-transparent hover:!bg-violet-100 !border-0 text-base"
                onClick={() => {
                  setDrawerOpen(false);
                  navigate('/auth', { state: { mode: 'signin' } });
                }}
              >
                {t('auth.login')}
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  setDrawerOpen(false);
                  navigate('/auth', { state: { mode: 'signup' } });
                }}
                className="w-full !h-10 !mt-2 !rounded-lg !bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:!from-violet-400 hover:!to-fuchsia-400 !border-0 !text-white text-base shadow-lg shadow-violet-800/40"
              >
                {t('auth.signUp')}
              </Button>
            </div>
          </nav>
        </Drawer>
      )}


    </>
  );
};

export default React.memo(Header);
