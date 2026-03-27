import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import Login from "./login";
import SignUpForm from "./SignUpForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
import PageHead from "../PageHead";
import { useAuth } from "../../context/auth/useAuth";
import { useProfileDataPrefetch } from "../../hooks/useProfileDataPrefetch";
import { getValidToken } from "../../api/getValidToken";
import authImage from "../../assets/images/signin_image.png";


const AuthShell = ({
  title,
  description,
  children,
  footer,
  showBack = false,
  onBack,
}) => {
  return (
    <div className="mx-auto flex min-h-screen w-full bg-[#F5F7FB] lg:bg-white">
      <PageHead
        title="Login / Sign Up | APAI"
        description="Sign in to your APAI dashboard or create a new account to continue."
      />

      <div className="flex w-full min-h-screen flex-col lg:flex-row">
        <section className="order-2 flex w-full items-center justify-center px-5 py-8 sm:px-8 md:px-10 lg:order-1 lg:w-[50%] lg:px-14 xl:px-20">
          <div className="w-full max-w-[500px]">
            <div className="mb-10 mt-10">
              <h1 className="text-[38px] font-bold leading-tight tracking-tight text-[#0D2B5C] sm:text-[44px]">
                {title}
              </h1>
              <p className="mt-3 max-w-[420px] text-[15px] leading-7 text-slate-500 sm:text-base group">
                <span className="transition-colors duration-200 text-slate-500 group-hover:bg-gradient-to-r group-hover:from-violet-500 group-hover:to-fuchsia-500 group-hover:bg-clip-text group-hover:text-transparent">
                  {description}
                </span>
              </p>
            </div>

            <div>{children}</div>

            {footer ? <div className="mt-8">{footer}</div> : null}
          </div>
        </section>

        <aside className="order-1 hidden w-full overflow-hidden lg:order-2 lg:block lg:w-[50%]">
          <div className="flex h-full min-h-screen items-center justify-center px-6 py-10 xl:px-10">
            <div className="flex items-center justify-center w-full h-full">
              <img
                src={authImage}
                alt="Authentication visual"
                className="object-contain max-h-[80vh] w-auto max-w-[90%] mx-auto"         
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default function AuthRoot() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const prefetchProfileData = useProfileDataPrefetch();
  const navigate = useNavigate();
  const location = useLocation();
  const [authMode, setAuthMode] = useState("LOGIN");

  useEffect(() => {
    if (location.state?.mode === "signup") {
      setAuthMode("SIGNUP");
      return;
    }

    if (location.state?.mode === "signin") {
      setAuthMode("LOGIN");
    }
  }, [location.state]);

  const handleLoginSuccess = async () => {
    const token = getValidToken();

    if (!token) return;

    if (login) login(token);

    try {
      if (prefetchProfileData) {
        await prefetchProfileData();
      }
    } catch (error) {
      console.error("Error prefetching data:", error);
    }

    navigate("/quote");
  };

  const handleSignUpSuccess = () => {
    setAuthMode("LOGIN");
  };

  const viewConfig = useMemo(() => {
    if (authMode === "SIGNUP") {
      return {
        title: t("auth.signUp", "Create account"),
        description:
          t(
            "auth.signupDescription",
            "Join our network to access professional quoting and invoicing tools."
          ),
        content: (
          <SignUpForm
            onSuccess={handleSignUpSuccess}
            onCancel={() => setAuthMode("LOGIN")}
          />
        ),
        showBack: true,
        onBack: () => setAuthMode("LOGIN"),
      };
    }

    if (authMode === "FORGOT_PASSWORD") {
      return {
        title: t("auth.resetPassword", "Reset password"),
        description:
          t(
            "auth.forgotPasswordDescription",
            "Enter your registered email and follow the next steps to securely update your password."
          ),
        content: (
          <ForgotPasswordForm
            onBackToLogin={() => setAuthMode("LOGIN")}
            onSuccess={() => setAuthMode("LOGIN")}
          />
        ),
        showBack: true,
        onBack: () => setAuthMode("LOGIN"),
      };
    }

    return {
      title: t("auth.signIn", "Sign In"),
      description:
        t(
          "auth.signinDescription",
          "Log in to your dashboard to manage quotes and invoices."
        ),
      content: (
        <Login
          onLoginSuccess={handleLoginSuccess}
          onForgotPasswordClick={() => setAuthMode("FORGOT_PASSWORD")}
          onSignUpClick={() => setAuthMode("SIGNUP")}
        />
      ),
      showBack: false,
      onBack: undefined,
    };
  }, [authMode, handleLoginSuccess, t]);

  return (
    <AuthShell
      title={viewConfig.title}
      description={viewConfig.description}
      showBack={viewConfig.showBack}
      onBack={viewConfig.onBack}
    >
      {viewConfig.content}
    </AuthShell>
  );
}
