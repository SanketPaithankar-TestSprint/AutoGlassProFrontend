import React from "react";

const SearchByRoot = () =>
{
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
            <h1 className="text-3xl font-bold mb-4">Search By</h1>
            <div className="flex flex-col gap-6 w-full max-w-md">
                <a
                    href="/search-by-vin"
                    className="block bg-violet-600 text-white text-xl font-semibold rounded-xl py-6 px-4 text-center shadow hover:bg-violet-700 transition"
                >
                    Search by VIN
                </a>
                <a
                    href="/search-by-ymm"
                    className="block bg-indigo-500 text-white text-xl font-semibold rounded-xl py-6 px-4 text-center shadow hover:bg-indigo-600 transition"
                >
                    Search by Year, Make, Model
                </a>
            </div>
        </div>
    );
};

export default SearchByRoot;
