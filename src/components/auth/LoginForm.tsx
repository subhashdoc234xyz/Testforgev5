import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { KeyRound, Mail, Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";

interface LoginFormProps {
  onRegisterClick: () => void;
  onForgotPasswordClick: () => void;
}

export default function LoginForm({ onRegisterClick, onForgotPasswordClick }: LoginFormProps) {
  const { login, loginWithGoogle, loginWithGithub } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      console.error(err);
      let errMsg = "Failed to sign in. Please verify your credentials.";
      if (err.code === "auth/invalid-credential") {
        errMsg = "Incorrect email or password.";
      } else if (err.code === "auth/invalid-email") {
        errMsg = "Please enter a valid email address.";
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (providerFn: () => Promise<any>) => {
    setLoading(true);
    setError(null);
    try {
      await providerFn();
    } catch (err: any) {
      console.error(err);
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "OAuth authentication failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md glass-card p-8 space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-[#0c4a6e] mb-1">
          Welcome back
        </h2>
        <p className="text-xs text-[#0369a1]">
          Sign in to access your TestForge pipeline
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-start gap-2.5 font-medium">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-medium text-[#0369a1] mb-1.5 uppercase tracking-[0.08em]">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[#7dd3fc]" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              placeholder="name@example.com"
              className="w-full pl-10 pr-4 py-2.5 bg-white/45 text-sm text-[#0c4a6e] border border-white/75 rounded-[10px] focus:border-[rgba(37,99,235,0.45)] focus:outline-none transition placeholder:text-[#7dd3fc]"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-[11px] font-medium text-[#0369a1] uppercase tracking-[0.08em]">
              Password
            </label>
            <button
              type="button"
              onClick={onForgotPasswordClick}
              disabled={loading}
              className="text-[12px] text-[#2563eb] hover:text-[#1d4ed8] cursor-pointer font-medium"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-[#7dd3fc]" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-white/45 text-sm text-[#0c4a6e] border border-white/75 rounded-[10px] focus:border-[rgba(37,99,235,0.45)] focus:outline-none transition placeholder:text-[#7dd3fc]"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              className="absolute right-3 top-3.5 text-[#7dd3fc] hover:text-[#0369a1] focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 mt-2 bg-[#2563eb] hover:bg-[#1d4ed8] active:bg-[#1e40af] text-white text-[13px] font-medium rounded-lg flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer border-none active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              Sign In
            </>
          )}
        </button>
      </form>

      <div className="relative flex items-center justify-center py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#0c4a6e]/10"></div>
        </div>
        <span className="relative px-3 text-[10px] uppercase font-medium tracking-[0.1em] bg-white/45 text-[#0369a1] rounded">
          or continue with
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={() => handleOAuth(loginWithGoogle)}
          disabled={loading}
          className="flex items-center justify-center gap-2 py-2 px-4 bg-white/50 border border-[rgba(37,99,235,0.20)] hover:bg-white/75 text-[12px] font-normal rounded-[6px] text-[#1d4ed8] transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-50"
        >
          {/* Official Google Icon */}
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.113-5.136 4.113-3.055 0-5.55-2.493-5.55-5.55s2.495-5.55 5.55-5.55c1.377 0 2.636.502 3.612 1.328l3.078-3.078C18.845 2.09 15.748 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.895 0 10.865-4.04 10.865-11.24 0-.568-.054-1.122-.162-1.655H12.24z"
            />
          </svg>
          Google
        </button>

        {/* GitHub OAuth Button */}
        <button
          type="button"
          onClick={() => handleOAuth(loginWithGithub)}
          disabled={loading}
          className="flex items-center justify-center gap-2 py-2 px-4 bg-white/50 border border-[rgba(37,99,235,0.20)] hover:bg-white/75 text-[12px] font-normal rounded-[6px] text-[#1d4ed8] transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-50"
        >
          {/* GitHub Icon */}
          <svg className="w-4 h-4 fill-current text-[#1d4ed8]" viewBox="0 0 24 24">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
          </svg>
          GitHub
        </button>
      </div>

      <div className="text-center text-xs text-[#0369a1] pt-2">
        Don't have an account?{" "}
        <button
          onClick={onRegisterClick}
          disabled={loading}
          className="text-[#2563eb] hover:text-[#1d4ed8] font-medium cursor-pointer underline"
        >
          Create one now
        </button>
      </div>
    </div>
  );
}
