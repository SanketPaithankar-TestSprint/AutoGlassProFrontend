import React, { useEffect, useState } from "react";
import { Layout, Button, Space, Drawer, Modal } from "antd";
import { CarOutlined, MenuOutlined } from "@ant-design/icons";
import SignUpForm from "./SignUpForm";
import Login from "./login";
import { getValidToken } from "../api/getValidToken";

const { Header: AntHeader } = Layout;

const useIsMobile = () =>
{
    const [isMobile, setIsMobile] = useState(
        typeof window !== "undefined" ? window.innerWidth < 1024 : true
    );

    useEffect(() =>
    {
        const mql = window.matchMedia("(max-width: 1023.98px)");
        const onChange = (e) => setIsMobile(e.matches);
        setIsMobile(mql.matches);
        if (mql.addEventListener) mql.addEventListener("change", onChange);
        else mql.addListener(onChange);
        return () =>
        {
            if (mql.removeEventListener) mql.removeEventListener("change", onChange);
            else mql.removeListener(onChange);
        };
    }, []);
    return isMobile;
};

const Header = () =>
{
    const isMobile = useIsMobile();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [isAuthed, setIsAuthed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() =>
    {
        const token = getValidToken();
        if (token)
        {
            setIsAuthed(true);
        } else
        {
            setIsAuthed(false);
        }
        setLoading(false); // Set loading to false after token check
    }, []);

    useEffect(() =>
    {
        if (!isMobile) setDrawerOpen(false);
    }, [isMobile]);

    useEffect(() =>
    {
        const onScroll = () =>
        {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const menuItems = [
        { key: "home", label: "Home", href: "/" },
        { key: "pricing", label: "Pricing", href: "/pricing" },
        { key: "about", label: "About", href: "/about" },
        { key: "contact", label: "Contact", href: "/contact" },
    ];

    const NavLink = ({ label, href }) => (
        <a
            href={href}
            className="inline-flex items-center px-1 py-1 rounded-md text-white/90 hover:text-white outline-none transition"
            style={{ WebkitTapHighlightColor: "transparent" }}
        >
            {label}
        </a>
    );

    if (loading)
    {
        return <div>Loading...</div>;  // Optionally, replace with a loading spinner or skeleton
    }

    return (
        <>
            <div className="bg-gradient-to-r from-violet-500 to-indigo-500">
                <AntHeader
                    className={`fixed top-0 left-0 right-0 z-[1] transition-all duration-300
                flex items-center
                ${scrolled ? "h-14" : "h-24"} px-4 md:px-6`}
                    style={{ boxShadow: "0 2px 8px 0 rgba(0,0,0,0.08)" }}
                >
                    <div className="flex items-center text-white">
                        <CarOutlined className="text-2xl mr-2" />
                        <span className="text-xl font-bold tracking-tight">AutoPaneAi</span>
                    </div>
                    <nav className="hidden lg:flex flex-1 justify-center">
                        <ul className="flex items-center gap-8 xl:gap-12">
                            {menuItems.map((item) => (
                                <li key={item.key} className="list-none">
                                    <NavLink label={item.label} href={item.href} />
                                </li>
                            ))}
                        </ul>
                    </nav>
                    {/* Desktop buttons */}
                    {!isAuthed && (
                        <div className="hidden lg:block">
                            <Space>
                                <Button
                                    type="text"
                                    className="!h-9 !px-3 !text-white/90 hover:!text-white !bg-transparent hover:!bg-transparent !border-0 focus:!outline-none focus:!ring-0 focus:!shadow-none hover:!shadow-none active:!shadow-none"
                                    onClick={() => setLoginModalOpen(true)}
                                >
                                    Login
                                </Button>
                                <Button
                                    type="primary"
                                    onClick={() => setModalOpen(true)}
                                    className="!h-9 !px-5 !rounded-full !bg-[#7c3aed] hover:!bg-[#6d28d9] !border-transparent !text-white focus:!outline-none focus:!ring-0 focus:!shadow-none hover:!shadow-none active:!shadow-none"
                                >
                                    Sign Up
                                </Button>
                            </Space>
                        </div>
                    )}
                    {isMobile && (
                        <Button
                            type="text"
                            aria-label="Open navigation"
                            icon={<MenuOutlined />}
                            onClick={() => setDrawerOpen(true)}
                            className="ml-auto !text-white !text-xl !bg-transparent hover:!bg-transparent !border-0 focus:!outline-none focus:!ring-0 focus:!shadow-none hover:!shadow-none active:!shadow-none"
                        />
                    )}
                </AntHeader>
                {isMobile && (
                    <Drawer
                        title={
                            <div className="flex items-center">
                                <CarOutlined className="text-xl mr-2" />
                                <span className="font-semibold">AutoGlass Pro</span>
                            </div>
                        }
                        placement="right"
                        open={drawerOpen}
                        onClose={() => setDrawerOpen(false)}
                        bodyStyle={{ padding: 0 }}
                        maskClosable
                        destroyOnClose
                    >
                        <nav className="p-3">
                            <ul className="space-y-1">
                                {menuItems.map((item) => (
                                    <li key={item.key}>
                                        <a
                                            href={item.href}
                                            className="block px-3 py-2 rounded-md text-gray-800 hover:text-white hover:bg-[#6d28d9] outline-none"
                                            style={{ WebkitTapHighlightColor: "transparent" }}
                                            onClick={() => setDrawerOpen(false)}
                                        >
                                            {item.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                            {!isAuthed && (
                                <div className="px-3 pt-3 border-t mt-3">
                                    <Button
                                        type="text"
                                        className="w-full !h-10 !text-gray-800 !bg-transparent hover:!bg-transparent !border-0 focus:!outline-none focus:!ring-0 focus:!shadow-none hover:!shadow-none active:!shadow-none"
                                        onClick={() =>
                                        {
                                            setDrawerOpen(false);
                                            setLoginModalOpen(true); // Add onClick for mobile
                                        }}
                                    >
                                        Login
                                    </Button>
                                    <Button
                                        type="primary"
                                        onClick={() =>
                                        {
                                            setDrawerOpen(false);
                                            setModalOpen(true);
                                        }}
                                        className="w-full !h-10 !mt-2 !rounded-full !bg-[#7c3aed] hover:!bg-[#6d28d9] !border-transparent !text-white focus:!outline-none focus:!ring-0 focus:!shadow-none hover:!shadow-none active:!shadow-none"
                                    >
                                        Sign Up
                                    </Button>
                                </div>)}
                        </nav>
                    </Drawer>
                )}
                <Modal
                    title="Create Your AutoGlass Pro Account"
                    open={modalOpen}
                    onCancel={() => setModalOpen(false)}
                    footer={null}
                    destroyOnClose
                    className="signup-modal"
                >
                    <SignUpForm />
                </Modal>
                <Modal
                    title="Login to AutoGlass Pro"
                    open={loginModalOpen}
                    onCancel={() => setLoginModalOpen(false)}
                    footer={null}
                    destroyOnClose
                    className="login-modal"
                >
                    <Login />
                </Modal>
                <div className="h-16" />
            </div>
        </>
    );
};

export default Header;
