import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Mail, ArrowLeft, Send, CheckCircle, AlertCircle } from "lucide-react";

interface ForgotPasswordProps {
  onBackToLoginClick: () => void;
}

export default function ForgotPassword({ onBackToLoginClick }: ForgotPasswordProps) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await resetPassword(email);
      setSuccess(true);
      setEmail("");
    } catch (err: any) {
      console.error(err);
      let errMsg = "Failed to send reset email. Please try again.";
      if (err.code === "auth/invalid-email") {
        errMsg = "Please enter a valid email address.";
      } else if (err.code === "auth/user-not-found") {
        errMsg = "No user found with this email.";
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white/5 border border-white/12 rounded-2xl p-8 backdrop-blur-xl shadow-2xl space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-white font-display mb-1">
          Reset Password
        </h2>
        <p className="text-xs text-gray-400 font-sans">
          We will send you instructions to reset your password
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-200 text-xs rounded-xl flex items-start gap-2.5 font-mono animate-pulse">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs rounded-xl flex items-start gap-3 font-sans">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-white">Reset email sent!</h4>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Check your inbox for a message with a link to reset your password.
            </p>
          </div>
        </div>
      )}

      {!success && (
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/40 transition-all duration-200 cursor-pointer border border-indigo-400/20 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Reset Link
              </>
            )}
          </button>
        </form>
      )}

      <div className="text-center pt-2">
        <button
          onClick={onBackToLoginClick}
          disabled={loading}
          className="text-xs text-gray-400 hover:text-white transition-all flex items-center justify-center gap-1.5 mx-auto cursor-pointer font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Sign In
        </button>
      </div>
    </div>
  );
}
