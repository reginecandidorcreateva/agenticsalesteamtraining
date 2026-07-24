"use client";
import { useEffect, useState } from "react";
import { STAGES, PENDING_APPROVAL } from "@/lib/brands";
import type { Brand } from "./types";
import ApprovalCard from "./ApprovalCard";
import BrandCard from "./BrandCard";
import AddBrandForm from "./AddBrandForm";
import ImportBrandsForm from "./ImportBrandsForm";
import BrandDetailModal from "./BrandDetailModal";
import { linkBtn, primaryBtnSmall } from "./styles";

export default function BrandDealsClient() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [openBrandId, setOpenBrandId] = useState<number | null>(null);
  const [discovering, setDiscovering] = useState(false);
  const [discoverError, setDiscoverError] = useState("");

  async function discoverBrands() {
    setDiscovering(true);
    setDiscoverError("");
    const res = await fetch("/api/brands/discover", { method: "POST" });
    const data = await res.json();
    setDiscovering(false);
    if (res.ok) {
      setBrands((prev) => [...data, ...prev]);
    } else {
      setDiscoverError(data.error || "Something went wrong.");
    }
  }

  function updateBrand(updated: Brand) {
    setBrands((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
  }

  useEffect(() => {
    fetch("/api/brands")
      .then((r) => r.json())
      .then((data) => {
        setBrands(data);
        setLoading(false);
      });
  }, []);

  async function moveBrand(id: number, status: string) {
    setBrands((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    await fetch(`/api/brands/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  async function removeBrand(id: number) {
    setBrands((prev) => prev.filter((b) => b.id !== id));
    await fetch(`/api/brands/${id}`, { method: "DELETE" });
  }

  if (loading) return <p style={{ color: "#6a5b72" }}>Loading your brand deals…</p>;

  const pending = brands.filter((b) => b.status === PENDING_APPROVAL);
  const byStage = new Map<string, Brand[]>(STAGES.map((s) => [s.key, []]));
  for (const b of brands) {
    if (byStage.has(b.status)) byStage.get(b.status)!.push(b);
  }

  return (
    <div>
      <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: 28, color: "#250835", margin: "0 0 4px" }}>
        Brand Deals
      </h1>
      <p style={{ fontSize: 15, color: "#6a5b72", marginBottom: 28 }}>
        Track every brand from first contact to booked call.
      </p>

      {/* Needs approval */}
      <div
        style={{
          background: "#faf6ff",
          border: "1px solid #decaff",
          borderRadius: 16,
          padding: 22,
          marginBottom: 36,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#250835", fontFamily: "'Manrope', sans-serif" }}>
              Needs your approval
            </div>
            <p style={{ fontSize: 13, color: "#6a5b72", margin: "2px 0 0" }}>
              New brands land here first — nothing gets worked until you approve it.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={discoverBrands} disabled={discovering} style={{ ...primaryBtnSmall, opacity: discovering ? 0.6 : 1 }}>
              {discovering ? "Searching…" : "✨ Discover brands with AI"}
            </button>
            {!showAdd && (
              <button onClick={() => setShowAdd(true)} style={linkBtn}>
                + Add a brand
              </button>
            )}
            {!showImport && (
              <button onClick={() => setShowImport(true)} style={linkBtn}>
                + Import a list
              </button>
            )}
          </div>
        </div>

        {discoverError && <p style={{ fontSize: 13, color: "#B91C1C", marginBottom: 14 }}>{discoverError}</p>}

        {showAdd && (
          <AddBrandForm
            onCreated={(b) => {
              setBrands((prev) => [b, ...prev]);
              setShowAdd(false);
            }}
            onCancel={() => setShowAdd(false)}
          />
        )}
        {showImport && (
          <ImportBrandsForm
            onImported={(imported) => {
              setBrands((prev) => [...imported, ...prev]);
              setShowImport(false);
            }}
            onCancel={() => setShowImport(false)}
          />
        )}

        {pending.length === 0 ? (
          <p style={{ fontSize: 13.5, color: "#a79bb0", margin: 0 }}>Nothing waiting on your approval right now.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pending.map((b) => (
              <ApprovalCard
                key={b.id}
                brand={b}
                onApprove={(id) => moveBrand(id, "new")}
                onRemove={removeBrand}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pipeline board */}
      <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8 }}>
        {STAGES.map((s) => (
          <div key={s.key} style={{ flex: "0 0 260px", minWidth: 260 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
                padding: "0 2px",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 700, color: "#250835" }}>{s.label}</div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "#a79bb0", background: "#f5f4f5", borderRadius: 999, padding: "2px 8px" }}>
                {byStage.get(s.key)?.length ?? 0}
              </div>
            </div>
            <div
              style={{
                background: "#f5f4f5",
                border: "1px solid #ebe6ee",
                borderRadius: 14,
                padding: 10,
                minHeight: 120,
              }}
            >
              {(byStage.get(s.key) ?? []).map((b) => (
                <BrandCard
                  key={b.id}
                  brand={b}
                  onMove={moveBrand}
                  onRemove={removeBrand}
                  onOpen={(brand) => setOpenBrandId(brand.id)}
                />
              ))}
              {(byStage.get(s.key) ?? []).length === 0 && (
                <p style={{ fontSize: 12.5, color: "#a79bb0", textAlign: "center", padding: "12px 4px", margin: 0 }}>Empty</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {openBrandId !== null && (
        <BrandDetailModal
          brand={brands.find((b) => b.id === openBrandId)!}
          onClose={() => setOpenBrandId(null)}
          onUpdate={updateBrand}
        />
      )}
    </div>
  );
}
