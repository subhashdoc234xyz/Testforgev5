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
      <div className="min-h-screen flex flex-col items-center justify-center text-[#0c4a6e] font-sans relative">
        <div className="bg-app-gradient" />
        <div className="bg-blob-1" />
        <div className="bg-blob-2" />
        <div className="glass-card p-8 flex flex-col items-center gap-4 max-w-sm text-center">
          <div className="p-4 bg-[#2563eb]/10 rounded-full border border-[#2563eb]/20">
            <RotateCw className="w-8 h-8 text-[#2563eb]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0c4a6e] font-display">Initializing TestForge</h3>
            <p className="text-xs text-[#0369a1] mt-1">Securing connection and loading session...</p>
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
