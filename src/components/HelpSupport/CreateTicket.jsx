import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Upload, X, CheckCircle } from "lucide-react";

export default function CreateTicket() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    subject: "",
    category: "",
    priority: "Medium",
    description: "",
  });
  const [attachments, setAttachments] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState("");

  const categoryOptions = [
    "General Inquiry",
    "Billing",
    "Technical Support",
    "Feature Request",
    "Bug Report",
    "Account Issues",
    "Other",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTicketId = `TCK-2024-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;
    setTicketId(newTicketId);
    setSubmitted(true);
    setTimeout(() => {
      navigate("/help-support/tickets");
    }, 3000);
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-slate-200/60 border border-slate-200 p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">Ticket Submitted Successfully!</h2>
        <p className="text-slate-600 mb-2">Your support ticket has been created.</p>
        <p className="text-lg font-medium text-violet-600 mb-6">Ticket ID: {ticketId}</p>
        <p className="text-sm text-slate-500 mb-8">
          Our support team will review your ticket and respond shortly.
          Redirecting you to the tickets page...
        </p>
        <Link
          to="/help-support/tickets"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md border-0 transition-all font-medium"
        >
          View My Tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Link to="/help-support/tickets" className="hover:text-violet-600 transition-colors">
          My Tickets
        </Link>
        <span>/</span>
        <span className="text-slate-900">New Ticket</span>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-md border border-slate-200/60 border border-slate-200 p-8">
        <h2 className="text-2xl font-semibold text-slate-900 mb-6">Create Support Ticket</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-slate-900 mb-2">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="subject"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Brief description of your issue"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-900 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                <option value="">Select a category</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-slate-900 mb-2">
                Priority <span className="text-red-500">*</span>
              </label>
              <select
                id="priority"
                required
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-900 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              required
              rows={6}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Please provide detailed information about your issue..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
            />
            <p className="mt-2 text-sm text-slate-500">
              Be as specific as possible to help us resolve your issue quickly.
            </p>
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Attachments (Optional)
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-violet-400 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600 mb-2">Click to upload or drag and drop</p>
              <p className="text-xs text-slate-500 mb-4">PNG, JPG, PDF up to 10MB</p>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept=".png,.jpg,.jpeg,.pdf"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 bg-white text-violet-600 border border-violet-600 rounded-lg hover:bg-slate-50 border-slate-200 transition-colors cursor-pointer"
              >
                Select Files
              </label>
            </div>

            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <span className="text-sm text-slate-700 truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="ml-4 p-1 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-6 border-t border-slate-200">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md border-0 transition-all font-medium"
            >
              Submit Ticket
            </button>
            <Link
              to="/help-support/tickets"
              className="px-6 py-3 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
