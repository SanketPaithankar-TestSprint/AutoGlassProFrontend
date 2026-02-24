import React from 'react';

/**
 * Full-page loading buffer shown while prerequisite APIs are still in-flight.
 * Displays a spinner and human-readable labels for each pending API call.
 */
const QuotePageLoader = ({ loadingItems = [] }) => {
    return (
        <div className="flex items-center justify-center min-h-[60vh] w-full">
            <div className="bg-white rounded-2xl shadow-lg px-10 py-10 flex flex-col items-center gap-6 max-w-md w-full border border-slate-100">
                {/* Spinner */}
                <div className="relative flex items-center justify-center">
                    <div className="animate-spin rounded-full h-14 w-14 border-4 border-violet-200 border-t-violet-600" />
                </div>

                {/* Heading */}
                <div className="text-center">
                    <h2 className="text-lg font-semibold text-slate-800 mb-1">
                        Preparing your workspace
                    </h2>
                    <p className="text-sm text-slate-500">
                        We're loading the data needed to create your document. This will only take a moment.
                    </p>
                </div>

                {/* Loading items list */}
                {loadingItems.length > 0 && (
                    <ul className="w-full space-y-2">
                        {loadingItems.map((item, idx) => (
                            <li
                                key={idx}
                                className="flex items-center gap-2 text-sm text-slate-600"
                            >
                                <span className="inline-block h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
                                {item}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default QuotePageLoader;
