import React, { useState } from "react";
import { CarOutlined } from "@ant-design/icons";
import { notification } from "antd";
import { login } from "../api/homepage";

export default function Login()
{
    const [api, contextHolder] = notification.useNotification();
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ email: "", password: "", remember: false });
    const [errors, setErrors] = useState({ email: "", password: "" });

    const onChange = (e) =>
    {
        const { name, value, type, checked } = e.target;
        setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
        if (errors[name]) setErrors((er) => ({ ...er, [name]: "" }));
    };

    const validate = () =>
    {
        const er = { email: "", password: "" };
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
        const usernameOk = /^[a-zA-Z0-9_.]{3,}$/.test(form.email);
        if (!emailOk && !usernameOk) er.email = "Enter a valid email address or username.";
        if (form.password.length < 8) er.password = "Password must be at least 8 characters.";
        setErrors(er);
        return !er.email && !er.password;
    };

    const onSubmit = async (e) =>
    {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);

        try
        {
            const res = await login({
                usernameOrEmail: form.email,
                password: form.password,
            });
            if (res && res.success)
            {
                localStorage.setItem("ApiToken", JSON.stringify(res));
                api.success({
                    message: `Welcome, ${res.data.username}!`,
                    description: "Signed in successfully.",
                    placement: "topRight",
                });
                window.location.href = "/";
            } else
            {
                setErrors((er) => ({
                    ...er,
                    password: res?.message || "Login failed. Please check your credentials.",
                }));

                api.error({
                    message: "Login failed",
                    description: res?.message || "Please check your credentials.",
                    placement: "topRight",
                });
            }
        } catch (err)
        {
            setErrors((er) => ({
                ...er,
                password: "Network error. Please try again.",
            }));

            api.error({
                message: "Network error",
                description: "Please try again.",
                placement: "topRight",
            });
        }

        setLoading(false);
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6 flex items-center justify-center">
            {contextHolder}

            <section
                className="w-full max-w-md rounded-2xl p-8 bg-white/10 backdrop-blur-xl border border-white/15 shadow-2xl"
                aria-labelledby="login-title"
                role="form"
            >
                <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-white/15 text-white">
                    <CarOutlined />
                </div>

                <h1 id="login-title" className="text-center text-2xl font-semibold mb-6 text-slate-50">
                    Welcome back
                </h1>

                <form onSubmit={onSubmit} noValidate className="space-y-5">
                    {/* Email */}
                    <div className="relative">
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={onChange}
                            required
                            autoComplete="email"
                            aria-invalid={!!errors.email || undefined}
                            aria-describedby={errors.email ? "email-err" : undefined}
                            className="peer w-full rounded-xl border border-white/15 bg-white/10 px-4 py-4 text-slate-100 placeholder-transparent outline-none
                       transition focus-visible:border-indigo-400 focus-visible:ring-4 focus-visible:ring-indigo-400/30"
                            placeholder="Email address"
                        />
                        <label
                            htmlFor="email"
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 transition-all
                       peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base
                       peer-focus:-top-2 peer-focus:text-xs
                       peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:text-xs
                       bg-slate-950/80 px-1 rounded"
                        >
                            Email address
                        </label>
                        {errors.email && (
                            <p id="email-err" role="alert" className="mt-2 text-sm text-rose-300">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <input
                            id="password"
                            name="password"
                            type={show ? "text" : "password"}
                            value={form.password}
                            onChange={onChange}
                            required
                            autoComplete="current-password"
                            aria-invalid={!!errors.password || undefined}
                            aria-describedby={errors.password ? "pass-err" : undefined}
                            className="peer w-full rounded-xl border border-white/15 bg-white/10 px-4 py-4 pr-12 text-slate-100 placeholder-transparent outline-none
                       transition focus-visible:border-indigo-400 focus-visible:ring-4 focus-visible:ring-indigo-400/30"
                            placeholder="Password"
                        />
                        <label
                            htmlFor="password"
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 transition-all
                       peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base
                       peer-focus:-top-2 peer-focus:text-xs
                       peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:text-xs
                       bg-slate-950/80 px-1 rounded"
                        >
                            Password
                        </label>
                        <button
                            type="button"
                            onClick={() => setShow((s) => !s)}
                            aria-label={show ? "Hide password" : "Show password"}
                            aria-pressed={show}
                            aria-controls="password"
                            className="absolute right-2 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-lg border border-white/15
                       bg-white/10 text-indigo-200 hover:text-white focus-visible:ring-4 focus-visible:ring-indigo-400/30 focus-visible:outline-none"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="stroke-current">
                                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" strokeWidth="1.5" />
                                <circle cx="12" cy="12" r="3" strokeWidth="1.5" />
                            </svg>
                        </button>
                        {errors.password && (
                            <p id="pass-err" role="alert" className="mt-2 text-sm text-rose-300">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <div className="mt-1 flex items-center justify-between">
                        <label className="flex items-center gap-2 text-slate-300">
                            <input
                                type="checkbox"
                                name="remember"
                                checked={form.remember}
                                onChange={onChange}
                                className="h-4 w-4 rounded border-white/20 bg-white/10 text-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-400/50"
                            />
                            Remember me
                        </label>
                        <button type="button" className="text-indigo-200 hover:text-white focus-visible:underline focus-visible:outline-none">
                            Forgot password?
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        aria-busy={loading}
                        className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600
                       px-4 py-3 font-semibold text-white shadow-lg transition hover:shadow-indigo-700/30
                       focus-visible:ring-4 focus-visible:ring-indigo-400/30 focus-visible:outline-none disabled:opacity-70"
                    >
                        {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                        {loading ? "Signing in..." : "Sign In"}
                    </button>

                    <div className="my-2 flex items-center gap-3 text-slate-300">
                        <span className="h-px flex-1 bg-white/15" />
                        <span className="text-sm">or continue with</span>
                        <span className="h-px flex-1 bg-white/15" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-slate-900 shadow hover:shadow-md
                         focus-visible:ring-4 focus-visible:ring-indigo-400/30 focus-visible:outline-none"
                        >
                            Google
                        </button>
                        <button
                            type="button"
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-slate-900 shadow hover:shadow-md
                         focus-visible:ring-4 focus-visible:ring-indigo-400/30 focus-visible:outline-none"
                        >
                            Facebook
                        </button>
                    </div>

                    <p className="mt-2 text-center text-slate-300">
                        Don’t have an account?{" "}
                        <button type="button" className="text-indigo-200 hover:text-white focus-visible:underline focus-visible:outline-none">
                            Sign up
                        </button>
                    </p>
                </form>
            </section>
        </main>
    );
}
