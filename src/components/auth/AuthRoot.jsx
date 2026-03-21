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
import signinImage from '../../assets/images/signin_image.png';

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
        <div className="bg-white font-['Inter'] text-[#191c1e] h-screen flex flex-col overflow-hidden">
            <PageHead
                title="Login / Sign Up | APAI"
                description="Sign in to your APAI dashboard or create a new account to scale your auto glass shop."
            />
            
            <div className="flex-grow flex h-full">
                {/* Left Column: Sign-in Form */}
                <section className="flex-1 flex flex-col bg-white z-10 relative min-h-[600px] overflow-y-auto custom-scrollbar">
                    <div className="flex-grow flex items-center justify-center px-4 md:px-16 lg:px-20 py-12">
                        <div className="w-full max-w-md">
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

                {/* Right Column: Branding & Image (Responsive Width) */}
                <section className="hidden md:flex md:w-[45%] lg:w-[40%] xl:w-[35%] relative overflow-hidden flex-col bg-[#f8fafc]">
                    {/* Background Pattern/Gradient for depth */}
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 z-0" />
                    
                    {/* The Image */}
                    <img 
                        src={signinImage} 
                        alt="Join AutoGlassPro" 
                        className="absolute inset-0 w-full h-full object-contain z-10 p-12 lg:p-16"
                        style={{ objectPosition: 'center center' }}
                    />
                    
                    {/* Subtle Overlay to make it feel more integrated */}
                    <div className="absolute inset-0 bg-black/5 z-20" />
                </section>
            </div>
        </div>
    );
}
