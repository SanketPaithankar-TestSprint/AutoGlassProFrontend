import { useState } from "react";
import { Link } from "react-router-dom";
import { Phone, CheckCircle, Calendar, Clock } from "lucide-react";

export default function RequestCall() {
  const [formData, setFormData] = useState({
    preferredDate: "",
    preferredTime: "",
    contactNumber: "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-slate-200/60 border border-slate-200 p-12 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">Call Request Scheduled!</h2>
        <p className="text-slate-600 mb-4">Your call has been successfully scheduled.</p>
        <div className="bg-violet-50 rounded-lg p-6 mb-8 text-left">
          <h3 className="font-semibold text-slate-900 mb-3">Call Details:</h3>
          <div className="space-y-2 text-sm text-slate-700">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-violet-600" />
              <span>Date: {new Date(formData.preferredDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-violet-600" />
              <span>Time: {formData.preferredTime}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-violet-600" />
              <span>Contact: {formData.contactNumber}</span>
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-500 mb-8">
          A confirmation email has been sent to your registered email address. Our support team will call you at the scheduled time.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            to="/help-support/tickets"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md border-0 transition-all font-medium"
          >
            View My Tickets
          </Link>
          <Link
            to="/help-support"
            className="px-6 py-3 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
          >
            Back to Help Center
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md border border-slate-200/60 border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-violet-100 rounded-lg">
            <Phone className="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Request a Call</h2>
            <p className="text-slate-600">Schedule a call with our support team</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow-md border border-slate-200/60 border border-slate-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Preferred Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="preferredDate" className="block text-sm font-medium text-slate-900 mb-2">
                Preferred Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="preferredDate"
                required
                min={new Date().toISOString().split("T")[0]}
                value={formData.preferredDate}
                onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="preferredTime" className="block text-sm font-medium text-slate-900 mb-2">
                Preferred Time <span className="text-red-500">*</span>
              </label>
              <select
                id="preferredTime"
                required
                value={formData.preferredTime}
                onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              >
                <option value="">Select a time</option>
                <option value="9:00 AM - 10:00 AM">9:00 AM - 10:00 AM</option>
                <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                <option value="12:00 PM - 1:00 PM">12:00 PM - 1:00 PM</option>
                <option value="1:00 PM - 2:00 PM">1:00 PM - 2:00 PM</option>
                <option value="2:00 PM - 3:00 PM">2:00 PM - 3:00 PM</option>
                <option value="3:00 PM - 4:00 PM">3:00 PM - 4:00 PM</option>
                <option value="4:00 PM - 5:00 PM">4:00 PM - 5:00 PM</option>
                <option value="5:00 PM - 6:00 PM">5:00 PM - 6:00 PM</option>
              </select>
            </div>
          </div>

          {/* Contact Number */}
          <div>
            <label htmlFor="contactNumber" className="block text-sm font-medium text-slate-900 mb-2">
              Contact Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="contactNumber"
              required
              value={formData.contactNumber}
              onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              placeholder="+1 (555) 123-4567"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
            <p className="mt-2 text-sm text-slate-500">
              Please ensure this number is available at the scheduled time.
            </p>
          </div>

          {/* Additional Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-900 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              id="notes"
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Let us know what you'd like to discuss..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Info Box */}
          <div className="p-4 bg-violet-50 rounded-lg border border-violet-200">
            <h3 className="font-semibold text-slate-900 mb-2">Before You Schedule:</h3>
            <ul className="space-y-1 text-sm text-slate-700">
              <li>• Our support hours are Monday to Friday, 9:00 AM - 6:00 PM</li>
              <li>• Please have your account information ready</li>
              <li>• Calls typically last 15-30 minutes</li>
              <li>• You'll receive a confirmation email shortly</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-6 border-t border-slate-200">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md border-0 transition-all font-medium"
            >
              Schedule Call
            </button>
            <Link
              to="/help-support"
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
