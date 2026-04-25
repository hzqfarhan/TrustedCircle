"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addMemberToCircle(name: string, role: string) {
  try {
    // Create new user with a wallet
    await prisma.user.create({
      data: {
        name,
        role,
        avatar: "", // Can be filled in if we add avatar support later
        wallet: {
          create: {
            balance: 0.0,
          },
        },
      },
    });

    // Revalidate the members page to fetch the newly added user
    revalidatePath("/trusted-circle/members");
    return { success: true };
  } catch (error) {
    console.error("Failed to add member:", error);
    return { success: false, error: "Failed to add member to the Trusted Circle." };
  }
}

