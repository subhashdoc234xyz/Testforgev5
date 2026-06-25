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
    <div className="w-full max-w-md glass-card p-8 space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-[#0c4a6e] font-display mb-1">
          Reset Password
        </h2>
        <p className="text-xs text-[#0369a1] font-sans">
          We will send you instructions to reset your password
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-start gap-2.5 font-mono">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-3 font-sans">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-[#065f46]">Reset email sent!</h4>
            <p className="text-xs text-[#065f46] mt-1 leading-relaxed">
              Check your inbox for a message with a link to reset your password.
            </p>
          </div>
        </div>
      )}

      {!success && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-[#0369a1] font-sans mb-1.5 uppercase tracking-wider">
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
                className="w-full pl-10 pr-4 py-2.5 bg-white/45 text-sm text-[#0c4a6e] border border-white/75 rounded-xl focus:border-[#2563eb]/45 focus:outline-none transition-all font-sans placeholder:text-[#7dd3fc]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 bg-[#2563eb] hover:bg-[#1d4ed8] active:bg-[#1e40af] text-white text-[13px] font-medium rounded-lg flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
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
          className="text-xs text-[#0369a1] hover:text-[#0c4a6e] transition-all flex items-center justify-center gap-1.5 mx-auto cursor-pointer font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Sign In
        </button>
      </div>
    </div>
  );
}
