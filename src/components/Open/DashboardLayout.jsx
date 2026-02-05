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
                    transition-all duration-300 ease-in-out
                    bg-white shadow-sm overflow-y-auto overflow-x-hidden
                    ${isMobile
                        ? `fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
                        : `sticky top-0 h-screen ${sidebarOpen ? 'w-60 lg:w-64 xl:w-72 border-r border-slate-200' : 'w-0 border-none'}`
                    }
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
