import React from 'react';
import Slider from 'react-slick';
import { useTranslation } from 'react-i18next';
import {
    FileSearchOutlined,
    ToolOutlined,
    FileProtectOutlined,
} from '@ant-design/icons';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const AuthSlider = () => {
    const { t } = useTranslation();

    const slides = [
        {
            icon: <FileSearchOutlined />,
            title: t('featuresPage.sections.quoting.title'),
            features: [
                t('featuresPage.sections.quoting.feature1Title'),
                t('featuresPage.sections.quoting.feature2Title'),
                t('featuresPage.sections.quoting.feature3Title'),
                t('featuresPage.sections.quoting.feature4Title'),
            ],
        },
        {
            icon: <ToolOutlined />,
            title: t('featuresPage.sections.workOrder.title'),
            features: [
                t('featuresPage.sections.workOrder.feature1Title'),
                t('featuresPage.sections.workOrder.feature2Title'),
                t('featuresPage.sections.workOrder.feature3Title'),
                t('featuresPage.sections.workOrder.feature4Title'),
            ],
        },
        {
            icon: <FileProtectOutlined />,
            title: t('featuresPage.sections.invoicing.title'),
            features: [
                t('featuresPage.sections.invoicing.feature1Title'),
                t('featuresPage.sections.invoicing.feature2Title'),
                t('featuresPage.sections.invoicing.feature3Title'),
                t('featuresPage.sections.invoicing.feature4Title'),
            ],
        },
    ];

    const settings = {
        dots: true,
        arrows: false,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 3000,
        speed: 600,
        slidesToShow: 1,
        slidesToScroll: 1,
        pauseOnHover: true,
        appendDots: dots => (
            <div style={{ bottom: '-36px' }}>
                <ul className="flex justify-center gap-2">{dots}</ul>
            </div>
        ),
        customPaging: () => (
            <div className="w-2.5 h-2.5 rounded-full bg-purple-300/50 transition-all duration-300" />
        ),
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center px-8 py-12">
            <style>{`
                .auth-slider .slick-dots li.slick-active div {
                    background: #7c3aed;
                    transform: scale(1.3);
                }
                .auth-slider .slick-dots li {
                    margin: 0;
                }
                .auth-slider .slick-slide > div {
                    padding: 0 8px;
                }
            `}</style>
            <div className="auth-slider w-full max-w-md">
                <Slider {...settings}>
                    {slides.map((slide, idx) => (
                        <div key={idx}>
                            <div className="bg-slate-900/40 backdrop-blur-2xl rounded-[32px] p-10 border border-white/10 shadow-2xl min-h-[440px] flex flex-col">
                                {/* Icon with a soft glow */}
                                <div className="text-4xl text-white mb-8 bg-gradient-to-br from-purple-500 to-indigo-600 w-20 h-20 flex items-center justify-center rounded-2xl shadow-lg shadow-purple-500/20">
                                    {slide.icon}
                                </div>
                                <h3 className="text-3xl font-extrabold text-white mb-6 tracking-tight">
                                    {slide.title}
                                </h3>
                                <ul className="space-y-4 flex-1">
                                    {slide.features.map((feat, i) => (
                                        <li key={i} className="flex items-center gap-4 text-slate-100 text-base font-medium group">
                                            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500 transition-colors duration-300">
                                                <span className="text-[10px]">✓</span>
                                            </span>
                                            {feat}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </Slider>
            </div>
        </div>
    );
};

export default AuthSlider;
