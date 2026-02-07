import React, { useState, useEffect } from "react";
import { Button, theme } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import Login from "./login";
import SignUpForm from "./SignUpForm";
import Logo from "./logo";
import { ArrowLeftOutlined } from "@ant-design/icons";

const AuthPage = () => {
    const [isSignUpMode, setIsSignUpMode] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { token } = theme.useToken();

    useEffect(() => {
        if (location.state?.mode === "signup") {
            setIsSignUpMode(true);
        }
    }, [location.state]);

    const handleLoginSuccess = () => {
        navigate("/search-by-root");
    };

    const handleSignUpSuccess = () => {
        setIsSignUpMode(false);
    };

    return (
        <div className="w-full bg-white flex items-start justify-center p-4 pt-24 md:pt-32 pb-24 relative overflow-hidden">
            {/* Simple static gradient background */}
            <div
                className="fixed inset-0 z-0 pointer-events-none opacity-20"
                style={{ background: 'linear-gradient(135deg, #7E5CFE 0%, #00A8E4 100%)' }}
            />


            <div
                className="bg-white rounded-[20px] shadow-[0_20px_50px_rgba(124,58,237,0.455)] relative overflow-hidden w-full max-w-[800px] lg:max-w-[900px] min-h-[450px] md:min-h-[550px] flex flex-col md:block"
            >
                {/* 
            DESKTOP LAYOUT (Sliding Overlay) 
            Hidden on mobile, block on md
        */}
                <div className="hidden md:block h-full relative min-h-[450px] md:min-h-[550px]">

                    {/* SIGN UP FORM CONTAINER (Left Position - 60% Width) */}
                    <div
                        className={`absolute top-0 left-0 h-full w-[60%] transition-all duration-700 ease-in-out
                    ${isSignUpMode ? 'opacity-100 z-10 translate-x-0' : 'opacity-0 z-0 translate-x-[20%]'}`}
                    >
                        <div className="h-full flex flex-col items-center justify-center p-8 bg-transparent">
                            <div className="w-full h-full overflow-y-auto custom-scrollbar flex flex-col items-center">
                                <div className="w-full max-w-xl pb-8">
                                    <h1 className="text-3xl md:text-4xl font-extrabold mb-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent text-center mt-8 tracking-tight">Join Us</h1>
                                    <SignUpForm onSuccess={handleSignUpSuccess} onCancel={() => setIsSignUpMode(false)} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* LOGIN FORM CONTAINER (Right Position - 60% Width) */}
                    <div
                        className={`absolute top-0 right-0 h-full w-[60%] transition-all duration-700 ease-in-out
                    ${!isSignUpMode ? 'opacity-100 z-10 translate-x-0' : 'opacity-0 z-0 translate-x-[-20%]'}`}
                    >
                        <div className="h-full flex flex-col items-center justify-center p-8 bg-transparent">
                            <div className="w-full h-full overflow-y-auto custom-scrollbar flex flex-col items-center justify-center">
                                <h1 className="text-3xl md:text-4xl font-extrabold mb-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent tracking-tight">Sign In</h1>
                                <div className="w-full max-w-sm">
                                    <Login
                                        onLoginSuccess={handleLoginSuccess}
                                        onSignUpClick={() => setIsSignUpMode(true)}
                                    />
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
                            {/* Overlay Content: LOGIN CTA (Visible when Overlay is Left -> Login Mode) */}
                            <div className={`absolute inset-0 flex flex-col items-center justify-center text-center px-8 transition-opacity duration-700
                             ${!isSignUpMode ? 'opacity-100 delay-200 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                            >
                                <h1 className="text-3xl md:text-4xl font-bold mb-4">New Here?</h1>
                                <p className="text-lg mb-8 text-white/90">Join our network to access professional quoting and invoicing tools</p>
                                <button
                                    className="bg-white border-2 border-white !text-violet-600 rounded-full px-12 py-3 font-bold uppercase tracking-wider transition-transform hover:scale-105 focus:outline-none cursor-pointer"
                                    onClick={() => setIsSignUpMode(true)}
                                >
                                    Sign Up
                                </button>
                            </div>

                            {/* Overlay Content: SIGNUP CTA (Visible when Overlay is Right -> SignUp Mode) */}
                            <div className={`absolute inset-0 flex flex-col items-center justify-center text-center px-8 transition-opacity duration-700
                            ${isSignUpMode ? 'opacity-100 delay-200 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                            >
                                <h1 className="text-3xl md:text-4xl font-bold mb-4">Already a Partner?</h1>
                                <p className="text-lg mb-8 text-white/90">Log in to your dashboard to manage quotes and invoices</p>
                                <button
                                    className="bg-white border-2 border-white !text-violet-600 rounded-full px-12 py-3 font-bold uppercase tracking-wider transition-transform hover:scale-105 focus:outline-none cursor-pointer"
                                    onClick={() => setIsSignUpMode(false)}
                                >
                                    SignIn
                                </button>
                            </div>
                        </div>
                    </div>

                </div>

                {/* 
            MOBILE LAYOUT (Simple Toggle) 
            Visible on mobile, hidden on md
        */}
                <div className="md:hidden p-6 flex flex-col items-center">
                    <div className="mb-6">
                        <Logo />
                    </div>

                    <div className="w-full bg-slate-100 p-1 rounded-lg mb-6 flex">
                        <button
                            className={`flex-1 py-2 rounded-md font-semibold transition-all ${!isSignUpMode ? 'bg-violet-600 shadow-md text-white' : 'text-slate-500 hover:bg-slate-200'}`}
                            onClick={() => setIsSignUpMode(false)}
                        >
                            SignIn
                        </button>
                        <button
                            className={`flex-1 py-2 rounded-md font-semibold transition-all ${isSignUpMode ? 'bg-violet-600 shadow-md text-white' : 'text-slate-500 hover:bg-slate-200'}`}
                            onClick={() => setIsSignUpMode(true)}
                        >
                            Sign Up
                        </button>
                    </div>

                    <div className="w-full">
                        {isSignUpMode ? (
                            <div className="animate-fade-in">
                                <SignUpForm onSuccess={handleSignUpSuccess} onCancel={() => setIsSignUpMode(false)} />
                            </div>
                        ) : (
                            <div className="animate-fade-in">
                                <Login onLoginSuccess={handleLoginSuccess} onSignUpClick={() => setIsSignUpMode(true)} />
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AuthPage;
