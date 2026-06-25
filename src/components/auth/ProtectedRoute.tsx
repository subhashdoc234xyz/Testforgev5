import React from "react";
import { useAuth } from "../../context/AuthContext";
import { RotateCw, ShieldAlert } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-100 font-sans relative">
        <div className="mesh-bg absolute inset-0 -z-10" />
        <div className="bg-white/5 border border-white/12 rounded-2xl p-8 backdrop-blur-xl shadow-2xl flex flex-col items-center gap-4 max-w-sm text-center">
          <div className="p-4 bg-indigo-500/10 rounded-full border border-indigo-500/20">
            <RotateCw className="w-8 h-8 text-indigo-400 animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-display">Initializing TestForge</h3>
            <p className="text-xs text-gray-400 mt-1">Securing connection and loading session...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
