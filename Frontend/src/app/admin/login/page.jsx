"use client";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { adminService } from "@/services/adminService";
import { setLogin } from "@/context/authSlice";
import {
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  ShieldCheck,
  AlertCircle,
  Home,
} from "lucide-react";

export default function AdminLogin() {
  const navigate = useRouter();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: loginErrors },
    setError: setLoginError,
  } = useForm();

  const onLoginSubmit = async (data) => {
    setLoading(true);
    setError("");

    try {
      const response = await adminService.loginAdmin(data.email, data.password);
      const token = response.data?.token || response.token;
      if (token && typeof window !== "undefined") {
        localStorage.setItem("admin_token", token);
      }
      dispatch(setLogin(response.data || response));
      navigate.push("/admin/dashboard");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Authentication failed. Verify credentials.";
      setError(msg);
      if (err.response?.data?.errors?.length > 0) {
        err.response.data.errors.forEach((e) => {
          if (e.field)
            setLoginError(e.field, { type: "server", message: e.message });
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-card-hover flex items-center justify-center p-6 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-96 bg-accent/10 blur-[100px] rounded-full pointer-events-none"></div>
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] z-0"
        style={{
          backgroundImage:
            "linear-gradient(#2ec5d4 1px, transparent 1px), linear-gradient(90deg, #2ec5d4 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      ></div>
      <div className="relative z-10 w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-accent/30 shadow-sm">
            <ShieldCheck className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-text tracking-tight">
            Devspace
          </h1>
          <p className="mt-2 text-sm font-medium text-text-muted">
            Authorized personnel access only
          </p>
        </div>
        {error && (
          <div className="mb-6 border border-danger/30 bg-danger/10 p-4 rounded-xl text-red-700 text-sm font-medium flex items-center gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}
        <form
          onSubmit={handleSubmitLogin(onLoginSubmit)}
          className="space-y-5"
        >
          <div>
            <label className="block text-sm font-semibold text-text mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail
                className={`absolute left-3 top-2.5 w-5 h-5 ${loginErrors.email ? "text-danger" : "text-text-muted"}`}
              />
              <input
                type="email"
                {...registerLogin("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email format",
                  },
                })}
                className={`w-full bg-card border ${loginErrors.email ? "border-danger focus:ring-danger/20 focus:border-danger" : "border-border focus:ring-accent/20 focus:border-accent"} text-text rounded-lg p-2.5 pl-10 text-sm focus:outline-none focus:ring-2 transition-colors shadow-sm placeholder:text-text-muted`}
                placeholder="Enter your Mail"
              />
            </div>
            {loginErrors.email && (
              <p className="mt-1 text-xs text-danger">
                {loginErrors.email.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-text mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock
                className={`absolute left-3 top-2.5 w-5 h-5 ${loginErrors.password ? "text-danger" : "text-text-muted"}`}
              />
              <input
                type="password"
                {...registerLogin("password", {
                  required: "Password is required",
                })}
                className={`w-full bg-card border ${loginErrors.password ? "border-danger focus:ring-danger/20 focus:border-danger" : "border-border focus:ring-accent/20 focus:border-accent"} text-text rounded-lg p-2.5 pl-10 text-sm focus:outline-none focus:ring-2 transition-colors shadow-sm placeholder:text-text-muted`}
                placeholder="********"
              />
            </div>
            {loginErrors.password && (
              <p className="mt-1 text-xs text-danger">
                {loginErrors.password.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-accent text-white py-2.5 rounded-lg text-sm font-semibold transition-colors hover:bg-accent disabled:opacity-70 shadow-sm mt-2 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Log In <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Back to Home Button inside the card */}
        <div className="mt-6 pt-6 border-t border-border-soft flex justify-start">
          <Link href="/"
            className="flex items-center gap-2 text-text-muted hover:text-accent font-medium text-sm transition-colors"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
