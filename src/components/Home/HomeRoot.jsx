// Home.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getValidToken } from "../../api/getValidToken";
import HeroSection from "./HeroSection";
import { SearchOutlined, CarOutlined } from "@ant-design/icons";

const Home = () =>
{
    const navigate = useNavigate();
    const [isAuthed, setIsAuthed] = useState(false);

    useEffect(() =>
    {
        const token = getValidToken();
        setIsAuthed(Boolean(token));
    }, []);

    return (
        <div className="">
            {/* Spacer for sticky header */}
            <div className="" />
            <HeroSection />

            {/* Auth space */}
            <div className="flex justify-end mb-4">
                {isAuthed ? <div /> : <div />}
            </div>

            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold mb-2">Welcome to AutoPaneAi</h2>
                <p className="text-gray-700 mb-4">
                    Explore vehicle data, decode VINs, and visualize models in 3D once you sign in to your account.
                </p>
                <div className="border-b border-gray-200 mb-8" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Search by VIN */}
                    <div className="bg-white rounded-xl shadow p-6 flex flex-col justify-between">
                        <div>
                            <h3 className="text-xl font-semibold mb-2">Search by VIN</h3>
                            <p className="text-gray-600 mb-4">Decode a VIN and fetch specs from your backend.</p>
                        </div>
                        <button
                            type="button"
                            className="mt-4 inline-flex items-center gap-2 px-6 py-2 rounded-full bg-violet-600 text-white font-semibold hover:bg-violet-700 transition"
                            onClick={() => navigate("/search-by-vin")}
                        >
                            <SearchOutlined />
                            Open
                        </button>
                    </div>

                    {/* Search by YMM */}
                    <div className="bg-white rounded-xl shadow p-6 flex flex-col justify-between">
                        <div>
                            <h3 className="text-xl font-semibold mb-2">Search by YMM</h3>
                            <p className="text-gray-600 mb-4">Find vehicles by Year, Make, and Model.</p>
                        </div>
                        <button
                            type="button"
                            className="mt-4 inline-flex items-center gap-2 px-6 py-2 rounded-full bg-violet-600 text-white font-semibold hover:bg-violet-700 transition"
                            onClick={() => navigate("/search-by-ymm")}
                        >
                            <CarOutlined />
                            Open
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
