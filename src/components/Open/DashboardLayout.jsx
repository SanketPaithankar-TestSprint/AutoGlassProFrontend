import React from 'react';

const DashboardLayout = ({ children, sidebar, isMobile, sidebarOpen, setSidebarOpen }) => {

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
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;
