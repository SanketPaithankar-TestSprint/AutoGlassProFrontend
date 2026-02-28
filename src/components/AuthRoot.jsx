import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import Login from "./login";
import SignUpForm from "./SignUpForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
import PageHead from "./PageHead";
import { useAuth } from '../context/auth/useAuth';
import { useProfileDataPrefetch } from '../hooks/useProfileDataPrefetch';
import useInquiryNotifications from "../hooks/useInquiryNotifications";
import { getValidToken } from '../api/getValidToken';
import { useNavigate, useLocation } from "react-router-dom";

// Simple Logo Component if needed locally, or import shared
const Logo = ({ className }) => {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                APAI
            </span>
        </div>
    );
};

export default function AuthRoot() {
    const { t } = useTranslation();
    // Mode: 'LOGIN', 'SIGNUP', 'FORGOT_PASSWORD'
    const [authMode, setAuthMode] = useState('LOGIN');
    const { login } = useAuth();
    const prefetchProfileData = useProfileDataPrefetch();
    // const { fetchUnreadCount } = useInquiryNotifications();
    const navigate = useNavigate();
    const location = useLocation();

    // Check location state for signup mode
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
            // Update context state
            if (login) login(token);
            try {
                if (prefetchProfileData) await prefetchProfileData();
                // if (fetchUnreadCount) await fetchUnreadCount();
            } catch (error) {
                console.error("Error prefetching data:", error);
            }
            // Navigate to dashboard/home
            navigate("/search-by-root");
        }
    };

    const handleSignUpSuccess = () => {
        setAuthMode('LOGIN');
    };

    const isSignUpMode = authMode === 'SIGNUP';

    return (
        <div className="w-full bg-white flex items-start justify-center p-4 pt-24 md:pt-32 pb-24 relative overflow-hidden">
            <PageHead
                title="Login / Sign Up | APAI"
                description="Sign in to your APAI dashboard or create a new account to scale your auto glass shop."
            />

            <div
                className="bg-white/90 backdrop-blur-md rounded-[24px] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden w-full max-w-[800px] lg:max-w-[900px] min-h-[450px] md:min-h-[550px] flex flex-col md:block z-10 border border-white/20"
            >
                {/* DESKTOP LAYOUT */}
                <div className="hidden md:block h-full relative min-h-[450px] md:min-h-[550px]">

                    {/* SIGN UP FORM CONTAINER (Left Position) */}
                    <div
                        className={`absolute top-0 left-0 h-full w-[60%] transition-all duration-700 ease-in-out
                    ${isSignUpMode ? 'opacity-100 z-10 translate-x-0' : 'opacity-0 z-0 translate-x-[20%]'}`}
                    >
                        <div className="h-full flex flex-col items-center justify-center p-8 bg-transparent">
                            <div className="w-full h-full overflow-y-auto custom-scrollbar flex flex-col items-center">
                                <div className="w-full max-w-xl pb-8">
                                    <h1 className="text-3xl md:text-4xl font-extrabold mb-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent text-center mt-8 tracking-tight">{t('auth.joinUs')}</h1>
                                    <SignUpForm onSuccess={handleSignUpSuccess} onCancel={() => setAuthMode('LOGIN')} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* LOGIN / FORGOT PASSWORD CONTAINER (Right Position) */}
                    <div
                        className={`absolute top-0 right-0 h-full w-[60%] transition-all duration-700 ease-in-out
                    ${!isSignUpMode ? 'opacity-100 z-10 translate-x-0' : 'opacity-0 z-0 translate-x-[-20%]'}`}
                    >
                        <div className="h-full flex flex-col items-center justify-center p-8 bg-transparent">
                            <div className="w-full h-full overflow-y-auto custom-scrollbar flex flex-col items-center justify-center">

                                <div className="w-full max-w-sm transition-opacity duration-300">
                                    {authMode === 'LOGIN' && (
                                        <>
                                            <h1 className="text-3xl md:text-4xl font-extrabold mb-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent tracking-tight text-center p-5">{t('auth.signIn')}</h1>
                                            <Login
                                                onLoginSuccess={handleLoginSuccess}
                                                onForgotPasswordClick={() => setAuthMode('FORGOT_PASSWORD')}
                                                onSignUpClick={() => setAuthMode('SIGNUP')}
                                            />
                                        </>
                                    )}

                                    {authMode === 'FORGOT_PASSWORD' && (
                                        <>
                                            <h1 className="text-2xl md:text-3xl font-extrabold mb-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent tracking-tight text-center">{t('auth.resetPassword')}</h1>
                                            <ForgotPasswordForm
                                                onBackToLogin={() => setAuthMode('LOGIN')}
                                                onSuccess={() => setAuthMode('LOGIN')}
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* OVERLAY CONTAINER (40% Width) */}
                    <div
                        className={`absolute top-0 left-0 h-full w-[40%] overflow-hidden transition-transform duration-700 ease-in-out z-30
                    ${isSignUpMode ? 'translate-x-[150%] rounded-l-[100px]' : 'translate-x-0 rounded-r-[100px]'}`}
                        style={{ zIndex: 30 }}
                    >
                        <div
                            className="h-full w-full relative text-white"
                            style={{
                                background: 'linear-gradient(to right, #7c3aed, #c026d3)',
                            }}
                        >

                            {/* Overlay Content: LOGIN CTA (Visible when Overlay is Left -> Login/Forgot Mode) */}
                            <div className={`absolute inset-0 flex flex-col items-center justify-center text-center px-8 transition-opacity duration-700
                             ${!isSignUpMode ? 'opacity-100 delay-200 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                            >
                                <h1 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">{t('auth.newHere')}</h1>
                                <p className="text-lg mb-8 text-white/90 font-medium leading-relaxed">{t('auth.joinNetwork')}</p>
                                <button
                                    style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        color: '#7E5CFE',
                                        border: '2px solid white'
                                    }}
                                    className="px-10 py-3 rounded-full font-bold uppercase tracking-wider cursor-pointer shadow-lg transition-all transform hover:scale-105 focus:outline-none hover:shadow-xl"
                                    onClick={() => setAuthMode('SIGNUP')}
                                >
                                    {t('auth.signUp')}
                                </button>
                            </div>

                            {/* Overlay Content: SIGNUP CTA (Visible when Overlay is Right -> SignUp Mode) */}
                            <div className={`absolute inset-0 flex flex-col items-center justify-center text-center px-8 transition-opacity duration-700
                            ${isSignUpMode ? 'opacity-100 delay-200 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                            >
                                <h1 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">{t('auth.alreadyPartner')}</h1>
                                <p className="text-lg mb-8 text-white/90 font-medium leading-relaxed">{t('auth.loginDashboard')}</p>
                                <button
                                    style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        color: '#7E5CFE',
                                        border: '2px solid white'
                                    }}
                                    className="px-10 py-3 rounded-full font-bold uppercase tracking-wider cursor-pointer shadow-lg transition-all transform hover:scale-105 focus:outline-none hover:shadow-xl"
                                    onClick={() => setAuthMode('LOGIN')}
                                >
                                    {t('auth.signIn')}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>

                {/* MOBILE LAYOUT */}
                <div className="md:hidden p-6 flex flex-col items-center">

                    <div className="w-full bg-slate-100 p-1 rounded-lg mb-6 flex">
                        <button
                            className={`flex-1 py-2 rounded-md font-semibold transition-all ${authMode === 'LOGIN' || authMode === 'FORGOT_PASSWORD' ? 'bg-violet-600 shadow-md text-white' : 'text-slate-500 hover:bg-slate-200'}`}
                            onClick={() => setAuthMode('LOGIN')}
                        >
                            {t('auth.signIn')}
                        </button>
                        <button
                            className={`flex-1 py-2 rounded-md font-semibold transition-all ${authMode === 'SIGNUP' ? 'bg-violet-600 shadow-md text-white' : 'text-slate-500 hover:bg-slate-200'}`}
                            onClick={() => setAuthMode('SIGNUP')}
                        >
                            {t('auth.signUp')}
                        </button>
                    </div>

                    <div className="w-full">
                        {authMode === 'SIGNUP' && (
                            <div className="animate-fade-in">
                                <SignUpForm onSuccess={handleSignUpSuccess} onCancel={() => setAuthMode('LOGIN')} />
                            </div>
                        )}

                        {authMode === 'LOGIN' && (
                            <div className="animate-fade-in">
                                <Login
                                    onLoginSuccess={handleLoginSuccess}
                                    onForgotPasswordClick={() => setAuthMode('FORGOT_PASSWORD')}
                                    onSignUpClick={() => setAuthMode('SIGNUP')}
                                />
                            </div>
                        )}

                        {authMode === 'FORGOT_PASSWORD' && (
                            <div className="animate-fade-in">
                                <h2 className="text-xl font-bold mb-4 text-center">{t('auth.resetPassword')}</h2>
                                <ForgotPasswordForm
                                    onBackToLogin={() => setAuthMode('LOGIN')}
                                    onSuccess={() => setAuthMode('LOGIN')}
                                />
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
