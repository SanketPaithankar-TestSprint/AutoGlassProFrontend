import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Ticket,
  Phone,
  Mail,
  HelpCircle,
  Menu,
  X,
  MessageCircle,
  FileText,
  User
} from 'lucide-react';

export default function HelpSupportPage() {
  console.log('🚀 HelpSupportPage component mounted');

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  console.log('📍 Current location:', location.pathname);

  const navItems = [
    { path: "/help/categories", label: "Help Articles", icon: BookOpen },
    { path: "/help/tickets", label: "Raise a ticket", icon: Ticket },
    { path: "/help/contact", label: "Contact Support", icon: Phone },
  ];

  const isActive = (path) => {
    if (path === "/help/categories") {
      return location.pathname === "/help/categories" || location.pathname.startsWith("/help/articles");
    }
    if (path === "/help/contact") {
      return location.pathname === "/help/contact";
    }
    if (path === "/help/tickets") {
      return location.pathname === "/help/tickets";
    }
    return location.pathname.startsWith(path);
  };

  // If we're on the main help page (exact match), show the welcome content without sidebar
  if (location.pathname === "/help" || location.pathname === "/sos") {
    return (
      <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 bg-slate-100">
        <div className="max-w-[1600px] mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
            <div className="flex items-center gap-2">
              <h1 className="!text-[30px] font-extrabold text-slate-800 m-0">Help &amp; Support</h1>
              <HelpCircle className="w-5 h-5 text-slate-400 hover:text-violet-500 transition-colors" />
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-white shadow-md border border-slate-200/60 border border-slate-200 hover:bg-slate-50 text-slate-700"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </header>

          {/* Main Content - Welcome Dashboard (full width) */}
          <div className="bg-white rounded-xl shadow-md border border-slate-200/60 p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Quick Actions</h2>
            <p className="text-slate-600 mb-6">
              Choose an option below to get the help you need with AutoPane AI.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/help/categories"
                className="p-6 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <BookOpen className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="font-semibold text-blue-800 mb-2">Help Articles</h3>
                <p className="text-blue-600 text-sm">Browse our knowledge base for guides and tutorials</p>
              </Link>

              <Link
                to="/help/tickets"
                className="p-6 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Ticket className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="font-semibold text-blue-800 mb-2">Raise a ticket</h3>
                <p className="text-blue-600 text-sm">Submit and track your support requests</p>
              </Link>

              <Link
                to="/help/contact"
                className="p-6 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Phone className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="font-semibold text-blue-800 mb-2">Contact Support</h3>
                <p className="text-blue-600 text-sm">Schedule a callback or reach out to our team</p>
              </Link>

            </div>
          </div>

          {/* Footer with Contact Info */}
          <footer className="text-center text-sm text-slate-500 mt-8">
            <p className="font-medium">Contact Us</p>
            <p>Mon - Fri: 10:00 AM - 6:00 PM</p>
            <p>support@autopaneai.com</p>
          </footer>
        </div>
      </div>
    );
  }

  // For sub-pages, show the layout with sidebar and outlet
  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 bg-slate-100">
      <div className="max-w-[1600px] mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center gap-2">
            <h1 className="!text-[30px] font-extrabold text-slate-800 m-0">Help &amp; Support</h1>
            <HelpCircle className="w-5 h-5 text-slate-400 hover:text-violet-500 transition-colors" />
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-white shadow-md border border-slate-200/60 border border-slate-200 hover:bg-slate-50 text-slate-700"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Sidebar Navigation */}
          <aside
            className={`${mobileMenuOpen ? "block" : "hidden"
              } lg:block w-full lg:w-60 flex-shrink-0`}
          >
            <nav className="bg-white rounded-xl shadow-md border border-slate-200/60 border border-slate-200 p-4 sticky top-16 mt-4">
              {/* Sidebar Title */}
              <div className="mb-6 text-center lg:text-left">
                <h2 className="text-lg font-bold text-slate-800 m-0">Quick Actions</h2>
              </div>

              {/* Navigation */}
              <ul className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${active
                            ? "bg-blue-600 text-white font-bold"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {/* Contact Info */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h3 className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Contact Us
                </h3>
                <div className="px-4 space-y-2 text-sm text-slate-500 font-medium">
                  <p>Mon - Fri: 9:00 AM - 6:00 PM</p>
                  <p>support@autopaneai.com</p>
                </div>
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 relative min-h-[calc(100vh-12rem)]">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
