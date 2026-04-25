import { NextResponse } from "next/server";
import { RequireCurrentUser } from "@/lib/auth/auth";

export async function GET() {
  try {
    const user = await RequireCurrentUser();
    
    // Determine which AI provider is currently active
    const provider = process.env.AI_PROVIDER || "local";
    const hasAlibabaCredentials = !!(process.env.ALIBABA_CLOUD_ACCESS_KEY_ID && process.env.ALIBABA_PAI_ENDPOINT);
    const hasQwenCredentials = !!process.env.ALIBABA_MODEL_STUDIO_API_KEY;

    let activeEngine = "Local MVP Engine";
    if (provider === "alibaba-pai" && hasAlibabaCredentials) {
      activeEngine = "Alibaba PAI";
    } else if (provider === "hybrid" && hasQwenCredentials) {
      activeEngine = "Hybrid AI Engine";
    }

    return NextResponse.json({ 
      provider, 
      activeEngine,
      hasAlibabaCredentials,
      hasQwenCredentials
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

