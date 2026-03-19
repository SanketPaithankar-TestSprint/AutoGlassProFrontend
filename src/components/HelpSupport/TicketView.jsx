import { Link, useParams } from "react-router-dom";
import { tickets } from "./mockData";
import { ChevronLeft, Clock, MessageSquare, Phone, Paperclip } from "lucide-react";

export default function TicketView() {
  const { id } = useParams();
  const ticket = tickets.find((t) => t.id === id);

  if (!ticket) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-slate-200/60 border border-slate-200 p-12 text-center">
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">Ticket not found</h2>
        <p className="text-slate-600 mb-6">The ticket you're looking for doesn't exist.</p>
        <Link
          to="/help-support/tickets"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md border-0 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Tickets
        </Link>
      </div>
    );
  }

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
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Link to="/help-support/tickets" className="hover:text-violet-600 transition-colors">
          My Tickets
        </Link>
        <span>/</span>
        <span className="text-slate-900">{ticket.id}</span>
      </div>

      {/* Ticket Details */}
      <div className="bg-white rounded-lg shadow-md border border-slate-200/60 border border-slate-200 p-8">
        {/* Header */}
        <div className="mb-6 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="text-sm font-mono text-slate-500">{ticket.id}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
              {ticket.status}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priority)}`}>
              {ticket.priority} Priority
            </span>
            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs">
              {ticket.category}
            </span>
          </div>

          <h1 className="text-2xl font-semibold text-slate-900 mb-4">{ticket.subject}</h1>

          <div className="flex items-center gap-6 text-sm text-slate-600 flex-wrap">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Created: {new Date(ticket.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Updated: {new Date(ticket.updatedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Description</h2>
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
        </div>

        {/* Attachments */}
        {ticket.attachments && ticket.attachments.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">Attachments</h2>
            <div className="space-y-2">
              {ticket.attachments.map((attachment, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <Paperclip className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-700">{attachment}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Status */}
        {ticket.chatEnabled ? (
          <div className="p-6 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">Live Chat Available</h3>
                <p className="text-slate-600">
                  Your ticket has been accepted. You can now chat with our support team.
                </p>
              </div>
              <Link
                to={`/help-support/chat/${ticket.id}`}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <MessageSquare className="w-5 h-5" />
                Open Chat
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-violet-50 rounded-lg border border-violet-200">
            <h3 className="text-lg font-medium text-slate-900 mb-2">Waiting for Support Team</h3>
            <p className="text-slate-600 mb-4">
              Our support team is reviewing your ticket. You'll be able to chat with an agent once the ticket is accepted.
            </p>
            <p className="text-sm text-slate-500">Average response time: 2-4 hours during business hours</p>
          </div>
        )}
      </div>

      {/* Additional Actions */}
      <div className="bg-white rounded-lg shadow-md border border-slate-200/60 border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Need More Help?</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/help-support/request-call"
            className="flex items-center gap-2 px-4 py-2 bg-white text-violet-600 border border-violet-600 rounded-lg hover:bg-slate-50 border-slate-200 transition-colors"
          >
            <Phone className="w-4 h-4" />
            Request a Call
          </Link>
          <Link
            to="/help-support/email-support"
            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Email Support
          </Link>
          <Link
            to="/help-support"
            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Browse Help Articles
          </Link>
        </div>
      </div>

      {/* Back Button */}
      <Link
        to="/help-support/tickets"
        className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to all tickets
      </Link>
    </div>
  );
}
