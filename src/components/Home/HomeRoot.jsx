// Home.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getValidToken } from "../../api/getValidToken";
import PageHead from "../PageHead";
import ValuePropSection from "./ValuePropSection";
import { motion } from "framer-motion";
import { Button } from "antd";
import VideoModal from "../VideoModal/VideoModal";
import BrowserMockup from "../../assets/browser_mockup.png";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(SplitText);

const Home = () => {
    const navigate = useNavigate();
    const [isAuthed, setIsAuthed] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isVideoOpen, setIsVideoOpen] = useState(false);
    const heroTitleRef = useRef(null);
    const heroDescRef = useRef(null);

    useEffect(() => {
        const token = getValidToken();
        setIsAuthed(Boolean(token));
    }, []);

    useEffect(() => {
        setMounted(true);
    }, []);

    // SplitText animations for title + description
    useGSAP(() => {
        // Title: wave color shift — faster, no word breaking
        if (heroTitleRef.current) {
            const split = SplitText.create(heroTitleRef.current, {
                type: "chars,words",
                wordsClass: "split-word",
            });
            // Make each word a nowrap inline-block so chars don't break mid-word
            split.words.forEach((word) => {
                word.style.whiteSpace = "nowrap";
                word.style.display = "inline-block";
            });
            gsap.from(split.chars, {
                y: 35,
                color: "#00FF66",
                opacity: 0,
                stagger: { each: 0.02, from: "start" },
                duration: 0.35,
                ease: "sine.out",
            });
        }

        // Description: words fade up with stagger
        if (heroDescRef.current) {
            const splitDesc = SplitText.create(heroDescRef.current, { type: "words" });
            gsap.from(splitDesc.words, {
                y: 20,
                opacity: 0,
                stagger: { each: 0.03, from: "start" },
                duration: 0.4,
                ease: "power2.out",
                delay: 0.5, // start after title finishes
            });
        }
    }, {});

    return (
        <div className="relative text-slate-900 overflow-hidden bg-slate-50/50" style={{ minHeight: 'calc(var(--vh, 1vh) * 100)' }}>
            <PageHead
                title="APAI | Smart Auto Glass Shop Management Software"
                description="Scale your auto glass business with APAI. Automate quoting, invoicing, and NAGS pricing. The all-in-one AI platform built to grow your shop for only $99/mo."
            />

            {/* Global Gradient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <motion.div
                    className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] min-w-[500px] min-h-[500px] rounded-full blur-[120px] opacity-20"
                    style={{ background: 'linear-gradient(135deg, #7E5CFE 0%, #00A8E4 100%)', willChange: 'transform, opacity' }}
                    animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] min-w-[500px] min-h-[500px] rounded-full blur-[120px] opacity-20"
                    style={{ background: 'linear-gradient(135deg, #00A8E4 0%, #7E5CFE 100%)', willChange: 'transform, opacity' }}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                />
            </div>

            <div className="relative z-10">
                {/* Hero Section */}
                <section
                    className="relative bg-transparent text-slate-900 py-0 flex justify-center items-center"
                    style={{ minHeight: 'calc(var(--vh, 1vh) * 100)' }}
                >
                    <div className="relative max-w-7xl mx-auto py-8 md:py-24 lg:py-32 px-3 sm:px-4 md:px-6 grid lg:grid-cols-12 gap-6 md:gap-12 items-center pt-16 md:pt-20 lg:pt-32 w-full">

                        {/* Left Column */}
                        <div className="text-center lg:text-left lg:col-span-5 w-full">

                            {/* Heading */}
                            <h1
                                ref={heroTitleRef}
                                className="font-extrabold mb-3 sm:mb-4 md:mb-6 leading-tight px-2 sm:px-0 text-2xl sm:text-3xl md:text-4xl lg:text-3xl xl:text-4xl 2xl:text-5xl"
                                style={{ color: '#7E5CFE' }}
                            >
                                The Smartest Way to Run Your Auto Glass Business.
                            </h1>

                            {/* Description */}
                            <p
                                ref={heroDescRef}
                                className="text-sm sm:text-base md:text-lg text-slate-600 mb-5 sm:mb-6 md:mb-8 max-w-2xl mx-auto lg:mx-0 px-2 sm:px-0 leading-relaxed"
                                style={{ opacity: 1 }} // GSAP controls opacity on chars
                            >
                                Generate Instant, 100% Accurate Quotes through NAGS data, Streamline Field Service, and Manage Every Invoice—All in One Platform.
                            </p>

                            <motion.div
                                className="flex flex-row justify-center gap-3 w-full mr-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.9 }}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.97 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                >
                                    <Button
                                        type="primary"
                                        className="!text-white !rounded-full !px-8 !h-11 !text-sm shadow-lg transition-all duration-200"
                                        style={{
                                            backgroundColor: '#7E5CFE',
                                            borderColor: '#7E5CFE',
                                            boxShadow: '0 4px 14px 0 rgba(126, 92, 254, 0.39)',
                                            border: 'none'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#6b47e8';
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#7E5CFE';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                        onClick={() => navigate('/auth', { state: { mode: 'signup' } })}
                                    >
                                        <span className="font-medium">Start Free Trial</span>
                                    </Button>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.97 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                >
                                    <Button
                                        className="!bg-transparent !border-violet-600 !text-violet-600 hover:!bg-violet-100 !rounded-full !px-8 !h-11 !text-sm shadow-sm hover:shadow-md transition-all duration-200"
                                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                                        onClick={() => setIsVideoOpen(true)}
                                    >
                                        <span className="font-medium">Watch a Demo</span>
                                    </Button>
                                </motion.div>
                            </motion.div>
                        </div>

                        {/* Right Column: Image */}
                        <div className="hidden lg:flex relative lg:col-span-6 justify-center lg:justify-end">
                            <motion.div
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[100px] pointer-events-none"
                                style={{ background: 'linear-gradient(135deg, #7E5CFE 0%, #00A8E4 100%)', willChange: 'transform, opacity' }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.4 }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                            />
                            <motion.div
                                className="relative w-full max-w-5xl"
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                            >
                                <img
                                    src={BrowserMockup}
                                    alt="AutoGlassPro Dashboard Mockup"
                                    className="w-full h-auto object-contain drop-shadow-2xl relative z-10 rounded-2xl"
                                />
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Value Proposition */}
                <div
                    className={`transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                >
                    <ValuePropSection />
                </div>
            </div>

            {/* Video Modal */}
            <VideoModal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} />
        </div>
    );
};

export default Home;
