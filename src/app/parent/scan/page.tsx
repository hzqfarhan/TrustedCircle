"use client";

import { useState, useRef, useEffect } from "react";
import { MobileShell } from "@/components/MobileShell";
import { WalletHeader } from "@/components/WalletHeader";
import { BottomNav } from "@/components/BottomNav";
import { mockQrScanResult } from "@/lib/mock/qr-scan";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ScanLine, CheckCircle2, CameraOff, AlertTriangle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { PaymentBlockedCard } from "@/components/limits";

type ScanState = "idle" | "requesting_camera" | "scanning" | "detected" | "confirmed" | "error" | "blocked";

export default function ScanPage() {
  const { currentUser } = useAuth();
  const [childData, setChildData] = useState<any>(null);
  const [demoAmount, setDemoAmount] = useState(mockQrScanResult.amount);
  const [scanState, setScanState] = useState<ScanState>("idle");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    setScanState("requesting_camera");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setScanState("scanning");
    } catch (err) {
      console.error("Camera access failed", err);
      setScanState("error");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'child') {
      fetch("/api/dashboard/child")
        .then(res => res.ok ? res.json() : null)
        .then(data => { if (data?.childProfile) setChildData(data.childProfile); });
    }
    return () => stopCamera();
  }, [currentUser]);

  const handleSimulateScan = (highAmount = false) => {
    setDemoAmount(highAmount ? 25.00 : mockQrScanResult.amount);
    setScanState("detected");
    stopCamera();
  };

  const handleConfirm = () => {
    if (currentUser?.role === 'child' && childData) {
      const limit = childData.perTransactionLimit ?? 20;
      if (demoAmount > limit) {
        setScanState("blocked");
        return;
      }
    }
    setScanState("confirmed");
    toast.success(`Demo Payment Successful. RM${demoAmount.toFixed(2)} payment preview completed.`);
  };

  return (
    <MobileShell>
      <WalletHeader showBack title="Scan QR" />
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-20 flex flex-col">
        
        {/* Header Section */}
        {scanState !== "confirmed" && (
          <div className="text-center mb-6">
            <h2 className="text-sm font-bold text-gray-800">Scan to Pay</h2>
            <p className="text-xs text-gray-500">Scan a QR code to preview JuniorWallet payment.</p>
          </div>
        )}

        {/* Dynamic State Rendering */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-8">
          
          {scanState === "idle" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <ScanLine size={48} className="text-blue-600" />
              </div>
              <button 
                onClick={startCamera}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-2xl transition-colors shadow-sm"
              >
                Start Scan
              </button>
            </motion.div>
          )}

          {scanState === "requesting_camera" && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-sm text-gray-500 font-medium">Requesting camera access...</p>
            </div>
          )}

          {scanState === "error" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center w-full max-w-sm">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CameraOff size={36} className="text-gray-400" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Camera access unavailable</h3>
              <p className="text-sm text-gray-500 mb-6 px-4">
                You can still preview the QR scan flow in demo mode.
              </p>
              <button 
                onClick={handleSimulateScan}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl transition-colors shadow-sm"
              >
                Simulate QR Scan
              </button>
            </motion.div>
          )}

          {scanState === "scanning" && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm">
              <div className="relative aspect-square w-full bg-black rounded-[32px] overflow-hidden shadow-lg border-4 border-gray-100">
                <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />
                
                {/* Overlay Frame */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3/4 h-3/4 border-2 border-white/50 rounded-2xl relative">
                    {/* Corner markers */}
                    <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-xl"></div>
                    <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-xl"></div>
                    <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-xl"></div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-xl"></div>
                    {/* Animated scanning line */}
                    <motion.div 
                      className="absolute left-0 right-0 h-0.5 bg-blue-500/80 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                      animate={{ top: ["10%", "90%", "10%"] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                </div>
              </div>
              <p className="text-center text-xs font-medium text-gray-500 mt-6">Align QR code inside the frame</p>
              
              <div className="flex gap-2 mt-6">
                <button 
                  onClick={() => handleSimulateScan(false)}
                  className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-2xl transition-colors shadow-sm text-sm"
                >
                  Normal Scan
                </button>
                <button 
                  onClick={() => handleSimulateScan(true)}
                  className="flex-1 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-700 font-bold py-3 rounded-2xl transition-colors shadow-sm text-sm"
                >
                  High Amount Scan
                </button>
              </div>
            </motion.div>
          )}

          {scanState === "detected" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center mb-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{mockQrScanResult.merchantName}</h3>
                <p className="text-xs font-medium text-amber-600 bg-amber-50 inline-block px-2 py-0.5 rounded-full mb-6 border border-amber-100">
                  {mockQrScanResult.status}
                </p>
                
                <p className="text-sm text-gray-500 mb-1">Payment Amount</p>
                <p className="text-3xl font-bold text-blue-600 mb-6">
                  {mockQrScanResult.currency} {demoAmount.toFixed(2)}
                </p>

                <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center text-xs mb-2">
                  <span className="text-gray-500">Reference ID</span>
                  <span className="font-semibold text-gray-700">{mockQrScanResult.reference}</span>
                </div>
              </div>

              <button 
                onClick={handleConfirm}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl transition-colors shadow-sm mb-3"
              >
                Confirm Demo Payment
              </button>
              <button 
                onClick={() => setScanState("idle")}
                className="w-full text-sm font-semibold text-gray-500 hover:text-gray-700 py-2 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          )}

          {scanState === "blocked" && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full">
              <PaymentBlockedCard limit={childData?.perTransactionLimit ?? 20} />
              <button 
                onClick={() => window.location.href = '/child/dashboard'}
                className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3.5 rounded-2xl transition-colors"
              >
                Back to Home
              </button>
            </motion.div>
          )}

          {scanState === "confirmed" && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-center mt-12">
              <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 size={48} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Payment Successful</h2>
              <p className="text-sm text-gray-500 mb-8 px-4 leading-relaxed">
                RM{demoAmount.toFixed(2)} payment preview completed.<br/>
                No real money was transferred.
              </p>
              
              <button 
                onClick={() => window.location.href = '/parent/dashboard'}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3.5 rounded-2xl transition-colors"
              >
                Back to Home
              </button>
            </motion.div>
          )}

        </div>
      </div>
      <BottomNav />
    </MobileShell>
  );
}
