import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';

const DashboardLayout = ({ children, sidebar, isMobile }) => {
    const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

    // Update sidebar state when isMobile changes
    useEffect(() => {
        setSidebarOpen(!isMobile);
    }, [isMobile]);

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Mobile Sidebar Overlay */}
            {isMobile && sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-30 transition-opacity duration-300"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    ${isMobile ? 'fixed inset-y-0 left-0 z-40 w-80' : 'sticky top-0 w-80 h-screen'}
                    overflow-y-auto transition-transform duration-300 ease-in-out
                    ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
                    bg-white border-r border-slate-200 shadow-sm
                `}
            >
                <div className="p-6 h-full">
                    {sidebar}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {/* Mobile Toggle Button */}
                {isMobile && (
                    <Button
                        type="primary"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="fixed bottom-6 right-6 z-20 shadow-lg"
                        shape="circle"
                        size="large"
                        icon={sidebarOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
                        style={{ 
                            backgroundColor: '#7c3aed', 
                            borderColor: '#7c3aed',
                            width: 56,
                            height: 56
                        }}
                    />
                )}

                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;
