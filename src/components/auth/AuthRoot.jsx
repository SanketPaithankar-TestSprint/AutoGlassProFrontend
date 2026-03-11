import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import Login from "./login";
import SignUpForm from "./SignUpForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
import PageHead from '../PageHead';
import { useAuth } from '../../context/auth/useAuth';
import { useProfileDataPrefetch } from '../../hooks/useProfileDataPrefetch';
import { getValidToken } from '../../api/getValidToken';
import { useNavigate, useLocation, Link } from "react-router-dom";
import Logo from '../logo';
import AuthSlider from './AuthSlider';

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
        <div className="w-full h-screen flex overflow-hidden bg-white font-poppins sans-serif"
        >
            <PageHead
                title="Login / Sign Up | APAI"
                description="Sign in to your APAI dashboard or create a new account to scale your auto glass shop."
            />

            {/* Left Column — Auth Form */}
            <div className="w-full lg:w-[45%] h-full flex flex-col relative px-7 lg:px-24">
                {/* Logo Header */}
                <div className="pt-6 pb-4">
                    <Link to="/">
                        <Logo className="w-16 h-16 cursor-pointer" />
                    </Link>
                </div>

                {/* Form Area */}
                <div className="flex-1 flex flex-col justify-center overflow-y-auto custom-scrollbar py-6">
                    {authMode === 'LOGIN' && (
                        <div>
                            <h1 className="font-bold text-2xl md:text-[30px]  text-gray-950 mt-8">
                                {t('auth.signIn')}
                            </h1>
                            <Login
                                onLoginSuccess={handleLoginSuccess}
                                onForgotPasswordClick={() => setAuthMode('FORGOT_PASSWORD')}
                                onSignUpClick={() => setAuthMode('SIGNUP')}
                            />
                        </div>
                    )}

                    {authMode === 'SIGNUP' && (
                        <div>
                            <h1 className="text-[30px] font-bold text-slate-900 mb-8">
                                {t('auth.signUp')}
                            </h1>
                            <SignUpForm onSuccess={handleSignUpSuccess} onCancel={() => setAuthMode('LOGIN')} />
                        </div>
                    )}

                    {authMode === 'FORGOT_PASSWORD' && (
                        <div>
                            <h1 className="text-[30px] font-bold text-slate-900 mb-8">
                                {t('auth.resetPassword')}
                            </h1>
                            <ForgotPasswordForm
                                onBackToLogin={() => setAuthMode('LOGIN')}
                                onSuccess={() => setAuthMode('LOGIN')}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column — Features Slider (Desktop Only) */}
            <div className="hidden lg:flex w-[55%] h-full items-center justify-center relative overflow-hidden">
                {/* Left Orb - More vibrant purple */}
                <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full opacity-40 pointer-events-none blur-[120px]"
                    style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
                {/* Right Orb - More vibrant pink/indigo */}
                <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-30 pointer-events-none blur-[100px]"
                    style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />
                {/* Subtle grid texture */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/cubes.png")` }} />

                {/* The glass card for the carousel */}
                <div className="relative z-10 w-full max-w-lg p-4">
                    <AuthSlider />
                </div>
            </div>
        </div>
    );
}
