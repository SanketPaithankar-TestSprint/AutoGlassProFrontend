import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { articles, categories } from "./mockData";
import { ChevronDown, ChevronRight, FileText, Calendar } from "lucide-react";

export default function HelpArticles() {
  const [expandedCategories, setExpandedCategories] = useState(["Getting Started"]);
  const { searchQuery } = useOutletContext() || {};

  const toggleCategory = (category) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const filteredArticles = searchQuery
    ? articles.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : articles;

  const articlesByCategory = filteredArticles.reduce((acc, article) => {
    if (!acc[article.category]) {
      acc[article.category] = [];
    }
    acc[article.category].push(article);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md border border-slate-200/60 border border-slate-200 p-6">
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Knowledge Base</h2>
        <p className="text-slate-600">
          Browse our help articles to find answers to common questions and learn
          more about our platform.
        </p>
      </div>

      {/* Categories Overview */}
      {!searchQuery && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => toggleCategory(category.name)}
              className="bg-white rounded-lg shadow-md border border-slate-200/60 border border-slate-200 p-4 hover:border-violet-300 hover:shadow-md transition-all text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-900">{category.name}</h3>
                {expandedCategories.includes(category.name) ? (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <p className="text-sm text-slate-500">
                {category.count} {category.count === 1 ? "article" : "articles"}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Articles by Category */}
      <div className="space-y-6">
        {Object.entries(articlesByCategory).map(([category, categoryArticles]) => {
          const isExpanded = searchQuery || expandedCategories.includes(category);

          return (
            <div
              key={category}
              className="bg-white rounded-lg shadow-md border border-slate-200/60 border border-slate-200 overflow-hidden"
            >
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-violet-600" />
                  <h3 className="text-lg font-semibold text-slate-900">{category}</h3>
                  <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-full text-sm">
                    {categoryArticles.length}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                )}
              </button>

              {isExpanded && (
                <div className="border-t border-slate-200 divide-y divide-slate-100">
                  {categoryArticles.map((article) => (
                    <Link
                      key={article.id}
                      to={`articles/${article.id}`}
                      className="block p-6 hover:bg-slate-50 border-slate-200 transition-colors group"
                    >
                      <h4 className="font-medium text-slate-900 mb-2 group-hover:text-violet-600">
                        {article.title}
                      </h4>
                      <p className="text-sm text-slate-600 mb-3">{article.description}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Last updated:{" "}
                          {new Date(article.lastUpdated).toLocaleDateString()}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredArticles.length === 0 && (
        <div className="bg-white rounded-lg shadow-md border border-slate-200/60 border border-slate-200 p-12 text-center">
          <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No articles found</h3>
          <p className="text-slate-600">
            {searchQuery
              ? `No articles match "${searchQuery}". Try different keywords.`
              : "Check back later for helpful articles and guides."}
          </p>
        </div>
      )}
    </div>
  );
}
