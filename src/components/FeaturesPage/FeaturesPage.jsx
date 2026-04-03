import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout, Button, Collapse } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import PageHead from '../PageHead';
import {
    FileSearchOutlined,
    FundProjectionScreenOutlined,
    CalculatorOutlined,
    FileTextOutlined,
    ToolOutlined,
    ClockCircleOutlined,
    CameraOutlined,
    TeamOutlined,
    FileProtectOutlined,
    UnorderedListOutlined,
    MailOutlined,
    BarChartOutlined,
    MessageOutlined,
    BgColorsOutlined,
    AppstoreAddOutlined,
    CheckCircleFilled
} from '@ant-design/icons';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import VideoModal from '../VideoModal/VideoModal';

gsap.registerPlugin(ScrollTrigger);

// Basic Fade-Up Animation for Headers
const AnimatedSection = ({ children, delay = 0, className = "" }) => {
    const el = useRef(null);

    useGSAP(() => {
        gsap.fromTo(el.current,
            {
                opacity: 0,
                y: 30
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power2.out",
                delay: typeof delay === 'string' ? parseFloat(delay) : delay,
                scrollTrigger: {
                    trigger: el.current,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    }, { scope: el });

    return (
        <div ref={el} className={className}>
            {children}
        </div>
    );
};
// Staggered Reveal Section
const StaggeredSection = ({ children, delay = 0, className = "" }) => {
    const el = useRef(null);

    useGSAP(() => {
        gsap.fromTo(el.current.children,
            {
                opacity: 0,
                y: 30
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: el.current,
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    }, { scope: el });

    return (
        <div ref={el} className={className}>
            {children}
        </div>
    );
};

// 3D Tilt Feature Block
const FeatureBlock = ({ icon, title, description }) => {
    const cardRef = useRef(null);

    // Hover animation context
    const { contextSafe } = useGSAP({ scope: cardRef });

    const onEnter = contextSafe(() => {
        gsap.to(cardRef.current, {
            y: -5,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            borderColor: '#ddd6fe', // violet-200
            scale: 1,
            duration: 0.3,
            ease: "power2.out"
        });
        // Animate icon pop
        gsap.to(cardRef.current.querySelector('.feature-icon'), {
            scale: 1.1,
            rotate: 3,
            duration: 0.4,
            ease: "back.out(1.7)"
        });
    });

    const onLeave = contextSafe(() => {
        gsap.to(cardRef.current, {
            y: 0,
            boxShadow: 'none',
            borderColor: '#f1f5f9', // slate-100
            scale: 1,
            duration: 0.3,
            ease: "power2.out"
        });
        // Reset icon
        gsap.to(cardRef.current.querySelector('.feature-icon'), {
            scale: 1,
            rotate: 0,
            duration: 0.3,
        });
    });

    return (
        <div
            ref={cardRef}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            className="flex gap-4 items-start p-6 bg-white rounded-2xl border border-slate-100 h-full cursor-default will-change-transform"
        >
            <div className="feature-icon flex-shrink-0 mt-1 text-3xl text-violet-600 bg-violet-50 p-3 rounded-xl">
                {icon}
            </div>
            <div>
                <h4 className="text-xl font-bold text-slate-900 mb-2 font-black tracking-[-0.03em]">{title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">{description}</p>
            </div>
        </div>
    );
};
// Coverflow carousel — 3 cards visible, portrait, direction-aware animation, drag-enabled
const FeatureCarousel = ({ features, color, sectionId, readMoreText }) => {
    const [current, setCurrent] = useState(0);
    const [dir, setDir] = useState(1); // 1 = going right/next, -1 = going left/prev
    const [gen, setGen] = useState(0); // bumped on each transition to force re-key
    const [hovered, setHovered] = useState(false);
    const [dragging, setDragging] = useState(false);
    const dragStartX = useRef(null);
    const total = features.length;

    const go = (newIdx, direction) => {
        setDir(direction);
        setGen(g => g + 1);
        setCurrent(newIdx);
    };
    const next = () => go((current + 1) % total, 1);
    const prev = () => go((current - 1 + total) % total, -1);

    useEffect(() => {
        if (hovered) return;
        const id = setInterval(next, 4000); // Slower speed
        return () => clearInterval(id);
    }, [hovered, current]);

    const onMouseDown = e => { dragStartX.current = e.clientX; setDragging(false); };
    const onMouseMove = e => { if (dragStartX.current !== null && Math.abs(e.clientX - dragStartX.current) > 10) setDragging(true); };
    const onMouseUp = e => {
        if (dragStartX.current === null) return;
        const diff = dragStartX.current - e.clientX;
        if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
        dragStartX.current = null;
        setTimeout(() => setDragging(false), 60);
    };

    // Layout: center at 0%, left at -130%, right at +130% (cards fully spaced)
    const slots = [
        { rel: -1, offset: -120, scale: 0.78, opacity: 0.75, z: 1, blur: 'none' },
        { rel: 0, offset: 0, scale: 1, opacity: 1, z: 10, blur: 'none' },
        { rel: 1, offset: 120, scale: 0.78, opacity: 0.75, z: 1, blur: 'none' },
    ];

    return (
        <div
            className="relative select-none"
            style={{ paddingBottom: '16px' }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={() => { setHovered(false); dragStartX.current = null; }}
        >
            {/* Inject keyframes */}
            <style>{`
                @keyframes cfSlideInRight { from { opacity:0; transform: translateX(60px) scale(0.85); } to { opacity:1; transform: translateX(0) scale(1); } }
                @keyframes cfSlideInLeft  { from { opacity:0; transform: translateX(-60px) scale(0.85); } to { opacity:1; transform: translateX(0) scale(1); } }
                @keyframes cfSideIn       { from { opacity:0; } to { opacity:1; } }
            `}</style>

            {/* Clip window — wide enough to show 3 cards but clip beyond that */}
            <div style={{ overflow: 'hidden', borderRadius: '24px', padding: '12px 0' }}>
                <div className="relative" style={{ height: '440px' }}>
                    {slots.map(({ rel, offset, scale, opacity, z, blur }) => {
                        const idx = (current + rel + total) % total;
                        const f = features[idx];
                        const isCenter = rel === 0;

                        const animation = isCenter
                            ? `${dir > 0 ? 'cfSlideInRight' : 'cfSlideInLeft'} 0.42s cubic-bezier(0.25,0.8,0.25,1) both`
                            : 'cfSideIn 0.42s ease both';

                        return (
                            <div
                                key={`${rel}-${idx}-${gen}`}
                                className="absolute flex flex-col p-7 bg-white rounded-2xl border border-slate-200 shadow-2xl"
                                style={{
                                    width: '300px',
                                    minHeight: '420px',
                                    top: '50%',
                                    left: '50%',
                                    marginLeft: '-150px',
                                    marginTop: '-210px',
                                    transform: `translateX(${offset}%) scale(${scale})`,
                                    opacity,
                                    filter: blur === 'none' ? 'none' : `blur(${blur})`,
                                    zIndex: z,
                                    cursor: isCenter ? (dragging ? 'grabbing' : 'grab') : 'pointer',
                                    animation,
                                    userSelect: 'none',
                                    boxShadow: isCenter
                                        ? '0 20px 60px -10px rgba(126,92,254,0.35), 0 8px 24px rgba(0,0,0,0.12)'
                                        : '0 4px 20px rgba(0,0,0,0.08)',
                                }}
                                onMouseEnter={() => { if (isCenter) setHovered(true); }}
                                onMouseLeave={() => { if (isCenter) setHovered(false); }}
                                onClick={() => { if (!dragging && !isCenter) rel > 0 ? next() : prev(); }}
                            >
                                <div className="flex-shrink-0 text-3xl p-4 rounded-xl text-white shadow-md w-fit mb-5" style={{ backgroundColor: '#7E5CFE' }}>
                                    {f.icon}
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-3 font-black tracking-[-0.03em] leading-snug">
                                    {f.title}
                                </h4>
                                <p className="text-sm text-slate-600 leading-relaxed flex-1">
                                    {f.desc}
                                </p>
                                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-end">
                                    {sectionId && (
                                        <Link
                                            to={`/features/${sectionId}`}
                                            onClick={(e) => e.stopPropagation()} // prevent card drag/click
                                            className="text-violet-600 font-bold hover:text-violet-700 transition-colors flex items-center group/btn"
                                        >
                                            {readMoreText}
                                            <span className="ml-1 group-hover/btn:translate-x-1 transition-transform">→</span>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Status indicators (purple stripes) */}
            <div className="flex justify-center gap-2 mt-6 relative z-20">
                {features.map((_, i) => (
                    <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-500 ${i === current ? 'bg-violet-600 w-12' : 'bg-violet-200 w-4'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

const FeaturesPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isVideoOpen, setIsVideoOpen] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const sections = [
        {
            id: "quoting-and-pricing",
            category: t('featuresPage.sections.quoting.category'),
            title: t('featuresPage.sections.quoting.title'),
            subHeadline: t('featuresPage.sections.quoting.subHeadline'),
            color: "from-blue-500 to-cyan-500",
            features: [
                {
                    icon: <FileSearchOutlined />,
                    title: t('featuresPage.sections.quoting.feature1Title'),
                    desc: t('featuresPage.sections.quoting.feature1Desc')
                },
                {
                    icon: <FundProjectionScreenOutlined />,
                    title: t('featuresPage.sections.quoting.feature2Title'),
                    desc: t('featuresPage.sections.quoting.feature2Desc')
                },
                {
                    icon: <CalculatorOutlined />,
                    title: t('featuresPage.sections.quoting.feature3Title'),
                    desc: t('featuresPage.sections.quoting.feature3Desc')
                },
                {
                    icon: <FileTextOutlined />,
                    title: t('featuresPage.sections.quoting.feature4Title'),
                    desc: t('featuresPage.sections.quoting.feature4Desc')
                }
            ]
        },
        {
            id: "work-order-and-field-service",
            category: t('featuresPage.sections.workOrder.category'),
            title: t('featuresPage.sections.workOrder.title'),
            subHeadline: t('featuresPage.sections.workOrder.subHeadline'),
            color: "from-violet-500 to-fuchsia-500",
            features: [
                {
                    icon: <ToolOutlined />,
                    title: t('featuresPage.sections.workOrder.feature1Title'),
                    desc: t('featuresPage.sections.workOrder.feature1Desc')
                },
                {
                    icon: <ClockCircleOutlined />,
                    title: t('featuresPage.sections.workOrder.feature2Title'),
                    desc: t('featuresPage.sections.workOrder.feature2Desc')
                },
                {
                    icon: <CameraOutlined />,
                    title: t('featuresPage.sections.workOrder.feature3Title'),
                    desc: t('featuresPage.sections.workOrder.feature3Desc')
                },
                {
                    icon: <TeamOutlined />,
                    title: t('featuresPage.sections.workOrder.feature4Title'),
                    desc: t('featuresPage.sections.workOrder.feature4Desc')
                }
            ]
        },
        {
            id: "invoicing-and-payments",
            category: t('featuresPage.sections.invoicing.category'),
            title: t('featuresPage.sections.invoicing.title'),
            subHeadline: t('featuresPage.sections.invoicing.subHeadline'),
            color: "from-emerald-500 to-teal-500",
            features: [
                {
                    icon: <FileProtectOutlined />,
                    title: t('featuresPage.sections.invoicing.feature1Title'),
                    desc: t('featuresPage.sections.invoicing.feature1Desc')
                },
                {
                    icon: <UnorderedListOutlined />,
                    title: t('featuresPage.sections.invoicing.feature2Title'),
                    desc: t('featuresPage.sections.invoicing.feature2Desc')
                },
                {
                    icon: <MailOutlined />,
                    title: t('featuresPage.sections.invoicing.feature3Title'),
                    desc: t('featuresPage.sections.invoicing.feature3Desc')
                },
                {
                    icon: <BarChartOutlined />,
                    title: t('featuresPage.sections.invoicing.feature4Title'),
                    desc: t('featuresPage.sections.invoicing.feature4Desc')
                }
            ]
        },
        {
            id: "customer-engagement-and-contact",
            category: t('featuresPage.sections.engagement.category'),
            title: t('featuresPage.sections.engagement.title'),
            subHeadline: t('featuresPage.sections.engagement.subHeadline'),
            color: "from-amber-500 to-orange-500",
            features: [
                {
                    icon: <AppstoreAddOutlined />,
                    title: t('featuresPage.sections.engagement.feature1Title'),
                    desc: t('featuresPage.sections.engagement.feature1Desc')
                },
                {
                    icon: <MessageOutlined />,
                    title: t('featuresPage.sections.engagement.feature2Title'),
                    desc: t('featuresPage.sections.engagement.feature2Desc')
                },
                {
                    icon: <BgColorsOutlined />,
                    title: t('featuresPage.sections.engagement.feature3Title'),
                    desc: t('featuresPage.sections.engagement.feature3Desc')
                }
            ]
        }
    ];

    const handleStartTrial = () => {
        navigate('/auth', { state: { mode: 'signup' } });
    };

    return (
        <div className="min-h-screen pb-20 relative overflow-hidden font-sans text-slate-900">
            <PageHead
                title={t('featuresPage.title')}
                description={t('featuresPage.description')}
            />

            {/* Page Header */}
            <div className="relative pt-10 pb-16 px-6 md:px-12 lg:px-20 border-b border-transparent z-10">
                <div className="max-w-4xl mx-auto text-center" style={{ visibility: 'visible' }}>
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 font-black tracking-[-0.03em] text-slate-900 leading-tight">
                        {t('featuresPage.headerTitlePrefix')} <span style={{ color: '#7E5CFE' }}>{t('featuresPage.headerTitleHighlight')}</span>
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                        {t('featuresPage.headerDescription')}
                    </p>
                </div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-12 space-y-32">
                {sections.map((section, idx) => (
                    <div key={idx} className="scroll-mt-24" id={section.category.toLowerCase().replace(/\s+/g, '-')}>
                        <AnimatedSection>
                            <div className="mb-12 text-center md:text-left">
                                <div className="flex items-center gap-3 mb-4 justify-center md:justify-start">
                                    <div className="h-1.5 w-12 rounded-full" style={{ backgroundColor: '#7E5CFE' }}></div>
                                    <span className="text-sm font-bold uppercase tracking-widest text-slate-500">{section.category}</span>
                                </div>
                                <h2 className="text-3xl md:text-5xl font-extrabold mb-4 font-black tracking-[-0.03em] text-slate-900">
                                    {section.title}
                                </h2>
                            </div>
                        </AnimatedSection>

                        {/* Cards: mapped to carousel for all sections */}
                        <AnimatedSection>
                            <FeatureCarousel features={section.features} color={section.color} sectionId={section.id} readMoreText={t('featuresPage.readMore')} />
                        </AnimatedSection>
                    </div>
                ))}
            </div>

            {/* FAQ Section */}
            <AnimatedSection>
                <div className="relative z-10 max-w-4xl mx-auto mt-24 px-5">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">{t('featuresPage.faq.title')}</h2>
                        <p className="text-slate-600">{t('featuresPage.faq.description')}</p>
                    </div>

                    <Collapse
                        items={[
                            {
                                key: '1',
                                label: <span className="font-semibold text-slate-900">{t('featuresPage.faq.q1')}</span>,
                                children: <p className="text-slate-700 leading-relaxed">{t('featuresPage.faq.a1')}</p>,
                                style: { borderRadius: '8px', marginBottom: '8px' }
                            },
                            {
                                key: '2',
                                label: <span className="font-semibold text-slate-900">{t('featuresPage.faq.q2')}</span>,
                                children: <p className="text-slate-700 leading-relaxed">{t('featuresPage.faq.a2')}</p>,
                                style: { borderRadius: '8px', marginBottom: '8px' }
                            },
                            {
                                key: '3',
                                label: <span className="font-semibold text-slate-900">{t('featuresPage.faq.q3')}</span>,
                                children: <p className="text-slate-700 leading-relaxed">{t('featuresPage.faq.a3')}</p>,
                                style: { borderRadius: '8px', marginBottom: '8px' }
                            },
                            {
                                key: '4',
                                label: <span className="font-semibold text-slate-900">{t('featuresPage.faq.q4')}</span>,
                                children: <p className="text-slate-700 leading-relaxed">{t('featuresPage.faq.a4')}</p>,
                                style: { borderRadius: '8px', marginBottom: '8px' }
                            },
                            {
                                key: '5',
                                label: <span className="font-semibold text-slate-900">{t('featuresPage.faq.q5')}</span>,
                                children: <p className="text-slate-700 leading-relaxed">{t('featuresPage.faq.a5')}</p>,
                                style: { borderRadius: '8px', marginBottom: '8px' }
                            },
                            {
                                key: '6',
                                label: <span className="font-semibold text-slate-900">{t('featuresPage.faq.q6')}</span>,
                                children: <p className="text-slate-700 leading-relaxed">{t('featuresPage.faq.a6')}</p>,
                                style: { borderRadius: '8px', marginBottom: '8px' }
                            },
                            {
                                key: '7',
                                label: <span className="font-semibold text-slate-900">{t('featuresPage.faq.q7')}</span>,
                                children: <p className="text-slate-700 leading-relaxed">{t('featuresPage.faq.a7')}</p>,
                                style: { borderRadius: '8px', marginBottom: '8px' }
                            },
                            {
                                key: '8',
                                label: <span className="font-semibold text-slate-900">{t('featuresPage.faq.q8')}</span>,
                                children: <p className="text-slate-700 leading-relaxed">{t('featuresPage.faq.a8')}</p>,
                                style: { borderRadius: '8px', marginBottom: '8px' }
                            },
                            {
                                key: '9',
                                label: <span className="font-semibold text-slate-900">{t('featuresPage.faq.q9')}</span>,
                                children: <p className="text-slate-700 leading-relaxed">{t('featuresPage.faq.a9')}</p>,
                                style: { borderRadius: '8px', marginBottom: '8px' }
                            },
                            {
                                key: '10',
                                label: <span className="font-semibold text-slate-900">{t('featuresPage.faq.q10')}</span>,
                                children: <p className="text-slate-700 leading-relaxed">{t('featuresPage.faq.a10')}</p>,
                                style: { borderRadius: '8px', marginBottom: '8px' }
                            },
                            {
                                key: '11',
                                label: <span className="font-semibold text-slate-900">{t('featuresPage.faq.q11')}</span>,
                                children: <p className="text-slate-700 leading-relaxed">{t('featuresPage.faq.a11')}</p>,
                                style: { borderRadius: '8px', marginBottom: '8px' }
                            },
                            {
                                key: '12',
                                label: <span className="font-semibold text-slate-900">{t('featuresPage.faq.q12')}</span>,
                                children: <p className="text-slate-700 leading-relaxed">{t('featuresPage.faq.a12')}</p>,
                                style: { borderRadius: '8px', marginBottom: '8px' }
                            },
                            {
                                key: '13',
                                label: <span className="font-semibold text-slate-900">{t('featuresPage.faq.q13')}</span>,
                                children: <p className="text-slate-700 leading-relaxed">{t('featuresPage.faq.a13')}</p>,
                                style: { borderRadius: '8px', marginBottom: '8px' }
                            },
                            {
                                key: '14',
                                label: <span className="font-semibold text-slate-900">{t('featuresPage.faq.q14')}</span>,
                                children: <p className="text-slate-700 leading-relaxed">{t('featuresPage.faq.a14')}</p>,
                                style: { borderRadius: '8px', marginBottom: '8px' }
                            },
                            {
                                key: '15',
                                label: <span className="font-semibold text-slate-900">{t('featuresPage.faq.q15')}</span>,
                                children: (
                                    <p className="text-slate-700 leading-relaxed">
                                        {t('featuresPage.faq.a15')} <a href="mailto:support@autopaneai.com" className="text-violet-600 hover:underline">support@autopaneai.com</a>
                                    </p>
                                ),
                                style: { borderRadius: '8px', marginBottom: '8px' }
                            }
                        ]}
                        accordion
                        style={{
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px'
                        }}
                    />
                </div>
            </AnimatedSection>

            <AnimatedSection>
                <div className='relative z-10 flex items-center justify-center'>
                    <div className="max-w-4xl mx-5 mt-24 bg-violet-50 rounded-3xl py-12 px-6 md:px-12 text-center relative overflow-hidden border border-violet-100 shadow-xl shadow-violet-100/50">
                        <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                        <div className="relative z-10">
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 font-black tracking-[-0.03em]">
                                {t('featuresPage.cta.title')}
                            </h2>
                            <p className="text-base text-slate-600 mb-8 max-w-xl mx-auto">
                                {t('featuresPage.cta.description')}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Button
                                    type="primary"
                                    size="large"
                                    className="!bg-[#7E5CFE] !border-[#7E5CFE] hover:!bg-[#6a4deb] !h-11 !px-8 !text-base !rounded-full shadow-md shadow-[#7E5CFE]/30"
                                    onClick={handleStartTrial}
                                >
                                    {t('featuresPage.cta.startTrial')}
                                </Button>
                                <Button
                                    size="large"
                                    className="!bg-transparent !border-violet-600 !text-violet-600 hover:!bg-violet-100 !h-11 !px-8 !text-base !rounded-full"
                                    onClick={() => setIsVideoOpen(true)}
                                >
                                    {t('featuresPage.cta.watchDemo')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </AnimatedSection>

            {/* Video Modal */}
            <VideoModal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} />
        </div>
    );
};

export default FeaturesPage;
