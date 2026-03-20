import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import Login from "./login";
import SignUpForm from "./SignUpForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
import PageHead from '../PageHead';
import { useAuth } from '../../context/auth/useAuth';
import { useProfileDataPrefetch } from '../../hooks/useProfileDataPrefetch';
import { getValidToken } from '../../api/getValidToken';
import { useNavigate, useLocation } from "react-router-dom";
import authBg from '../../assets/images/auth-bg.png';
import testimonialAvatar from '../../assets/images/testimonial-avatar.png';

export default function AuthRoot() {
    const { t } = useTranslation();
    const [authMode, setAuthMode] = useState('LOGIN');
    const { login } = useAuth();
    const prefetchProfileData = useProfileDataPrefetch();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.mode === 'signup') {
            setAuthMode('SIGNUP');
        } else if (location.state?.mode === 'signin') {
            setAuthMode('LOGIN');
        }
    }, [location.state]);

    const handleLoginSuccess = async () => {
        const token = getValidToken();
        if (token) {
            if (login) login(token);
            try {
                if (prefetchProfileData) await prefetchProfileData();
            } catch (error) {
                console.error("Error prefetching data:", error);
            }
            navigate("/search-by-root");
        }
    };

    const handleSignUpSuccess = () => {
        setAuthMode('LOGIN');
    };

    return (
        <div className="bg-white font-['Inter'] text-[#191c1e] min-h-[calc(100vh-128px)] flex flex-col overflow-x-hidden">
            <PageHead
                title="Login / Sign Up | APAI"
                description="Sign in to your APAI dashboard or create a new account to scale your auto glass shop."
            />
            
            <div className="flex-grow flex">
                {/* Left Column: Sign-in Form (45%) */}
                <section className="w-full md:w-[45%] flex flex-col bg-white z-10 relative min-h-[600px]">
                    <div className="flex-grow flex items-center justify-center px-4 md:px-16 lg:px-24 py-12">
                        <div className="w-full max-w-md">
                            <div className="mb-10 text-center md:text-left">
                                <h1 className="text-3xl font-['Plus_Jakarta_Sans'] font-bold tracking-tight text-[#191c1e] mb-2 leading-tight">
                                    {authMode === 'LOGIN' ? t('auth.welcomeBack') : authMode === 'SIGNUP' ? t('auth.joinUs') : t('auth.resetPassword')}
                                </h1>
                                <p className="text-[#484555] font-['Inter'] text-sm md:text-base">
                                    {authMode === 'LOGIN' ? t('auth.enterCredentials') : ''}
                                </p>
                            </div>

                            <div className="w-full">
                                {authMode === 'LOGIN' && (
                                    <Login
                                        onLoginSuccess={handleLoginSuccess}
                                        onForgotPasswordClick={() => setAuthMode('FORGOT_PASSWORD')}
                                        onSignUpClick={() => setAuthMode('SIGNUP')}
                                    />
                                )}

                                {authMode === 'SIGNUP' && (
                                    <SignUpForm
                                        onSuccess={handleSignUpSuccess}
                                        onCancel={() => setAuthMode('LOGIN')}
                                    />
                                )}

                                {authMode === 'FORGOT_PASSWORD' && (
                                    <ForgotPasswordForm
                                        onBackToLogin={() => setAuthMode('LOGIN')}
                                        onSuccess={() => setAuthMode('LOGIN')}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Right Column: Branding & Ethereal Content (55%) */}
                <section className="hidden md:flex md:w-[55%] bg-ethereal-gradient relative overflow-hidden flex-col justify-between p-16 lg:p-24 text-white">
                    {/* Decorative Elements */}
                    <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#c128d4]/20 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-[#7E5CFE]/30 rounded-full blur-[100px]"></div>
                    
                    {/* Placeholder for Background Image */}
                    <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none bg-slate-800/10 flex items-center justify-center border-2 border-white/5 border-dashed">
                        {/* [Placeholder for auth-bg.png] */}
                    </div>

                    <div className="relative z-10 space-y-8 mt-12">
                        <h2 className="text-5xl lg:text-6xl font-['Plus_Jakarta_Sans'] font-extrabold tracking-tight leading-[1.1]">
                            Revolutionize your workspace with <span className="text-[#cbbeff]">Smarter Automation</span>
                        </h2>
                        
                        {/* Testimonial */}
                        <div className="custom-glass p-8 rounded-2xl border border-white/10 max-w-xl">
                            <p className="text-lg font-['Inter'] leading-relaxed text-[#e6deff] italic mb-6">
                                "Autopane AI has transformed how our team manages complex workflows. It’s reliable, efficient, and ensures our results are top-notch."
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full border-2 border-[#e6deff]/30 bg-slate-200/20 flex items-center justify-center text-xs overflow-hidden">
                                     {/* [Placeholder for testimonial-avatar.png] */}
                                     Avatar
                                </div>
                                <div>
                                    <p className="font-['Plus_Jakarta_Sans'] font-bold text-white">Michael Carter</p>
                                    <p className="text-sm font-['Inter'] text-[#cbbeff] uppercase tracking-wider">Software Engineer</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10">
                        <p className="text-xs font-['Inter'] uppercase tracking-[0.2em] text-[#e6deff]/60 mb-6">Join 1K+ Teams</p>
                        <div className="flex flex-wrap items-center gap-8 opacity-40 grayscale brightness-200">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-2xl">hub</span>
                                <span className="font-['Plus_Jakarta_Sans'] font-bold tracking-tighter">Discord</span>
                            </div>
                            <div className="flex items-center gap-2" >
                                <span className="material-symbols-outlined text-2xl">mail</span>
                                <span className="font-['Plus_Jakarta_Sans'] font-bold tracking-tighter">Mailchimp</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-2xl">spellcheck</span>
                                <span className="font-['Plus_Jakarta_Sans'] font-bold tracking-tighter">Grammarly</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-2xl">architecture</span>
                                <span className="font-['Plus_Jakarta_Sans'] font-bold tracking-tighter">Figma</span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
