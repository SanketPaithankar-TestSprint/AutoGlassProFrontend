// HomeRoot.jsx - Synchronized Landing Reveal
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import PageHead from "../PageHead";
import ValuePropSection from "./ValuePropSection";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import BrandButton from "../common/BrandButton";
import VideoModal from "../VideoModal/VideoModal";
import BrowserMockup from "../../assets/browser_mockup.png";

const HERO_ANIMATION_MODES = Object.freeze({
    FADE_BLUR: "fade-blur",
    SLIDE_UP: "slide-up",
    TYPEWRITER: "typewriter",
    CROSSFADE: "crossfade",
});

const HERO_ROTATION_CONFIG = Object.freeze({
    mode: HERO_ANIMATION_MODES.FADE_BLUR,
    intervalMs: 4200,
    pauseOnHover: true,
    showDots: true,
});

const TYPEWRITER_CHAR_DELAY_MS = 24;

const getHeroTitleMotionProps = (animationMode) => {
    if (animationMode === HERO_ANIMATION_MODES.SLIDE_UP) {
        return {
            initial: { opacity: 0, y: 24 },
            animate: { opacity: 1, y: 0, transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] } },
            exit: { opacity: 0, y: -20, transition: { duration: 0.32, ease: "easeInOut" } },
        };
    }

    if (animationMode === HERO_ANIMATION_MODES.CROSSFADE) {
        return {
            initial: { opacity: 0 },
            animate: { opacity: 1, transition: { duration: 0.35, ease: "easeOut" } },
            exit: { opacity: 0, transition: { duration: 0.25, ease: "easeIn" } },
        };
    }

    if (animationMode === HERO_ANIMATION_MODES.TYPEWRITER) {
        return {
            initial: { opacity: 0 },
            animate: { opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
            exit: { opacity: 0, transition: { duration: 0.2, ease: "easeIn" } },
        };
    }

    return {
        initial: { opacity: 0, y: 10, filter: "blur(10px)" },
        animate: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] },
        },
        exit: {
            opacity: 0,
            y: -8,
            filter: "blur(8px)",
            transition: { duration: 0.3, ease: "easeInOut" },
        },
    };
};

const getHeroSubtitleMotionProps = (animationMode, isTypewriterComplete) => {
    if (animationMode === HERO_ANIMATION_MODES.SLIDE_UP) {
        return {
            initial: { opacity: 0, y: 18 },
            animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.06 } },
            exit: { opacity: 0, y: -14, transition: { duration: 0.28, ease: "easeInOut" } },
        };
    }

    if (animationMode === HERO_ANIMATION_MODES.TYPEWRITER) {
        return {
            initial: { opacity: 0, y: 8 },
            animate: isTypewriterComplete
                ? { opacity: 1, y: 0, transition: { duration: 0.34, ease: "easeOut" } }
                : { opacity: 0, y: 8 },
            exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: "easeIn" } },
        };
    }

    if (animationMode === HERO_ANIMATION_MODES.CROSSFADE) {
        return {
            initial: { opacity: 0 },
            animate: { opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
            exit: { opacity: 0, transition: { duration: 0.22, ease: "easeIn" } },
        };
    }

    return {
        initial: { opacity: 0, y: 6, filter: "blur(6px)" },
        animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.45, ease: "easeOut", delay: 0.08 } },
        exit: { opacity: 0, y: -6, filter: "blur(4px)", transition: { duration: 0.25, ease: "easeIn" } },
    };
};

const Home = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const prefersReducedMotion = useReducedMotion();
    const [isVideoOpen, setIsVideoOpen] = useState(false);
    const [heroIndex, setHeroIndex] = useState(0);
    const [isHeroPaused, setIsHeroPaused] = useState(false);
    const [typedTitle, setTypedTitle] = useState("");
    const [copyBlockHeight, setCopyBlockHeight] = useState(null);
    const copyMeasureRefs = useRef([]);

    const heroTexts = useMemo(
        () => [
            {
                title: t('home.heroMainTitle'),
                subtitle: t('home.heroDescription'),
            },
            {
                title: t('home.heroAltTitle', {
                    defaultValue: 'The Intelligent OS for Modern Auto Glass Shops.',
                }),
                subtitle: t('home.heroAltDescription', {
                    defaultValue: 'From precision NAGS-integrated quoting and VIN decoding to automated payment reminders, APAI eliminates the manual guesswork so you can focus on the glass and the growth.',
                }),
            },
        ],
        [t, i18n.language]
    );

    const effectiveAnimationMode = prefersReducedMotion
        ? HERO_ANIMATION_MODES.CROSSFADE
        : HERO_ROTATION_CONFIG.mode;

    const activeHero = heroTexts[heroIndex] ?? { title: "", subtitle: "" };
    const shouldPauseCycle = HERO_ROTATION_CONFIG.pauseOnHover && isHeroPaused;

    useEffect(() => {
        setHeroIndex(0);
    }, [i18n.language]);

    useEffect(() => {
        const measureCopyHeight = () => {
            const maxHeight = copyMeasureRefs.current.reduce((max, node) => {
                if (!node) {
                    return max;
                }

                return Math.max(max, node.offsetHeight);
            }, 0);

            if (maxHeight > 0) {
                setCopyBlockHeight(maxHeight);
            }
        };

        const rafId = window.requestAnimationFrame(measureCopyHeight);
        window.addEventListener('resize', measureCopyHeight);

        return () => {
            window.cancelAnimationFrame(rafId);
            window.removeEventListener('resize', measureCopyHeight);
        };
    }, [heroTexts, i18n.language]);

    useEffect(() => {
        if (heroTexts.length < 2 || shouldPauseCycle) {
            return undefined;
        }

        const intervalId = window.setInterval(() => {
            setHeroIndex((prevIndex) => (prevIndex + 1) % heroTexts.length);
        }, HERO_ROTATION_CONFIG.intervalMs);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [heroTexts.length, shouldPauseCycle]);

    useEffect(() => {
        if (effectiveAnimationMode !== HERO_ANIMATION_MODES.TYPEWRITER) {
            setTypedTitle(activeHero.title);
            return undefined;
        }

        setTypedTitle("");
        let charIndex = 0;

        const typewriterTimer = window.setInterval(() => {
            charIndex += 1;
            setTypedTitle(activeHero.title.slice(0, charIndex));

            if (charIndex >= activeHero.title.length) {
                window.clearInterval(typewriterTimer);
            }
        }, TYPEWRITER_CHAR_DELAY_MS);

        return () => {
            window.clearInterval(typewriterTimer);
        };
    }, [activeHero.title, effectiveAnimationMode]);

    const isTypewriterComplete =
        effectiveAnimationMode !== HERO_ANIMATION_MODES.TYPEWRITER ||
        typedTitle.length >= activeHero.title.length;

    return (
        <div className="relative text-slate-900 overflow-hidden bg-white" style={{ minHeight: 'calc(var(--vh, 1vh) * 100)' }}>
            <PageHead
                title="APAI | Smart Auto Glass Shop Management Software"
                description="Scale your auto glass business with APAI."
            />

            <div className="relative z-10">
                <section
                    className="relative bg-transparent text-slate-900 py-0 flex justify-center items-center"
                    style={{ minHeight: 'calc(var(--vh, 1vh) * 100)' }}
                >
                    <div className="relative max-w-7xl mx-auto py-8 md:py-24 lg:py-32 px-3 sm:px-4 md:px-6 grid lg:grid-cols-12 gap-6 md:gap-12 items-center pt-16 md:pt-20 lg:pt-32 w-full">

                        {/* Left Column */}
                        <div className="text-center lg:text-left lg:col-span-5 w-full">

                            {/* Rotating Hero Copy */}
                            <div
                                className="relative mb-5 md:mb-6 flex flex-col"
                                style={copyBlockHeight ? { minHeight: `${copyBlockHeight}px` } : undefined}
                                onMouseEnter={HERO_ROTATION_CONFIG.pauseOnHover ? () => setIsHeroPaused(true) : undefined}
                                onMouseLeave={HERO_ROTATION_CONFIG.pauseOnHover ? () => setIsHeroPaused(false) : undefined}
                            >
                                <div aria-hidden="true" className="absolute inset-0 pointer-events-none invisible -z-10">
                                    {heroTexts.map((heroText, index) => (
                                        <div
                                            key={`hero-measure-${heroText.title}`}
                                            ref={(node) => {
                                                copyMeasureRefs.current[index] = node;
                                            }}
                                            className="relative flex flex-col"
                                        >
                                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black leading-[1.05] !text-[#7E5CFE] !m-0 px-2 sm:px-0 tracking-[-0.04em]">
                                                {heroText.title}
                                            </h1>
                                            <p className="text-base sm:text-lg md:text-xl leading-7 md:leading-8 text-slate-600 max-w-2xl mx-auto lg:mx-0 !m-0 px-2 sm:px-0 mt-2">
                                                {heroText.subtitle}
                                            </p>
                                            {HERO_ROTATION_CONFIG.showDots && heroTexts.length > 1 ? (
                                                <div className="pt-3">
                                                    <div className="h-2 w-8" />
                                                </div>
                                            ) : null}
                                        </div>
                                    ))}
                                </div>

                                <div className="relative !min-h-0" aria-live="polite">
                                    <AnimatePresence mode="wait">
                                        <motion.h1
                                            key={`hero-title-${heroIndex}-${effectiveAnimationMode}`}
                                            {...getHeroTitleMotionProps(effectiveAnimationMode)}
                                            className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black leading-[1.05] !text-[#7E5CFE] !m-0 px-2 sm:px-0 tracking-[-0.04em]"
                                        >
                                            {effectiveAnimationMode === HERO_ANIMATION_MODES.TYPEWRITER ? typedTitle : activeHero.title}
                                            {effectiveAnimationMode === HERO_ANIMATION_MODES.TYPEWRITER && !isTypewriterComplete ? (
                                                <span
                                                    className="inline-block w-[0.08em] h-[0.9em] align-[-0.08em] bg-[#7E5CFE] ml-1 animate-pulse"
                                                    aria-hidden="true"
                                                />
                                            ) : null}
                                        </motion.h1>
                                    </AnimatePresence>
                                </div>

                                <div className="relative !min-h-0 mt-2">
                                    <AnimatePresence mode="wait">
                                        <motion.p
                                            key={`hero-subtitle-${heroIndex}-${effectiveAnimationMode}`}
                                            {...getHeroSubtitleMotionProps(effectiveAnimationMode, isTypewriterComplete)}
                                            className="text-base sm:text-lg md:text-xl leading-7 md:leading-8 text-slate-600 max-w-2xl mx-auto lg:mx-0 !m-0 px-2 sm:px-0"
                                        >
                                            {activeHero.subtitle}
                                        </motion.p>
                                    </AnimatePresence>
                                </div>

                                {HERO_ROTATION_CONFIG.showDots && heroTexts.length > 1 ? (
                                    <div className="mt-auto pt-3 flex items-center justify-center lg:justify-start gap-2" role="tablist" aria-label="Hero message navigation">
                                        {heroTexts.map((heroText, index) => (
                                            <button
                                                key={heroText.title}
                                                type="button"
                                                role="tab"
                                                aria-selected={index === heroIndex}
                                                aria-label={`Show hero message ${index + 1}`}
                                                className={`h-2 rounded-full transition-all duration-300 ${index === heroIndex ? 'w-8 bg-[#7E5CFE]' : 'w-2 bg-slate-300 hover:bg-slate-400'}`}
                                                onClick={() => setHeroIndex(index)}
                                            />
                                        ))}
                                    </div>
                                ) : null}
                            </div>

                            <div className="md:-mt-4 flex flex-col sm:flex-row justify-center lg:justify-start gap-2 sm:gap-3 w-full">
                                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                                    <BrandButton
                                        type="primary"
                                        onClick={() => navigate('/auth', { state: { mode: 'signup' } })}
                                        className="!h-12 sm:!h-14 !px-6 sm:!px-10 !text-base !rounded-full w-full sm:w-auto"
                                    >
                                        {t('pricing.startFreeTrial')}
                                    </BrandButton>
                                </motion.div>

                                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                                     <BrandButton
                                        variant="outline"
                                        className="!h-12 sm:!h-14 !px-6 sm:!px-10 !rounded-full !text-base shadow-sm w-full sm:w-auto"
                                        onClick={() => setIsVideoOpen(true)}
                                    >
                                        {t('home.watchDemo')}
                                    </BrandButton>
                                </motion.div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="hidden lg:flex relative lg:col-span-7 justify-center lg:justify-end">
                            <motion.div
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] rounded-full blur-[110px] pointer-events-none"
                                style={{ background: 'linear-gradient(135deg, rgba(126, 92, 254, 0.25) 0%, rgba(0, 168, 228, 0.15) 100%)' }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1.5 }}
                            />
                            <motion.div
                                className="relative w-full max-w-5xl"
                                initial={{ opacity: 0, x: 40 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 1, delay: 0.5 }}
                            >
                                <img
                                    src={BrowserMockup}
                                    alt="AutoGlassPro Dashboard"
                                    className="w-full h-auto object-contain drop-shadow-[0_25px_60px_rgba(0,0,0,0.12)] relative z-10 rounded-2xl"
                                />
                            </motion.div>
                        </div>
                    </div>
                </section>

                <ValuePropSection />
            </div>

            <VideoModal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} />
        </div>
    );
};

export default Home;
