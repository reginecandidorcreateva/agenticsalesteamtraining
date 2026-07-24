import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import OnboardingWizard from "./OnboardingWizard";

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  return <OnboardingWizard />;
}
