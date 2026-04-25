"use client";

import { MobileShell } from "@/components/MobileShell";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  return (
    <MobileShell>
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 0.9; transform: scale(1.2); }
        }
        .animate-heading {
          animation: fadeInUp 0.6s ease-out 0.1s both;
        }
        .animate-btn {
          animation: fadeInUp 0.5s ease-out 0.35s both;
        }
        .animate-illustration {
          animation: fadeInUp 0.7s ease-out 0.5s both;
        }
        .animate-logo {
          animation: fadeIn 0.5s ease-out 0.8s both;
        }
        .sparkle-dot {
          animation: sparkle 3s ease-in-out infinite;
        }
      `}</style>
      <div
        className="flex-1 flex flex-col relative overflow-hidden"
        style={{
          background:
            "linear-gradient(180deg, #0B2E7A 0%, #1648A8 40%, #1E56BF 70%, #2563D4 100%)",
        }}
      >
        {/* Decorative background shield glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Text content */}
        <div className="animate-heading relative z-10 px-7 pt-16 sm:pt-20">
          <h1
            className="text-[2.2rem] sm:text-[2.4rem] leading-[1.12] font-bold text-white tracking-tight"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Welcome to,
            <br />
            JuniorWallet
          </h1>
          <p className="text-blue-200/80 text-lg mt-1.5 font-medium italic">
            #JuniorWallet
          </p>
        </div>

        {/* CTA Button */}
        <div className="animate-btn relative z-10 px-7 mt-5">
          <button
            onClick={() => router.push("/login")}
            id="get-started-btn"
            className="group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-full font-bold text-[1.05rem] transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
            style={{
              background:
                "linear-gradient(135deg, #C9A84C 0%, #E8C55A 30%, #F0D56A 50%, #E8C55A 70%, #C9A84C 100%)",
              color: "#1a2744",
              boxShadow:
                "0 4px 20px rgba(201, 168, 76, 0.35), 0 0 40px rgba(201, 168, 76, 0.15)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            Let&apos;s Protect Together
            <ArrowRight
              size={20}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </button>
        </div>

        {/* Family illustration — pushed to bottom */}
        <div className="animate-illustration relative z-10 mt-auto">
          <div className="relative w-full">
            <Image
              src="/trusted-family.png"
              alt="Family protected by JuniorWallet"
              width={860}
              height={860}
              className="w-full h-auto block"
              priority
            />
            {/* TNG logo overlaid */}
            <div className="animate-logo absolute bottom-5 right-5">
              <span
                className="text-white font-black text-2xl tracking-wider"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  textShadow: "0 2px 10px rgba(0,0,0,0.3)",
                }}
              >
                TNG
              </span>
            </div>
          </div>
        </div>

        {/* Sparkle particles */}
        <div className="sparkle-dot absolute rounded-full pointer-events-none w-[5px] h-[5px] top-[20%] left-[15%]"
          style={{ background: "radial-gradient(circle, rgba(232,197,90,0.8) 0%, transparent 70%)", boxShadow: "0 0 8px rgba(232,197,90,0.4)" }} />
        <div className="sparkle-dot absolute rounded-full pointer-events-none w-[4px] h-[4px] top-[25%] left-[70%]"
          style={{ background: "radial-gradient(circle, rgba(232,197,90,0.7) 0%, transparent 70%)", boxShadow: "0 0 10px rgba(232,197,90,0.4)", animationDelay: "0.5s" }} />
        <div className="sparkle-dot absolute rounded-full pointer-events-none w-[6px] h-[6px] top-[35%] left-[85%]"
          style={{ background: "radial-gradient(circle, rgba(232,197,90,0.9) 0%, transparent 70%)", boxShadow: "0 0 12px rgba(232,197,90,0.4)", animationDelay: "1s" }} />
        <div className="sparkle-dot absolute rounded-full pointer-events-none w-[3px] h-[3px] top-[40%] left-[30%]"
          style={{ background: "radial-gradient(circle, rgba(232,197,90,0.6) 0%, transparent 70%)", boxShadow: "0 0 7px rgba(232,197,90,0.4)", animationDelay: "1.5s" }} />
        <div className="sparkle-dot absolute rounded-full pointer-events-none w-[5px] h-[5px] top-[18%] left-[55%]"
          style={{ background: "radial-gradient(circle, rgba(232,197,90,0.8) 0%, transparent 70%)", boxShadow: "0 0 9px rgba(232,197,90,0.4)", animationDelay: "2s" }} />
        <div className="sparkle-dot absolute rounded-full pointer-events-none w-[4px] h-[4px] top-[30%] left-[45%]"
          style={{ background: "radial-gradient(circle, rgba(232,197,90,0.7) 0%, transparent 70%)", boxShadow: "0 0 11px rgba(232,197,90,0.4)", animationDelay: "2.5s" }} />
      </div>
    </MobileShell>
  );
}
