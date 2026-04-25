"use client";

import { MobileShell } from "@/components/MobileShell";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { User, Users, Sparkles } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleDemoLogin = async (userId: string, role: string) => {
    setLoading(userId);
    setError("");
    try {
      await login(userId);
      router.push(role === "parent" ? "/parent/dashboard" : "/child/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <MobileShell>
      <div
        className="flex-1 flex flex-col relative overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #0B2E7A 0%, #1648A8 40%, #1E56BF 70%, #2563D4 100%)",
        }}
      >
        {/* Shield glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)" }}
        />

        {/* Logo & Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 flex flex-col items-center pt-16 px-6"
        >
          <div className="w-24 h-24 bg-white/10 backdrop-blur rounded-3xl flex items-center justify-center mb-4 border border-white/20 overflow-hidden p-2">
            <Image src="/assets/JRwallet-logo.png" alt="JuniorWallet Logo" width={80} height={80} className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-white text-center">JuniorWallet</h1>
          <p className="text-blue-200/80 text-sm mt-1 italic">#JuniorWallet</p>
          <p className="text-blue-200/60 text-xs mt-3 text-center max-w-[280px]">
            Smart Allowance Management for Malaysian Families
          </p>
        </motion.div>

        {/* Login Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="relative z-10 flex-1 flex flex-col justify-center px-6 pb-12"
        >
          <div className="space-y-3">
            {/* Demo Parent */}
            <button
              id="demo-parent-btn"
              onClick={() => handleDemoLogin("demo_parent", "parent")}
              disabled={loading !== null}
              className="w-full bg-white hover:bg-gray-50 active:scale-[0.98] transition-all rounded-2xl p-4 flex items-center gap-4 shadow-lg shadow-black/10 disabled:opacity-60"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                <Users size={22} className="text-blue-600" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-bold text-gray-900">Demo Parent</p>
                <p className="text-[11px] text-gray-400">Login as Paan (Parent)</p>
              </div>
              {loading === "demo_parent" && (
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              )}
            </button>

            {/* Demo Child */}
            <button
              id="demo-child-btn"
              onClick={() => handleDemoLogin("demo_child", "child")}
              disabled={loading !== null}
              className="w-full bg-white/10 hover:bg-white/20 active:scale-[0.98] transition-all rounded-2xl p-4 flex items-center gap-4 border border-white/10 disabled:opacity-60"
            >
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                <User size={22} className="text-white" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-bold text-white">Demo Child</p>
                <p className="text-[11px] text-blue-200/70">Login as Aiman (Child)</p>
              </div>
              {loading === "demo_child" && (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
            </button>
          </div>

          {error && (
            <p className="text-red-300 text-xs text-center mt-4">{error}</p>
          )}

          {/* Divider and Cognito hint temporarily hidden
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-[10px] font-medium">OR SIGN IN WITH COGNITO</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-amber-300" />
              <p className="text-xs font-semibold text-white/80">AWS Cognito Ready</p>
            </div>
            <p className="text-[11px] text-white/40 leading-relaxed">
              Configure your AWS Cognito User Pool to enable email/password sign-in. 
              Demo buttons work without Cognito for quick testing.
            </p>
          </div>
          */}
        </motion.div>
      </div>
    </MobileShell>
  );
}
