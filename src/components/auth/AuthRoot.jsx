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
                <section className="hidden md:flex md:w-[55%] relative overflow-hidden flex-col justify-between p-16 lg:p-24 text-white">
                    {/* Background Image */}
                    <div 
                        className="absolute inset-0 z-0"
                        style={{
                            backgroundImage: `url(${signinImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    >
                    </div>
                </section>
            </div>
        </div>
    );
}
