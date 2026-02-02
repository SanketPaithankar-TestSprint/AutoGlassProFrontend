// Home.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getValidToken } from "../../api/getValidToken";
import HeroSection from "./HeroSection";
import ValuePropSection from "./ValuePropSection";
import FeaturesSection from "./FeaturesSection";
import WorkflowSection from "./WorkflowSection";
import ProcessSection from "./ProcessSection";
import BusinessModelsSection from "./BusinessModelsSection";
import WhyChooseSection from "./WhyChooseSection";
import { SearchOutlined, CarOutlined } from "@ant-design/icons";

const Home = () => {
    const navigate = useNavigate();
    const [isAuthed, setIsAuthed] = useState(false);
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        const token = getValidToken();
        setIsAuthed(Boolean(token));
    }, []);
    useEffect(() => {
        setMounted(true)
        document.title = "APAI | Home";
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-b from-white via-indigo-50/30 to-blue-50/30 text-slate-900 pb-16">
            {/* Spacer for sticky header if you have one */}
            {/* <div className="h-16" />*/}

            {/* Hero */}
            <HeroSection />

            {/* Main content - Value Proposition & Features */}
            <div
                className={`transition-all duration-700 ${mounted
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                    }`}
            >
                <ValuePropSection />
            </div>
        </div>
    )
};

export default Home;
