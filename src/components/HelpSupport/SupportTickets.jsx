import { useState } from "react";
import { Link } from "react-router-dom";
import { tickets } from "./mockData";
import { Ticket as TicketIcon, Plus, Filter, Clock, MessageSquare } from "lucide-react";

export default function SupportTickets() {
  const [filterStatus, setFilterStatus] = useState("All");

  const filteredTickets =
    filterStatus === "All"
      ? tickets
      : tickets.filter((t) => t.status === filterStatus);

  const getStatusColor = (status) => {
    switch (status) {
      case "Resolved":
        return "bg-green-100 text-green-700 border-green-200";
      case "In Progress":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Open":
        return "bg-violet-100 text-violet-700 border-violet-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700 border-red-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Low":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md border border-slate-200/60 border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">My Support Tickets</h2>
            <p className="text-slate-600">Track and manage your support requests</p>
          </div>
          <Link
            to="/help-support/tickets/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md border-0 transition-all font-medium"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">New Ticket</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-5 h-5 text-slate-400" />
          <span className="text-sm text-slate-600 mr-2">Filter:</span>
          {["All", "Open", "In Progress", "Resolved"].map((status) => (
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
      </div>

      {/* Tickets List */}
      {filteredTickets.length > 0 ? (
        <div className="space-y-4">
          {filteredTickets.map((ticket) => (
            <Link
              key={ticket.id}
              to={`/help-support/tickets/${ticket.id}`}
              className="block bg-white rounded-lg shadow-md border border-slate-200/60 border border-slate-200 p-6 hover:border-violet-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="text-sm font-mono text-slate-500">{ticket.id}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        ticket.status
                      )}`}
                    >
                      {ticket.status}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                        ticket.priority
                      )}`}
                    >
                      {ticket.priority} Priority
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{ticket.subject}</h3>
                  <p className="text-slate-600 text-sm line-clamp-2">{ticket.description}</p>
                </div>
                {ticket.chatEnabled && (
                  <div className="ml-4">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-lg border border-green-200">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm font-medium">Chat Active</span>
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6 text-sm text-slate-500 flex-wrap">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Updated: {new Date(ticket.updatedAt).toLocaleDateString()}</span>
                </div>
                <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded">{ticket.category}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-slate-200/60 border border-slate-200 p-12 text-center">
          <TicketIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No tickets found</h3>
          <p className="text-slate-600 mb-6">
            {filterStatus === "All"
              ? "You haven't created any support tickets yet."
              : `No ${filterStatus.toLowerCase()} tickets found.`}
          </p>
          <Link
            to="/help-support/tickets/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md border-0 transition-all font-medium"
          >
            <Plus className="w-5 h-5" />
            Create Your First Ticket
          </Link>
        </div>
      )}
    </div>
  );
}
