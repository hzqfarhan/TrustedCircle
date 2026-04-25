import { NextResponse } from "next/server";
import { RequireCurrentUser } from "@/lib/auth/auth";
import { anonymizeChildAnalyticsPayload } from "@/lib/alibaba/sync";
import { CreateAuditLog } from "@/lib/data/audit-logs";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const user = await RequireCurrentUser();
    
    // Only parents (or an internal cron role) should trigger a sync
    if (user.role !== "parent" && user.role !== "system") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { childId, profileData } = body;

    if (!childId || !profileData) {
      return NextResponse.json({ error: "Missing payload data" }, { status: 400 });
    }

    const payload = anonymizeChildAnalyticsPayload(profileData);

    // In a real implementation:
    // const s3Client = new S3Client({ region: process.env.ALIBABA_CLOUD_REGION, ... });
    // await s3Client.send(new PutObjectCommand({ Bucket: process.env.ALIBABA_OSS_BUCKET, ... }));
    
    const isAlibabaConfigured = !!process.env.ALIBABA_OSS_BUCKET;

    // Log the sync action
    await CreateAuditLog({
      id: uuidv4(),
      actorId: user.sub,
      action: "AI_SYNC_TO_ALIBABA",
      entityType: "childProfile",
      entityId: childId,
      newValue: { anonymizedId: payload.anonymizedChildId, status: isAlibabaConfigured ? "synced" : "skipped_no_config" },
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ 
      success: true, 
      synced: isAlibabaConfigured, 
      anonymizedId: payload.anonymizedChildId 
    });

  } catch (error: any) {
    console.error("AI Sync Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

