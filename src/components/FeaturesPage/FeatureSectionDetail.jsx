import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeftOutlined, CheckCircleFilled } from '@ant-design/icons';
import { sectionDetails } from '../../const/featureDetails';
import PageHead from '../PageHead';
import { Button } from 'antd';

const FeatureSectionDetail = () => {
    const { sectionId } = useParams();
    const navigate = useNavigate();
    const data = sectionDetails[sectionId];

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [sectionId]);

    if (!data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-slate-900">
                <h1 className="text-3xl font-bold mb-4 font-outfit">Section Not Found</h1>
                <p className="text-slate-500 mb-8">We couldn't find the feature details you're looking for.</p>
                <Button type="primary" size="large" onClick={() => navigate('/features')} className="bg-violet-600">
                    Back to Features
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20 relative overflow-hidden font-sans text-slate-900">
            <PageHead title={`${data.title} | APAI`} description={data.description} />

            <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pt-16 md:pt-24 pb-12">
                <Link to="/features" className="inline-flex items-center text-violet-600 hover:text-violet-700 font-semibold mb-8 transition-colors">
                    <ArrowLeftOutlined className="mr-2" />
                    Back to all features
                </Link>

                <div className="max-w-4xl mb-16">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 font-outfit text-slate-900 leading-tight">
                        {data.title}
                    </h1>
                    <p className="text-xl text-slate-600 leading-relaxed">
                        {data.description}
                    </p>
                </div>

                <div className="space-y-32">
                    {data.features.map((feature, idx) => (
                        <div key={feature.id} id={feature.id} className="scroll-mt-32">
                            <div className={`flex flex-col lg:flex-row gap-12 items-center ${idx % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
                                {/* Image Side */}
                                <div className="w-full lg:w-1/2">
                                    <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-100 bg-white p-2">
                                        <div className="rounded-2xl overflow-hidden bg-slate-50 relative aspect-[4/3]">
                                            <img
                                                src={feature.image}
                                                alt={feature.title}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Content Side */}
                                <div className="w-full lg:w-1/2 space-y-8">
                                    <h2 className="text-3xl md:text-4xl font-bold font-outfit text-slate-900">
                                        {feature.title}
                                    </h2>
                                    <div className="text-lg text-slate-600 leading-relaxed space-y-4">
                                        {feature.content.split('\n\n').map((paragraph, pIdx) => (
                                            <p key={pIdx}>{paragraph}</p>
                                        ))}
                                    </div>

                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        <h3 className="font-bold text-slate-900 mb-4 font-outfit text-xl">Key Benefits:</h3>
                                        <ul className="space-y-3">
                                            {feature.benefits.map((benefit, bIdx) => (
                                                <li key={bIdx} className="flex items-start">
                                                    <CheckCircleFilled className="text-violet-500 mt-1 mr-3 text-lg flex-shrink-0" />
                                                    <span className="text-slate-700 font-medium">{benefit}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Divider if not last */}
                            {idx !== data.features.length - 1 && (
                                <div className="mt-32 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-32 text-center p-12 rounded-3xl border border-slate-100">
                    <h2 className="text-3xl font-bold mb-4 font-outfit">Ready to upgrade your shop?</h2>
                    <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
                        Join hundreds of auto glass professionals who have streamlined their workflow with APAI.
                    </p>
                    <Button type="primary" size="large" className="!bg-[#7E5CFE] !border-[#7E5CFE] hover:!bg-[#6a4deb] h-14 px-8 text-lg font-bold rounded-full shadow-lg shadow-[#7E5CFE]/30" onClick={() => navigate('/auth')}>
                        Start Your Free Trial
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default FeatureSectionDetail;
