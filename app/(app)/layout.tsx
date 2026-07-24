import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import AppShell from "@/components/AppShell";
import { sql } from "@/lib/db";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const rows = await sql`
    select onboarding_completed as "onboardingCompleted" from media_kits where clerk_user_id = ${userId}
  `;
  if (!rows[0]?.onboardingCompleted) redirect("/onboarding");

  return <AppShell>{children}</AppShell>;
}
