import { NextResponse } from "next/server";
import { UpdateChildProfile, GetChildProfile } from "@/lib/data/children";
import { updateSpendingLimitSchema } from "@/lib/validations/limits";
import { cookies } from "next/headers";
import { GetProfile } from "@/lib/data/profiles";

export async function PATCH(
  request: Request,
  { params }: { params: { childId: string } }
) {
  try {
    const { childId } = params;
    const body = await request.json();
    
    // Parse and validate
    const parsed = updateSpendingLimitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid limit amount" }, { status: 400 });
    }

    // Basic auth check using dummy cookies
    const cookieStore = cookies();
    const currentUserId = cookieStore.get("tc_session")?.value;
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await GetProfile(currentUserId);
    if (!currentUser || currentUser.role !== "parent") {
      return NextResponse.json({ error: "Only parents can update limits" }, { status: 403 });
    }

    // Check if child exists
    const child = await GetChildProfile(childId);
    if (!child) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    // Update child profile
    await UpdateChildProfile(childId, {
      perTransactionLimit: parsed.data.perTransactionLimit,
    });

    return NextResponse.json({
      success: true,
      childId,
      perTransactionLimit: parsed.data.perTransactionLimit,
    });
  } catch (error) {
    console.error("Error updating limit:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
