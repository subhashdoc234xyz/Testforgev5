import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { User, Mail, KeyRound, UserPlus, AlertCircle } from "lucide-react";

interface RegisterFormProps {
  onLoginClick: () => void;
}

export default function RegisterForm({ onLoginClick }: RegisterFormProps) {
  const { register, loginWithGoogle, loginWithGithub } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "None", color: "bg-gray-700" };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    switch (score) {
      case 1:
        return { score: 20, label: "Weak", color: "bg-red-500" };
      case 2:
        return { score: 40, label: "Fair", color: "bg-amber-500" };
      case 3:
        return { score: 60, label: "Good", color: "bg-indigo-400" };
      case 4:
        return { score: 80, label: "Strong", color: "bg-indigo-500" };
      case 5:
        return { score: 100, label: "Excellent", color: "bg-emerald-500" };
      default:
        return { score: 10, label: "Too Short", color: "bg-red-600" };
    }
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await register(email, password, name);
    } catch (err: any) {
      console.error(err);
      let errMsg = "Failed to create account.";
      if (err.code === "auth/email-already-in-use") {
        errMsg = "This email is already registered.";
      } else if (err.code === "auth/weak-password") {
        errMsg = "Password is too weak.";
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
        setError(err.message || "OAuth registration failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white/5 border border-white/12 rounded-2xl p-8 backdrop-blur-xl shadow-2xl space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-white font-display mb-1">
          Create Account
        </h2>
        <p className="text-xs text-gray-400 font-sans">
          Join TestForge and experience dual-agent QA verification
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-200 text-xs rounded-xl flex items-start gap-2.5 font-mono animate-pulse">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-300 font-sans mb-1.5 uppercase tracking-wider">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              placeholder="John Doe"
              className="w-full pl-10 pr-4 py-2.5 bg-black/30 text-sm text-gray-200 border border-white/8 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 font-sans mb-1.5 uppercase tracking-wider">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              placeholder="name@example.com"
              className="w-full pl-10 pr-4 py-2.5 bg-black/30 text-sm text-gray-200 border border-white/8 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 font-sans mb-1.5 uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              placeholder="•••••••• (Min 6 chars)"
              className="w-full pl-10 pr-4 py-2.5 bg-black/30 text-sm text-gray-200 border border-white/8 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
              required
            />
          </div>
          {/* Password Strength Indicator */}
          {password && (
            <div className="mt-2 space-y-1">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-gray-400">Strength:</span>
                <span className={strength.color.replace("bg-", "text-")}>{strength.label}</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${strength.color} transition-all duration-300`}
                  style={{ width: `${strength.score}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 font-sans mb-1.5 uppercase tracking-wider">
            Confirm Password
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-2.5 bg-black/30 text-sm text-gray-200 border border-white/8 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 mt-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/40 transition-all duration-200 cursor-pointer border border-indigo-400/20 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              Sign Up
            </>
          )}
        </button>
      </form>

      <div className="relative flex items-center justify-center py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/8"></div>
        </div>
        <span className="relative px-3 text-[10px] uppercase font-mono tracking-widest bg-[#070913] text-gray-500 rounded">
          or sign up with
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={() => handleOAuth(loginWithGoogle)}
          disabled={loading}
          className="flex items-center justify-center gap-2 py-2 px-4 bg-white/5 border border-white/8 hover:bg-white/10 text-xs font-semibold rounded-xl text-gray-200 transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-50"
        >
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
          className="flex items-center justify-center gap-2 py-2 px-4 bg-white/5 border border-white/8 hover:bg-white/10 text-xs font-semibold rounded-xl text-gray-200 transition-all duration-200 cursor-pointer active:scale-95 disabled:opacity-50"
        >
          <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
          </svg>
          GitHub
        </button>
      </div>

      <div className="text-center text-xs text-gray-400 font-sans pt-2">
        Already have an account?{" "}
        <button
          onClick={onLoginClick}
          disabled={loading}
          className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
