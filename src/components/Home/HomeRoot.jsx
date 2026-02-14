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
import { motion } from "framer-motion";

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
        <div className="relative text-slate-900 overflow-hidden bg-slate-50/50" style={{ minHeight: 'calc(var(--vh, 1vh) * 100)' }}>
            {/* Global Gradient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <motion.div
                    className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] min-w-[500px] min-h-[500px] rounded-full blur-[120px] opacity-20"
                    style={{ background: 'linear-gradient(135deg, #7E5CFE 0%, #00A8E4 100%)', willChange: 'transform, opacity' }}
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.15, 0.25, 0.15],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] min-w-[500px] min-h-[500px] rounded-full blur-[120px] opacity-20"
                    style={{ background: 'linear-gradient(135deg, #00A8E4 0%, #7E5CFE 100%)', willChange: 'transform, opacity' }}
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.15, 0.25, 0.15],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                />

            </div>

            <div className="relative z-10">
                {/* Spacer for sticky header if you have one */}
                {/* <div className="h-16" />*/}

                {/* Hero */}
                <HeroSection className="" />

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
        </div>
    )
};

export default Home;
