import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Search,
  BookOpen,
  Ticket,
  Phone,
  Mail,
  History,
  HelpCircle,
  Menu,
  X,
} from "lucide-react";

export default function HelpSupportRoot() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: "/help-support", label: "Help Articles", icon: BookOpen },
    { path: "/help-support/tickets", label: "My Tickets", icon: Ticket },
    { path: "/help-support/email-support", label: "Email Support", icon: Mail },
    { path: "/help-support/request-call", label: "Request a Call", icon: Phone },
    { path: "/help-support/history", label: "History", icon: History },
  ];

  const isActive = (path) => {
    if (path === "/help-support") {
      return location.pathname === "/help-support";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 bg-slate-100">
      <div className="max-w-[1600px] mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center gap-2">
            <h1 className="!text-[30px] font-extrabold text-slate-800 m-0">Help &amp; Support</h1>
            <HelpCircle className="w-5 h-5 text-slate-400 hover:text-violet-500 transition-colors" />
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-white shadow-md border border-slate-200/60 border border-slate-200 hover:bg-slate-50 text-slate-700"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            {/* Search Bar */}
            <div className="flex-1 w-full md:w-[350px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm bg-white shadow-md border border-slate-200/60"
                />
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Sidebar Navigation */}
          <aside
            className={`${
              mobileMenuOpen ? "block" : "hidden"
            } lg:block w-full lg:w-60 flex-shrink-0`}
          >
            <nav className="bg-white rounded-xl shadow-md border border-slate-200/60 border border-slate-200 p-4 sticky top-4">
              <ul className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                          active
                            ? "bg-violet-50 text-violet-700 font-bold"
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

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h3 className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Quick Actions
                </h3>
                <Link
                  to="/help-support/tickets/new"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-sm font-medium"
                >
                  <Ticket className="w-5 h-5" />
                  <span>Raise a Ticket</span>
                </Link>
              </div>

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
          <main className="flex-1 min-w-0">
            <Outlet context={{ searchQuery }} />
          </main>
        </div>
      </div>
    </div>
  );
}
