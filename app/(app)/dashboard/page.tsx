import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import HomeClient from "@/app/HomeClient";
import { getDashboardData } from "@/lib/dashboardData";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");
  const { agents, teams, stats, activity, avatarUrl } = await getDashboardData(userId);

  return (
    <div>
      <h1
        style={{
          fontFamily: "'Manrope', sans-serif",
          fontWeight: 800,
          fontSize: 28,
          color: "#250835",
          margin: "0 0 20px",
        }}
      >
        Dashboard
      </h1>
      <HomeClient agents={agents} teams={teams} stats={stats} activity={activity} avatarUrl={avatarUrl} live />
    </div>
  );
}
