import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { articles } from "./mockData";
import { ChevronLeft, ThumbsUp, ThumbsDown, Calendar, CheckCircle } from "lucide-react";

export default function ArticleView() {
  const { id } = useParams();
  const article = articles.find((a) => a.id === id);
  const [feedback, setFeedback] = useState(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  if (!article) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-slate-200/60 border border-slate-200 p-12 text-center">
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">Article not found</h2>
        <p className="text-slate-600 mb-6">The article you're looking for doesn't exist.</p>
        <Link
          to="/help-support"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md border-0 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Help Articles
        </Link>
      </div>
    );
  }

  const handleFeedback = (type) => {
    setFeedback(type);
    setFeedbackSubmitted(true);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-slate-600 flex-wrap">
        <Link to="/help-support" className="hover:text-violet-600 transition-colors">
          Help Articles
        </Link>
        <span>/</span>
        <Link to="/help-support" className="hover:text-violet-600 transition-colors">
          {article.category}
        </Link>
        <span>/</span>
        <span className="text-slate-900">{article.title}</span>
      </div>

      {/* Article Content */}
      <article className="bg-white rounded-lg shadow-md border border-slate-200/60 border border-slate-200 p-8">
        <header className="mb-6 pb-6 border-b border-slate-200">
          <h1 className="text-3xl font-semibold text-slate-900 mb-4">{article.title}</h1>
          <div className="flex items-center gap-4 text-sm text-slate-600 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Last updated: {new Date(article.lastUpdated).toLocaleDateString()}</span>
            </div>
            <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full">
              {article.category}
            </span>
          </div>
        </header>

        {/* Article body */}
        <div className="prose prose-blue max-w-none">
          <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.75" }}>
            {article.content.split("\n").map((line, index) => {
              if (line.startsWith("# ")) {
                return (
                  <h1 key={index} className="text-2xl font-semibold text-slate-900 mt-8 mb-4">
                    {line.replace("# ", "")}
                  </h1>
                );
              }
              if (line.startsWith("## ")) {
                return (
                  <h2 key={index} className="text-xl font-semibold text-slate-900 mt-6 mb-3">
                    {line.replace("## ", "")}
                  </h2>
                );
              }
              if (line.startsWith("- ")) {
                return (
                  <li key={index} className="ml-6 text-slate-700">
                    {line.replace("- ", "")}
                  </li>
                );
              }
              if (line.trim() === "") {
                return <br key={index} />;
              }
              return (
                <p key={index} className="text-slate-700 mb-3">
                  {line}
                </p>
              );
            })}
          </div>
        </div>

        {/* Feedback Section */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          {!feedbackSubmitted ? (
            <div className="text-center">
              <h3 className="text-lg font-medium text-slate-900 mb-4">Was this helpful?</h3>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => handleFeedback("helpful")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all ${
                    feedback === "helpful"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-slate-300 hover:border-green-500 hover:bg-green-50"
                  }`}
                >
                  <ThumbsUp className="w-5 h-5" />
                  <span className="font-medium">Yes</span>
                </button>
                <button
                  onClick={() => handleFeedback("not-helpful")}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all ${
                    feedback === "not-helpful"
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-slate-300 hover:border-red-500 hover:bg-red-50"
                  }`}
                >
                  <ThumbsDown className="w-5 h-5" />
                  <span className="font-medium">No</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="inline-flex items-center gap-3 px-6 py-4 bg-green-50 text-green-700 rounded-lg">
                <CheckCircle className="w-6 h-6" />
                <span className="font-medium">Thank you for your feedback!</span>
              </div>
            </div>
          )}
        </div>

        {/* Still Need Help CTA */}
        <div className="mt-8 p-6 bg-violet-50 rounded-lg border border-violet-200">
          <h3 className="text-lg font-medium text-slate-900 mb-2">Still need help?</h3>
          <p className="text-slate-600 mb-4">
            Our support team is ready to assist you with any questions.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/help-support/tickets/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md border-0 transition-all"
            >
              Create a Support Ticket
            </Link>
            <Link
              to="/help-support/email-support"
              className="inline-flex items-center px-4 py-2 bg-white text-violet-600 border border-violet-600 rounded-lg hover:bg-slate-50 border-slate-200 transition-colors"
            >
              Email Support
            </Link>
          </div>
        </div>
      </article>

      {/* Back Button */}
      <Link
        to="/help-support"
        className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to all articles
      </Link>
    </div>
  );
}
