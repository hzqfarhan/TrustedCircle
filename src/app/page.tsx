"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    // We already have SplashScreen in layout.tsx, so we just redirect
    router.replace("/login");
  }, [router]);

  return (
    <div className="flex-1 flex items-center justify-center bg-white min-h-screen">
      {/* Empty loading state, since Splash Screen covers it or we redirect instantly */}
    </div>
  );
}

