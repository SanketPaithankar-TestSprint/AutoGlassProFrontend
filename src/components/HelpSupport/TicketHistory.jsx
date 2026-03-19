import { useState } from "react";
import { Link } from "react-router-dom";
import { tickets } from "./mockData";
import { History as HistoryIcon, Filter, Search, Clock, MessageSquare, ChevronRight } from "lucide-react";

export default function TicketHistory() {
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTickets = tickets.filter((ticket) => {
    const statusMatch =
      filterStatus === "All"
        ? true
        : filterStatus === "Open"
        ? ticket.status === "Open" || ticket.status === "In Progress"
        : ticket.status === "Resolved";

    const searchMatch =
      searchQuery === "" ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase());

    return statusMatch && searchMatch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Resolved": return "bg-green-100 text-green-700 border-green-200";
      case "In Progress": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Open": return "bg-violet-100 text-violet-700 border-violet-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-700 border-red-200";
      case "Medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Low": return "bg-slate-100 text-slate-700 border-slate-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md border border-slate-200/60 border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-violet-100 rounded-lg">
            <HistoryIcon className="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Ticket & Chat History</h2>
            <p className="text-slate-600">View all your previous support interactions</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search tickets by ID, subject, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-5 h-5 text-slate-400" />
            <span className="text-sm text-slate-600 mr-2">Filter:</span>
            {["All", "Open", "Closed"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === status
                    ? "bg-violet-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="p-4 bg-violet-50 rounded-lg border border-violet-200">
              <p className="text-sm text-slate-600 mb-1">Total Tickets</p>
              <p className="text-2xl font-bold text-violet-600">{tickets.length}</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-slate-600 mb-1">Open Tickets</p>
              <p className="text-2xl font-bold text-yellow-600">
                {tickets.filter((t) => t.status === "Open" || t.status === "In Progress").length}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-slate-600 mb-1">Resolved Tickets</p>
              <p className="text-2xl font-bold text-green-600">
                {tickets.filter((t) => t.status === "Resolved").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      {filteredTickets.length > 0 ? (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <Link
              key={ticket.id}
              to={`/help-support/tickets/${ticket.id}`}
              className="block bg-white rounded-lg shadow-md border border-slate-200/60 border border-slate-200 p-6 hover:border-violet-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="text-sm font-mono text-slate-500">{ticket.id}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs">
                      {ticket.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-violet-600">
                    {ticket.subject}
                  </h3>
                  <p className="text-slate-600 text-sm line-clamp-2 mb-3">{ticket.description}</p>
                  <div className="flex items-center gap-6 text-sm text-slate-500 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Updated: {new Date(ticket.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="ml-4 flex items-center gap-4">
                  {ticket.chatEnabled && (
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-lg border border-green-200">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm font-medium">Has Chat</span>
                    </span>
                  )}
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-violet-600 transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-slate-200/60 border border-slate-200 p-12 text-center">
          <HistoryIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No tickets found</h3>
          <p className="text-slate-600 mb-6">
            {searchQuery
              ? "No tickets match your search criteria. Try different keywords."
              : filterStatus === "All"
              ? "You haven't created any support tickets yet."
              : `No ${filterStatus.toLowerCase()} tickets found.`}
          </p>
          {!searchQuery && (
            <Link
              to="/help-support/tickets/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md border-0 transition-all font-medium"
            >
              Create Your First Ticket
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
