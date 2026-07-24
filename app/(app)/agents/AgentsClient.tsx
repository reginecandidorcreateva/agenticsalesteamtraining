"use client";
import { useEffect, useState } from "react";
import type { Agent, Team } from "./types";
import AgentCard from "./AgentCard";
import TeamCard from "./TeamCard";
import NewAgentForm from "./NewAgentForm";
import NewTeamForm from "./NewTeamForm";
import { linkBtn } from "./buttonStyles";

export default function AgentsClient() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewAgent, setShowNewAgent] = useState(false);
  const [showNewTeam, setShowNewTeam] = useState(false);

  useEffect(() => {
    Promise.all([fetch("/api/agents").then((r) => r.json()), fetch("/api/teams").then((r) => r.json())]).then(
      ([a, t]) => {
        setAgents(a);
        setTeams(t);
        setLoading(false);
      }
    );
  }, []);

  if (loading) return <p style={{ color: "#6a5b72" }}>Loading your AI team…</p>;

  return (
    <div>
      <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 28, color: "#250835", margin: "0 0 4px" }}>
        Your AI Team
      </h1>
      <p style={{ fontSize: 15, color: "#6a5b72", marginBottom: 32 }}>
        Five ready-made helpers, grouped into your Deal Team. Make your own, and group them however you like.
      </p>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 18, color: "#250835", margin: 0 }}>
          Teams
        </h2>
        {!showNewTeam && (
          <button onClick={() => setShowNewTeam(true)} style={linkBtn}>
            + New team
          </button>
        )}
      </div>
      {showNewTeam && (
        <NewTeamForm
          agents={agents}
          onCreated={(t) => {
            setTeams((prev) => [...prev, t]);
            setShowNewTeam(false);
          }}
          onCancel={() => setShowNewTeam(false)}
        />
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16, marginBottom: 44 }}>
        {teams.map((t) => (
          <TeamCard
            key={t.id}
            team={t}
            agents={agents}
            onUpdate={(updated) => setTeams((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))}
            onDelete={(id) => setTeams((prev) => prev.filter((x) => x.id !== id))}
          />
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 18, color: "#250835", margin: 0 }}>
          Helpers
        </h2>
        {!showNewAgent && (
          <button onClick={() => setShowNewAgent(true)} style={linkBtn}>
            + New helper
          </button>
        )}
      </div>
      {showNewAgent && (
        <NewAgentForm
          onCreated={(a) => {
            setAgents((prev) => [...prev, a]);
            setShowNewAgent(false);
          }}
          onCancel={() => setShowNewAgent(false)}
        />
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {agents.map((a) => (
          <AgentCard
            key={a.id}
            agent={a}
            onUpdate={(updated) => setAgents((prev) => prev.map((x) => (x.id === updated.id ? { ...x, ...updated } : x)))}
            onDelete={(id) => setAgents((prev) => prev.filter((x) => x.id !== id))}
          />
        ))}
      </div>
    </div>
  );
}
