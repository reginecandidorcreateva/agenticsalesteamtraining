import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getAnalyticsData } from "@/lib/analyticsData";

function mondayOf(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #ebe6ee", borderRadius: 16, padding: 20, flex: 1, minWidth: 140 }}>
      <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 28, color: "#250835" }}>{value}</div>
      <div style={{ fontSize: 12.5, color: "#6a5b72", marginTop: 4 }}>{label}</div>
    </div>
  );
}

export default async function AnalyticsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const data = await getAnalyticsData(userId);
  const maxStage = Math.max(1, ...data.stageBreakdown.map((s) => s.count));
  const maxAgent = Math.max(1, ...data.agentActivity.map((a) => a.count));

  const now = new Date();
  const thisMonday = mondayOf(now);
  const weeks: { key: string; label: string; count: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(thisMonday);
    weekStart.setDate(weekStart.getDate() - i * 7);
    const key = weekStart.toISOString().slice(0, 10);
    const match = data.dealsClosedByWeek.find((w) => w.weekStart.slice(0, 10) === key);
    weeks.push({ key, label: weekStart.toLocaleDateString(undefined, { month: "short", day: "numeric" }), count: match?.count ?? 0 });
  }
  const maxWeek = Math.max(1, ...weeks.map((w) => w.count));

  return (
    <div>
      <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 28, color: "#250835", margin: "0 0 4px" }}>
        Analytics
      </h1>
      <p style={{ fontSize: 15, color: "#6a5b72", marginBottom: 28 }}>
        Real numbers from your brands, pitches, proposals, and booked calls. One honest note: there&apos;s no inbox
        connected yet, so we can&apos;t track brand reply rates — the pipeline funnel below is the closest real proxy
        for how deals are actually moving.
      </p>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 32 }}>
        <StatCard label="Total brands" value={data.totalBrands} />
        <StatCard label="Approved brands" value={data.approvedBrands} />
        <StatCard label="Pitches drafted (this month)" value={data.pitchesDrafted} />
        <StatCard label="Proposals sent (this month)" value={data.proposalsSent} />
        <StatCard label="Calls booked (this month)" value={data.callsBooked} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 20, marginBottom: 20 }}>
        <div style={{ background: "#fff", border: "1px solid #ebe6ee", borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#250835", marginBottom: 16 }}>Brand deals pipeline</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {data.stageBreakdown.map((s) => (
              <div key={s.key}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "#473054", marginBottom: 4 }}>
                  <span>{s.label}</span>
                  <span style={{ fontWeight: 700 }}>{s.count}</span>
                </div>
                <div style={{ background: "#f5f4f5", borderRadius: 999, height: 8, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${Math.round((s.count / maxStage) * 100)}%`,
                      height: "100%",
                      borderRadius: 999,
                      background: s.key === "booked_call" ? "#2FA45C" : "#ab2fed",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #ebe6ee", borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#250835", marginBottom: 16 }}>Calls booked, last 8 weeks</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 140 }}>
            {weeks.map((w) => (
              <div key={w.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#250835" }}>{w.count || ""}</div>
                <div
                  style={{
                    width: "100%",
                    height: Math.max(4, Math.round((w.count / maxWeek) * 100)),
                    background: "#decaff",
                    borderRadius: 6,
                  }}
                />
                <div style={{ fontSize: 10, color: "#a79bb0", whiteSpace: "nowrap" }}>{w.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #ebe6ee", borderRadius: 16, padding: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#250835", marginBottom: 16 }}>Agent activity this month</div>
        {data.agentActivity.length === 0 ? (
          <p style={{ fontSize: 13.5, color: "#a79bb0" }}>No helpers yet — visit the Agents page to get started.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {data.agentActivity.map((a) => (
              <div key={a.id}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "#473054", marginBottom: 4 }}>
                  <span>{a.name}</span>
                  <span style={{ fontWeight: 700 }}>{a.count}</span>
                </div>
                <div style={{ background: "#f5f4f5", borderRadius: 999, height: 8, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${Math.round((a.count / maxAgent) * 100)}%`,
                      height: "100%",
                      borderRadius: 999,
                      background: "#0EA5E9",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
