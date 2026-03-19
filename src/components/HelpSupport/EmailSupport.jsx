import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Copy, CheckCircle, ExternalLink, Clock } from "lucide-react";

export default function EmailSupport() {
  const [copied, setCopied] = useState(false);
  const supportEmail = "support@autopaneai.com";

  const handleCopy = () => {
    navigator.clipboard.writeText(supportEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenEmail = () => {
    window.location.href = `mailto:${supportEmail}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md border border-slate-200/60 border border-slate-200 p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-violet-100 rounded-lg">
            <Mail className="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Email Support</h2>
            <p className="text-slate-600">Reach out to us via email for assistance</p>
          </div>
        </div>
      </div>

      {/* Main Email Section */}
      <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-lg shadow-md border border-slate-200/60 border border-violet-200 p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Our Support Email Address</h3>
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-white rounded-lg shadow-md border border-slate-200/60 border border-slate-200 mb-6">
            <Mail className="w-5 h-5 text-violet-600" />
            <span className="text-xl font-medium text-slate-900">{supportEmail}</span>
          </div>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5" />
                  Copy Email
                </>
              )}
            </button>
            <button
              onClick={handleOpenEmail}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md border-0 transition-all font-medium"
            >
              <ExternalLink className="w-5 h-5" />
              Open Email Client
            </button>
          </div>
        </div>
      </div>

      {/* Response Times */}
      <div className="bg-white rounded-lg shadow-md border border-slate-200/60 border border-slate-200 p-6">
        <div className="flex items-start gap-3 mb-4">
          <Clock className="w-6 h-6 text-violet-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Response Times</h3>
            <p className="text-slate-600 mb-4">We strive to respond to all emails as quickly as possible.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-slate-900 mb-1">High Priority</h4>
            <p className="text-2xl font-bold text-green-600 mb-1">2-4 hours</p>
            <p className="text-sm text-slate-600">Critical issues affecting service</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-slate-900 mb-1">Medium Priority</h4>
            <p className="text-2xl font-bold text-yellow-600 mb-1">8-12 hours</p>
            <p className="text-sm text-slate-600">General support questions</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="font-semibold text-slate-900 mb-1">Low Priority</h4>
            <p className="text-2xl font-bold text-slate-600 mb-1">24-48 hours</p>
            <p className="text-sm text-slate-600">Feature requests & feedback</p>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-500">
          * Response times are for business hours (Monday - Friday, 9:00 AM - 6:00 PM).
        </p>
      </div>

      {/* Alternative Contact Methods */}
      <div className="bg-white rounded-lg shadow-md border border-slate-200/60 border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Need Faster Help?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/help-support/tickets/new"
            className="p-4 border border-slate-200 rounded-lg hover:border-violet-300 hover:shadow-md transition-all group"
          >
            <h4 className="font-medium text-slate-900 mb-1 group-hover:text-violet-600">Create a Support Ticket</h4>
            <p className="text-sm text-slate-600">Get tracked support with live chat option</p>
          </Link>
          <Link
            to="/help-support/request-call"
            className="p-4 border border-slate-200 rounded-lg hover:border-violet-300 hover:shadow-md transition-all group"
          >
            <h4 className="font-medium text-slate-900 mb-1 group-hover:text-violet-600">Request a Call</h4>
            <p className="text-sm text-slate-600">Schedule a phone call with our team</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
